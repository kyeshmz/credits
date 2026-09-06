CREATE TABLE IF NOT EXISTS credits (
  slug TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  program TEXT NOT NULL,
  category TEXT NOT NULL,
  value TEXT NOT NULL,
  value_usd INTEGER,
  duration TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  stages TEXT NOT NULL,
  requirements TEXT NOT NULL,
  how_to_apply TEXT NOT NULL,
  apply_url TEXT NOT NULL,
  website TEXT NOT NULL,
  tags TEXT NOT NULL,
  notes TEXT,
  updated TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_status TEXT NOT NULL DEFAULT 'unreviewed',
  relevant_yes INTEGER NOT NULL DEFAULT 0,
  relevant_no INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL REFERENCES credits(slug),
  kind TEXT NOT NULL CHECK (kind IN ('relevant', 'outdated', 'incorrect')),
  message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_hash TEXT
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  program TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  details TEXT NOT NULL,
  submitter TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS feedback_slug_idx ON feedback(slug);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions(status);
