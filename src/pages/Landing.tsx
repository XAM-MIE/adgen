import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-black dark:text-white">AdGen</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/auth')}
              className="text-gray-600 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-black dark:text-white mb-6 max-w-4xl">
          What should we build today?
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-white/60 mb-12 max-w-2xl">
          Create stunning marketing campaigns & brand identities by chatting with AI.
        </p>

        {/* Input Area */}
        <div className="w-full max-w-2xl mb-8">
          <div className="relative">
            <textarea
              className="w-full h-32 px-6 py-4 bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-xl text-black dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              placeholder="Type your idea and we'll build it together."
            />
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center space-x-4 text-gray-500">
                <button className="flex items-center space-x-2 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button className="flex items-center space-x-2 hover:text-white transition-colors">
                  <Sparkles className="w-5 h-5" />
                </button>
                <button className="flex items-center space-x-2 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Generate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-white/60">
          <span>or start with:</span>
          <button 
            onClick={() => navigate('/marketing')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
          >
            Marketing Campaign
          </button>
          <button 
            onClick={() => navigate('/brand')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
          >
            Brand Identity
          </button>
        </div>
      </div>
    </div>
  );
}
