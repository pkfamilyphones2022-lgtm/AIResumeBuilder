import crypto from "crypto";
import {
  createEmailLog,
  deleteAllUserDataByEmail,
  getAdminDailyStats,
  getAdminRecentActivity,
  getAdminResumeForEmail,
  getAdminSummary,
  getAiUsageByModel,
  updateEmailStatus
} from "../db/queries.js";
import { sendAdminResumeCopy } from "../services/emailService.js";
import { runBackup } from "../services/backupService.js";

const safeJson = (value, fallback = {}) => {
  try {
    if (!value) return fallback;
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
};

const getAdminToken = () => process.env.ADMIN_ACCESS_TOKEN || "";

const getPricingRates = () => ({
  currency: "INR paise per 1M tokens",
  usdToInr: Number(process.env.AI_COST_USD_TO_INR || 94.3),
  deepseek: {
    provider: "deepseek",
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    cacheHitInput: Number(process.env.AI_COST_DEEPSEEK_CACHE_HIT_PAISE_PER_1M || 264),
    cacheMissInput: Number(process.env.AI_COST_DEEPSEEK_CACHE_MISS_PAISE_PER_1M || process.env.AI_COST_DEEPSEEK_INPUT_PAISE_PER_1M || 1320),
    output: Number(process.env.AI_COST_DEEPSEEK_OUTPUT_PAISE_PER_1M || 2640)
  },
  groq: {
    provider: "groq",
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    input: Number(process.env.AI_COST_GROQ_INPUT_PAISE_PER_1M || 5564),
    output: Number(process.env.AI_COST_GROQ_OUTPUT_PAISE_PER_1M || 7450)
  },
  anthropic: {
    provider: "anthropic",
    model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5",
    input: Number(process.env.AI_COST_ANTHROPIC_INPUT_PAISE_PER_1M || 9430),
    output: Number(process.env.AI_COST_ANTHROPIC_OUTPUT_PAISE_PER_1M || 47150)
  }
});

const isTokenMatch = (incoming, expected) => {
  if (!incoming || !expected) return false;
  const a = Buffer.from(String(incoming));
  const b = Buffer.from(String(expected));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const requireAdmin = (req, res, next) => {
  const expected = getAdminToken();
  if (!expected) {
    return res.status(503).json({ error: "ADMIN_ACCESS_TOKEN is not configured." });
  }

  const header = req.get("x-admin-token") || "";
  const bearer = req.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const token = header || bearer;

  if (!isTokenMatch(token, expected)) {
    return res.status(401).json({ error: "Admin access denied." });
  }

  next();
};

export const adminOverview = (_req, res) => {
  try {
    const summary = getAdminSummary();
    const daily = getAdminDailyStats({ limit: 21 }).map((day) => ({
      ...day,
      revenue: Math.round((day.revenuePaise || 0) / 100),
      aiCostRs: Number(((day.aiCostPaise || 0) / 100).toFixed(2)),
      profitRs: Number((((day.revenuePaise || 0) - (day.aiCostPaise || 0)) / 100).toFixed(2))
    }));
    const recent = getAdminRecentActivity({ limit: 80 }).map((item) => ({
      ...item,
      amountRs: item.amount ? Math.round(item.amount / 100) : 0,
      aiCostRs: Number(((item.aiCostPaise || 0) / 100).toFixed(2)),
      profitRs: Number((((item.paymentStatus === "success" ? item.amount || 0 : 0) - (item.aiCostPaise || 0)) / 100).toFixed(2)),
      needsSupport: item.paymentStatus === "success" && Number(item.downloadCount || 0) === 0
    }));

    const modelUsage = getAiUsageByModel().map((row) => ({
      ...row,
      costRs: Number(((row.costPaise || 0) / 100).toFixed(4))
    }));

    return res.json({
      summary: {
        ...summary,
        revenueRs: Math.round((summary.revenuePaise || 0) / 100),
        aiCostRs: Number(((summary.aiCostPaise || 0) / 100).toFixed(2)),
        profitRs: Number((((summary.revenuePaise || 0) - (summary.aiCostPaise || 0)) / 100).toFixed(2))
      },
      pricing: getPricingRates(),
      daily,
      recent,
      modelUsage
    });
  } catch (err) {
    console.error("[adminOverview]", err.message);
    return res.status(500).json({ error: "Unable to load admin dashboard." });
  }
};

export const adminDeleteUserData = (req, res) => {
  try {
    const email = String(req.body?.email || "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "A valid customer email is required." });
    }

    const result = deleteAllUserDataByEmail(email);
    if (!result.matchedUsers) {
      return res.status(404).json({ deleted: false, error: "No data found for that email." });
    }

    console.log(`[admin] DELETE user data for ${email}:`, result.deleted);
    return res.json({ deleted: true, ...result });
  } catch (err) {
    console.error("[adminDeleteUserData]", err.message);
    return res.status(500).json({ error: "Unable to delete user data." });
  }
};

export const adminSendResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { email, note } = req.body || {};
    const row = getAdminResumeForEmail(resumeId);

    if (!row) return res.status(404).json({ error: "Resume not found." });
    if (row.paymentStatus !== "success") {
      return res.status(403).json({ error: "Resume can only be resent after successful payment." });
    }

    const targetEmail = email || row.userEmail;
    if (!targetEmail) return res.status(400).json({ error: "Customer email is missing." });

    const resume = safeJson(row.generatedContent, {});
    const originalData = safeJson(row.resumeData, {});
    const resumeTitle = resume.title || originalData.targetTitle || "Your Resume";

    let emailId = null;
    try {
      emailId = createEmailLog({ userId: row.userId, resumeId: row.resumeId, emailType: "admin_resume_copy" });
      const result = await sendAdminResumeCopy({
        name: row.userName || resume.fullName || originalData.name,
        email: targetEmail,
        resumeTitle,
        resumeData: resume,
        note
      });
      updateEmailStatus({ emailId, status: result.sent ? "sent" : "failed" });
      if (!result.sent) {
        return res.status(500).json({ sent: false, error: result.reason || "Email send failed." });
      }
      return res.json({ sent: true });
    } catch (emailErr) {
      if (emailId) {
        try { updateEmailStatus({ emailId, status: "failed" }); } catch {}
      }
      console.error("[adminSendResume]", emailErr.message);
      return res.status(500).json({ sent: false, error: "Unable to send resume email." });
    }
  } catch (err) {
    console.error("[adminSendResume]", err.message);
    return res.status(500).json({ error: "Admin email action failed." });
  }
};

// POST /api/admin/backup — manual trigger for the daily SQLite snapshot.
// Useful for verifying BACKUP_EMAIL config without waiting for the cron tick.
export const adminTriggerBackup = async (_req, res) => {
  try {
    const result = await runBackup();
    if (!result.ok) {
      return res.status(500).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error("[adminTriggerBackup]", err.message);
    return res.status(500).json({ ok: false, reason: err.message });
  }
};
