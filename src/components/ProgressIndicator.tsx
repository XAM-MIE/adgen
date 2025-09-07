import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

export function ProgressIndicator({ currentStep, totalSteps, stepTitles }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <motion.div
            className="h-2 bg-black rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-between mt-4">
          {Array.from({ length: totalSteps + 1 }, (_, index) => {
            const stepNumber = index;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isUpcoming = stepNumber > currentStep;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-black text-white'
                      : isCurrent
                      ? 'bg-gray-800 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted ? '#000000' : isCurrent ? '#1f2937' : '#e5e7eb'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </motion.div>
                
                {/* Step title */}
                {stepTitles && stepTitles[stepNumber] && (
                  <motion.p
                    className={`mt-2 text-xs font-medium text-center max-w-20 ${
                      isCurrent ? 'text-gray-900' : 'text-gray-500'
                    }`}
                    animate={{ 
                      color: isCurrent ? '#111827' : '#6b7280',
                      fontWeight: isCurrent ? 600 : 500
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {stepTitles[stepNumber]}
                  </motion.p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Current step info */}
      <div className="text-center">
        <motion.p
          className="text-sm text-gray-600"
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Step {currentStep} of {totalSteps}
        </motion.p>
      </div>
    </div>
  );
}
