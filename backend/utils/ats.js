const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "with",
  "you",
  "your",
  "will",
  "our",
  "this",
  "have",
  "has",
  "must",
  "should",
  "candidate",
  "role",
  "work",
  "team",
  "teams",
  "ability",
  "responsibilities",
  "requirements",
  "preferred",
  "required"
]);

const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

const sectionPresent = (text, section) => text.toLowerCase().includes(section);

const normalizeTerm = (term) =>
  String(term || "")
    .toLowerCase()
    .replace(/[^\w+#. -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const unique = (items) => [...new Set(items.map(normalizeTerm).filter(Boolean))];

const COMMON_SKILLS = [
  "react",
  "react.js",
  "node.js",
  "javascript",
  "typescript",
  "html",
  "css",
  "redux",
  "next.js",
  "express.js",
  "mongodb",
  "mysql",
  "postgresql",
  "sql",
  "python",
  "java",
  "spring boot",
  "aws",
  "azure",
  "docker",
  "kubernetes",
  "git",
  "rest api",
  "graphql",
  "microservices",
  "ci/cd",
  "data analysis",
  "power bi",
  "tableau",
  "excel",
  "machine learning",
  "agile",
  "scrum",
  "jira",
  "seo",
  "google analytics",
  "crm",
  "salesforce",
  "customer success",
  "talent acquisition",
  "payroll",
  "financial reporting"
];

const PROFILE_PHRASES = [
  {
    match: ["frontend", "front end", "react"],
    terms: [
      "responsive design",
      "component architecture",
      "state management",
      "api integration",
      "performance optimization",
      "accessibility"
    ]
  },
  {
    match: ["backend", "back end", "node"],
    terms: [
      "rest api development",
      "database design",
      "authentication",
      "server-side logic",
      "api performance",
      "scalable services"
    ]
  },
  {
    match: ["full stack", "mern", "software engineer"],
    terms: [
      "full stack development",
      "end-to-end feature delivery",
      "api integration",
      "debugging",
      "code quality",
      "production support"
    ]
  },
  {
    match: ["data analyst", "business analyst", "analytics"],
    terms: [
      "data analysis",
      "dashboard reporting",
      "business insights",
      "sql queries",
      "data visualization",
      "stakeholder reporting"
    ]
  },
  {
    match: ["project manager", "program manager", "scrum"],
    terms: [
      "project planning",
      "stakeholder management",
      "risk management",
      "sprint planning",
      "cross-functional collaboration",
      "delivery tracking"
    ]
  },
  {
    match: ["sales", "business development"],
    terms: [
      "lead generation",
      "pipeline management",
      "client relationship management",
      "revenue growth",
      "sales targets",
      "crm"
    ]
  },
  {
    match: ["digital marketing", "marketing", "seo"],
    terms: [
      "campaign optimization",
      "seo strategy",
      "content marketing",
      "conversion rate",
      "google analytics",
      "performance marketing"
    ]
  },
  {
    match: ["hr", "human resources", "recruiter"],
    terms: [
      "talent acquisition",
      "employee onboarding",
      "candidate screening",
      "hr operations",
      "payroll coordination",
      "employee engagement"
    ]
  }
];

const extractPhrases = (text) => {
  const words = tokenize(text);
  const phrases = [];

  for (let index = 0; index < words.length - 1; index += 1) {
    const twoWord = `${words[index]} ${words[index + 1]}`;
    if (twoWord.length > 9) phrases.push(twoWord);
    if (index < words.length - 2) {
      phrases.push(`${words[index]} ${words[index + 1]} ${words[index + 2]}`);
    }
  }

  return [
    ...new Set(
      phrases.filter((phrase) => {
        const parts = phrase.split(" ");
        return parts.length >= 2 && parts.every((part) => part.length > 3);
      })
    )
  ];
};

const profileTermsFor = (text) => {
  const normalized = normalizeTerm(text);
  return unique(
    PROFILE_PHRASES.flatMap((profile) =>
      profile.match.some((phrase) => normalized.includes(phrase)) ? profile.terms : []
    )
  );
};

const termPresent = (resumeText, term) => {
  const normalized = normalizeTerm(term);
  if (!normalized) return false;
  if (resumeText.includes(normalized)) return true;
  const parts = normalized.split(" ").filter((part) => part.length > 2);
  return parts.length > 1 && parts.every((part) => resumeText.includes(part));
};

const buildAtsTerms = (job, jobTitle = "") => {
  const combined = `${jobTitle}\n${job}`;
  const normalizedCombined = normalizeTerm(combined);
  const titleTerms = unique([jobTitle, ...extractPhrases(jobTitle)]).slice(0, 5);
  const skillTerms = COMMON_SKILLS.filter((term) => normalizedCombined.includes(normalizeTerm(term)));
  const jdPhrases = extractPhrases(job)
    .filter((phrase) => !phrase.split(" ").some((part) => ["candidate", "developer", "profile", "required"].includes(part)))
    .slice(0, 35);
  const rolePhrases = profileTermsFor(combined);
  const responsibilityPhrases = jdPhrases.filter((phrase) => {
    const parts = phrase.split(" ");
    if (parts.some((part) => ["developer", "candidate", "profile"].includes(part))) return false;
    return /\b(manage|develop|design|build|create|analyze|lead|support|coordinate|implement|optimize|maintain|deliver|collaborate|monitor|report)\b/.test(
      phrase
    );
  });

  return [
    ...titleTerms.map((term) => ({ term, type: "profile", source: "Job title/profile", weight: 5 })),
    ...skillTerms.map((term) => ({ term, type: "skill", source: "Required skills", weight: 4 })),
    ...responsibilityPhrases.map((term) => ({ term, type: "responsibility", source: "Responsibilities", weight: 3 })),
    ...rolePhrases.map((term) => ({ term, type: "role phrase", source: "Profile keywords", weight: 3 })),
    ...jdPhrases.map((term) => ({ term, type: "jd phrase", source: "Job description", weight: 2 }))
  ]
    .filter((item, index, list) => list.findIndex((other) => normalizeTerm(other.term) === normalizeTerm(item.term)) === index)
    .filter((item) => normalizeTerm(item.term).split(" ").every((part) => !STOP_WORDS.has(part)))
    .slice(0, 60);
};

const buildCheckedItems = ({ resumeText, jobWords, matched, jobPhrases, matchedPhrases, importantTerms, missingImportantTerms }) => {
  const checks = [
    {
      label: "Job title/profile alignment",
      passed: importantTerms.some((item) => item.type === "profile" && termPresent(resumeText, item.term)),
      detail: "Target title or close profile phrase should appear near the header or summary."
    },
    {
      label: "Required keyword coverage",
      passed: jobWords.length > 0 && matched.length / jobWords.length >= 0.8,
      detail: `${matched.length} of ${jobWords.length} JD keywords found.`
    },
    {
      label: "Exact JD phrase coverage",
      passed: jobPhrases.length === 0 || matchedPhrases.length / jobPhrases.length >= 0.25,
      detail: `${matchedPhrases.length} important phrases matched.`
    },
    {
      label: "Required skills present",
      passed: missingImportantTerms.filter((item) => item.type === "skill").length === 0,
      detail: "Hard skills from the JD should appear in Skills and relevant bullets."
    },
    {
      label: "Responsibilities mapped to bullets",
      passed: missingImportantTerms.filter((item) => item.type === "responsibility").length <= 2,
      detail: "Core responsibilities should appear naturally in experience or project bullets."
    },
    {
      label: "ATS-readable sections",
      passed: ["summary", "skills", "experience", "education"].filter((section) => sectionPresent(resumeText, section)).length >= 3,
      detail: "Standard section names help parsers identify resume content."
    },
    {
      label: "Impact bullets and metrics",
      passed: /(^|\n)\s*[-*]/.test(resumeText) && /\b\d+[%x+]?/.test(resumeText),
      detail: "Bullet points with numbers usually score better for recruiter readability."
    },
    {
      label: "Contact parse readiness",
      passed: /[\w.+-]+@[\w.-]+\.\w+/.test(resumeText) || /\b\d{10}\b/.test(resumeText),
      detail: "Email or phone should be parseable by hiring systems."
    }
  ];

  return checks;
};

export const calculateATS = (resume, job, options = {}) => {
  const jobTitle = options.jobTitle || "";
  const jobWords = [...new Set(tokenize(`${jobTitle} ${job}`))];
  const resumeWords = new Set(tokenize(resume));
  const jobPhrases = extractPhrases(`${jobTitle} ${job}`).slice(0, 30);
  const resumeText = String(resume || "").toLowerCase();

  if (jobWords.length === 0) {
    return {
      score: 0,
      missing: [],
      checkedItems: []
    };
  }

  const matched = jobWords.filter((word) => resumeWords.has(word));
  const missing = jobWords.filter((word) => !resumeWords.has(word));
  const matchedPhrases = jobPhrases.filter((phrase) => resumeText.includes(phrase));
  const importantTerms = buildAtsTerms(job, jobTitle);
  const allMissingImportantTerms = importantTerms.filter((item) => !termPresent(resumeText, item.term));
  const missingImportantTerms = allMissingImportantTerms
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 15)
    .map((item) => ({
      ...item,
      reason:
        item.type === "skill"
          ? "Required skill from the job description is not clearly present."
          : item.type === "profile"
          ? "Target profile wording should be visible in the title or summary."
          : item.type === "responsibility"
          ? "Core job responsibility should be reflected in an experience/project bullet."
          : "Important JD phrase is missing or too weak."
    }));

  const keywordCoverage = matched.length / jobWords.length;
  const phraseCoverage = jobPhrases.length ? matchedPhrases.length / jobPhrases.length : 0;
  const importantCoverage = importantTerms.length
    ? (importantTerms.length - allMissingImportantTerms.length) / importantTerms.length
    : keywordCoverage;

  const sectionList = ["summary", "skills", "experience", "education", "projects"];
  const sectionMatches = sectionList.filter((section) => sectionPresent(resumeText, section)).length;
  const sectionCoverage = sectionMatches / sectionList.length;

  const hasBullets = /(^|\n)\s*[-*]/.test(resume);
  const hasMetrics = /\b\d+[%x+]?/.test(resume);
  const polishScore = [hasBullets, hasMetrics].filter(Boolean).length / 2;

  const weightedScore =
    keywordCoverage * 0.45 + importantCoverage * 0.3 + phraseCoverage * 0.1 + sectionCoverage * 0.09 + polishScore * 0.06;
  const baseScore = Math.round(weightedScore * 100);
  const score =
    keywordCoverage >= 0.98
      ? Math.max(baseScore, 92)
      : keywordCoverage >= 0.9
      ? Math.max(baseScore, 86)
      : keywordCoverage >= 0.8
      ? Math.max(baseScore, 78)
      : baseScore;

  return {
    score,
    matchedCount: matched.length,
    totalKeywords: jobWords.length,
    missing: (missingImportantTerms.length ? missingImportantTerms.map((item) => item.term) : missing).slice(0, 20),
    missingDetails: missingImportantTerms,
    matchedPhrases: matchedPhrases.slice(0, 10),
    checkedItems: buildCheckedItems({
      resumeText,
      jobWords,
      matched,
      jobPhrases,
      matchedPhrases,
      importantTerms,
      missingImportantTerms
    }),
    requiredTerms: importantTerms.slice(0, 25).map((item) => ({
      ...item,
      present: termPresent(resumeText, item.term)
    })),
    breakdown: {
      keywordCoverage: Math.round(keywordCoverage * 100),
      importantCoverage: Math.round(importantCoverage * 100),
      phraseCoverage: Math.round(phraseCoverage * 100),
      sectionCoverage: Math.round(sectionCoverage * 100),
      polishScore: Math.round(polishScore * 100)
    }
  };
};
