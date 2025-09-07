import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Type, Volume2 } from 'lucide-react';
import { voiceService } from '../services/voiceService';

interface VoiceInputProps {
  question: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  aiResponse?: string;
  className?: string;
}

export function VoiceInput({ 
  question, 
  placeholder, 
  value, 
  onChange, 
  onNext, 
  aiResponse,
  className = ''
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);
  const [error, setError] = useState('');

  // Check if speech recognition is supported
  const speechSupported = voiceService.isSpeechRecognitionSupported();

  const startVoiceInput = async () => {
    try {
      setError('');
      setIsListening(true);
      
      const transcript = await voiceService.startListening();
      onChange(transcript);
      setIsListening(false);
      
      // Play AI response if provided
      if (aiResponse) {
        setIsPlayingResponse(true);
        await voiceService.playAIResponse(aiResponse);
        setIsPlayingResponse(false);
        
        // Auto-advance after AI response
        setTimeout(() => {
          onNext();
        }, 500);
      } else {
        // Auto-advance without AI response
        setTimeout(() => {
          onNext();
        }, 1000);
      }
    } catch (error) {
      console.error('Voice input error:', error);
      setError('Voice input failed. Please try typing instead.');
      setIsListening(false);
      setShowManualInput(true);
    }
  };

  const stopVoiceInput = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const handleManualSubmit = () => {
    if (value.trim()) {
      if (aiResponse) {
        setIsPlayingResponse(true);
        voiceService.playAIResponse(aiResponse).then(() => {
          setIsPlayingResponse(false);
          setTimeout(() => {
            onNext();
          }, 500);
        });
      } else {
        onNext();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      handleManualSubmit();
    }
  };

  return (
    <motion.div 
      className={`text-center space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Question */}
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{question}</h2>

      {/* Voice Input Section */}
      {speechSupported && !showManualInput ? (
        <div className="space-y-6">
          {/* Voice Button */}
          <motion.button
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            disabled={isPlayingResponse}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' 
                : 'bg-black hover:bg-gray-800 shadow-lg'
            } ${isPlayingResponse ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlayingResponse ? (
              <Volume2 className="w-12 h-12 text-white animate-pulse" />
            ) : isListening ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </motion.button>

          {/* Status Text */}
          <div className="space-y-2">
            {isPlayingResponse ? (
              <p className="text-lg text-blue-600 font-medium">AI is responding...</p>
            ) : isListening ? (
              <motion.p 
                className="text-lg text-red-500 font-medium"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Listening... Speak now
              </motion.p>
            ) : (
              <p className="text-lg text-gray-600">
                Tap the microphone and speak your answer
              </p>
            )}
            
            {/* Display current value */}
            {value && (
              <motion.div 
                className="bg-gray-100 rounded-lg p-4 mt-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-gray-800 font-medium">"{value}"</p>
              </motion.div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <motion.p 
              className="text-red-500 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          {/* Manual Input Toggle */}
          <button
            onClick={() => setShowManualInput(true)}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Type className="w-4 h-4" />
            <span>Type instead</span>
          </button>
        </div>
      ) : (
        /* Manual Input Section */
        <div className="space-y-6">
          <div>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
              autoFocus
            />
          </div>

          {/* Submit Button */}
          <motion.button
            onClick={handleManualSubmit}
            disabled={!value.trim() || isPlayingResponse}
            className={`btn-primary px-8 py-3 ${
              !value.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            whileHover={value.trim() ? { scale: 1.02 } : {}}
            whileTap={value.trim() ? { scale: 0.98 } : {}}
          >
            {isPlayingResponse ? (
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>AI Responding...</span>
              </div>
            ) : (
              'Continue'
            )}
          </motion.button>

          {/* Voice Input Toggle */}
          {speechSupported && (
            <button
              onClick={() => setShowManualInput(false)}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Mic className="w-4 h-4" />
              <span>Use voice instead</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
