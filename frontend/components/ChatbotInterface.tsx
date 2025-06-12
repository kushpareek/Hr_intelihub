
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Candidate } from '../types'; // Added Candidate
// import { askQuery, getPolicyInformation } from '../services/geminiService'; // Will use apiClient
import { apiClient } from '../services/api'; // Import apiClient
import { LoadingSpinner, PaperAirplaneIcon, SparklesIcon, UserGroupIcon, CogIcon } from './common/IconComponents'; // Replaced UserCircleIcon with UserGroupIcon

interface ChatbotInterfaceProps {
  mode: 'general' | 'policy' | 'candidate'; // Made mode required and added 'candidate'
  policyContext?: string;
  selectedCandidate?: Candidate | null; // Added for candidate mode
}

const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({ mode, policyContext, selectedCandidate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false); // Renamed from isLoading to isLoadingAi
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const getInitialMessage = () => {
    let text = "Hello! I'm your AI HR Assistant. How can I help you today?";
    if (mode === 'policy') {
      text = "I can answer questions about company policies. What would you like to know?";
    } else if (mode === 'candidate' && selectedCandidate) {
      text = `I can help with information regarding ${selectedCandidate.name}. What's your query?`;
    } else if (mode === 'candidate' && !selectedCandidate) {
      text = "Please select a candidate from the list to ask specific questions.";
    }
    return { id: 'initial-ai', sender: 'ai' as 'ai', text, timestamp: new Date() };
  };
  
  useEffect(() => {
    setMessages([getInitialMessage()]);
  }, [mode, selectedCandidate, policyContext]); // Reset/update initial message if mode or context changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoadingAi(true);

    try {
        let aiResponseText = '';
        if (mode === 'policy' && policyContext) {
            const response = await apiClient<{ answer: string }>('/ai/policy-query', 'POST', {
                query: input,
                policyContext: policyContext
            });
            aiResponseText = response.answer;
        } else if (mode === 'candidate' && selectedCandidate) {
            // This mode might need a specific AI endpoint or more complex logic
            // For now, using a generic text analysis or a placeholder
             const response = await apiClient<{ analysis: string }>('/ai/analyze-text', 'POST', {
                text: `User query about candidate ${selectedCandidate.name}: "${input}"`,
                instruction: `You are an AI HR assistant. The user is asking a question about a candidate. Candidate details: ${JSON.stringify(selectedCandidate)}. Answer the user's query based on these details or general knowledge if not found.`
            });
            aiResponseText = response.analysis;
        } else { // General mode
            // Using the generic text analysis endpoint for general queries
            const response = await apiClient<{ analysis: string }>('/ai/analyze-text', 'POST', {
                text: input,
                instruction: "You are a helpful AI HR assistant. Respond to the user's query."
            });
            aiResponseText = response.analysis;
        }

        const newAiMessage: ChatMessage = { id: Date.now().toString() + '-ai', sender: 'ai', text: aiResponseText, timestamp: new Date() };
        setMessages(prev => [...prev, newAiMessage]);

    } catch (error) {
        console.error("Error getting AI response:", error);
        const errorAiMessage: ChatMessage = { id: Date.now().toString() + '-ai', sender: 'ai', text: `Sorry, I encountered an error: ${(error as Error).message}`, timestamp: new Date() };
        setMessages(prev => [...prev, errorAiMessage]);
    } finally {
        setIsLoadingAi(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <SparklesIcon className="w-6 h-6 mr-2 text-blue-600" />
          AI {mode === 'policy' ? 'Policy Advisor' : mode === 'candidate' ? `Candidate Assistant (${selectedCandidate?.name || ''})` : 'HR Assistant'}
        </h2>
      </div>
      <div className="flex-grow p-6 space-y-4 overflow-y-auto bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-end space-x-2 max-w-lg">
                {msg.sender === 'ai' && <CpuChipIcon className="w-7 h-7 text-blue-600 mb-1 opacity-80" />}
                 <div
                  className={`px-4 py-3 rounded-xl shadow ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'} text-right`}>{msg.timestamp.toLocaleTimeString()}</p>
                </div>
                {msg.sender === 'user' && <UserGroupIcon className="w-7 h-7 text-gray-500 mb-1 opacity-80" />} {/* Replaced UserCircleIcon */}
            </div>
          </div>
        ))}
        {isLoadingAi && (
          <div className="flex justify-start">
             <div className="flex items-end space-x-2 max-w-lg">
                <CpuChipIcon className="w-7 h-7 text-blue-600 mb-1 opacity-80" />
                <div className="max-w-xs px-4 py-3 rounded-xl shadow bg-gray-200 text-gray-800">
                  <LoadingSpinner size={5}/>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={mode === 'policy' ? "Ask about company policies..." : mode === 'candidate' ? "Ask about this candidate..." : "Type your HR query..."}
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
            disabled={isLoadingAi}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoadingAi || input.trim() === ''}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoadingAi ? <LoadingSpinner size={5}/> : <PaperAirplaneIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotInterface;
    