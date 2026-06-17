import React from "react";
import { ChevronLeft, Mail, Moon, ShieldCheck, Sun } from "lucide-react";
import BrandMark from "./BrandMark.jsx";

const SUPPORT_EMAIL = "support@resumealignai.online";

export default function PrivacyPolicy({ onBack, theme, onToggleTheme }) {
  return (
    <div className="privacy-page">
      <header className="privacy-hero">
        <nav className="builder-brandbar">
          <button className="brand-lockup builder-brand-lockup brand-home-link" onClick={onBack} title="Go to home">
            <BrandMark />
            <div>
              <p>ResumeAlignAI <span className="brand-premium-badge">Premium</span></p>
              <span>Privacy &amp; Data Protection</span>
            </div>
          </button>
          <div className="builder-brandbar-actions">
            {onToggleTheme && (
              <button
                className="theme-toggle"
                onClick={onToggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            <button className="builder-back-button" onClick={onBack}>
              <ChevronLeft aria-hidden="true" />
              Back to Home
            </button>
          </div>
        </nav>

        <div className="privacy-hero-copy">
          <span className="privacy-badge">
            <ShieldCheck size={14} /> DPDP Act 2023 aligned
          </span>
          <h1>Privacy Policy</h1>
          <p>Last updated: June 2, 2026</p>
          <p className="privacy-lede">
            ResumeAlignAI is operated as a premium AI resume service. This policy explains what personal data we collect,
            why we collect it, how long we keep it, and how you can ask us to delete it.
          </p>
        </div>
      </header>

      <main className="privacy-body">
        <section>
          <h2>1. Who we are</h2>
          <p>
            ResumeAlignAI ("we", "us") is a premium AI resume generation service. For any privacy question, write to
            {" "}<a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        </section>

        <section>
          <h2>2. What we collect</h2>
          <p>When you build a resume with us, you give us:</p>
          <ul>
            <li><strong>Identity &amp; contact</strong> — name, email, phone, location, LinkedIn/portfolio URLs.</li>
            <li><strong>Career details</strong> — target role, target company, current company, seniority, years of experience, industry.</li>
            <li><strong>Resume content</strong> — work history, projects, education, training, certifications, skills, languages, achievements, objective.</li>
            <li><strong>Optional uploads</strong> — the text of a PDF resume you upload (the PDF file itself is not retained).</li>
            <li><strong>Payment metadata</strong> — Razorpay order/payment IDs, amount, status. We never receive or store your card details; Razorpay handles them.</li>
            <li><strong>Service logs</strong> — IP-based rate-limit counters, AI token usage attributed to your resume, email delivery status, and download events.</li>
          </ul>
          <p>
            <strong>What we do not collect:</strong> we do not store the job description text you paste during generation,
            we do not store the rendered PDF or DOCX files, and we do not require an account/password.
          </p>
        </section>

        <section>
          <h2>3. Why we collect it</h2>
          <ul>
            <li>To generate, refine, score, preview, and deliver your resume.</li>
            <li>To process your Rs.51 premium unlock through Razorpay and email a payment confirmation.</li>
            <li>To allow our support team to resend a paid resume if your browser session timed out before download.</li>
            <li>To produce aggregate business metrics for the admin dashboard (revenue, AI cost, downloads).</li>
            <li>To prevent abuse (rate limiting, signed challenge, honeypot field).</li>
          </ul>
        </section>

        <section>
          <h2>4. Who we share it with</h2>
          <p>
            We share the minimum data required with the following processors, and only for the purposes listed:
          </p>
          <ul>
            <li><strong>Razorpay</strong> — payment processing.</li>
            <li><strong>DeepSeek / Groq / Anthropic</strong> — your resume content and target role are sent to one or more AI providers
              at generation time so the model can rewrite your resume. We use whichever provider is available; details are listed in our admin pricing page.</li>
            <li><strong>Gmail SMTP</strong> — payment confirmation and resume delivery emails are sent through Google's SMTP servers.</li>
          </ul>
          <p>We do not sell, rent, or trade your personal data with anyone.</p>
        </section>

        <section>
          <h2>5. How long we keep it</h2>
          <p>
            We retain resume content and identity records for as long as needed to support our customers after purchase
            (typically up to 24 months), unless you ask us to delete it earlier. Aggregated/anonymised metrics
            (counts of resumes, revenue, AI cost) may be kept longer for business reporting.
          </p>
        </section>

        <section>
          <h2>6. Your rights</h2>
          <p>Under India's DPDP Act 2023 and applicable global laws, you have the right to:</p>
          <ul>
            <li><strong>Access</strong> a copy of the data we hold about you.</li>
            <li><strong>Correct</strong> inaccurate information.</li>
            <li><strong>Erase</strong> your data (the "right to be forgotten").</li>
            <li><strong>Withdraw consent</strong> for further processing.</li>
            <li><strong>Complain</strong> to the Data Protection Board of India if you feel we have mishandled your data.</li>
          </ul>
        </section>

        <section className="privacy-deletion">
          <h2>7. Delete my data</h2>
          <p>
            To delete all data associated with your email address — resume content, payment history, AI usage logs,
            download records, and email logs — send a message to
            {" "}<a href={`mailto:${SUPPORT_EMAIL}?subject=Delete%20my%20ResumeAlignAI%20data`}>{SUPPORT_EMAIL}</a>{" "}
            from the email address you used at sign-up.
          </p>
          <p>
            Include the subject line <em>"Delete my ResumeAlignAI data"</em>. Our team will verify the request and
            process the deletion within <strong>7 working days</strong>. Once deleted, the action is irreversible
            and any unused premium download will be lost.
          </p>
        </section>

        <section>
          <h2>8. Security</h2>
          <p>
            All traffic is served over HTTPS. We use signed access tokens to protect paid downloads, timing-safe
            comparisons for payment signatures, rate limiting on generation and admin routes, and a server-side
            anti-bot challenge before any AI request is made. Our admin dashboard is gated by a 64-character secret token.
          </p>
        </section>

        <section>
          <h2>9. Changes to this policy</h2>
          <p>
            We may update this policy as our service evolves. Material changes will be reflected by updating the
            "Last updated" date at the top of this page.
          </p>
        </section>

        <section className="privacy-contact">
          <h2>10. Contact</h2>
          <p>
            <Mail size={16} aria-hidden="true" />
            {" "}<a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
          <button className="hero-primary" onClick={onBack}>
            Back to Home
          </button>
        </section>
      </main>
    </div>
  );
}
