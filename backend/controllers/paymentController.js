import crypto from "crypto";
import axios from "axios";
import {
  createDownloadLog,
  createEmailLog,
  createPayment,
  getDownloadByPaymentId,
  getPaymentByOrderId,
  updateEmailStatus,
  updatePaymentFailed,
  updatePaymentSuccess,
  updateResumeStatus
} from "../db/queries.js";
import { sendPaymentConfirmation, sendResumeWithAttachments } from "../services/emailService.js";

const RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";
const BASE_PAYMENT_AMOUNT = 6900;            // Rs.69 — flat price for every resume

// Server-authoritative price lookup. Flat Rs.69 for all resumes (no returning-customer discount).
const resolvePricing = (_email) => ({
  isReturning: false,
  amount: BASE_PAYMENT_AMOUNT,
  originalAmount: BASE_PAYMENT_AMOUNT,
  discountAmount: 0,
  previousPayments: 0
});

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay keys are not configured.");
  return { keyId, keySecret };
};

const getAccessTokenSecret = () => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error("ACCESS_TOKEN_SECRET must be set.");
  return secret;
};

const makeAccessToken = (orderId, paymentId, resumeId = "") =>
  crypto
    .createHmac("sha256", getAccessTokenSecret())
    .update(`access|${orderId}|${paymentId}|${resumeId || ""}`)
    .digest("hex");

const isAccessTokenMatch = (expected, received) => {
  const a = Buffer.from(String(expected || ""));
  const b = Buffer.from(String(received || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const safeCompareHex = (expected, received) => {
  const a = Buffer.from(String(expected || ""), "hex");
  const b = Buffer.from(String(received || ""), "hex");
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const getPaymentQuote = (req, res) => {
  try {
    const email = String(req.body?.userEmail || req.body?.email || "").trim();
    const pricing = resolvePricing(email);
    return res.json(pricing);
  } catch (err) {
    console.error("[getPaymentQuote]", err.message);
    // Fall back to base price so the UI can still proceed
    return res.json({
      isReturning: false,
      amount: BASE_PAYMENT_AMOUNT,
      originalAmount: BASE_PAYMENT_AMOUNT,
      discountAmount: 0,
      previousPayments: 0
    });
  }
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { keyId, keySecret } = getRazorpayConfig();
    const { userId, resumeId, userEmail } = req.body;

    // Server-authoritative pricing — client cannot override the amount.
    const pricing = resolvePricing(userEmail);

    const response = await axios.post(
      RAZORPAY_ORDERS_URL,
      { amount: pricing.amount, currency: "INR", receipt: `resume_${Date.now()}` },
      { auth: { username: keyId, password: keySecret }, proxy: false }
    );

    const { id: razorpayOrderId, amount, currency } = response.data;

    // Save pending payment record
    try {
      createPayment({ userId, resumeId, razorpayOrderId, amount: pricing.amount });
    } catch (dbErr) {
      console.error("[createPaymentOrder] DB save failed:", dbErr.message);
    }

    return res.json({
      keyId,
      orderId: razorpayOrderId,
      amount,
      currency,
      isReturning: pricing.isReturning,
      discountAmount: pricing.discountAmount,
      originalAmount: pricing.originalAmount
    });
  } catch (err) {
    console.error("[createPaymentOrder]", err.message);
    return res.status(500).json({
      error: err.response?.data?.error?.description || "Unable to create payment order. Please try again."
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { keySecret } = getRazorpayConfig();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      resumeId,
      userName,
      userEmail,
      resumeTitle,
      resumeData
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Payment verification payload is incomplete." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!safeCompareHex(expectedSignature, razorpay_signature)) {
      try { updatePaymentFailed(razorpay_order_id); } catch (_) {}
      return res.status(400).json({ error: "Payment verification failed." });
    }

    // Update payment to success
    try {
      updatePaymentSuccess({ razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id });
    } catch (dbErr) {
      console.error("[verifyPayment] DB update failed:", dbErr.message);
    }

    // Look up the actual amount paid (may be discounted for returning customers)
    const paidRow = getPaymentByOrderId(razorpay_order_id);
    const amountPaid = paidRow?.amount || BASE_PAYMENT_AMOUNT;

    // Fire-and-forget confirmation email (do not block payment response)
    if (userEmail) {
      sendPaymentConfirmation({
        name: userName,
        email: userEmail,
        resumeTitle,
        amount: amountPaid,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      }).then((result) => {
        try {
          const emailId = createEmailLog({ userId, resumeId, emailType: "payment_confirmation" });
          updateEmailStatus({ emailId, status: result.sent ? "sent" : "failed" });
        } catch (_) {}
      }).catch((emailErr) => {
        console.error("[verifyPayment] confirmation email error:", emailErr.message);
      });
    }

    const accessToken = makeAccessToken(razorpay_order_id, razorpay_payment_id, resumeId);
    return res.json({
      verified: true,
      accessToken,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      resumeId
    });
  } catch (err) {
    console.error("[verifyPayment]", err.message);
    return res.status(500).json({ error: "Payment verification error. Please contact support." });
  }
};

export const emailResumeAttachments = async (req, res) => {
  try {
    const { name, email, resumeTitle, pdfBase64, docxBase64, userId, resumeId, orderId } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });
    if (!pdfBase64 && !docxBase64) return res.status(400).json({ error: "No file data provided." });

    let emailId = null;
    try {
      emailId = createEmailLog({ userId, resumeId, emailType: "payment_confirmation_with_files" });
    } catch {}

    // Use the actual amount the customer paid (may be discounted) when available.
    let amountPaid = BASE_PAYMENT_AMOUNT;
    if (orderId) {
      try {
        const row = getPaymentByOrderId(orderId);
        if (row?.amount) amountPaid = row.amount;
      } catch {}
    }

    const result = await sendResumeWithAttachments({
      name, email, resumeTitle, pdfBase64, docxBase64, amount: amountPaid
    });

    if (emailId) {
      try { updateEmailStatus({ emailId, status: result.sent ? "sent" : "failed" }); } catch {}
    }

    return res.json({ sent: result.sent, reason: result.reason });
  } catch (err) {
    console.error("[emailResumeAttachments]", err.message);
    return res.status(500).json({ error: "Failed to send resume files. Please try again." });
  }
};

export const checkPaymentToken = (req, res) => {
  try {
    const { accessToken, orderId, paymentId, resumeId } = req.body;
    if (!accessToken || !orderId || !paymentId) {
      return res.status(400).json({ valid: false });
    }
    const expected = makeAccessToken(orderId, paymentId, resumeId);
    return res.json({ valid: isAccessTokenMatch(expected, accessToken) });
  } catch {
    return res.status(400).json({ valid: false });
  }
};

export const recordResumeDownload = (req, res) => {
  try {
    const { accessToken, orderId, paymentId, resumeId, fileFormat } = req.body;
    if (!accessToken || !orderId || !paymentId) {
      return res.status(400).json({ recorded: false, error: "Download token payload is incomplete." });
    }

    const expected = makeAccessToken(orderId, paymentId, resumeId);
    const valid = isAccessTokenMatch(expected, accessToken);
    if (!valid) return res.status(403).json({ recorded: false, error: "Invalid download token." });

    const payment = getPaymentByOrderId(orderId);
    if (!payment || payment.status !== "success") {
      return res.status(403).json({ recorded: false, error: "Payment is not successful." });
    }

    // One payment = one tracked download. Reject replays of the same token.
    const existing = getDownloadByPaymentId(paymentId);
    if (existing) {
      return res.status(403).json({ recorded: false, error: "This download token has already been used." });
    }

    createDownloadLog({
      userId: payment.user_id,
      resumeId: resumeId || payment.resume_id,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      fileFormat
    });

    if (resumeId || payment.resume_id) {
      updateResumeStatus(resumeId || payment.resume_id, "downloaded");
    }

    return res.json({ recorded: true });
  } catch (err) {
    console.error("[recordResumeDownload]", err.message);
    return res.status(500).json({ recorded: false });
  }
};
