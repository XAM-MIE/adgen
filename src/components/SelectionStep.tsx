import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { voiceService } from '../services/voiceService';

interface Option {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface SelectionStepProps {
  question: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onNext: () => void;
  aiResponse?: string;
  multiSelect?: boolean;
  className?: string;
}

export function SelectionStep({ 
  question, 
  options, 
  selectedValue, 
  onSelect, 
  onNext, 
  aiResponse,
  multiSelect = false,
  className = ''
}: SelectionStepProps) {
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);

  const handleSelect = async (optionId: string) => {
    if (multiSelect) {
      const currentSelections = selectedValue ? selectedValue.split(',') : [];
      const newSelections = currentSelections.includes(optionId)
        ? currentSelections.filter(id => id !== optionId)
        : [...currentSelections, optionId];
      onSelect(newSelections.join(','));
    } else {
      onSelect(optionId);
      
      // Play AI response and auto-advance for single select
      if (aiResponse) {
        setIsPlayingResponse(true);
        await voiceService.playAIResponse(aiResponse);
        setIsPlayingResponse(false);
        
        setTimeout(() => {
          onNext();
        }, 500);
      } else {
        setTimeout(() => {
          onNext();
        }, 1000);
      }
    }
  };

  const handleContinue = async () => {
    if (multiSelect && selectedValue && aiResponse) {
      setIsPlayingResponse(true);
      await voiceService.playAIResponse(aiResponse);
      setIsPlayingResponse(false);
      
      setTimeout(() => {
        onNext();
      }, 500);
    } else if (multiSelect) {
      onNext();
    }
  };

  const getSelectedOptions = () => {
    return selectedValue ? selectedValue.split(',') : [];
  };

  return (
    <motion.div 
      className={`text-center space-y-8 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Question */}
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 lg:mb-8">{question}</h2>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = multiSelect 
            ? getSelectedOptions().includes(option.id)
            : selectedValue === option.id;
          
          return (
            <motion.div
              key={option.id}
              className={`card-hover p-4 sm:p-5 lg:p-6 cursor-pointer border-2 transition-all duration-300 ${
                isSelected 
                  ? 'border-black dark:border-white bg-gray-50 dark:bg-white/10 shadow-lg' 
                  : 'border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/40'
              } ${isPlayingResponse ? 'pointer-events-none opacity-50' : ''}`}
              onClick={() => handleSelect(option.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: options.indexOf(option) * 0.1 }}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 ${
                isSelected ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-white/10'
              }`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? 'text-white dark:text-black' : 'text-gray-600 dark:text-white/60'}`} />
              </div>
              
              <h3 className={`text-sm sm:text-base font-semibold mb-1 sm:mb-2 transition-colors duration-300 ${
                isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-white/80'
              }`}>
                {option.title}
              </h3>
              
              <p className="text-gray-600 dark:text-white/60 text-xs sm:text-sm">{option.description}</p>
              
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  className="mt-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-black dark:bg-white rounded-full mx-auto flex items-center justify-center">
                    <motion.div
                      className="w-2 h-2 bg-white dark:bg-black rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Continue Button for Multi-Select */}
      {multiSelect && selectedValue && (
        <motion.button
          onClick={handleContinue}
          disabled={isPlayingResponse}
          className={`btn-primary px-8 py-3 ${
            isPlayingResponse ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isPlayingResponse ? (
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>AI Responding...</span>
            </div>
          ) : (
            `Continue with ${getSelectedOptions().length} selected`
          )}
        </motion.button>
      )}

      {/* Playing Response Indicator */}
      {isPlayingResponse && !multiSelect && (
        <motion.p 
          className="text-blue-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          AI is responding...
        </motion.p>
      )}
    </motion.div>
  );
}
