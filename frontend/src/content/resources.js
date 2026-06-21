/* ─────────────────────────────────────────────
   resources.js — shared SEO content for /resources/*.

   Both the runtime React component (ResourcesPage.jsx) and the
   post-build SEO prerenderer (scripts/prerender.mjs) read from
   this module. One source of truth for what Google indexes and
   what users see.

   Each article is intentionally long-form (~800 words) and keyword-
   targeted. Update freely — both the static HTML and the React
   render will stay in sync because they read the same export.
   ───────────────────────────────────────────── */

export const RESOURCES = [
  {
    slug: "ats-resume-guide",
    title: "How to Beat the ATS in 2026 — A Realistic Resume Guide for Indian Job Seekers",
    description:
      "Most candidates are filtered out by Applicant Tracking Systems before a human ever opens their resume. This guide breaks down how ATS parsing actually works, the formatting traps that get you rejected, and the keyword strategy that gets you shortlisted in 2026.",
    keywords: "ATS resume, applicant tracking system, ATS friendly resume, beat ATS, resume keywords, ATS score, ATS resume India",
    publishedAt: "2026-06-21",
    body: `
      <h2>What an ATS actually does — and what it does not</h2>
      <p>An Applicant Tracking System is a piece of recruiting software your resume is read by <em>before</em> a recruiter ever sees it. Workday, Greenhouse, Lever, Naukri RMS, iCIMS, Taleo — different vendors, same job: parse your file into structured fields (name, email, phone, role, employer, dates, skills) and index it so recruiters can search by keyword later.</p>
      <p>Two myths worth killing immediately. First, the ATS does not "reject 75% of resumes automatically" — that statistic is largely fabricated for clickbait. What actually happens is your resume gets parsed badly, ends up unsearchable for the relevant keywords, and you are simply never surfaced when the recruiter searches. Same outcome, different mechanism.</p>
      <p>Second, the ATS does not run AI on your resume to decide if you are a "good candidate". It runs string matching, simple statistical scoring, and keyword density checks against the job description. Your job is to make sure that matching works in your favour.</p>

      <h2>The five formatting traps that get you parsed wrong</h2>
      <ol>
        <li><strong>Tables and multi-column layouts</strong> — most ATS parsers read left-to-right, top-to-bottom. A two-column sidebar resume gets read as one giant jumbled paragraph. Skills end up in the middle of your education section.</li>
        <li><strong>Header / footer regions</strong> — many parsers ignore content in PDF header and footer zones. Putting your phone number or email there means the recruiter cannot search for you by contact.</li>
        <li><strong>Custom fonts as images</strong> — if you export your resume with a fancy font baked into an image, the ATS reads nothing. Stick to standard fonts: Calibri, Arial, Helvetica, Times New Roman, Open Sans.</li>
        <li><strong>Section heading creativity</strong> — "Where I've Built Stuff" might feel personal but it confuses parsers. Use the literal labels: <em>Work Experience</em>, <em>Education</em>, <em>Key Skills</em>, <em>Technical Skills</em>, <em>Projects</em>, <em>Certifications</em>.</li>
        <li><strong>Acronyms-only writing</strong> — write "Search Engine Optimization (SEO)" the first time it appears. The ATS may be searching for the full phrase the recruiter typed.</li>
      </ol>

      <h2>The keyword strategy that actually works</h2>
      <p>Open the job description. Highlight every noun phrase that describes a skill, a tool, a methodology, or a deliverable. Now look at your resume. If a phrase is in the JD and not in your resume — and you actually have that skill — add it. Naturally. Inside a bullet that describes real work.</p>
      <p>Do not stuff. The recruiter who opens your resume after the ATS surfaces it is a human, and a wall of keywords looks ridiculous. The goal is parity: every JD skill you genuinely have should appear at least once, ideally in the context of a result you delivered.</p>

      <h2>What a 95%+ ATS-aligned resume looks like</h2>
      <ul>
        <li>Single column, standard headings, standard font.</li>
        <li>Contact details in the body, not the page header.</li>
        <li>Work experience listed in reverse chronological order with company, role, dates, location, and 3–5 measurable bullets per role.</li>
        <li>A short professional summary at the top with the target role spelled out exactly as in the JD.</li>
        <li>A skills block with each JD-relevant skill listed individually (not as paragraphs).</li>
        <li>PDF export, not Word — but a clean, text-based PDF, not a scanned image.</li>
      </ul>

      <h2>How ResumeAlignAI fits in</h2>
      <p>Our builder runs an ATS scoring pass against your generated resume and the job description you paste. It surfaces the exact missing keywords with one-click placement, runs an additional improvement pass toward 95%, and exports a clean text PDF that every major ATS parses correctly. <a href="/builder">Try the builder for Rs.51</a> if you want a working version in five minutes — or read on for our other resource articles.</p>

      <p><a href="/resources">← Back to all resources</a></p>
    `
  },
  {
    slug: "software-engineer-resume-template",
    title: "Software Engineer Resume — Template, Examples, and Bullet Points That Actually Land Interviews",
    description:
      "Most software engineer resumes read like job descriptions copied from JIRA. Here is the structure, the bullet formula, and the specific examples that get you to a recruiter call in 2026.",
    keywords: "software engineer resume, software developer resume template, programmer resume, SDE resume, resume for software engineer India, software engineer resume example",
    publishedAt: "2026-06-21",
    body: `
      <h2>The structure recruiters scan for</h2>
      <p>Software engineering recruiters spend an average of six to eight seconds on a first-pass resume scan. They look for four things in this order: <em>your most recent role and company</em>, <em>your dominant tech stack</em>, <em>any recognisable product names you have shipped</em>, and <em>whether your impact is quantified</em>. If any of those four are buried, you get put in the "maybe pile" — and the maybe pile rarely gets called.</p>

      <h2>The recommended single-column structure</h2>
      <ol>
        <li><strong>Header</strong> — name, target role, phone, email, LinkedIn, GitHub. One line. Three at most.</li>
        <li><strong>Professional summary</strong> — three lines. Years of experience, dominant stack, headline impact. Example: <em>"Backend engineer with 5 years on high-throughput Python and Go services. Shipped real-time pricing for a fintech serving 12M users. Owned cost-aware refactors that cut AWS spend 38%."</em></li>
        <li><strong>Key skills</strong> — chips, not paragraphs. Languages, frameworks, databases, cloud, tooling. Match the JD list, drop nothing important.</li>
        <li><strong>Work experience</strong> — reverse chronological. For each role: company, role, dates, location, then 3–5 result-led bullets.</li>
        <li><strong>Projects</strong> — only if relevant or impressive. Recent grads should expand this; senior engineers can drop it.</li>
        <li><strong>Education</strong> — degree, institution, dates. Add CGPA only if &gt;8.5 or if you are within 2 years of graduation.</li>
        <li><strong>Certifications / Achievements</strong> — AWS, GCP, CKAD, HackerRank ranks, open-source contributions, conference talks.</li>
      </ol>

      <h2>The bullet formula that converts</h2>
      <p>Most engineering resumes read like job descriptions: "Responsible for backend services on AWS using Python and PostgreSQL." That tells the recruiter what your title was, not what you achieved. Use this formula instead:</p>
      <p><strong>Action verb + specific scope + measurable outcome + tools/context</strong>.</p>
      <p>Examples that follow the formula:</p>
      <ul>
        <li>Reduced p99 checkout latency from 1.4s to 280ms by rewriting the order pipeline as an event-sourced FastAPI + Redis system, unblocking a Diwali sale that processed 4× normal traffic without a single 5xx.</li>
        <li>Migrated 14 microservices from EC2 to ECS Fargate, cutting infra cost by Rs.18 lakh annually while reducing deploy time from 14 minutes to 90 seconds.</li>
        <li>Built a Postgres logical-replication-based zero-downtime migration tool used in 6 production cutovers across the company; saved an estimated 40 engineering hours per migration.</li>
        <li>Open-sourced a CLI for inspecting Kafka consumer-group lag (1.2k GitHub stars, used by 3 listed Indian fintechs in production).</li>
      </ul>

      <h2>What to drop ruthlessly</h2>
      <ul>
        <li>Objective statements (the summary replaces them).</li>
        <li>Soft-skill paragraphs ("good team player").</li>
        <li>Listing every language you have ever touched — pick the 8 that match the JD.</li>
        <li>Photo, marital status, nationality (DPDP guidance and global norm both agree).</li>
        <li>Two-page resumes for engineers under 8 years of experience — one focused page wins.</li>
      </ul>

      <h2>Tailoring per JD, fast</h2>
      <p>You should never send the exact same resume to two different job postings. The bullets stay; the order changes, the summary line changes, and the key-skills row reshuffles to match the JD's vocabulary. <a href="/builder">ResumeAlignAI does this in 60 seconds per JD</a> — paste the JD, regenerate, download. Rs.51 per resume or Rs.199 for the 7-day Weekly Pass if you are applying to 5+ roles.</p>

      <p><a href="/resources">← Back to all resources</a></p>
    `
  },
  {
    slug: "fresher-resume-tips",
    title: "Fresher Resume Tips for 2026 — How to Get Shortlisted Without Years of Experience",
    description:
      "You don't have years of work experience, and that is fine. Recruiters know freshers come from college. What they care about is whether you can show learning velocity, real projects, and a clear target role. Here is the playbook.",
    keywords: "fresher resume, resume for freshers, fresher resume format, fresher resume tips, first job resume, B.Tech resume, MBA fresher resume India",
    publishedAt: "2026-06-21",
    body: `
      <h2>What recruiters look at on a fresher resume</h2>
      <p>The fresher resume problem is misunderstood. Recruiters reviewing a campus pile are not comparing your years of experience against laterals — they are comparing freshers <em>against other freshers</em>. The differentiator is rarely your CGPA. It is the quality and specificity of what you have built outside the syllabus.</p>
      <p>The four signals a fresher resume must surface:</p>
      <ol>
        <li>A clear target role (not "looking for opportunities" — write <em>"Frontend Engineer"</em> or <em>"Data Analyst"</em>).</li>
        <li>At least two real projects with measurable depth, not just course assignments.</li>
        <li>A handful of internships, training, or self-study programs that map to the target role.</li>
        <li>Specific tools and frameworks listed — not "MS Office" but the actual stack you have used.</li>
      </ol>

      <h2>The fresher resume structure that works</h2>
      <ol>
        <li><strong>Header</strong> — name, target role, phone, email, LinkedIn, GitHub or portfolio URL.</li>
        <li><strong>Career objective</strong> — two lines. State the role you are targeting and the value you bring. Example: <em>"Final-year B.Tech (CSE) targeting frontend engineering roles. Built three production-ready React projects (combined ~9k users) and rank top 2% on LeetCode."</em></li>
        <li><strong>Technical skills</strong> — categorised. <em>Languages</em>, <em>Frameworks &amp; Libraries</em>, <em>Tools</em>, <em>Databases</em>. Be specific; "HTML, CSS, JavaScript, React, Node.js, MongoDB, Git" is fine.</li>
        <li><strong>Academic projects</strong> — your most valuable section. Two to three projects, each with name, one-line subtitle, then 3 bullets describing what you built and what was measurable. Include GitHub links.</li>
        <li><strong>Internships / training</strong> — even 6-week summer trainings count if you list what you actually did.</li>
        <li><strong>Education</strong> — degree, institution, expected/completion year, CGPA if &gt;8.</li>
        <li><strong>Certifications</strong> — relevant ones only. AWS Cloud Practitioner, NPTEL specialisation, Coursera tracks from recognised universities.</li>
        <li><strong>Achievements</strong> — competitive coding ranks, hackathon prizes, paper publications, scholarships.</li>
      </ol>

      <h2>Writing project bullets like a working engineer</h2>
      <p>This is the single biggest difference between a fresher resume that lands interviews and one that does not. Compare:</p>
      <p><em>Weak:</em> "Made an e-commerce website for college project."</p>
      <p><em>Strong:</em> "Built a multi-vendor e-commerce app in React + Express + MongoDB with JWT auth, Razorpay integration, and seller dashboards; deployed on Render and used by 4 student-run businesses on campus."</p>
      <p>Same project, completely different signal. Specifics, scope, technologies, real users — all in one line.</p>

      <h2>What to leave off</h2>
      <ul>
        <li>School (10th and 12th) details — degree is enough unless the recruiter asks.</li>
        <li>Hobbies and interests sections that say "reading, music, travel".</li>
        <li>References — "available on request" is implied.</li>
        <li>Photos, religion, marital status — leave them out.</li>
        <li>The phrase "responsible for" — replace with action verbs (built, designed, implemented, launched, optimised).</li>
      </ul>

      <h2>How long should a fresher resume be?</h2>
      <p>One page. Never two. If you are spilling onto a second page, the bullets are too verbose. Tighten.</p>

      <h2>Build yours in five minutes</h2>
      <p>Our <a href="/fresher-builder">fresher resume builder</a> is purpose-built for this — separate fields for academic projects, training, and certifications, with the AI tuned to write fresher-appropriate bullets that do not over-claim. Rs.51 per resume download.</p>

      <p><a href="/resources">← Back to all resources</a></p>
    `
  },
  {
    slug: "resume-keywords-by-role",
    title: "Resume Keywords by Role — A Cheatsheet for the Most Common Tech and Business Profiles",
    description:
      "Keywords are not magic — they are the vocabulary the recruiter searches for. This cheatsheet lists the most-searched terms by role: backend, frontend, full-stack, data analyst, data scientist, product manager, devops, QA, and more.",
    keywords: "resume keywords, ATS keywords, resume keywords by role, backend developer keywords, data analyst resume keywords, product manager resume keywords",
    publishedAt: "2026-06-21",
    body: `
      <h2>How recruiter search actually works</h2>
      <p>When a recruiter has a role to fill, they go into their ATS and type boolean searches: <code>("React" OR "Next.js") AND ("TypeScript") AND ("Bangalore" OR "Bengaluru")</code>. Every resume that matches gets surfaced; everything else stays buried. If your resume does not use the exact terms in the recruiter's search, you do not exist.</p>
      <p>This cheatsheet is the vocabulary list for the most common roles. Use it as a checklist — if a relevant term applies to you and is missing from your resume, add it. If a term does not honestly apply, do not add it.</p>

      <h2>Backend / API Engineer</h2>
      <p><strong>Languages:</strong> Python, Go, Java, Kotlin, Node.js, TypeScript, C#, Rust.<br/>
      <strong>Frameworks:</strong> FastAPI, Django, Flask, Spring Boot, Express, NestJS, Gin, Echo.<br/>
      <strong>Databases:</strong> PostgreSQL, MySQL, MongoDB, Redis, DynamoDB, Elasticsearch, ClickHouse.<br/>
      <strong>Infrastructure:</strong> Docker, Kubernetes, AWS (EC2, ECS, Lambda, S3, RDS), GCP, Terraform, Helm.<br/>
      <strong>Concepts:</strong> REST, GraphQL, gRPC, event-driven architecture, Kafka, RabbitMQ, OAuth2, JWT.</p>

      <h2>Frontend Engineer</h2>
      <p><strong>Core:</strong> JavaScript, TypeScript, React, Next.js, Vue, Nuxt, Svelte, SvelteKit.<br/>
      <strong>Styling:</strong> Tailwind CSS, CSS Modules, styled-components, Emotion, SCSS.<br/>
      <strong>State / data:</strong> Redux Toolkit, Zustand, TanStack Query, SWR, GraphQL, Apollo, Relay.<br/>
      <strong>Tooling:</strong> Vite, Webpack, esbuild, Storybook, Playwright, Cypress, Vitest, Jest.<br/>
      <strong>Concepts:</strong> server components, hydration, accessibility (WCAG), Core Web Vitals, SSR, ISR.</p>

      <h2>Full-stack Engineer</h2>
      <p>Combine the backend and frontend lists. Add at least one full-stack framework: Next.js, Remix, T3 stack, Rails, Laravel, Django + React.</p>

      <h2>Data Analyst</h2>
      <p><strong>SQL:</strong> PostgreSQL, MySQL, BigQuery, Snowflake, Redshift, ClickHouse.<br/>
      <strong>Languages:</strong> Python (pandas, NumPy), R.<br/>
      <strong>BI tools:</strong> Tableau, Power BI, Looker, Metabase, Apache Superset.<br/>
      <strong>Concepts:</strong> ETL/ELT, dimensional modelling, cohort analysis, A/B testing, statistical significance, dashboards, KPIs.</p>

      <h2>Data Scientist / ML Engineer</h2>
      <p><strong>Core:</strong> Python, scikit-learn, PyTorch, TensorFlow, JAX, pandas, NumPy.<br/>
      <strong>LLM stack:</strong> LangChain, LlamaIndex, OpenAI API, Anthropic API, vector databases (Pinecone, Weaviate, Qdrant), RAG, embeddings.<br/>
      <strong>MLOps:</strong> MLflow, Kubeflow, Weights &amp; Biases, SageMaker, Vertex AI.<br/>
      <strong>Concepts:</strong> feature engineering, model evaluation, A/B testing, drift detection, supervised, unsupervised, reinforcement learning.</p>

      <h2>Product Manager</h2>
      <p><strong>Frameworks:</strong> Jobs-to-be-Done, RICE, ICE, OKRs, North Star metric.<br/>
      <strong>Tools:</strong> Jira, Confluence, Linear, Figma, FigJam, Notion, Amplitude, Mixpanel, GA4.<br/>
      <strong>Concepts:</strong> product discovery, user research, hypothesis testing, roadmap planning, stakeholder management, GTM strategy, P&amp;L ownership.</p>

      <h2>DevOps / SRE</h2>
      <p><strong>Cloud:</strong> AWS, GCP, Azure.<br/>
      <strong>Containers / Orchestration:</strong> Docker, Kubernetes, Helm, ArgoCD, Flux.<br/>
      <strong>IaC:</strong> Terraform, Pulumi, CloudFormation, Ansible.<br/>
      <strong>Observability:</strong> Prometheus, Grafana, Loki, Datadog, New Relic, Sentry, OpenTelemetry.<br/>
      <strong>Concepts:</strong> SLO/SLI, incident response, blameless postmortems, chaos engineering, GitOps, blue-green and canary deployments.</p>

      <h2>QA / Test Engineer</h2>
      <p><strong>Frameworks:</strong> Selenium, Playwright, Cypress, Appium, TestNG, JUnit, PyTest, RestAssured.<br/>
      <strong>Concepts:</strong> test pyramid, BDD (Cucumber/Gherkin), API testing, performance testing (JMeter, k6), security testing (OWASP Top 10), test data management.</p>

      <h2>Use this with the builder</h2>
      <p>Paste the JD into <a href="/builder">our builder</a>. It compares the JD against your input and tells you which of these keywords are missing — then writes bullets that include them naturally. No keyword stuffing.</p>

      <p><a href="/resources">← Back to all resources</a></p>
    `
  },
  {
    slug: "cover-letter-vs-resume",
    title: "Cover Letter vs Resume — When You Still Need Both, and What Each Should Say",
    description:
      "Are cover letters dead? Not yet. Here is when they still matter, what to write in one, and how it should differ from your resume — so neither feels redundant.",
    keywords: "cover letter, cover letter vs resume, do I need a cover letter, cover letter India, when to send cover letter, cover letter examples",
    publishedAt: "2026-06-21",
    body: `
      <h2>The short answer</h2>
      <p>Your <strong>resume</strong> tells the recruiter <em>what</em> you have done — companies, roles, tools, outcomes. Your <strong>cover letter</strong> tells the recruiter <em>why this specific job and you</em> — the connecting story that a list of bullets cannot deliver.</p>
      <p>If you are applying through an ATS form that does not have a cover letter field, do not force one. If it has the field, fill it. If you are emailing a hiring manager directly, the cover letter is the email body itself.</p>

      <h2>When the cover letter genuinely matters</h2>
      <ul>
        <li>Direct email applications to hiring managers (always — the email is the cover letter).</li>
        <li>Career switches — you need to explain the bridge between past and target role.</li>
        <li>Senior or specialist roles where the JD asks for niche experience.</li>
        <li>Internal applications where you want to address why you are leaving your current team.</li>
        <li>Government, academic, NGO, and many consulting roles (formally expected).</li>
      </ul>

      <h2>When you can skip it</h2>
      <ul>
        <li>Generic tech postings on Naukri/LinkedIn/Indeed where the ATS form has no cover letter field.</li>
        <li>Application forms that say "optional" — only skip if your time is better spent tailoring your resume to that JD.</li>
        <li>Roles that require coding tests or take-home assignments — your project quality matters more.</li>
      </ul>

      <h2>What a good cover letter contains</h2>
      <ol>
        <li><strong>The hook (1 line)</strong> — why this company, specifically. Show you read the website, not just the job posting.</li>
        <li><strong>The bridge (2–3 lines)</strong> — connect one or two of your actual achievements to a problem the company is solving.</li>
        <li><strong>The fit (2 lines)</strong> — what makes you uniquely qualified compared to a generic applicant.</li>
        <li><strong>The close (1 line)</strong> — concrete next step, not "looking forward to hearing".</li>
      </ol>
      <p>That is the entire structure. Under 200 words. Cover letters that run a full A4 page get skimmed and skipped.</p>

      <h2>What never to write in a cover letter</h2>
      <ul>
        <li>"To Whom It May Concern" — find the hiring manager's name on LinkedIn.</li>
        <li>"I am writing to apply for the X position" — the recruiter knows what you are doing.</li>
        <li>Your entire resume rewritten in paragraph form.</li>
        <li>Salary expectations (unless the application explicitly asks).</li>
        <li>"I am a hardworking team player with strong communication skills." Every cover letter says this. Cut it.</li>
      </ul>

      <h2>A worked example</h2>
      <p><em>Subject: Backend Engineer application — Priya Sharma (8 years, fintech)</em></p>
      <p>Hi Anjali,</p>
      <p>I saw your Series B announcement and the engineering blog post on rebuilding the ledger service in Go. The article mentioned ordering-guarantee bugs around month-end settlement — I shipped a fix for exactly this pattern at my current company two quarters ago using a Kafka idempotent-consumer pattern that cut duplicate settlements 100% over six months.</p>
      <p>My current role at PaySprint is backend lead for the settlements team (Rs.4,200 cr quarterly volume). I ran our Go migration and own our incident response. Both feel directly relevant to what you described in the job posting.</p>
      <p>If a 20-minute call this week makes sense, I am free Wed/Thu afternoon IST. My resume is attached and my GitHub is at priya-sh.dev.</p>
      <p>Thanks for your time,<br/>Priya</p>

      <h2>Use the builder for the resume, write the cover letter yourself</h2>
      <p>We have not (yet) built a cover letter generator — and we would rather you write the cover letter in your own words while the AI handles the keyword-heavy ATS resume work. <a href="/builder">Build the resume for Rs.51</a>, then write a 200-word cover letter from the template above.</p>

      <p><a href="/resources">← Back to all resources</a></p>
    `
  }
];

export const RESOURCES_BY_SLUG = Object.fromEntries(RESOURCES.map((r) => [r.slug, r]));

export const RESOURCES_INDEX = {
  title: "Resources — Free Resume and Job Search Guides | ResumeAlignAI",
  description:
    "Free, in-depth guides on beating the ATS, writing software engineer resumes, fresher resume tips, role-specific keyword cheatsheets, and cover letter strategy. Published by ResumeAlignAI.",
  body: `
    <h2>Free guides to help you land the next role</h2>
    <p>We built ResumeAlignAI because most resume advice on the internet is generic and most paid resume services are overpriced. These guides are our long-form attempt to share what we have learned reading thousands of resumes — and what we wish every Indian job seeker knew before hitting "apply".</p>
    <ul>
      ${RESOURCES.map((r) => `
        <li>
          <a href="/resources/${r.slug}"><strong>${r.title}</strong></a>
          <p>${r.description}</p>
        </li>
      `).join("")}
    </ul>
    <p>All free. No email signup required. <a href="/builder">Try the builder for Rs.51</a> when you want a working AI-tailored resume in under five minutes.</p>
  `
};
