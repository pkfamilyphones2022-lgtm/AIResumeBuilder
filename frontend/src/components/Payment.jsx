import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STORAGE_KEY = "raa_access";

export const savePaymentToken = (accessToken, orderId, paymentId) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, orderId, paymentId }));
  } catch {}
};

export const clearPaymentToken = () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
};

export const restorePaymentToken = async () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const payload = JSON.parse(raw);
    const { data } = await axios.post(`${API}/payment/check`, payload);
    if (!data.valid) { clearPaymentToken(); return false; }
    return true;
  } catch {
    return false;
  }
};

export const payNow = async (onSuccess, onError) => {
  if (!window.Razorpay) {
    onError?.("Razorpay checkout is not loaded.");
    return;
  }

  try {
    const orderResponse = await axios.post(`${API}/payment/order`);
    const { keyId, orderId, amount, currency } = orderResponse.data;

    const options = {
      key: keyId,
      amount,
      currency,
      order_id: orderId,
      name: "ResumeAlignAI",
      description: "Professional resume PDF download for Rs.69",
      handler: async (paymentResponse) => {
        try {
          const { data } = await axios.post(`${API}/payment/verify`, paymentResponse);
          savePaymentToken(data.accessToken, data.orderId, data.paymentId);
          onSuccess();
        } catch (err) {
          onError?.(err.response?.data?.error || "Payment verification failed.");
        }
      },
      theme: {
        color: "#0f766e"
      }
    };

    const checkout = new window.Razorpay(options);
    checkout.on("payment.failed", () => {
      onError?.("Payment failed. Please try again.");
    });
    checkout.open();
  } catch (err) {
    onError?.(err.response?.data?.error || "Unable to create Razorpay order.");
  }
};
