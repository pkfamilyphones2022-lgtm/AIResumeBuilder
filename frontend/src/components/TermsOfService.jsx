import React from "react";
import { ChevronLeft, FileText, Mail, Moon, Sun } from "lucide-react";
import BrandMark from "./BrandMark.jsx";

const SUPPORT_EMAIL = "support@resumealignai.online";

export default function TermsOfService({ onBack, theme, onToggleTheme }) {
  return (
    <div className="privacy-page">
      <header className="privacy-hero">
        <nav className="builder-brandbar">
          <button className="brand-lockup builder-brand-lockup brand-home-link" onClick={onBack} title="Go to home">
            <BrandMark />
            <div>
              <p>ResumeAlignAI <span className="brand-premium-badge">Premium</span></p>
              <span>Terms of Service</span>
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
            <FileText size={14} /> Plain-English terms
          </span>
          <h1>Terms of Service</h1>
          <p>Last updated: June 14, 2026</p>
          <p className="privacy-lede">
            These terms set out the rules for using ResumeAlignAI. By using the service you agree to these terms. We have
            tried to keep them short and human-readable.
          </p>
        </div>
      </header>

      <main className="privacy-body">
        <section>
          <h2>1. Who we are</h2>
          <p>
            ResumeAlignAI ("the service", "we", "us") is an AI-powered resume builder operated from India. Contact:
            {" "}<a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        </section>

        <section>
          <h2>2. What the service does</h2>
          <p>
            ResumeAlignAI generates an ATS-aligned resume from your inputs (career details, optional uploaded resume,
            optional job description). It scores the result against a target job description, lets you preview and edit
            the content, and unlocks a one-time download of the PDF and DOCX after a Rs.69 payment.
          </p>
        </section>

        <section>
          <h2>3. Eligibility</h2>
          <p>
            You must be 18 years or older to use this service. By signing up and paying, you confirm that the personal and
            career details you provide are accurate and belong to you.
          </p>
        </section>

        <section>
          <h2>4. Acceptable use</h2>
          <p>You agree to use ResumeAlignAI only for genuine personal job-search purposes. You will not:</p>
          <ul>
            <li>Submit false or misleading career history that misrepresents another person.</li>
            <li>Scrape, bulk-generate, or resell resumes generated through the service.</li>
            <li>Bypass or attempt to bypass our rate limits, security challenge, payment flow, or download token.</li>
            <li>Reverse-engineer, decompile, or attempt to extract source code of the service.</li>
            <li>Use the service to generate content that is unlawful, discriminatory, or harmful.</li>
          </ul>
          <p>We may suspend access for any account or email address that violates these rules.</p>
        </section>

        <section>
          <h2>5. Payment, pricing, and refunds</h2>
          <p>
            The current price is <strong>Rs.69</strong> per resume download, processed through Razorpay. Pricing may change
            in future for new customers but the price displayed at checkout is what you will be charged. Refund rules are
            described in our separate <a href="/refund-policy">Refund Policy</a>.
          </p>
        </section>

        <section>
          <h2>6. Content ownership</h2>
          <p>
            <strong>Your inputs.</strong> You own the career details and resume content you submit. We use them only to
            generate your resume and to keep service records as described in our <a href="/privacy">Privacy Policy</a>.
          </p>
          <p>
            <strong>Generated content.</strong> Once you pay and download, you have a perpetual right to use the
            AI-generated resume for your own job applications. You may not republish it as a template, sell it, or claim
            authorship of the underlying generation logic.
          </p>
          <p>
            <strong>Our platform.</strong> The ResumeAlignAI name, design, templates, prompts, scoring algorithm, and code
            are owned by us. You may not copy, redistribute, or reuse them.
          </p>
        </section>

        <section>
          <h2>7. AI-generated content disclaimer</h2>
          <p>
            ResumeAlignAI uses third-party AI providers (DeepSeek, Groq, Anthropic) to generate resume content. While we
            score and refine the output for ATS alignment, AI can occasionally produce inaccurate phrasing or miss context.
            <strong> You are responsible for reviewing every section of your generated resume before sending it to a
            recruiter or applying for a job.</strong>
          </p>
        </section>

        <section>
          <h2>8. Service availability</h2>
          <p>
            We aim for high uptime but do not guarantee uninterrupted access. AI providers, payment gateways, and email
            delivery depend on third-party services that may have outages. If our service is unavailable during your
            payment, you are entitled to a full refund under the <a href="/refund-policy">Refund Policy</a>.
          </p>
        </section>

        <section>
          <h2>9. Limitation of liability</h2>
          <p>
            ResumeAlignAI does not guarantee job interviews, callbacks, or job offers. We are not responsible for hiring
            decisions made by recruiters or for outcomes that depend on factors beyond the resume itself. Our maximum
            liability for any single customer is limited to the amount that customer has paid to us in the previous 12
            months, capped at Rs.5,000.
          </p>
        </section>

        <section>
          <h2>10. Data handling</h2>
          <p>
            How we collect, use, store, share, and delete your data is described in our <a href="/privacy">Privacy Policy</a>.
            By using the service you also agree to that policy.
          </p>
        </section>

        <section>
          <h2>11. Changes to these terms</h2>
          <p>
            We may update these terms when the service changes. Material changes will be reflected by updating the
            "Last updated" date at the top of this page. Continued use of the service after a change means you accept the
            updated terms.
          </p>
        </section>

        <section>
          <h2>12. Governing law and jurisdiction</h2>
          <p>
            These terms are governed by the laws of India. Any dispute that cannot be resolved by writing to our support
            team within 30 days will be subject to the exclusive jurisdiction of the courts in Maharashtra, India.
          </p>
        </section>

        <section className="privacy-contact">
          <h2>13. Contact</h2>
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
