/* ═══════════════════════════════════════════════════════════════
   ATS Score Engine
   Rules aligned to the 13-rule ATS compliance checklist.
   Each rule carries an importance weight that feeds into the
   final weighted score alongside keyword/phrase coverage.
═══════════════════════════════════════════════════════════════ */

// ── Stop words ───────────────────────────────────────────────
const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","by","for","from","in","is","it",
  "of","on","or","that","the","to","with","you","your","will","our",
  "this","have","has","must","should","candidate","role","work","team",
  "teams","ability","responsibilities","requirements","preferred","required"
]);

// ── Strong action verbs used in resume bullets ───────────────
const ACTION_VERBS = [
  "led","built","developed","designed","delivered","created","managed",
  "implemented","improved","increased","reduced","optimized","launched",
  "established","achieved","collaborated","analyzed","automated","architected",
  "coordinated","deployed","engineered","executed","facilitated","generated",
  "grew","identified","integrated","maintained","migrated","monitored",
  "negotiated","onboarded","owned","performed","planned","produced","resolved",
  "reviewed","scaled","spearheaded","streamlined","supported","trained",
  "transformed","accelerated","authored","calculated","designed","directed",
  "enhanced","evaluated","expanded","formulated","guided","handled","hired",
  "influenced","initiated","introduced","led","leveraged","modernised",
  "modernized","negotiated","organised","organized","oversaw","presented",
  "prioritised","prioritized","researched","restructured","shipped","simplified",
  "supervised","tested","validated","wrote"
];

// ── Standard ATS section headings ────────────────────────────
const STANDARD_HEADINGS = [
  "summary","professional summary","career objective","objective",
  "experience","work experience","professional experience","employment",
  "skills","technical skills","core competencies","key skills",
  "education","academic background",
  "projects","academic projects",
  "certifications","certificates"
];

// ── Common skills vocabulary ─────────────────────────────────
const COMMON_SKILLS = [
  "react","react.js","node.js","javascript","typescript","html","css",
  "redux","next.js","express.js","mongodb","mysql","postgresql","sql",
  "python","java","spring boot","aws","azure","docker","kubernetes",
  "git","rest api","graphql","microservices","ci/cd","data analysis",
  "power bi","tableau","excel","machine learning","agile","scrum",
  "jira","seo","google analytics","crm","salesforce","customer success",
  "talent acquisition","payroll","financial reporting"
];

// ── Role-specific phrase profiles ────────────────────────────
const PROFILE_PHRASES = [
  { match: ["frontend","front end","react"], terms: ["responsive design","component architecture","state management","api integration","performance optimization","accessibility"] },
  { match: ["backend","back end","node"], terms: ["rest api development","database design","authentication","server-side logic","api performance","scalable services"] },
  { match: ["full stack","mern","software engineer"], terms: ["full stack development","end-to-end feature delivery","api integration","debugging","code quality","production support"] },
  { match: ["data analyst","business analyst","analytics"], terms: ["data analysis","dashboard reporting","business insights","sql queries","data visualization","stakeholder reporting"] },
  { match: ["project manager","program manager","scrum"], terms: ["project planning","stakeholder management","risk management","sprint planning","cross-functional collaboration","delivery tracking"] },
  { match: ["sales","business development"], terms: ["lead generation","pipeline management","client relationship management","revenue growth","sales targets","crm"] },
  { match: ["digital marketing","marketing","seo"], terms: ["campaign optimization","seo strategy","content marketing","conversion rate","google analytics","performance marketing"] },
  { match: ["hr","human resources","recruiter"], terms: ["talent acquisition","employee onboarding","candidate screening","hr operations","payroll coordination","employee engagement"] }
];

// ── Helpers ──────────────────────────────────────────────────
const tokenize = (text) =>
  String(text || "").toLowerCase().split(/\W+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));

const normalizeTerm = (term) =>
  String(term || "").toLowerCase().replace(/[^\w+#. -]+/g, " ").replace(/\s+/g, " ").trim();

const unique = (items) => [...new Set(items.map(normalizeTerm).filter(Boolean))];

const sectionPresent = (text, heading) =>
  text.toLowerCase().includes(heading.toLowerCase());

const termPresent = (resumeText, term) => {
  const normalized = normalizeTerm(term);
  if (!normalized) return false;
  if (resumeText.includes(normalized)) return true;
  const parts = normalized.split(" ").filter((p) => p.length > 2);
  return parts.length > 1 && parts.every((p) => resumeText.includes(p));
};

const extractPhrases = (text) => {
  const words = tokenize(text);
  const phrases = [];
  for (let i = 0; i < words.length - 1; i++) {
    const two = `${words[i]} ${words[i + 1]}`;
    if (two.length > 9) phrases.push(two);
    if (i < words.length - 2) phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return [...new Set(phrases.filter((p) => {
    const parts = p.split(" ");
    return parts.length >= 2 && parts.every((part) => part.length > 3);
  }))];
};

const profileTermsFor = (text) =>
  unique(PROFILE_PHRASES.flatMap((profile) =>
    profile.match.some((phrase) => normalizeTerm(text).includes(phrase)) ? profile.terms : []
  ));

const buildAtsTerms = (job, jobTitle = "") => {
  const combined = `${jobTitle}\n${job}`;
  const normalizedCombined = normalizeTerm(combined);
  const titleTerms = unique([jobTitle, ...extractPhrases(jobTitle)]).slice(0, 5);
  const skillTerms = COMMON_SKILLS.filter((t) => normalizedCombined.includes(normalizeTerm(t)));
  const jdPhrases = extractPhrases(job)
    .filter((p) => !p.split(" ").some((part) => ["candidate","developer","profile","required"].includes(part)))
    .slice(0, 35);
  const rolePhrases = profileTermsFor(combined);
  const responsibilityPhrases = jdPhrases.filter((p) => {
    if (p.split(" ").some((part) => ["developer","candidate","profile"].includes(part))) return false;
    return /\b(manage|develop|design|build|create|analyze|lead|support|coordinate|implement|optimize|maintain|deliver|collaborate|monitor|report)\b/.test(p);
  });
  return [
    ...titleTerms.map((t) => ({ term: t, type: "profile", source: "Job title/profile", weight: 5 })),
    ...skillTerms.map((t) => ({ term: t, type: "skill", source: "Required skills", weight: 4 })),
    ...responsibilityPhrases.map((t) => ({ term: t, type: "responsibility", source: "Responsibilities", weight: 3 })),
    ...rolePhrases.map((t) => ({ term: t, type: "role phrase", source: "Profile keywords", weight: 3 })),
    ...jdPhrases.map((t) => ({ term: t, type: "jd phrase", source: "Job description", weight: 2 }))
  ]
    .filter((item, i, list) => list.findIndex((o) => normalizeTerm(o.term) === normalizeTerm(item.term)) === i)
    .filter((item) => normalizeTerm(item.term).split(" ").every((p) => !STOP_WORDS.has(p)))
    .slice(0, 60);
};

// ── Word-count based page estimator ─────────────────────────
const estimatePageCount = (text) => {
  const wordCount = String(text || "").split(/\s+/).filter(Boolean).length;
  // ~380 words per A4 page in typical resume layout
  return wordCount / 380;
};

// ═══════════════════════════════════════════════════════════
// 13-RULE ATS COMPLIANCE CHECKS
// Each check: { label, importance ("high"|"medium"), passed, detail }
// ═══════════════════════════════════════════════════════════
const buildCheckedItems = ({
  resumeText, jobWords, matched, jobPhrases, matchedPhrases,
  importantTerms, missingImportantTerms
}) => [
  // ── 1. Contact details present (High) ────────────────────
  {
    label: "Contact details present",
    importance: "high",
    passed:
      /[\w.+-]+@[\w.-]+\.\w+/.test(resumeText) &&
      /\+?\d[\d\s\-()\\.]{7,}/.test(resumeText),
    detail: "Both email and phone number must be present and parseable by ATS software."
  },

  // ── 2. Professional summary (High) ───────────────────────
  {
    label: "Professional summary / career objective",
    importance: "high",
    passed:
      ["summary","professional summary","career objective","objective","profile"]
        .some((h) => sectionPresent(resumeText, h)),
    detail: "A 2-4 line summary at the top is the single most-read section by ATS and recruiters."
  },

  // ── 3. Role-specific keywords (High) ─────────────────────
  {
    label: "Role-specific keywords",
    importance: "high",
    passed:
      importantTerms.some((item) => item.type === "profile" && termPresent(resumeText, item.term)) ||
      importantTerms.some((item) => item.type === "skill" && termPresent(resumeText, item.term)),
    detail: "Target role and core domain keywords must appear naturally in the resume content."
  },

  // ── 4. Skills section (High) ─────────────────────────────
  {
    label: "Skills section present",
    importance: "high",
    passed:
      ["skills","technical skills","core competencies","key skills","competencies"]
        .some((h) => sectionPresent(resumeText, h)),
    detail: "A dedicated Skills section lets ATS systems extract your technical abilities directly."
  },

  // ── 5. Work experience with measurable impact (High) ─────
  {
    label: "Work experience with measurable impact",
    importance: "high",
    passed:
      ["experience","work experience","professional experience","employment","internship","training"]
        .some((h) => sectionPresent(resumeText, h)) &&
      /\b\d+[%x+]?\b/.test(resumeText),
    detail: "Experience section should exist and bullets should include at least one metric (%, numbers, scale)."
  },

  // ── 6. Project details (High) ────────────────────────────
  {
    label: "Project details present",
    importance: "high",
    passed: sectionPresent(resumeText, "project"),
    detail: "A Projects section demonstrates practical skills and significantly boosts keyword coverage."
  },

  // ── 7. Education (Medium) ────────────────────────────────
  {
    label: "Education section present",
    importance: "medium",
    passed: ["education","academic background","academics"].some((h) => sectionPresent(resumeText, h)),
    detail: "Education is required by most ATS parsers. Include degree, institution, and graduation year."
  },

  // ── 8. Certifications (Medium) ───────────────────────────
  {
    label: "Certifications listed",
    importance: "medium",
    passed:
      ["certification","certifications","certificate","certificates","licenses"]
        .some((h) => sectionPresent(resumeText, h)),
    detail: "Certifications add credibility and role-relevant keywords — include even a single relevant one."
  },

  // ── 9. No tables / images / icons (High) ─────────────────
  {
    label: "ATS-safe formatting (no tables or images)",
    importance: "high",
    passed:
      !/\|.+\|/.test(resumeText) &&                   // no markdown table rows
      !/ {4,}\S.+\S {4,}/.test(resumeText) &&          // no column-aligned text (tables)
      !/={4,}/.test(resumeText),                        // no heavy separator lines
    detail: "Tables, columns, text boxes, and images break ATS parsing. Use plain single-column layout."
  },

  // ── 10. Standard section headings (High) ─────────────────
  {
    label: "Standard section headings used",
    importance: "high",
    passed:
      ["summary","experience","education","skills"]
        .filter((h) => sectionPresent(resumeText, h)).length >= 3,
    detail: "Use standard headings: Summary, Experience, Education, Skills, Projects. Avoid creative labels."
  },

  // ── 11. Bullet points with strong action verbs (High) ────
  {
    label: "Bullet points with strong action verbs",
    importance: "high",
    passed:
      /(^|\n)\s*[-*•]/.test(resumeText) &&
      ACTION_VERBS.some((verb) => resumeText.includes(verb)),
    detail: "Bullets should start with action verbs: Led, Built, Delivered, Reduced, Increased, Implemented…"
  },

  // ── 12. One or two page length (High) ────────────────────
  {
    label: "Resume length: 1–2 pages",
    importance: "high",
    passed: (() => {
      const pages = estimatePageCount(resumeText);
      return pages >= 0.4 && pages <= 2.2;
    })(),
    detail: "Keep your resume to 1–2 pages. Too short signals lack of experience; too long loses recruiter attention."
  },

  // ── 13. Grammar and clarity (High) ──────────────────────
  {
    label: "Grammar and clarity",
    importance: "high",
    passed: (() => {
      const hasDoubleWords = /\b(\w{3,})\s+\1\b/i.test(resumeText);
      const hasMeaningfulContent = resumeText.split(/\s+/).filter(Boolean).length >= 80;
      const noExcessiveCaps = !/[A-Z]{6,}/.test(resumeText); // e.g. garbled PDF text
      return !hasDoubleWords && hasMeaningfulContent && noExcessiveCaps;
    })(),
    detail: "Ensure no repeated words, no garbled text, and at least 80 words of structured content."
  },

  // ── 14. JD keyword coverage (High) ──────────────────────
  {
    label: "Job description keyword coverage",
    importance: "high",
    passed: jobWords.length === 0 || matched.length / jobWords.length >= 0.6,
    detail: `${matched.length} of ${jobWords.length} job description keywords found in the resume.`
  }
];

// ═══════════════════════════════════════════════════════════
// Main export
// ═══════════════════════════════════════════════════════════
export const calculateATS = (resume, job, options = {}) => {
  const jobTitle = options.jobTitle || "";
  const jobWords = [...new Set(tokenize(`${jobTitle} ${job}`))];
  const resumeWords = new Set(tokenize(resume));
  const jobPhrases = extractPhrases(`${jobTitle} ${job}`).slice(0, 30);
  const resumeText = String(resume || "").toLowerCase();

  if (jobWords.length === 0) {
    return { score: 0, missing: [], checkedItems: [] };
  }

  const matched = jobWords.filter((w) => resumeWords.has(w));
  const missing = jobWords.filter((w) => !resumeWords.has(w));
  const matchedPhrases = jobPhrases.filter((p) => resumeText.includes(p));
  const importantTerms = buildAtsTerms(job, jobTitle);
  const allMissingImportantTerms = importantTerms.filter((item) => !termPresent(resumeText, item.term));
  const missingImportantTerms = allMissingImportantTerms
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 15)
    .map((item) => ({
      ...item,
      reason:
        item.type === "skill" ? "Required skill from the job description is not clearly present." :
        item.type === "profile" ? "Target profile wording should be visible in the title or summary." :
        item.type === "responsibility" ? "Core job responsibility should be reflected in an experience or project bullet." :
        "Important JD phrase is missing or too weak in the resume."
    }));

  // ── Build the 14 rule checks ─────────────────────────────
  const checkedItems = buildCheckedItems({
    resumeText, jobWords, matched, jobPhrases, matchedPhrases,
    importantTerms, missingImportantTerms
  });

  // ── Structural score from the rule checks ─────────────────
  const highChecks = checkedItems.filter((c) => c.importance === "high");
  const mediumChecks = checkedItems.filter((c) => c.importance === "medium");
  const structuralHigh = highChecks.filter((c) => c.passed).length / highChecks.length;
  const structuralMedium = mediumChecks.length
    ? mediumChecks.filter((c) => c.passed).length / mediumChecks.length
    : 1;
  const structuralScore = structuralHigh * 0.85 + structuralMedium * 0.15;

  // ── Keyword / phrase coverage ─────────────────────────────
  const keywordCoverage = matched.length / jobWords.length;
  const phraseCoverage = jobPhrases.length ? matchedPhrases.length / jobPhrases.length : 0;
  const importantCoverage = importantTerms.length
    ? (importantTerms.length - allMissingImportantTerms.length) / importantTerms.length
    : keywordCoverage;

  // ── Legacy section / polish scores (kept for continuity) ──
  const sectionList = ["summary","skills","experience","education","projects"];
  const sectionCoverage = sectionList.filter((s) => sectionPresent(resumeText, s)).length / sectionList.length;
  const hasBullets = /(^|\n)\s*[-*•]/.test(resume);
  const hasMetrics = /\b\d+[%x+]?\b/.test(resume);
  const polishScore = [hasBullets, hasMetrics].filter(Boolean).length / 2;

  // ── Weighted final score ───────────────────────────────────
  // Rule checks now contribute 30% of the score alongside JD match signals
  const weightedScore =
    keywordCoverage   * 0.30 +
    importantCoverage * 0.22 +
    structuralScore   * 0.30 +   // 13-rule structural compliance
    phraseCoverage    * 0.08 +
    sectionCoverage   * 0.06 +
    polishScore       * 0.04;

  const baseScore = Math.round(weightedScore * 100);

  // ── Boost floor for high keyword coverage ─────────────────
  const score =
    keywordCoverage >= 0.98 ? Math.max(baseScore, 90) :
    keywordCoverage >= 0.9  ? Math.max(baseScore, 84) :
    keywordCoverage >= 0.8  ? Math.max(baseScore, 76) :
    baseScore;

  return {
    score,
    matchedCount: matched.length,
    totalKeywords: jobWords.length,
    missing: (missingImportantTerms.length
      ? missingImportantTerms.map((item) => item.term)
      : missing
    ).slice(0, 20),
    missingDetails: missingImportantTerms,
    matchedPhrases: matchedPhrases.slice(0, 10),
    checkedItems,
    requiredTerms: importantTerms.slice(0, 25).map((item) => ({
      ...item,
      present: termPresent(resumeText, item.term)
    })),
    breakdown: {
      keywordCoverage: Math.round(keywordCoverage * 100),
      importantCoverage: Math.round(importantCoverage * 100),
      structuralScore: Math.round(structuralScore * 100),
      phraseCoverage: Math.round(phraseCoverage * 100),
      sectionCoverage: Math.round(sectionCoverage * 100),
      polishScore: Math.round(polishScore * 100)
    }
  };
};
