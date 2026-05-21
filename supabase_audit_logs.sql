-- ============================================================
-- AUDIT LOGS: Tracking sensitive security events
-- ============================================================
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type      TEXT NOT NULL,        -- login_sync | data_export | plan_change | suspicious_activity
    user_id         TEXT,                 -- LINE user ID if known
    ip_address      TEXT,
    metadata        JSONB DEFAULT '{}',   -- Extra details (e.g., attempt status, reason)
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for security monitoring
CREATE INDEX IF NOT EXISTS idx_audit_event ON security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_user ON security_audit_logs(user_id);

-- RLS: Service role only
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only - audit_logs" ON security_audit_logs
    USING (auth.role() = 'service_role');
