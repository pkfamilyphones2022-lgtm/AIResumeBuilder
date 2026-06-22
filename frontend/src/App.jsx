import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  FileBadge2,
  FileSearch,
  Globe,
  GraduationCap,
  HelpCircle,
  LayoutTemplate,
  Mail,
  Menu,
  Moon,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  TrendingUp,
  Users,
  X,
  Zap
} from "lucide-react";
import Form from "./components/Form.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import Samples from "./components/Samples.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy.jsx";
import RefundPolicy from "./components/RefundPolicy.jsx";
import ReferralPage from "./components/ReferralPage.jsx";
import ResourcesPage from "./components/ResourcesPage.jsx";
import TermsOfService from "./components/TermsOfService.jsx";
import BrandMark from "./components/BrandMark.jsx";
import { sampleResumes } from "./components/sampleResumes.js";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: index * 0.08,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

const benefits = [
  {
    icon: Sparkles,
    title: "AI-written resume content",
    text: "We turn scattered candidate details into sharp summaries and bullet points tailored to the target role."
  },
  {
    icon: FileSearch,
    title: "ATS keyword matching",
    text: "We compare the generated resume with the job description so users can close keyword gaps before applying."
  },
  {
    icon: BriefcaseBusiness,
    title: "Fresher and experienced flows",
    text: "Projects, internships, achievements, and impact are framed differently based on career stage."
  },
  {
    icon: CreditCard,
    title: "Paid PDF unlock at Rs.51",
    text: "Users preview the resume first, then unlock a polished PDF export with verified checkout. Flat price — no subscription, no upsell."
  },
  {
    icon: ScanSearch,
    title: "Resume parsing from PDF",
    text: "Existing resumes can be uploaded and reused so users do not have to rewrite their profile from zero."
  },
  {
    icon: FileBadge2,
    title: "Professional export flow",
    text: "Generated content is formatted for recruiter review and simple PDF delivery after payment."
  },
  {
    icon: Target,
    title: "Role-based positioning",
    text: "The content is adjusted to match the language of a specific opportunity instead of staying generic."
  },
  {
    icon: TrendingUp,
    title: "Faster application cycles",
    text: "Users can move from job description to a ready-to-send resume much faster during active job search."
  }
];

const customerWins = [
  "A resume that speaks the hiring manager's language",
  "A cleaner match against ATS filters and job boards",
  "Less time rewriting every application from scratch",
  "A professional PDF ready to send immediately"
];

const stats = [
  { value: "Rs.51", label: "Flat one-time price · no subscription" },
  { value: "27", label: "Recruiter-safe templates · switch anytime" },
  { value: "Fresher + Exp", label: "Two purpose-built builder flows" },
  { value: "DPDP-aligned", label: "India data-protection compliant" }
];

const testimonials = [
  {
    name: "Aman, SDE Fresher",
    quote: "The project bullets sounded much stronger and the ATS gaps were obvious after one check."
  },
  {
    name: "Nisha, Product Marketer",
    quote: "I uploaded my old resume, pasted the JD, and had a cleaner version ready in minutes."
  },
  {
    name: "Rahul, Data Analyst",
    quote: "The locked PDF flow makes the product feel like a real career tool, not just a demo."
  }
];

const upcomingFeatures = [
  {
    icon: LayoutTemplate,
    title: "Multi-template resume themes",
    text: "Switch between recruiter-safe layouts for tech, business, and creative roles."
  },
  {
    icon: Globe,
    title: "Cover letter generation",
    text: "Generate matching cover letters and concise outreach notes from the same candidate profile."
  },
  {
    icon: GraduationCap,
    title: "Interview prep suggestions",
    text: "Turn the generated resume into likely interview questions and short practice prompts."
  }
];

const nextGaps = [
  "Saved resumes per job with version history",
  "Shareable link for recruiter review (read-only)",
  "Server-side PDF export for pixel-perfect output",
  "One-click ATS improvements that apply suggestions into sections",
  "Account login + payment history + downloads"
];

const builderHighlights = [
  "Dedicated builder page with less distraction and better focus",
  "Upload, edit, generate, score, and export in one controlled workflow",
  "Designed for freelancers, students, and job switchers who need speed with polish"
];

const journeySteps = [
  {
    icon: FileSearch,
    step: "01",
    title: "You fill your details",
    text: "Add career history, skills, projects, and paste the target job description.",
    color: "#0f766e",
    tag: "Upload & Fill"
  },
  {
    icon: Sparkles,
    step: "02",
    title: "AI writes your resume",
    text: "LLM crafts role-specific bullets, a sharp summary, and keyword-aligned content.",
    color: "#4338ca",
    tag: "AI Generation"
  },
  {
    icon: Target,
    step: "03",
    title: "ATS score hits up to 90%",
    text: "We measure keyword alignment and flag exactly what to fix before you apply.",
    color: "#b45309",
    tag: "ATS Analysis"
  },
  {
    icon: Users,
    step: "04",
    title: "Recruiter gets impressed",
    text: "A polished PDF that speaks the hiring manager's language - ready in minutes.",
    color: "#166534",
    tag: "Hired"
  }
];

const pricingFeatures = [
  "AI-generated resume content tailored to the job",
  "ATS score check with keyword gap analysis",
  "Resume PDF upload and intelligent parsing",
  "27 professional resume templates",
  "One-click PDF download after payment",
  "Grammar and clarity improvements via AI"
];

const animatedPhrases = [
  "AI writes every word",
  "ATS score hits up to 90%",
  "Keywords matched perfectly",
  "Recruiters get impressed",
  "Land more interviews"
];

const atsAwarenessStats = [
  { value: "Filter", label: "Most mid-to-large employers use an ATS to screen resumes before any human review" },
  { value: "Match", label: "ATS scores your resume by literal keyword match against the job description" },
  { value: "Format", label: "Tables, columns, icons, and fancy headings frequently break ATS parsing" },
  { value: "Sections", label: "Non-standard headings like 'Where I've worked' get skipped — ATS expects 'Experience'" }
];

const atsRejectionReasons = [
  "Missing exact keywords the JD uses — ATS scores by literal match",
  "Non-standard section names like 'Where I've worked' instead of 'Experience'",
  "Fancy layouts with tables or columns — ATS reads them out of order or skips them",
  "Unexplained acronyms — always spell out at first use: 'CI/CD (Continuous Integration)'",
  "Generic summaries with no role-specific language or measurable outcomes"
];

const faqs = [
  {
    q: "What if my payment fails?",
    a: "If your payment was deducted but the PDF didn't unlock, contact us at support@resumealignai.online with your payment reference number. We'll verify within 24 hours and either manually unlock your download or process a full refund — no questions asked."
  },
  {
    q: "How many resumes can I download?",
    a: "Each payment of Rs.51 unlocks one PDF download for that resume session. You can generate and preview your resume as many times as you like for free — you only pay when you're satisfied and ready to download the final version."
  },
  {
    q: "Can I edit the generated resume before downloading?",
    a: "Yes. After the AI generates your resume, you can edit any section directly in the preview panel — adjust wording, update details, or switch between 27 professional templates. All of this is free; you pay only when you download."
  },
  {
    q: "Is my data saved when I close the page?",
    a: "Currently, resume data is not saved between sessions. We recommend completing your resume in one sitting. Account-based save history and version control are on our roadmap and coming soon."
  },
  {
    q: "Can I generate resumes for multiple job roles?",
    a: "Yes. Paste a new job description, adjust your details, and click Generate — each run creates a fresh, role-specific version. Each PDF download requires a separate Rs.51 payment, but regenerating is always free."
  },
  {
    q: "What payment methods are accepted?",
    a: "We use Razorpay for secure checkout, which supports UPI (Google Pay, PhonePe, Paytm), debit and credit cards (Visa, Mastercard, RuPay), net banking, and popular wallets."
  },
  {
    q: "What is an ATS score and why does it matter?",
    a: "ATS (Applicant Tracking System) is the software most companies use to filter resumes before a recruiter ever reads them. Our AI measures how well your resume matches the job description and gives a 0–100 score. A score of 90 or above means you're far more likely to pass the filter and reach a human review."
  },
  {
    q: "Can I re-generate if I'm not happy with the result?",
    a: "Absolutely — regenerating is completely free. Adjust your inputs, add more detail, or paste a different job description and click Generate as many times as you need. Payment is only required when you're ready to download."
  },
  {
    q: "Does this work for freshers as well as experienced professionals?",
    a: "Yes. We have two dedicated flows — one for freshers (built around projects, education, internships, and achievements) and one for experienced professionals (built around impact bullets, career history, and role alignment). Both are fully AI-powered with ATS scoring."
  },
  {
    q: "Is my personal and payment data secure?",
    a: "Resume details you enter are used only to generate your resume and are not stored on our servers after your session. Payments are handled entirely by Razorpay, a PCI-DSS compliant payment gateway — we never see or store your card details."
  }
];

const heroKeywords = [
  { label: "React.js",   top: "6%",  left: "72%", delay: 0.8 },
  { label: "Python",     top: "18%", left: "3%",  delay: 1.4 },
  { label: "Leadership", top: "78%", left: "70%", delay: 2.2 },
  { label: "ATS Ready",  top: "55%", left: "-2%", delay: 3.0 },
];

function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className={`faq-item ${isOpen ? "faq-open" : ""}`}>
      <button className="faq-question" onClick={onToggle} aria-expanded={isOpen}>
        <span>{question}</span>
        <motion.span
          className="faq-chevron"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Fix #9 — removed useInView (element is always visible in hero).
   Animation now always plays on mount with a short delay. */
function ATSRingMini({ score = 92, delay = 0.3 }) {
  const r = 30, circ = 2 * Math.PI * r;
  const dash = circ * (1 - score / 100);
  return (
    <svg width="80" height="80" style={{ display: "block", margin: "6px auto" }}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(15,118,110,0.15)" strokeWidth="6" />
      <motion.circle
        cx="40" cy="40" r={r}
        fill="none"
        stroke="#0f766e"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        whileInView={{ strokeDashoffset: dash }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="45" textAnchor="middle" fontSize="15" fontWeight="800" fill="#0f766e">{score}%</text>
    </svg>
  );
}

function JourneyPipelineVertical({ steps, intervalMs = 2400 }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % steps.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [paused, steps.length, intervalMs]);

  const progressPct = ((active + 1) / steps.length) * 100;

  return (
    <div
      className="journey-pipeline-v"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="journey-track-v">
        <div className="journey-track-line-v">
          <motion.div
            className="journey-track-fill-v"
            initial={false}
            animate={{ height: `${progressPct}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {steps.map(({ icon: NodeIcon, step, tag, title, text, color }, i) => {
          const isActive = i === active;
          const isDone = i < active;
          return (
            <motion.div
              key={step}
              className={`journey-row-v${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}
              style={{ "--node-color": color }}
              onClick={() => setActive(i)}
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 * i + 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className="journey-row-dot"
                animate={
                  isActive
                    ? { scale: [1, 1.18, 1], boxShadow: [
                        "0 0 0 5px color-mix(in srgb, var(--node-color) 18%, transparent), 0 8px 20px rgba(15,23,42,0.16)",
                        "0 0 0 9px color-mix(in srgb, var(--node-color) 10%, transparent), 0 8px 20px rgba(15,23,42,0.16)",
                        "0 0 0 5px color-mix(in srgb, var(--node-color) 18%, transparent), 0 8px 20px rgba(15,23,42,0.16)"
                      ] }
                    : { scale: 1 }
                }
                transition={isActive ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
              >
                {isDone ? <CheckCircle2 size={18} /> : <NodeIcon size={18} />}
              </motion.span>

              <motion.div
                className="journey-row-content"
                animate={{
                  opacity: isActive ? 1 : isDone ? 0.7 : 0.45,
                  x: isActive ? 0 : -4
                }}
                transition={{ duration: 0.4 }}
              >
                <span className="journey-row-step">{step} · {tag}</span>
                <strong>{title}</strong>
                <p className="journey-row-text">
                  {text}
                  {step === "03" && isActive && (
                    <motion.span
                      className="journey-row-extra"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    >
                      <span className="journey-row-ats">90%</span> ATS match
                    </motion.span>
                  )}
                  {step === "04" && isActive && (
                    <motion.span
                      className="journey-row-badge"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.1 } }}
                    >
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        style={{ display: "inline-flex" }}
                      >
                        <CheckCircle2 size={14} />
                      </motion.span>
                      Recruiter Shortlisted!
                    </motion.span>
                  )}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function JourneyPipeline({ steps, onCta }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % steps.length);
    }, 2600);
    return () => clearInterval(t);
  }, [paused, steps.length]);

  const current = steps[active];
  const Icon = current.icon;
  const progressPct = ((active + 1) / steps.length) * 100;

  return (
    <div
      className="journey-pipeline"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="journey-track">
        <div className="journey-track-line">
          <motion.div
            className="journey-track-fill"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        {steps.map(({ icon: NodeIcon, step, tag, color }, i) => {
          const isActive = i === active;
          const isDone = i < active;
          return (
            <button
              key={step}
              type="button"
              className={`journey-node${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Step ${step}: ${tag}`}
              style={{ "--node-color": color }}
            >
              <motion.span
                className="journey-node-dot"
                animate={isActive ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                transition={isActive ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
              >
                {isDone ? <CheckCircle2 size={20} /> : <NodeIcon size={20} />}
              </motion.span>
              <span className="journey-node-step">{step}</span>
              <span className="journey-node-tag">{tag}</span>
            </button>
          );
        })}
      </div>

      <div className="journey-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.step}
            className="journey-stage-card"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ "--card-color": current.color }}
          >
            <div className="journey-stage-head">
              <motion.span
                className="journey-stage-icon"
                style={{ background: `${current.color}1a`, color: current.color }}
                initial={{ rotate: -8, scale: 0.85 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Icon size={28} />
              </motion.span>
              <div>
                <span className="journey-stage-tag" style={{ color: current.color }}>
                  Step {current.step} · {current.tag}
                </span>
                <h3>{current.title}</h3>
              </div>
            </div>
            <p>{current.text}</p>

            {current.step === "03" && (
              <div className="journey-stage-extra">
                <ATSRingMini score={90} delay={0.1} />
                <span>Live ATS scoring — keyword gaps flagged before you apply.</span>
              </div>
            )}
            {current.step === "04" && (
              <motion.div
                className="journey-hired-badge"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <CheckCircle2 size={16} /> Recruiter Impressed!
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        className="journey-cta-row"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <button className="hero-primary" onClick={onCta}>
          Start My Resume <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  return [pathname, setPathname];
}

const THEME_KEY = "raa_theme";

// Dark mode is temporarily disabled. The CSS and component scaffolding
// (theme-aware overrides throughout styles.css, props plumbing through
// the legal pages) are preserved — only these two functions are switched
// off so it's a one-edit revert when we re-enable it.
function useTheme() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    try { localStorage.removeItem(THEME_KEY); } catch {}
  }, []);
  // Returning a null toggle makes `{onToggleTheme && <button>...}` checks
  // in the legal pages skip rendering the toggle.
  return ["light", null];
}

function ThemeToggle() {
  return null;
}

function navigateTo(path, setPathname) {
  window.history.pushState({}, "", path);
  setPathname(window.location.pathname);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* Fix #1 — moved outside App so it is a stable component reference and
   its useState / useEffect are never reset by a parent re-render */
function AnimatedWords({ words = [], interval = 2200 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  return (
    <div className="animated-words-wrap" aria-live="polite">
      <span className="animated-words-label">→</span>
      <div className="animated-words">
        <AnimatePresence mode="wait">
          <motion.span
            key={words[index]}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="animated-phrase"
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  const [pathname, setPathname] = usePathname();
  const [theme, toggleTheme] = useTheme();
  const isBuilderPage = pathname === "/builder" || pathname === "/fresher-builder";
  const isFresherBuilder = pathname === "/fresher-builder";
  const isSamplesPage = pathname === "/samples";
  const isAdminPage = pathname === "/admin";
  const isPrivacyPage = pathname === "/privacy";
  const isRefundPage = pathname === "/refund-policy";
  const isTermsPage = pathname === "/terms";
  const isReferralPage = pathname === "/refer";
  const isResourcesPage = pathname === "/resources" || pathname.startsWith("/resources/");
  const resourceSlug = isResourcesPage && pathname.startsWith("/resources/")
    ? pathname.slice("/resources/".length).replace(/\/$/, "")
    : null;
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isSamplesPage) {
    return (
      <Samples
        onBack={() => navigateTo("/", setPathname)}
        onNavigate={(path) => navigateTo(path, setPathname)}
      />
    );
  }

  if (isAdminPage) {
    return <AdminPanel onBack={() => navigateTo("/", setPathname)} />;
  }

  if (isPrivacyPage) {
    return <PrivacyPolicy onBack={() => navigateTo("/", setPathname)} theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (isRefundPage) {
    return <RefundPolicy onBack={() => navigateTo("/", setPathname)} theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (isReferralPage) {
    return <ReferralPage onBack={() => navigateTo("/", setPathname)} />;
  }

  if (isResourcesPage) {
    return (
      <ResourcesPage
        slug={resourceSlug}
        onBack={() => navigateTo("/", setPathname)}
        onNavigate={(p) => navigateTo(p, setPathname)}
      />
    );
  }

  if (isTermsPage) {
    return <TermsOfService onBack={() => navigateTo("/", setPathname)} theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (isBuilderPage) {
    return (
      <div className="builder-page">
        <div className="builder-backdrop builder-backdrop-one" />
        <div className="builder-backdrop builder-backdrop-two" />

        <header className="builder-hero">
          <nav className="builder-brandbar">
            <button
              className="brand-lockup builder-brand-lockup brand-home-link"
              onClick={() => navigateTo("/", setPathname)}
              title="Go to home"
            >
              <BrandMark />
              <div>
                <p>ResumeAlignAI <span className="brand-premium-badge">Premium</span></p>
                <span>{isFresherBuilder ? "Fresher workspace" : "Experienced workspace"}</span>
              </div>
            </button>

            <div className="builder-brandbar-actions">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <button className="builder-back-button" onClick={() => navigateTo("/", setPathname)}>
                <ChevronLeft aria-hidden="true" />
                Back to Landing
              </button>
            </div>
          </nav>

          <motion.div
            className="builder-offer-banner"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span>JUST LAUNCHED</span>
            <strong>Unlock your resume PDF for Rs.51</strong>
            <small>Flat one-time price · AI resume + ATS score + 27 templates</small>
          </motion.div>

          <div className="builder-workspace-head">
            <div className="builder-copy">
              <p className="hero-kicker">{isFresherBuilder ? "Fresher resume workspace" : "Experienced resume workspace"}</p>
              <h1>
                {isFresherBuilder
                  ? "Build a fresher resume around projects, education, internships, and ATS fit."
                  : "Build an experienced resume around impact, role relevance, and ATS fit."}
              </h1>
              <p className="hero-text">
                {isFresherBuilder
                  ? "Start with academic proof, training, coursework, achievements, and the job description. The AI shapes everything into a recruiter-ready resume."
                  : "Add career history, measurable impact, skills, old resume context, and the target job description. The AI rewrites it into a sharper application-ready resume."}
              </p>
            </div>

            <div className="builder-mode-links">
              <button
                className={!isFresherBuilder ? "is-active" : ""}
                onClick={() => navigateTo("/builder", setPathname)}
              >
                Experienced
              </button>
              <button
                className={isFresherBuilder ? "is-active" : ""}
                onClick={() => navigateTo("/fresher-builder", setPathname)}
              >
                Fresher
              </button>
            </div>
          </div>

          <div className="builder-badges">
            {builderHighlights.map((item) => (
              <span key={item}>
                <BadgeCheck aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </header>

        <section className="builder-shell">
          <Form mode={isFresherBuilder ? "fresher" : "experienced"} />
        </section>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <motion.div
        className="promo-banner"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="promo-inner">
          <motion.span
            className="promo-fire"
            animate={{ scale: [1, 1.18, 1], rotate: [-4, 4, -4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >🚀</motion.span>
          <span className="promo-tag">JUST LAUNCHED</span>
          <strong className="promo-offer">Rs.<span className="promo-new">51</span></strong>
          <span className="promo-divider">·</span>
          <span className="promo-text">Single resume · or Weekly Pass at Rs.199</span>
          <motion.button
            className="promo-cta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigateTo("/builder", setPathname)}
          >
            See How It Works <Zap size={14} />
          </motion.button>
        </div>
      </motion.div>
      <motion.header
        className="hero-section"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <nav className="topbar">
          <a
            className="brand-lockup brand-home-link"
            href="/"
            onClick={(e) => { e.preventDefault(); navigateTo("/", setPathname); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            aria-label="ResumeAlignAI home"
          >
            <BrandMark />
            <div>
              <p>ResumeAlignAI <span className="brand-premium-badge">Premium</span></p>
              <span>Premium AI resumes, aligned to your target role</span>
            </div>
          </a>

          <div className="topbar-cluster">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button
              className="hamburger-btn"
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className={`topbar-links ${mobileNavOpen ? "is-open" : ""}`}>
            <div className="nav-mobile-header">
              <span>Menu</span>
              <button className="hamburger-btn" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <a href="#benefits" onClick={() => setMobileNavOpen(false)}>Benefits</a>
            <a href="#features" onClick={() => setMobileNavOpen(false)}>Features</a>
            <a href="#upcoming" onClick={() => setMobileNavOpen(false)}>Upcoming</a>
            <a href="#proof" onClick={() => setMobileNavOpen(false)}>Reviews</a>
            <a href="#faq" onClick={() => setMobileNavOpen(false)}>FAQ</a>
            <a href="#contact" onClick={() => setMobileNavOpen(false)}>Contact</a>
            <button className="topbar-cta topbar-samples-btn" onClick={() => { setMobileNavOpen(false); navigateTo("/samples", setPathname); }}>
              Sample Resumes
            </button>
            <button className="topbar-cta" onClick={() => { setMobileNavOpen(false); navigateTo("/fresher-builder", setPathname); }}>
              Fresher Builder
            </button>
            <button className="topbar-cta" onClick={() => { setMobileNavOpen(false); navigateTo("/builder", setPathname); }}>
              Experienced Builder
            </button>
            </div>
          </div>

          <div
            className={`nav-overlay ${mobileNavOpen ? "is-open" : ""}`}
            onClick={() => setMobileNavOpen(false)}
          />
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <motion.p className="hero-kicker" custom={0} variants={fadeUp}>
              Premium AI resume crafting for serious job seekers
            </motion.p>
            <motion.h1 custom={1} variants={fadeUp}>
              Create an ATS-Ready Resume for Any Job in Minutes
            </motion.h1>
            <motion.p className="hero-text" custom={2} variants={fadeUp}>
              Upload your details, add the job description, and ResumeAlignAI will build a professional
              resume matched with the right keywords.
            </motion.p>

            <AnimatedWords words={animatedPhrases} interval={2200} />

            <motion.div className="hero-actions" custom={3} variants={fadeUp}>
              <button className="hero-primary" onClick={() => navigateTo("/builder", setPathname)}>
                Build My Resume Now
                <ArrowRight aria-hidden="true" />
              </button>
              <button className="hero-secondary" onClick={() => navigateTo("/samples", setPathname)}>
                View Resume Samples
                <ArrowRight aria-hidden="true" />
              </button>
            </motion.div>

            <motion.ul className="hero-checks" custom={4} variants={fadeUp}>
              <li>
                <BadgeCheck aria-hidden="true" />
                Resume upload and parsing
              </li>
              <li>
                <BadgeCheck aria-hidden="true" />
                ATS scoring against real job descriptions
              </li>
              <li>
                <BadgeCheck aria-hidden="true" />
                Secure PDF unlock after payment
              </li>
            </motion.ul>
          </div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-pipeline-wrap">
              <div className="hero-pipeline-eyebrow">
                <Sparkles size={14} /> How it works
              </div>
              <JourneyPipelineVertical steps={journeySteps} />
            </div>
          </motion.div>
        </div>
      </motion.header>

      <section className="stats-strip">
        {stats.map((item, index) => (
          <motion.article
            key={item.label}
            className="stat-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={index}
            variants={fadeUp}
          >
            <strong>{item.value}</strong>
            <p>{item.label}</p>
          </motion.article>
        ))}
      </section>

      {/* ── ATS AWARENESS ── */}
      <section className="content-band ats-awareness-section" id="ats">
        <div className="ats-aware-inner">
          <motion.div
            className="ats-aware-copy"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
          >
            <p className="hero-kicker" style={{ color: "#b45309" }}>
              <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              The hidden filter most job seekers miss
            </p>
            <h2>Your resume has to clear an ATS filter before a human sees it.</h2>
            <p className="ats-aware-lead">
              Most mid-to-large employers route applications through an Applicant Tracking System (ATS).
              The ATS scores each resume by literal keyword match against the job description, expects
              standard section headings, and stumbles on tables, columns, or fancy fonts. Miss those
              expectations and the resume usually does not reach the recruiter's desk.
            </p>
            <p className="ats-aware-sub">Common reasons ATS systems reject resumes:</p>
            <ul className="ats-rejection-list">
              {atsRejectionReasons.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AlertTriangle size={14} className="ats-reject-icon" />
                  {item}
                </motion.li>
              ))}
            </ul>
            <div className="ats-aware-cta-row">
              <ShieldCheck size={16} />
              <span>Our AI fixes all of these automatically — so your resume reaches a human.</span>
            </div>
            <button className="hero-primary" style={{ marginTop: 20 }} onClick={() => navigateTo("/builder", setPathname)}>
              Fix My Resume Now <ArrowRight size={18} />
            </button>
          </motion.div>

          <motion.div
            className="ats-aware-card"
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ats-card-header">
              <span>ATS reality check</span>
              <strong>Before vs After ResumeAlignAI</strong>
            </div>

            <div className="ats-meter-row">
              <div>
                <small>Generic resume</small>
                <div className="ats-meter">
                  <motion.span
                    initial={{ width: 0 }}
                    whileInView={{ width: "38%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              <b>38%</b>
            </div>

            <div className="ats-meter-row good">
              <div>
                <small>ResumeAlignAI optimized</small>
                <div className="ats-meter">
                  <motion.span
                    initial={{ width: 0 }}
                    whileInView={{ width: "90%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.15 }}
                  />
                </div>
              </div>
              <b>90%</b>
            </div>

            <div className="ats-aware-stats">
              {atsAwarenessStats.map(({ value, label }, i) => (
                <motion.div
                  key={i}
                  className="ats-stat-card"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                >
                  <strong>{value}</strong>
                  <p>{label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SAMPLE RESUMES ── */}
      <section className="content-band sample-resumes-section" id="samples">
        <motion.div
          className="section-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
        >
          <p>See before you build</p>
          <h2>Browse sample resumes for your role — fresher or experienced.</h2>
          <p className="section-subtext">
            Not sure what a great resume looks like for your target role? Browse real AI-generated samples across {sampleResumes.length} fresher and experienced profiles. Pick your role, explore 27 templates, then build your own version in minutes.
          </p>
        </motion.div>

        <div className="sample-role-grid">
          {sampleResumes.map(({ id, label, category, description, color }, i) => (
            <motion.div
              key={id}
              className="sample-role-card"
              style={{ "--role-color": color }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -6, boxShadow: `0 20px 48px ${color}22` }}
            >
              <span className="sample-role-dot" style={{ background: color }} />
              <span className="sample-role-cat" data-type={category}>{category}</span>
              <h3>{label}</h3>
              <p>{description}</p>
              <button
                className="sample-role-btn"
                style={{ color, borderColor: `${color}44` }}
                onClick={() => navigateTo(`/samples?sample=${id}`, setPathname)}
              >
                View Sample <ArrowRight size={14} />
              </button>
            </motion.div>
          ))}

          <motion.div
            className="sample-role-card sample-cta-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={sampleResumes.length}
            variants={fadeUp}
            whileHover={{ y: -6 }}
          >
            <FileSearch size={28} style={{ color: "#0f766e", marginBottom: 10 }} />
            <h3>Don't see your role?</h3>
            <p>Our AI builds custom resumes for any job title — just add your details and job description.</p>
            <button className="hero-primary" style={{ marginTop: 12 }} onClick={() => navigateTo("/builder", setPathname)}>
              Build Custom Resume <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>

        <motion.div
          className="samples-section-cta"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <button className="hero-secondary" onClick={() => navigateTo("/samples", setPathname)}>
            Browse All Samples <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      <section className="content-band" id="benefits">
        <div className="section-heading">
          <p>What the customer gets</p>
          <h2>A hiring-focused toolkit instead of another generic template.</h2>
        </div>

        <div className="benefit-grid">
          {benefits.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              key={title}
              className="benefit-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              whileHover={{ rotateX: -6, rotateY: 8, y: -6 }}
              custom={index}
              variants={fadeUp}
            >
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="content-band" id="features">
        <div className="section-heading">
          <p>Similar and more features</p>
          <h2>Everything a paid resume product is expected to communicate clearly.</h2>
        </div>

        <div className="split-band">
          <motion.div
            className="copy-panel"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
          >
            <p>Core promise</p>
            <h2>From resume cleanup to job targeting, all in one workflow.</h2>
            <ul className="feature-list">
              <li>
                <BadgeCheck aria-hidden="true" />
                AI-generated summaries and bullet points aligned to the target role
              </li>
              <li>
                <BadgeCheck aria-hidden="true" />
                Existing PDF upload for faster profile reuse
              </li>
              <li>
                <BadgeCheck aria-hidden="true" />
                ATS score and missing keyword visibility before application
              </li>
              <li>
                <BadgeCheck aria-hidden="true" />
                PDF unlock priced for impulse purchase during job search
              </li>
            </ul>
          </motion.div>

          <motion.div
            className="process-panel"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            custom={1}
            variants={fadeUp}
          >
            <p>Why users buy</p>
            <div className="process-steps">
              <article>
                <span>01</span>
                <h3>Clearer positioning</h3>
                <p>Users stop sending flat, generic resumes and start presenting their relevance more directly.</p>
              </article>
              <article>
                <span>02</span>
                <h3>More confidence before applying</h3>
                <p>ATS feedback gives a simple signal that the resume is closer to what the employer is asking for.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Affordable resume delivery</h3>
                <p>Rs.51 flat — a low-friction decision during an active job search, while still delivering a premium export.</p>
              </article>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="content-band split-band">
        <motion.div
          className="copy-panel"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
        >
          <p>Benefits for users</p>
          <h2>Users leave with more than a document.</h2>
          <ul className="feature-list">
            {customerWins.map((item) => (
              <li key={item}>
                <BadgeCheck aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="process-panel"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          custom={1}
          variants={fadeUp}
        >
          <p>What we are doing</p>
          <div className="process-steps">
            <article>
              <span>01</span>
              <h3>Collect candidate context</h3>
              <p>We gather career history, skills, projects, and the target role from one guided flow.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Generate targeted content</h3>
              <p>The AI rewrites the resume for fresher or experienced candidates with stronger alignment.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Measure and export</h3>
              <p>Users check ATS coverage, review the preview, and unlock the PDF only when satisfied.</p>
            </article>
          </div>
        </motion.div>
      </section>

      <section className="content-band" id="upcoming">
        <div className="section-heading">
          <p>Upcoming features</p>
          <h2>A forward-looking roadmap gives the landing page more product depth.</h2>
        </div>

        <div className="upcoming-grid">
          {upcomingFeatures.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              key={title}
              className="upcoming-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              custom={index}
              variants={fadeUp}
            >
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="content-band" id="next">
        <div className="section-heading">
          <p>Coming next</p>
          <h2>Feature gaps we're closing to make this feel like a complete hiring tool.</h2>
        </div>

        <div className="copy-panel">
          <ul className="feature-list">
            {nextGaps.map((item) => (
              <li key={item}>
                <BadgeCheck aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="content-band" id="proof">
        <div className="section-heading">
          <p>Satisfied customers</p>
          <h2>Social proof for a career product people can trust.</h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((item, index) => (
            <motion.article
              key={item.name}
              className="testimonial-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              custom={index}
              variants={fadeUp}
            >
              <Users aria-hidden="true" />
              <p>{item.quote}</p>
              <strong>{item.name}</strong>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── PRICING (two tiers) ── */}
      <section className="content-band pricing-section" id="pricing">
        <div className="pricing-grid">
          {/* Tier 1 — Single Resume */}
          <motion.div
            className="pricing-card pricing-card--single"
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pricing-badge pricing-badge--neutral">SINGLE RESUME</div>
            <div className="pricing-headline">
              <div className="pricing-new-price">Rs.<span>51</span></div>
              <div className="pricing-discount-pill">FLAT PRICE</div>
            </div>
            <p className="pricing-sub">One AI-generated, ATS-aligned resume. Preview free, pay only when you download.</p>
            <ul className="pricing-features">
              {pricingFeatures.map((f) => (
                <li key={f}>
                  <CheckCircle2 size={16} className="pricing-check" />
                  {f}
                </li>
              ))}
            </ul>
            <motion.button
              className="pricing-cta hero-primary"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigateTo("/builder", setPathname)}
            >
              Pay Rs.51 — One Resume <ArrowRight size={18} />
            </motion.button>
            <p className="pricing-fine">One-time payment · No subscription · No upsell</p>
          </motion.div>

          {/* Tier 2 — Weekly Pass */}
          <motion.div
            className="pricing-card pricing-card--weekly"
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="pricing-badge"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              ⚡ SPECIAL OFFER
            </motion.div>
            <div className="pricing-headline">
              <div className="pricing-new-price">Rs.<span>199</span></div>
              <div className="pricing-discount-pill">WEEKLY PASS</div>
            </div>
            <p className="pricing-sub">15 downloads in 7 days. Perfect for an active job-search week — multiple roles, multiple versions.</p>
            <ul className="pricing-features">
              <li><CheckCircle2 size={16} className="pricing-check" /><strong>15 downloads</strong> over 7 days</li>
              <li><CheckCircle2 size={16} className="pricing-check" />Each download tracked — only counts when you save a PDF/DOCX</li>
              <li><CheckCircle2 size={16} className="pricing-check" />Switch templates and re-generate freely</li>
              <li><CheckCircle2 size={16} className="pricing-check" />Tied to your email — works across this device</li>
              <li><CheckCircle2 size={16} className="pricing-check" />Effective price: <strong>~Rs.13 / resume</strong></li>
            </ul>
            <motion.button
              className="pricing-cta hero-primary"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigateTo("/builder", setPathname)}
            >
              Get Weekly Pass — Rs.199 <ArrowRight size={18} />
            </motion.button>
            <p className="pricing-fine">7 days OR 15 downloads, whichever comes first</p>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="content-band faq-section" id="faq">
        <motion.div
          className="section-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
        >
          <p><HelpCircle size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />Got questions?</p>
          <h2>Frequently asked questions.</h2>
        </motion.div>

        <motion.div
          className="faq-list"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
        >
          {faqs.map((faq, i) => (
            <FaqItem
              key={i}
              question={faq.q}
              answer={faq.a}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </motion.div>
      </section>

      <section className="content-band contact-band" id="contact">
        <motion.div
          className="contact-panel"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
        >
          <p>Contact details</p>
          <h2>Keep a clear way for interested users to reach the team.</h2>
          <div className="contact-grid">
            <a href="mailto:support@resumealignai.online">
              <Mail aria-hidden="true" />
              support@resumealignai.online
            </a>
          </div>
        </motion.div>
      </section>

      <section className="builder-section" id="builder">
        <div className="section-heading compact">
          <p>Dedicated builder page</p>
          <h2>Keep the conversion page clean and move the full workflow into its own polished screen.</h2>
        </div>
        <motion.div
          className="builder-preview-card"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
        >
          <div>
            <p className="hero-kicker">Resume workspace</p>
            <h3>Builder, preview, ATS score, and paid export on a separate page.</h3>
            <p>
              Users can explore the offer here, then move into a focused builder experience built for completion.
            </p>
          </div>
          <div className="builder-preview-actions">
            <button className="hero-primary" onClick={() => navigateTo("/fresher-builder", setPathname)}>
              Fresher Builder
              <ArrowRight aria-hidden="true" />
            </button>
            <button className="hero-secondary" onClick={() => navigateTo("/builder", setPathname)}>
              Experienced Builder
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      </section>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <a
            className="site-footer-brand brand-home-link"
            href="/"
            onClick={(e) => { e.preventDefault(); navigateTo("/", setPathname); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            aria-label="ResumeAlignAI home"
          >
            <BrandMark />
            <div>
              <p>ResumeAlignAI <span className="brand-premium-badge">Premium</span></p>
              <span>Premium AI resumes, aligned to your target role</span>
            </div>
          </a>
          <nav className="site-footer-links">
            <a href="#benefits">Benefits</a>
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
            <a
              href="/resources"
              onClick={(e) => { e.preventDefault(); navigateTo("/resources", setPathname); }}
            >
              Resources
            </a>
            <a
              href="/refer"
              onClick={(e) => { e.preventDefault(); navigateTo("/refer", setPathname); }}
            >
              Refer a Friend
            </a>
            <a
              href="/privacy"
              onClick={(e) => { e.preventDefault(); navigateTo("/privacy", setPathname); }}
            >
              Privacy Policy
            </a>
            <a
              href="/refund-policy"
              onClick={(e) => { e.preventDefault(); navigateTo("/refund-policy", setPathname); }}
            >
              Refund Policy
            </a>
            <a
              href="/terms"
              onClick={(e) => { e.preventDefault(); navigateTo("/terms", setPathname); }}
            >
              Terms of Service
            </a>
          </nav>
          <p className="site-footer-meta">
            &copy; 2026 ResumeAlignAI · Premium AI resume service · <a href="mailto:support@resumealignai.online">support@resumealignai.online</a>
          </p>
        </div>
      </footer>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="scroll-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            initial={{ opacity: 0, scale: 0.7, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 16 }}
            transition={{ duration: 0.22 }}
            aria-label="Scroll to top"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
