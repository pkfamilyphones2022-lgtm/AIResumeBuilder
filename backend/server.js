import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import resumeRoutes from "./routes/resumeRoutes.js";

dotenv.config({ path: "../.env" });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Trust the first proxy hop so req.ip reflects the real client IP for rate limiting
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true
  })
);
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
app.use("/api", resumeRoutes);

app.use((err, _req, res, _next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Resume PDF must be 5 MB or smaller." });
  }

  console.error("[server]", err.message);
  return res.status(500).json({ error: "Unexpected server error." });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
