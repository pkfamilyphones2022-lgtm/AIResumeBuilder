import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, BookOpen, Briefcase, CheckCircle2, FileText,
  FolderOpen, Info, Plus, Sparkles, Target, Trash2, Upload, User
} from "lucide-react";
import Preview from "./Preview.jsx";
import ResumeGenerationLoader from "./ResumeGenerationLoader.jsx";
import ATSScore from "./ATSScore.jsx";
import { normalizeResumeData, resumeToPlainText } from "./resumeUtils.js";
import { parseUploadError, parseGenerateError } from "../utils/apiError.js";
import { getSubscription, refreshSubscriptionStatus } from "./Payment.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const mkExp = () => ({ role: "", company: "", empType: "Full-time", duration: "", location: "", responsibilities: "" });
const mkProject = () => ({ name: "", subtitle: "", duration: "", bullets: "" });
const mkEdu = () => ({ degree: "", institution: "", duration: "", details: "" });
const mkTraining = () => ({ role: "", organization: "", duration: "", location: "", learning: "" });

const createInitialForm = (type = "Experienced") => ({
  type,
  name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  portfolio: "",
  targetTitle: "",
  company: "",
  seniority: type === "Fresher" ? "Entry Level" : "Mid-level",
  industry: "",
  yearsOfExp: "",
  fresherObjective: "",
  coursework: "",
  achievements: "",
  trainingList: [],
  skills: "",
  certifications: "",
  languages: "",
  experiences: [],
  projectsList: [],
  educationList: [],
  job: ""
});

const fieldAnim = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.35 } })
};

const sectionAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

function SectionHeader({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="form-section-head">
      <div className="form-section-title">
        <Icon size={18} />
        <div>
          <strong>{title}</strong>
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>
      {children}
    </div>
  );
}

function RequiredLabel({ children }) {
  return (
    <span className="field-label">
      {children}
      <span className="required-star" aria-label="required">*</span>
    </span>
  );
}

function OptionalLabel({ children }) {
  return (
    <span className="field-label">{children}</span>
  );
}

export default function Form({ mode = "experienced" }) {
  const fixedType = mode === "fresher" ? "Fresher" : "Experienced";
  const [form, setForm] = useState(() => createInitialForm(fixedType));
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState(null);
  const [atsData, setAtsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Building your AI resume…");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadHint, setUploadHint] = useState("");
  const [previewActive, setPreviewActive] = useState(false);
  const [userId, setUserId] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [isImproving, setIsImproving] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [website, setWebsite] = useState("");
  const [subscription, setSubscription] = useState(() => getSubscription());

  // Refresh subscription status on mount so the badge reflects truth.
  useEffect(() => {
    refreshSubscriptionStatus().then(setSubscription).catch(() => {});
  }, []);

  const set = (field, value) => setForm((c) => ({ ...c, [field]: value }));

  const loadChallenge = async () => {
    try {
      const response = await axios.get(`${API}/challenge`);
      setChallenge(response.data);
      setChallengeAnswer("");
    } catch {
      setChallenge(null);
    }
  };

  useEffect(() => {
    loadChallenge();
  }, []);

  const addEntry = (field, template) =>
    setForm((c) => ({ ...c, [field]: [...c[field], template] }));

  const removeEntry = (field, i) =>
    setForm((c) => ({ ...c, [field]: c[field].filter((_, idx) => idx !== i) }));

  const updateEntry = (field, i, key, value) =>
    setForm((c) => ({
      ...c,
      [field]: c[field].map((item, idx) => (idx === i ? { ...item, [key]: value } : item))
    }));

  /* Convert structured form arrays → AI-ready payload */
  const buildUserData = () => ({
    type: fixedType,
    name: form.name,
    email: form.email,
    phone: form.phone,
    location: form.location,
    linkedin: form.linkedin,
    portfolio: form.portfolio,
    targetTitle: form.targetTitle,
    company: form.company,
    seniority: form.seniority,
    industry: form.industry,
    yearsOfExp: form.yearsOfExp,
    fresherObjective: form.fresherObjective,
    coursework: form.coursework,
    achievements: form.achievements,
    skills: form.skills,
    certifications: form.certifications,
    languages: form.languages,
    resumeRulesMode: fixedType === "Fresher" ? "fresher-student" : "experienced-professional",
    training: form.trainingList
      .filter((item) => item.role || item.organization || item.learning)
      .map((item) => ({
        role: item.role,
        organization: item.organization,
        duration: item.duration,
        location: item.location,
        bullets: item.learning
          .split("\n")
          .map((s) => s.replace(/^[-*]\s*/, "").trim())
          .filter(Boolean)
      })),
    experience: form.experiences
      .filter((e) => e.role || e.company)
      .map((e) => ({
        role: e.role,
        company: e.company,
        duration: e.duration,
        location: e.location,
        empType: e.empType,
        bullets: e.responsibilities
          .split("\n")
          .map((s) => s.replace(/^[-*]\s*/, "").trim())
          .filter(Boolean)
      })),
    projects: form.projectsList
      .filter((p) => p.name)
      .map((p) => ({
        name: p.name,
        subtitle: p.subtitle,
        duration: p.duration,
        bullets: p.bullets
          .split("\n")
          .map((s) => s.replace(/^[-*]\s*/, "").trim())
          .filter(Boolean)
      })),
    education: form.educationList
      .filter((e) => e.degree || e.institution)
      .map((e) => ({
        degree: e.degree,
        institution: e.institution,
        duration: e.duration,
        details: e.details
      }))
  });

  const upload = async (file) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const data = new FormData();
      data.append("resume", file);
      const response = await axios.post(`${API}/upload`, data);
      setResumeText(response.data.text);
      if (response.data.parsedData) {
        const SKIP = new Set(["type", "job", "experience", "projects", "education", "certifications"]);
        const parsed = response.data.parsedData;
        const updates = Object.fromEntries(
          Object.entries(parsed).filter(([key, value]) => !SKIP.has(key) && value)
        );
        setForm((current) => {
          const next = { ...current };
          Object.entries(updates).forEach(([key, value]) => {
            if (key === "skills") {
              // Parser returns comma-separated; form textarea expects one per line
              if (!current[key]) {
                next[key] = value.split(",").map((s) => s.trim()).filter(Boolean).join("\n");
              }
            } else if (!current[key]) {
              next[key] = value;
            }
          });
          return next;
        });
        const FIELD_LABELS = {
          name: "Name", email: "Email", phone: "Phone",
          targetTitle: "Target job title", location: "Location",
          linkedin: "LinkedIn", portfolio: "Portfolio"
        };
        const filled = ["name", "email", "phone", "targetTitle", "location", "linkedin", "portfolio"]
          .filter((k) => updates[k])
          .map((k) => FIELD_LABELS[k] || k);
        const filledMsg = filled.length > 0
          ? `Auto-filled: ${filled.join(", ")}. Review and complete any missing fields.`
          : "Resume parsed — fill in your details above then generate.";
        setUploadHint(filledMsg);
      } else {
        setUploadHint("Resume parsed — AI will use it as foundation and significantly improve content for your target role.");
      }
    } catch (err) {
      setError(parseUploadError(err));
    } finally {
      setUploading(false);
    }
  };

  /* Fix #2 — validate required fields before hitting the API */
  const validate = () => {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.email.trim()) return "Please enter a professional email address.";
    if (!form.phone.trim()) return "Please enter your phone number.";
    if (!form.targetTitle.trim()) return "Please enter the target job title.";
    const userData = buildUserData();
    const hasContent =
      userData.experience.length > 0 ||
      userData.projects.length > 0 ||
      userData.education.length > 0 ||
      userData.training.length > 0 ||
      form.coursework.trim() ||
      form.achievements.trim() ||
      form.skills.trim() ||
      resumeText;
    if (!hasContent)
      return "Add at least one experience, project, or education entry so the AI has content to work with.";
    if (!challenge?.challengeId || !challengeAnswer.trim())
      return "Please complete the security check before generating.";
    return null;
  };

  const generate = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setPreviewActive(true);
    setError("");
    setIsImproving(false);
    setLoading(true);
    setLoadingMsg("Building your AI resume…");
    setResult(null);
    setAtsData(null);
    try {
      const response = await axios.post(`${API}/generate`, {
        userData: buildUserData(),
        jobDescription: form.job,
        resumeText,
        challengeId: challenge?.challengeId,
        challengeAnswer,
        website
      });
      setResult(normalizeResumeData(response.data.result));
      setAtsData(response.data.ats || null);
      if (response.data.userId) setUserId(response.data.userId);
      if (response.data.resumeId) setResumeId(response.data.resumeId);
    } catch (err) {
      setError(parseGenerateError(err));
      loadChallenge();
    } finally {
      setLoading(false);
    }
  };

  const improve = async (missingKeywords, currentScore, failedChecks) => {
    setPreviewActive(true);
    setError("");
    setIsImproving(true);
    setLoading(true);
    setLoadingMsg("Improving ATS alignment…");
    try {
      const response = await axios.post(`${API}/improve`, {
        resumeData: result,
        userData: buildUserData(),
        jobDescription: form.job,
        missingKeywords,
        currentScore,
        failedChecks: failedChecks || []
      });
      setResult(normalizeResumeData(response.data.result));
      setAtsData(response.data.ats || null);
    } catch (err) {
      setError(parseGenerateError(err));
    } finally {
      setLoading(false);
      setIsImproving(false);
    }
  };

  const isExperienced = fixedType === "Experienced";

  return (
    <div className="app-shell">
      {/* ─────────────────── LEFT PANEL ─────────────────── */}
      <motion.section
        className="builder-panel"
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.5 }}
      >
        <div className="brand-row">
          <div>
            <p className="eyebrow">Resume Workshop</p>
            <h1>{isExperienced ? "Generate your experienced resume" : "Generate your fresher resume"}</h1>
            {subscription && subscription.remaining > 0 && (
              <span className="weekly-pass-pill" style={{ marginTop: 10 }}>
                Weekly Pass
                <span className="weekly-pass-pill-count">{subscription.remaining} of {subscription.downloadsLimit || 15} left</span>
              </span>
            )}
          </div>
          <FileText aria-hidden="true" />
        </div>

        <div className="mandatory-info-banner">
          <Info size={15} aria-hidden="true" />
          <span>
            Fields marked <span className="required-star">*</span> are required. Fill all mandatory fields and add at least one experience, project, or education entry before generating.
          </span>
        </div>

        {/* ── SECTION 1: Candidate Profile ── */}
        <motion.div className="form-section" variants={sectionAnim} initial="hidden" animate="show">
          <SectionHeader
            icon={User}
            title="Candidate Profile"
            subtitle="Who you are and what role you're targeting"
          />
          <div className="form-grid">
            <motion.label custom={1} variants={fieldAnim} initial="hidden" animate="show">
              <RequiredLabel>Seniority level</RequiredLabel>
              <select value={form.seniority} onChange={(e) => set("seniority", e.target.value)}>
                {isExperienced ? (
                  <>
                    <option>Junior</option>
                    <option>Mid-level</option>
                    <option>Senior</option>
                    <option>Lead / Principal</option>
                    <option>Manager</option>
                    <option>Director+</option>
                  </>
                ) : (
                  <>
                    <option>Internship</option>
                    <option>Entry Level</option>
                    <option>Junior</option>
                  </>
                )}
              </select>
            </motion.label>

            <motion.label custom={2} variants={fieldAnim} initial="hidden" animate="show">
              <RequiredLabel>Full name</RequiredLabel>
              <input placeholder="e.g. Priya Sharma" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </motion.label>

            <motion.label custom={3} variants={fieldAnim} initial="hidden" animate="show">
              <RequiredLabel>Email</RequiredLabel>
              <input type="email" placeholder="e.g. priya@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </motion.label>

            <motion.label custom={4} variants={fieldAnim} initial="hidden" animate="show">
              <RequiredLabel>Phone</RequiredLabel>
              <input placeholder="e.g. +91 98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </motion.label>

            <motion.label custom={5} variants={fieldAnim} initial="hidden" animate="show">
              <OptionalLabel>Location</OptionalLabel>
              <input placeholder="e.g. Bengaluru, India" value={form.location} onChange={(e) => set("location", e.target.value)} />
            </motion.label>

            <motion.label custom={6} variants={fieldAnim} initial="hidden" animate="show">
              <RequiredLabel>Target job title</RequiredLabel>
              <input
                placeholder="e.g. Senior Frontend Engineer"
                value={form.targetTitle}
                onChange={(e) => set("targetTitle", e.target.value)}
              />
            </motion.label>

            {isExperienced && (
              <motion.label custom={7} variants={fieldAnim} initial="hidden" animate="show">
                <OptionalLabel>Years of experience</OptionalLabel>
                <select value={form.yearsOfExp} onChange={(e) => set("yearsOfExp", e.target.value)}>
                  <option value="">Select range</option>
                  <option>1–2 years</option>
                  <option>3–5 years</option>
                  <option>5–8 years</option>
                  <option>8–12 years</option>
                  <option>12+ years</option>
                </select>
              </motion.label>
            )}

            <motion.label custom={8} variants={fieldAnim} initial="hidden" animate="show">
              <OptionalLabel>Target company</OptionalLabel>
              <input
                placeholder="e.g. Google, Zomato, any startup…"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </motion.label>

            <motion.label custom={9} variants={fieldAnim} initial="hidden" animate="show">
              <OptionalLabel>Industry / Sector</OptionalLabel>
              <input
                placeholder="e.g. Fintech, Healthcare, SaaS…"
                value={form.industry}
                onChange={(e) => set("industry", e.target.value)}
              />
            </motion.label>

            <motion.label custom={10} variants={fieldAnim} initial="hidden" animate="show">
              <OptionalLabel>LinkedIn</OptionalLabel>
              <input
                placeholder="e.g. linkedin.com/in/priya-sharma"
                value={form.linkedin}
                onChange={(e) => set("linkedin", e.target.value)}
              />
            </motion.label>

            <motion.label custom={11} variants={fieldAnim} initial="hidden" animate="show">
              <OptionalLabel>Portfolio / GitHub</OptionalLabel>
              <input
                placeholder="e.g. github.com/username or portfolio.io"
                value={form.portfolio}
                onChange={(e) => set("portfolio", e.target.value)}
              />
            </motion.label>
          </div>
        </motion.div>

        {/* ── SECTION 2: Work Experience (Experienced candidates) ── */}
        <AnimatePresence>
          {isExperienced && (
            <motion.div
              className="form-section"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
            >
              <SectionHeader
                icon={Briefcase}
                title="Work Experience"
                subtitle="Add each role separately — most recent first"
              >
                <button className="mini-action" onClick={() => addEntry("experiences", mkExp())}>
                  <Plus size={14} /> Add Role
                </button>
              </SectionHeader>

              {form.experiences.length === 0 && (
                <p className="form-empty-hint">
                  Click <strong>Add Role</strong> to add your work history. Each role gets its own section on the resume.
                </p>
              )}

              {form.experiences.map((exp, i) => (
                <motion.div
                  key={`exp-${i}`}
                  className="form-entry-block"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="entry-block-head">
                    <span className="entry-block-label">
                      <Briefcase size={13} />
                      {exp.role || exp.company
                        ? `${exp.role || "Role"}${exp.company ? ` · ${exp.company}` : ""}`
                        : `Experience ${i + 1}`}
                    </span>
                    <button className="mini-danger" onClick={() => removeEntry("experiences", i)}>
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>

                  <div className="entry-grid-2">
                    <label>
                      Job title / Role
                      <input
                        placeholder="e.g. Senior Software Engineer"
                        value={exp.role}
                        onChange={(e) => updateEntry("experiences", i, "role", e.target.value)}
                      />
                    </label>
                    <label>
                      Company name
                      <input
                        placeholder="e.g. Infosys, Google, TCS…"
                        value={exp.company}
                        onChange={(e) => updateEntry("experiences", i, "company", e.target.value)}
                      />
                    </label>
                    <label>
                      Duration
                      <input
                        placeholder="e.g. Jan 2022 – Present"
                        value={exp.duration}
                        onChange={(e) => updateEntry("experiences", i, "duration", e.target.value)}
                      />
                    </label>
                    <label>
                      Location / Mode
                      <input
                        placeholder="e.g. Bengaluru / Remote / Hybrid"
                        value={exp.location}
                        onChange={(e) => updateEntry("experiences", i, "location", e.target.value)}
                      />
                    </label>
                    <label>
                      Employment type
                      <select
                        value={exp.empType}
                        onChange={(e) => updateEntry("experiences", i, "empType", e.target.value)}
                      >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Freelance</option>
                        <option>Internship</option>
                      </select>
                    </label>
                  </div>

                  <label className="wide">
                    Key responsibilities & achievements
                    <span className="field-optional"> (one per line — AI rewrites as strong bullets)</span>
                    <textarea
                      rows={4}
                      placeholder={"Led a team of 5 engineers to deliver payment integration\nReduced API response time by 40% through Redis caching\nMentored 3 junior developers and conducted weekly code reviews"}
                      value={exp.responsibilities}
                      onChange={(e) => updateEntry("experiences", i, "responsibilities", e.target.value)}
                    />
                  </label>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SECTION 2B: Fresher Resume Inputs ── */}
        <AnimatePresence>
          {!isExperienced && (
            <motion.div
              className="form-section fresher-section"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
            >
              <SectionHeader
                icon={BookOpen}
                title="Fresher Resume Builder"
                subtitle="Use education, projects, internships, coursework, and achievements as proof"
              />

              <div className="fresher-rule-strip">
                <span>Fresher logic active</span>
                <p>AI will prioritize Career Objective, Technical Skills, Academic Projects, Internship / Training, Education, Certifications, and Achievements.</p>
              </div>

              <div className="form-grid">
                <motion.label custom={0} variants={fieldAnim} initial="hidden" animate="show" className="wide">
                  Career objective
                  <textarea
                    rows={2}
                    placeholder="Detail-oriented Computer Science graduate seeking a Junior Software Developer role to apply React, Node.js, and database skills in building reliable web applications."
                    value={form.fresherObjective}
                    onChange={(e) => set("fresherObjective", e.target.value)}
                  />
                </motion.label>

                <motion.label custom={1} variants={fieldAnim} initial="hidden" animate="show" className="wide">
                  Relevant coursework / core concepts <span className="field-optional">(one per line)</span>
                  <textarea
                    rows={3}
                    placeholder={"Data Structures and Algorithms\nDatabase Management Systems\nOperating Systems\nComputer Networks"}
                    value={form.coursework}
                    onChange={(e) => set("coursework", e.target.value)}
                  />
                </motion.label>

                <motion.label custom={2} variants={fieldAnim} initial="hidden" animate="show" className="wide">
                  Achievements / activities <span className="field-optional">(one per line)</span>
                  <textarea
                    rows={3}
                    placeholder={"Won 1st place in college hackathon among 40+ teams\nCompleted 100+ coding problems on LeetCode\nLed technical club workshop for 60 students"}
                    value={form.achievements}
                    onChange={(e) => set("achievements", e.target.value)}
                  />
                </motion.label>
              </div>

              <SectionHeader
                icon={Award}
                title="Internship / Training"
                subtitle="Add internships, bootcamps, industrial training, or workshops"
              >
                <button className="mini-action" onClick={() => addEntry("trainingList", mkTraining())}>
                  <Plus size={14} /> Add Training
                </button>
              </SectionHeader>

              {form.trainingList.length === 0 && (
                <p className="form-empty-hint">
                  Add internship/training only if you have it. If not, projects and coursework will carry the fresher resume.
                </p>
              )}

              {form.trainingList.map((item, i) => (
                <motion.div
                  key={`training-${i}`}
                  className="form-entry-block"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="entry-block-head">
                    <span className="entry-block-label">
                      <Award size={13} />
                      {item.role || item.organization
                        ? `${item.role || "Training"}${item.organization ? ` · ${item.organization}` : ""}`
                        : `Training ${i + 1}`}
                    </span>
                    <button className="mini-danger" onClick={() => removeEntry("trainingList", i)}>
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>

                  <div className="entry-grid-2">
                    <label>
                      Role / Training title
                      <input
                        placeholder="e.g. Frontend Intern / Java Full Stack Training"
                        value={item.role}
                        onChange={(e) => updateEntry("trainingList", i, "role", e.target.value)}
                      />
                    </label>
                    <label>
                      Organization
                      <input
                        placeholder="e.g. Company, college, training institute"
                        value={item.organization}
                        onChange={(e) => updateEntry("trainingList", i, "organization", e.target.value)}
                      />
                    </label>
                    <label>
                      Duration
                      <input
                        placeholder="e.g. Jun 2024 – Aug 2024"
                        value={item.duration}
                        onChange={(e) => updateEntry("trainingList", i, "duration", e.target.value)}
                      />
                    </label>
                    <label>
                      Location / Mode
                      <input
                        placeholder="e.g. Pune / Remote"
                        value={item.location}
                        onChange={(e) => updateEntry("trainingList", i, "location", e.target.value)}
                      />
                    </label>
                  </div>

                  <label className="wide">
                    What you learned or delivered <span className="field-optional">(one point per line)</span>
                    <textarea
                      rows={3}
                      placeholder={"Built reusable React components for a dashboard UI\nPracticed REST API integration and Git workflow\nCompleted capstone project using Node.js and MongoDB"}
                      value={item.learning}
                      onChange={(e) => updateEntry("trainingList", i, "learning", e.target.value)}
                    />
                  </label>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SECTION 3: Projects ── */}
        <motion.div className="form-section" variants={sectionAnim} initial="hidden" animate="show">
          <SectionHeader
            icon={FolderOpen}
            title={isExperienced ? "Notable Projects" : "Academic Projects"}
            subtitle={
              isExperienced
                ? "Key projects from your career — tech used, scope, and measurable impact"
                : "Showcase your best work — what you built, how, and the result"
            }
          >
            <button className="mini-action" onClick={() => addEntry("projectsList", mkProject())}>
              <Plus size={14} /> Add Project
            </button>
          </SectionHeader>

          {form.projectsList.length === 0 && (
            <p className="form-empty-hint">
              Click <strong>Add Project</strong> to add projects. Strong project entries dramatically improve ATS scores for both freshers and experienced candidates.
            </p>
          )}

          {form.projectsList.map((proj, i) => (
            <motion.div
              key={`proj-${i}`}
              className="form-entry-block"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
            >
              <div className="entry-block-head">
                <span className="entry-block-label">
                  <FolderOpen size={13} />
                  {proj.name || `Project ${i + 1}`}
                </span>
                <button className="mini-danger" onClick={() => removeEntry("projectsList", i)}>
                  <Trash2 size={13} /> Remove
                </button>
              </div>

              <div className="entry-grid-2">
                <label>
                  Project name
                  <input
                    placeholder="e.g. E-Commerce Platform"
                    value={proj.name}
                    onChange={(e) => updateEntry("projectsList", i, "name", e.target.value)}
                  />
                </label>
                <label>
                  Tech stack / Subtitle
                  <input
                    placeholder="e.g. React, Node.js, PostgreSQL, AWS"
                    value={proj.subtitle}
                    onChange={(e) => updateEntry("projectsList", i, "subtitle", e.target.value)}
                  />
                </label>
                <label>
                  Duration / Year
                  <input
                    placeholder="e.g. 2024 or Jan – Mar 2024"
                    value={proj.duration}
                    onChange={(e) => updateEntry("projectsList", i, "duration", e.target.value)}
                  />
                </label>
              </div>

              <label className="wide">
                What it does & your impact <span className="field-optional">(one point per line)</span>
                <textarea
                  rows={3}
                  placeholder={"Built real-time inventory system handling 500+ SKUs\nReduced checkout latency by 30% with query optimisation\nDeployed on AWS ECS with automated CI/CD pipeline"}
                  value={proj.bullets}
                  onChange={(e) => updateEntry("projectsList", i, "bullets", e.target.value)}
                />
              </label>
            </motion.div>
          ))}
        </motion.div>

        {/* ── SECTION 4: Education ── */}
        <motion.div className="form-section" variants={sectionAnim} initial="hidden" animate="show">
          <SectionHeader
            icon={BookOpen}
            title="Education"
            subtitle="Degrees, diplomas, and relevant coursework"
          >
            <button className="mini-action" onClick={() => addEntry("educationList", mkEdu())}>
              <Plus size={14} /> Add Education
            </button>
          </SectionHeader>

          {form.educationList.length === 0 && (
            <p className="form-empty-hint">
              Click <strong>Add Education</strong> to add your academic background.
            </p>
          )}

          {form.educationList.map((edu, i) => (
            <motion.div
              key={`edu-${i}`}
              className="form-entry-block"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
            >
              <div className="entry-block-head">
                <span className="entry-block-label">
                  <BookOpen size={13} />
                  {edu.degree || edu.institution
                    ? `${edu.degree || "Degree"}${edu.institution ? ` · ${edu.institution}` : ""}`
                    : `Education ${i + 1}`}
                </span>
                <button className="mini-danger" onClick={() => removeEntry("educationList", i)}>
                  <Trash2 size={13} /> Remove
                </button>
              </div>

              <div className="entry-grid-2">
                <label>
                  Degree / Qualification
                  <input
                    placeholder="e.g. B.Tech in Computer Science"
                    value={edu.degree}
                    onChange={(e) => updateEntry("educationList", i, "degree", e.target.value)}
                  />
                </label>
                <label>
                  Institution / University
                  <input
                    placeholder="e.g. IIT Bangalore / VTU"
                    value={edu.institution}
                    onChange={(e) => updateEntry("educationList", i, "institution", e.target.value)}
                  />
                </label>
                <label>
                  Duration / Year
                  <input
                    placeholder="e.g. 2019 – 2023"
                    value={edu.duration}
                    onChange={(e) => updateEntry("educationList", i, "duration", e.target.value)}
                  />
                </label>
                <label>
                  CGPA / Score / Specialization
                  <input
                    placeholder="e.g. 8.4 CGPA · First Class · ML Specialization"
                    value={edu.details}
                    onChange={(e) => updateEntry("educationList", i, "details", e.target.value)}
                  />
                </label>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── SECTION 5: Skills & Certifications ── */}
        <motion.div className="form-section" variants={sectionAnim} initial="hidden" animate="show">
          <SectionHeader
            icon={Award}
            title={isExperienced ? "Skills & Certifications" : "Technical Skills & Certifications"}
            subtitle="Technical skills, tools, frameworks, and credentials"
          />
          <div className="form-grid">
            <motion.label custom={0} variants={fieldAnim} initial="hidden" animate="show" className="wide">
              Technical & professional skills <span className="field-optional">(one per line)</span>
              <textarea
                rows={5}
                placeholder={"React.js\nNode.js\nPostgreSQL\nSystem Design\nTeam Leadership\nCI/CD · Docker · AWS"}
                value={form.skills}
                onChange={(e) => set("skills", e.target.value)}
              />
            </motion.label>

            <motion.label custom={1} variants={fieldAnim} initial="hidden" animate="show" className="wide">
              Certifications
              <textarea
                rows={2}
                placeholder={"AWS Certified Solutions Architect\nGoogle Professional Data Engineer"}
                value={form.certifications}
                onChange={(e) => set("certifications", e.target.value)}
              />
            </motion.label>

            {isExperienced && (
              <motion.label custom={2} variants={fieldAnim} initial="hidden" animate="show" className="wide">
                Languages <span className="field-optional">(one per line)</span>
                <textarea
                  rows={2}
                  placeholder={"English\nHindi\nMarathi"}
                  value={form.languages}
                  onChange={(e) => set("languages", e.target.value)}
                />
              </motion.label>
            )}

          </div>
        </motion.div>

        {/* Resume Upload */}
        <motion.div className="form-section" variants={sectionAnim} initial="hidden" animate="show">
          <SectionHeader
            icon={Upload}
            title="Resume Source"
            subtitle="Start from your current resume or continue with the details entered above."
          />
          <div className="form-grid">
            <motion.div
              custom={0}
              variants={fieldAnim}
              initial="hidden"
              animate="show"
              className="wide resume-upload-card"
            >
              <div className="upload-card-copy">
                <strong>Upload existing resume PDF</strong>
                <span>The AI extracts facts and rewrites the content for this job.</span>
              </div>
              <label className={`upload-trigger ${resumeText ? "upload-done" : ""}`} htmlFor={`resume-upload-${fixedType}`}>
                {resumeText ? <CheckCircle2 size={16} /> : <Upload size={16} />}
                {uploading
                  ? "Parsing PDF..."
                  : resumeText
                  ? "Resume loaded"
                  : "Choose PDF"}
              </label>
              <input
                id={`resume-upload-${fixedType}`}
                type="file"
                accept="application/pdf"
                onChange={(e) => upload(e.target.files?.[0])}
              />
            </motion.div>

          </div>
        </motion.div>

        {/* Job Targeting */}
        <motion.div className="form-section" variants={sectionAnim} initial="hidden" animate="show">
          <SectionHeader
            icon={Target}
            title="Job Targeting"
            subtitle="Paste the full job description so AI can align keywords, responsibilities, and ATS fit."
          />
          <div className="form-grid">
            <motion.label custom={0} variants={fieldAnim} initial="hidden" animate="show" className="wide">
              <span className="field-label">
                Job description
                <span className="required-star" aria-label="required">*</span>
                <span className="field-optional">(paste the full JD for best ATS results)</span>
              </span>
              <textarea
                className="job-box"
                rows={8}
                placeholder="Paste the full job description here. The AI uses this to align keywords, tone, and skills in your resume for maximum ATS score."
                value={form.job}
                onChange={(e) => set("job", e.target.value)}
              />
            </motion.label>
          </div>
        </motion.div>

        {/* Notes & error */}
        {!resumeText &&
          form.experiences.length === 0 &&
          form.projectsList.length === 0 &&
          form.trainingList.length === 0 &&
          !form.coursework.trim() && (
          <p className="builder-note">
            Add your experience, projects, and education above — the more structured detail you provide, the stronger the AI output.
          </p>
        )}
        {uploadHint && (
          <motion.p
            className="builder-note success-note"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {uploadHint}
          </motion.p>
        )}
        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Info size={15} aria-hidden="true" />
            <span>{error}</span>
            <button className="error-banner-close" onClick={() => setError("")} aria-label="Dismiss">✕</button>
          </motion.div>
        )}

        <div className="security-check">
          <input
            className="website-field"
            tabIndex="-1"
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            aria-hidden="true"
          />
          <div>
            <strong>Security check</strong>
            <span>To protect resume credits, answer: {challenge?.question || "loading..."}</span>
          </div>
          <input
            inputMode="numeric"
            value={challengeAnswer}
            onChange={(event) => setChallengeAnswer(event.target.value)}
            placeholder="Answer"
            aria-label="Security check answer"
          />
          <button type="button" onClick={loadChallenge}>New</button>
        </div>

        <motion.button
          className="primary-action"
          disabled={loading}
          onClick={generate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles aria-hidden="true" />
          {loading ? loadingMsg : isExperienced ? "Generate Experienced Resume" : "Generate Fresher Resume"}
        </motion.button>
      </motion.section>

      {/* ─────────────────── RIGHT PANEL ─────────────────── */}
      <motion.section
        className={`result-panel ${previewActive ? "preview-active" : "preview-locked"}`}
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.5, delay: 0.08 }}
      >
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResumeGenerationLoader
                name={form.name}
                role={form.targetTitle}
                isImproving={isImproving}
              />
            </motion.div>
          )}
          {!loading && !result && !previewActive && (
            <motion.div
              key="locked"
              className="empty-state preview-locked-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FileText aria-hidden="true" />
              <strong>Preview activates after generation</strong>
              <p>
                Fill the fields marked with <span className="required-star">*</span>, add at least one resume content source, then click Generate Resume.
              </p>
            </motion.div>
          )}
          {!loading && !result && previewActive && (
            <motion.div
              key="empty-active"
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FileText aria-hidden="true" />
              <strong>Resume preview will appear here</strong>
              <p>
                Your AI-optimised resume will show here with live ATS scoring, keyword suggestions, and 27 template designs.
              </p>
            </motion.div>
          )}
          {!loading && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ATSScore
                resume={resumeToPlainText(result)}
                job={form.job}
                jobTitle={form.targetTitle || result.title}
                initialData={atsData}
                result={result}
                onUpdateResume={setResult}
                onImprove={improve}
              />
              <Preview
                result={result}
                onChange={setResult}
                userId={userId}
                resumeId={resumeId}
                userName={form.name}
                userEmail={form.email}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
}
