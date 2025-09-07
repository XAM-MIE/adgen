import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Voice Service for Speech Recognition and ElevenLabs TTS
export class VoiceService {
  private recognition: any = null;
  private elevenLabsClient: ElevenLabsClient | null = null;
  private elevenLabsVoiceId: string = 'JBFqnCBsd6RMkjVDRZzb'; // Voice ID from example
  
  constructor() {
    this.initializeSpeechRecognition();
    this.initializeElevenLabs();
  }

  // Initialize ElevenLabs client
  private initializeElevenLabs() {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (apiKey) {
      this.elevenLabsClient = new ElevenLabsClient({
        apiKey: apiKey
      });
    } else {
      console.warn('VITE_ELEVENLABS_API_KEY not configured');
    }
  }

  // Initialize Web Speech API
  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  // Start listening for voice input
  async startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        // Recognition ended
      };

      this.recognition.start();
    });
  }

  // Stop listening
  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  // Play AI voice response using ElevenLabs SDK
  async playAIResponse(text: string): Promise<void> {
    try {
      if (!this.elevenLabsClient) {
        console.warn('ElevenLabs client not initialized');
        return;
      }

      const audio = await this.elevenLabsClient.textToSpeech.convert(
        this.elevenLabsVoiceId,
        {
          text: text,
          modelId: 'eleven_multilingual_v2',
          outputFormat: 'mp3_44100_128',
        }
      );

      // Convert audio stream to blob and play
      const audioBlob = new Blob([audio], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);
      
      return new Promise((resolve) => {
        audioElement.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audioElement.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          console.error('Error playing audio');
          resolve();
        };
        audioElement.play();
      });
    } catch (error) {
      console.error('Error playing AI response:', error);
    }
  }


  // Generate voice confirmation for wizard steps
  async playStepConfirmation(stepName: string, userInput: string): Promise<void> {
    const confirmations = {
      'Type': `Great! You've selected ${userInput} for your campaign type. Let's move on to choosing your target audience.`,
      'Audience': `Perfect! We'll target ${userInput}. Now, let's set the tone for your campaign.`,
      'Tone': `Excellent choice! Your campaign will have a ${userInput} tone. Time to create your content.`,
      'Content': `Wonderful! I'm generating your campaign content now. This will just take a moment.`,
      'Industry': `Great choice! ${userInput} is a dynamic industry. Let's define your brand style.`,
      'Style': `Perfect! A ${userInput} style will work beautifully. Now let's choose your brand values.`,
      'Values': `Excellent! ${userInput} values will guide your brand identity. Let's add some details.`,
      'Details': `Thank you for those details! I'm now creating your complete brand identity.`
    };

    const message = confirmations[stepName as keyof typeof confirmations] || 
      `Great! Moving on to the next step.`;
    
    return this.playAIResponse(message);
  }

  // Check if speech recognition is supported
  isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  // Check if ElevenLabs is available
  isVoiceSynthesisAvailable(): boolean {
    return this.elevenLabsClient !== null;
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
