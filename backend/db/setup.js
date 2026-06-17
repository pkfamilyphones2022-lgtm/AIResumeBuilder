import Database from "better-sqlite3";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let db;

export const getDb = () => {
  if (db) return db;

  // Resolve lazily so DATABASE_PATH is read after env loading is complete
  const dbPath = process.env.DATABASE_PATH || resolve(__dirname, "../database.sqlite");

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  createTables(db);
  runMigrations(db);
  return db;
};

const createTables = (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT,
      email      TEXT,
      phone      TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id           INTEGER,
      resume_data       TEXT,
      generated_content TEXT,
      ats_score         INTEGER,
      pdf_url           TEXT,
      status            TEXT DEFAULT 'generated',
      created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id             INTEGER,
      resume_id           INTEGER,
      razorpay_order_id   TEXT,
      razorpay_payment_id TEXT,
      amount              INTEGER,
      status              TEXT DEFAULT 'pending',
      created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id)   REFERENCES users(id),
      FOREIGN KEY (resume_id) REFERENCES resumes(id)
    );

    CREATE TABLE IF NOT EXISTS emails (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER,
      resume_id  INTEGER,
      email_type TEXT,
      status     TEXT DEFAULT 'pending',
      sent_at    DATETIME,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id)   REFERENCES users(id),
      FOREIGN KEY (resume_id) REFERENCES resumes(id)
    );

    CREATE TABLE IF NOT EXISTS downloads (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id             INTEGER,
      resume_id           INTEGER,
      razorpay_order_id   TEXT,
      razorpay_payment_id TEXT,
      file_format         TEXT,
      created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id)   REFERENCES users(id),
      FOREIGN KEY (resume_id) REFERENCES resumes(id)
    );

    CREATE TABLE IF NOT EXISTS ai_usage (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id           INTEGER,
      resume_id         INTEGER,
      purpose           TEXT,
      provider          TEXT,
      model             TEXT,
      prompt_tokens     INTEGER DEFAULT 0,
      completion_tokens INTEGER DEFAULT 0,
      total_tokens      INTEGER DEFAULT 0,
      cost_paise        INTEGER DEFAULT 0,
      created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id)   REFERENCES users(id),
      FOREIGN KEY (resume_id) REFERENCES resumes(id)
    );

    -- Weekly Pass subscriptions. One active row per email — creating a new
    -- active sub for an email flips prior active rows to status='replaced'
    -- (enforced in queries.createSubscription).
    CREATE TABLE IF NOT EXISTS subscriptions (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      email               TEXT    NOT NULL,
      token               TEXT    NOT NULL UNIQUE,
      plan_type           TEXT    NOT NULL DEFAULT 'weekly',
      downloads_limit     INTEGER NOT NULL DEFAULT 15,
      downloads_used      INTEGER NOT NULL DEFAULT 0,
      emails_used         INTEGER NOT NULL DEFAULT 0,
      expires_at          DATETIME NOT NULL,
      status              TEXT    NOT NULL DEFAULT 'active',
      razorpay_payment_id TEXT,
      razorpay_order_id   TEXT,
      amount_paise        INTEGER,
      created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_subscriptions_email  ON subscriptions(email);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_token  ON subscriptions(token);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
  `);
};

const runMigrations = (db) => {
  const emailColumns = db.prepare("PRAGMA table_info(emails)").all().map((column) => column.name);
  if (!emailColumns.includes("created_at")) {
    db.exec("ALTER TABLE emails ADD COLUMN created_at DATETIME");
    db.exec("UPDATE emails SET created_at = COALESCE(sent_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL");
  }

  const subColumns = db.prepare("PRAGMA table_info(subscriptions)").all().map((column) => column.name);
  if (!subColumns.includes("emails_used")) {
    db.exec("ALTER TABLE subscriptions ADD COLUMN emails_used INTEGER NOT NULL DEFAULT 0");
  }
};
