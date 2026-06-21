import nodemailer from "nodemailer";
import dns from "dns/promises";
import { Resend } from "resend";

// ── Resend (HTTPS API) — preferred for cloud deploys ─────────
// SMTP egress is unreliable on Railway/Render/Fly (port 587/465 often blocked or
// IPv6-only routed). Resend uses port 443 which is always open, so we use it
// whenever RESEND_API_KEY is set. Falls back to nodemailer/SMTP for local dev.
const isResendMode = () => Boolean(process.env.RESEND_API_KEY);

let _resendClient = null;
const getResendClient = () => {
  if (!_resendClient) _resendClient = new Resend(process.env.RESEND_API_KEY);
  return _resendClient;
};

// Resend uses {filename, content} where content can be a Buffer or base64 string.
// Our existing send-* functions pass nodemailer-shaped attachments with Buffer content.
const normaliseAttachments = (attachments) =>
  (attachments || []).map((a) => ({
    filename: a.filename,
    content: a.content,
    ...(a.contentType ? { contentType: a.contentType } : {})
  }));

// Returns a nodemailer-shaped transporter so the rest of the code is unchanged.
// Translates nodemailer's `replyTo` to Resend's `reply_to`.
const getResendTransporter = () => ({
  sendMail: async ({ from, to, subject, html, attachments, replyTo }) => {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(attachments && attachments.length ? { attachments: normaliseAttachments(attachments) } : {})
    });
    if (error) throw new Error(error.message || error.name || "Resend send failed");
    return { messageId: data?.id || "resend" };
  },
  verify: async () => {
    // Resend does not provide a verify endpoint; a successful client construction
    // means we have an API key — actual auth is validated on the first send.
    return true;
  }
});

// ── Mode detection ──────────────────────────────────────────
const isEtherealMode = () =>
  (process.env.EMAIL_HOST || "ethereal").toLowerCase() === "ethereal";

// ── Ethereal test account (created once, reused per process) ─
let _etherealTransporter = null;

const getEtherealTransporter = async () => {
  if (_etherealTransporter) return _etherealTransporter;

  const account = await nodemailer.createTestAccount();
  _etherealTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: account.user, pass: account.pass }
  });

  console.log("\n[emailService] Ethereal test account ready:");
  console.log(`  User:  ${account.user}`);
  console.log(`  Pass:  ${account.pass}`);
  console.log(`  Inbox: https://ethereal.email/messages\n`);

  return _etherealTransporter;
};

// Cache the IPv4 address we resolved so we don't DNS-lookup on every email.
let _resolvedSmtpHost = null;

const resolveIPv4Host = async (hostname) => {
  if (_resolvedSmtpHost) return _resolvedSmtpHost;
  try {
    const addrs = await dns.resolve4(hostname);
    if (addrs.length === 0) throw new Error("No A records returned");
    _resolvedSmtpHost = addrs[0];
    console.log(`[emailService] Resolved ${hostname} → ${_resolvedSmtpHost} (IPv4)`);
    return _resolvedSmtpHost;
  } catch (err) {
    console.warn(`[emailService] IPv4 resolution for ${hostname} failed, falling back to hostname:`, err.message);
    return hostname;
  }
};

// ── Real SMTP transporter ────────────────────────────────────
const getRealTransporter = async () => {
  const hostname = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) return null;

  // Railway and many container hosts have unreliable IPv6 egress, and nodemailer's
  // `family: 4` hint is sometimes ignored. We pre-resolve the hostname to an IPv4
  // address ourselves and pass that as the host. `tls.servername` keeps SNI intact.
  const host = await resolveIPv4Host(hostname);

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { servername: hostname },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    family: 4
  });
};

// ── Resume content section ───────────────────────────────────
const buildResumeSection = (resumeData) => {
  if (!resumeData) return "";
  const r = typeof resumeData === "string" ? JSON.parse(resumeData) : resumeData;

  const contact = r.contact || {};
  const contactParts = [contact.phone, contact.email, contact.linkedin, contact.location].filter(Boolean);
  const skills = Array.isArray(r.skills) ? r.skills : [];
  const experience = Array.isArray(r.experience) ? r.experience : [];
  const education = Array.isArray(r.education) ? r.education : [];

  let expHtml = "";
  for (const exp of experience.slice(0, 3)) {
    const bullets = Array.isArray(exp.bullets) ? exp.bullets.slice(0, 2) : [];
    expHtml += `
      <div style="margin-bottom:10px;">
        <strong style="color:#1e293b;font-size:13px;">${exp.role || ""}</strong>
        ${exp.company ? `<span style="color:#64748b;font-size:12px;"> · ${exp.company}</span>` : ""}
        ${exp.duration ? `<span style="color:#94a3b8;font-size:11px;"> (${exp.duration})</span>` : ""}
        ${bullets.length ? `<ul style="margin:4px 0 0;padding-left:16px;color:#475569;font-size:12px;line-height:1.6;">${bullets.map(b => `<li>${b}</li>`).join("")}</ul>` : ""}
      </div>`;
  }

  let eduHtml = "";
  for (const edu of education.slice(0, 2)) {
    eduHtml += `
      <div style="margin-bottom:6px;">
        <strong style="color:#1e293b;font-size:13px;">${edu.degree || ""}</strong>
        ${edu.institution ? `<span style="color:#64748b;font-size:12px;"> · ${edu.institution}</span>` : ""}
        ${edu.duration ? `<span style="color:#94a3b8;font-size:11px;"> (${edu.duration})</span>` : ""}
      </div>`;
  }

  return `
    <div style="margin-top:28px;border-top:2px solid #e2e8f0;padding-top:24px;">
      <p style="color:#0f766e;font-size:12px;font-weight:700;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.06em;">Your Generated Resume</p>

      <div style="text-align:center;background:#f0fdf9;border:1px solid #99f6e4;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
        <h2 style="color:#134e4a;font-size:18px;font-weight:800;margin:0 0 4px;">${r.fullName || ""}</h2>
        ${r.title ? `<p style="color:#0f766e;font-size:13px;font-weight:600;margin:0 0 6px;">${r.title}</p>` : ""}
        ${contactParts.length ? `<p style="color:#64748b;font-size:12px;margin:0;">${contactParts.join(" · ")}</p>` : ""}
      </div>

      ${r.summary ? `
      <div style="margin-bottom:16px;">
        <p style="color:#0f766e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px;">Summary</p>
        <p style="color:#334155;font-size:13px;line-height:1.7;margin:0;">${r.summary}</p>
      </div>` : ""}

      ${skills.length ? `
      <div style="margin-bottom:16px;">
        <p style="color:#0f766e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px;">Key Skills</p>
        <p style="color:#334155;font-size:13px;line-height:1.7;margin:0;">${skills.join(" · ")}</p>
      </div>` : ""}

      ${expHtml ? `
      <div style="margin-bottom:16px;">
        <p style="color:#0f766e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">Experience</p>
        ${expHtml}
      </div>` : ""}

      ${eduHtml ? `
      <div style="margin-bottom:12px;">
        <p style="color:#0f766e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">Education</p>
        ${eduHtml}
      </div>` : ""}

      <p style="color:#94a3b8;font-size:11px;margin:12px 0 0;font-style:italic;">
        This is a text preview of your resume. Return to ResumeAlignAI to download the beautifully formatted PDF version with your chosen template.
      </p>
    </div>`;
};


// ── Shared transporter factory ───────────────────────────────
const getTransporter = async () => {
  if (isResendMode()) return getResendTransporter();
  if (isEtherealMode()) return getEtherealTransporter();

  const t = await getRealTransporter();
  if (!t) {
    if (process.env.NODE_ENV === "production")
      throw new Error("SMTP credentials (EMAIL_USER, EMAIL_PASS) are not configured.");
    console.warn("[emailService] SMTP credentials missing — falling back to Ethereal.");
    return getEtherealTransporter();
  }
  try {
    await t.verify();
    return t;
  } catch (verifyErr) {
    console.error("[emailService] SMTP verify failed:", verifyErr.message);
    if (verifyErr.code === "EAUTH") {
      console.error(
        "[emailService] Gmail auth failed — EMAIL_PASS must be a 16-char Google App Password.\n" +
        "  Get one at: https://myaccount.google.com/apppasswords"
      );
    }
    if (process.env.NODE_ENV === "production") throw verifyErr;
    console.warn("[emailService] Falling back to Ethereal.");
    return getEtherealTransporter();
  }
};

const fromAddress = () =>
  isEtherealMode()
    ? "ResumeAlignAI <test@resumeai.app>"
    : process.env.EMAIL_FROM || `ResumeAlignAI <${process.env.EMAIL_USER}>`;

// Reply-To address. Until we have a real receiving mailbox at support@,
// REPLY_TO_EMAIL on Railway can route customer replies to a personal inbox
// (e.g. a Gmail). Falls back to the support address itself if unset, which
// works once the mailbox is provisioned on the domain (Zoho/Google Workspace).
const replyToAddress = () => process.env.REPLY_TO_EMAIL || "support@resumealignai.online";

// Public website URL — used inside email templates to link the logo and CTA.
const appUrl = () => process.env.APP_URL || "https://resumealignai.online";
const supportEmail = () => "support@resumealignai.online";

// Branded header — logo + wordmark + Premium badge in a horizontal layout
// matching the website brand. Used at the top of every customer email.
const emailHeader = (subtitle) => {
  const url = appUrl();
  return `
  <tr><td style="background:linear-gradient(135deg,#0f766e 0%,#0d9488 50%,#d99152 140%);padding:30px 36px;text-align:center;">
    <a href="${url}" target="_blank" rel="noopener" style="text-decoration:none;display:inline-block;">
      <table cellpadding="0" cellspacing="0" align="center" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="vertical-align:middle;padding-right:14px;">
            <div style="background:linear-gradient(135deg,#f5d56b 0%,#d99152 100%);border-radius:12px;color:#ffffff;font-family:'Segoe UI',Arial,sans-serif;font-size:28px;font-weight:800;height:54px;line-height:54px;text-align:center;width:54px;box-shadow:0 6px 18px rgba(217,145,82,0.4);">R</div>
          </td>
          <td style="vertical-align:middle;text-align:left;">
            <div style="color:#ffffff;font-family:'Segoe UI',Arial,sans-serif;font-size:24px;font-weight:800;letter-spacing:-0.01em;line-height:1.1;">
              ResumeAlignAI
              <span style="background:linear-gradient(135deg,#f5d56b 0%,#c79a2b 60%,#a37414 100%);border-radius:999px;color:#2a1c00;font-size:10px;font-weight:800;letter-spacing:0.08em;margin-left:8px;padding:3px 9px;text-transform:uppercase;vertical-align:middle;display:inline-block;">Premium</span>
            </div>
            <div style="color:rgba(255,255,255,0.82);font-size:12px;font-weight:500;margin-top:4px;">${url.replace(/^https?:\/\//, "")}</div>
          </td>
        </tr>
      </table>
    </a>
    ${subtitle ? `<p style="color:rgba(255,255,255,0.92);font-size:14px;margin:18px 0 0;font-weight:500;">${subtitle}</p>` : ""}
  </td></tr>`;
};

// Prominent contact block — appears just above the footer. Surfaces the
// support email and website URL clearly in every email.
const contactBlock = () => {
  const url = appUrl();
  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 22px;margin:0 0 18px;text-align:center;">
      <p style="color:#1e293b;font-size:14px;font-weight:700;margin:0 0 10px;letter-spacing:0.02em;">Need help? We're here.</p>
      <p style="color:#475569;font-size:13px;line-height:1.7;margin:0;">
        <strong style="color:#0f766e;">Email:</strong>
        <a href="mailto:${supportEmail()}" style="color:#0f766e;text-decoration:none;font-weight:700;">${supportEmail()}</a>
        <br>
        <strong style="color:#0f766e;">Website:</strong>
        <a href="${url}" target="_blank" rel="noopener" style="color:#0f766e;text-decoration:none;font-weight:700;">${url.replace(/^https?:\/\//, "")}</a>
      </p>
    </div>`;
};

// Re-usable inline-styled "Visit website" CTA button. Sits above the
// contact block in every email.
const websiteCta = () => {
  const url = appUrl();
  return `
    <div style="background:#f0fdf9;border:1px solid #99f6e4;border-radius:10px;padding:18px 20px;margin:0 0 18px;text-align:center;">
      <p style="color:#0f766e;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">Visit ResumeAlignAI</p>
      <a href="${url}" target="_blank" rel="noopener" style="color:#ffffff;background:linear-gradient(135deg,#0f766e,#0d9488);border-radius:8px;display:inline-block;font-size:14px;font-weight:700;padding:11px 26px;text-decoration:none;box-shadow:0 4px 12px rgba(15,118,110,0.25);">
        Open ResumeAlignAI &rarr;
      </a>
    </div>`;
};

// Shared footer with brand copyright + redundant support link.
const emailFooter = (line) => `
  <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 38px;text-align:center;">
    <p style="color:#64748b;font-size:12px;margin:0 0 6px;line-height:1.6;">
      &copy; 2026 <strong style="color:#0f766e;">ResumeAlignAI</strong> Premium &middot;
      <a href="${appUrl()}" target="_blank" rel="noopener" style="color:#0f766e;text-decoration:none;">${appUrl().replace(/^https?:\/\//, "")}</a>
    </p>
    <p style="color:#94a3b8;font-size:11px;margin:0;line-height:1.6;">
      Questions? <a href="mailto:${supportEmail()}" style="color:#94a3b8;text-decoration:underline;">${supportEmail()}</a>${line ? `<br>${line}` : ""}
    </p>
  </td></tr>`;

const logSent = (info, email) => {
  if (isEtherealMode()) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("\n[emailService] ✅ Test email sent!");
    console.log(`[emailService] 📧 To:      ${email}`);
    console.log(`[emailService] 👉 Preview: ${previewUrl}\n`);
  } else {
    console.log(`[emailService] ✅ Email sent to ${email}`);
  }
};


// ── Resume with PDF + DOCX attachments ───────────────────────
export const sendAdminResumeCopy = async ({ name, email, resumeTitle, resumeData, note }) => {
  if (!email) return { sent: false, reason: "no_email" };
  const transporter = await getTransporter();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
  <tr><td align="center">
    <table cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;max-width:620px;width:100%;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      ${emailHeader("Support copy of your updated resume")}
      <tr><td style="padding:34px 38px;">
        <p style="color:#1e293b;font-size:16px;margin:0 0 16px;">Hi <strong>${name || "there"}</strong>,</p>
        <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 18px;">
          We are sending your latest generated resume content from ResumeAlignAI. This helps if your payment was successful but your browser session timed out before you could download.
        </p>
        ${note ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;color:#334155;font-size:13px;line-height:1.6;margin:0 0 20px;padding:14px 16px;"><strong>Support note:</strong> ${note}</div>` : ""}
        ${buildResumeSection(resumeData)}
        ${websiteCta()}
        ${contactBlock()}
      </td></tr>
      ${emailFooter()}
    </table>
  </td></tr>
</table>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: fromAddress(),
      replyTo: replyToAddress(),
      to: email,
      subject: `ResumeAlignAI Support Copy - ${resumeTitle || "Your Resume"}`,
      html
    });
    logSent(info, email);
    return { sent: true };
  } catch (err) {
    console.error("[emailService] Admin resume copy failed:", err.message);
    return { sent: false, reason: err.message };
  }
};

// ── Payment confirmation (no attachments) ───────────────────
const buildConfirmationHtml = ({ name, resumeTitle, amountRs, paymentId }) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
  <tr><td align="center">
    <table cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;max-width:580px;width:100%;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      ${emailHeader("Payment confirmed &mdash; your resume is unlocked")}
      <tr><td style="padding:36px 40px;">
        <p style="color:#1e293b;font-size:16px;margin:0 0 16px;">Hi <strong>${name || "there"}</strong>,</p>
        <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 22px;">
          Thank you for your payment of <strong>Rs.${amountRs}</strong>. Your premium ATS-optimised resume for <strong>${resumeTitle || "your target role"}</strong> has been unlocked. Return to the ResumeAlignAI tab to download your PDF and DOCX files.
        </p>

        <div style="background:#f0fdf9;border:1px solid #99f6e4;border-radius:10px;padding:20px 24px;margin:0 0 22px;">
          <p style="color:#0f766e;font-size:13px;font-weight:700;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.05em;">Payment Summary</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="color:#475569;font-size:14px;padding:3px 0;">Target Role</td>
              <td style="color:#134e4a;font-size:14px;font-weight:600;text-align:right;">${resumeTitle || "Your Resume"}</td>
            </tr>
            <tr>
              <td style="color:#475569;font-size:14px;padding:3px 0;">Amount Paid</td>
              <td style="color:#134e4a;font-size:14px;font-weight:600;text-align:right;">Rs.${amountRs}</td>
            </tr>
            <tr>
              <td style="color:#475569;font-size:14px;padding:3px 0;">Payment ID</td>
              <td style="color:#134e4a;font-size:12px;font-family:monospace;text-align:right;">${paymentId || "—"}</td>
            </tr>
            <tr>
              <td style="color:#475569;font-size:14px;padding:3px 0;">Status</td>
              <td style="color:#0f766e;font-size:14px;font-weight:700;text-align:right;">&#10003; Confirmed</td>
            </tr>
          </table>
        </div>

        <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 18px;">
          If your session timed out before downloading, reply to this email with your payment ID and our support team will resend the files.
        </p>

        ${websiteCta()}
        ${contactBlock()}
      </td></tr>
      ${emailFooter()}
    </table>
  </td></tr>
</table>
</body>
</html>`;

export const sendPaymentConfirmation = async ({ name, email, resumeTitle, amount, orderId, paymentId }) => {
  if (!email) return { sent: false, reason: "no_email" };
  try {
    const transporter = await getTransporter();
    const amountRs = Math.round((amount || 5100) / 100);

    const info = await transporter.sendMail({
      from: fromAddress(),
      replyTo: replyToAddress(),
      to: email,
      subject: `Payment Confirmed - ResumeAlignAI Premium (Rs.${amountRs})`,
      html: buildConfirmationHtml({ name, resumeTitle, amountRs, paymentId })
    });
    logSent(info, email);
    return { sent: true };
  } catch (err) {
    console.error("[emailService] Payment confirmation failed:", err.message);
    return { sent: false, reason: err.message };
  }
};

export const verifyEmailTransport = async () => {
  const transporter = await getTransporter();
  await transporter.verify();
  return true;
};

const buildAttachmentsHtml = ({ name, resumeTitle, amountRs }) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
  <tr><td align="center">
    <table cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;max-width:580px;width:100%;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      ${emailHeader("Payment confirmed &mdash; your resume files are attached!")}
      <tr><td style="padding:36px 40px;">
        <p style="color:#1e293b;font-size:16px;margin:0 0 16px;">Hi <strong>${name || "there"}</strong>,</p>
        <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Thank you for your payment of <strong>Rs.${amountRs}</strong>. Your AI-generated, ATS-optimised resume for <strong>${resumeTitle || "your target role"}</strong> is attached in both <strong>PDF</strong> and <strong>DOCX</strong> formats.
        </p>

        <div style="background:#f0fdf9;border:1px solid #99f6e4;border-radius:10px;padding:20px 24px;margin:0 0 20px;">
          <p style="color:#0f766e;font-size:13px;font-weight:700;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.05em;">Payment Summary</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="color:#475569;font-size:14px;padding:3px 0;">Target Role</td>
              <td style="color:#134e4a;font-size:14px;font-weight:600;text-align:right;">${resumeTitle || "Your Resume"}</td>
            </tr>
            <tr>
              <td style="color:#475569;font-size:14px;padding:3px 0;">Amount Paid</td>
              <td style="color:#134e4a;font-size:14px;font-weight:600;text-align:right;">Rs.${amountRs}</td>
            </tr>
            <tr>
              <td style="color:#475569;font-size:14px;padding:3px 0;">Status</td>
              <td style="color:#0f766e;font-size:14px;font-weight:700;text-align:right;">&#10003; Confirmed</td>
            </tr>
          </table>
        </div>

        <div style="background:#f0fdf9;border:1px solid #99f6e4;border-radius:10px;padding:20px 24px;margin:0 0 20px;">
          <p style="color:#0f766e;font-size:13px;font-weight:700;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">Attached files</p>
          <div style="margin-bottom:8px;">
            <span style="background:#e0f2fe;color:#0369a1;font-size:12px;font-weight:700;padding:3px 8px;border-radius:4px;">PDF</span>
            <span style="color:#334155;font-size:13px;margin-left:8px;">${(resumeTitle || "resume").replace(/[^a-z0-9]/gi, "_")}_Resume.pdf — best for job applications</span>
          </div>
          <div>
            <span style="background:#ede9fe;color:#6d28d9;font-size:12px;font-weight:700;padding:3px 8px;border-radius:4px;">DOCX</span>
            <span style="color:#334155;font-size:13px;margin-left:8px;">${(resumeTitle || "resume").replace(/[^a-z0-9]/gi, "_")}_Resume.docx — editable in Word or Google Docs</span>
          </div>
        </div>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:0 0 24px;">
          <p style="color:#92400e;font-size:14px;font-weight:700;margin:0 0 6px;">Tips before applying</p>
          <ol style="color:#78350f;font-size:13px;line-height:1.7;margin:0;padding-left:18px;">
            <li>Double-check all names, dates, and contact details</li>
            <li>Use the <strong>PDF version</strong> for online job applications</li>
            <li>Use the <strong>DOCX version</strong> if the employer asks for an editable file</li>
            <li>Return to ResumeAlignAI to switch templates and re-download anytime</li>
          </ol>
        </div>

        ${websiteCta()}
        ${contactBlock()}
      </td></tr>
      ${emailFooter("You received this because you made a purchase on ResumeAlignAI.")}
    </table>
  </td></tr>
</table>
</body>
</html>`;

export const sendResumeWithAttachments = async ({ name, email, resumeTitle, pdfBase64, docxBase64, amount }) => {
  if (!email) return { sent: false, reason: "no_email" };
  const transporter = await getTransporter();
  const amountRs = Math.round((amount || 5100) / 100);

  const safeName = (resumeTitle || "resume").replace(/[^a-z0-9]/gi, "_");
  const attachments = [];

  if (pdfBase64) {
    attachments.push({
      filename: `${safeName}_Resume.pdf`,
      content: Buffer.from(pdfBase64, "base64"),
      contentType: "application/pdf"
    });
  }
  if (docxBase64) {
    attachments.push({
      filename: `${safeName}_Resume.docx`,
      content: Buffer.from(docxBase64, "base64"),
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress(),
      replyTo: replyToAddress(),
      to: email,
      subject: `✅ Payment Confirmed + Your Resume Files — ResumeAlignAI`,
      html: buildAttachmentsHtml({ name, resumeTitle, amountRs }),
      attachments
    });
    logSent(info, email);
    return { sent: true };
  } catch (err) {
    console.error("[emailService] ❌ Attachments send failed:", err.message);
    return { sent: false, reason: err.message };
  }
};

/* ─── Referral emails ─────────────────────────────────────── */

const escapeHtml = (s) =>
  String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Gmail's classifier bins emails with big CTAs, gradient buttons, pricing
// tables, and "Special Offer" badges into the Promotions tab. The referral
// invite is meant to look like a forwarded personal note, not a marketing
// blast — so this template uses minimal formatting (one inline link, plain
// paragraphs, no images/buttons/tables) and ships with a text/plain
// alternative. Combined with the Reply-To being the referrer's actual
// email, this lands in Primary much more reliably.
const buildReferralInviteText = ({ referrerName, friendName, personalNote }) => {
  const lines = [];
  lines.push(`Hi ${friendName || "there"},`);
  lines.push("");
  lines.push(`${referrerName || "A friend"} thought you might find this useful — they recently used ResumeAlignAI to tailor their resume to a specific job posting and it landed them an interview.`);
  if (personalNote) {
    lines.push("");
    lines.push(`Their note: ${personalNote}`);
  }
  lines.push("");
  lines.push("If you're job hunting too, the link is below. You paste a job description, the AI rewrites your bullets to match it, and you get an ATS-friendly PDF. Takes about five minutes.");
  lines.push("");
  lines.push(`${appUrl()}/builder`);
  lines.push("");
  lines.push(`If you reply to this email it goes straight to ${referrerName || "your friend"}.`);
  lines.push("");
  lines.push("— sent on behalf of " + (referrerName || "a friend") + " via ResumeAlignAI");
  return lines.join("\n");
};

const buildReferralInviteHtml = ({ referrerName, friendName, personalNote }) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#ffffff;color:#1e293b;font-family:-apple-system,'Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.6;">
<div style="max-width:560px;margin:0 auto;">
<p>Hi ${escapeHtml(friendName) || "there"},</p>
<p>${escapeHtml(referrerName) || "A friend"} thought you might find this useful &mdash; they recently used ResumeAlignAI to tailor their resume to a specific job posting and it landed them an interview.</p>
${personalNote ? `<p>Their note:</p><blockquote style="margin:0 0 16px;padding:0 0 0 14px;border-left:3px solid #cbd5e1;color:#475569;">${escapeHtml(personalNote)}</blockquote>` : ""}
<p>If you're job hunting too, the link is below. You paste a job description, the AI rewrites your bullets to match it, and you get an ATS-friendly PDF. Takes about five minutes.</p>
<p><a href="${appUrl()}/builder" style="color:#0f766e;">${appUrl()}/builder</a></p>
<p>If you reply to this email it goes straight to ${escapeHtml(referrerName) || "your friend"}.</p>
<p style="color:#64748b;font-size:13px;">&mdash; sent on behalf of ${escapeHtml(referrerName) || "a friend"} via ResumeAlignAI</p>
</div>
</body></html>`;

const buildReferralConfirmationText = ({ referrerName, friendName, friendEmail }) =>
`Hi ${referrerName || "there"},

Your referral note to ${friendName || friendEmail} (${friendEmail}) just went out. They'll see it in their inbox shortly.

If they reply, it will land in your inbox directly — we set Reply-To to your email.

Thanks for spreading the word.

— ResumeAlignAI`;

const buildReferralConfirmationHtml = ({ referrerName, friendName, friendEmail }) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#ffffff;color:#1e293b;font-family:-apple-system,'Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.6;">
<div style="max-width:540px;margin:0 auto;">
<p>Hi ${escapeHtml(referrerName) || "there"},</p>
<p>Your referral note to <strong>${escapeHtml(friendName) || escapeHtml(friendEmail)}</strong> (${escapeHtml(friendEmail)}) just went out. They'll see it in their inbox shortly.</p>
<p>If they reply, it will land in your inbox directly &mdash; we set Reply-To to your email.</p>
<p>Thanks for spreading the word.</p>
<p style="color:#64748b;font-size:13px;">&mdash; ResumeAlignAI</p>
</div>
</body></html>`;

export const sendReferralInvite = async ({ referrerName, referrerEmail, friendName, friendEmail, personalNote }) => {
  if (!friendEmail) return { sent: false, reason: "no_friend_email" };
  try {
    const transporter = await getTransporter();
    // Personal subject (no marketing words like "free", "offer", "deal").
    // Including the recipient's first name lifts Primary-tab placement.
    const subject = friendName
      ? `${friendName}, ${referrerName || "a friend"} sent you this`
      : `${referrerName || "A friend"} sent you a resume tool`;
    const info = await transporter.sendMail({
      from: fromAddress(),
      replyTo: referrerEmail || replyToAddress(),
      to: friendEmail,
      subject,
      text: buildReferralInviteText({ referrerName, friendName, personalNote }),
      html: buildReferralInviteHtml({ referrerName, friendName, personalNote }),
      headers: {
        // Marks this as a personal/transactional message, not bulk. Gmail
        // considers Auto-Submitted: no + presence of List-Unsubscribe as
        // a Primary-tab signal.
        "Auto-Submitted": "no",
        "X-Entity-Ref-ID": `referral-${Date.now()}`
      }
    });
    logSent(info, friendEmail);
    return { sent: true };
  } catch (err) {
    console.error("[emailService] Referral invite failed:", err.message);
    return { sent: false, reason: err.message };
  }
};

export const sendReferralConfirmation = async ({ referrerName, referrerEmail, friendName, friendEmail }) => {
  if (!referrerEmail) return { sent: false, reason: "no_referrer_email" };
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: fromAddress(),
      replyTo: replyToAddress(),
      to: referrerEmail,
      subject: `Your note to ${friendName || friendEmail} was sent`,
      text: buildReferralConfirmationText({ referrerName, friendName, friendEmail }),
      html: buildReferralConfirmationHtml({ referrerName, friendName, friendEmail }),
      headers: {
        "Auto-Submitted": "no",
        "X-Entity-Ref-ID": `referral-confirm-${Date.now()}`
      }
    });
    logSent(info, referrerEmail);
    return { sent: true };
  } catch (err) {
    console.error("[emailService] Referral confirmation failed:", err.message);
    return { sent: false, reason: err.message };
  }
};
