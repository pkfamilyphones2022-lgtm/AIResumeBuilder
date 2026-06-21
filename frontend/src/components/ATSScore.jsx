import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle2, PlusCircle, Sparkles, Target, Zap } from "lucide-react";
import { parseAtsError } from "../utils/apiError.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TARGET = 90;

function ScoreRing({ score }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = circ - (score / 100) * circ;
  const color = score >= TARGET ? "#16a34a" : score >= 75 ? "#d97706" : "#dc2626";

  return (
    <div className="ats-ring-wrap">
      <svg width="136" height="136" viewBox="0 0 136 136" className="ats-ring-svg">
        <circle cx="68" cy="68" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <motion.circle
          cx="68" cy="68" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: dash }}
          transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
          transform="rotate(-90 68 68)"
        />
      </svg>
      <div className="ats-ring-center">
        <motion.span
          className="ats-ring-score"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          {score}
        </motion.span>
        <span className="ats-ring-label">/ 100</span>
      </div>
    </div>
  );
}

export default function ATSScore({ resume, job, jobTitle, initialData, result, onUpdateResume, onImprove }) {
  const [score, setScore] = useState(null);
  const [missing, setMissing] = useState([]);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const [guidance, setGuidance] = useState("");
  const [suggestions, setSuggestions] = useState({});
  const [loadingSuggest, setLoadingSuggest] = useState(null);
  const [added, setAdded] = useState(new Set());
  const [boosting, setBoosting] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    setScore(initialData.score);
    setMissing(initialData.missing || []);
    setGuidance(initialData.guidance || "");
    setDetails({
      matchedCount: initialData.matchedCount,
      totalKeywords: initialData.totalKeywords,
      matchedPhrases: initialData.matchedPhrases,
      missingDetails: initialData.missingDetails,
      checkedItems: initialData.checkedItems,
      requiredTerms: initialData.requiredTerms,
      breakdown: initialData.breakdown
    });
  }, [initialData]);

  const check = async () => {
    setError("");
    setChecking(true);
    try {
      const response = await axios.post(`${API}/ats`, { resumeText: resume, jobDescription: job, jobTitle });
      setScore(response.data.score);
      setMissing(response.data.missing || []);
      setDetails({
        matchedCount: response.data.matchedCount,
        totalKeywords: response.data.totalKeywords,
        matchedPhrases: response.data.matchedPhrases,
        missingDetails: response.data.missingDetails,
        checkedItems: response.data.checkedItems,
        requiredTerms: response.data.requiredTerms,
        breakdown: response.data.breakdown
      });
      setGuidance(
        response.data.score >= TARGET
          ? "Excellent! Your resume is well-optimised for this role."
          : response.data.score >= 75
          ? "Good match — a few more targeted keywords can push you to 90%."
          : "Boost your score by incorporating the suggested keywords below."
      );
    } catch (err) {
      setError(parseAtsError(err));
    } finally {
      setChecking(false);
    }
  };

  const getKeywordText = (keyword) => (typeof keyword === "string" ? keyword : keyword?.term || "");

  const addToSkills = (keyword) => {
    const keywordText = getKeywordText(keyword);
    if (!keywordText) return;
    if (!result || !onUpdateResume) return;
    onUpdateResume((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), keywordText]
    }));
    setAdded((prev) => new Set([...prev, keywordText]));
  };

  const getSuggestion = async (keyword) => {
    const keywordText = getKeywordText(keyword);
    if (!keywordText || suggestions[keywordText] !== undefined) return;
    setLoadingSuggest(keywordText);
    try {
      const response = await axios.post(`${API}/suggest`, {
        keywords: [keywordText],
        jobDescription: job,
        resumeData: result || {}
      });
      const s = response.data.suggestions?.[0];
      if (s) setSuggestions((prev) => ({ ...prev, [keywordText]: s }));
    } catch {
      setSuggestions((prev) => ({ ...prev, [keywordText]: null }));
    } finally {
      setLoadingSuggest(null);
    }
  };

  const applySuggestion = (keyword, section, text) => {
    if (!result || !onUpdateResume) return;
    onUpdateResume((prev) => {
      const next = { ...prev };
      if (section === "summary") {
        next.summary = prev.summary ? `${prev.summary} ${text}` : text;
      } else if (section === "skills") {
        next.skills = [...(prev.skills || []), text];
      } else if (section === "experience" && prev.experience?.length > 0) {
        next.experience = prev.experience.map((exp, i) =>
          i === 0 ? { ...exp, bullets: [...(exp.bullets || []), text] } : exp
        );
      }
      return next;
    });
    const keywordText = getKeywordText(keyword);
    setAdded((prev) => new Set([...prev, keywordText]));
    setSuggestions((prev) => { const n = { ...prev }; delete n[keywordText]; return n; });
  };

  const boost = async () => {
    if (!onImprove) return;
    setBoosting(true);
    const failedChecks = (details?.checkedItems || [])
      .filter((item) => !item.passed)
      .map((item) => ({ label: item.label, detail: item.detail, importance: item.importance }));
    try {
      await onImprove(missing, score, failedChecks);
    } finally {
      setBoosting(false);
    }
  };

  const gap = score !== null ? Math.max(0, TARGET - score) : null;

  return (
    <motion.div
      className="ats-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="ats-panel-head">
        <div className="ats-panel-title">
          <Target size={18} />
          <strong>ATS Match Score</strong>
          <span className="ats-target-badge">Target: {TARGET}%</span>
        </div>
        <button className="ats-refresh-btn" onClick={check} disabled={checking}>
          <Activity size={16} />
          {checking ? "Checking…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: 8 }}>
          <span>⚠</span>
          <span>{error}</span>
          <button className="error-banner-close" onClick={() => setError("")} aria-label="Dismiss">✕</button>
        </div>
      )}

      {score !== null && (
        <motion.div
          className="ats-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="ats-score-row">
            <ScoreRing score={score} />
            <div className="ats-score-meta">
              <p className="ats-matched-label">
                {details?.matchedCount || 0} / {details?.totalKeywords || 0} keywords matched
              </p>
              {gap > 0 && (
                <p className="ats-gap-label">
                  <span className="ats-gap-num">+{gap} pts</span> to reach {TARGET}%
                </p>
              )}
              {gap === 0 && (
                <p className="ats-pass-label">
                  <CheckCircle2 size={15} /> Passing threshold reached!
                </p>
              )}
              {guidance && (
                <p className={`ats-guidance-text ${score >= TARGET ? "good-guidance" : ""}`}>{guidance}</p>
              )}
              <div className="ats-breakdown">
                <span>Keywords {details?.breakdown?.keywordCoverage || 0}%</span>
                <span>Important terms {details?.breakdown?.importantCoverage || 0}%</span>
                <span>Phrases {details?.breakdown?.phraseCoverage || 0}%</span>
                <span>Sections {details?.breakdown?.sectionCoverage || 0}%</span>
                <span>Polish {details?.breakdown?.polishScore || 0}%</span>
              </div>
              {onImprove && score < TARGET && (
                <motion.button
                  className="ats-boost-btn ats-boost-inline"
                  onClick={boost}
                  disabled={boosting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles size={16} />
                  {boosting ? "AI is verifying and enhancing..." : "Enhance more to 90+ ATS"}
                </motion.button>
              )}
            </div>
          </div>

          {details?.matchedPhrases?.length > 0 && (
            <div className="ats-matched-phrases">
              <h3>Matched Phrases</h3>
              <div className="ats-phrase-chips">
                {details.matchedPhrases.map((phrase) => (
                  <span key={phrase} className="ats-phrase-chip">{phrase}</span>
                ))}
              </div>
            </div>
          )}

          {details?.checkedItems?.length > 0 && (
            <div className="ats-checked-block">
              <h3>ATS Compliance Checklist</h3>
              <div className="ats-check-list">
                {[...details.checkedItems]
                  .sort((a, b) => {
                    // Failed high → Failed medium → Passed high → Passed medium
                    const rank = (item) =>
                      !item.passed && item.importance === "high" ? 0 :
                      !item.passed && item.importance === "medium" ? 1 :
                      item.passed && item.importance === "high" ? 2 : 3;
                    return rank(a) - rank(b);
                  })
                  .map((item) => (
                    <div key={item.label} className={`ats-check-item ${item.passed ? "is-pass" : "is-gap"}`}>
                      <CheckCircle2 size={15} />
                      <div className="ats-check-body">
                        <div className="ats-check-title">
                          <strong>{item.label}</strong>
                          <span className={`ats-importance-badge importance-${item.importance || "high"}`}>
                            {item.importance === "medium" ? "Medium" : "High"}
                          </span>
                        </div>
                        <p>{item.detail}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {details?.requiredTerms?.length > 0 && (
            <div className="ats-required-block">
              <h3>Should Be Present In Resume</h3>
              <div className="ats-required-terms">
                {details.requiredTerms.slice(0, 14).map((item) => (
                  <span key={item.term} className={item.present ? "term-present" : "term-missing"}>
                    {item.term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missing.length > 0 && score < TARGET && (
            <div className="ats-suggestions-block">
              <div className="ats-suggestions-head">
                <Zap size={15} />
                <h3>Quick wins - add these role/JD terms to reach {TARGET}%</h3>
              </div>
              <div className="ats-kw-list">
                {missing.slice(0, 8).map((word) => {
                  const keywordText = getKeywordText(word);
                  const detail = details?.missingDetails?.find((item) => item.term === keywordText);
                  const isAdded = added.has(keywordText);
                  const hasSuggestion = suggestions[keywordText];
                  const loadingThis = loadingSuggest === keywordText;
                  return (
                    <div key={keywordText} className={`ats-kw-item ${isAdded ? "ats-kw-done" : ""}`}>
                      <div className="ats-kw-main">
                        <span className="ats-kw-word">{keywordText}</span>
                        {detail?.source && <span className="ats-kw-source">{detail.source}</span>}
                      </div>
                      {detail?.reason && <p className="ats-kw-reason">{detail.reason}</p>}
                      {!isAdded && (
                        <div className="ats-kw-actions">
                          <button
                            className="ats-kw-btn ats-kw-add"
                            title="Add to Skills"
                            onClick={() => addToSkills(keywordText)}
                          >
                            <PlusCircle size={13} />
                            Add to Skills
                          </button>
                          <button
                            className="ats-kw-btn ats-kw-ai"
                            title="Get AI sentence suggestion"
                            onClick={() => getSuggestion(keywordText)}
                            disabled={loadingThis}
                          >
                            <Sparkles size={13} />
                            {loadingThis ? "..." : "AI Suggest"}
                          </button>
                        </div>
                      )}
                      {isAdded && <span className="ats-kw-check"><CheckCircle2 size={14} /> Added</span>}
                      <AnimatePresence>
                        {hasSuggestion && !isAdded && (
                          <motion.div
                            className="ats-suggestion-card"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <p className="ats-suggestion-text">
                              <span className="ats-suggestion-section">{hasSuggestion.section}</span>
                              {hasSuggestion.text}
                            </p>
                            <button
                              className="ats-suggestion-apply"
                              onClick={() => applySuggestion(keywordText, hasSuggestion.section, hasSuggestion.text)}
                            >
                              <CheckCircle2 size={13} />
                              Add to Resume
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </motion.div>
      )}

      {score === null && (
        <p className="ats-empty">Click Refresh to check your ATS match score against the job description.</p>
      )}
    </motion.div>
  );
}
