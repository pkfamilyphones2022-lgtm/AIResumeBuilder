import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const GENERATION_STEPS = [
  {
    emoji: "👋",
    headline: (name) => `Hi ${name || "there"}!`,
    detail:   (_, role) => `Getting your ${role || "resume"} ready…`
  },
  {
    emoji: "🔍",
    headline: () => "Reading your profile",
    detail:   (_, role) => `Analysing what the ${role || "target role"} really needs…`
  },
  {
    emoji: "✍️",
    headline: () => "Writing your summary",
    detail:   (name) => `Crafting a sharp 3-line intro for ${name || "you"}…`
  },
  {
    emoji: "💼",
    headline: () => "Building experience bullets",
    detail:   () => "Turning responsibilities into measurable impact statements…"
  },
  {
    emoji: "⚡",
    headline: () => "Injecting ATS keywords",
    detail:   (_, role) => `Matching ${role || "role"}-specific terms from the job description…`
  },
  {
    emoji: "📊",
    headline: () => "Checking keyword coverage",
    detail:   () => "Measuring how well your resume matches the JD…"
  },
  {
    emoji: "🎯",
    headline: (name) => `Optimising ${name ? `${name.split(" ")[0]}'s` : "your"} ATS score`,
    detail:   () => "Pushing for up to 90% alignment before you see the result…"
  },
  {
    emoji: "✅",
    headline: () => "Verifying every line",
    detail:   () => "Checking grammar, truthfulness, and recruiter clarity…"
  },
  {
    emoji: "✨",
    headline: () => "Almost done!",
    detail:   (name) => `Your ${name ? `${name.split(" ")[0]}'s` : ""} resume is being finalised…`
  }
];

const IMPROVE_STEPS = [
  {
    emoji: "🔍",
    headline: () => "Scanning ATS gaps",
    detail:   () => "Identifying missing keywords and weak phrases…"
  },
  {
    emoji: "⚡",
    headline: (_, role) => `Finding better ${role || "role"} keywords`,
    detail:   () => "Matching high-value terms from the job description…"
  },
  {
    emoji: "✍️",
    headline: () => "Rewriting weak bullets",
    detail:   () => "Replacing vague lines with strong, metric-driven statements…"
  },
  {
    emoji: "📊",
    headline: () => "Measuring improvement",
    detail:   () => "Comparing the new score against the original…"
  },
  {
    emoji: "🎯",
    headline: () => "Pushing for up to 90%",
    detail:   () => "Fine-tuning keyword density and section alignment…"
  },
  {
    emoji: "✅",
    headline: () => "Verifying all changes",
    detail:   () => "Every added line is checked for accuracy and grammar…"
  }
];

export default function ResumeGenerationLoader({ name, role, isImproving = false }) {
  const steps = isImproving ? IMPROVE_STEPS : GENERATION_STEPS;
  const firstName = String(name || "").split(" ")[0];

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [typedText, setTypedText] = useState("");

  const progressRef = useRef(null);
  const stepRef = useRef(null);
  const typingRef = useRef(null);

  // Advance steps
  useEffect(() => {
    setStepIndex(0);
    const TOTAL_MS = 28000;
    const interval = Math.floor(TOTAL_MS / steps.length);
    stepRef.current = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, interval);
    return () => clearInterval(stepRef.current);
  }, [steps.length]);

  // Smooth progress bar (0→95 over ~28s)
  useEffect(() => {
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + 0.35, 95));
    }, 100);
    return () => clearInterval(progressRef.current);
  }, []);

  // Typing effect for the detail line
  const currentStep = steps[stepIndex];
  const fullDetail = currentStep.detail(firstName, role || "your target role");

  useEffect(() => {
    setTypedText("");
    let i = 0;
    clearInterval(typingRef.current);
    typingRef.current = setInterval(() => {
      i += 1;
      setTypedText(fullDetail.slice(0, i));
      if (i >= fullDetail.length) clearInterval(typingRef.current);
    }, 22);
    return () => clearInterval(typingRef.current);
  }, [fullDetail]);

  return (
    <div className="rgl-wrap">
      <motion.div
        className="rgl-card"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Logo row ── */}
        <div className="rgl-logo-row">
          <motion.div
            className="rgl-logo-badge"
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={18} />
          </motion.div>
          <span className="rgl-logo-label">
            {isImproving ? "Enhancing ATS Score" : "AI Resume Generation"}
          </span>
        </div>

        {/* ── Identity ── */}
        {!isImproving && (firstName || role) && (
          <div className="rgl-identity">
            {firstName && (
              <motion.strong
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {firstName}
              </motion.strong>
            )}
            {role && (
              <motion.span
                className="rgl-role-chip"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
              >
                {role}
              </motion.span>
            )}
          </div>
        )}

        {/* ── Animated stage ── */}
        <div className="rgl-stage">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              className="rgl-step-block"
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="rgl-emoji"
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {currentStep.emoji}
              </motion.div>
              <div className="rgl-step-text">
                <strong>{currentStep.headline(firstName, role || "")}</strong>
                <span className="rgl-typed">
                  {typedText}
                  <motion.span
                    className="rgl-cursor"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.7, repeat: Infinity }}
                  >|</motion.span>
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Progress bar ── */}
        <div className="rgl-progress-area">
          <div className="rgl-progress-track">
            <motion.div
              className="rgl-progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "linear" }}
            />
            <motion.div
              className="rgl-progress-glow"
              animate={{ left: `${Math.min(progress, 93)}%` }}
              transition={{ duration: 0.3, ease: "linear" }}
            />
          </div>
          <span className="rgl-progress-pct">{Math.round(progress)}%</span>
        </div>

        {/* ── Step dots ── */}
        <div className="rgl-dots">
          {steps.map((_, i) => (
            <motion.span
              key={i}
              className={`rgl-dot ${i < stepIndex ? "done" : ""} ${i === stepIndex ? "active" : ""}`}
              animate={i === stepIndex ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
          ))}
        </div>
        <p className="rgl-step-counter">
          Step {Math.min(stepIndex + 1, steps.length)} of {steps.length}
        </p>
      </motion.div>
    </div>
  );
}
