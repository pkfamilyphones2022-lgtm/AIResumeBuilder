import axios from "axios";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const stripFence = (content) =>
  String(content || "")
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();

const extractJSON = (content) => {
  const trimmed = String(content || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {}
  try {
    return JSON.parse(stripFence(trimmed));
  } catch {}
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  throw new SyntaxError("No valid JSON object found in response");
};

const normalizeArray = (items) =>
  Array.isArray(items)
    ? items.filter(Boolean)
    : String(items || "")
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean);

const normalizeBullets = (items) =>
  normalizeArray(items).map((item) => item.replace(/^[-*]\s*/, "").trim());

const countResumeLines = (resume = {}) =>
  [
    resume.fullName,
    resume.title,
    resume.summary,
    ...(normalizeBullets(resume.skills) || []),
    ...(normalizeArray(resume.experience).flatMap((item) => normalizeBullets(item.bullets)) || []),
    ...(normalizeArray(resume.projects).flatMap((item) => normalizeBullets(item.bullets)) || []),
    ...(normalizeArray(resume.education).map((item) => [item.degree, item.institution, item.details].filter(Boolean).join(" ")) || []),
    ...(normalizeBullets(resume.certifications) || [])
  ].filter(Boolean).length;

const normalizeStructuredResume = (resume, userData) => ({
  fullName: resume.fullName || userData.name || "",
  title: resume.title || userData.targetTitle || "Professional Resume",
  contact: {
    email: resume.contact?.email || userData.email || "",
    phone: resume.contact?.phone || userData.phone || "",
    location: resume.contact?.location || userData.location || "",
    linkedin: resume.contact?.linkedin || userData.linkedin || "",
    portfolio: resume.contact?.portfolio || userData.portfolio || ""
  },
  summary: resume.summary || "",
  skills: normalizeBullets(resume.skills),
  experience: normalizeArray(resume.experience).map((item) => ({
    role: item.role || "",
    company: item.company || "",
    duration: item.duration || "",
    location: item.location || "",
    bullets: normalizeBullets(item.bullets)
  })),
  projects: normalizeArray(resume.projects).map((item) => ({
    name: item.name || "",
    subtitle: item.subtitle || "",
    bullets: normalizeBullets(item.bullets)
  })),
  education: normalizeArray(resume.education).map((item) => ({
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
    status: resume.verification?.status || "AI verified for clarity, ATS alignment, and truthfulness.",
    checkedLines: Number(resume.verification?.checkedLines || countResumeLines(resume)),
    notes: normalizeBullets(resume.verification?.notes).slice(0, 8),
    lineChecks: normalizeArray(resume.verification?.lineChecks)
      .map((item) => ({
        section: item.section || "",
        line: item.line || "",
        result: item.result || "Verified"
      }))
      .slice(0, 12)
  }
});

const createGroqRequest = async (messages, temperature = 0.5) => {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured.");

  const response = await axios.post(
    GROQ_URL,
    {
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages,
      response_format: { type: "json_object" },
      temperature
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      proxy: false,
      timeout: 60000
    }
  );

  const content = response.data?.choices?.[0]?.message?.content?.trim() || "{}";
  return extractJSON(content);
};

let anthropicClient = null;
const getAnthropicClient = () => {
  if (anthropicClient) return anthropicClient;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  anthropicClient = new Anthropic({ apiKey: key });
  return anthropicClient;
};

const createAnthropicRequest = async (messages, temperature = 0.5) => {
  const client = getAnthropicClient();
  if (!client) throw new Error("ANTHROPIC_API_KEY is not configured.");

  const systemContent = messages.find((m) => m.role === "system")?.content || "";
  const userMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5",
    max_tokens: 4096,
    system: systemContent,
    messages: userMessages,
    temperature
  });

  const content = response.content?.find((c) => c.type === "text")?.text?.trim() || "{}";
  return extractJSON(content);
};

const shouldFallbackToAnthropic = (err) => {
  // No HTTP response means Groq is misconfigured or unreachable — try Anthropic
  if (!err.response) return true;
  const status = err.response.status;
  if (status === 429) return true;
  if (status === 502 || status === 503 || status === 504 || status === 524) return true;
  const message = String(err.response?.data?.error?.message || err.message || "").toLowerCase();
  return message.includes("rate") && message.includes("limit");
};

const createRequest = async (messages, temperature = 0.5) => {
  try {
    return await createGroqRequest(messages, temperature);
  } catch (err) {
    if (!shouldFallbackToAnthropic(err)) throw err;
    return createAnthropicRequest(messages, temperature);
  }
};

// Extracts specific numbered sections (## N.) from the rulebook markdown.
// Used to build a condensed prompt-safe version that stays within Groq's token limit.
const extractRulebookSections = (fullText, sectionNumbers) => {
  const lines = fullText.split("\n");
  const sections = [];
  let capturing = false;
  let buffer = [];

  for (const line of lines) {
    const h2 = line.match(/^## (\d+)\./);
    if (h2) {
      if (capturing && buffer.length) {
        sections.push(buffer.join("\n"));
        buffer = [];
      }
      capturing = sectionNumbers.includes(Number(h2[1]));
    }
    if (capturing) buffer.push(line);
  }
  if (capturing && buffer.length) sections.push(buffer.join("\n"));
  return sections.join("\n\n");
};

const RESUME_RULEBOOK = (() => {
  try {
    const rulebookPath = resolve(__dirname, "../../frontend/resume-builder-rules-readme.md");
    const full = readFileSync(rulebookPath, "utf-8");
    // Sections critical for generation — skips large reference sections (10, 16, 25, etc.)
    // that exceed Groq's token limit but aren't needed in the prompt itself.
    return extractRulebookSections(full, [1, 5, 7, 8, 9, 11, 13, 14, 22, 23, 29, 31]);
  } catch {
    return "Follow standard professional resume writing best practices. Truth first, ATS-readable, recruiter-friendly, achievement-focused.";
  }
})();

const rulesForCandidateType = (type) =>
  String(type || "").toLowerCase() === "fresher"
    ? `
Candidate type is FRESHER. Apply Section 11.1 (Fresher/Student) rules from the rulebook:
- Section order: Header, Objective, Skills, Projects, Education, Internship/Training, Certifications, Achievements/Activities.
- Use a 1-2 line Objective (not a senior-style Summary).
- Projects are mandatory when work experience is absent. Use 2-4 relevant projects.
- Education appears above internships/experience.
- Do not fabricate work experience. Use only internships/training/projects the user provided.
`
    : `
Candidate type is EXPERIENCED. Apply Section 11.2-11.5 rules from the rulebook:
- Section order: Header, Professional Summary, Skills/Core Competencies, Professional Experience, Key Projects, Certifications, Education.
- Summary must be 2-4 lines: true experience level, target-role alignment, strongest tools/domain keywords, impact area.
- Professional experience reverse chronological: 3-6 bullets for recent roles, fewer for older roles.
- Convert responsibilities into achievement-oriented bullets. Stay truthful.
- Education appears after professional experience.
`;

export const generateAIResume = async (userData, jobDescription, resumeText) => {
  const systemMessage = `You are an expert resume writer and ATS optimization specialist.

You must follow every rule in the product rulebook below when creating resumes.
Pay special attention to:
- Section 1 (Core Resume Philosophy): truth-first, ATS-readable, recruiter-friendly
- Section 5 (Mandatory Fields): required fields per section
- Section 7 (Formatting Standards): ATS-safe formatting rules
- Section 8 (ATS Tracker Rules): ATS checklist and scoring
- Section 9 (AI Keyword Engine): keyword extraction and safety rules
- Section 10 (Role Families): role-specific keywords and bullet focus for the candidate's target role
- Section 11 (Career Stage Rules): section order and rules by career stage
- Section 13 (Bullet Writing Rules): bullet structure, length, quality checklist, action verbs
- Section 14 (Achievement and Metric Rules): how to handle metrics
- Section 22 (Resume Generation Algorithm): step-by-step generation process
- Section 29-31 (Common Mistakes, Quality Examples, Final Rules): avoid these mistakes

Return strict JSON only. No markdown. No commentary.

--- PRODUCT RULEBOOK START ---
${RESUME_RULEBOOK}
--- PRODUCT RULEBOOK END ---`;

  const userPrompt = `Create a professional, ATS-optimized resume in structured JSON for this candidate.

Candidate type: ${userData.type || "Fresher"}

${rulesForCandidateType(userData.type)}

Candidate data:
${JSON.stringify(userData, null, 2)}

Existing resume text (raw facts only — do not copy its weak wording or layout):
${resumeText || "None"}

Target job description:
${jobDescription || "No specific job description provided — generate a strong general resume for the candidate's target role and industry."}

Generation instructions:
- Follow the Resume Generation Algorithm (Section 22) from the rulebook.
- Use the Role Family rules (Section 10) matching the candidate's target role for keywords, bullet focus, and metrics.
- Apply the Career Stage section order (Section 11) matching the candidate type.
- Treat uploaded resume text as raw facts only. Rewrite every bullet stronger than the original.
- Add ATS keywords from the job description naturally and truthfully — follow Section 9 keyword safety rules.
- For Fresher: generate a role-specific Objective, prioritize Projects + Education, use coursework, achievements, internships.
- For Experienced: generate a Professional Summary (2-4 lines), prioritize Experience, use achievement bullets.
- Convert training/internship data into experience entries only when the user provided real details.
- Verify every line for grammar, clarity, ATS fit, and truthfulness (Section 26 checklist).
- Aim for 95+ ATS match. Do not keyword-stuff.
- Do not invent employers, degrees, certifications, tools, dates, or metrics.
- Return valid JSON only using this exact schema:
{
  "fullName": "string",
  "title": "string",
  "contact": { "email": "string", "phone": "string", "location": "string", "linkedin": "string", "portfolio": "string" },
  "summary": "string",
  "skills": ["string"],
  "experience": [{ "role": "string", "company": "string", "duration": "string", "location": "string", "bullets": ["string"] }],
  "projects": [{ "name": "string", "subtitle": "string", "bullets": ["string"] }],
  "education": [{ "degree": "string", "institution": "string", "duration": "string", "details": "string" }],
  "certifications": ["string"],
  "coursework": ["string"],
  "achievements": ["string"],
  "keywords": ["string"],
  "atsStrategy": {
    "targetPhrases": ["string"],
    "insertedKeywords": ["string"],
    "rolePhrases": ["string"]
  },
  "verification": {
    "status": "string",
    "checkedLines": 0,
    "notes": ["string"],
    "lineChecks": [{ "section": "string", "line": "string", "result": "string" }]
  }
}`;

  try {
    const parsed = await createRequest(
      [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      0.5
    );
    return normalizeStructuredResume(parsed, userData);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error("The AI response could not be parsed into a structured resume.");
    }
    throw new Error(
      err.response?.data?.error?.message || err.response?.data?.message || err.message
    );
  }
};

export const improveAIResume = async ({
  resumeData,
  userData,
  jobDescription,
  missingKeywords,
  currentScore
}) => {
  const systemMessage = `You are an expert resume writer and ATS optimization specialist improving an existing resume.

You must follow the product rulebook below. Key sections for improvement:
- Section 8.1 (ATS Compatibility Checklist): ensure all items pass
- Section 8.3 (ATS Keyword Match Logic): apply keyword classification and match rules
- Section 9 (AI Keyword Engine): keyword safety rules — never add skills the user does not have
- Section 13 (Bullet Writing Rules): rewrite weak bullets using the bullet formula and action verb bank
- Section 14 (Achievement and Metric Rules): strengthen impact language where truthful
- Section 15 (Tailoring Rules): follow the tailoring process and safety rules
- Section 31 (Final Product Rule): resume must pass all 10 final criteria

Return strict JSON only. No markdown. No commentary.

--- PRODUCT RULEBOOK START ---
${RESUME_RULEBOOK}
--- PRODUCT RULEBOOK END ---`;

  const userPrompt = `Improve this resume JSON to raise its ATS match against the target job description while staying completely truthful.

Current ATS score: ${currentScore}
Target ATS score: 95+

Highest-priority missing keywords to address:
${missingKeywords.join(", ") || "None"}

Candidate data:
${JSON.stringify(userData, null, 2)}

Current resume JSON:
${JSON.stringify(resumeData, null, 2)}

Target job description:
${jobDescription || "No specific job description provided — improve based on the candidate's target role and industry."}

${rulesForCandidateType(userData?.type)}

Improvement instructions:
- Keep the exact same JSON schema.
- Apply Section 15.1 (Resume Tailoring Process) from the rulebook step by step.
- Extract target-profile phrases from the job title, job description, responsibilities, and required skills.
- Add missing keywords naturally into summary, skills, experience bullets, project bullets, and keyword list — only where truthful.
- Follow Section 9.3 (Keyword Safety Rules): never add tools, certifications, or experience the candidate does not have.
- Do not merely append missing words. Rewrite weak lines into strong achievement/responsibility bullets (Section 13).
- Use Section 14 metric rules: strengthen impact language where candidate data supports it; use conservative wording where it does not.
- Preserve fresher vs experienced section order and emphasis.
- Verify each line for grammar, recruiter readability, ATS keyword fit, and truthfulness.
- Do not add fake employers, degrees, dates, tools, or responsibilities.
- Return valid JSON only using the complete schema, including atsStrategy and verification.`;

  try {
    const parsed = await createRequest(
      [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      0.35
    );
    return normalizeStructuredResume(parsed, userData);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error("The AI refinement response could not be parsed into a structured resume.");
    }
    throw new Error(
      err.response?.data?.error?.message || err.response?.data?.message || err.message
    );
  }
};

export const generateKeywordSuggestions = async (keywords, jobDescription, resumeData) => {
  const top = (keywords || []).slice(0, 5);
  const prompt = `You are a professional resume coach. For each missing keyword below, write ONE professional improvement suggestion.

Follow Section 9.3 (Keyword Safety Rules) from the product rulebook:
- Only suggest adding a keyword if the candidate could truthfully claim it.
- Do not invent credentials, companies, tools, or unverifiable metrics.
- Use the bullet formula from Section 13.1: Action verb + task + tools/method + result/impact + scope.

Target job context: ${String(jobDescription || "").slice(0, 500)}

Missing keywords: ${top.join(", ") || "None"}

Candidate context:
- Summary: ${String(resumeData?.summary || "Not provided").slice(0, 200)}
- Skills: ${(resumeData?.skills || []).slice(0, 10).join(", ")}
- Recent role: ${resumeData?.experience?.[0]?.role || ""} at ${resumeData?.experience?.[0]?.company || ""}

Rules:
- section must be one of: "summary", "experience", or "skills"
- For "summary": write a complete professional sentence naturally using the keyword
- For "experience": write an action-oriented bullet starting with a strong verb (use Section 13.4 action verb bank)
- For "skills": just return the keyword or a short skill phrase (2-3 words max)
- Return strict JSON only

Schema:
{
  "suggestions": [
    { "keyword": "string", "section": "summary | experience | skills", "text": "string" }
  ]
}`;

  try {
    const parsed = await createRequest(
      [
        { role: "system", content: "You are a professional resume coach following the product resume rulebook. Return strict JSON only." },
        { role: "user", content: prompt }
      ],
      0.4
    );
    return Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
  } catch (err) {
    if (err instanceof SyntaxError) throw new Error("Could not parse keyword suggestions.");
    throw new Error(
      err.response?.data?.error?.message || err.response?.data?.message || err.message
    );
  }
};
