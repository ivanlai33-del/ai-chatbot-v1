-- Add Invoice Management Fields to platform_users
ALTER TABLE platform_users 
ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(20) DEFAULT 'personal', -- 'personal' or 'company'
ADD COLUMN IF NOT EXISTS invoice_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS mailing_address TEXT;

-- Create Invoice History table (optional, but good for tracking each order's specific invoice)
CREATE TABLE IF NOT EXISTS invoice_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    line_user_id TEXT REFERENCES platform_users(line_user_id),
    amount INTEGER NOT NULL,
    plan_name TEXT NOT NULL,
    invoice_number TEXT, -- For manual entry after mailing
    status VARCHAR(20) DEFAULT 'pending', -- 'pending' (待開立), 'sent' (已寄出), 'void' (作廢)
    invoice_type VARCHAR(20),
    invoice_title VARCHAR(255),
    tax_id VARCHAR(20),
    mailing_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS and permissions
ALTER TABLE invoice_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own invoices" ON invoice_records FOR SELECT USING (line_user_id = auth.uid()::text);
