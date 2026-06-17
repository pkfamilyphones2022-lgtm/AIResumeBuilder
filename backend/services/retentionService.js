/* ─────────────────────────────────────────────
   retentionService.js — DPDP-aligned data retention

   Our Privacy Policy promises resume content is auto-deleted within
   24 hours. This service enforces that on the DB.

   What we delete: `resume_data` and `generated_content` columns on
   the `resumes` table for rows older than DATA_RETENTION_HOURS.
   What we keep: payment, download, email log rows (for refund and
   accounting); user contact for support resends within window.

   Default window is 24 hours, configurable via DATA_RETENTION_HOURS
   so we can bump to 168 (7 days) without redeploying any UI text
   (the badge wording stays "24 hours" by default — change both
   together if you change the policy).
   ───────────────────────────────────────────── */

import { getDb } from "../db/setup.js";

const HOUR_MS = 60 * 60 * 1000;
const TICK_MS = HOUR_MS;

const getRetentionHours = () => {
  const raw = Number(process.env.DATA_RETENTION_HOURS);
  return Number.isFinite(raw) && raw > 0 ? raw : 24;
};

export const purgeOldResumeContent = () => {
  const hours = getRetentionHours();
  const cutoffIso = new Date(Date.now() - hours * HOUR_MS).toISOString();
  try {
    const db = getDb();
    const result = db.prepare(`
      UPDATE resumes
      SET resume_data = NULL,
          generated_content = NULL,
          status = CASE
            WHEN status IN ('downloaded','refunded','purged') THEN status
            ELSE 'purged'
          END
      WHERE created_at <= ?
        AND (resume_data IS NOT NULL OR generated_content IS NOT NULL)
    `).run(cutoffIso);

    if (result.changes > 0) {
      console.log(`[retention] purged content from ${result.changes} resume row(s) older than ${hours}h`);
    }
    return { ok: true, scrubbedRows: result.changes, retentionHours: hours };
  } catch (err) {
    console.error("[retention] purge failed:", err.message);
    return { ok: false, reason: err.message };
  }
};

export const scheduleRetentionPurge = () => {
  const hours = getRetentionHours();
  console.log(`[retention] enabled — purging resume content older than ${hours}h hourly`);
  // First sweep on a small delay so it doesn't fight DB init
  setTimeout(() => {
    purgeOldResumeContent();
    setInterval(purgeOldResumeContent, TICK_MS);
  }, 30 * 1000);
};
