export const structuredResumeToText = (resume = {}) => {
  const lines = [];
  const contact = [
    resume.contact?.email,
    resume.contact?.phone,
    resume.contact?.location,
    resume.contact?.linkedin,
    resume.contact?.portfolio
  ]
    .filter(Boolean)
    .join(" | ");

  if (resume.fullName) lines.push(resume.fullName);
  if (resume.title) lines.push(resume.title);
  if (contact) lines.push(contact);
  if (resume.summary) lines.push(`Summary\n${resume.summary}`);
  if (resume.skills?.length) lines.push(`Skills\n${resume.skills.join(", ")}`);

  if (resume.experience?.length) {
    lines.push("Experience");
    resume.experience.forEach((item) => {
      lines.push([item.role, item.company].filter(Boolean).join(" | "));
      if (item.duration || item.location) {
        lines.push([item.duration, item.location].filter(Boolean).join(" | "));
      }
      (item.bullets || []).forEach((bullet) => lines.push(`- ${bullet}`));
    });
  }

  if (resume.projects?.length) {
    lines.push("Projects");
    resume.projects.forEach((item) => {
      lines.push([item.name, item.subtitle].filter(Boolean).join(" | "));
      (item.bullets || []).forEach((bullet) => lines.push(`- ${bullet}`));
    });
  }

  if (resume.education?.length) {
    lines.push("Education");
    resume.education.forEach((item) => {
      lines.push([item.degree, item.institution].filter(Boolean).join(" | "));
      if (item.duration || item.details) {
        lines.push([item.duration, item.details].filter(Boolean).join(" | "));
      }
    });
  }

  if (resume.certifications?.length) {
    lines.push(`Certifications\n${resume.certifications.join(", ")}`);
  }

  if (resume.coursework?.length) {
    lines.push(`Relevant Coursework\n${resume.coursework.join(", ")}`);
  }

  if (resume.achievements?.length) {
    lines.push(`Achievements\n${resume.achievements.map((item) => `- ${item}`).join("\n")}`);
  }

  if (resume.keywords?.length) {
    lines.push(`Keywords\n${resume.keywords.join(", ")}`);
  }

  if (resume.atsStrategy?.targetPhrases?.length) {
    lines.push(`Target Phrases\n${resume.atsStrategy.targetPhrases.join(", ")}`);
  }

  if (resume.atsStrategy?.rolePhrases?.length) {
    lines.push(`Role Phrases\n${resume.atsStrategy.rolePhrases.join(", ")}`);
  }

  return lines.filter(Boolean).join("\n\n");
};
