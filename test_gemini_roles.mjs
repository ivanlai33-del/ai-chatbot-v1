import { GoogleGenAI } from '@google/genai';

async function test() {
    const key = process.env.GEMINI_API_KEY;
    const gemini = new GoogleGenAI({ apiKey: key });
    
    try {
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: "Hello" }] },
                { role: 'user', parts: [{ text: "How are you?" }] }
            ]
        });
        
        console.log("Success!");
    } catch (e) {
        console.error("Gemini Test Error:", e.name, e.message);
    }
}
test();
