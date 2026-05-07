import crypto from "crypto";
import axios from "axios";

const RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";
const PAYMENT_AMOUNT = 6900;

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured.");
  }

  return { keyId, keySecret };
};

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.RAZORPAY_KEY_SECRET || "fallback-dev-secret";

const makeAccessToken = (orderId, paymentId) =>
  crypto
    .createHmac("sha256", ACCESS_TOKEN_SECRET)
    .update(`access|${orderId}|${paymentId}`)
    .digest("hex");

export const createPaymentOrder = async (_req, res) => {
  try {
    const { keyId, keySecret } = getRazorpayConfig();

    const response = await axios.post(
      RAZORPAY_ORDERS_URL,
      {
        amount: PAYMENT_AMOUNT,
        currency: "INR",
        receipt: `resume_${Date.now()}`
      },
      {
        auth: {
          username: keyId,
          password: keySecret
        },
        proxy: false
      }
    );

    return res.json({
      keyId,
      orderId: response.data.id,
      amount: response.data.amount,
      currency: response.data.currency
    });
  } catch (err) {
    console.error("[createPaymentOrder]", err.message);
    return res.status(500).json({
      error: err.response?.data?.error?.description || "Unable to create payment order. Please try again."
    });
  }
};

export const verifyPayment = (req, res) => {
  try {
    const { keySecret } = getRazorpayConfig();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

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

    const accessToken = makeAccessToken(razorpay_order_id, razorpay_payment_id);
    return res.json({ verified: true, accessToken, orderId: razorpay_order_id, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error("[verifyPayment]", err.message);
    return res.status(500).json({ error: "Payment verification error. Please contact support." });
  }
};

export const checkPaymentToken = (req, res) => {
  try {
    const { accessToken, orderId, paymentId } = req.body;
    if (!accessToken || !orderId || !paymentId) {
      return res.status(400).json({ valid: false });
    }
    const expected = makeAccessToken(orderId, paymentId);
    return res.json({ valid: crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(accessToken)) });
  } catch {
    return res.status(400).json({ valid: false });
  }
};
