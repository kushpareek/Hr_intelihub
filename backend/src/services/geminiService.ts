// backend/src/services/geminiService.ts
import { GoogleGenerativeAI, GenerateContentResponse, GenerationConfig, Content } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_MODEL_TEXT = "gemini-pro"; // Or your preferred model
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("FATAL ERROR: GEMINI_API_KEY environment variable not set for backend Gemini Service.");
  // Decide if to throw an error or let it fail on first use
  // For critical service, exiting might be an option: process.exit(1);
}

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
} else {
    console.warn("Gemini Service initialized without API key. AI features will not work.");
}

export const analyzeTextWithSystemInstruction = async (
  text: string,
  systemInstruction: string
): Promise<{success: boolean, result?: string, error?: string}> => {
  if (!genAI) {
    return { success: false, error: "Gemini AI Service not initialized (API key missing)." };
  }
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_TEXT });
    const generationConfig: GenerationConfig = {
      // temperature: 0.9, // Example, adjust as needed
      // topK: 1,
      // topP: 1,
      // maxOutputTokens: 2048, // Example
    };

    const contents: Content[] = [{ role: "user", parts: [{ text }] }];

    const result = await model.generateContent({
        contents: contents,
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
        generationConfig: generationConfig
    });

    const response = result.response;
    return { success: true, result: response.text() };

  } catch (error: any) {
    console.error("Error calling Gemini API with system instruction:", error);
    return { success: false, error: error.message || "An unknown error occurred while interacting with the AI."};
  }
};

export const summarizeAndCategorizeEmailService = async (
  rawEmailContent: string,
  senderInfo: string,
  subjectInfo: string
): Promise<{success: boolean, data?: { summary: string; sentiment: 'Positive' | 'Negative' | 'Neutral'; category: string; }, error?: string}> => {
  if (!genAI) {
     return { success: false, error: "Gemini AI Service not initialized (API key missing)." };
  }

  const systemInstruction = `You are an expert HR assistant AI. Analyze the following employee email.
    Provide a concise summary (2-3 sentences).
    Determine the overall sentiment (must be one of: Positive, Negative, or Neutral).
    Categorize the email's main topic (e.g., Leave Request, Benefit Inquiry, Payroll Query, Feedback, Grievance, General Question, Resignation, Technical Issue, Policy Question, Other).
    Respond ONLY with a valid JSON object with keys: "summary", "sentiment", "category". For example: {"summary": "...", "sentiment": "Neutral", "category": "Leave Request"}`;

  const prompt = `Employee Email:
Sender: ${senderInfo}
Subject: ${subjectInfo}

Content:
${rawEmailContent}`;

  try {
    const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL_TEXT,
        // System instruction can also be part of the model params for some configurations
    });

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{text: prompt}]}],
        systemInstruction: { role: "system", parts: [{text: systemInstruction}]},
        generationConfig: { responseMimeType: "application/json" }
    });

    const response = result.response;
    const jsonStr = response.text(); // Gemini should return JSON string directly

    const parsedData = JSON.parse(jsonStr);

    if (typeof parsedData.summary === 'string' &&
        ['Positive', 'Negative', 'Neutral'].includes(parsedData.sentiment) &&
        typeof parsedData.category === 'string') {
      return {
        success: true,
        data: {
            summary: parsedData.summary,
            sentiment: parsedData.sentiment as 'Positive' | 'Negative' | 'Neutral',
            category: parsedData.category,
        }
      };
    } else {
        console.error("Invalid JSON structure from Gemini for email summarization:", parsedData);
        return { success: false, error: "AI response did not match expected JSON structure."};
    }

  } catch (error: any) {
    console.error("Error calling Gemini API for email summarization:", error);
    return { success: false, error: error.message || "An unknown error occurred while summarizing email."};
  }
};
