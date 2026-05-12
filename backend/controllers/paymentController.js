import crypto from "crypto";
import axios from "axios";
import {
  createDownloadLog,
  createEmailLog,
  createPayment,
  getPaymentByOrderId,
  updateEmailStatus,
  updatePaymentSuccess,
  updateResumeStatus
} from "../db/queries.js";
import { sendResumeWithAttachments } from "../services/emailService.js";

const RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";
const PAYMENT_AMOUNT = 6900;

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

export const createPaymentOrder = async (req, res) => {
  try {
    const { keyId, keySecret } = getRazorpayConfig();
    const { userId, resumeId } = req.body;

    const response = await axios.post(
      RAZORPAY_ORDERS_URL,
      { amount: PAYMENT_AMOUNT, currency: "INR", receipt: `resume_${Date.now()}` },
      { auth: { username: keyId, password: keySecret }, proxy: false }
    );

    const { id: razorpayOrderId, amount, currency } = response.data;

    // Save pending payment record
    try {
      createPayment({ userId, resumeId, razorpayOrderId, amount: PAYMENT_AMOUNT });
    } catch (dbErr) {
      console.error("[createPaymentOrder] DB save failed:", dbErr.message);
    }

    return res.json({ keyId, orderId: razorpayOrderId, amount, currency });
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

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed." });
    }

    // Update payment to success
    try {
      updatePaymentSuccess({ razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id });
    } catch (dbErr) {
      console.error("[verifyPayment] DB update failed:", dbErr.message);
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
    const { name, email, resumeTitle, pdfBase64, docxBase64, userId, resumeId } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });
    if (!pdfBase64 && !docxBase64) return res.status(400).json({ error: "No file data provided." });

    let emailId = null;
    try {
      emailId = createEmailLog({ userId, resumeId, emailType: "payment_confirmation_with_files" });
    } catch {}

    const result = await sendResumeWithAttachments({
      name, email, resumeTitle, pdfBase64, docxBase64, amount: PAYMENT_AMOUNT
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
