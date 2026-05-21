import { GoogleGenAI } from '@google/genai';

async function test() {
    process.env.GOOGLE_API_KEY = "dummy_google_key";
    process.env.GEMINI_API_KEY = "dummy_gemini_key";
    
    // Create with GEMINI_API_KEY
    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("Initialized SDK");
}
test();
