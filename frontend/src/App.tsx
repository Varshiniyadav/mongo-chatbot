import React from 'react';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Movie Database Chatbot</h1>
          <p className="text-sm opacity-80">
            Ask questions about movies in natural language
          </p>
        </div>
      </header>
      <main className="container mx-auto py-8">
        <ChatInterface />
      </main>
    </div>
  );
}

export default App;
