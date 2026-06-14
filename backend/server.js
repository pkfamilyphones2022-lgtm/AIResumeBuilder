import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import resumeRoutes from "./routes/resumeRoutes.js";
import { getDb } from "./db/setup.js";
import { verifyEmailTransport } from "./services/emailService.js";
import { scheduleBackup } from "./services/backupService.js";

// Env is loaded via `node --env-file=.env` in package.json scripts.

// Fail fast in production if required env vars are missing
const validateProductionEnv = () => {
  if (process.env.NODE_ENV !== "production") return;
  const errors = [];

  if (!process.env.CLIENT_ORIGIN)
    errors.push("CLIENT_ORIGIN is required");
  else if (!process.env.CLIENT_ORIGIN.startsWith("https://"))
    errors.push("CLIENT_ORIGIN must use https:// in production");

  if (!process.env.ACCESS_TOKEN_SECRET) errors.push("ACCESS_TOKEN_SECRET is required");
  if (!process.env.RAZORPAY_KEY_ID)     errors.push("RAZORPAY_KEY_ID is required");
  if (!process.env.RAZORPAY_KEY_SECRET) errors.push("RAZORPAY_KEY_SECRET is required");
  if (!process.env.ADMIN_ACCESS_TOKEN)  errors.push("ADMIN_ACCESS_TOKEN is required");

  const hasAiKey = process.env.DEEPSEEK_API_KEY || process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!hasAiKey)
    errors.push("At least one AI key is required: DEEPSEEK_API_KEY, GROQ_API_KEY, or ANTHROPIC_API_KEY");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
    errors.push("EMAIL_USER and EMAIL_PASS are required for payment confirmation emails");

  if (errors.length > 0) {
    console.error("\n[startup] Missing required environment variables:");
    errors.forEach((e) => console.error(`  ✗ ${e}`));
    console.error("\nSet these in your deployment environment and restart.\n");
    process.exit(1);
  }

  console.log("[startup] Production environment validated.");
};

validateProductionEnv();

// Initialise SQLite DB and create tables
try {
  getDb();
  console.log("[db] SQLite database ready.");
} catch (err) {
  console.error("[db] Database init failed:", err.message);
}

// In production, verify SMTP transport at startup so misconfigured creds surface in logs.
// Do not crash the process — a transient SMTP outage should not take the whole app down.
if (process.env.NODE_ENV === "production") {
  verifyEmailTransport()
    .then(() => console.log("[email] SMTP transport verified."))
    .catch((err) => {
      console.error("[email] SMTP verify failed at startup (emails will fail until fixed):", err.message);
    });
}

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "";
const IS_PROD = process.env.NODE_ENV === "production";

// Trust the first proxy hop so req.ip reflects the real client IP for rate limiting
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin) return callback(null, true);
      // In production, only allow the configured CLIENT_ORIGIN
      if (IS_PROD) {
        return CLIENT_ORIGIN && origin === CLIENT_ORIGIN
          ? callback(null, true)
          : callback(new Error("Not allowed by CORS"));
      }
      // In development, allow any localhost port (Vite picks any available port)
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      // Also allow the explicitly configured origin
      if (CLIENT_ORIGIN && origin === CLIENT_ORIGIN) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
// Email attachment endpoint receives PDF + DOCX as base64 — can be 3-8MB
app.use("/api/payment/email-attachments", express.json({ limit: "20mb" }));
app.use(express.json({ limit: "1mb" }));

// 10 AI requests per IP per 15 minutes
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a few minutes and try again." }
});

// 30 uploads/ATS/payment checks per IP per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a few minutes and try again." }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/generate", aiLimiter);
app.use("/api/improve", aiLimiter);
app.use("/api/suggest", aiLimiter);
app.use("/api/upload", generalLimiter);
app.use("/api/ats", generalLimiter);
app.use("/api/payment", generalLimiter);
app.use("/api/admin", generalLimiter);
app.use("/api", resumeRoutes);

// 404 — route not found
app.use((_req, res) => {
  res.status(404).json({ error: "The requested resource was not found." });
});

// Global error handler
app.use((err, _req, res, _next) => {
  const msg = String(err?.message || "").toLowerCase();

  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "The PDF file is too large. Please upload a file under 5 MB." });
  }

  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "The request body is too large. Please reduce the content size." });
  }

  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid request format. Please try again." });
  }

  if (msg.includes("rate") && msg.includes("limit")) {
    return res.status(429).json({ error: "Too many requests — please wait a few minutes and try again." });
  }

  if (msg.includes("timeout") || msg.includes("etimedout")) {
    return res.status(503).json({ error: "The request timed out. Please try again in a moment." });
  }

  if (msg.includes("econnrefused") || msg.includes("econnreset")) {
    return res.status(503).json({ error: "Service temporarily unavailable. Please try again shortly." });
  }

  console.error("[server]", err.message || err);
  return res.status(500).json({ error: "Something went wrong on our end. Please try again in a moment." });
});

app.listen(PORT, () => {
  console.log(`[server] Listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
  scheduleBackup();
});
