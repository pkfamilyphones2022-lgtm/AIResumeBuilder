import crypto from "crypto";
import axios from "axios";
import {
  consumeSubscriptionUse,
  createDownloadLog,
  createEmailLog,
  createPayment,
  createSubscription,
  getActiveSubscription,
  getDownloadByPaymentId,
  getPaymentByOrderId,
  updateEmailStatus,
  updatePaymentFailed,
  updatePaymentSuccess,
  updateResumeStatus
} from "../db/queries.js";
import { sendPaymentConfirmation, sendResumeWithAttachments } from "../services/emailService.js";

const RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

/* ─── Pricing tiers ─────────────────────────────────────────
   Server-authoritative. The frontend can request a plan, but the
   amount comes from PRICING below — never from the client body. */
const PRICING = {
  single: {
    amount:         5100,            // Rs.51 per resume
    label:          "Single Resume",
    downloads:      1,
    durationDays:   0
  },
  weekly: {
    amount:         19900,           // Rs.199 weekly pass
    label:          "Weekly Pass — Special Offer",
    downloads:      15,
    durationDays:   7
  }
};

// Back-compat constant — some old admin/email paths still reference it.
// New code should use PRICING[planType].amount.
const BASE_PAYMENT_AMOUNT = PRICING.single.amount;

const normalizePlanType = (raw) =>
  raw === "weekly" ? "weekly" : "single";

const resolvePricing = (planType = "single") => {
  const plan = PRICING[normalizePlanType(planType)] || PRICING.single;
  return {
    planType:       normalizePlanType(planType),
    label:          plan.label,
    amount:         plan.amount,
    originalAmount: plan.amount,
    discountAmount: 0,
    downloads:      plan.downloads,
    durationDays:   plan.durationDays,
    isReturning:    false,
    previousPayments: 0
  };
};

const generateSubscriptionToken = () =>
  crypto.randomBytes(32).toString("hex");

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
    const planType = normalizePlanType(req.body?.planType);
    const pricing = resolvePricing(planType);
    return res.json({
      ...pricing,
      tiers: {
        single: resolvePricing("single"),
        weekly: resolvePricing("weekly")
      }
    });
  } catch (err) {
    console.error("[getPaymentQuote]", err.message);
    // Fall back to single tier so the UI can still proceed
    return res.json(resolvePricing("single"));
  }
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { keyId, keySecret } = getRazorpayConfig();
    const { userId, resumeId, userEmail, planType: requestedPlan } = req.body;
    const planType = normalizePlanType(requestedPlan);

    // Server-authoritative pricing — client cannot override the amount.
    const pricing = resolvePricing(planType);

    const response = await axios.post(
      RAZORPAY_ORDERS_URL,
      {
        amount: pricing.amount,
        currency: "INR",
        receipt: `${planType}_${Date.now()}`,
        notes: { planType }
      },
      { auth: { username: keyId, password: keySecret }, proxy: false }
    );

    const { id: razorpayOrderId, amount, currency } = response.data;

    // Save pending payment record (resumeId may be null for subscription purchases
    // bought ahead of generating a specific resume)
    try {
      createPayment({
        userId,
        resumeId: planType === "weekly" ? null : resumeId,
        razorpayOrderId,
        amount: pricing.amount
      });
    } catch (dbErr) {
      console.error("[createPaymentOrder] DB save failed:", dbErr.message);
    }

    return res.json({
      keyId,
      orderId: razorpayOrderId,
      amount,
      currency,
      planType,
      label: pricing.label,
      downloads: pricing.downloads,
      durationDays: pricing.durationDays
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
      resumeData,
      planType: requestedPlan
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

    const paidRow = getPaymentByOrderId(razorpay_order_id);
    const amountPaid = paidRow?.amount || PRICING.single.amount;
    const planType = normalizePlanType(requestedPlan);
    const pricing = resolvePricing(planType);

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

    /* ── Branch on plan type ─────────────────────────────── */

    if (planType === "weekly") {
      // Weekly Pass: create the subscription and return its token.
      // The frontend stores { email, subscriptionToken } in localStorage
      // and sends them on subsequent downloads.
      if (!userEmail) {
        return res.status(400).json({
          error: "An email is required for the Weekly Pass subscription."
        });
      }
      const subToken = generateSubscriptionToken();
      const expiresAt = new Date(Date.now() + pricing.durationDays * 24 * 60 * 60 * 1000)
        .toISOString();
      try {
        createSubscription({
          email: userEmail.trim().toLowerCase(),
          token: subToken,
          planType,
          downloadsLimit: pricing.downloads,
          expiresAt,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          amountPaise: amountPaid
        });
      } catch (dbErr) {
        console.error("[verifyPayment] subscription create failed:", dbErr.message);
        return res.status(500).json({
          error: "Payment captured but subscription could not be created. Contact support with the payment ID."
        });
      }

      // Also issue a single-use access token so the user can immediately
      // download the resume they just generated without an extra round-trip.
      const accessToken = makeAccessToken(razorpay_order_id, razorpay_payment_id, resumeId);
      return res.json({
        verified: true,
        planType: "weekly",
        accessToken,
        subscription: {
          email: userEmail.trim().toLowerCase(),
          token: subToken,
          downloadsLimit: pricing.downloads,
          downloadsUsed: 0,
          remaining: pricing.downloads,
          expiresAt
        },
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        resumeId
      });
    }

    // Single tier (default): existing single-use access-token flow.
    const accessToken = makeAccessToken(razorpay_order_id, razorpay_payment_id, resumeId);
    return res.json({
      verified: true,
      planType: "single",
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

/* ─── Subscription lifecycle endpoints ───────────────────── */

// GET-shaped lookup (we accept POST for consistency with rest of /payment).
// Returns active subscription details for { email, token } pair, or 404.
export const getSubscriptionStatus = (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const token = String(req.body?.token || "").trim();
    if (!email || !token) {
      return res.status(400).json({ active: false, reason: "missing_credentials" });
    }
    const sub = getActiveSubscription(email, token);
    if (!sub) return res.status(404).json({ active: false, reason: "not_found" });

    const expiresMs = new Date(sub.expiresAt).getTime();
    const now = Date.now();
    if (expiresMs <= now) {
      return res.status(410).json({ active: false, reason: "expired" });
    }
    const totalUsed = (sub.downloadsUsed || 0) + (sub.emailsUsed || 0);
    if (totalUsed >= sub.downloadsLimit) {
      return res.status(410).json({ active: false, reason: "exhausted" });
    }
    return res.json({
      active: true,
      planType: sub.planType,
      downloadsLimit: sub.downloadsLimit,
      downloadsUsed: sub.downloadsUsed,
      emailsUsed: sub.emailsUsed || 0,
      remaining: sub.downloadsLimit - totalUsed,
      expiresAt: sub.expiresAt
    });
  } catch (err) {
    console.error("[getSubscriptionStatus]", err.message);
    return res.status(500).json({ active: false, reason: "server_error" });
  }
};

// Atomically decrement a subscription's remaining quota. Used right before
// a Weekly Pass holder downloads PDF/DOCX or sends the resume to email.
// `kind` is "download" (default) or "email" — they share the single 15-use
// cap but are tracked in separate columns so we can report each.
export const useSubscriptionDownload = (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const token = String(req.body?.token || "").trim();
    const kind  = req.body?.kind === "email" ? "email" : "download";
    if (!email || !token) {
      return res.status(400).json({ ok: false, reason: "missing_credentials" });
    }
    const result = consumeSubscriptionUse(email, token, Date.now(), kind);
    if (!result.ok) {
      const statusCode = result.reason === "not_found" ? 404 : 410;
      return res.status(statusCode).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error("[useSubscriptionDownload]", err.message);
    return res.status(500).json({ ok: false, reason: "server_error" });
  }
};

export const emailResumeAttachments = async (req, res) => {
  try {
    const {
      name, email, resumeTitle, pdfBase64, docxBase64, userId, resumeId, orderId,
      subscription: subCreds
    } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });
    if (!pdfBase64 && !docxBase64) return res.status(400).json({ error: "No file data provided." });

    // If the caller is sending under a Weekly Pass, atomically consume one
    // "email" use before generating the actual email. This makes the cap
    // server-authoritative — a client that skips the /subscription/use call
    // still gets blocked here once the 15 combined uses are gone.
    let subUseResult = null;
    if (subCreds?.email && subCreds?.token) {
      subUseResult = consumeSubscriptionUse(
        String(subCreds.email).trim().toLowerCase(),
        String(subCreds.token).trim(),
        Date.now(),
        "email"
      );
      if (!subUseResult.ok) {
        const statusCode = subUseResult.reason === "not_found" ? 404 : 410;
        return res.status(statusCode).json({
          error: subUseResult.reason === "expired"
            ? "Your Weekly Pass has expired."
            : subUseResult.reason === "exhausted"
              ? "Your Weekly Pass has reached its 15-use limit."
              : "Weekly Pass could not be verified.",
          subscription: subUseResult
        });
      }
    }

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

    return res.json({
      sent: result.sent,
      reason: result.reason,
      subscription: subUseResult && subUseResult.ok ? subUseResult : undefined
    });
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
