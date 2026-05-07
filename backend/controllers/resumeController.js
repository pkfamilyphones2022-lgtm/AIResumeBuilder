import pdfParse from "pdf-parse";
import { generateAIResume, improveAIResume, generateKeywordSuggestions } from "../services/aiService.js";
import { calculateATS } from "../utils/ats.js";
import { parseResumeDetails } from "../utils/resumeParser.js";
import { structuredResumeToText } from "../utils/resumeText.js";

const atsGuidance = (score) =>
  score >= 95
    ? "Excellent ATS alignment. This resume is strongly matched to the target role and ready for final human review."
    : score >= 85
    ? "Strong ATS score. Use Enhance more to push closer to the 95% target before applying."
    : "This resume has been improved, but Enhance more can add missing role phrases and close ATS gaps.";

const refineTowardTarget = async ({ result, userData, jobDescription, targetScore = 95, maxPasses = 2 }) => {
  let current = result;
  let ats = calculateATS(structuredResumeToText(current), jobDescription, {
    jobTitle: userData?.targetTitle || current?.title || ""
  });

  for (let pass = 0; pass < maxPasses && ats.score < targetScore; pass += 1) {
    const refined = await improveAIResume({
      resumeData: current,
      userData,
      jobDescription,
      missingKeywords: ats.missing.slice(0, 16),
      currentScore: ats.score
    });
    const refinedAts = calculateATS(structuredResumeToText(refined), jobDescription, {
      jobTitle: userData?.targetTitle || refined?.title || current?.title || ""
    });

    if (refinedAts.score < ats.score) break;
    current = refined;
    ats = refinedAts;
  }

  return { result: current, ats };
};

export const generateResume = async (req, res) => {
  try {
    const { userData, jobDescription, resumeText } = req.body;

    const hasResumeSource = Boolean(resumeText?.trim());
    const hasManualDetail = Boolean(
      userData?.skills || userData?.experience || userData?.projects || userData?.education
    );

    if (!userData?.name || (!hasResumeSource && !hasManualDetail)) {
      return res.status(400).json({
        error: "Add your name and either upload a resume or fill in your career details."
      });
    }

    const generated = await generateAIResume(userData, jobDescription, resumeText);
    const { result, ats } = await refineTowardTarget({
      result: generated,
      userData,
      jobDescription,
      targetScore: 95,
      maxPasses: 2
    });
    const guidance = atsGuidance(ats.score);

    return res.json({ result, ats: { ...ats, guidance } });
  } catch (err) {
    console.error("[generateResume]", err.message);
    return res.status(500).json({ error: "Resume generation failed. Please try again." });
  }
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: "Please upload a PDF resume." });
    }

    const data = await pdfParse(req.file.buffer);
    const text = data.text.trim();
    const parsedData = parseResumeDetails(text);
    return res.json({ text, parsedData });
  } catch (_err) {
    return res.status(400).json({ error: "Unable to parse this PDF resume." });
  }
};

export const atsScore = (req, res) => {
  const { resumeText, jobDescription, jobTitle } = req.body;

  if (!resumeText || !jobDescription) {
    return res.status(400).json({
      error: "Resume text and job description are required."
    });
  }

  const result = calculateATS(resumeText, jobDescription, { jobTitle });
  return res.json(result);
};

export const suggestKeywords = async (req, res) => {
  try {
    const { keywords, jobDescription, resumeData } = req.body;
    if (!keywords?.length || !jobDescription) {
      return res.status(400).json({ error: "Keywords and job description are required." });
    }
    const suggestions = await generateKeywordSuggestions(keywords, jobDescription, resumeData || {});
    return res.json({ suggestions });
  } catch (err) {
    console.error("[suggestKeywords]", err.message);
    return res.status(500).json({ error: "Keyword suggestions failed. Please try again." });
  }
};

export const improveResume = async (req, res) => {
  try {
    const { resumeData, userData, jobDescription, missingKeywords, currentScore } = req.body;
    if (!resumeData || !jobDescription) {
      return res.status(400).json({ error: "Resume data and job description are required." });
    }
    const firstPass = await improveAIResume({
      resumeData,
      userData: userData || {},
      jobDescription,
      missingKeywords: missingKeywords || [],
      currentScore: currentScore || 0
    });
    const { result: refined, ats } = await refineTowardTarget({
      result: firstPass,
      userData: userData || {},
      jobDescription,
      targetScore: 95,
      maxPasses: 2
    });

    return res.json({ result: refined, ats: { ...ats, guidance: atsGuidance(ats.score) } });
  } catch (err) {
    console.error("[improveResume]", err.message);
    return res.status(500).json({ error: "Resume improvement failed. Please try again." });
  }
};
