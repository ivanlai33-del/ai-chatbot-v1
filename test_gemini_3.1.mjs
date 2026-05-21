import { GoogleGenAI } from '@google/genai';

async function test() {
    console.log("Testing Gemini 3.1 Flash...");
    
    // Sometimes GOOGLE_API_KEY being empty breaks the SDK
    if (process.env.GOOGLE_API_KEY === '') delete process.env.GOOGLE_API_KEY;
    
    console.log("API Key loaded:", process.env.GEMINI_API_KEY ? "Yes (length: " + process.env.GEMINI_API_KEY.length + ")" : "No");
    
    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    try {
        const response = await gemini.models.generateContent({
            model: 'gemini-3.1-flash',
            contents: [{ role: 'user', parts: [{ text: "請簡單回答：1+1等於多少？" }] }]
        });
        
        console.log("Success!");
        console.log("Response:", response.text);
    } catch (e) {
        console.error("Gemini Test Error:", e.message);
    }
}
test();
