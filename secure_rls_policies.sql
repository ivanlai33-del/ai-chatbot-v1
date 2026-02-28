-- Secure SaaS Row Level Security (RLS) Policies
-- This script replaces the permissive "Allow public read for demo" policies with strict tenant isolation.

-- 1. Secure Bots Table
-- Partners can only see/manage their own bots
DROP POLICY IF EXISTS "Allow public read for demo" ON bots;
CREATE POLICY "Partners can manage own bots" ON bots
    FOR ALL
    USING (auth.uid()::uuid = partner_id); -- Assumes JWT contains partner_id as uid, or use service_role for backend

-- 2. Secure Chat Logs
-- Isolation: Logs are only accessible to the bot owner or the SaaS partner
DROP POLICY IF EXISTS "Allow public read for demo logs" ON chat_logs;
CREATE POLICY "Bot Owners can read own logs" ON chat_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bots 
            WHERE bots.id = chat_logs.bot_id 
            AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)
        )
    );

-- 3. Secure FAQ Table
DROP POLICY IF EXISTS "Allow public read for demo faq" ON faq;
CREATE POLICY "Bots isolate FAQ access" ON faq
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM bots 
            WHERE bots.id = faq.bot_id 
            AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)
        )
    );

-- 4. Secure Products Table
DROP POLICY IF EXISTS "Allow public read for demo products" ON products;
CREATE POLICY "Bots isolate Products access" ON products
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM bots 
            WHERE bots.id = products.bot_id 
            AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)
        )
    );

-- 5. Secure Orders Table
DROP POLICY IF EXISTS "Allow public read for demo orders" ON orders;
CREATE POLICY "Bots isolate Orders access" ON orders
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM bots 
            WHERE bots.id = orders.bot_id 
            AND (bots.owner_line_id = auth.jwt()->>'line_user_id' OR bots.partner_id = auth.uid()::uuid)
        )
    );

-- Note: In our current architecture, the Next.js backend uses the SUPABASE_SERVICE_ROLE_KEY 
-- which bypasses RLS entirely for server-side logic (`/api/webhook`). 
-- However, enabling strict RLS here is crucial as a defense-in-depth measure 
-- in case the client-side Supabase keys (`anon_key`) are ever used in the frontend UI.
