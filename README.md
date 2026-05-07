# ResumeAlignAI

AI-powered resume builder that helps job seekers create targeted, ATS-aware resumes from structured profile details, existing PDF resumes, and real job descriptions. The app includes dedicated fresher and experienced workflows, AI resume generation, ATS scoring, template previews, paid PDF/DOCX export, and Razorpay payment verification.

Last updated: May 7, 2026

## Product Features

### Landing Page

- Animated ResumeAlignAI landing page with benefits, ATS awareness, customer proof, pricing, contact details, and builder entry points.
- Separate calls to action for **Fresher Resume** and **Experienced Resume**.
- Launch offer messaging for resume export unlock at `Rs.69` instead of `Rs.299`.
- Communicates how the app moves users from details, to AI generation, to ATS review, to recruiter-ready export.

### Builder Workspaces

- `/builder` for experienced professionals.
- `/fresher-builder` for students, interns, and entry-level candidates.
- Mode-specific copy, validation, section priority, and AI payload rules.
- Focused builder page with upload, form intake, generation, ATS score, preview, editing, payment, and export in one workflow.

### Candidate Intake

- Captures name, email, phone, location, LinkedIn, portfolio/GitHub, target title, target company, industry, seniority, and job description.
- Experienced flow supports multiple roles with job title, company, duration, location/mode, employment type, responsibilities, and achievements.
- Fresher flow supports career objective, coursework/core concepts, achievements, activities, internships, training, and workshops.
- Shared sections support projects, education, skills, and certifications.
- Frontend validation requires core contact details, target role, job description, and at least one content source.

### PDF Resume Upload And Parsing

- Users can upload an existing resume as a PDF.
- Backend extracts resume text with `pdf-parse`.
- Parsed profile details can prefill empty form fields.
- Upload limit is `5 MB`.
- Only PDF files are accepted.

### AI Resume Generation

- Backend generates structured resume data from form inputs, uploaded resume text, and the target job description.
- Supports fresher and experienced resume logic through `resumeRulesMode`.
- AI output includes summary, skills, experience, projects, education, certifications, coursework, achievements, ATS strategy, and verification data.
- Generation is designed to improve resume content, not only reformat it.
- The AI service loads `frontend/resume-builder-rules-readme.md` at runtime and injects the product rulebook into generation and improvement prompts.
- Generation prompts apply career-stage rules automatically: freshers get objective/projects/education priority, while experienced candidates get summary/experience/impact priority.
- Uploaded resume text is treated as raw facts only, so weak wording or poor layout is not copied directly.
- AI responses are parsed as strict JSON, with support for fenced JSON and embedded JSON recovery.
- Resume output is normalized before returning to the frontend so arrays, bullets, contact fields, ATS strategy, and verification data stay consistent.

### Automatic ATS Refinement

- After generation, the backend runs ATS scoring and can refine the resume toward a `95%` target.
- Refinement uses missing keywords, job title context, and the job description.
- The app returns score guidance based on the resulting ATS match.
- Refinement can run multiple passes and stops if the new result does not improve the ATS score.
- Improvement prompts preserve the same resume schema while rewriting weak lines, adding truthful missing keywords, and maintaining fresher vs experienced section order.
- Resume verification metadata includes status, checked line count, notes, and line-level checks for clarity, truthfulness, grammar, and ATS fit.

### Live ATS Match Score

- ATS panel shows a score out of `100` with a visual score ring.
- Shows matched keyword count, score gap to `95%`, matched phrases, required terms, and checked items.
- Score breakdown includes keyword coverage, important term coverage, phrase coverage, section coverage, and polish score.
- Users can refresh ATS scoring after edits.
- ATS scoring is weighted across keyword coverage, important term coverage, exact phrase coverage, standard section coverage, and polish signals.
- ATS checks include job title/profile alignment, required keyword coverage, exact JD phrase coverage, required skills, mapped responsibilities, ATS-readable sections, impact bullets/metrics, and contact parse readiness.
- Role/profile phrase detection supports common tracks such as frontend, backend, full stack, data/business analyst, project/program manager, sales, marketing, and HR.
- Required terms include source labels such as job title/profile, required skills, responsibilities, profile keywords, and job description phrases.

### ATS Quick-Win Actions

- Missing role/JD terms are surfaced as quick wins.
- Users can add a missing term directly to skills.
- Users can request an AI sentence suggestion for a keyword.
- Suggested text can be added to summary, skills, or the first experience section.
- One-click **Enhance more to 95+ ATS** improves the generated resume through the backend.
- AI keyword suggestions are limited to the top missing terms to keep edits focused.
- Suggestions follow keyword safety rules and avoid inventing tools, credentials, companies, or metrics.
- Suggestions are section-aware: summary gets complete professional sentences, experience gets action-oriented bullets, and skills gets short skill phrases.

### AI Provider Reliability

- The backend can call Groq's OpenAI-compatible chat completions API using `GROQ_API_KEY`.
- Default Groq model is `llama-3.3-70b-versatile`, configurable through `GROQ_MODEL`.
- If Groq returns rate-limit or temporary gateway/service errors, the service falls back to Anthropic automatically.
- Anthropic fallback uses `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL`.
- Both providers are expected to return JSON objects for reliable resume rendering.

### Resume Preview And Templates

- Resume preview renders structured sections for contact, summary, skills, experience, projects, education, certifications, coursework, and achievements.
- Preview renders the resume frame without 3D tilt or scale transforms so text stays sharp while users review it.
- Resume preview defaults to an A4 sheet size (`794px x 1123px`) for more predictable export formatting.
- A hidden export sheet is used for cleaner PDF capture.
- PDF download captures the same selected template and A4 layout shown in preview.
- Template catalog includes 26 named templates:
  `Executive Slate`, `Teal Edge`, `Graphite Pro`, `Amber Frame`, `Indigo Column`, `Forest Grid`, `Burgundy Line`, `Ink Serif`, `Ocean Ribbon`, `Minimal Mint`, `Charcoal Band`, `Copper Block`, `Violet Brief`, `Pine Profile`, `Navy Classic`, `Mono Contrast`, `Recruiter Focus`, `Startup Clean`, `Product Leader`, `Data Sharp`, `Consultant White`, `Tech Matrix`, `Global CV`, `Creative Line`, `Academic Classic`, and `Operations Pro`.
- Templates use 7 layout families: sidebar-left, sidebar-right, single-column, banner, top-bar, minimal, and executive.
- Each template has its own accent color, surface color, and layout behavior.

### Post-Generation Editing

- Users can edit full name, headline, summary, skills, certifications, coursework, achievements, contact details, experience, projects, and education.
- Users can add or remove generated experience, project, and education entries.
- Edits update the preview immediately and can be re-scored through ATS refresh.

### Pre-Download Verification

- Before download, users see a verification modal.
- Checklist asks users to confirm name/contact accuracy, job titles, companies, dates, credentials, tools, project claims, and education details.
- ATS warnings remind users about keyword matching, standard headings, ATS-safe layouts, abbreviations, and score expectations.

### Payment Unlock

- Download is locked until payment.
- Backend creates Razorpay orders for `Rs.69` in INR.
- Backend verifies Razorpay signatures before unlocking download.
- Payment errors are surfaced in the UI.

### PDF And DOCX Export

- Paid users can choose PDF or DOCX download.
- PDF export uses `html2canvas` and `jsPDF`.
- DOCX export uses the `docx` package with ATS-readable sections and bullet lists.
- After download, the app opens the user's email client with a self-send reminder.

## Roadmap

The landing page currently communicates these upcoming or planned features:

- Multi-template resume themes for tech, business, and creative roles.
- Cover letter generation and concise outreach notes.
- Interview preparation suggestions from the generated resume.
- Saved resumes per job with version history.
- Shareable read-only recruiter review links.
- Server-side PDF export for more consistent rendering.
- One-click ATS improvements applied into selected resume sections.
- Account login, payment history, and download history.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Framer Motion, Lucide React, Axios |
| Export | html2canvas, jsPDF, docx |
| Backend | Node.js, Express, Multer, pdf-parse |
| AI | Groq API with Anthropic SDK fallback |
| Payment | Razorpay order creation and signature verification |
| Styling | CSS |

## Project Structure

```text
AIResumeBuilder/
|-- backend/
|   |-- controllers/       # Resume and payment logic
|   |-- routes/            # API endpoints
|   |-- services/          # AI integration
|   |-- utils/             # ATS scoring, parsing, resume text helpers
|   |-- server.js          # Express server
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- components/    # React UI components
|   |   |-- App.jsx        # Landing page and builder routing
|   |   |-- main.jsx       # React entry point
|   |   `-- styles.css     # Global styles
|   |-- resume-builder-rules-readme.md
|   |-- vite.config.js
|   `-- package.json
`-- README.md
```

## Setup

### Prerequisites

- Node.js `16+`
- npm
- Anthropic API key
- Razorpay account credentials

### Backend

Create `backend/.env`:

```env
# Primary AI provider
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

# Fallback AI provider
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-haiku-4-5

PORT=5000
CLIENT_ORIGIN=http://localhost:5173
APP_URL=http://localhost:5173

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Install and run:

```bash
cd backend
npm install
npm run dev
```

The backend runs at `http://localhost:5000`.

### Frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Install and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## API Endpoints

### Resume

- `POST /api/generate` - Generate and refine a resume.
- `POST /api/upload` - Upload and parse a PDF resume.
- `POST /api/ats` - Calculate ATS match score.
- `POST /api/suggest` - Generate keyword placement suggestions.
- `POST /api/improve` - Improve resume toward the ATS target.

### Payment

- `POST /api/payment/order` - Create a Razorpay order.
- `POST /api/payment/verify` - Verify Razorpay payment signature.

## Key Frontend Components

- `App.jsx` - Landing page, lightweight routing, and builder page shells.
- `Form.jsx` - Fresher/experienced intake forms, PDF upload, generation calls, and ATS improvement calls.
- `ATSScore.jsx` - ATS score ring, keyword gaps, checked items, quick-win actions, AI suggestions, and score refresh.
- `Preview.jsx` - Template preview, post-generation editor, verification modal, PDF/DOCX download, and email share trigger.
- `Payment.jsx` - Razorpay checkout and payment verification flow.
- `Loader.jsx` - Loading state UI.
- `resumeUtils.js` - Resume normalization, plain-text conversion, and template catalog.

## Key Backend Modules

- `server.js` - Express server setup.
- `routes/resumeRoutes.js` - Resume, ATS, suggestion, improvement, upload, and payment routes.
- `controllers/resumeController.js` - Resume generation, upload parsing, ATS scoring, keyword suggestions, and AI improvement.
- `controllers/paymentController.js` - Razorpay order creation and signature verification.
- `services/aiService.js` - Anthropic-powered resume generation and refinement.
- `utils/ats.js` - ATS score calculation and keyword analysis.
- `utils/resumeParser.js` - Structured data extraction from parsed resume text.
- `utils/resumeText.js` - Structured resume to plain-text conversion for ATS analysis.

## Notes

- The detailed product rulebook remains in `frontend/resume-builder-rules-readme.md`.
- Generated resume content must remain truthful and should not invent jobs, degrees, credentials, metrics, tools, or achievements.
- The default ATS target in the current product is `95%`.
