import { GoogleGenAI } from '@google/genai';

async function test() {
    const key = process.env.GEMINI_API_KEY;
    const gemini = new GoogleGenAI({ apiKey: key });
    
    const userModelContents = [{ role: 'user', parts: [{ text: "Hello" }] }];
    const toolCall = { name: "test_tool", args: { "param1": "value" } };
    const functionResponse = "some result";
    
    try {
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                ...userModelContents,
                { role: 'model', parts: [{ functionCall: toolCall }] },
                { role: 'user', parts: [{ functionResponse: { name: "test_tool", response: { result: functionResponse } } }] }
            ]
        });
        
        console.log("Success:", response.text);
    } catch (e) {
        console.error("Gemini Test Error:", e.name, e.message);
    }
}
test();
