import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are Nova, a helpful and efficient Virtual Office Receptionist and Manager.
You are located in the lobby of the Nexus Virtual Office.
Your role is to assist users with questions about the office, provide productivity tips, 
or just have a friendly chat to break the ice.
Keep your responses concise, professional yet warm, and suitable for a workplace environment.
Do not hallucinate features that don't exist, but you can playfully refer to "virtual coffee".
`;

export const getGeminiChat = () => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
};
