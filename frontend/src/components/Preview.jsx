import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Download, FileEdit, LockKeyhole, Mail, Palette, Plus, Trash2, X } from "lucide-react";
import { clearPaymentToken, getPaymentTokenPayload, payNow, restorePaymentToken } from "./Payment.jsx";
import { normalizeResumeData, resumeToPlainText, templateCatalog } from "./resumeUtils.js";

const resumeVerifyChecks = [
  "My full name, email, and phone number are correct",
  "All job titles, company names, and dates are accurate",
  "No credentials, skills, or tools I haven't actually used",
  "Project descriptions reflect real work I did",
  "Education details match my actual qualifications"
];

const atsWarningItems = [
  "ATS scans for exact keyword matches — ensure job-specific terms appear naturally in your resume",
  "Use standard section headings such as Work Experience, Education, Key Skills, Technical Skills, and Projects",
  "Avoid tables, text boxes, or columns — many ATS parsers read only left-to-right plain text",
  "Spell out abbreviations at least once (e.g., 'Search Engine Optimization (SEO)')",
  "Your ATS score should ideally be above 75% before submitting to competitive roles"
];

const joinList = (items) => (items || []).join("\n");

const setListByText = (text) =>
  text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const templateStyle = (templateId) => {
  const template = templateCatalog.find((t) => t.id === templateId) || templateCatalog[0];
  return {
    "--resume-accent": template.accent,
    "--resume-surface": template.surface || "#f8fafc",
    "--resume-sidebar": template.sidebar || "#e9f2ff"
  };
};

function ResumeDocument({ resume, selectedTemplate, resumeRef, exportMode = false }) {
  const template = templateCatalog.find((t) => t.id === selectedTemplate) || templateCatalog[0];
  const layout = template.layout || "sidebar-left";

  const contactItems = [
    resume.contact.phone,
    resume.contact.email,
    resume.contact.linkedin,
    resume.contact.location,
    resume.contact.portfolio
  ].filter(Boolean);
  const spotlightSkills = resume.skills.slice(0, 5);
  const isFresher = String(resume.candidateType || "").toLowerCase() === "fresher";
  const sectionLabels = {
    summary: isFresher ? "Career Objective" : "Professional Summary",
    skills: isFresher ? "Technical Skills" : "Key Skills",
    experience: isFresher ? "Internship / Training" : "Work Experience",
    projects: isFresher ? "Academic Projects" : "Projects"
  };

  const skillsGrid = resume.skills.length > 0 && (
    <section>
      <h3>{sectionLabels.skills}</h3>
      <ul className="resume-tag-list">
        {resume.skills.map((skill) => <li key={skill}>{skill}</li>)}
      </ul>
    </section>
  );

  const skillsChips = resume.skills.length > 0 && (
    <section>
      <h3>{sectionLabels.skills}</h3>
      <ul className="resume-skill-chips">
        {resume.skills.map((skill) => <li key={skill}>{skill}</li>)}
      </ul>
    </section>
  );

  const skillsDots = resume.skills.length > 0 && (
    <section>
      <h3>{sectionLabels.skills}</h3>
      <p className="resume-skills-dots">{resume.skills.join(" · ")}</p>
    </section>
  );

  const certifications = resume.certifications.length > 0 && (
    <section>
      <h3>Certifications</h3>
      <ul className="resume-line-list">
        {resume.certifications.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );

  const achievements = resume.achievements.length > 0 && (
    <section>
      <h3>Achievements</h3>
      <ul className="resume-line-list">
        {resume.achievements.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );

  const languages = !isFresher && resume.languages.length > 0 && (
    <section>
      <h3>Languages</h3>
      <p className="resume-skills-dots">{resume.languages.join(" · ")}</p>
    </section>
  );

  const summary = resume.summary && (
    <section>
      <h3>{sectionLabels.summary}</h3>
      <p>{resume.summary}</p>
    </section>
  );

  const experience = resume.experience.length > 0 && (
    <section>
      <h3>{sectionLabels.experience}</h3>
      {resume.experience.map((item, index) => (
        <article key={`exp-view-${index}`} className="resume-item">
          <div className="resume-item-head">
            <strong>{item.role}</strong>
            <span>{item.duration}</span>
          </div>
          <div className="resume-item-subhead">
            <span>{item.company}</span>
            <span>{item.location}</span>
          </div>
          <ul className="resume-bullet-list">
            {item.bullets.map((bullet, bi) => (
              <li key={`exp-bullet-${index}-${bi}`}>{bullet}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );

  const projects = resume.projects.length > 0 && (
    <section>
      <h3>{sectionLabels.projects}</h3>
      {resume.projects.map((item, index) => (
        <article key={`project-view-${index}`} className="resume-item">
          <div className="resume-item-head">
            <strong>{item.name}</strong>
            <span>{item.subtitle}</span>
          </div>
          <ul className="resume-bullet-list">
            {item.bullets.map((bullet, bi) => (
              <li key={`proj-bullet-${index}-${bi}`}>{bullet}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );

  const education = resume.education.length > 0 && (
    <section>
      <h3>Education</h3>
      {resume.education.map((item, index) => (
        <article key={`edu-${index}`} className="resume-item compact-item">
          <div className="resume-item-head">
            <strong>{item.degree}</strong>
            <span>{item.duration}</span>
          </div>
          <div className="resume-item-subhead">
            <span>{item.institution}</span>
            <span>{item.details}</span>
          </div>
        </article>
      ))}
    </section>
  );

  const orderedMainSections = isFresher
    ? [summary, skillsChips, projects, experience, education, certifications, achievements]
    : [summary, skillsChips, experience, projects, education, certifications, achievements, languages];
  const orderedMinimalSections = isFresher
    ? [summary, skillsDots, projects, experience, education, certifications, achievements]
    : [summary, skillsDots, experience, projects, education, certifications, achievements, languages];
  const workThenProjectSections = isFresher ? [projects, experience, education] : [experience, projects, education];
  const sidebarSections = isFresher
    ? [skillsGrid, certifications, achievements]
    : [skillsGrid, certifications, achievements, languages];

  const canvasClass = `resume-canvas layout-${layout} template-${selectedTemplate}${exportMode ? " resume-export-sheet" : ""}`;
  const style = templateStyle(selectedTemplate);

  if (layout === "premium-card") {
    return (
      <div className={canvasClass} style={style} ref={resumeRef}>
        <div className="rz-luxe-hero">
          <div className="rz-luxe-nameplate">
            <span className="rz-luxe-kicker">Premium Resume</span>
            <h1>{resume.fullName || "Your Name"}</h1>
            <p className="resume-role">{resume.title || "Target Role"}</p>
          </div>
          <div className="rz-luxe-contact">
            {contactItems.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>

        <div className="rz-luxe-strip">
          <strong>Career Snapshot</strong>
          <div>
            {spotlightSkills.length > 0
              ? spotlightSkills.map((skill) => <span key={skill}>{skill}</span>)
              : <span>ATS-ready profile</span>}
          </div>
        </div>

        <div className="rz-luxe-body">
          <div className="rz-luxe-main">
            {summary}
            {workThenProjectSections}
          </div>
          <aside className="rz-luxe-side">
            {sidebarSections}
          </aside>
        </div>
      </div>
    );
  }

  /* ── BANNER: full-width coloured header, single-column body ── */
  if (layout === "banner") {
    return (
      <div className={canvasClass} style={style} ref={resumeRef}>
        <div className="rz-banner-head">
          <div>
            <h1>{resume.fullName || "Your Name"}</h1>
            <p className="resume-role rz-banner-role">{resume.title || "Target Role"}</p>
          </div>
          <div className="rz-banner-contact">
            {contactItems.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="rz-single-body">
          {orderedMainSections}
        </div>
      </div>
    );
  }

  /* ── SINGLE COLUMN: centred name, inline contact, chips for skills ── */
  if (layout === "single-col") {
    return (
      <div className={canvasClass} style={style} ref={resumeRef}>
        <div className="rz-single-hero">
          <h1>{resume.fullName || "Your Name"}</h1>
          <p className="resume-role">{resume.title || "Target Role"}</p>
          <div className="rz-contact-row">
            {contactItems.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="rz-single-body">
          {orderedMainSections}
        </div>
      </div>
    );
  }

  /* ── MINIMAL: left-aligned name, dot-separated skills, thin dividers ── */
  if (layout === "minimal") {
    return (
      <div className={canvasClass} style={style} ref={resumeRef}>
        <div className="rz-minimal-hero">
          <h1>{resume.fullName || "Your Name"}</h1>
          <p className="resume-role">{resume.title || "Target Role"}</p>
          <div className="rz-contact-row">
            {contactItems.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="rz-minimal-body">
          {orderedMinimalSections}
        </div>
      </div>
    );
  }

  /* ── EXECUTIVE: centred header, thick rule, two equal columns ── */
  if (layout === "executive") {
    return (
      <div className={canvasClass} style={style} ref={resumeRef}>
        <div className="rz-exec-hero">
          <h1>{resume.fullName || "Your Name"}</h1>
          <p className="resume-role">{resume.title || "Target Role"}</p>
          <div className="rz-contact-row rz-contact-center">
            {contactItems.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="rz-exec-rule" />
        <div className="rz-exec-body">
          <div className="rz-exec-col">
            {summary}
            {skillsGrid}
            {certifications}
            {achievements}
            {languages}
          </div>
          <div className="rz-exec-col">
            {workThenProjectSections}
          </div>
        </div>
      </div>
    );
  }

  /* ── TOP-BAR: thick accent stripe at top, then standard two-column ── */
  if (layout === "top-bar") {
    return (
      <div className={canvasClass} style={style} ref={resumeRef}>
        <div className="rz-top-bar" />
        <div className="resume-hero">
          <div>
            <h1>{resume.fullName || "Your Name"}</h1>
            <p className="resume-role">{resume.title || "Target Role"}</p>
          </div>
          <div className="resume-contact">
            {contactItems.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="resume-body">
          <aside className="resume-side">
            {sidebarSections}
          </aside>
          <div className="resume-main">
            {summary}
            {workThenProjectSections}
          </div>
        </div>
      </div>
    );
  }

  /* ── SIDEBAR-RIGHT: main content left, coloured sidebar right ── */
  if (layout === "sidebar-right") {
    return (
      <div className={canvasClass} style={style} ref={resumeRef}>
        <div className="resume-hero">
          <div>
            <h1>{resume.fullName || "Your Name"}</h1>
            <p className="resume-role">{resume.title || "Target Role"}</p>
          </div>
          <div className="resume-contact">
            {contactItems.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="rz-body-right">
          <div className="resume-main">
            {summary}
            {workThenProjectSections}
          </div>
          <aside className="resume-side">
            {sidebarSections}
          </aside>
        </div>
      </div>
    );
  }

  /* ── SIDEBAR-LEFT (default): coloured sidebar left, main content right ── */
  return (
    <div className={canvasClass} style={style} ref={resumeRef}>
      <div className="resume-hero">
        <div>
          <h1>{resume.fullName || "Your Name"}</h1>
          <p className="resume-role">{resume.title || "Target Role"}</p>
        </div>
        <div className="resume-contact">
          {contactItems.map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>
      <div className="resume-body">
        <aside className="resume-side">
          {sidebarSections}
        </aside>
        <div className="resume-main">
          {summary}
          {workThenProjectSections}
        </div>
      </div>
    </div>
  );
}

export default function Preview({ result, onChange, defaultTemplate, userId, resumeId, userName, userEmail, viewOnly = false }) {
  const previewRef = useRef(null);
  const exportRef = useRef(null);
  const stageRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [paid, setPaid] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [fileEmailStatus, setFileEmailStatus] = useState("idle"); // idle | sending | sent | failed
  const [showEmailWarning, setShowEmailWarning] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate || templateCatalog[0].id);
  const [downloadFormat, setDownloadFormat] = useState("pdf"); // pdf | docx
  const [showWarning, setShowWarning] = useState(false);
  const [warningChecked, setWarningChecked] = useState([false, false, false, false, false]);

  const resume = useMemo(() => normalizeResumeData(result), [result]);
  const layoutCount = useMemo(() => new Set(templateCatalog.map((template) => template.layout)).size, []);
  const isFresherResume = String(resume.candidateType || "").toLowerCase() === "fresher";
  const editorLabels = {
    summary: isFresherResume ? "Career objective" : "Professional summary",
    skills: isFresherResume ? "Technical skills" : "Key skills",
    experience: isFresherResume ? "Internship / Training" : "Work experience",
    projects: isFresherResume ? "Academic projects" : "Projects"
  };
  const paymentScope = useMemo(
    () => resumeId || `${resume.fullName}|${resume.title}|${resume.contact.email}`,
    [resumeId, resume.fullName, resume.title, resume.contact.email]
  );

  useEffect(() => {
    const CANVAS_WIDTH = 794;
    const updateScale = () => {
      if (!stageRef.current) return;
      const available = stageRef.current.clientWidth - 2;
      const scale = available < CANVAS_WIDTH ? available / CANVAS_WIDTH : 1;
      setPreviewScale(Math.round(scale * 1000) / 1000);
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (viewOnly) {
      setCheckingPayment(false);
      return;
    }

    setCheckingPayment(true);
    setPaid(false);
    restorePaymentToken(paymentScope).then((valid) => {
      if (valid) setPaid(true);
      setCheckingPayment(false);
    });
  }, [paymentScope, viewOnly]);

  useEffect(() => {
    const blockPrintShortcut = (event) => {
      const key = event.key?.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "p") {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", blockPrintShortcut);
    return () => window.removeEventListener("keydown", blockPrintShortcut);
  }, []);

  const blockPreviewCopy = (event) => {
    event.preventDefault();
  };

  const updateResume = (updater) => {
    onChange((current) => normalizeResumeData(typeof updater === "function" ? updater(current) : updater));
  };

  const updateField = (field, value) => {
    updateResume((current) => ({ ...normalizeResumeData(current), [field]: value }));
  };

  const updateContact = (field, value) => {
    updateResume((current) => ({
      ...normalizeResumeData(current),
      contact: {
        ...normalizeResumeData(current).contact,
        [field]: value
      }
    }));
  };

  const updateArrayField = (field, value) => {
    updateResume((current) => ({
      ...normalizeResumeData(current),
      [field]: setListByText(value)
    }));
  };

  const updateNestedList = (field, index, key, value, nested = false) => {
    updateResume((current) => {
      const next = normalizeResumeData(current);
      next[field] = next[field].map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: nested ? setListByText(value) : value
            }
          : item
      );
      return next;
    });
  };

  const addSectionItem = (field) => {
    const templates = {
      experience: { role: "", company: "", duration: "", location: "", bullets: [""] },
      projects: { name: "", subtitle: "", bullets: [""] },
      education: { degree: "", institution: "", duration: "", details: "" }
    };

    updateResume((current) => {
      const next = normalizeResumeData(current);
      next[field] = [...next[field], templates[field]];
      return next;
    });
  };

  const removeSectionItem = (field, index) => {
    updateResume((current) => {
      const next = normalizeResumeData(current);
      next[field] = next[field].filter((_, itemIndex) => itemIndex !== index);
      return next;
    });
  };

  const saveBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  };

  const exportPdfFromElement = async (element) => {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf")
    ]);
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: 794,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let y = 0;
    let remaining = imgHeight;
    while (remaining > 0) {
      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      remaining -= pageHeight;
      if (remaining > 0) {
        pdf.addPage();
        y -= pageHeight;
      }
    }

    const safeName = (resume.fullName || "resume").replace(/\s+/g, "_");
    pdf.save(`${safeName}_Resume.pdf`);
  };

  const exportDocx = async () => {
    const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import("docx");
    const contactLine = [
      resume.contact.phone,
      resume.contact.email,
      resume.contact.linkedin,
      resume.contact.location,
      resume.contact.portfolio
    ]
      .filter(Boolean)
      .join(" | ");
    const isFresherDoc = String(resume.candidateType || "").toLowerCase() === "fresher";
    const docLabels = {
      summary: isFresherDoc ? "Career Objective" : "Professional Summary",
      skills: isFresherDoc ? "Technical Skills" : "Key Skills",
      experience: isFresherDoc ? "Internship / Training" : "Work Experience",
      projects: isFresherDoc ? "Academic Projects" : "Projects"
    };

    const heading = (text) =>
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 220, after: 80 }
      });

    const bullets = (lines) =>
      (lines || [])
        .filter(Boolean)
        .map(
          (line) =>
            new Paragraph({
              children: [new TextRun({ text: line })],
              bullet: { level: 0 }
            })
        );

    const experienceChildren = [
      resume.experience.length ? heading(docLabels.experience) : null,
      ...resume.experience.flatMap((item) => [
        new Paragraph({
          children: [
            new TextRun({ text: item.role || "Role", bold: true }),
            new TextRun({ text: item.company ? ` | ${item.company}` : "" }),
            new TextRun({ text: item.duration ? ` | ${item.duration}` : "" })
          ].filter((run) => run.text !== ""),
          spacing: { after: 40 }
        }),
        item.location ? new Paragraph({ text: item.location, spacing: { after: 40 } }) : null,
        ...bullets(item.bullets)
      ])
    ];

    const projectChildren = [
      resume.projects.length ? heading(docLabels.projects) : null,
      ...resume.projects.flatMap((item) => [
        new Paragraph({
          children: [
            new TextRun({ text: item.name || "Project", bold: true }),
            new TextRun({ text: item.subtitle ? ` | ${item.subtitle}` : "" })
          ],
          spacing: { after: 40 }
        }),
        ...bullets(item.bullets)
      ])
    ];

    const children = [
      new Paragraph({
        children: [new TextRun({ text: resume.fullName || "Your Name", bold: true, size: 34 })],
        spacing: { after: 80 }
      }),
      contactLine ? new Paragraph({ text: contactLine, spacing: { after: 120 } }) : null,
      resume.title
        ? new Paragraph({
            children: [new TextRun({ text: resume.title, italics: true })],
            spacing: { after: 200 }
          })
        : null,

      resume.summary ? heading(docLabels.summary) : null,
      resume.summary ? new Paragraph({ text: resume.summary }) : null,

      resume.skills.length ? heading(docLabels.skills) : null,
      resume.skills.length ? new Paragraph({ text: resume.skills.join(", ") }) : null,

      ...(isFresherDoc ? projectChildren : experienceChildren),
      ...(isFresherDoc ? experienceChildren : projectChildren),

      resume.education.length ? heading("Education") : null,
      ...resume.education.map(
        (item) =>
          new Paragraph({
            children: [
              new TextRun({ text: item.degree || "Degree", bold: true }),
              new TextRun({ text: item.institution ? ` | ${item.institution}` : "" }),
              new TextRun({ text: item.duration ? ` | ${item.duration}` : "" })
            ],
            spacing: { after: 40 }
          })
      ),

      resume.certifications.length ? heading("Certifications") : null,
      ...bullets(resume.certifications),

      resume.achievements.length ? heading("Achievements") : null,
      ...bullets(resume.achievements),

      !isFresherDoc && resume.languages.length ? heading("Languages") : null,
      !isFresherDoc && resume.languages.length ? new Paragraph({ text: resume.languages.join(", ") }) : null
    ].filter(Boolean);

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: "portrait",
                width: 11906,
                height: 16838
              },
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720
              }
            }
          },
          children
        }
      ]
    });

    const safeName = (resume.fullName || "resume").replace(/\s+/g, "_");
    const blob = await Packer.toBlob(doc);
    saveBlob(blob, `${safeName}_Resume.docx`);
  };

  const runDownload = async () => {
    const source = exportRef.current || previewRef.current;

    if (downloadFormat === "docx") {
      await exportDocx();
    } else if (source) {
      await exportPdfFromElement(source);
    } else {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
      const text = resumeToPlainText(resume);
      const lines = doc.splitTextToSize(text, 182);
      doc.text(lines, 14, 14);
      doc.save("resume.pdf");
    }
  };

  const download = () => {
    setWarningChecked([false, false, false, false, false]);
    setShowWarning(true);
  };

  const confirmDownload = async () => {
    setShowWarning(false);
    const valid = await restorePaymentToken(paymentScope);
    if (!valid) {
      setPaid(false);
      setPaymentError("Payment verification failed. Please complete payment again.");
      return;
    }
    const tokenPayload = getPaymentTokenPayload();
    await runDownload();
    let downloadLogged = true;
    try {
      if (tokenPayload) {
        const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${API}/payment/download`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...tokenPayload,
            fileFormat: downloadFormat
          }),
          keepalive: true
        });
        if (!response.ok) throw new Error(`download log failed (${response.status})`);
      }
    } catch (err) {
      downloadLogged = false;
      console.warn("[downloadLog] Could not record download:", err.message);
    }
    clearPaymentToken(paymentScope);
    setPaid(false);
    setPaymentError(
      downloadLogged
        ? "Download completed. This payment unlock was used for one download."
        : "Download completed, but admin tracking was not recorded. Please restart the app and contact support if this repeats."
    );
  };

  const generateAndEmailFiles = async (emailOverride) => {
    const targetEmail = emailOverride || userEmail;
    if (!targetEmail) return;
    setFileEmailStatus("sending");
    const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    try {
      // ── PDF as base64 ──
      let pdfBase64 = null;
      const source = exportRef.current || previewRef.current;
      if (source) {
        const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
          import("html2canvas"),
          import("jspdf")
        ]);
        const canvas = await html2canvas(source, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: source.scrollWidth,
          height: source.scrollHeight,
          windowWidth: 794,
          windowHeight: source.scrollHeight
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
        let y = 0;
        let remaining = imgHeight;
        while (remaining > 0) {
          pdf.addImage(imgData, "PNG", 0, y, pageWidth, imgHeight);
          remaining -= pageHeight;
          if (remaining > 0) { pdf.addPage(); y -= pageHeight; }
        }
        pdfBase64 = pdf.output("datauristring").split(",")[1];
      }

      // ── DOCX as base64 ──
      let docxBase64 = null;
      try {
        const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import("docx");
        const isFresherDoc = String(resume.candidateType || "").toLowerCase() === "fresher";
        const docLabels = {
          summary: isFresherDoc ? "Career Objective" : "Professional Summary",
          skills: isFresherDoc ? "Technical Skills" : "Key Skills",
          experience: isFresherDoc ? "Internship / Training" : "Work Experience",
          projects: isFresherDoc ? "Academic Projects" : "Projects"
        };
        const contactLine = [resume.contact.phone, resume.contact.email, resume.contact.linkedin, resume.contact.location, resume.contact.portfolio].filter(Boolean).join(" | ");
        const heading = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 80 } });
        const bullets = (lines) => (lines || []).filter(Boolean).map((line) => new Paragraph({ children: [new TextRun({ text: line })], bullet: { level: 0 } }));
        const expChildren = [
          resume.experience.length ? heading(docLabels.experience) : null,
          ...resume.experience.flatMap((item) => [
            new Paragraph({ children: [new TextRun({ text: item.role || "Role", bold: true }), new TextRun({ text: item.company ? ` | ${item.company}` : "" }), new TextRun({ text: item.duration ? ` | ${item.duration}` : "" })].filter(r => r.text !== ""), spacing: { after: 40 } }),
            item.location ? new Paragraph({ text: item.location, spacing: { after: 40 } }) : null,
            ...bullets(item.bullets)
          ])
        ];
        const projChildren = [
          resume.projects.length ? heading(docLabels.projects) : null,
          ...resume.projects.flatMap((item) => [
            new Paragraph({ children: [new TextRun({ text: item.name || "Project", bold: true }), new TextRun({ text: item.subtitle ? ` | ${item.subtitle}` : "" })], spacing: { after: 40 } }),
            ...bullets(item.bullets)
          ])
        ];
        const children = [
          new Paragraph({ children: [new TextRun({ text: resume.fullName || "Your Name", bold: true, size: 34 })], spacing: { after: 80 } }),
          contactLine ? new Paragraph({ text: contactLine, spacing: { after: 120 } }) : null,
          resume.title ? new Paragraph({ children: [new TextRun({ text: resume.title, italics: true })], spacing: { after: 200 } }) : null,
          resume.summary ? heading(docLabels.summary) : null,
          resume.summary ? new Paragraph({ text: resume.summary }) : null,
          resume.skills.length ? heading(docLabels.skills) : null,
          resume.skills.length ? new Paragraph({ text: resume.skills.join(", ") }) : null,
          ...(isFresherDoc ? projChildren : expChildren),
          ...(isFresherDoc ? expChildren : projChildren),
          resume.education.length ? heading("Education") : null,
          ...resume.education.map((item) => new Paragraph({ children: [new TextRun({ text: item.degree || "Degree", bold: true }), new TextRun({ text: item.institution ? ` | ${item.institution}` : "" }), new TextRun({ text: item.duration ? ` | ${item.duration}` : "" })], spacing: { after: 40 } })),
          resume.certifications.length ? heading("Certifications") : null,
          ...bullets(resume.certifications),
          resume.achievements.length ? heading("Achievements") : null,
          ...bullets(resume.achievements)
        ].filter(Boolean);
        const doc = new Document({ sections: [{ properties: { page: { size: { orientation: "portrait", width: 11906, height: 16838 }, margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children }] });
        docxBase64 = await Packer.toBase64String(doc);
      } catch (docxErr) {
        console.warn("[emailFiles] DOCX generation failed:", docxErr.message);
      }

      const { default: axios } = await import("axios");
      await axios.post(`${API}/payment/email-attachments`, {
        name: userName,
        email: targetEmail,
        resumeTitle: resume.title,
        pdfBase64,
        docxBase64,
        userId,
        resumeId
      });

      setFileEmailStatus("sent");
    } catch (err) {
      console.error("[emailFiles] Failed:", err.message);
      setFileEmailStatus("failed");
    }
  };

  const startPayment = async () => {
    setPaymentError("");
    await payNow(
      { userId, resumeId, paymentScope, userName, userEmail, resumeTitle: resume.title, resumeData: result },
      () => {
        setPaid(true);
        if (userEmail) setShowEmailWarning(true);
      },
      (message) => setPaymentError(message)
    );
  };

  const emailModalPortal = !viewOnly && typeof document !== "undefined"
    ? createPortal(
        <AnimatePresence>
          {showEmailWarning && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { if (e.target === e.currentTarget) setShowEmailWarning(false); }}
            >
              <motion.div
                className="modal-box email-delivery-modal"
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 24 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="modal-header email-delivery-header">
                  <span className="email-delivery-icon">
                    <Mail size={21} />
                  </span>
                  <div>
                    <h3>Send resume files to your email?</h3>
                    <p>Get both formats delivered to your inbox.</p>
                  </div>
                  <button className="modal-close" onClick={() => setShowEmailWarning(false)}>
                    <X size={18} />
                  </button>
                </div>

                <p className="modal-intro">
                  We'll generate your resume as <strong>PDF</strong> and <strong>DOCX</strong> files and send them to:
                </p>

                {userEmail ? (
                  <div className="email-confirm-address">
                    <Mail size={14} />
                    <span>{userEmail}</span>
                  </div>
                ) : (
                  <input
                    className="email-confirm-input"
                    type="email"
                    placeholder="Enter your email address"
                    id="email-warning-input"
                  />
                )}

                <div className="email-delivery-note">
                  <span>Both files usually arrive within a minute.</span>
                  <span>The download button remains available on this page too.</span>
                </div>

                <div className="modal-actions email-delivery-actions">
                  <button
                    className="modal-back"
                    onClick={() => setShowEmailWarning(false)}
                  >
                    Skip, I'll download instead
                  </button>
                  <button
                    className="modal-confirm"
                    onClick={() => {
                      const emailInput = document.getElementById("email-warning-input");
                      const emailToUse = userEmail || emailInput?.value?.trim();
                      if (!emailToUse) {
                        if (emailInput) emailInput.focus();
                        return;
                      }
                      setShowEmailWarning(false);
                      generateAndEmailFiles(emailToUse);
                    }}
                  >
                    <Mail size={16} />
                    Yes, send to my email
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;

  const downloadModalPortal = !viewOnly && typeof document !== "undefined"
    ? createPortal(
        <AnimatePresence>
          {showWarning && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { if (e.target === e.currentTarget) setShowWarning(false); }}
            >
              <motion.div
                className="modal-box"
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 24 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="modal-header">
                  <AlertTriangle size={20} className="modal-warn-icon" />
                  <h3>Verify before downloading</h3>
                  <button className="modal-close" onClick={() => setShowWarning(false)}>
                    <X size={18} />
                  </button>
                </div>

                <p className="modal-intro">Please confirm the accuracy of your resume content before downloading.</p>

                <p className="modal-section-label">Resume accuracy checklist</p>
                <div className="modal-checklist">
                  {resumeVerifyChecks.map((item, i) => (
                    <label key={i} className="modal-check-item">
                      <input
                        type="checkbox"
                        checked={warningChecked[i]}
                        onChange={() =>
                          setWarningChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                        }
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>

                <p className="modal-section-label ats-label">
                  <AlertTriangle size={14} /> ATS warnings to keep in mind
                </p>
                <div className="modal-ats-list">
                  {atsWarningItems.map((item, i) => (
                    <div key={i} className="modal-ats-item">
                      <span className="ats-bullet">!</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="modal-actions">
                  <button className="modal-back" onClick={() => setShowWarning(false)}>
                    Go back &amp; edit
                  </button>
                  <button
                    className="modal-confirm"
                    onClick={confirmDownload}
                  >
                    <Download size={16} />
                    Confirm &amp; Download
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <div className={`preview${viewOnly ? " preview-view-only" : ""}`}>
      {/* ── Email confirmation modal ── */}
      {emailModalPortal}
      {downloadModalPortal}
      {false && !viewOnly && (
        <AnimatePresence>
          {showEmailWarning && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { if (e.target === e.currentTarget) setShowEmailWarning(false); }}
            >
              <motion.div
                className="modal-box email-delivery-modal"
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 24 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="modal-header email-delivery-header">
                  <span className="email-delivery-icon">
                    <Mail size={21} />
                  </span>
                  <div>
                    <h3>Send resume files to your email?</h3>
                    <p>Get both formats delivered to your inbox.</p>
                  </div>
                  <button className="modal-close" onClick={() => setShowEmailWarning(false)}>
                    <X size={18} />
                  </button>
                </div>

                <p className="modal-intro">
                  We'll generate your resume as <strong>PDF</strong> and <strong>DOCX</strong> files and send them to:
                </p>

                {userEmail ? (
                  <div className="email-confirm-address">
                    <Mail size={14} />
                    <span>{userEmail}</span>
                  </div>
                ) : (
                  <input
                    className="email-confirm-input"
                    type="email"
                    placeholder="Enter your email address"
                    id="email-warning-input"
                  />
                )}

                <div className="email-delivery-note">
                  <span>Both files usually arrive within a minute.</span>
                  <span>The download button remains available on this page too.</span>
                </div>

                <div className="modal-actions email-delivery-actions">
                  <button
                    className="modal-back"
                    onClick={() => setShowEmailWarning(false)}
                  >
                    Skip, I'll download instead
                  </button>
                  <button
                    className="modal-confirm"
                    onClick={() => {
                      const emailInput = document.getElementById("email-warning-input");
                      const emailToUse = userEmail || emailInput?.value?.trim();
                      if (!emailToUse) {
                        if (emailInput) emailInput.focus();
                        return;
                      }
                      setShowEmailWarning(false);
                      generateAndEmailFiles(emailToUse);
                    }}
                  >
                    <Mail size={16} />
                    Yes, send to my email
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── Pre-download warning modal ── */}
      {false && !viewOnly && (
        <AnimatePresence>
          {showWarning && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowWarning(false); }}
          >
            <motion.div
              className="modal-box"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="modal-header">
                <AlertTriangle size={20} className="modal-warn-icon" />
                <h3>Verify before downloading</h3>
                <button className="modal-close" onClick={() => setShowWarning(false)}>
                  <X size={18} />
                </button>
              </div>

              <p className="modal-intro">Please confirm the accuracy of your resume content before downloading.</p>

              <p className="modal-section-label">Resume accuracy checklist</p>
              <div className="modal-checklist">
                {resumeVerifyChecks.map((item, i) => (
                  <label key={i} className="modal-check-item">
                    <input
                      type="checkbox"
                      checked={warningChecked[i]}
                      onChange={() =>
                        setWarningChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                      }
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>

              <p className="modal-section-label ats-label">
                <AlertTriangle size={14} /> ATS warnings to keep in mind
              </p>
              <div className="modal-ats-list">
                {atsWarningItems.map((item, i) => (
                  <div key={i} className="modal-ats-item">
                    <span className="ats-bullet">⚠</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button className="modal-back" onClick={() => setShowWarning(false)}>
                  Go back &amp; edit
                </button>
                <button
                  className="modal-confirm"
                  onClick={confirmDownload}
                >
                  <Download size={16} />
                  Confirm &amp; Download
                </button>
              </div>

              <p className="modal-email-note">
                <Mail size={13} />
                After downloading, we'll open your email client so you can send a copy to yourself.
              </p>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      )}

      {!viewOnly && (
        <>
          <div className="preview-header generated-header">
            <div>
              <h2>Generated Resume</h2>
              <p className="generated-copy">
                Review the completed resume below, switch templates, and then edit any section you want.
              </p>
            </div>
            {checkingPayment ? null : !paid ? (
              <button className="pay-button" onClick={startPayment}>
                <LockKeyhole aria-hidden="true" />
                Pay Rs.69
              </button>
            ) : (
              <div className="download-group">
                <label className="download-format">
                  <span className="sr-only">Download format</span>
                  <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX</option>
                  </select>
                </label>
                {downloadFormat === "docx" && (
                  <span className="docx-note" title="Word export uses a clean plain-text layout — it does not replicate the visual template design shown in the preview.">
                    ⚠ Plain layout
                  </span>
                )}
                <button className="download-button" onClick={download}>
                  <Download aria-hidden="true" />
                  Download {downloadFormat.toUpperCase()}
                </button>
                {fileEmailStatus !== "sending" && fileEmailStatus !== "sent" && (
                  <button
                    className="email-send-button"
                    onClick={() => setShowEmailWarning(true)}
                    title="Send PDF & DOCX to your email"
                  >
                    <Mail size={15} aria-hidden="true" />
                    Send to Email
                  </button>
                )}
                {fileEmailStatus === "sent" && (
                  <span className="email-sent-badge">
                    <CheckCircle2 size={14} /> Sent
                  </span>
                )}
              </div>
            )}
          </div>

          {paymentError && <p className="error">{paymentError}</p>}

          {fileEmailStatus === "sending" && (
            <p className="file-email-status sending">
              ⏳ Generating your PDF &amp; DOCX and sending to {userEmail}…
            </p>
          )}
          {fileEmailStatus === "sent" && (
            <p className="file-email-status sent">
              ✅ Resume PDF &amp; DOCX sent to {userEmail} — check your inbox!
            </p>
          )}
          {fileEmailStatus === "failed" && (
            <p className="file-email-status failed">
              ⚠ Could not send files to email. Please use the Download button above.
            </p>
          )}

          {(resume.verification.status || resume.atsStrategy.insertedKeywords.length > 0) && (
            <div className="ai-verification-panel">
              <div>
                <strong>AI Verification</strong>
                <p>{resume.verification.status || "Generated lines were checked for clarity, truthfulness, and ATS fit."}</p>
              </div>
              {resume.verification.checkedLines > 0 && (
                <span>{resume.verification.checkedLines} lines checked</span>
              )}
              {resume.atsStrategy.insertedKeywords.length > 0 && (
                <div className="verification-keywords">
                  {resume.atsStrategy.insertedKeywords.slice(0, 10).map((keyword) => (
                    <em key={keyword}>{keyword}</em>
                  ))}
                </div>
              )}
              {resume.verification.lineChecks.length > 0 && (
                <details className="line-checks">
                  <summary>View line checks</summary>
                  <ul>
                    {resume.verification.lineChecks.slice(0, 8).map((item, index) => (
                      <li key={`${item.section}-${index}`}>
                        <b>{item.section || "Resume"}</b>
                        <span>{item.result}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </>
      )}

      <div className="template-toolbar">
        <div className="toolbar-copy">
          <Palette aria-hidden="true" />
          <div>
            <strong>{templateCatalog.length} templates - {layoutCount} distinct layouts</strong>
            <p>Switch designs to change the full look and feel, not just colours.</p>
          </div>
        </div>
        <div className="template-grid">
          {templateCatalog.map((template) => (
            <motion.button
              key={template.id}
              className={`template-chip ${selectedTemplate === template.id ? "is-active" : ""}`}
              onClick={() => setSelectedTemplate(template.id)}
              style={{ "--chip-accent": template.accent }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <span className="chip-dot" style={{ background: template.accent }} />
              {template.name}
            </motion.button>
          ))}
        </div>
      </div>

      <div
        className="preview-stage"
        ref={stageRef}
        onContextMenu={blockPreviewCopy}
        onCopy={blockPreviewCopy}
        onCut={blockPreviewCopy}
        onDragStart={blockPreviewCopy}
        onSelectStart={blockPreviewCopy}
      >
        <div
          className="preview-scale-wrap"
          style={
            previewScale < 1
              ? {
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                  width: 794,
                  marginBottom: `${Math.round((previewScale - 1) * 1123)}px`,
                }
              : undefined
          }
        >
          <ResumeDocument resume={resume} selectedTemplate={selectedTemplate} resumeRef={previewRef} />
        </div>
      </div>

      {!viewOnly && <div className="resume-editor">
          <div className="editor-title">
            <FileEdit aria-hidden="true" />
            <div>
              <strong>Edit generated content</strong>
              <p>The user can change details even after the resume is built, then preview another template instantly.</p>
            </div>
          </div>

          <label>
            Full name
            <input value={resume.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
          </label>
          <label>
            Headline
            <input value={resume.title} onChange={(event) => updateField("title", event.target.value)} />
          </label>
          <label>
            {editorLabels.summary}
            <textarea value={resume.summary} onChange={(event) => updateField("summary", event.target.value)} />
          </label>
          <label>
            {editorLabels.skills}
            <textarea value={joinList(resume.skills)} onChange={(event) => updateArrayField("skills", event.target.value)} />
          </label>
          <label>
            Certifications
            <textarea
              value={joinList(resume.certifications)}
              onChange={(event) => updateArrayField("certifications", event.target.value)}
            />
          </label>
          <label>
            Relevant coursework
            <textarea
              value={joinList(resume.coursework)}
              onChange={(event) => updateArrayField("coursework", event.target.value)}
            />
          </label>
          <label>
            Achievements
            <textarea
              value={joinList(resume.achievements)}
              onChange={(event) => updateArrayField("achievements", event.target.value)}
            />
          </label>
          {!isFresherResume && (
            <label>
              Languages
              <textarea
                value={joinList(resume.languages)}
                onChange={(event) => updateArrayField("languages", event.target.value)}
              />
            </label>
          )}
          <div className="editor-inline-grid">
            <label>
              Email
              <input value={resume.contact.email} onChange={(event) => updateContact("email", event.target.value)} />
            </label>
            <label>
              Phone
              <input value={resume.contact.phone} onChange={(event) => updateContact("phone", event.target.value)} />
            </label>
            <label>
              Location
              <input value={resume.contact.location} onChange={(event) => updateContact("location", event.target.value)} />
            </label>
            <label>
              LinkedIn
              <input value={resume.contact.linkedin} onChange={(event) => updateContact("linkedin", event.target.value)} />
            </label>
            <label>
              Portfolio
              <input value={resume.contact.portfolio} onChange={(event) => updateContact("portfolio", event.target.value)} />
            </label>
          </div>

          <div className="editor-section-head">
            <strong>{editorLabels.experience}</strong>
            <button className="mini-action" onClick={() => addSectionItem("experience")}>
              <Plus aria-hidden="true" />
              Add {isFresherResume ? "Training" : "Experience"}
            </button>
          </div>
          {resume.experience.map((item, index) => (
            <div className="editor-block" key={`experience-${index}`}>
              <div className="editor-block-head">
                <strong>{editorLabels.experience} {index + 1}</strong>
                <button className="mini-danger" onClick={() => removeSectionItem("experience", index)}>
                  <Trash2 aria-hidden="true" />
                  Remove
                </button>
              </div>
              <label>
                Role
                <input value={item.role} onChange={(event) => updateNestedList("experience", index, "role", event.target.value)} />
              </label>
              <label>
                Company
                <input value={item.company} onChange={(event) => updateNestedList("experience", index, "company", event.target.value)} />
              </label>
              <label>
                Duration
                <input value={item.duration} onChange={(event) => updateNestedList("experience", index, "duration", event.target.value)} />
              </label>
              <label>
                Location
                <input value={item.location} onChange={(event) => updateNestedList("experience", index, "location", event.target.value)} />
              </label>
              <label>
                Bullets
                <textarea
                  value={joinList(item.bullets)}
                  onChange={(event) => updateNestedList("experience", index, "bullets", event.target.value, true)}
                />
              </label>
            </div>
          ))}

          <div className="editor-section-head">
            <strong>{editorLabels.projects}</strong>
            <button className="mini-action" onClick={() => addSectionItem("projects")}>
              <Plus aria-hidden="true" />
              Add Project
            </button>
          </div>
          {resume.projects.map((item, index) => (
            <div className="editor-block" key={`project-${index}`}>
              <div className="editor-block-head">
                <strong>Project {index + 1}</strong>
                <button className="mini-danger" onClick={() => removeSectionItem("projects", index)}>
                  <Trash2 aria-hidden="true" />
                  Remove
                </button>
              </div>
              <label>
                Name
                <input value={item.name} onChange={(event) => updateNestedList("projects", index, "name", event.target.value)} />
              </label>
              <label>
                Subtitle
                <input value={item.subtitle} onChange={(event) => updateNestedList("projects", index, "subtitle", event.target.value)} />
              </label>
              <label>
                Bullets
                <textarea
                  value={joinList(item.bullets)}
                  onChange={(event) => updateNestedList("projects", index, "bullets", event.target.value, true)}
                />
              </label>
            </div>
          ))}

          <div className="editor-section-head">
            <strong>Education</strong>
            <button className="mini-action" onClick={() => addSectionItem("education")}>
              <Plus aria-hidden="true" />
              Add Education
            </button>
          </div>
          {resume.education.map((item, index) => (
            <div className="editor-block" key={`education-${index}`}>
              <div className="editor-block-head">
                <strong>Education {index + 1}</strong>
                <button className="mini-danger" onClick={() => removeSectionItem("education", index)}>
                  <Trash2 aria-hidden="true" />
                  Remove
                </button>
              </div>
              <label>
                Degree
                <input value={item.degree} onChange={(event) => updateNestedList("education", index, "degree", event.target.value)} />
              </label>
              <label>
                Institution
                <input
                  value={item.institution}
                  onChange={(event) => updateNestedList("education", index, "institution", event.target.value)}
                />
              </label>
              <label>
                Duration
                <input value={item.duration} onChange={(event) => updateNestedList("education", index, "duration", event.target.value)} />
              </label>
              <label>
                Details
                <textarea value={item.details} onChange={(event) => updateNestedList("education", index, "details", event.target.value)} />
              </label>
            </div>
          ))}
      </div>}

      {!viewOnly && <div className="resume-export-stage" aria-hidden="true">
        <ResumeDocument resume={resume} selectedTemplate={selectedTemplate} resumeRef={exportRef} exportMode />
      </div>}
    </div>
  );
}
