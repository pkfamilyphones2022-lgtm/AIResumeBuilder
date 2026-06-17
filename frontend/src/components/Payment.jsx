import axios from "axios";
import { parsePaymentOrderError, parsePaymentVerifyError } from "../utils/apiError.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STORAGE_KEY = "raa_access";
const SUB_KEY = "raa_subscription";

/* ─── Single-purchase access token (existing flow) ─────────── */

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

/* ─── Weekly Pass subscription helpers ─────────────────────── */

export const saveSubscription = (sub) => {
  if (!sub || !sub.email || !sub.token) return;
  try {
    const limit = Number(sub.downloadsLimit ?? 15);
    const dl    = Number(sub.downloadsUsed ?? 0);
    const em    = Number(sub.emailsUsed ?? 0);
    localStorage.setItem(SUB_KEY, JSON.stringify({
      email:           String(sub.email).trim().toLowerCase(),
      token:           String(sub.token),
      downloadsLimit:  limit,
      downloadsUsed:   dl,
      emailsUsed:      em,
      remaining:       Number(sub.remaining ?? (limit - dl - em)),
      expiresAt:       sub.expiresAt,
      cachedAt:        Date.now()
    }));
  } catch {}
};

export const getSubscription = () => {
  try {
    const raw = localStorage.getItem(SUB_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearSubscription = () => {
  try { localStorage.removeItem(SUB_KEY); } catch {}
};

// Ask the server whether the locally stored subscription is still active
// (within 7 days, not exhausted, not replaced by a newer purchase on the
// same email). Refreshes the cached download counters. Returns the live
// status object or null if missing / inactive.
export const refreshSubscriptionStatus = async () => {
  const local = getSubscription();
  if (!local) return null;
  try {
    const { data, status } = await axios.post(
      `${API}/payment/subscription/status`,
      { email: local.email, token: local.token },
      { validateStatus: (s) => s < 500 }   // 404/410 are expected for stale subs
    );
    if (status >= 200 && status < 300 && data?.active) {
      saveSubscription({ ...local, ...data });
      return data;
    }
    clearSubscription();
    return null;
  } catch {
    // Network error — keep cached values, don't nuke them
    return local;
  }
};

// Decrement the subscription counter for one use. `kind` is "download"
// (default) or "email" — both share the single 15-use cap but are tracked
// separately. Returns the updated counters on success, or null if the
// subscription was exhausted, expired, or otherwise unusable.
export const consumeSubscriptionDownload = async (kind = "download") => {
  const local = getSubscription();
  if (!local) return null;
  try {
    const { data, status } = await axios.post(
      `${API}/payment/subscription/use`,
      { email: local.email, token: local.token, kind },
      { validateStatus: (s) => s < 500 }
    );
    if (status >= 200 && status < 300 && data?.ok) {
      saveSubscription({ ...local, ...data });
      return data;
    }
    if (status === 404 || status === 410) {
      clearSubscription();
    }
    return null;
  } catch {
    return null;
  }
};

/* ─── Razorpay checkout — plan-aware ───────────────────────── */

export const payNow = async (context, onSuccess, onError) => {
  if (!window.Razorpay) {
    onError?.("Payment system is still loading. Please refresh the page and try again.");
    return;
  }

  if (!navigator.onLine) {
    onError?.("No internet connection — payment cannot be started. Please check your network.");
    return;
  }

  const {
    userId, resumeId, paymentScope, userName, userEmail, resumeTitle, resumeData,
    planType = "single"
  } = context || {};

  try {
    const orderResponse = await axios.post(`${API}/payment/order`, {
      userId, resumeId, userEmail, planType
    });
    const { keyId, orderId, amount, currency, planType: serverPlan, label, downloads, durationDays } = orderResponse.data;
    const rupeesPaid = Math.round((amount || 0) / 100);
    const description = serverPlan === "weekly"
      ? `Weekly Pass — Rs.${rupeesPaid} · ${downloads} downloads · ${durationDays} days`
      : `Single resume download — Rs.${rupeesPaid}`;

    const options = {
      key: keyId,
      amount,
      currency,
      order_id: orderId,
      name: serverPlan === "weekly" ? "ResumeAlignAI Weekly Pass" : "ResumeAlignAI Premium",
      description,
      prefill: {
        name: userName || "",
        email: userEmail || "",
        method: "upi"
      },
      // Surface UPI / QR first — every extra field on checkout costs 5-10%
      // conversion. UPI is one tap on mobile and a QR scan on desktop.
      config: {
        display: {
          blocks: {
            utpi: {
              name: "Pay via UPI",
              instruments: [
                { method: "upi", flows: ["collect", "intent", "qr"] }
              ]
            },
            other: {
              name: "Other payment methods",
              instruments: [
                { method: "card" },
                { method: "netbanking" },
                { method: "wallet" }
              ]
            }
          },
          sequence: ["block.utpi", "block.other"],
          preferences: { show_default_blocks: false }
        }
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
            resumeData,
            planType: serverPlan
          });

          if (data.subscription) {
            saveSubscription(data.subscription);
          }
          if (data.accessToken) {
            savePaymentToken({
              accessToken:   data.accessToken,
              orderId:       data.orderId,
              paymentId:     data.paymentId,
              resumeId:      data.resumeId || resumeId,
              paymentScope:  paymentScope || resumeId
            });
          }
          onSuccess?.({ planType: data.planType, subscription: data.subscription });
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
