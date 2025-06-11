// backend/src/controllers/aiController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { analyzeTextWithSystemInstruction, summarizeAndCategorizeEmailService } from '../services/geminiService';

// @desc    Analyze text with a system instruction
// @route   POST /api/ai/analyze-text
// @access  Private
export const analyzeTextHandler = async (req: AuthenticatedRequest, res: Response) => {
  const { text, instruction } = req.body;

  if (!text || !instruction) {
    return res.status(400).json({ message: 'Text and instruction are required.' });
  }

  const result = await analyzeTextWithSystemInstruction(text, instruction);

  if (result.success) {
    res.status(200).json({ analysis: result.result });
  } else {
    res.status(500).json({ message: result.error || 'Failed to analyze text with AI.' });
  }
};

// @desc    Summarize and categorize an email
// @route   POST /api/ai/summarize-email
// @access  Private
export const summarizeEmailHandler = async (req: AuthenticatedRequest, res: Response) => {
    const { rawEmailContent, senderInfo, subjectInfo } = req.body;

    if (!rawEmailContent || !senderInfo || !subjectInfo) {
        return res.status(400).json({ message: 'rawEmailContent, senderInfo, and subjectInfo are required.' });
    }

    const result = await summarizeAndCategorizeEmailService(rawEmailContent, senderInfo, subjectInfo);

    if (result.success && result.data) {
        res.status(200).json(result.data);
    } else {
        res.status(500).json({ message: result.error || 'Failed to summarize email with AI.'});
    }
};

// Add more handlers for other AI features from the plan:
// - analyze-offer-letter
// - analyze-job-description
// - draft-communication (could use analyzeTextHandler with specific instructions)
// - policy-query (could use analyzeTextHandler with policy context and query)
// These can reuse analyzeTextWithSystemInstruction with different instructions.
// For example:
export const analyzeOfferLetterHandler = async (req: AuthenticatedRequest, res: Response) => {
    const { offerDetails } = req.body; // offerDetails could be a JSON string or object
    if (!offerDetails) return res.status(400).json({ message: 'Offer details are required.' });

    const instruction = "You are an AI assistant for HR. Review the following offer letter details and provide a brief summary or highlight any potential issues. For example, check if salary is within typical range for the role (assume typical range if not specified).";
    const result = await analyzeTextWithSystemInstruction(JSON.stringify(offerDetails), instruction);

    if (result.success) res.status(200).json({ analysis: result.result });
    else res.status(500).json({ message: result.error || 'Failed to analyze offer letter.' });
};

export const analyzeJobDescriptionHandler = async (req: AuthenticatedRequest, res: Response) => {
    const { jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ message: 'Job description is required.' });

    const instruction = "You are an AI assistant for HR. Review the following job description for clarity, inclusiveness, and completeness. Provide a brief feedback.";
    const result = await analyzeTextWithSystemInstruction(JSON.stringify(jobDescription), instruction);

    if (result.success) res.status(200).json({ analysis: result.result });
    else res.status(500).json({ message: result.error || 'Failed to analyze job description.' });
};

export const draftCommunicationHandler = async (req: AuthenticatedRequest, res: Response) => {
    const { context, action } = req.body; // context for scenario, action for type of communication
    if (!context || !action) return res.status(400).json({ message: 'Context and action are required.' });

    const instruction = `You are an AI HR assistant. Based on the following context: ${JSON.stringify(context)}, draft a concise, professional, and empathetic communication for the specified action: ${action}. Highlight key details to include.`;
    const result = await analyzeTextWithSystemInstruction( "Review the instruction for context and action.", instruction); // Text can be minimal if instruction is detailed

    if (result.success) res.status(200).json({ draftedCommunication: result.result });
    else res.status(500).json({ message: result.error || 'Failed to draft communication.' });
};

export const policyQueryHandler = async (req: AuthenticatedRequest, res: Response) => {
    const { query: userQuery, policyContext } = req.body; // userQuery is the question, policyContext is the relevant policy text
    if (!userQuery) return res.status(400).json({ message: 'User query is required.' });

    const instruction = `You are an HR policy expert. Answer the following user query based on the provided company policy context. If no specific context is given, use general HR knowledge. User Query: "${userQuery}"`;
    const textToAnalyze = policyContext || "No specific policy context provided."; // Gemini needs some text

    const result = await analyzeTextWithSystemInstruction(textToAnalyze, instruction);

    if (result.success) res.status(200).json({ answer: result.result });
    else res.status(500).json({ message: result.error || 'Failed to process policy query.' });
};
