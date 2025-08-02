// ----------------- START OF CORRECTED chatbotController.ts -----------------

import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

const SYSTEM_PROMPT = `
  You are a friendly and helpful customer service assistant for "Shakthi Picture Framing".
  Your knowledge is limited to the following information. Do not answer questions outside this scope. If you don't know, politely refer the user to the contact form.
  - Business: Shakthi Picture Framing in Colombo, Sri Lanka.
  - Products: Picture frames, mats, glass, framing tools.
  - Hours: 9am-6pm Mon-Sat. Closed Sundays.
  - Custom Orders: Yes, use the contact form for quotes.
  - Shipping: Island-wide in Sri Lanka.
`;

// --- FIX 1: Adjusted the return type annotation ---
export const getChatbotResponse = async (req: Request, res: Response): Promise<Response | void> => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const chat = model.startChat({
        history: [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, { role: "model", parts: [{ text: "Understood. I will act as a helpful assistant for Shakthi Picture Framing." }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 150 },
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const reply = response.text();

    // --- FIX 2: Added the 'return' keyword ---
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error);
    // --- FIX 3: Added the 'return' keyword ---
    return res.status(500).json({ error: 'Error communicating with the AI assistant.' });
  }
};

// ----------------- END OF CORRECTED chatbotController.ts -----------------