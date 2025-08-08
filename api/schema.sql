CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  vector_id TEXT,
  created INTEGER DEFAULT (unixepoch())
);

-- Indexes can be added later as needed
