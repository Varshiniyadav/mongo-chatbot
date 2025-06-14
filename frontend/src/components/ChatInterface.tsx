import React, { useState, useRef, useEffect } from 'react';
import type { ChatResponse } from '../types/movie';
import QueryDisplay from './QueryDisplay';
import MovieResults from './MovieResults';

const API_URL = 'http://localhost:3000/api';

interface ChatMessage {
  text: string;
  isUser: boolean;
  error?: boolean;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input on component mount
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      
      if (!data || typeof data.query !== 'string' || !Array.isArray(data.result)) {
        throw new Error('Invalid response format from server');
      }

      setLastResponse(data);
      
      const botMessage = data.error 
        ? `Error: ${data.error}`
        : data.result.length > 0
          ? `Found ${data.result.length} movies matching your query.`
          : 'No movies found matching your query.';
      
      setMessages(prev => [...prev, { 
        text: botMessage, 
        isUser: false,
        error: !!data.error 
      }]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}`
        : 'Sorry, I encountered an error processing your request.';
      
      setMessages(prev => [...prev, { 
        text: errorMessage, 
        isUser: false,
        error: true 
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <h2 className="text-xl font-bold">Movie Database Assistant</h2>
        <p className="text-sm opacity-90">Ask me anything about movies!</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 my-8">
            <p className="text-lg mb-2">👋 Welcome to the Movie Database Chat!</p>
            <p className="text-sm">Try asking questions like:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>"What are the top rated action movies?"</li>
              <li>"Show me movies directed by Christopher Nolan"</li>
              <li>"Find movies from 2020 with high IMDB ratings"</li>
            </ul>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                message.isUser
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : message.error
                    ? 'bg-red-100 text-red-800 rounded-bl-none'
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Results Section */}
      {lastResponse && !lastResponse.error && (
        <div className="border-t border-gray-200 bg-white p-4">
          <QueryDisplay query={lastResponse.query} />
          <MovieResults movies={lastResponse.result} />
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about movies..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <span>Send</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;