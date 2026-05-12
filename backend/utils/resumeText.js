export const structuredResumeToText = (resume = {}) => {
  const lines = [];
  const contact = [
    resume.contact?.phone,
    resume.contact?.email,
    resume.contact?.linkedin,
    resume.contact?.location,
    resume.contact?.portfolio
  ]
    .filter(Boolean)
    .join(" | ");

  if (resume.fullName) lines.push(resume.fullName);
  if (contact) lines.push(contact);
  if (resume.title) lines.push(resume.title);

  const isFresher = String(resume.candidateType || "").toLowerCase() === "fresher";
  const labels = {
    summary: isFresher ? "Career Objective" : "Professional Summary",
    skills: isFresher ? "Technical Skills" : "Key Skills",
    experience: isFresher ? "Internship / Training" : "Work Experience",
    projects: isFresher ? "Academic Projects" : "Projects"
  };

  if (resume.summary) lines.push(`${labels.summary}\n${resume.summary}`);
  if (resume.skills?.length) lines.push(`${labels.skills}\n${resume.skills.join(", ")}`);

  const addExperience = () => {
    if (!resume.experience?.length) return;
    lines.push(labels.experience);
    resume.experience.forEach((item) => {
      lines.push([item.role, item.company].filter(Boolean).join(" | "));
      if (item.duration || item.location) {
        lines.push([item.duration, item.location].filter(Boolean).join(" | "));
      }
      (item.bullets || []).forEach((bullet) => lines.push(`- ${bullet}`));
    });
  };

  const addProjects = () => {
    if (!resume.projects?.length) return;
    lines.push(labels.projects);
    resume.projects.forEach((item) => {
      lines.push([item.name, item.subtitle].filter(Boolean).join(" | "));
      (item.bullets || []).forEach((bullet) => lines.push(`- ${bullet}`));
    });
  };

  if (isFresher) {
    addProjects();
    addExperience();
  } else {
    addExperience();
    addProjects();
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

  if (resume.achievements?.length) {
    lines.push(`Achievements\n${resume.achievements.map((item) => `- ${item}`).join("\n")}`);
  }

  if (!isFresher && resume.languages?.length) {
    lines.push(`Languages\n${resume.languages.join(", ")}`);
  }

  // NOTE: keywords/atsStrategy metadata fields intentionally excluded from
  // scoring text — they are not rendered in the resume and would inflate the score.

  return lines.filter(Boolean).join("\n\n");
};
