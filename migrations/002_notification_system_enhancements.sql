-- Migration 002: Notification System Enhancements
-- Adds support for testing modes and extensible notification types

-- Add testing support to adoption_outcome_notifications
ALTER TABLE adoption_outcome_notifications ADD COLUMN test_mode INTEGER DEFAULT 0;
ALTER TABLE adoption_outcome_notifications ADD COLUMN original_recipient TEXT;

-- Create extensible notification system for future use
CREATE TABLE IF NOT EXISTS notification_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notification_type TEXT NOT NULL UNIQUE, -- 'adoption_outcome', 'foster_outcome', 'volunteer_followup', etc.
  display_name TEXT NOT NULL,
  description TEXT,
  enabled INTEGER DEFAULT 1,
  test_mode INTEGER DEFAULT 0,
  delay_hours INTEGER DEFAULT 12,
  template_success_id TEXT,
  template_failure_id TEXT,
  template_general_id TEXT,
  asm_trigger_field TEXT, -- ASM field to monitor for changes (testing)
  asm_api_method TEXT,     -- ASM API method to poll
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Insert adoption outcome configuration
INSERT OR REPLACE INTO notification_configs (
  notification_type,
  display_name,
  description,
  enabled,
  test_mode,
  delay_hours,
  asm_trigger_field,
  asm_api_method
) VALUES (
  'adoption_outcome',
  'Adoption Outcome Notifications',
  'Sends congratulations to successful adopters and sorry messages to others',
  1,
  0,
  12,
  'HEALTHPROBLEMS', -- Use this field for manual testing triggers
  'json_recent_adoptions'
);

-- Create generic events table for extensible system
CREATE TABLE IF NOT EXISTS notification_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_key TEXT NOT NULL UNIQUE,
  notification_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,      -- animal_id, person_id, etc.
  entity_name TEXT,
  event_date TEXT NOT NULL,
  event_data JSON,              -- Store all event details
  processed INTEGER DEFAULT 0,
  test_mode INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_notification_events_type_processed
  ON notification_events (notification_type, processed, event_date);

-- Create generic applications table for extensible system
CREATE TABLE IF NOT EXISTS notification_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_key TEXT NOT NULL UNIQUE,
  notification_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,      -- animal_id, opportunity_id, etc.
  applicant_email TEXT NOT NULL,
  applicant_data JSON,          -- Store all applicant details
  form_id INTEGER,
  submitted_at TEXT NOT NULL,
  superseded_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Unique constraint for active applications
CREATE UNIQUE INDEX IF NOT EXISTS ux_notification_applications_active
  ON notification_applications (notification_type, entity_id, applicant_email)
  WHERE superseded_at IS NULL;

-- Create generic notifications table
CREATE TABLE IF NOT EXISTS notification_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notification_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  original_recipient TEXT,      -- For test mode
  message_type TEXT NOT NULL,   -- 'success', 'failure', 'general'
  template_id TEXT,
  template_data JSON,
  sendgrid_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued', -- queued|sent|failed|suppressed
  test_mode INTEGER DEFAULT 0,
  error TEXT,
  sent_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Ensure we only send each notification once
CREATE UNIQUE INDEX IF NOT EXISTS ux_notification_queue_once
  ON notification_queue (notification_type, entity_id, recipient_email, message_type, test_mode);

-- Add test mode tracking to poll state
CREATE TABLE IF NOT EXISTS notification_poll_state (
  id TEXT PRIMARY KEY,          -- 'adoption_outcome', 'foster_outcome', etc.
  notification_type TEXT NOT NULL,
  last_seen_ts TEXT,
  test_mode INTEGER DEFAULT 0,
  last_test_trigger TEXT,       -- Track last test trigger value
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Initialize adoption outcome polling state
INSERT OR REPLACE INTO notification_poll_state (id, notification_type, last_seen_ts, test_mode)
VALUES ('adoption_outcome', 'adoption_outcome', datetime('now'), 0);

-- Add test mode support to suppressions
ALTER TABLE adoption_suppressions ADD COLUMN notification_type TEXT DEFAULT 'adoption_outcome';
ALTER TABLE adoption_suppressions ADD COLUMN test_mode INTEGER DEFAULT 0;

-- Update unique constraint for suppressions
DROP INDEX IF EXISTS idx_suppressions_date;
CREATE UNIQUE INDEX IF NOT EXISTS ux_suppressions_entity_type
  ON adoption_suppressions (animal_id, notification_type);

CREATE INDEX IF NOT EXISTS idx_suppressions_type_date
  ON adoption_suppressions (notification_type, created_at);