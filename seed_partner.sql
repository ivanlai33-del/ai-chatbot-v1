INSERT INTO partners (name, contact_email, slots_purchased)
VALUES ('Demo Partner', 'partner@demo.com', 50)
ON CONFLICT DO NOTHING;
