import { GoogleGenAI } from '@google/genai';

async function test() {
    console.log("Testing Gemini API fallback...");
    delete process.env.GOOGLE_API_KEY; // Force the SDK to stop using the empty environment variable
    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const geminiTools = [{
        functionDeclarations: [
            {
                name: "query_inventory",
                description: "查詢商品庫存與價格",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        keyword: { type: "STRING" }
                    }
                }
            }
        ]
    }];

    try {
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: "你們有賣什麼水果嗎？" }] }],
            config: { tools: geminiTools }
        });
        
        console.log("Response:", response.text);
        if (response.functionCalls && response.functionCalls.length > 0) {
            console.log("Function Call:", response.functionCalls[0].name);
        }
    } catch (e) {
        console.error("Gemini Test Error:", e.message);
    }
}
test();
