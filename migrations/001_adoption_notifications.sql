-- Migration 001: Adoption Outcome Notifications System
-- Creates tables for tracking adoption applications and sending outcome notifications

-- Track adoption applications per animal
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form_id INTEGER NOT NULL,
  animal_id TEXT NOT NULL,
  animal_name TEXT,
  species TEXT,
  applicant_email TEXT NOT NULL, -- stored lowercased
  applicant_phone TEXT,
  sendgrid_contact_id TEXT,
  source_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  superseded_at TEXT
);

-- Unique constraint for active applications (only one per email+animal)
CREATE UNIQUE INDEX IF NOT EXISTS ux_applications_active
  ON applications (animal_id, applicant_email)
  WHERE superseded_at IS NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_applications_animal_date
  ON applications (animal_id, created_at);

-- Track adoption events from ASM
CREATE TABLE IF NOT EXISTS adoption_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  adoption_key TEXT NOT NULL UNIQUE,
  animal_id TEXT NOT NULL,
  animal_name TEXT,
  species TEXT,
  adoption_date TEXT NOT NULL,
  new_owner_email TEXT,
  new_owner_phone TEXT,
  raw JSON,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_adoption_events_date
  ON adoption_events (adoption_date);

-- Track outcome notifications sent
CREATE TABLE IF NOT EXISTS adoption_outcome_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  animal_id TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'congrats' | 'sorry'
  sendgrid_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued', -- queued|sent|failed|suppressed
  error TEXT,
  sent_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Ensure we only send each notification once
CREATE UNIQUE INDEX IF NOT EXISTS ux_notifications_once
  ON adoption_outcome_notifications (animal_id, applicant_email, notification_type);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_notifications_animal
  ON adoption_outcome_notifications (animal_id, status);

-- Track polling state for ASM API
CREATE TABLE IF NOT EXISTS adoption_poll_state (
  id TEXT PRIMARY KEY,
  last_seen_ts TEXT
);

-- Initialize polling state
INSERT OR IGNORE INTO adoption_poll_state (id, last_seen_ts)
VALUES ('recent_adoptions', datetime('now'));

-- Per-animal suppression for special cases
CREATE TABLE IF NOT EXISTS adoption_suppressions (
  animal_id TEXT PRIMARY KEY,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_suppressions_date
  ON adoption_suppressions (created_at);