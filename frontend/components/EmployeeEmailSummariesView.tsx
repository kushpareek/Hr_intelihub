import React, { useState, useCallback } from 'react';
import { SummarizedEmail } from '../types';
import { summarizeAndCategorizeEmail } from '../services/geminiService';
import { MOCK_RAW_EMAILS } from '../constants';
import { EnvelopeIcon, SparklesIcon, LoadingSpinner } from './common/IconComponents';

const SentimentBadge: React.FC<{ sentiment?: 'Positive' | 'Negative' | 'Neutral' }> = ({ sentiment }) => {
  if (!sentiment) return null;
  let colorClasses = '';
  switch (sentiment) {
    case 'Positive':
      colorClasses = 'bg-green-100 text-green-800';
      break;
    case 'Negative':
      colorClasses = 'bg-red-100 text-red-800';
      break;
    case 'Neutral':
      colorClasses = 'bg-blue-100 text-blue-800';
      break;
    default:
      colorClasses = 'bg-gray-100 text-gray-800';
  }
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses}`}>{sentiment}</span>;
};

const CategoryBadge: React.FC<{ category?: string }> = ({ category }) => {
  if (!category) return null;
   let colorClasses = 'bg-indigo-100 text-indigo-800';
   if (category === 'Error' || category === 'Processing Error') {
    colorClasses = 'bg-orange-100 text-orange-800';
   }
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses}`}>{category}</span>;
};


const EmployeeEmailSummariesView: React.FC = () => {
  const [summarizedEmails, setSummarizedEmails] = useState<SummarizedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedEmailIds, setProcessedEmailIds] = useState<Set<string>>(new Set());


  const handleFetchAndSummarize = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const newEmailsToProcess = MOCK_RAW_EMAILS.filter(email => !processedEmailIds.has(email.id)).slice(0, 2); // Process 2 new emails at a time

    if (newEmailsToProcess.length === 0) {
        setError("No new emails to process from the mock data or API_KEY is missing.");
        setIsLoading(false);
        return;
    }
    
    const newSummaries: SummarizedEmail[] = [];
    const currentProcessedIds = new Set(processedEmailIds);

    for (const rawEmail of newEmailsToProcess) {
      try {
        const result = await summarizeAndCategorizeEmail(rawEmail.body, rawEmail.sender, rawEmail.subject);
        if (result.error && result.error.includes("API Key not configured")) {
             setError("Gemini API Key not configured. Please set the API_KEY environment variable.");
             setIsLoading(false);
             return; // Stop processing if API key is missing
        }
        newSummaries.push({
          id: rawEmail.id,
          originalSender: rawEmail.sender,
          originalSubject: rawEmail.subject,
          receivedDate: rawEmail.receivedDate,
          summary: result.summary,
          aiSentiment: result.sentiment,
          aiCategory: result.category,
        });
        currentProcessedIds.add(rawEmail.id);
      } catch (e) {
        console.error(`Failed to process email ${rawEmail.id}:`, e);
        // Add a placeholder for failed summaries if needed, or just skip
         newSummaries.push({
          id: rawEmail.id,
          originalSender: rawEmail.sender,
          originalSubject: rawEmail.subject,
          receivedDate: rawEmail.receivedDate,
          summary: "Failed to process this email.",
          aiSentiment: 'Neutral',
          aiCategory: 'Processing Error',
        });
        currentProcessedIds.add(rawEmail.id); // Mark as processed even if failed to avoid retrying indefinitely
      }
    }
    
    setSummarizedEmails(prev => [...newSummaries, ...prev]); // Add new summaries to the top
    setProcessedEmailIds(currentProcessedIds);
    setIsLoading(false);
    if (newSummaries.some(s => s.aiCategory === 'Error' || s.aiCategory === 'Processing Error')) {
        setError("Some emails could not be processed fully by the AI. Check console for details.");
    }

  }, [processedEmailIds]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <EnvelopeIcon className="w-7 h-7 mr-2 text-blue-600" />
          Employee Email Summaries
        </h2>
        <button
          onClick={handleFetchAndSummarize}
          disabled={isLoading || MOCK_RAW_EMAILS.filter(email => !processedEmailIds.has(email.id)).length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <LoadingSpinner size={5} />
          ) : (
            <SparklesIcon className="w-4 h-4 mr-1.5" />
          )}
          Fetch & Summarize New Emails (Simulated)
        </button>
      </div>

      {error && <p className="text-red-500 bg-red-50 p-3 rounded-md mb-4 text-sm">{error}</p>}

      {summarizedEmails.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 py-10">
          No email summaries available. Click 'Fetch & Summarize' to process emails.
        </p>
      )}

      <div className="space-y-4">
        {summarizedEmails.map((email) => (
          <div key={email.id} className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-500">
                  From: <span className="font-medium text-gray-700">{email.originalSender}</span>
                </p>
                <h3 className="text-md font-semibold text-gray-800">{email.originalSubject}</h3>
              </div>
              <p className="text-xs text-gray-400 whitespace-nowrap">{email.receivedDate.toLocaleDateString()}</p>
            </div>
            
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">{email.summary}</p>
            
            <div className="flex items-center space-x-2">
              <SentimentBadge sentiment={email.aiSentiment} />
              <CategoryBadge category={email.aiCategory} />
            </div>
          </div>
        ))}
      </div>
       {MOCK_RAW_EMAILS.filter(email => !processedEmailIds.has(email.id)).length === 0 && summarizedEmails.length > 0 && !isLoading && (
         <p className="text-center text-gray-500 py-6 text-sm">All mock emails have been processed.</p>
       )}
    </div>
  );
};

export default EmployeeEmailSummariesView;