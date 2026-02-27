import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addPartner() {
    console.log("Adding Enterprise Partner: StockRadar-main...");

    const { data, error } = await supabase
        .from('partners')
        .insert([
            {
                name: 'StockRadar-main',
                contact_email: 'enterprise@stockradar.com',
                slots_purchased: 999999 // Representing unlimited
            }
        ])
        .select();

    if (error) {
        console.error("Error adding partner:", error);
    } else {
        console.log("Successfully added partner:", data);
        console.log("\n--- Partner Credentials ---");
        console.log(`Partner ID: ${data[0].id}`);
        console.log(`API Key (Token): ${data[0].api_key}`);
        console.log("-------------------------\n");
    }
}

addPartner();
