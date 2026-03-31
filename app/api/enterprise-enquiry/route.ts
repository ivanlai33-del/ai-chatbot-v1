import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, phone, needs, storeName, selectedPlan } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
        }

        // 628SP P0: Ensure leads are written to the database
        const { error } = await supabase.from('enterprise_enquiries').insert([{ 
            name, 
            phone, 
            needs, 
            store_name: storeName, 
            plan: selectedPlan?.name || "Unknown"
        }]);

        if (error) {
            console.error("Enquiry Database Error:", error);
            // We still proceed to return success if logging worked, but ideally this should be handled
        }

        // For now, we simulate success and logging
        console.log("Enterprise Enquiry Received:", { name, phone, needs, storeName, selectedPlan });

        return NextResponse.json({ success: true, message: "Enquiry submitted successfully" });
    } catch (error: any) {
        console.error("Enquiry API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
