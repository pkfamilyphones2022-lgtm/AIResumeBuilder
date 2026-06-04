import axios from "axios";
import { parsePaymentOrderError, parsePaymentVerifyError } from "../utils/apiError.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STORAGE_KEY = "raa_access";

export const savePaymentToken = ({ accessToken, orderId, paymentId, resumeId, paymentScope }) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accessToken, orderId, paymentId, resumeId, paymentScope: paymentScope || resumeId, used: false })
    );
  } catch {}
};

export const clearPaymentToken = (resumeId) => {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
};

export const getPaymentTokenPayload = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const restorePaymentToken = async (resumeId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const payload = JSON.parse(raw);
    if (payload.used) {
      clearPaymentToken();
      return false;
    }
    if (String(payload.paymentScope || payload.resumeId || "") !== String(resumeId || "")) {
      clearPaymentToken();
      return false;
    }
    const { data } = await axios.post(`${API}/payment/check`, payload);
    if (!data.valid) { clearPaymentToken(); return false; }
    return true;
  } catch {
    return false;
  }
};

export const payNow = async (context, onSuccess, onError) => {
  if (!window.Razorpay) {
    onError?.("Payment system is still loading. Please refresh the page and try again.");
    return;
  }

  if (!navigator.onLine) {
    onError?.("No internet connection — payment cannot be started. Please check your network.");
    return;
  }

  const { userId, resumeId, paymentScope, userName, userEmail, resumeTitle, resumeData } = context || {};

  try {
    const orderResponse = await axios.post(`${API}/payment/order`, { userId, resumeId, userEmail });
    const { keyId, orderId, amount, currency, isReturning, discountAmount } = orderResponse.data;
    const rupeesPaid = Math.round((amount || 0) / 100);
    const description = isReturning
      ? `Premium resume download — Rs.${rupeesPaid} (Rs.${Math.round((discountAmount || 0) / 100)} returning-customer discount)`
      : `Premium resume download — Rs.${rupeesPaid}`;

    const options = {
      key: keyId,
      amount,
      currency,
      order_id: orderId,
      name: "ResumeAlignAI Premium",
      description,
      prefill: {
        name: userName || "",
        email: userEmail || ""
      },
      handler: async (paymentResponse) => {
        try {
          const { data } = await axios.post(`${API}/payment/verify`, {
            ...paymentResponse,
            userId,
            resumeId,
            userName,
            userEmail,
            resumeTitle,
            resumeData
          });
          savePaymentToken({
            accessToken: data.accessToken,
            orderId: data.orderId,
            paymentId: data.paymentId,
            resumeId: data.resumeId || resumeId,
            paymentScope: paymentScope || resumeId
          });
          if (data.emailStatus && data.emailStatus !== "sent") {
            console.warn("Payment verified, but confirmation email was not sent:", data.emailStatus);
          }
          onSuccess();
        } catch (err) {
          onError?.(parsePaymentVerifyError(err));
        }
      },
      modal: {
        ondismiss: () => {
          // User closed the Razorpay modal — no error, just a dismissal
        }
      },
      theme: { color: "#0f766e" }
    };

    const checkout = new window.Razorpay(options);
    checkout.on("payment.failed", (response) => {
      const reason = response?.error?.description || response?.error?.reason || "";
      if (reason.toLowerCase().includes("insufficient") || reason.toLowerCase().includes("balance")) {
        onError?.("Payment failed — insufficient funds. Please try a different payment method.");
      } else if (reason.toLowerCase().includes("expired")) {
        onError?.("Your card has expired. Please use a different card or payment method.");
      } else if (reason.toLowerCase().includes("declined")) {
        onError?.("Payment was declined by your bank. Please try a different payment method.");
      } else {
        onError?.("Payment was not completed. Please try again or use a different payment method.");
      }
    });
    checkout.open();
  } catch (err) {
    onError?.(parsePaymentOrderError(err));
  }
};
