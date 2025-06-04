
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { askQuery, getPolicyInformation } from '../services/geminiService';
import { LoadingSpinner, PaperAirplaneIcon, SparklesIcon } from './common/IconComponents';

interface ChatbotInterfaceProps {
  mode?: 'general' | 'policy';
  policyContext?: string; // Optional context for policy mode
}

const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({ mode = 'general', policyContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (mode === 'policy' && policyContext) {
        setMessages([{
            id: 'system-intro-policy',
            sender: 'ai',
            text: "Hello! I'm here to help with questions about our company policies. How can I assist you?",
            timestamp: new Date()
        }]);
    } else if (mode === 'general') {
         setMessages([{
            id: 'system-intro-general',
            sender: 'ai',
            text: "Hello! I'm your HR AI Assistant. Ask me anything about HR processes, benefits, or general queries.",
            timestamp: new Date()
        }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, policyContext]);


  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let aiResponseText: string;
      if (mode === 'policy') {
        aiResponseText = await getPolicyInformation(input, policyContext);
      } else {
        aiResponseText = await askQuery(input, "You are a helpful HR assistant.");
      }
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <SparklesIcon className="w-6 h-6 mr-2 text-blue-600" />
          AI {mode === 'policy' ? 'Policy Advisor' : 'HR Assistant'}
        </h2>
      </div>
      <div className="flex-grow p-6 space-y-4 overflow-y-auto bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-lg px-4 py-3 rounded-xl shadow ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'} text-right`}>{msg.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs px-4 py-3 rounded-xl shadow bg-gray-200 text-gray-800">
              <LoadingSpinner size={5}/>
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
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'policy' ? "Ask about company policies..." : "Type your HR query..."}
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <LoadingSpinner size={5}/> : <PaperAirplaneIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotInterface;
    