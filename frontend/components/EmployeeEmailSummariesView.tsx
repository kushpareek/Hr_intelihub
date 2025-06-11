// frontend/components/EmployeeEmailSummariesView.tsx
import React, { useState } from 'react';
import { SummarizedEmail } from '../types'; // Assuming SummarizedEmail type
import { apiClient } from '../services/api';
import { EnvelopeIcon, SparklesIcon, LoadingSpinner } from './common/IconComponents';

const EmployeeEmailSummariesView: React.FC = () => {
  const [rawEmail, setRawEmail] = useState('');
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [summaries, setSummaries] = useState<SummarizedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarizeEmail = async () => {
    if (!rawEmail.trim() || !sender.trim() || !subject.trim()) {
      setError("Please provide sender, subject, and email content to summarize.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient<{ summary: string; sentiment: 'Positive' | 'Negative' | 'Neutral'; category: string; }>(
        '/ai/summarize-email',
        'POST',
        { rawEmailContent: rawEmail, senderInfo: sender, subjectInfo: subject }
      );

      const newSummary: SummarizedEmail = {
        id: `summary-${Date.now()}`, // Frontend generated ID for display
        originalSender: sender,
        originalSubject: subject,
        receivedDate: new Date(), // Or extract from email if possible
        summary: result.summary,
        aiSentiment: result.sentiment,
        aiCategory: result.category,
      };
      setSummaries(prev => [newSummary, ...prev]); // Add to top
      setRawEmail(''); setSender(''); setSubject(''); // Clear form
    } catch (err: any) {
      console.error("Error summarizing email:", err);
      setError(err.message || "Failed to summarize email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <EnvelopeIcon className="w-7 h-7 mr-2 text-sky-600" /> Employee Email Summaries (AI)
      </h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="mb-6 p-4 border border-sky-200 bg-sky-50 rounded-md">
        <h3 className="text-lg font-semibold text-sky-700 mb-2">Summarize New Email</h3>
        <input
            type="text"
            placeholder="Sender (e.g., john.doe@example.com)"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="w-full p-2 border rounded mb-2"
        />
        <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 border rounded mb-2"
        />
        <textarea
          value={rawEmail}
          onChange={(e) => setRawEmail(e.target.value)}
          placeholder="Paste full email content here..."
          rows={8}
          className="w-full p-2 border rounded mb-3"
        />
        <button
          onClick={handleSummarizeEmail}
          disabled={isLoading}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition flex items-center"
        >
          {isLoading ? <LoadingSpinner size={5}/> : <SparklesIcon className="w-5 h-5 mr-2"/>}
          Summarize with AI
        </button>
      </div>

      <h3 className="text-xl font-medium text-gray-700 mb-4">Recent Summaries</h3>
      {summaries.length === 0 && !isLoading && (
        <p className="text-gray-500 text-center py-4">No summaries yet. Paste an email above to get started.</p>
      )}
      <div className="space-y-4">
        {summaries.map((s) => (
          <div key={s.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gray-50">
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-gray-700">{s.originalSubject}</h4>
                <span className="text-xs text-gray-500">{s.receivedDate.toLocaleDateString()}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">From: {s.originalSender}</p>
            <p className="text-sm text-gray-600 mb-2">{s.summary}</p>
            <div className="flex space-x-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full ${
                    s.aiSentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                    s.aiSentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'}`}>
                    Sentiment: {s.aiSentiment}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    Category: {s.aiCategory}
                </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeEmailSummariesView;