/* ─────────────────────────────────────────────────────────────
   Centralized API error parser
   All catch blocks in the app should call one of these functions
   so users always see a polite, actionable message.
───────────────────────────────────────────────────────────── */

const MESSAGES = {
  offline:        "No internet connection — please check your network and try again.",
  timeout:        "The request is taking longer than usual. Our AI may be under heavy load — please try again in a moment.",
  rateLimit:      "Too many requests — please wait a few minutes before trying again.",
  serverBusy:     "Our AI service is temporarily busy. Please try again in about 30 seconds.",
  serverError:    "Something went wrong on our end. Please try again shortly.",
  fileTooLarge:   "The PDF is too large. Please upload a file under 5 MB.",
  fileUnreadable: "We couldn't read this PDF. Please try a different file.",
  aiParseFailed:  "The AI returned an unexpected response. Please try generating again.",
  configError:    "AI service is temporarily unavailable. Please try again shortly.",
  paymentFailed:  "Payment was not completed. Please try again or use a different payment method.",
  paymentVerify:  "Payment verification failed. If you were charged, please contact support at support@resumealignai.online.",
  generic:        "Something went wrong. Please try again in a moment.",
};

const isRateLimit = (err) => {
  const status = err?.response?.status;
  const msg = String(err?.response?.data?.error || err?.message || "").toLowerCase();
  return status === 429 || msg.includes("too many") || (msg.includes("rate") && msg.includes("limit"));
};

const isTimeout = (err) =>
  err?.code === "ECONNABORTED" ||
  String(err?.message || "").toLowerCase().includes("timeout") ||
  err?.response?.status === 504;

const isServerBusy = (err) =>
  [502, 503, 504].includes(err?.response?.status);

const serverMsg = (err) => err?.response?.data?.error || "";

/* ── Generic parser — use this when no specific context fits ── */
export const parseApiError = (err) => {
  if (!navigator.onLine)   return MESSAGES.offline;
  if (!err?.response) {
    if (isTimeout(err))    return MESSAGES.timeout;
    return "Unable to reach the server. Please make sure the backend is running and try again.";
  }
  if (isRateLimit(err))    return MESSAGES.rateLimit;
  if (isServerBusy(err))   return MESSAGES.serverBusy;

  const status = err.response.status;
  const msg    = serverMsg(err);

  if (status === 413)      return MESSAGES.fileTooLarge;
  if (status === 500) {
    const lower = msg.toLowerCase();
    if (lower.includes("parse") || lower.includes("json") || lower.includes("structured")) {
      return MESSAGES.aiParseFailed;
    }
    if (lower.includes("configured") || lower.includes("api_key")) {
      return MESSAGES.configError;
    }
    return MESSAGES.serverError;
  }
  // 400-499 — backend messages are already user-friendly, trust them
  if (status >= 400 && msg) return msg;

  return MESSAGES.generic;
};

/* ── Resume PDF upload ── */
export const parseUploadError = (err) => {
  if (!navigator.onLine) return MESSAGES.offline;
  if (!err?.response) return "Unable to reach the server to parse your resume. Please check the backend is running.";
  if (err.response.status === 413) return MESSAGES.fileTooLarge;
  if (err.response.status === 400) return serverMsg(err) || MESSAGES.fileUnreadable;
  return parseApiError(err);
};

/* ── AI resume generation / improvement ── */
export const parseGenerateError = (err) => {
  if (!navigator.onLine)  return MESSAGES.offline;
  if (!err?.response) {
    if (isTimeout(err))   return "AI generation timed out — our servers may be busy. Please try again in a moment.";
    return "Unable to reach our servers. Please check your connection and try again.";
  }
  if (isRateLimit(err))   return "You've reached the AI request limit. Please wait a few minutes and try again.";
  if (isServerBusy(err))  return "Our AI service is temporarily busy. Please try again in about 30 seconds.";
  if (err.response.status === 500) {
    const msg = serverMsg(err).toLowerCase();
    if (msg.includes("parse") || msg.includes("json")) return MESSAGES.aiParseFailed;
    return "Resume generation failed. Please try again in a moment.";
  }
  return serverMsg(err) || MESSAGES.generic;
};

/* ── ATS scoring ── */
export const parseAtsError = (err) => {
  if (!navigator.onLine)  return MESSAGES.offline;
  if (!err?.response)     return "ATS check timed out — please try again.";
  if (isRateLimit(err))   return "Too many ATS checks — please wait a moment before trying again.";
  return serverMsg(err) || "ATS score check failed. Please try again.";
};

/* ── Payment order creation ── */
export const parsePaymentOrderError = (err) => {
  if (!navigator.onLine)  return "No internet connection — payment cannot be started.";
  if (!err?.response)     return "Unable to reach the payment server. Please try again.";
  if (isRateLimit(err))   return "Too many payment attempts. Please wait a moment and try again.";
  return serverMsg(err) || "Unable to start payment. Please try again.";
};

/* ── Payment verification ── */
export const parsePaymentVerifyError = (err) => {
  if (!navigator.onLine)  return "No internet connection — could not verify your payment.";
  if (!err?.response)     return MESSAGES.paymentVerify;
  return serverMsg(err) || MESSAGES.paymentVerify;
};
