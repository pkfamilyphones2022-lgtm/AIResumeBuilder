import React from "react";
import { ChevronLeft, Mail, RotateCcw } from "lucide-react";

const SUPPORT_EMAIL = "resumealignai@resumealignai.online";

export default function RefundPolicy({ onBack }) {
  return (
    <div className="privacy-page">
      <header className="privacy-hero">
        <nav className="builder-brandbar">
          <button className="brand-lockup builder-brand-lockup brand-home-link" onClick={onBack} title="Go to home">
            <span className="brand-mark">R</span>
            <div>
              <p>ResumeAlignAI <span className="brand-premium-badge">Premium</span></p>
              <span>Refund &amp; Cancellation Policy</span>
            </div>
          </button>
          <button className="builder-back-button" onClick={onBack}>
            <ChevronLeft aria-hidden="true" />
            Back to Home
          </button>
        </nav>

        <div className="privacy-hero-copy">
          <span className="privacy-badge">
            <RotateCcw size={14} /> Customer-friendly refunds
          </span>
          <h1>Refund Policy</h1>
          <p>Last updated: June 14, 2026</p>
          <p className="privacy-lede">
            We want you to be completely satisfied with your ResumeAlignAI premium resume. If something goes wrong with
            your download or the file does not meet a reasonable quality standard, we will refund you in full.
          </p>
        </div>
      </header>

      <main className="privacy-body">
        <section>
          <h2>1. What you are paying for</h2>
          <p>
            The Rs.69 unlock fee gives you a one-time download of your AI-generated resume in both PDF and DOCX formats,
            optional email delivery of the same files, and the right to use the generated content for your own job applications.
            Payment is processed by Razorpay; we never store your card details.
          </p>
        </section>

        <section>
          <h2>2. When you are eligible for a full refund</h2>
          <p>You qualify for a 100% refund if any of the following apply:</p>
          <ul>
            <li><strong>Payment deducted, download not unlocked.</strong> Your bank shows a charge but the download button stays locked.</li>
            <li><strong>Generated file fails to open.</strong> The PDF or DOCX is corrupted or unreadable in Adobe Reader, Microsoft Word, Google Docs, or LibreOffice.</li>
            <li><strong>Empty or broken content.</strong> The resume content is missing the data you submitted, contains placeholder text like &ldquo;Lorem Ipsum&rdquo;, or has obvious formatting errors that make it unusable.</li>
            <li><strong>Duplicate charge.</strong> Razorpay charged you twice for the same resume by mistake — refund of the duplicate, not the original.</li>
            <li><strong>Service downtime during payment.</strong> Our server or the AI provider was down at the time you paid and you cannot retrieve the resume.</li>
          </ul>
        </section>

        <section>
          <h2>3. When a refund will not be issued</h2>
          <p>The following are not eligible for refund:</p>
          <ul>
            <li>You changed your mind after a successful download.</li>
            <li>You disagree with the AI&apos;s wording but the file is valid and downloadable. (You can regenerate or use the "Enhance more" button to refine the content instead.)</li>
            <li>You did not get an interview or job after sending the resume to recruiters. ResumeAlignAI cannot guarantee recruiter response.</li>
            <li>Your ATS score is below the target you wanted. ATS scoring depends on the job description and your inputs; use "Enhance more" to push it higher.</li>
            <li>You uploaded an old PDF with corrupted text and the AI could not parse it correctly. We recommend filling the form manually in that case.</li>
            <li>Refund requests made after <strong>7 days</strong> from the payment date.</li>
          </ul>
        </section>

        <section>
          <h2>4. How to request a refund</h2>
          <p>
            Email <a href={`mailto:${SUPPORT_EMAIL}?subject=Refund%20Request%20for%20ResumeAlignAI`}>{SUPPORT_EMAIL}</a> from
            the email address you used at payment, including:
          </p>
          <ul>
            <li>Your <strong>Razorpay Payment ID</strong> (starts with <code>pay_</code>). You can find it in your payment confirmation email or your bank SMS.</li>
            <li>The reason for the refund (one or two lines is enough).</li>
            <li>A screenshot of the issue if applicable (locked download, corrupted file, etc.).</li>
          </ul>
          <p>
            Our support team will respond within <strong>24 hours</strong> on business days. Verified refund requests are
            processed within <strong>5–7 business days</strong> and the amount is credited back to the original payment method.
          </p>
        </section>

        <section>
          <h2>5. Cancellation</h2>
          <p>
            ResumeAlignAI is a one-time purchase — there is no subscription, recurring charge, or auto-renewal to cancel.
            Each resume generation is paid for individually.
          </p>
        </section>

        <section>
          <h2>6. Chargebacks</h2>
          <p>
            Please write to us before initiating a chargeback through your bank. We are happy to resolve most issues
            directly and a bank-initiated chargeback can take 30–90 days, where contacting us takes 5–7 days. If a
            chargeback is opened, we will provide Razorpay with the payment evidence and may suspend the associated email
            address from future purchases.
          </p>
        </section>

        <section className="privacy-deletion">
          <h2>7. Generated content ownership</h2>
          <p>
            After a refund is issued for a resume, you agree not to use the AI-generated content of that specific resume
            in job applications. The download token is invalidated server-side and the corresponding resume row is marked
            as refunded in our records.
          </p>
        </section>

        <section className="privacy-contact">
          <h2>8. Contact</h2>
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
