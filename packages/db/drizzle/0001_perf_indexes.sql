CREATE INDEX IF NOT EXISTS "service_tickets_status_idx" ON "service_tickets" ("status");
CREATE INDEX IF NOT EXISTS "service_tickets_created_at_idx" ON "service_tickets" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "service_tickets_domain_status_idx" ON "service_tickets" ("domain", "status");
CREATE INDEX IF NOT EXISTS "auth_sessions_user_idx" ON "auth_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "auth_sessions_expires_idx" ON "auth_sessions" ("expires_at");
