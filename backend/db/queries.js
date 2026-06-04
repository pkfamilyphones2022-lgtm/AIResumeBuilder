import { getDb } from "./setup.js";

/* ── users ── */

export const createUser = ({ name, email, phone }) => {
  const db = getDb();
  const result = db
    .prepare("INSERT INTO users (name, email, phone) VALUES (?, ?, ?)")
    .run(name || null, email || null, phone || null);
  return result.lastInsertRowid;
};

export const getUserById = (id) =>
  getDb().prepare("SELECT * FROM users WHERE id = ?").get(id);

export const getUsersByEmail = (email) =>
  getDb().prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)").all(email);

// Deletes a user and every row referencing them, in a single transaction.
// Returns a per-table count of deleted rows.
export const deleteAllUserDataByEmail = (email) => {
  const db = getDb();
  const users = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").all(email);
  if (users.length === 0) return { matchedUsers: 0 };

  const userIds = users.map((u) => u.id);
  const placeholders = userIds.map(() => "?").join(",");

  const txn = db.transaction(() => {
    const aiUsage   = db.prepare(`DELETE FROM ai_usage  WHERE user_id IN (${placeholders})`).run(...userIds).changes;
    const downloads = db.prepare(`DELETE FROM downloads WHERE user_id IN (${placeholders})`).run(...userIds).changes;
    const emails    = db.prepare(`DELETE FROM emails    WHERE user_id IN (${placeholders})`).run(...userIds).changes;
    const payments  = db.prepare(`DELETE FROM payments  WHERE user_id IN (${placeholders})`).run(...userIds).changes;
    const resumes   = db.prepare(`DELETE FROM resumes   WHERE user_id IN (${placeholders})`).run(...userIds).changes;
    const usersDel  = db.prepare(`DELETE FROM users     WHERE id      IN (${placeholders})`).run(...userIds).changes;
    return { aiUsage, downloads, emails, payments, resumes, users: usersDel };
  });

  return { matchedUsers: users.length, deleted: txn() };
};

/* ── resumes ── */

export const createResume = ({ userId, resumeData, generatedContent, atsScore }) => {
  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO resumes (user_id, resume_data, generated_content, ats_score) VALUES (?, ?, ?, ?)"
    )
    .run(
      userId || null,
      JSON.stringify(resumeData || {}),
      JSON.stringify(generatedContent || {}),
      atsScore || null
    );
  return result.lastInsertRowid;
};

export const updateResumeStatus = (resumeId, status) =>
  getDb()
    .prepare("UPDATE resumes SET status = ? WHERE id = ?")
    .run(status, resumeId);

export const getResumeById = (id) =>
  getDb().prepare("SELECT * FROM resumes WHERE id = ?").get(id);

/* AI usage */

export const createAiUsageLog = ({
  userId,
  resumeId,
  purpose,
  provider,
  model,
  promptTokens,
  completionTokens,
  totalTokens,
  costPaise
}) => {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO ai_usage
        (user_id, resume_id, purpose, provider, model, prompt_tokens, completion_tokens, total_tokens, cost_paise)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId || null,
      resumeId || null,
      purpose || null,
      provider || null,
      model || null,
      Number(promptTokens || 0),
      Number(completionTokens || 0),
      Number(totalTokens || 0),
      Number(costPaise || 0)
    );
  return result.lastInsertRowid;
};

/* ── payments ── */

export const createPayment = ({ userId, resumeId, razorpayOrderId, amount }) => {
  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO payments (user_id, resume_id, razorpay_order_id, amount) VALUES (?, ?, ?, ?)"
    )
    .run(userId || null, resumeId || null, razorpayOrderId, amount);
  return result.lastInsertRowid;
};

export const updatePaymentSuccess = ({ razorpayOrderId, razorpayPaymentId }) =>
  getDb()
    .prepare(
      "UPDATE payments SET status = 'success', razorpay_payment_id = ? WHERE razorpay_order_id = ?"
    )
    .run(razorpayPaymentId, razorpayOrderId);

export const updatePaymentFailed = (razorpayOrderId) =>
  getDb()
    .prepare("UPDATE payments SET status = 'failed' WHERE razorpay_order_id = ?")
    .run(razorpayOrderId);

export const getPaymentByOrderId = (razorpayOrderId) =>
  getDb()
    .prepare("SELECT * FROM payments WHERE razorpay_order_id = ?")
    .get(razorpayOrderId);

export const getSuccessfulPaymentCountByEmail = (email) => {
  if (!email) return 0;
  const row = getDb()
    .prepare(`
      SELECT COUNT(*) AS count
      FROM payments p
      JOIN users u ON u.id = p.user_id
      WHERE LOWER(u.email) = LOWER(?) AND p.status = 'success'
    `)
    .get(email);
  return Number(row?.count || 0);
};

/* ── emails ── */

export const createEmailLog = ({ userId, resumeId, emailType }) => {
  const db = getDb();
  const result = db
    .prepare("INSERT INTO emails (user_id, resume_id, email_type, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)")
    .run(userId || null, resumeId || null, emailType);
  return result.lastInsertRowid;
};

export const updateEmailStatus = ({ emailId, status }) =>
  getDb()
    .prepare(
      "UPDATE emails SET status = ?, sent_at = CASE WHEN ? = 'sent' THEN CURRENT_TIMESTAMP ELSE sent_at END WHERE id = ?"
    )
    .run(status, status, emailId);

/* downloads */

export const createDownloadLog = ({ userId, resumeId, razorpayOrderId, razorpayPaymentId, fileFormat }) => {
  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO downloads (user_id, resume_id, razorpay_order_id, razorpay_payment_id, file_format) VALUES (?, ?, ?, ?, ?)"
    )
    .run(userId || null, resumeId || null, razorpayOrderId || null, razorpayPaymentId || null, fileFormat || null);
  return result.lastInsertRowid;
};

export const getDownloadByPaymentId = (razorpayPaymentId) =>
  getDb()
    .prepare("SELECT * FROM downloads WHERE razorpay_payment_id = ? LIMIT 1")
    .get(razorpayPaymentId);

/* admin reporting */

export const getAdminSummary = () => {
  const db = getDb();
  const row = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM resumes) AS resumesCreated,
      (SELECT COUNT(*) FROM payments WHERE status = 'success') AS successfulPayments,
      (SELECT COUNT(*) FROM payments WHERE status = 'pending') AS pendingPayments,
      (SELECT COUNT(*) FROM payments WHERE status = 'failed') AS failedPayments,
      (SELECT COUNT(*) FROM downloads) AS downloads,
      (SELECT COUNT(*)
         FROM payments p
         LEFT JOIN downloads d ON d.razorpay_order_id = p.razorpay_order_id
        WHERE p.status = 'success' AND d.id IS NULL) AS paidNotDownloaded,
      (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'success') AS revenuePaise,
      (SELECT COALESCE(SUM(cost_paise), 0) FROM ai_usage) AS aiCostPaise,
      (SELECT COUNT(*) FROM emails WHERE status = 'sent') AS emailsSent,
      (SELECT COUNT(*) FROM emails WHERE status = 'failed') AS emailsFailed
  `).get();
  return row || {};
};

export const getAdminDailyStats = ({ limit = 14 } = {}) => {
  const db = getDb();
  return db.prepare(`
    WITH days(day) AS (
      SELECT DATE(created_at) FROM resumes
      UNION
      SELECT DATE(created_at) FROM payments
      UNION
      SELECT DATE(created_at) FROM downloads
      UNION
      SELECT DATE(COALESCE(sent_at, created_at)) FROM emails
    )
    SELECT
      day AS date,
      (SELECT COUNT(*) FROM resumes WHERE DATE(created_at) = day) AS resumesCreated,
      (SELECT COUNT(*) FROM payments WHERE DATE(created_at) = day AND status = 'success') AS paymentSuccess,
      (SELECT COUNT(*) FROM payments WHERE DATE(created_at) = day AND status = 'pending') AS paymentPending,
      (SELECT COUNT(*) FROM payments WHERE DATE(created_at) = day AND status = 'failed') AS paymentFailed,
      (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE DATE(created_at) = day AND status = 'success') AS revenuePaise,
      (SELECT COALESCE(SUM(cost_paise), 0) FROM ai_usage WHERE DATE(created_at) = day) AS aiCostPaise,
      (SELECT COUNT(*) FROM downloads WHERE DATE(created_at) = day) AS downloads,
      (SELECT COUNT(*) FROM emails WHERE DATE(COALESCE(sent_at, created_at)) = day AND status = 'sent') AS emailsSent,
      (SELECT COUNT(*) FROM emails WHERE DATE(COALESCE(sent_at, created_at)) = day AND status = 'failed') AS emailsFailed
    FROM days
    WHERE day IS NOT NULL
    ORDER BY day DESC
    LIMIT ?
  `).all(limit);
};

export const getAdminRecentActivity = ({ limit = 50 } = {}) => {
  const db = getDb();
  return db.prepare(`
    SELECT
      r.id AS resumeId,
      r.status AS resumeStatus,
      r.ats_score AS atsScore,
      r.created_at AS resumeCreatedAt,
      u.id AS userId,
      u.name AS userName,
      u.email AS userEmail,
      u.phone AS userPhone,
      p.status AS paymentStatus,
      p.amount AS amount,
      p.razorpay_order_id AS orderId,
      p.razorpay_payment_id AS paymentId,
      p.created_at AS paymentCreatedAt,
      COUNT(DISTINCT d.id) AS downloadCount,
      MAX(d.created_at) AS lastDownloadedAt,
      COALESCE(SUM(DISTINCT au.cost_paise), 0) AS aiCostPaise,
      COALESCE(SUM(DISTINCT au.total_tokens), 0) AS aiTokens,
      COUNT(DISTINCT CASE WHEN e.status = 'sent' THEN e.id END) AS emailsSent,
      COUNT(DISTINCT CASE WHEN e.status = 'failed' THEN e.id END) AS emailsFailed
    FROM resumes r
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN payments p ON p.resume_id = r.id
    LEFT JOIN downloads d ON d.resume_id = r.id
    LEFT JOIN ai_usage au ON au.resume_id = r.id
    LEFT JOIN emails e ON e.resume_id = r.id
    GROUP BY r.id, p.id
    ORDER BY COALESCE(p.created_at, r.created_at) DESC
    LIMIT ?
  `).all(limit);
};

export const getAiUsageByModel = () => {
  const db = getDb();
  return db.prepare(`
    SELECT
      provider,
      model,
      COUNT(*) AS requests,
      SUM(CASE WHEN purpose = 'generate' THEN 1 ELSE 0 END) AS generateCount,
      SUM(CASE WHEN purpose = 'improve'  THEN 1 ELSE 0 END) AS improveCount,
      SUM(CASE WHEN purpose = 'suggest'  THEN 1 ELSE 0 END) AS suggestCount,
      SUM(prompt_tokens)      AS promptTokens,
      SUM(completion_tokens)  AS completionTokens,
      SUM(total_tokens)       AS totalTokens,
      SUM(cost_paise)         AS costPaise
    FROM ai_usage
    GROUP BY provider, model
    ORDER BY SUM(total_tokens) DESC
  `).all();
};

export const getAdminResumeForEmail = (resumeId) =>
  getDb().prepare(`
    SELECT
      r.id AS resumeId,
      r.generated_content AS generatedContent,
      r.resume_data AS resumeData,
      r.ats_score AS atsScore,
      r.status AS resumeStatus,
      r.created_at AS resumeCreatedAt,
      u.id AS userId,
      u.name AS userName,
      u.email AS userEmail,
      u.phone AS userPhone,
      p.status AS paymentStatus,
      p.amount AS amount,
      p.razorpay_order_id AS orderId,
      p.razorpay_payment_id AS paymentId
    FROM resumes r
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN payments p ON p.resume_id = r.id
    WHERE r.id = ?
    ORDER BY CASE WHEN p.status = 'success' THEN 0 ELSE 1 END, p.created_at DESC
    LIMIT 1
  `).get(resumeId);
