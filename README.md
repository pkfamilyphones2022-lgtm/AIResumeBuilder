# ResumeAlignAI

ResumeAlignAI is an AI resume builder for fresher and experienced candidates. It creates ATS-aware resumes from structured form data, existing PDF resumes, and job descriptions, then supports protected preview, editing, scoring, payment unlock, one-time download, email delivery, and an admin dashboard for business tracking.

Last updated: May 11, 2026

## Features

- Separate resume flows for experienced candidates and freshers.
- AI resume generation with DeepSeek as the primary provider, plus Groq and Anthropic fallback support.
- ATS scoring, keyword gaps, quick wins, AI keyword suggestions, and resume improvement.
- PDF resume upload and parsing with a 5 MB upload limit.
- 28 resume templates, including the premium `Aurora Luxe` template.
- Sample resumes for QA Manual, HR, Accountant, Customer/Core Service, and Test Automation Engineer roles for both fresher and experienced sections.
- Market-style resume sections enforced by candidate type.
- Resume preview protection with disabled text selection, copy, right click, drag, and print shortcut.
- Diagonal preview watermark and footer watermark. Exported PDF/DOCX files stay clean.
- Centered payment/download/email modals using React portals so users do not miss the next action after payment.
- Razorpay payment unlock at Rs.69.
- One successful payment token supports one tracked download. A customer can create a new payment again with the same email.
- PDF and DOCX export.
- Optional email delivery of both PDF and DOCX resume files after payment.
- SMTP payment confirmation email.
- SQLite storage for users, resumes, payments, emails, downloads, and AI token usage.
- Admin dashboard with day-wise revenue, payment status, resumes created, downloads, email status, AI cost, gross profit, model usage, and support resend actions.
- Server-signed generation challenge and hidden honeypot field to reduce automated abuse before AI tokens are spent.

## Resume Structures

Experienced candidates:

```text
Name
Phone | Email | LinkedIn | Location

Professional Summary
Key Skills
Work Experience
Projects
Education
Certifications
Achievements
Languages
```

Freshers:

```text
Name
Phone | Email | LinkedIn | Location

Career Objective
Technical Skills
Academic Projects
Internship / Training
Education
Certifications
Achievements
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Framer Motion, Lucide React, Axios |
| Export | html2canvas, jsPDF, docx |
| Backend | Node.js, Express, Helmet, CORS, Express Rate Limit, Multer |
| Database | SQLite with better-sqlite3 |
| AI | DeepSeek, Groq, Anthropic |
| Payments | Razorpay |
| Email | Nodemailer SMTP |

## Project Structure

```text
AIResumeBuilder/
|-- backend/
|   |-- controllers/       # Resume, ATS, payment, email, and admin logic
|   |-- db/                # SQLite setup and query helpers
|   |-- routes/            # API routes
|   |-- services/          # AI and email services
|   |-- utils/             # ATS, challenge, resume parsing, text conversion
|   |-- server.js
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- components/    # App UI, builder, preview, payment, samples, admin
|   |   |-- utils/         # Frontend helpers
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- styles.css
|   |-- .env.example
|   |-- .env.production
|   |-- vite.config.js
|   `-- package.json
`-- README.md
```

## Local Setup

### Prerequisites

- Node.js 18 or newer.
- npm.
- Razorpay test or live account credentials.
- At least one AI provider key. DeepSeek is recommended as the primary provider.
- SMTP credentials for production email. For Gmail, use an App Password.

### Backend

Create `backend/.env` from `backend/.env.example`.

Local development example:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-chat

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-haiku-4-5

AI_COST_USD_TO_INR=94.3
AI_COST_DEEPSEEK_CACHE_HIT_PAISE_PER_1M=264
AI_COST_DEEPSEEK_CACHE_MISS_PAISE_PER_1M=1320
AI_COST_DEEPSEEK_INPUT_PAISE_PER_1M=1320
AI_COST_DEEPSEEK_OUTPUT_PAISE_PER_1M=2640
AI_COST_GROQ_INPUT_PAISE_PER_1M=5564
AI_COST_GROQ_OUTPUT_PAISE_PER_1M=7450
AI_COST_ANTHROPIC_INPUT_PAISE_PER_1M=9430
AI_COST_ANTHROPIC_OUTPUT_PAISE_PER_1M=47150

PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
APP_URL=http://localhost:5173

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

ACCESS_TOKEN_SECRET=generate-a-strong-random-secret
ADMIN_ACCESS_TOKEN=generate-a-different-strong-admin-token
DATABASE_PATH=./database.sqlite

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=ResumeAlignAI <your_gmail@gmail.com>
```

Install and run:

```bash
cd backend
npm install
npm run dev
```

Backend health check:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{"ok":true}
```

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

```env
VITE_API_URL=http://localhost:5000/api
```

Install and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Secret Generation

Generate `ACCESS_TOKEN_SECRET` and `ADMIN_ACCESS_TOKEN` separately. Do not reuse the same value.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run the command twice:

- Save the first value as `ACCESS_TOKEN_SECRET` in `backend/.env`.
- Save the second value as `ADMIN_ACCESS_TOKEN` in `backend/.env`.

`ACCESS_TOKEN_SECRET` signs paid download access tokens. `ADMIN_ACCESS_TOKEN` protects `/admin` and `/api/admin/*`.

Never commit `backend/.env`, `frontend/.env`, real API keys, Razorpay secrets, email passwords, or generated tokens.

## API Endpoints

### Resume And ATS

- `GET /api/challenge` - Create a signed security challenge required before resume generation.
- `POST /api/generate` - Generate and refine a resume.
- `POST /api/upload` - Upload and parse a PDF resume.
- `POST /api/ats` - Calculate ATS score.
- `POST /api/suggest` - Suggest keyword placement.
- `POST /api/improve` - Improve resume toward the ATS target.

### Payment, Download, And Email

- `POST /api/payment/order` - Create a Razorpay order.
- `POST /api/payment/verify` - Verify Razorpay signature and issue a paid access token.
- `POST /api/payment/check` - Validate an existing download access token.
- `POST /api/payment/download` - Record a verified resume download and consume the token on the frontend.
- `POST /api/payment/email-attachments` - Email generated PDF and DOCX attachments after payment.

### Admin

- `GET /api/admin/overview` - Get dashboard summary, day-wise stats, recent customer sessions, AI usage, and pricing.
- `POST /api/admin/resumes/:resumeId/send` - Send the stored generated resume to a paid customer from support/admin flow.

Admin routes require this header:

```text
x-admin-token: your_ADMIN_ACCESS_TOKEN
```

The admin API must reject missing or wrong tokens with `401`.

## Database

The backend uses SQLite through `better-sqlite3`. Tables are created automatically on backend startup.

Tables:

- `users`
- `resumes`
- `payments`
- `emails`
- `downloads`
- `ai_usage`

For production, `DATABASE_PATH` must point to persistent storage. Do not deploy SQLite on an ephemeral filesystem unless losing customer, payment, download, and admin history is acceptable.

## Admin Dashboard

Open:

```text
http://localhost:5173/admin
```

In production, open:

```text
https://your-frontend-domain.com/admin
```

Enter `ADMIN_ACCESS_TOKEN`.

The dashboard shows:

- Total resumes created.
- Successful, pending, and failed payments.
- Day-wise payment status.
- Revenue from successful payments.
- Estimated AI cost.
- Estimated gross profit.
- Total downloads.
- Paid sessions where no download was recorded.
- Email sent and failed counts.
- Recent customer sessions.
- Payment status per session.
- Download and email status per session.
- Support action to resend a paid customer's generated resume.
- Token usage by provider/model.
- AI pricing rates currently used by the server.

AI cost is calculated from provider token usage when available. If a provider does not return token usage, the backend uses a rough local estimate. Older resumes created before AI usage logging was added will show zero AI cost.

## AI Cost Configuration

Costs are stored as paise per 1 million tokens so the dashboard can show estimated rupee cost and profit.

Current configured defaults:

| Provider | Input / Cache Miss | Output | Cache Hit |
| --- | ---: | ---: | ---: |
| DeepSeek | 1320 paise / 1M | 2640 paise / 1M | 264 paise / 1M |
| Groq | 5564 paise / 1M | 7450 paise / 1M | n/a |
| Anthropic | 9430 paise / 1M | 47150 paise / 1M | n/a |

Keep these values updated when provider pricing or USD to INR changes:

```env
AI_COST_USD_TO_INR=94.3
AI_COST_DEEPSEEK_CACHE_HIT_PAISE_PER_1M=264
AI_COST_DEEPSEEK_CACHE_MISS_PAISE_PER_1M=1320
AI_COST_DEEPSEEK_INPUT_PAISE_PER_1M=1320
AI_COST_DEEPSEEK_OUTPUT_PAISE_PER_1M=2640
AI_COST_GROQ_INPUT_PAISE_PER_1M=5564
AI_COST_GROQ_OUTPUT_PAISE_PER_1M=7450
AI_COST_ANTHROPIC_INPUT_PAISE_PER_1M=9430
AI_COST_ANTHROPIC_OUTPUT_PAISE_PER_1M=47150
```

## Abuse Protection

Resume generation is protected before the AI provider is called.

- Frontend requests a signed challenge from `/api/challenge`.
- User must answer the challenge before generation.
- Backend verifies the challenge signature and expiry.
- Hidden honeypot field blocks basic automated form posts.
- Express rate limiting protects generation and admin routes.

This reduces automated cost abuse, but it is not a full bot-management system. For public production traffic, consider adding Cloudflare Turnstile, hCaptcha, reCAPTCHA Enterprise, or a WAF rule in front of `/api/generate`.

## Payment Flow

1. User generates and previews a resume.
2. Download remains locked until payment.
3. Frontend creates a Razorpay order through `/api/payment/order`.
4. Razorpay checkout returns order, payment, and signature details.
5. Backend verifies the signature through `/api/payment/verify`.
6. Backend marks payment success and sends payment confirmation email.
7. Backend returns a signed access token scoped to that resume/payment.
8. User sees a centered choice to download directly or email the files.
9. Download records through `/api/payment/download`.
10. Frontend clears the paid token after successful download.

If payment succeeds but the customer closes the page or the session times out, admin can resend the stored generated resume from `/admin`.

## Email Flow

- Payment confirmation email is sent after successful payment verification.
- Resume file email sends both PDF and DOCX attachments.
- Support/admin resend sends the stored generated resume to the paid customer.
- Gmail requires a 16-character App Password, not the normal Gmail password.
- Support email: `supportresumealign@gmail.com`.

## Production Deployment

### Backend Environment

Set production values on the backend host:

```env
NODE_ENV=production
PORT=5000
CLIENT_ORIGIN=https://your-frontend-domain.com
APP_URL=https://your-frontend-domain.com
DATABASE_PATH=/persistent/path/database.sqlite
```

Also set real values for:

- `DEEPSEEK_API_KEY`
- `GROQ_API_KEY` if using Groq fallback
- `ANTHROPIC_API_KEY` if using Anthropic fallback
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `ACCESS_TOKEN_SECRET`
- `ADMIN_ACCESS_TOKEN`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`
- all `AI_COST_*` values

### Frontend Environment

Set production API URL before building:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

Build:

```bash
cd frontend
npm run build
```

Deploy the generated `frontend/dist` folder.

### Backend Start

```bash
cd backend
npm install --omit=dev
npm start
```

Use a process manager or platform service manager so the backend restarts after crashes or deploys.

## Deployment Checklist

Before going live:

- Backend `NODE_ENV=production`.
- Backend `CLIENT_ORIGIN` is the real frontend domain.
- Backend `APP_URL` is the real frontend domain.
- Frontend `VITE_API_URL` is the real backend API URL.
- Razorpay keys are correct for test or live mode.
- SMTP verification passes.
- `ACCESS_TOKEN_SECRET` is strong and private.
- `ADMIN_ACCESS_TOKEN` is strong, private, and different from `ACCESS_TOKEN_SECRET`.
- SQLite database path is on persistent disk.
- `.env` files are not committed.
- Admin wrong token returns `401`.
- `/api/generate` without a valid challenge returns `400`.
- Frontend build passes.
- Backend syntax checks pass.
- npm audit is reviewed for backend and frontend.
- A real payment test records payment success.
- A real download records a row in `downloads`.
- Admin dashboard shows the test payment/download after refresh.
- Support resend works for a paid resume.

## Verification Commands

Frontend build:

```bash
cd frontend
npm run build
```

Backend syntax checks:

```bash
cd backend
node --check server.js
node --check controllers/resumeController.js
node --check controllers/paymentController.js
node --check controllers/adminController.js
node --check services/aiService.js
node --check services/emailService.js
node --check utils/challenge.js
```

Production dependency audit:

```bash
cd backend
npm audit --omit=dev

cd ../frontend
npm audit --omit=dev
```

Health check:

```bash
curl https://your-backend-domain.com/health
```

Expected response:

```json
{"ok":true}
```

## Important Notes

- Preview copy/print protections reduce casual misuse but are not DRM.
- The watermark is intentionally applied to preview only. Exported paid files remain clean.
- Generated resume content must stay truthful. The AI should improve wording and structure without inventing jobs, degrees, certifications, employers, metrics, or tools.
- Same email reuse is allowed. Each new paid order can create a new paid token.
- Keep provider pricing values current so the admin profit estimate stays useful.
- For higher traffic, consider moving from SQLite to PostgreSQL/MySQL and adding a stronger bot-protection provider.
