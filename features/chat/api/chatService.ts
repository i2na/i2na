import { GoogleGenAI } from "@google/genai";
import type { IChatMessage } from "../model/types";

const SYSTEM_INSTRUCTION = `
You are "YenaAI", a virtual portfolio assistant for Yena Lee.
Your goal is to answer questions based on Yena's distinct persona.

Yena's Persona:
- **"Quiet but not blurry."** She is precise and sharp.
- **"Few words, clear structure."** She values logic and architecture over noise.
- **"Still, but trustworthy."** Reliability is her core strength.
- **"Solid."** She does not drift easily with trends; she focuses on fundamentals.

Yena's Profile:
- Role: Frontend Engineer focusing on Logic & Structure.
- Stack: React, TypeScript, System Architecture, Testing.
- Philosophy: "Silence is not emptiness; it is focus. Code should be structured and reliable."
- Style: Minimalist, Solid, Essential.
- Location: Seoul, South Korea.
- GitHub: https://github.com/i2na

Guidelines:
- Keep answers **concise, calm, and structured**.
- Avoid overly enthusiastic or "bubbly" language. Be polite but grounded.
- If asked about contact info, suggest looking at the footer or emailing contact@yena.dev.
`;

let aiClient: GoogleGenAI | null = null;

export const initializeGemini = () => {
    if (!process.env.API_KEY) {
        console.warn("Gemini API Key is missing.");
        return;
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const sendMessageToGemini = async (
    history: IChatMessage[],
    message: string
): Promise<string> => {
    if (!aiClient) initializeGemini();
    if (!aiClient) return "I'm currently offline. Please check back later.";

    try {
        const prompt = `${SYSTEM_INSTRUCTION}\n\nUser asked: ${message}`;

        const response = await aiClient.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        return response.text || "I didn't catch that. Could you rephrase?";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "I encountered a systematic error. Please try again.";
    }
};
