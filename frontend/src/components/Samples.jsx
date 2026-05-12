import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Briefcase, ChevronLeft, Eye, FileText } from "lucide-react";
import Preview from "./Preview.jsx";
import { normalizeResumeData } from "./resumeUtils.js";
import { sampleResumes } from "./sampleResumes.js";

const CATEGORY_ICONS = { Fresher: BookOpen, Experienced: Briefcase };

export default function Samples({ onBack, onNavigate }) {
  const getInitialSample = () => {
    const sampleId = new URLSearchParams(window.location.search).get("sample");
    return sampleResumes.find((sample) => sample.id === sampleId) || sampleResumes[0];
  };

  const [selected, setSelected] = useState(getInitialSample);
  const selectedResume = useMemo(() => normalizeResumeData(selected.data), [selected]);

  const selectSample = (sample) => {
    setSelected(sample);
    window.history.replaceState({}, "", `/samples?sample=${sample.id}`);
  };

  return (
    <div className="samples-page">
      <div className="builder-backdrop builder-backdrop-one" />
      <div className="builder-backdrop builder-backdrop-two" />

      {/* ── Compact header ── */}
      <header className="samples-header">
        <nav className="builder-brandbar samples-brandbar">
          <button
            className="brand-lockup builder-brand-lockup brand-home-link"
            onClick={onBack}
            title="Go to home"
          >
            <span className="brand-mark">R</span>
            <div>
              <p>ResumeAlignAI</p>
              <span>Sample Resume Library</span>
            </div>
          </button>
          <div className="samples-header-actions">
            <button className="builder-back-button" onClick={onBack}>
              <ChevronLeft size={16} aria-hidden="true" /> Back
            </button>
            <button
              className="hero-primary samples-build-cta"
              onClick={() => onNavigate(selected.category === "Fresher" ? "/fresher-builder" : "/builder")}
            >
              Build Your Own <ArrowRight size={14} />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Main shell ── */}
      <div className="samples-shell">

        {/* ── Sidebar: role selector ── */}
        <aside className="samples-sidebar">
          <p className="samples-sidebar-label">
            <Eye size={12} style={{ marginRight: 5 }} />
            Choose a role
          </p>

          <div className="samples-role-list">
            {sampleResumes.map((sample) => {
              const SIcon = CATEGORY_ICONS[sample.category] || FileText;
              const isActive = selected.id === sample.id;
              return (
                <button
                  key={sample.id}
                  className={`samples-role-btn ${isActive ? "is-active" : ""}`}
                  style={{ "--role-color": sample.color }}
                  onClick={() => selectSample(sample)}
                >
                  <span
                    className="srb-icon"
                    style={{ background: `${sample.color}1a`, color: sample.color }}
                  >
                    <SIcon size={15} />
                  </span>
                  <span className="srb-text">
                    <span className="srb-title">{sample.label}</span>
                    <span className="srb-desc">{sample.description}</span>
                  </span>
                  <span className="srb-badge" data-type={sample.category}>
                    {sample.category === "Fresher" ? "Fresher" : "Exp"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="samples-sidebar-cta">
            <p>Ready to build yours?</p>
            <button
              className="hero-primary"
              onClick={() => onNavigate(selected.category === "Fresher" ? "/fresher-builder" : "/builder")}
            >
              Build Your Own <ArrowRight size={13} />
            </button>
          </div>
        </aside>

        {/* ── Preview area ── */}
        <main className="samples-preview-area">
          {/* Info strip */}
          <div className="samples-preview-label">
            {(() => {
              const SIcon = CATEGORY_ICONS[selected.category] || FileText;
              return (
                <span className="srb-icon" style={{ background: `${selected.color}1a`, color: selected.color }}>
                  <SIcon size={15} />
                </span>
              );
            })()}
            <div className="samples-preview-meta">
              <strong>{selected.label}</strong>
              <span>{selected.data.fullName} · {selected.data.contact.location}</span>
            </div>
            <span className="srb-badge" data-type={selected.category}>{selected.category}</span>
            <span className="samples-watermark-badge">Sample</span>
          </div>

          {/* Resume preview — view only, no edit/payment */}
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Preview
              result={selectedResume}
              onChange={() => {}}
              defaultTemplate={selected.template}
              viewOnly
            />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
