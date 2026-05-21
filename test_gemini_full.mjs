import { GoogleGenAI } from '@google/genai';

async function test() {
    const key = process.env.GEMINI_API_KEY;
    const gemini = new GoogleGenAI({ apiKey: key });
    
    const sysMsg = "You are a helpful assistant.";
    const userModelContents = [{ role: 'user', parts: [{ text: "Hello" }] }];
    const geminiTools = [{
        functionDeclarations: [
            {
                name: "test_tool",
                description: "A test tool",
                parameters: {
                    type: "object",
                    properties: {
                        param1: { type: "string" }
                    }
                }
            }
        ]
    }];
    
    try {
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userModelContents,
            config: {
                systemInstruction: sysMsg,
                tools: geminiTools
            }
        });
        console.log("Success:", response.text);
    } catch (e) {
        console.error("Gemini Test Error:", e.name, e.message);
    }
}
test();
