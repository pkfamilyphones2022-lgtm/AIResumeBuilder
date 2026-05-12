import nodemailer from "nodemailer";

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

// ── Real SMTP transporter ────────────────────────────────────
const getRealTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
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
  if (isEtherealMode()) return getEtherealTransporter();

  const t = getRealTransporter();
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
      <tr><td style="background:linear-gradient(135deg,#0f766e 0%,#0d9488 100%);padding:30px 38px;text-align:center;">
        <div style="background:#fff;border-radius:10px;color:#0f766e;display:inline-block;font-size:18px;font-weight:800;height:44px;line-height:44px;width:44px;margin-bottom:14px;">R</div>
        <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">ResumeAlignAI</h1>
        <p style="color:rgba(255,255,255,0.88);font-size:14px;margin:0;">Support copy of your updated resume</p>
      </td></tr>
      <tr><td style="padding:34px 38px;">
        <p style="color:#1e293b;font-size:16px;margin:0 0 16px;">Hi <strong>${name || "there"}</strong>,</p>
        <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 18px;">
          We are sending your latest generated resume content from ResumeAlignAI. This helps if your payment was successful but your browser session timed out before you could download.
        </p>
        ${note ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;color:#334155;font-size:13px;line-height:1.6;margin:0 0 20px;padding:14px 16px;"><strong>Support note:</strong> ${note}</div>` : ""}
        ${buildResumeSection(resumeData)}
        <p style="color:#94a3b8;font-size:13px;margin:24px 0 0;line-height:1.6;">
          Questions? Email us at
          <a href="mailto:supportresumealign@gmail.com" style="color:#0f766e;text-decoration:none;">supportresumealign@gmail.com</a>.
        </p>
      </td></tr>
      <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 38px;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">&copy; 2026 ResumeAlignAI</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: fromAddress(),
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

const buildAttachmentsHtml = ({ name, resumeTitle, amountRs }) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
  <tr><td align="center">
    <table cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;max-width:580px;width:100%;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:linear-gradient(135deg,#0f766e 0%,#0d9488 100%);padding:32px 40px;text-align:center;">
        <div style="background:#fff;border-radius:10px;color:#0f766e;display:inline-block;font-size:18px;font-weight:800;height:44px;line-height:44px;width:44px;margin-bottom:14px;">R</div>
        <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">ResumeAlignAI</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Payment confirmed — your resume files are attached!</p>
      </td></tr>
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

        <p style="color:#94a3b8;font-size:13px;margin:0;line-height:1.6;">
          Questions? Email us at
          <a href="mailto:supportresumealign@gmail.com" style="color:#0f766e;text-decoration:none;">supportresumealign@gmail.com</a>
        </p>
      </td></tr>
      <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
          &copy; 2026 ResumeAlignAI<br>
          You received this because you made a purchase on ResumeAlignAI.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

export const sendResumeWithAttachments = async ({ name, email, resumeTitle, pdfBase64, docxBase64, amount }) => {
  if (!email) return { sent: false, reason: "no_email" };
  const transporter = await getTransporter();
  const amountRs = Math.round((amount || 6900) / 100);

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
