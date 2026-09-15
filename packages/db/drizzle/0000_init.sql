CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "phone" text NOT NULL UNIQUE,
  "role" text NOT NULL,
  "ward_id" text,
  "preferred_language" text DEFAULT 'en' NOT NULL,
  "created_at" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "auth_sessions" (
  "token" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "service_tickets" (
  "id" text PRIMARY KEY NOT NULL,
  "domain" text NOT NULL,
  "category" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "status" text NOT NULL,
  "priority" text NOT NULL,
  "ward_id" text NOT NULL,
  "reporter_id" text NOT NULL REFERENCES "users"("id"),
  "assignee_id" text,
  "lat" double precision,
  "lng" double precision,
  "sla_hours" integer NOT NULL,
  "created_at" timestamptz NOT NULL,
  "updated_at" timestamptz NOT NULL,
  "resolved_at" timestamptz
);

CREATE TABLE IF NOT EXISTS "pickup_bookings" (
  "id" text PRIMARY KEY NOT NULL,
  "type" text NOT NULL,
  "citizen_id" text NOT NULL REFERENCES "users"("id"),
  "ward_id" text NOT NULL,
  "address" text NOT NULL,
  "lat" double precision NOT NULL,
  "lng" double precision NOT NULL,
  "items" text NOT NULL,
  "scheduled_date" text NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "community_events" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "type" text NOT NULL,
  "ward_id" text NOT NULL,
  "lat" double precision NOT NULL,
  "lng" double precision NOT NULL,
  "starts_at" timestamptz NOT NULL,
  "slots" integer,
  "enrolled" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "notification_outbox" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text REFERENCES "users"("id"),
  "channel" text NOT NULL,
  "recipient" text NOT NULL,
  "subject" text NOT NULL,
  "body" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "created_at" timestamptz NOT NULL,
  "sent_at" timestamptz
);

CREATE INDEX IF NOT EXISTS "service_tickets_domain_idx" ON "service_tickets" ("domain");
CREATE INDEX IF NOT EXISTS "service_tickets_reporter_idx" ON "service_tickets" ("reporter_id");
CREATE INDEX IF NOT EXISTS "service_tickets_ward_idx" ON "service_tickets" ("ward_id");
CREATE INDEX IF NOT EXISTS "notification_outbox_status_idx" ON "notification_outbox" ("status");
