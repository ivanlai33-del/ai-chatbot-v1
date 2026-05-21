import { GoogleGenAI } from '@google/genai';

async function test() {
    console.log("Testing Gemini 2.5 Flash...");
    
    // Clear conflicting keys if necessary
    if (process.env.GOOGLE_API_KEY === '') delete process.env.GOOGLE_API_KEY;
    
    const key = process.env.GEMINI_API_KEY;
    console.log("API Key loaded:", key ? "Yes (length: " + key.length + ")" : "No");
    
    const gemini = new GoogleGenAI({ apiKey: key });
    
    try {
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: "Hello, what model are you based on?" }] }]
        });
        
        console.log("Success!");
        console.log("Response:", response.text);
    } catch (e) {
        console.error("Gemini Test Error:", e.name, e.message);
        console.error("Details:", e.status, e.errorDetails);
    }
}
test();
