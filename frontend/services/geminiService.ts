import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';

// Ensure API_KEY is set in the environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY environment variable not set. Gemini Service will not function.");
}
// Initialize the GoogleGenAI client with the API key
// This will intentionally throw an error if apiKey is undefined, which is fine as it's a critical config.
const ai = new GoogleGenAI({ apiKey: apiKey! });

export const askQuery = async (prompt: string, systemInstruction?: string): Promise<string> => {
  if (!apiKey) {
    return "Gemini API Key not configured. Please set the API_KEY environment variable.";
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      ...(systemInstruction && { config: { systemInstruction } }),
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Error interacting with AI: ${error.message}`;
    }
    return "An unknown error occurred while interacting with the AI.";
  }
};

export const analyzeTextWithSystemInstruction = async (text: string, instruction: string): Promise<string> => {
    if (!apiKey) {
    return "Gemini API Key not configured. Please set the API_KEY environment variable.";
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: text,
      config: { systemInstruction: instruction },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API with system instruction:", error);
    if (error instanceof Error) {
        return `Error interacting with AI: ${error.message}`;
    }
    return "An unknown error occurred while interacting with the AI.";
  }
};

// Placeholder for a more complex policy understanding function
export const getPolicyInformation = async (query: string, policyCorpus?: string): Promise<string> => {
  if (!apiKey) {
    return "Gemini API Key not configured.";
  }
  const systemInstruction = `You are an HR policy expert. Answer questions based on the provided company policies. If policies are provided, use them as the primary source. If not, use general knowledge. The user is asking about: ${query}`;
  
  // In a real app, policyCorpus might be fetched dynamically or be a large string
  const fullPrompt = policyCorpus ? `Company Policies:\n${policyCorpus}\n\nUser Query: ${query}` : query;

  return askQuery(fullPrompt, systemInstruction);
};

export const summarizeAndCategorizeEmail = async (
  rawEmailContent: string, 
  senderInfo: string, 
  subjectInfo: string
): Promise<{ summary: string; sentiment: 'Positive' | 'Negative' | 'Neutral'; category: string; error?: string }> => {
  if (!apiKey) {
    return { 
        summary: "Error: Gemini API Key not configured.",
        sentiment: 'Neutral', 
        category: 'Error',
        error: "Gemini API Key not configured. Please set the API_KEY environment variable."
    };
  }

  const systemInstruction = `You are an expert HR assistant AI. Analyze the following employee email.
  Provide a concise summary (2-3 sentences).
  Determine the overall sentiment (must be one of: Positive, Negative, or Neutral).
  Categorize the email's main topic (e.g., Leave Request, Benefit Inquiry, Payroll Query, Feedback, Grievance, General Question, Resignation, Technical Issue, Policy Question, Other).
  Respond ONLY with a valid JSON object with keys: "summary", "sentiment", "category". For example: {"summary": "...", "sentiment": "Neutral", "category": "Leave Request"}`;

  const prompt = `Employee Email:\nSender: ${senderInfo}\nSubject: ${subjectInfo}\n\nContent:\n${rawEmailContent}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { 
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    if (typeof parsedData.summary === 'string' && 
        ['Positive', 'Negative', 'Neutral'].includes(parsedData.sentiment) && 
        typeof parsedData.category === 'string') {
      return {
        summary: parsedData.summary,
        sentiment: parsedData.sentiment as 'Positive' | 'Negative' | 'Neutral',
        category: parsedData.category,
      };
    } else {
        console.error("Invalid JSON structure from Gemini:", parsedData);
        return {
            summary: "AI failed to process the email structure correctly.",
            sentiment: 'Neutral',
            category: 'Processing Error',
            error: "AI response did not match expected JSON structure."
        };
    }

  } catch (error) {
    console.error("Error calling Gemini API for email summarization:", error);
    let errorMessage = "An unknown error occurred while summarizing the email.";
    if (error instanceof Error) {
        errorMessage = `Error interacting with AI: ${error.message}`;
    }
     return {
        summary: `Failed to summarize email. ${errorMessage}`,
        sentiment: 'Neutral',
        category: 'Error',
        error: errorMessage
    };
  }
};