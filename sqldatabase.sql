CREATE EXTENSION IF NOT EXISTS "pgcrypto"; 

CREATE TYPE event_category AS ENUM (
  'public_holiday',
  'employee_birthday',
  'work_anniversary',
  'client_meeting',
  'team_meeting',
  'project_deadline',
  'leave',
  'interview',
  'company_event'
);

CREATE TYPE calendar_provider AS ENUM ('google', 'outlook');

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              VARCHAR(255) NOT NULL,
  description        TEXT,
  category           event_category NOT NULL,
  start_time         TIMESTAMPTZ NOT NULL,
  end_time           TIMESTAMPTZ,
  all_day            BOOLEAN NOT NULL DEFAULT false,
  location           VARCHAR(255),
  is_recurring       BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule    VARCHAR(255),          
  metadata           JSONB NOT NULL DEFAULT '{}'::jsonb, 
  created_by         UUID REFERENCES users(id) ON DELETE SET NULL,
  external_provider  calendar_provider,     
  external_event_id  VARCHAR(255),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time IS NULL OR end_time >= start_time)
);

CREATE INDEX IF NOT EXISTS idx_events_category   ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);


CREATE UNIQUE INDEX IF NOT EXISTS idx_events_external_unique
  ON events(external_provider, external_event_id)
  WHERE external_event_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS calendar_integrations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider              calendar_provider NOT NULL,
  access_token          TEXT NOT NULL,
  refresh_token         TEXT,
  token_expires_at      TIMESTAMPTZ,
  external_calendar_id  VARCHAR(255),
  connected_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);


CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_events_updated_at ON events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
