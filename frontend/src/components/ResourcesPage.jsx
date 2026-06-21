import { ChevronLeft, BookOpen, ArrowRight } from "lucide-react";
import BrandMark from "./BrandMark.jsx";
import { RESOURCES, RESOURCES_BY_SLUG, RESOURCES_INDEX } from "../content/resources.js";

/* ─────────────────────────────────────────────
   ResourcesPage — renders the /resources hub and
   each /resources/<slug> article. Reads from the
   shared content module so prerender.mjs and React
   stay in sync.
   ───────────────────────────────────────────── */

export default function ResourcesPage({ slug, onBack, onNavigate }) {
  const article = slug ? RESOURCES_BY_SLUG[slug] : null;

  return (
    <div className="resources-page">
      <header className="resources-hero">
        <nav className="builder-brandbar">
          <button className="brand-lockup builder-brand-lockup brand-home-link" onClick={onBack} title="Go to home">
            <BrandMark />
            <div>
              <p>ResumeAlignAI <span className="brand-premium-badge">Premium</span></p>
              <span>Free guides &amp; resources</span>
            </div>
          </button>
          <div className="builder-brandbar-actions">
            <button className="builder-back-button" onClick={onBack}>
              <ChevronLeft aria-hidden="true" />
              Back to Home
            </button>
          </div>
        </nav>
      </header>

      <main className="resources-body">
        {article ? <Article article={article} onNavigate={onNavigate} /> : <Index onNavigate={onNavigate} />}
      </main>
    </div>
  );
}

function Index({ onNavigate }) {
  return (
    <div className="resources-index">
      <div className="resources-index-head">
        <span className="resources-badge">
          <BookOpen size={14} /> Free guides
        </span>
        <h1>Resources to help you land the next role</h1>
        <p>
          Long-form guides written by the ResumeAlignAI team. All free, no email signup, no
          drip campaigns. Use the builder when you want a working resume in five minutes.
        </p>
      </div>
      <ul className="resources-list">
        {RESOURCES.map((r) => (
          <li key={r.slug}>
            <a
              href={`/resources/${r.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.(`/resources/${r.slug}`);
              }}
            >
              <h2>{r.title}</h2>
              <p>{r.description}</p>
              <span className="resources-list-cta">
                Read the guide <ArrowRight size={14} />
              </span>
            </a>
          </li>
        ))}
      </ul>
      <div className="resources-cta-strip">
        <strong>Want the actual ATS-aligned PDF, not just the theory?</strong>
        <a
          href="/builder"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.("/builder");
          }}
        >
          Try the builder for Rs.51 <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}

function Article({ article, onNavigate }) {
  return (
    <article className="resources-article">
      <a
        className="resources-breadcrumb"
        href="/resources"
        onClick={(e) => {
          e.preventDefault();
          onNavigate?.("/resources");
        }}
      >
        ← All resources
      </a>
      <h1>{article.title}</h1>
      <p className="resources-article-lede">{article.description}</p>
      <time className="resources-article-meta">Published {article.publishedAt}</time>
      <div
        className="resources-article-body"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />
      <div className="resources-cta-strip">
        <strong>Ready to put this into a real resume?</strong>
        <a
          href="/builder"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.("/builder");
          }}
        >
          Try the builder for Rs.51 <ArrowRight size={14} />
        </a>
      </div>
    </article>
  );
}
