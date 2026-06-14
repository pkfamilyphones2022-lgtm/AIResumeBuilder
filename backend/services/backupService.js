/* ─────────────────────────────────────────────
   backupService.js — daily SQLite snapshot

   Single point of failure today: the SQLite DB on
   Railway's persistent volume. If the volume dies
   or gets accidentally wiped, we lose every payment
   record, refund claim, and DPDP deletion request.

   This service uses better-sqlite3's online backup
   API (consistent snapshot, no lock contention),
   gzips the result, and emails it as an attachment
   to BACKUP_EMAIL via the existing Resend transport.

   Restore = save the .sqlite.gz from email, gunzip
   it, replace database.sqlite on the volume.
   ───────────────────────────────────────────── */

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import zlib from "node:zlib";
import { promisify } from "node:util";
import { Resend } from "resend";
import { getDb } from "../db/setup.js";

const gzip = promisify(zlib.gzip);

const dateStamp = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
};

const summarizeDb = (db) => {
  const tables = ["users", "resumes", "payments", "downloads", "emails", "ai_usage"];
  const counts = {};
  for (const t of tables) {
    try {
      counts[t] = db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
    } catch {
      counts[t] = "?";
    }
  }
  return counts;
};

export const runBackup = async () => {
  const backupEmail = process.env.BACKUP_EMAIL;
  if (!backupEmail) {
    return { ok: false, reason: "BACKUP_EMAIL not set" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "RESEND_API_KEY not set" };
  }

  const tempPath = path.join(os.tmpdir(), `database-${Date.now()}.sqlite`);

  try {
    const db = getDb();

    // Consistent snapshot via SQLite's online backup API (no lock contention).
    await db.backup(tempPath);

    const buf = await fs.readFile(tempPath);
    const gzBuf = await gzip(buf);
    const summary = summarizeDb(db);
    const stamp = dateStamp();
    const filename = `database-${stamp}.sqlite.gz`;

    const rawSizeKb = (buf.length / 1024).toFixed(1);
    const gzSizeKb = (gzBuf.length / 1024).toFixed(1);
    const summaryHtml = Object.entries(summary)
      .map(([t, n]) => `<li><strong>${t}:</strong> ${n}</li>`)
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;line-height:1.6;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#0f766e;margin:0 0 12px;">Daily database backup</h2>
  <p style="margin:0 0 12px;color:#475569;">Snapshot from <strong>${stamp}</strong> (UTC). Attached as a gzipped SQLite file.</p>

  <table cellpadding="0" cellspacing="0" style="background:#f0fdf9;border:1px solid #99f6e4;border-radius:10px;padding:14px 16px;margin:14px 0;width:100%;">
    <tr>
      <td style="color:#0f766e;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Snapshot stats</td>
    </tr>
    <tr>
      <td style="padding-top:8px;">
        <p style="margin:4px 0;color:#475569;font-size:14px;">Raw size: <strong>${rawSizeKb} KB</strong></p>
        <p style="margin:4px 0;color:#475569;font-size:14px;">Compressed: <strong>${gzSizeKb} KB</strong></p>
      </td>
    </tr>
  </table>

  <h3 style="color:#0f766e;margin:18px 0 6px;font-size:15px;">Row counts</h3>
  <ul style="margin:0 0 18px;padding-left:22px;color:#475569;">${summaryHtml}</ul>

  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin:18px 0;font-size:13px;color:#78350f;">
    <p style="margin:0 0 6px;font-weight:700;">To restore</p>
    <ol style="margin:0;padding-left:20px;line-height:1.7;">
      <li>Save the attached file.</li>
      <li>Decompress: <code style="background:#fffaeb;border:1px solid #fde68a;padding:1px 5px;border-radius:3px;">gunzip ${filename}</code></li>
      <li>Replace <code style="background:#fffaeb;border:1px solid #fde68a;padding:1px 5px;border-radius:3px;">${process.env.DATABASE_PATH || "database.sqlite"}</code> on the Railway volume.</li>
      <li>Restart the server.</li>
    </ol>
  </div>

  <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;text-align:center;">ResumeAlignAI &middot; automated daily backup</p>
</body>
</html>`;

    const resend = new Resend(apiKey);
    const fromAddr = process.env.EMAIL_FROM || `ResumeAlignAI Backups <support@resumealignai.online>`;
    const { error } = await resend.emails.send({
      from: fromAddr,
      to: [backupEmail],
      subject: `[ResumeAlignAI Backup] ${stamp} (${gzSizeKb} KB)`,
      html,
      attachments: [
        { filename, content: gzBuf.toString("base64") }
      ]
    });

    if (error) throw new Error(error.message || "Resend send failed");

    console.log(`[backup] ✓ ${filename} → ${backupEmail} (${gzSizeKb} KB)`);
    return { ok: true, filename, sizeKb: Number(gzSizeKb), rowCounts: summary };

  } catch (err) {
    console.error("[backup] ✗ failed:", err.message);
    return { ok: false, reason: err.message };
  } finally {
    try { await fs.unlink(tempPath); } catch {}
  }
};

/* ─── Schedule: daily at 21:00 UTC (= 02:30 IST) ─────────── */
// We pick 21:00 UTC because Indian traffic is at its lowest then,
// and the snapshot's row counts give a useful "end-of-day" total.

const HOUR_UTC = 21;
const MIN_UTC = 0;
const DAY_MS = 24 * 60 * 60 * 1000;

const nextRunDelay = () => {
  const now = new Date();
  const next = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    HOUR_UTC, MIN_UTC, 0
  ));
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  return next.getTime() - now.getTime();
};

export const scheduleBackup = () => {
  if (!process.env.BACKUP_EMAIL) {
    console.log("[backup] BACKUP_EMAIL not set — daily backups disabled");
    return;
  }

  const tick = async () => {
    await runBackup();
    setTimeout(tick, DAY_MS);
  };

  const delay = nextRunDelay();
  const nextRunAt = new Date(Date.now() + delay).toISOString();
  console.log(`[backup] enabled — next snapshot at ${nextRunAt}`);
  setTimeout(tick, delay);
};
