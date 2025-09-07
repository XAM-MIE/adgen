import { GoogleGenAI } from '@google/genai';

export type GeminiContentPart = {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
};

export interface ImageGenerationOptions {
  // Either provide a single composed prompt...
  prompt?: string;
  // ...or provide the wizard parts directly
  parts?: GeminiContentPart[];
  model?: string;
}

export interface ImageEditOptions {
  prompt: string;
  imageData: string;
  mimeType: string;
  model?: string;
}

export interface MultiImageEditOptions {
  prompt: string;
  images: Array<{
    data: string;
    mimeType: string;
  }>;
  model?: string;
}

export interface GeneratedImage {
  data: string;
  format: string;
}

export interface ImageGenerationResult {
  images: GeneratedImage[];
  textResponse?: string;
  error?: string;
}

class GeminiImageService {
  private ai: GoogleGenAI;
  private readonly defaultModel = 'gemini-2.5-flash-image-preview';

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not configured');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Generate images using Gemini 2.5 Flash (image preview) — returns actual image bytes
   */
  async generateFromText(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    try {
      const model = options.model || this.defaultModel;

      // Normalize input into the proper contents payload shape expected by @google/genai
      let contentsPayload: any = null;
      if (options.parts && options.parts.length > 0) {
        contentsPayload = [{ role: 'user', parts: options.parts }];
      } else if (options.prompt && options.prompt.trim().length > 0) {
        contentsPayload = [{ role: 'user', parts: [{ text: options.prompt }] }];
      }

      if (!contentsPayload) {
        return { images: [], error: 'No prompt or parts provided for image generation.' };
      }

      const response = await this.ai.models.generateContent({
        model,
        contents: contentsPayload,
      });

      const images: GeneratedImage[] = [];
      let textResponse = '';

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if ((part as any).inlineData) {
          const inline = (part as any).inlineData as { data: string; mimeType?: string };
          images.push({
            data: inline.data,
            format: inline.mimeType?.split('/')[1] || 'png',
          });
        } else if ((part as any).text) {
          textResponse += (part as any).text as string;
        }
      }

      if (images.length === 0 && !textResponse) {
        textResponse = 'Gemini did not return any text or image parts for this prompt.';
      }

      return { images, textResponse };
    } catch (error) {
      return {
        images: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
  

  /**
   * Edit an image with text prompt
   */
  async editImage(options: ImageEditOptions): Promise<ImageGenerationResult> {
    try {
      const prompt = [
        { text: options.prompt },
        {
          inlineData: {
            mimeType: options.mimeType,
            data: options.imageData,
          },
        },
      ];

      const response = await this.ai.models.generateContent({
        model: options.model || this.defaultModel,
        contents: prompt,
      });

      const images: GeneratedImage[] = [];
      let textResponse = '';

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if ((part as any).text) {
          textResponse += (part as any).text as string;
        } else if ((part as any).inlineData) {
          const inline = (part as any).inlineData as { data: string; mimeType?: string };
          images.push({
            data: inline.data,
            format: inline.mimeType?.split('/')[1] || 'png',
          });
        }
      }

      return { images, textResponse };
    } catch (error) {
      return {
        images: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Edit multiple images with text prompt
   */
  async editMultipleImages(options: MultiImageEditOptions): Promise<ImageGenerationResult> {
    try {
      const prompt = [
        { text: options.prompt },
        ...options.images.map(img => ({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data,
          },
        }))
      ];

      const response = await this.ai.models.generateContent({
        model: options.model || this.defaultModel,
        contents: prompt,
      });

      const images: GeneratedImage[] = [];
      let textResponse = '';

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if ((part as any).text) {
          textResponse += (part as any).text as string;
        } else if ((part as any).inlineData) {
          const inline = (part as any).inlineData as { data: string; mimeType?: string };
          images.push({
            data: inline.data,
            format: inline.mimeType?.split('/')[1] || 'png',
          });
        }
      }

      return { images, textResponse };
    } catch (error) {
      return {
        images: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Restore and enhance old photos
   */
  async restorePhoto(imageData: string, mimeType: string, customPrompt?: string): Promise<ImageGenerationResult> {
    const prompt = customPrompt || "Restore and colorize this image, enhance quality and fix any damage";
    
    return this.editImage({
      prompt,
      imageData,
      mimeType
    });
  }

  /**
   * Create a conversational chat session for iterative image editing
   * Note: Chat sessions are not supported via @google/genai in this service.
   */
  createChatSession() {
    throw new Error('Chat sessions are not supported in this service when using @google/genai.');
  }

  /**
   * Convert File to base64 string
   */
  async fileToBase64(file: File): Promise<{ data: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/png;base64, prefix
        const base64Data = result.split(',')[1];
        resolve({
          data: base64Data,
          mimeType: file.type
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert blob to base64
   */
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert base64 image to blob URL for display
   */
  base64ToBlob(base64Data: string, mimeType: string): string {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  /**
   * Download generated image
   */
  downloadImage(base64Data: string, filename: string, format: string = 'png'): void {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: `image/${format}` });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const geminiImageService = new GeminiImageService();
export default geminiImageService;
