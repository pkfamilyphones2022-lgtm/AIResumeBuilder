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
    title: "Paid PDF unlock at Rs.69 (was Rs.299)",
    text: "Users preview the resume first, then unlock a polished PDF export with verified checkout and cleaner positioning."
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
  { value: "12k+", label: "Resumes drafted" },
  { value: "4.9/5", label: "User satisfaction" },
  { value: "88%", label: "Average ATS lift after optimization" },
  { value: "24 hrs", label: "Typical time users save per job cycle" }
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
    title: "ATS score hits 95%+",
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
  "ATS score hits 95%+",
  "Keywords matched perfectly",
  "Recruiters get impressed",
  "Land more interviews"
];

const atsAwarenessStats = [
  { value: "75%", label: "of resumes never reach a human recruiter — rejected by ATS first" },
  { value: "6 sec", label: "average time a recruiter spends on a resume that passes ATS" },
  { value: "98%", label: "of Fortune 500 companies use ATS to filter applicants" },
  { value: "3×", label: "higher interview callback rate when resume keywords match the JD" }
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
    a: "Each payment of Rs.69 unlocks one PDF download for that resume session. You can generate and preview your resume as many times as you like for free — you only pay when you're satisfied and ready to download the final version."
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
    a: "Yes. Paste a new job description, adjust your details, and click Generate — each run creates a fresh, role-specific version. Each PDF download requires a separate Rs.69 payment, but regenerating is always free."
  },
  {
    q: "What payment methods are accepted?",
    a: "We use Razorpay for secure checkout, which supports UPI (Google Pay, PhonePe, Paytm), debit and credit cards (Visa, Mastercard, RuPay), net banking, and popular wallets."
  },
  {
    q: "What is an ATS score and why does it matter?",
    a: "ATS (Applicant Tracking System) is the software most companies use to filter resumes before a recruiter ever reads them. Our AI measures how well your resume matches the job description and gives a 0–100 score. A score of 95+ means you're far more likely to pass the filter and reach a human review."
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

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return [theme, toggle];
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
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
            <span>LIMITED OFFER</span>
            <strong>Unlock your resume PDF for Rs.69</strong>
            <em>Rs.299</em>
            <small>77% off · AI resume + ATS score + 27 templates</small>
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
          >🔥</motion.span>
          <span className="promo-tag">LIMITED OFFER</span>
          <span className="promo-old">Rs.299</span>
          <strong className="promo-offer">Rs.<span className="promo-new">69</span></strong>
          <span className="promo-divider">·</span>
          <span className="promo-text">Get 77% Off Now</span>
          <motion.button
            className="promo-cta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigateTo("/builder", setPathname)}
          >
            Claim Offer <Zap size={14} />
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
            initial={{ opacity: 0, scale: 0.9, rotateX: 8, rotateY: -12 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-scene">
              {/* Single orbit ring — kept for ambient motion */}
              <motion.div
                className="scene-orbit orbit-one"
                animate={{ rotate: 360 }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              />

              {/* Floating keyword chips */}
              {heroKeywords.map(({ label, top, left, delay }) => (
                <motion.span
                  key={label}
                  className="hero-kw-chip"
                  style={{ top, left }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{
                    opacity: [0, 1, 1, 0.8, 1],
                    scale: [0.6, 1, 1, 0.96, 1],
                    y: [0, -6, 0, 6, 0]
                  }}
                  transition={{
                    delay,
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {label}
                </motion.span>
              ))}

              {/* Main resume card */}
              <motion.div
                className="scene-card scene-card-main"
                animate={{ y: [0, -12, 0], rotateY: [0, 6, 0], rotateX: [0, -3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="scene-card-top">
                  <span>ResumeAlignAI Engine</span>
                  <motion.span
                    animate={{ rotate: [0, 20, -10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                  >
                    <Star size={16} />
                  </motion.span>
                </div>
                <h2>Role-tailored resume output</h2>
                <div className="scene-lines">
                  {[100, 88, 72, 55].map((w, i) => (
                    <motion.span
                      key={i}
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4 + i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
                {/* Typing cursor blink */}
                <motion.span
                  className="scene-cursor"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>

              {/* ATS ring card — glows when ring completes */}
              <motion.div
                className="scene-card scene-card-side"
                animate={{ y: [0, 10, 0], rotateZ: [-8, -4, -8] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.06, boxShadow: "0 0 32px rgba(15,118,110,0.4)" }}
              >
                <p style={{ textAlign: "center", marginBottom: 0, fontWeight: 700 }}>ATS Match</p>
                <ATSRingMini score={95} />
                <motion.small
                  style={{ display: "block", textAlign: "center" }}
                  animate={{ color: ["#5b6b80", "#0f766e", "#5b6b80"] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                >
                  keyword alignment
                </motion.small>
              </motion.div>

              {/* PDF / Pricing card */}
              <motion.div
                className="scene-card scene-card-bottom"
                animate={{ y: [0, -8, 0], rotateZ: [6, 10, 6] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                <p>PDF Unlock</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "6px 0" }}>
                  <strong style={{ fontSize: "1.6rem" }}>Rs.69</strong>
                  <span style={{ textDecoration: "line-through", color: "#888", fontSize: "0.95rem" }}>Rs.299</span>
                </div>
                <small>77% off · verified checkout</small>
              </motion.div>

              {/* "Shortlisted!" toast — floats in after 1.8s */}
              <motion.div
                className="scene-toast"
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 1.8, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 3 }}
                >✅</motion.span>
                Recruiter Shortlisted!
              </motion.div>
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
            <h2>75% of resumes are rejected before a human ever reads them.</h2>
            <p className="ats-aware-lead">
              Applicant Tracking Systems (ATS) scan every resume for exact keywords, standard section
              headings, and clean formatting. If your resume doesn't match what the algorithm expects —
              it never reaches the recruiter's desk, no matter how qualified you are.
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
                    whileInView={{ width: "95%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.15 }}
                  />
                </div>
              </div>
              <b>95%</b>
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

      {/* ── RECRUITER JOURNEY ── */}
      <section className="content-band journey-section" id="how-it-works">
        <div className="section-heading" style={{ textAlign: "center" }}>
          <p>How it works</p>
          <h2 style={{ maxWidth: "none" }}>From blank form to recruiter-ready in 4 steps.</h2>
        </div>

        <div className="journey-grid">
          {journeySteps.map(({ icon: Icon, step, title, text, color, tag }, i) => (
            <motion.div
              key={step}
              className="journey-step"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={i}
              variants={fadeUp}
              whileHover={{ y: -8, boxShadow: "0 28px 60px rgba(0,0,0,0.14)" }}
            >
              <div className="journey-step-top">
                <span className="journey-num" style={{ background: color }}>{step}</span>
                <span className="journey-tag" style={{ color }}>{tag}</span>
              </div>
              <div className="journey-icon-wrap" style={{ background: `${color}18` }}>
                <Icon size={28} color={color} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              {step === "03" && (
                <div className="journey-ats-demo">
                  <ATSRingMini score={95} />
                </div>
              )}
              {step === "04" && (
                <motion.div
                  className="journey-hired-badge"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <CheckCircle2 size={16} /> Recruiter Impressed!
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="journey-cta-row"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <button className="hero-primary" onClick={() => navigateTo("/builder", setPathname)}>
            Start My Resume <ArrowRight size={18} />
          </button>
        </motion.div>
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
                <p>Rs.69 (down from Rs.299) feels like an easy decision during active job search while still delivering a premium export.</p>
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

      {/* ── PRICING OFFER ── */}
      <section className="content-band pricing-section" id="pricing">
        <motion.div
          className="pricing-card"
          initial={{ opacity: 0, y: 36, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="pricing-badge"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            🔥 LIMITED TIME OFFER
          </motion.div>

          <div className="pricing-headline">
            <span className="pricing-old-price">Rs.299</span>
            <div className="pricing-new-price">
              Rs.<span>69</span>
            </div>
            <div className="pricing-discount-pill">77% OFF</div>
          </div>

          <p className="pricing-sub">Everything you need to get shortlisted — one payment, no subscription.</p>

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
            Unlock Premium Resume - 77% Off Today <ArrowRight size={18} />
          </motion.button>

          <p className="pricing-fine">
            Preview your resume free · Pay only when you're happy with the result
          </p>
        </motion.div>
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
