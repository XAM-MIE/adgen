import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { voiceService } from '../services/voiceService';

interface InlineMicButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  title?: string;
  autoSubmit?: boolean; // when true, call onAutoSubmit after speech end
  onAutoSubmit?: (text?: string) => void; // optional callback to trigger an action (e.g., Next, Generate)
}

export default function InlineMicButton({ onTranscript, className = '', title = 'Voice input', autoSubmit = false, onAutoSubmit }: InlineMicButtonProps) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    try {
      setError('');
      if (listening) {
        voiceService.stopListening();
        setListening(false);
        return;
      }
      setListening(true);
      const text = await voiceService.startListening();
      onTranscript(text);
      if (autoSubmit && onAutoSubmit) {
        // Slight delay to allow state updates (like setDescription) to flush
        setTimeout(() => {
          try { onAutoSubmit(text); } catch {}
        }, 50);
      }
    } catch (e: any) {
      setError(e?.message || 'Voice input failed');
    } finally {
      setListening(false);
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`} title={title}>
      <button
        type="button"
        onClick={handleClick}
        className={`w-9 h-9 rounded-full flex items-center justify-center border border-gray-300 dark:border-white/20 bg-white dark:bg-black text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition ${listening ? 'ring-2 ring-red-400' : ''}`}
        aria-label={title}
      >
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

