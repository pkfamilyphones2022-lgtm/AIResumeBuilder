export const templateCatalog = [
  { id: "executive-slate",  name: "Executive Slate",  accent: "#16324f", layout: "sidebar-left",  surface: "#f8fafc", sidebar: "#dce8f5" },
  { id: "teal-edge",        name: "Teal Edge",        accent: "#0f766e", layout: "sidebar-right", surface: "#f0fdf9", sidebar: "#ccfbef" },
  { id: "graphite-pro",     name: "Graphite Pro",     accent: "#334155", layout: "single-col",    surface: "#f8fafc", sidebar: "#f1f5f9" },
  { id: "amber-frame",      name: "Amber Frame",      accent: "#b45309", layout: "banner",        surface: "#fffbf5", sidebar: "#fef3c7" },
  { id: "indigo-column",    name: "Indigo Column",    accent: "#4338ca", layout: "top-bar",       surface: "#fafafa", sidebar: "#eef2ff" },
  { id: "forest-grid",      name: "Forest Grid",      accent: "#166534", layout: "minimal",       surface: "#f7fbf7", sidebar: "#dcfce7" },
  { id: "burgundy-line",    name: "Burgundy Line",    accent: "#9f1239", layout: "executive",     surface: "#fff8f9", sidebar: "#ffd6de" },
  { id: "ink-serif",        name: "Ink Serif",        accent: "#1e293b", layout: "single-col",    surface: "#ffffff", sidebar: "#f8fafc" },
  { id: "ocean-ribbon",     name: "Ocean Ribbon",     accent: "#0369a1", layout: "banner",        surface: "#f0f9ff", sidebar: "#bae6fd" },
  { id: "minimal-mint",     name: "Minimal Mint",     accent: "#0d9488", layout: "minimal",       surface: "#f0fdfa", sidebar: "#ccfbf1" },
  { id: "charcoal-band",    name: "Charcoal Band",    accent: "#1f2937", layout: "top-bar",       surface: "#f9fafb", sidebar: "#e5e7eb" },
  { id: "copper-block",     name: "Copper Block",     accent: "#92400e", layout: "sidebar-right", surface: "#fffbeb", sidebar: "#fde68a" },
  { id: "violet-brief",     name: "Violet Brief",     accent: "#5b21b6", layout: "executive",     surface: "#faf5ff", sidebar: "#ede9fe" },
  { id: "pine-profile",     name: "Pine Profile",     accent: "#14532d", layout: "sidebar-left",  surface: "#f0fdf4", sidebar: "#bbf7d0" },
  { id: "navy-classic",     name: "Navy Classic",     accent: "#1e3a8a", layout: "single-col",    surface: "#eff6ff", sidebar: "#dbeafe" },
  { id: "mono-contrast",    name: "Mono Contrast",    accent: "#18181b", layout: "banner",        surface: "#fafafa", sidebar: "#e4e4e7" },
  { id: "recruiter-focus",  name: "Recruiter Focus",  accent: "#2563eb", layout: "single-col",    surface: "#ffffff", sidebar: "#dbeafe" },
  { id: "startup-clean",    name: "Startup Clean",    accent: "#059669", layout: "top-bar",       surface: "#f8fffb", sidebar: "#d1fae5" },
  { id: "product-leader",   name: "Product Leader",   accent: "#7c3aed", layout: "executive",     surface: "#fbf9ff", sidebar: "#ede9fe" },
  { id: "data-sharp",       name: "Data Sharp",       accent: "#0891b2", layout: "sidebar-right", surface: "#f0fdff", sidebar: "#cffafe" },
  { id: "consultant-white", name: "Consultant White", accent: "#475569", layout: "minimal",       surface: "#ffffff", sidebar: "#f1f5f9" },
  { id: "tech-matrix",      name: "Tech Matrix",      accent: "#4f46e5", layout: "sidebar-left",  surface: "#f8faff", sidebar: "#e0e7ff" },
  { id: "global-cv",        name: "Global CV",        accent: "#0e7490", layout: "banner",        surface: "#f7feff", sidebar: "#a5f3fc" },
  { id: "creative-line",    name: "Creative Line",    accent: "#be185d", layout: "top-bar",       surface: "#fff7fb", sidebar: "#fbcfe8" },
  { id: "academic-classic", name: "Academic Classic", accent: "#6b4f2a", layout: "single-col",    surface: "#fffdf8", sidebar: "#f3e8c8" },
  { id: "operations-pro",   name: "Operations Pro",   accent: "#64748b", layout: "sidebar-right", surface: "#f8fafc", sidebar: "#e2e8f0" }
];

const normalizeList = (items) =>
  Array.isArray(items)
    ? items.filter(Boolean)
    : String(items || "")
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);

const normalizeBullets = (items) => normalizeList(items).map((item) => item.replace(/^[-*]\s*/, "").trim());

export const normalizeResumeData = (resume = {}) => ({
  fullName: resume.fullName || "",
  title: resume.title || "",
  contact: {
    email: resume.contact?.email || "",
    phone: resume.contact?.phone || "",
    location: resume.contact?.location || "",
    linkedin: resume.contact?.linkedin || "",
    portfolio: resume.contact?.portfolio || ""
  },
  summary: resume.summary || "",
  skills: normalizeBullets(resume.skills),
  experience: normalizeList(resume.experience).map((item) => ({
    role: item.role || "",
    company: item.company || "",
    duration: item.duration || "",
    location: item.location || "",
    bullets: normalizeBullets(item.bullets)
  })),
  projects: normalizeList(resume.projects).map((item) => ({
    name: item.name || "",
    subtitle: item.subtitle || "",
    bullets: normalizeBullets(item.bullets)
  })),
  education: normalizeList(resume.education).map((item) => ({
    degree: item.degree || "",
    institution: item.institution || "",
    duration: item.duration || "",
    details: item.details || ""
  })),
  certifications: normalizeBullets(resume.certifications),
  coursework: normalizeBullets(resume.coursework),
  achievements: normalizeBullets(resume.achievements),
  keywords: normalizeBullets(resume.keywords),
  atsStrategy: {
    targetPhrases: normalizeBullets(resume.atsStrategy?.targetPhrases),
    insertedKeywords: normalizeBullets(resume.atsStrategy?.insertedKeywords),
    rolePhrases: normalizeBullets(resume.atsStrategy?.rolePhrases)
  },
  verification: {
    status: resume.verification?.status || "",
    checkedLines: Number(resume.verification?.checkedLines || 0),
    notes: normalizeBullets(resume.verification?.notes),
    lineChecks: Array.isArray(resume.verification?.lineChecks)
      ? resume.verification.lineChecks
          .filter(Boolean)
          .map((item) => ({
            section: item.section || "",
            line: item.line || "",
            result: item.result || "Verified"
          }))
      : []
  }
});

export const resumeToPlainText = (resume = {}) => {
  const data = normalizeResumeData(resume);
  const lines = [];
  const contactLine = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin,
    data.contact.portfolio
  ]
    .filter(Boolean)
    .join(" | ");

  if (data.fullName) lines.push(data.fullName);
  if (data.title) lines.push(data.title);
  if (contactLine) lines.push(contactLine);
  if (data.summary) lines.push(`Summary\n${data.summary}`);
  if (data.skills.length) lines.push(`Skills\n${data.skills.join(", ")}`);

  if (data.experience.length) {
    lines.push("Experience");
    data.experience.forEach((item) => {
      lines.push([item.role, item.company].filter(Boolean).join(" | "));
      if (item.duration || item.location) {
        lines.push([item.duration, item.location].filter(Boolean).join(" | "));
      }
      item.bullets.forEach((bullet) => lines.push(`- ${bullet}`));
    });
  }

  if (data.projects.length) {
    lines.push("Projects");
    data.projects.forEach((item) => {
      lines.push([item.name, item.subtitle].filter(Boolean).join(" | "));
      item.bullets.forEach((bullet) => lines.push(`- ${bullet}`));
    });
  }

  if (data.education.length) {
    lines.push("Education");
    data.education.forEach((item) => {
      lines.push([item.degree, item.institution].filter(Boolean).join(" | "));
      if (item.duration || item.details) {
        lines.push([item.duration, item.details].filter(Boolean).join(" | "));
      }
    });
  }

  if (data.certifications.length) {
    lines.push(`Certifications\n${data.certifications.join(", ")}`);
  }

  if (data.coursework.length) {
    lines.push(`Relevant Coursework\n${data.coursework.join(", ")}`);
  }

  if (data.achievements.length) {
    lines.push(`Achievements\n${data.achievements.map((item) => `- ${item}`).join("\n")}`);
  }

  if (data.keywords.length) {
    lines.push(`Keywords\n${data.keywords.join(", ")}`);
  }

  if (data.atsStrategy.targetPhrases.length) {
    lines.push(`Target Phrases\n${data.atsStrategy.targetPhrases.join(", ")}`);
  }

  return lines.filter(Boolean).join("\n\n");
};
