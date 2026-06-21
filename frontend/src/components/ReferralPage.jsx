import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronLeft, Gift, Mail, Send, Sparkles, Users } from "lucide-react";
import BrandMark from "./BrandMark.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ReferralPage({ onBack }) {
  const [form, setForm] = useState({
    referrerName: "",
    referrerEmail: "",
    friendName: "",
    friendEmail: "",
    personalNote: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const set = (field, value) => setForm((c) => ({ ...c, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.referrerName.trim() || !form.referrerEmail.trim() || !form.friendEmail.trim()) {
      setError("Please fill in your name, your email, and your friend's email.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/referral/send`, form);
      setSuccessMessage(data?.message || `Invite sent to ${form.friendEmail}.`);
      setForm({ ...form, friendName: "", friendEmail: "", personalNote: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Could not send the referral. Please try again in a minute.");
    } finally {
      setSubmitting(false);
    }
  };

  const sendAnother = () => {
    setSuccessMessage("");
  };

  return (
    <div className="referral-page">
      <header className="referral-hero">
        <nav className="builder-brandbar">
          <button className="brand-lockup builder-brand-lockup brand-home-link" onClick={onBack} title="Go to home">
            <BrandMark />
            <div>
              <p>ResumeAlignAI <span className="brand-premium-badge">Premium</span></p>
              <span>Refer &amp; help a friend</span>
            </div>
          </button>
          <div className="builder-brandbar-actions">
            <button className="builder-back-button" onClick={onBack}>
              <ChevronLeft aria-hidden="true" />
              Back to Home
            </button>
          </div>
        </nav>

        <div className="referral-hero-copy">
          <span className="referral-badge">
            <Gift size={14} /> Help a friend land their next role
          </span>
          <h1>Refer ResumeAlignAI to a friend who's job hunting.</h1>
          <p className="referral-lede">
            Drop their name and email below. We'll send them a warm intro from you — no spam, no follow-ups,
            no sneaky drip campaigns. One email, one chance to help.
          </p>
        </div>
      </header>

      <main className="referral-body">
        <section className="referral-form-card">
          <AnimatePresence mode="wait">
            {successMessage ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="referral-success"
              >
                <div className="referral-success-icon">
                  <CheckCircle2 size={36} />
                </div>
                <h2>Invite on its way!</h2>
                <p>{successMessage}</p>
                <p className="referral-success-sub">
                  We've also sent you a quick confirmation at <strong>{form.referrerEmail}</strong>.
                </p>
                <div className="referral-success-actions">
                  <button className="referral-secondary" onClick={sendAnother} type="button">
                    Refer another friend
                  </button>
                  <button className="referral-primary" onClick={onBack} type="button">
                    Back to Home
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                onSubmit={submit}
                className="referral-form"
              >
                <div className="referral-form-section">
                  <div className="referral-form-section-head">
                    <Users size={18} />
                    <div>
                      <strong>About you</strong>
                      <span>We use your name in the email so it feels personal, not spammy.</span>
                    </div>
                  </div>
                  <div className="referral-grid">
                    <label>
                      <span className="referral-label">Your name <span className="referral-required">*</span></span>
                      <input
                        type="text"
                        value={form.referrerName}
                        onChange={(e) => set("referrerName", e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        maxLength={120}
                        required
                      />
                    </label>
                    <label>
                      <span className="referral-label">Your email <span className="referral-required">*</span></span>
                      <input
                        type="email"
                        value={form.referrerEmail}
                        onChange={(e) => set("referrerEmail", e.target.value)}
                        placeholder="you@example.com"
                        maxLength={254}
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="referral-form-section">
                  <div className="referral-form-section-head">
                    <Mail size={18} />
                    <div>
                      <strong>Your friend's details</strong>
                      <span>We'll send one warm intro email. We won't add them to a list or email them again.</span>
                    </div>
                  </div>
                  <div className="referral-grid">
                    <label>
                      <span className="referral-label">Friend's name</span>
                      <input
                        type="text"
                        value={form.friendName}
                        onChange={(e) => set("friendName", e.target.value)}
                        placeholder="e.g. Arjun"
                        maxLength={120}
                      />
                    </label>
                    <label>
                      <span className="referral-label">Friend's email <span className="referral-required">*</span></span>
                      <input
                        type="email"
                        value={form.friendEmail}
                        onChange={(e) => set("friendEmail", e.target.value)}
                        placeholder="friend@example.com"
                        maxLength={254}
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="referral-form-section">
                  <div className="referral-form-section-head">
                    <Sparkles size={18} />
                    <div>
                      <strong>Personal note (optional)</strong>
                      <span>Add a one-line message — it shows up at the top of the email in a highlighted callout.</span>
                    </div>
                  </div>
                  <textarea
                    className="referral-textarea"
                    value={form.personalNote}
                    onChange={(e) => set("personalNote", e.target.value)}
                    placeholder="e.g. Hey Arjun, you mentioned you're looking for a senior role next month — this rewrote my resume for the job I'm applying to. Took 5 minutes."
                    rows={4}
                    maxLength={500}
                  />
                  <span className="referral-counter">{form.personalNote.length}/500</span>
                </div>

                {error && (
                  <div className="referral-error" role="alert">{error}</div>
                )}

                <div className="referral-actions">
                  <button type="button" className="referral-secondary" onClick={onBack}>
                    Cancel
                  </button>
                  <button type="submit" className="referral-primary" disabled={submitting}>
                    <Send size={16} />
                    {submitting ? "Sending..." : "Send referral"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </section>

        <aside className="referral-side">
          <h3>What your friend will see</h3>
          <ul>
            <li>A clear, friendly intro that names you so they know who sent it.</li>
            <li>Your personal note in a highlighted callout, if you wrote one.</li>
            <li>A short breakdown of what ResumeAlignAI does and our honest pricing (Rs.51 / Rs.199).</li>
            <li>A privacy-first reassurance line (24-hour data retention).</li>
            <li>One button to try the builder. That's it — no list, no follow-up emails.</li>
          </ul>
          <h3>Our spam rules</h3>
          <ul>
            <li>Max 5 invites per hour from your device.</li>
            <li>Same friend can be invited only once every 24 hours.</li>
            <li>We never store their email except to enforce the above rule.</li>
          </ul>
        </aside>
      </main>
    </div>
  );
}
