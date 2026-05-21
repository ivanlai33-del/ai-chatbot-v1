import { GoogleGenAI } from '@google/genai';

async function list() {
    const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await gemini.models.list();
    for (const model of response) {
        if (model.name.includes("flash")) {
            console.log(model.name);
        }
    }
}
list();
