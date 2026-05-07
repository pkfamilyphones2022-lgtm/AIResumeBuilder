const SECTION_ALIASES = {
  skills: ["skills", "technical skills", "core competencies", "tech stack"],
  education: ["education", "academic background", "academics"],
  experience: ["experience", "work experience", "professional experience", "employment"],
  projects: ["projects", "personal projects", "academic projects"],
  certifications: ["certifications", "certificates", "licenses"],
  summary: ["summary", "professional summary", "profile", "objective", "career objective", "about"]
};

const ALL_SECTION_ALIASES = Object.values(SECTION_ALIASES).flat();

const findSection = (text, aliases) => {
  const lines = text.split(/\r?\n/);
  const lowerAliases = aliases.map((item) => item.toLowerCase());
  let start = -1;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim().toLowerCase().replace(/[:\-]/g, "").trim();
    if (lowerAliases.includes(line)) {
      start = index + 1;
      break;
    }
  }

  if (start === -1) {
    return "";
  }

  const sectionLines = [];
  for (let index = start; index < lines.length; index += 1) {
    const current = lines[index].trim();
    const normalized = current.toLowerCase().replace(/[:\-]/g, "").trim();

    if (ALL_SECTION_ALIASES.includes(normalized)) {
      break;
    }

    if (current) {
      sectionLines.push(current);
    }
  }

  return sectionLines.join("\n").trim();
};

const dedupe = (items) => [...new Set(items.filter(Boolean))];

const parseDelimitedList = (text) =>
  dedupe(
    String(text || "")
      .split(/[\n,|]/)
      .map((item) => item.replace(/^[-*]\s*/, "").trim())
      .filter((item) => item.length > 1)
  );

const looksLikeName = (line) => /^[A-Za-z][A-Za-z\s.'-]{2,}$/.test(line) && !line.includes("@");

const looksLikeTitle = (line) =>
  /engineer|developer|manager|designer|analyst|specialist|consultant|intern|student|associate|lead|architect|executive|scientist|researcher|coordinator|director|officer|founder|tester|devops|cloud|security|backend|frontend|fullstack|full.stack|mobile|ios|android|recruiter|accountant|nurse|teacher|professor|writer|content|seo|qa|ml|ai|product|head|officer|strategist|administrator|technician|programmer/i.test(line);

const looksLikeLocation = (line) =>
  /^[A-Za-z\s.-]+(?:,\s*[A-Za-z\s.-]+){0,2}$/.test(line) &&
  !/@|linkedin|github|portfolio|http|www|\d{4,}/i.test(line);

const isContactOrLink = (line) =>
  /@|linkedin|github|portfolio|http|www|\+?\d[\d\s()-]{7,}/i.test(line);

const firstNonSectionParagraph = (lines, startIndex = 0) => {
  const paragraph = [];

  for (let index = startIndex; index < lines.length; index += 1) {
    const current = lines[index].trim();
    const normalized = current.toLowerCase().replace(/[:\-]/g, "").trim();

    if (!current) {
      if (paragraph.length) break;
      continue;
    }

    if (ALL_SECTION_ALIASES.includes(normalized)) {
      break;
    }

    if (paragraph.length === 0 && isContactOrLink(current)) {
      continue;
    }

    paragraph.push(current);
    if (paragraph.length >= 3) break;
  }

  return paragraph.join(" ").trim();
};

export const parseResumeDetails = (text) => {
  const safeText = String(text || "").trim();
  const lines = safeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const headerLines = lines.slice(0, 12);

  // Email — scan full text; also try collapsing spaces in case PDF adds inter-char spacing
  const email =
    safeText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/)?.[0]?.trim() ||
    safeText.replace(/ /g, "").match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/)?.[0]?.trim() ||
    "";

  // Phone — labeled label first, then international +prefix, then 10-digit block, then formatted
  const labeledPhone = safeText.match(
    /(?:mobile|phone|cell|contact|ph|mob|tel)[^\d+\n]{0,8}(\+?[\d][\d\s\-().]{6,20})/i
  )?.[1]?.replace(/\s+/g, " ").trim();

  const intlPhone = safeText.match(
    /(\+\d{1,3}[\s.\-]?\(?\d{1,4}\)?[\s.\-]?\d{3,5}[\s.\-]?\d{3,5})/
  )?.[1]?.replace(/\s+/g, " ").trim();

  const tenDigitPhone = safeText.match(/\b(\d{10,13})\b/)?.[1]?.trim();

  const formattedPhone = safeText.match(
    /\b(\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4})\b/
  )?.[1]?.trim();

  const phone = (labeledPhone || intlPhone || tenDigitPhone || formattedPhone || "").replace(/\s+/g, " ").trim();
  const linkedin =
    safeText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|]+/i)?.[0] || "";
  const portfolio =
    safeText.match(/https?:\/\/(?!www\.linkedin\.com)[^\s|]+/i)?.[0] || "";

  const name = headerLines.find((line) => looksLikeName(line)) || "";
  const nameIndex = lines.findIndex((line) => line === name);

  const targetTitle =
    headerLines.find(
      (line, index) => index !== nameIndex && looksLikeTitle(line) && !isContactOrLink(line)
    ) || "";

  const location =
    headerLines.find(
      (line) =>
        line !== name &&
        line !== targetTitle &&
        looksLikeLocation(line) &&
        !isContactOrLink(line)
    ) || "";

  const summarySection = findSection(safeText, SECTION_ALIASES.summary);
  const fallbackSummary = firstNonSectionParagraph(lines, Math.max(nameIndex, 0) + 1);
  const summary = summarySection || fallbackSummary;

  const skillsSection = findSection(safeText, SECTION_ALIASES.skills);
  const experienceSection = findSection(safeText, SECTION_ALIASES.experience);
  const projectsSection = findSection(safeText, SECTION_ALIASES.projects);
  const educationSection = findSection(safeText, SECTION_ALIASES.education);
  const certificationsSection = findSection(safeText, SECTION_ALIASES.certifications);

  const inferredSkills =
    skillsSection ||
    headerLines
      .filter((line) => /react|node|python|java|sql|aws|excel|javascript|typescript|figma|tableau|power bi/i.test(line))
      .join(", ");

  const parsed = {
    name,
    location,
    targetTitle,
    email,
    phone,
    linkedin,
    portfolio,
    skills: parseDelimitedList(inferredSkills).join(", "),
    education: educationSection,
    experience: experienceSection,
    projects: projectsSection,
    certifications: certificationsSection,
    job: summary
  };

  parsed.type = parsed.experience ? "Experienced" : "Fresher";

  return parsed;
};
