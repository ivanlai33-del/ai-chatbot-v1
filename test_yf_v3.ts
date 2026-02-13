import OpenAI from 'openai';
import yahooFinance from 'yahoo-finance2';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testV3() {
    console.log("🚀 Testing yahoo-finance2 v3 instantiation...");
    try {
        console.log("Attempt 1: Direct call...");
        const quote = await yahooFinance.quote('2330.TW');
        console.log("✅ Attempt 1 success!");
    } catch (err: any) {
        console.log("❌ Attempt 1 failed:", err.message);

        try {
            console.log("Attempt 2: new (yahooFinance as any).constructor()...");
            // @ts-ignore
            const yf = new yahooFinance.constructor();
            const quote = await yf.quote('2330.TW');
            console.log("✅ Attempt 2 success!");
        } catch (err2: any) {
            console.log("❌ Attempt 2 failed:", err2.message);
        }
    }
}

testV3();
