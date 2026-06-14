# ResumeAlignAI

ResumeAlignAI is a premium AI resume builder for fresher and experienced candidates. It converts manual profile details, uploaded PDF resumes, and a target job description into an ATS-aware resume, then supports live editing, ATS scoring, template switching, Razorpay payment unlock, one-time tracked download, optional email delivery, and an admin dashboard for business/support tracking.

Last updated: June 14, 2026

## Current Status

- Frontend and backend are split into separate apps under `frontend/` and `backend/`.
- Backend runtime target is Node.js 20 or newer.
- Frontend is a React 18 + Vite single-page app.
- Backend is an Express API with SQLite persistence.
- Production deploys require real environment variables; placeholder URLs and secrets are not production-ready.
- `frontend/.env.production` currently contains a placeholder API URL and must be replaced before a real production build.

## Live Production

The app is currently deployed and accepting real Razorpay payments.

| Component | Host | URL / Identifier |
| --- | --- | --- |
| Website (frontend) | Vercel | https://resumealignai.online |
| API (backend) | Railway | https://airesumebuilder-production-54d5.up.railway.app |
| Database (SQLite + WAL) | Railway persistent volume mounted at `/data` | `/data/database.sqlite` |
| Email delivery | Resend HTTPS API | `onboarding@resend.dev` sandbox; domain verification for `resumealignai.online` in progress |
| Payment gateway | Razorpay | flat Rs.69 per resume; International Cards activation pending |
| Support email | Custom domain mailbox | `support@resumealignai.online` |

Notes:

- CORS on the backend requires `CLIENT_ORIGIN` to exactly match the browser-sent origin. No trailing slash, no `www`.
- Vercel redirects `www.resumealignai.online` to the apex `resumealignai.online` so the backend only needs to whitelist one origin.
- Outbound SMTP from Railway to Gmail (ports 587 and 465) is blocked by Railway's egress network — production email runs through Resend's HTTPS API. Local development can still use Gmail SMTP because the block does not apply outside Railway.
- See `frontend/vercel.json` for the SPA rewrite that makes deep links like `/builder` and `/admin` reachable directly.

## Product Features

### Marketing and pages

- Landing page with hero, pricing, ATS education, samples preview, FAQs, contact section, and footer with legal links.
- Premium brand treatment: gold "Premium" badge next to the `R` brand mark in the navbar, builder, and footer.
- Site favicon (`frontend/public/favicon.svg`) mirrors the brand mark gradient so every browser tab shows the logo.
- All brand-mark logos in the navbar, builder, footer, and policy pages are clickable and link back to home.
- Footer contains brand-aligned links to Benefits, Features, FAQ, Contact, Privacy Policy, Refund Policy, and Terms of Service.
- Dedicated routes for legal/policy content:
  - `/privacy` — DPDP-aligned Privacy Policy with data-deletion path.
  - `/refund-policy` — refund eligibility, exclusions, 7-day window, and request flow.
  - `/terms` — terms of service with acceptable use, AI disclaimer, liability cap, India governing law.

### Builders

- Dedicated builders for experienced candidates at `/builder` and freshers at `/fresher-builder`.
- Role-targeted AI resume generation from structured form inputs, uploaded PDF resume text, and a pasted job description.
- Fresher-specific sections for career objective, technical skills, academic projects, internship/training, education, certifications, and achievements.
- Experienced-specific sections for professional summary, key skills, work experience, projects, education, certifications, achievements, and languages.
- PDF resume upload and parsing with a 5 MB PDF-only limit.
- Server-signed generation challenge plus hidden honeypot field before AI tokens are spent.

### ATS and AI

- ATS scoring, missing keyword visibility, failed checks, guidance, keyword suggestions, and AI improvement passes toward a 95% target.
- DeepSeek as primary AI provider, Groq as fallback, Anthropic as final fallback.
- Per-resume AI usage logging (provider, model, prompt/completion/total tokens, paise cost).

### Templates and samples

- 27 resume templates across 8 distinct layouts (`premium-card`, `sidebar-left`, `sidebar-right`, `single-col`, `banner`, `top-bar`, `minimal`, `executive`), including `Aurora Luxe`.
- 17 sample resumes at `/samples`, covering fresher and experienced variants across software, QA, HR, accounting, customer service, marketing, product, and data roles.

### Preview and export

- Protected preview that blocks casual copy, cut, selection, drag, right click, and print shortcut behavior.
- Editable generated resume content before download.
- Diagonal preview watermark + footer watermark on the preview only; paid PDF and DOCX exports are clean.
- PDF visual export (preserves template colors and layout) and DOCX plain-layout export.

### Payment and delivery

- Razorpay checkout at a server-authoritative flat price of **Rs.69 per resume session**. The price is computed server-side and cannot be overridden by the client.
- HMAC-SHA256 signature verification with `crypto.timingSafeEqual` for the Razorpay payment signature.
- One successful payment token supports one tracked download. Replays of the same token are rejected server-side.
- Failed signature verification flips the payment row from `pending` to `failed` automatically.
- Optional email delivery of generated PDF and DOCX files after payment.
- Payment confirmation email is sent on every successful verification (separate from the optional attachments email).
- All transactional emails carry a clickable brand logo, a clickable headline, and a centered "Visit ResumeAlignAI" CTA pill that links to `APP_URL`.

### Admin and operations

- Admin dashboard for revenue, payment status, resumes, downloads, email status, AI token usage, estimated AI cost, gross profit, and support resend actions.
- `x-admin-token` header (or `Authorization: Bearer …`) protects `/admin` and `/api/admin/*`.
- Admin delete-by-email endpoint for customer-data cleanup; runs a single SQLite transaction across `users`, `resumes`, `payments`, `emails`, `downloads`, and `ai_usage`.
- Per-IP rate limits: 10 AI requests per 15 minutes, 30 general requests per 15 minutes.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite 5, Framer Motion, Lucide React, Axios |
| Export | html2canvas, jsPDF, docx |
| Backend | Node.js 20+, Express, Helmet, CORS, Express Rate Limit, Multer |
| Database | SQLite with better-sqlite3 |
| AI Providers | DeepSeek primary, Groq fallback, Anthropic fallback |
| Payments | Razorpay |
| Email | Resend optional, Nodemailer SMTP, Ethereal fallback in development |
| Deployment Helper | Vercel SPA rewrite config in `frontend/vercel.json` |

## Project Structure

```text
AIResumeBuilder/
|-- backend/
|   |-- controllers/       # Resume, payment, email, and admin request handlers
|   |-- db/                # SQLite setup, schema, migrations, query helpers
|   |-- routes/            # API route registration
|   |-- services/          # AI provider orchestration and email delivery
|   |-- utils/             # ATS scoring, challenge, PDF parsing, text conversion
|   |-- .env.example
|   |-- server.js
|   `-- package.json
|-- frontend/
|   |-- public/            # Static frontend assets
|   |-- src/
|   |   |-- components/    # Landing, builders, preview, payment, samples, admin, legal pages
|   |   |-- utils/         # Frontend error helpers
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- styles.css
|   |-- .env.example
|   |-- .env.production
|   |-- vercel.json
|   |-- vite.config.js
|   `-- package.json
|-- .github/agents/
`-- README.md
```

## App Routes

Frontend SPA routes:

- `/` - marketing/landing page.
- `/builder` - experienced candidate resume workspace.
- `/fresher-builder` - fresher resume workspace.
- `/samples` - sample resume browser.
- `/samples?sample=<id>` - direct sample selection.
- `/admin` - token-protected admin dashboard.
- `/privacy` - privacy policy.
- `/refund-policy` - refund policy.
- `/terms` - terms of service.

## Local Setup

### Prerequisites

- Node.js 20 or newer.
- npm.
- Razorpay test or live account credentials.
- At least one AI provider key. DeepSeek is the intended primary provider.
- Email credentials for payment/support emails. Gmail SMTP requires an App Password.

### Backend

Create `backend/.env` from `backend/.env.example`.

For local development, make sure these values are local:

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
APP_URL=http://localhost:5173
DATABASE_PATH=./database.sqlite
```

Set real or test values for:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-chat

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-haiku-4-5

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

ACCESS_TOKEN_SECRET=generate-a-strong-random-secret
ADMIN_ACCESS_TOKEN=generate-a-different-strong-admin-token

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

The backend script loads `backend/.env` through Node's `--env-file=.env`.

Health check:

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

Vite usually serves the app at:

```text
http://localhost:5173
```

## Environment Variables

### Backend

Required for production startup:

- `NODE_ENV=production`
- `CLIENT_ORIGIN=https://your-frontend-domain.com`
- `ACCESS_TOKEN_SECRET`
- `ADMIN_ACCESS_TOKEN`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- at least one of `DEEPSEEK_API_KEY`, `GROQ_API_KEY`, or `ANTHROPIC_API_KEY`
- `EMAIL_USER`
- `EMAIL_PASS`

Strongly recommended for production:

- `APP_URL=https://your-frontend-domain.com`
- `DATABASE_PATH=/persistent/path/database.sqlite`
- `EMAIL_FROM=ResumeAlignAI <support@your-domain.com>`
- all `AI_COST_*` pricing values

Optional email mode:

- `RESEND_API_KEY` enables the Resend HTTPS email path in `backend/services/emailService.js`.
- Current backend production validation still requires `EMAIL_USER` and `EMAIL_PASS`, so set them even if Resend is enabled unless the validation logic is changed.

AI cost variables:

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

### Frontend

Required:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

Do not deploy with:

```env
VITE_API_URL=https://your-api-domain.com/api
```

That value is a placeholder in `frontend/.env.production`.

## Secret Generation

Generate `ACCESS_TOKEN_SECRET` and `ADMIN_ACCESS_TOKEN` separately:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice:

- Save the first value as `ACCESS_TOKEN_SECRET`.
- Save the second value as `ADMIN_ACCESS_TOKEN`.

Never commit `.env` files, real API keys, Razorpay secrets, email passwords, generated tokens, or production database files.

## API Endpoints

Base API URL in local development:

```text
http://localhost:5000/api
```

Health endpoint:

- `GET /health` - backend liveness check.

Resume and ATS endpoints:

- `GET /api/challenge` - create a signed security challenge for generation.
- `POST /api/generate` - generate and refine a resume.
- `POST /api/upload` - upload and parse a PDF resume.
- `POST /api/ats` - calculate ATS score.
- `POST /api/suggest` - suggest keyword placement.
- `POST /api/improve` - improve resume content toward the ATS target.

Payment, download, and email endpoints:

- `POST /api/payment/quote` - return the server-authoritative Rs.69 quote.
- `POST /api/payment/order` - create a Razorpay order.
- `POST /api/payment/verify` - verify Razorpay signature and issue a paid access token.
- `POST /api/payment/check` - validate an existing paid access token.
- `POST /api/payment/download` - record a verified resume download.
- `POST /api/payment/email-attachments` - send generated PDF and DOCX attachments after payment.

Admin endpoints:

- `GET /api/admin/overview` - dashboard summary, daily stats, recent sessions, AI pricing, and model usage.
- `POST /api/admin/resumes/:resumeId/send` - send a stored generated resume to a paid customer.
- `POST /api/admin/users/delete-by-email` - delete stored user, resume, payment, email, download, and AI usage rows for an email.

Admin routes accept either:

```text
x-admin-token: your_ADMIN_ACCESS_TOKEN
```

or:

```text
Authorization: Bearer your_ADMIN_ACCESS_TOKEN
```

Missing or wrong admin tokens should return `401`. Missing backend admin configuration returns `503`.

## Database

SQLite is initialized automatically at backend startup through `better-sqlite3`.

Tables:

- `users`
- `resumes`
- `payments`
- `emails`
- `downloads`
- `ai_usage`

The database uses WAL mode and foreign keys. `DATABASE_PATH` defaults to `backend/database.sqlite` when not set.

For production, `DATABASE_PATH` must point to persistent storage. Do not use an ephemeral filesystem unless losing customer, payment, download, support, and AI usage history is acceptable.

## AI Flow

1. The frontend requests a challenge from `/api/challenge`.
2. The user completes the builder and security answer.
3. `/api/generate` rejects honeypot submissions and invalid challenges before AI is called.
4. DeepSeek is tried first.
5. Groq is used as fallback when fallback conditions are met.
6. Anthropic is the final fallback.
7. The backend normalizes the AI JSON into the resume schema.
8. ATS score is calculated from the structured resume and job description.
9. The backend may run additional improvement passes toward a 95% score.
10. User, resume, and AI usage rows are persisted when DB writes succeed.

AI usage logs include provider, model, prompt tokens, completion tokens, total tokens, purpose, and estimated cost in paise.

## Payment Flow

1. The user generates and previews the resume for free.
2. Download stays locked until payment.
3. The frontend requests a server quote and Razorpay order.
4. The server creates a Rs.69 Razorpay order and stores a pending payment.
5. Razorpay returns order, payment, and signature details.
6. The backend verifies the signature.
7. The backend marks the payment successful and sends a payment confirmation email.
8. The backend returns a signed access token scoped to the order, payment, and resume.
9. The user can choose PDF or DOCX and confirm the accuracy checklist.
10. `/api/payment/download` records the download.
11. The frontend clears the paid token after the tracked download.

One payment token is intended for one tracked download. If the browser session times out after a successful payment, admin can resend the stored resume content from `/admin`.

## Email Flow

Email delivery in `backend/services/emailService.js` selects a transport based on env vars:

1. **Resend HTTPS API** — used when `RESEND_API_KEY` is set. This is the **production-recommended path** on Railway/Render/Fly because their egress blocks outbound SMTP (port 587/465) to Gmail. Resend uses HTTPS on port 443, which is always reachable.
2. **Nodemailer SMTP** — used when `RESEND_API_KEY` is not set and SMTP credentials are configured. Suitable for local development with Gmail App Passwords.
3. **Ethereal test fallback** — used in development when SMTP credentials are missing or fail verification; surfaces a preview URL in the backend console.

For production on Railway, set:

```env
RESEND_API_KEY=re_...
EMAIL_FROM=ResumeAlignAI <sender@your-verified-domain>
```

Production behavior:

- The backend validates required env vars at startup.
- If using nodemailer SMTP, the transport is verified at startup; verification failures are logged but no longer crash the process.
- Resend's hostname is pre-resolved to IPv4 only when nodemailer SMTP is used (legacy safeguard for Railway IPv6 ENETUNREACH errors).
- Payment confirmation email is sent after successful payment verification.
- Resume attachment email sends PDF and DOCX files after payment when the user opts in.
- Admin/support resend sends a stored generated resume copy to paid customers.
- All three email templates include a clickable `R` logo, a clickable `ResumeAlignAI` headline, and a "Visit ResumeAlignAI" CTA pill — each pointing to `APP_URL`.

Resend sender requirements:

- Sandbox: `onboarding@resend.dev` delivers only to the Resend account's signup email — useful for verifying end-to-end before production launch.
- Production: a verified domain on Resend (DNS records: SPF TXT on `send.<domain>`, DKIM TXT on `resend._domainkey.<domain>`, MX on `send.<domain>` pointing at `feedback-smtp.<region>.amazonses.com`).
- Once the domain is verified, change `EMAIL_FROM` to `ResumeAlignAI <support@<domain>>` and emails go to any recipient.

Support email used in the app:

```text
support@resumealignai.online
```

## Brand Assets

- Primary logo mark: white `R` on a teal-to-amber gradient (`#0f766e` → `#d99152`), 8px rounded corners, defined as `.brand-mark` in `frontend/src/styles.css`.
- Site favicon: `frontend/public/favicon.svg` (32x32 SVG, same gradient + glyph). Linked from `frontend/index.html` as both `icon` and `apple-touch-icon`.
- Premium badge: small gold pill (`#f5d56b` → `#c79a2b` → `#a37414`) labeled `PREMIUM` next to the brand name in the navbar, builder, footer, and email headers.
- Theme color (used by mobile browsers for chrome): `#0f766e` (teal accent), set via `<meta name="theme-color">` in `index.html`.
- Email templates share the same logo mark and gradient header, plus a "Visit ResumeAlignAI" CTA pill linking to `APP_URL`.

## Admin Dashboard

Open locally:

```text
http://localhost:5173/admin
```

Open in production:

```text
https://your-frontend-domain.com/admin
```

Use `ADMIN_ACCESS_TOKEN` to sign in.

The admin dashboard shows:

- Resumes created.
- Successful, pending, and failed payments.
- Revenue from successful payments.
- Estimated AI cost.
- Estimated gross profit.
- Paid sessions with no recorded download.
- Total downloads.
- Emails sent and failed.
- Token usage by provider/model.
- AI pricing rates used by the backend.
- Day-wise resume, payment, revenue, cost, profit, download, and email activity.
- Recent customer sessions with searchable name, email, phone, payment, order, resume, download, and email status.
- Support action to resend a paid customer's resume.

## Abuse Protection

Current protections:

- Signed challenge required for `/api/generate`.
- Hidden honeypot field blocks simple automated form posts.
- AI routes are limited to 10 requests per IP per 15 minutes.
- Upload, ATS, payment, and admin routes are limited to 30 requests per IP per 15 minutes.
- Helmet headers are enabled.
- Production CORS only allows `CLIENT_ORIGIN`.
- Development CORS allows localhost ports plus any explicitly configured origin.
- JSON body is limited to 1 MB by default.
- Email attachment endpoint accepts up to 20 MB because PDF and DOCX are sent as base64.
- PDF uploads are limited to 5 MB.

For public high-traffic production, consider adding Cloudflare Turnstile, hCaptcha, reCAPTCHA Enterprise, bot rules, or a WAF in front of `/api/generate`.

## Production Deployment

### Backend

Set production environment variables on the backend host:

```env
NODE_ENV=production
PORT=5000
CLIENT_ORIGIN=https://your-frontend-domain.com
APP_URL=https://your-frontend-domain.com
DATABASE_PATH=/persistent/path/database.sqlite
```

Then set real values for AI, Razorpay, access tokens, admin token, email, and AI cost variables.

Install production dependencies and start:

```bash
cd backend
npm install --omit=dev
npm start
```

`npm start` runs `node server.js`. It expects environment variables to be supplied by the platform or shell.

Use a platform process manager, service manager, or container runtime that restarts the backend after crashes and deploys.

### Frontend

Set the production API URL:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

Build:

```bash
cd frontend
npm run build
```

Deploy `frontend/dist`.

If deploying the frontend to Vercel, `frontend/vercel.json` rewrites all routes to `index.html` so SPA routes such as `/builder`, `/samples`, and `/admin` work after refresh.

## Deployment Checklist

Before going live:

- Backend runs on Node.js 20 or newer.
- Backend `NODE_ENV=production`.
- Backend `CLIENT_ORIGIN` is the exact HTTPS frontend origin.
- Backend `APP_URL` is the HTTPS frontend URL.
- Frontend `VITE_API_URL` is the real backend API URL, not a placeholder.
- `frontend/.env.production` placeholder is replaced or overridden in the hosting platform.
- `DATABASE_PATH` points to persistent storage.
- Razorpay keys match the intended test/live mode.
- At least one AI provider key is configured.
- `ACCESS_TOKEN_SECRET` is strong, private, and different from `ADMIN_ACCESS_TOKEN`.
- `ADMIN_ACCESS_TOKEN` is strong and private.
- Email settings are valid for the selected provider.
- Production startup logs show environment validation passed.
- `/health` returns `{"ok":true}`.
- Admin wrong token returns `401`.
- `/api/generate` without a valid challenge returns `400`.
- Frontend build passes.
- Backend syntax checks pass.
- `npm audit --omit=dev` is reviewed for backend and frontend.
- A real Razorpay test payment succeeds.
- A real paid download records one row in `downloads`.
- Admin dashboard shows the test payment/download after refresh.
- Support resend works for a paid resume.
- Delete-by-email endpoint is tested only with test customer data before using it on real users.

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

Local health check:

```bash
curl http://localhost:5000/health
```

Production health check:

```bash
curl https://your-backend-domain.com/health
```

## Windows Notes

If `node` or `npm` is installed but not available in the current PowerShell PATH, use the direct Windows install path:

```powershell
& "C:\Program Files\nodejs\npm.cmd" install
```

If npm child processes cannot find Node, prepend Node to PATH in the same shell:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```

## Important Notes

- Preview protections reduce casual misuse but are not DRM.
- Client-side exports and payment UI state should not be treated as a complete server-side paywall.
- Generated resume content must remain truthful. The AI should improve wording and structure without inventing jobs, degrees, certifications, employers, tools, or metrics.
- DOCX export uses a clean plain-text layout and does not replicate every visual template style.
- Same email reuse is allowed. Each new paid order can create a new paid token.
- Keep AI provider pricing and USD/INR values current so admin profit estimates stay useful.
- SQLite is acceptable for small deployments when storage is persistent; for higher traffic, migrate to PostgreSQL or MySQL.
- Do not commit local SQLite database files or WAL/SHM files from production data.
