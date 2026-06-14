/* ─────────────────────────────────────────────────────────────
   prerender.mjs — post-build SEO prerendering
   Runs after `vite build`. Reads dist/index.html, swaps the
   meta tags + #root fallback content per route, and writes
   route-specific static HTML files into dist/{route}/index.html.

   Why per-route prerender:
   - All Vercel SPA routes currently rewrite to /index.html
   - That gave every URL the same landing-page SEO content
   - Crawlers indexing /builder, /samples etc. saw landing copy
   - This script generates route-specific HTML for proper SEO

   No puppeteer / no headless browser — the route-specific
   content is hardcoded here (this is a small SPA with 7 routes
   and fixed marketing copy per route, so a static template
   approach is the right ROI vs. running a real browser).
───────────────────────────────────────────────────────────── */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "..", "dist");
const indexPath = join(distDir, "index.html");
const SITE = "https://resumealignai.online";

if (!existsSync(indexPath)) {
  console.error(`[prerender] dist/index.html not found at ${indexPath}. Did you run \`vite build\` first?`);
  process.exit(1);
}

const baseHtml = readFileSync(indexPath, "utf8");

/* ─── Per-route SEO definitions ───────────────────────────── */

const routes = [
  {
    path: "/builder",
    title: "Build an Experienced Resume with AI — ResumeAlignAI",
    description: "Build an experienced professional resume in minutes. Add your career history, paste the target job description, and ResumeAlignAI generates a polished, ATS-aligned PDF for Rs.69.",
    content: `
      <header>
        <nav aria-label="Primary">
          <a href="/" rel="home"><strong>ResumeAlignAI Premium</strong></a>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/builder">Build Resume</a></li>
            <li><a href="/fresher-builder">Fresher Builder</a></li>
            <li><a href="/samples">Sample Resumes</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <section>
          <h1>Build an Experienced Resume with AI</h1>
          <p>Add your career history, measurable impact, skills, and the target job description. ResumeAlignAI rewrites everything into a sharper, ATS-aligned resume in minutes.</p>
          <h2>What the builder handles</h2>
          <ul>
            <li><strong>Career history</strong> &mdash; roles, companies, dates, key responsibilities</li>
            <li><strong>Impact bullets</strong> &mdash; AI rewrites accomplishments with measurable outcomes</li>
            <li><strong>Skills + tools</strong> &mdash; mapped to the job description keywords</li>
            <li><strong>Existing resume upload</strong> &mdash; parse a PDF to pre-fill the form</li>
            <li><strong>ATS scoring</strong> &mdash; see your match score before submitting</li>
            <li><strong>27 professional templates</strong> &mdash; switch and re-download free</li>
          </ul>
          <p>Rs.69 unlocks PDF + DOCX download. Preview free, pay only when satisfied.</p>
          <p><a href="/builder">Start building</a> &middot; <a href="/fresher-builder">Just out of college? Use the Fresher Builder</a> &middot; <a href="/samples">See sample resumes</a></p>
        </section>
      </main>
      <footer><a href="/privacy">Privacy</a> &middot; <a href="/refund-policy">Refunds</a> &middot; <a href="/terms">Terms</a> &middot; <a href="mailto:support@resumealignai.online">support@resumealignai.online</a></footer>
    `
  },
  {
    path: "/fresher-builder",
    title: "Build a Fresher Resume with AI — ResumeAlignAI",
    description: "Build a fresher / entry-level resume around projects, internships, education, and achievements. ResumeAlignAI generates an ATS-aligned PDF in minutes for Rs.69.",
    content: `
      <header>
        <nav aria-label="Primary">
          <a href="/" rel="home"><strong>ResumeAlignAI Premium</strong></a>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/builder">Experienced Builder</a></li>
            <li><a href="/fresher-builder">Fresher Builder</a></li>
            <li><a href="/samples">Sample Resumes</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <section>
          <h1>Build a Fresher Resume with AI</h1>
          <p>Built specifically for college graduates and entry-level applicants. Add your education, projects, internships, achievements, and target role &mdash; ResumeAlignAI produces a recruiter-ready resume.</p>
          <h2>What the Fresher Builder handles</h2>
          <ul>
            <li><strong>Education + GPA</strong> &mdash; degree, institution, achievements</li>
            <li><strong>Projects</strong> &mdash; rewritten with measurable outcomes and matched keywords</li>
            <li><strong>Internships + training</strong> &mdash; framed for recruiters</li>
            <li><strong>Coursework</strong> &mdash; mapped to the role's required skills</li>
            <li><strong>Achievements</strong> &mdash; hackathons, competitions, awards</li>
            <li><strong>ATS scoring</strong> &mdash; match score against the job description</li>
          </ul>
          <p>Rs.69 unlocks PDF + DOCX download. Preview free, pay only when satisfied.</p>
          <p><a href="/fresher-builder">Start as a fresher</a> &middot; <a href="/builder">Have work experience? Use the Experienced Builder</a> &middot; <a href="/samples">See fresher sample resumes</a></p>
        </section>
      </main>
      <footer><a href="/privacy">Privacy</a> &middot; <a href="/refund-policy">Refunds</a> &middot; <a href="/terms">Terms</a> &middot; <a href="mailto:support@resumealignai.online">support@resumealignai.online</a></footer>
    `
  },
  {
    path: "/samples",
    title: "Sample Resumes by Role — ResumeAlignAI",
    description: "Browse AI-generated sample resumes for Software Engineer, Data Analyst, Product Manager, Designer, Marketer and more. See what an ATS-aligned, role-specific resume looks like before you build your own.",
    content: `
      <header>
        <nav aria-label="Primary">
          <a href="/" rel="home"><strong>ResumeAlignAI Premium</strong></a>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/builder">Experienced Builder</a></li>
            <li><a href="/fresher-builder">Fresher Builder</a></li>
            <li><a href="/samples">Sample Resumes</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <section>
          <h1>Sample Resumes by Role</h1>
          <p>Real AI-generated samples across fresher and experienced profiles. Browse the role closest to yours, see how it's structured, then build your own version in minutes.</p>
          <h2>Roles covered</h2>
          <ul>
            <li>Software Engineer (Fresher and Experienced)</li>
            <li>Data Analyst / Data Scientist</li>
            <li>Product Manager</li>
            <li>UI / UX Designer</li>
            <li>Digital Marketing Specialist</li>
            <li>Business Analyst</li>
            <li>Financial Analyst</li>
            <li>HR / Talent Operations</li>
            <li>Sales Executive</li>
            <li>And more &mdash; plus 27 templates to pick from</li>
          </ul>
          <p><a href="/samples">View all sample resumes</a> &middot; <a href="/builder">Build your own resume for Rs.69</a></p>
        </section>
      </main>
      <footer><a href="/privacy">Privacy</a> &middot; <a href="/refund-policy">Refunds</a> &middot; <a href="/terms">Terms</a> &middot; <a href="mailto:support@resumealignai.online">support@resumealignai.online</a></footer>
    `
  },
  {
    path: "/privacy",
    title: "Privacy Policy — ResumeAlignAI",
    description: "ResumeAlignAI privacy policy. Learn what personal data we collect, why we collect it, how long we keep it, and how to request deletion. Aligned with India's DPDP Act 2023.",
    content: `
      <header>
        <nav aria-label="Primary">
          <a href="/" rel="home"><strong>ResumeAlignAI Premium</strong></a>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/refund-policy">Refund Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <section>
          <h1>Privacy Policy</h1>
          <p>ResumeAlignAI is operated as a premium AI resume service. This policy explains what personal data we collect, why we collect it, how long we keep it, and how you can ask us to delete it.</p>
          <h2>Summary</h2>
          <ul>
            <li>Resume details you enter are used only to generate your resume.</li>
            <li>Payment data is processed by Razorpay; we never store card details.</li>
            <li>You can request deletion of your data at any time by emailing <a href="mailto:support@resumealignai.online">support@resumealignai.online</a>.</li>
            <li>Aligned with India's DPDP Act 2023.</li>
          </ul>
          <p><a href="/privacy">Read the full privacy policy</a></p>
        </section>
      </main>
      <footer><a href="/">Home</a> &middot; <a href="/refund-policy">Refunds</a> &middot; <a href="/terms">Terms</a> &middot; <a href="mailto:support@resumealignai.online">support@resumealignai.online</a></footer>
    `
  },
  {
    path: "/refund-policy",
    title: "Refund Policy — ResumeAlignAI",
    description: "ResumeAlignAI refund policy. Full refunds for failed PDF delivery, payment errors, or quality issues. Contact support within 7 days for review and refund.",
    content: `
      <header>
        <nav aria-label="Primary">
          <a href="/" rel="home"><strong>ResumeAlignAI Premium</strong></a>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/refund-policy">Refund Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <section>
          <h1>Refund Policy</h1>
          <p>We want you to be completely satisfied with your ResumeAlignAI premium resume. If something goes wrong with your download or the file does not meet a reasonable quality standard, we will refund you in full.</p>
          <h2>Refund eligibility</h2>
          <ul>
            <li>Payment deducted but PDF/DOCX never unlocked &mdash; full refund</li>
            <li>Service unavailable during your payment &mdash; full refund</li>
            <li>Significant quality issue with generated content &mdash; full refund after review</li>
            <li>Contact <a href="mailto:support@resumealignai.online">support@resumealignai.online</a> within 7 days of purchase</li>
          </ul>
          <p><a href="/refund-policy">Read the full refund policy</a></p>
        </section>
      </main>
      <footer><a href="/">Home</a> &middot; <a href="/privacy">Privacy</a> &middot; <a href="/terms">Terms</a> &middot; <a href="mailto:support@resumealignai.online">support@resumealignai.online</a></footer>
    `
  },
  {
    path: "/terms",
    title: "Terms of Service — ResumeAlignAI",
    description: "ResumeAlignAI terms of service. Plain-English terms covering acceptable use, payment, content ownership, AI disclaimer, service availability, and limitation of liability. Governed by Indian law.",
    content: `
      <header>
        <nav aria-label="Primary">
          <a href="/" rel="home"><strong>ResumeAlignAI Premium</strong></a>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/refund-policy">Refund Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <section>
          <h1>Terms of Service</h1>
          <p>These terms set out the rules for using ResumeAlignAI. By using the service you agree to these terms. We have tried to keep them short and human-readable.</p>
          <h2>Key points</h2>
          <ul>
            <li>You must be 18 or older to use the service.</li>
            <li>Rs.69 per resume download. Pricing may change for new customers; the price at checkout is final.</li>
            <li>You own the career details you submit and the AI-generated resume content for personal use.</li>
            <li>You are responsible for reviewing every section before sending it to a recruiter.</li>
            <li>Governed by Indian law; disputes subject to Maharashtra jurisdiction.</li>
          </ul>
          <p><a href="/terms">Read the full terms of service</a></p>
        </section>
      </main>
      <footer><a href="/">Home</a> &middot; <a href="/privacy">Privacy</a> &middot; <a href="/refund-policy">Refunds</a> &middot; <a href="mailto:support@resumealignai.online">support@resumealignai.online</a></footer>
    `
  }
];

/* ─── Replacement helpers ─────────────────────────────────── */

const replaceTag = (html, regex, replacement) => {
  if (!regex.test(html)) {
    console.warn(`[prerender] regex did not match: ${regex}`);
    return html;
  }
  return html.replace(regex, replacement);
};

const buildRouteHtml = (route) => {
  let html = baseHtml;
  const canonical = `${SITE}${route.path}`;

  // Update <title>
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${route.title}</title>`);

  // Update meta description
  html = replaceTag(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${route.description}" />`
  );

  // Update canonical
  html = replaceTag(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${canonical}" />`
  );

  // Update Open Graph
  html = replaceTag(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${canonical}" />`
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${route.title}" />`
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${route.description}" />`
  );

  // Update Twitter
  html = replaceTag(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${route.title}" />`
  );
  html = replaceTag(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${route.description}" />`
  );

  // Replace #root fallback content with route-specific content. The base
  // index.html wraps fallback in <div id="seo-fallback"> so JS-enabled users
  // see it hidden via inline CSS. Vite moves module scripts into <head>
  // during build, so we anchor on </body> instead of the (no-longer-adjacent)
  // module script tag.
  const rootRegex = /<div id="root">[\s\S]*?<\/div>\s*<\/div>(\s*<\/body>)/;
  if (!rootRegex.test(html)) {
    // Fall back to the older single-div pattern in case index.html structure changes.
    const fallbackRegex = /<div id="root">[\s\S]*?<\/div>(\s*<\/body>)/;
    if (!fallbackRegex.test(html)) {
      console.warn(`[prerender] WARNING: #root replacement regex did not match for ${route.path}`);
      return html;
    }
    html = html.replace(fallbackRegex, `<div id="root"><div id="seo-fallback">${route.content}</div></div>$1`);
  } else {
    html = html.replace(rootRegex, `<div id="root"><div id="seo-fallback">${route.content}</div></div>$1`);
  }

  return html;
};

/* ─── Write per-route static HTML files ──────────────────── */

console.log("[prerender] writing per-route static HTML...");

let written = 0;
for (const route of routes) {
  const html = buildRouteHtml(route);
  const outDir = join(distDir, route.path.replace(/^\//, ""));
  const outPath = join(outDir, "index.html");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, html);
  console.log(`[prerender]   ✓ ${route.path}  →  dist${route.path}/index.html`);
  written++;
}

console.log(`[prerender] wrote ${written} route(s). landing / stays as dist/index.html.`);
