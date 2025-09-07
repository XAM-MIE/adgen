import { GoogleGenerativeAI } from '@google/generative-ai';

export interface MarketingContentRequest {
  type: string;
  target: string;
  tone: string;
  prompt: string;
}

export interface ComprehensiveCampaignRequest {
  type: string;
  tone: string;
  prompt: string;
  hasAsset: boolean;
}

export interface BrandContentRequest {
  industry: string;
  style: string;
  values: string;
  prompt: string;
}

export interface MarketingContent {
  id: number;
  type: string;
  content: string;
  platform: string;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

export interface BrandTypography {
  heading: string;
  body: string;
  description: string;
}

export interface BrandKit {
  name: string;
  colors: BrandColors;
  typography: BrandTypography;
  taglines: string[];
}

export interface ComprehensiveCampaignResult {
  adCopy?: string[];
  instagramCaptions?: string[];
  bannerHeadlines?: string[];
  adCreatives?: Array<{ description: string; imageUrl?: string }>;
  storyboard?: Array<{ description: string; imageUrl?: string }>;
}

export interface TextGenerationResult {
  content?: MarketingContent[] | ComprehensiveCampaignResult;
  brandKit?: BrandKit;
  error?: string;
}

class GeminiTextService {
  private ai: GoogleGenerativeAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not configured');
    }
    this.ai = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Retry with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }
      
      // Check if it's a rate limit or overload error
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('overloaded') || errorMessage.includes('503')) {
        console.log(`Retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(fn, retries - 1, delay * 2);
      }
      
      throw error;
    }
  }

  /**
   * Generate marketing content using Gemini
   */
  async generateMarketingContent(request: MarketingContentRequest): Promise<TextGenerationResult> {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    
    for (const modelName of modelsToTry) {
      try {
        const prompt = this.buildMarketingPrompt(request);
        
        const model = this.ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const content = this.parseMarketingResponse(text, request.type);
        
        return { content };
      } catch (error) {
        console.warn(`Model ${modelName} failed:`, error);
        
        if (modelName === modelsToTry[modelsToTry.length - 1]) {
          return {
            error: error instanceof Error ? error.message : 'All models failed to generate content'
          };
        }
        
        continue;
      }
    }
    
    return {
      error: 'All models failed to generate content'
    };
  }

  /**
   * Generate comprehensive marketing campaign using Gemini
   */
  async generateComprehensiveCampaign(request: ComprehensiveCampaignRequest): Promise<TextGenerationResult> {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    
    for (const modelName of modelsToTry) {
      try {
        const result = await this.retryWithBackoff(async () => {
          const prompt = this.buildComprehensiveCampaignPrompt(request);
          
          const model = this.ai.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          const content = this.parseComprehensiveCampaignResponse(text);
          return { content };
        });
        
        return result;
      } catch (error) {
        console.warn(`Model ${modelName} failed after retries:`, error);
        
        // If it's the last model in the list, return the error
        if (modelName === modelsToTry[modelsToTry.length - 1]) {
          return {
            error: error instanceof Error ? error.message : 'All models failed to generate campaign'
          };
        }
        
        // Otherwise, try the next model
        continue;
      }
    }
    
    return {
      error: 'All models failed to generate campaign'
    };
  }

  /**
   * Generate brand identity content using Gemini
   */
  async generateBrandContent(request: BrandContentRequest): Promise<TextGenerationResult> {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    
    for (const modelName of modelsToTry) {
      try {
        const prompt = this.buildBrandPrompt(request);
        
        const model = this.ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const brandKit = this.parseBrandResponse(text, request);
        
        return { brandKit };
      } catch (error) {
        console.warn(`Model ${modelName} failed:`, error);
        
        if (modelName === modelsToTry[modelsToTry.length - 1]) {
          return {
            error: error instanceof Error ? error.message : 'All models failed to generate brand content'
          };
        }
        
        continue;
      }
    }
    
    return {
      error: 'All models failed to generate brand content'
    };
  }

  /**
   * Build marketing content generation prompt
   */
  private buildMarketingPrompt(request: MarketingContentRequest): string {
    const { type, target, tone, prompt } = request;
    
    return `Generate professional marketing content based on the following specifications:

Campaign Type: ${type}
Target Audience: ${target}
Tone: ${tone}
Product/Service Description: ${prompt}

Please generate 3-5 pieces of marketing content in JSON format with the following structure:
[
  {
    "type": "Content Type (e.g., Instagram Post, Email Subject, Google Ad Headline)",
    "content": "The actual marketing copy",
    "platform": "Platform name"
  }
]

Requirements:
- Content should be engaging and ${tone} in tone
- Tailored specifically for ${target}
- Optimized for ${type} campaigns
- Include relevant hashtags for social media posts
- Keep headlines under 60 characters for ads
- Make email subjects compelling and action-oriented

Generate only the JSON array, no additional text.`;
  }

  /**
   * Build comprehensive campaign generation prompt
   */
  private buildComprehensiveCampaignPrompt(request: ComprehensiveCampaignRequest): string {
    const { type, tone, prompt, hasAsset } = request;
    
    return `Generate a comprehensive marketing campaign based on the following specifications:

Campaign Type: ${type}
Tone/Style: ${tone}
Product/Service Description: ${prompt}
Has Asset: ${hasAsset ? 'Yes' : 'No'}

Please generate ALL of the following content in JSON format:

{
  "adCopy": [
    "Ad copy variation 1",
    "Ad copy variation 2", 
    "Ad copy variation 3"
  ],
  "instagramCaptions": [
    "Instagram caption with hashtags 1",
    "Instagram caption with hashtags 2",
    "Instagram caption with hashtags 3"
  ],
  "bannerHeadlines": [
    "Banner headline 1",
    "Banner headline 2",
    "Banner headline 3"
  ],
  "adCreatives": [
    {"description": "Description of creative concept 1"},
    {"description": "Description of creative concept 2"}
  ],
  "storyboard": [
    {"description": "Frame 1: Description of opening scene"},
    {"description": "Frame 2: Description of middle scene"},
    {"description": "Frame 3: Description of closing scene with call-to-action"}
  ]
}

Requirements:
- All content should be ${tone} in tone
- Ad copy should be compelling and action-oriented
- Instagram captions should include relevant hashtags (5-10 per caption)
- Banner headlines should be under 60 characters
- Ad creatives should describe visual concepts that could be designed
- Storyboard should tell a cohesive story across 3 frames for video content
- All content should be optimized for ${type} campaigns
- Focus on the benefits and unique value proposition described in: ${prompt}

Generate only the JSON object, no additional text.`;
  }

  /**
   * Build brand identity generation prompt
   */
  private buildBrandPrompt(request: BrandContentRequest): string {
    const { industry, style, values, prompt } = request;
    
    return `Generate a complete brand identity based on the following specifications:

Industry: ${industry}
Style: ${style}
Values: ${values}
Brand Description: ${prompt}

Please generate a brand kit in JSON format with the following structure:
{
  "name": "Brand Name (extract from description or suggest)",
  "colors": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor", 
    "accent": "#hexcolor",
    "text": "#hexcolor"
  },
  "typography": {
    "heading": "Font Family Name",
    "body": "Font Family Name",
    "description": "Brief description of the typography choice"
  },
  "taglines": [
    "Tagline 1",
    "Tagline 2", 
    "Tagline 3",
    "Tagline 4"
  ]
}

Requirements:
- Colors should complement the ${style} style and ${industry} industry
- Reflect the values: ${values}
- Typography should be appropriate for ${industry}
- Taglines should be memorable and reflect brand values
- Ensure professional color combinations with good contrast
- Choose modern, web-safe fonts

Generate only the JSON object, no additional text.`;
  }

  /**
   * Parse marketing content response
   */
  private parseMarketingResponse(response: string, campaignType: string): MarketingContent[] {
    try {
      // Clean up the response to extract JSON
      let jsonStr = response.trim();
      
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to find JSON array in the response
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);
      
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => ({
          id: index + 1,
          type: item.type || `${campaignType} Content`,
          content: item.content || item.text || 'Generated content',
          platform: item.platform || this.getPlatformForType(campaignType)
        }));
      }
    } catch (error) {
      console.error('Failed to parse marketing response:', error);
    }

    // Fallback: create default content structure
    return [{
      id: 1,
      type: `${campaignType} Content`,
      content: response.slice(0, 200) + '...',
      platform: this.getPlatformForType(campaignType)
    }];
  }

  /**
   * Parse comprehensive campaign response
   */
  private parseComprehensiveCampaignResponse(response: string): ComprehensiveCampaignResult {
    try {
      // Clean up the response to extract JSON
      let jsonStr = response.trim();
      
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to find JSON object in the response
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);
      
      return {
        adCopy: Array.isArray(parsed.adCopy) ? parsed.adCopy : [],
        instagramCaptions: Array.isArray(parsed.instagramCaptions) ? parsed.instagramCaptions : [],
        bannerHeadlines: Array.isArray(parsed.bannerHeadlines) ? parsed.bannerHeadlines : [],
        adCreatives: Array.isArray(parsed.adCreatives) ? parsed.adCreatives : [],
        storyboard: Array.isArray(parsed.storyboard) ? parsed.storyboard : []
      };
    } catch (error) {
      console.error('Failed to parse comprehensive campaign response:', error);
      
      // Fallback: create default content structure
      return {
        adCopy: [
          "Experience the difference with our innovative solution.",
          "Transform your daily routine with cutting-edge technology.",
          "Join thousands who have already made the smart choice."
        ],
        instagramCaptions: [
          "Discover what makes us different! ✨ #innovation #quality #lifestyle #amazing #discover",
          "Ready to upgrade your experience? 🚀 #upgrade #technology #future #smart #revolution",
          "Join our community of satisfied customers! 💯 #community #satisfaction #results #trust #excellence"
        ],
        bannerHeadlines: [
          "Revolutionary Innovation Awaits",
          "Transform Your Experience Today",
          "The Smart Choice is Clear"
        ],
        adCreatives: [
          { description: "Clean, modern design showcasing the product with bold text overlay and vibrant colors" },
          { description: "Lifestyle image featuring people using the product in an attractive, everyday setting" }
        ],
        storyboard: [
          { description: "Opening scene: Close-up of the problem or current situation, creating relatability" },
          { description: "Middle scene: Product introduction and demonstration of key benefits in action" },
          { description: "Closing scene: Happy customers with clear call-to-action and contact information" }
        ]
      };
    }
  }

  /**
   * Parse brand identity response
   */
  private parseBrandResponse(response: string, request: BrandContentRequest): BrandKit {
    try {
      // Clean up the response to extract JSON
      let jsonStr = response.trim();
      
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to find JSON object in the response
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);
      
      return {
        name: parsed.name || 'YourBrand',
        colors: {
          primary: parsed.colors?.primary || '#000000',
          secondary: parsed.colors?.secondary || '#6B7280',
          accent: parsed.colors?.accent || '#F9FAFB',
          text: parsed.colors?.text || '#111827'
        },
        typography: {
          heading: parsed.typography?.heading || 'Inter',
          body: parsed.typography?.body || 'Inter',
          description: parsed.typography?.description || 'Modern, clean typography'
        },
        taglines: Array.isArray(parsed.taglines) ? parsed.taglines : [
          'Innovation simplified',
          'Building the future',
          'Smart solutions, better outcomes'
        ]
      };
    } catch (error) {
      console.error('Failed to parse brand response:', error);
      
      // Fallback: extract brand name from prompt and create default structure
      const brandName = this.extractBrandName(request.prompt) || 'YourBrand';
      
      return {
        name: brandName,
        colors: this.getDefaultColors(request.industry),
        typography: this.getDefaultTypography(request.style),
        taglines: this.generateFallbackTaglines(response, brandName)
      };
    }
  }

  /**
   * Get platform name for campaign type
   */
  private getPlatformForType(type: string): string {
    const platformMap: { [key: string]: string } = {
      'social': 'Social Media',
      'email': 'Email',
      'ads': 'Digital Ads',
      'content': 'Content Marketing',
      'video': 'Video',
      'ecommerce': 'E-commerce',
      'images': 'Visual Content'
    };
    
    return platformMap[type] || 'Marketing';
  }

  /**
   * Extract brand name from prompt
   */
  private extractBrandName(prompt: string): string | null {
    // Simple regex to find potential brand names
    const namePatterns = [
      /(?:called|named|brand name is)\s+([A-Z][a-zA-Z0-9\s]{1,20})/i,
      /([A-Z][a-zA-Z0-9]{2,15})\s+(?:is a|company|brand|business)/i,
      /^([A-Z][a-zA-Z0-9\s]{1,20})\s+/
    ];

    for (const pattern of namePatterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Get default colors based on industry
   */
  private getDefaultColors(industry: string): BrandColors {
    const colorSchemes: { [key: string]: BrandColors } = {
      'tech': {
        primary: '#0066FF',
        secondary: '#4F46E5',
        accent: '#F0F9FF',
        text: '#1F2937'
      },
      'healthcare': {
        primary: '#059669',
        secondary: '#0D9488',
        accent: '#ECFDF5',
        text: '#374151'
      },
      'finance': {
        primary: '#1E40AF',
        secondary: '#1E3A8A',
        accent: '#EFF6FF',
        text: '#111827'
      },
      'creative': {
        primary: '#DC2626',
        secondary: '#EA580C',
        accent: '#FEF2F2',
        text: '#1F2937'
      }
    };

    return colorSchemes[industry] || {
      primary: '#000000',
      secondary: '#6B7280',
      accent: '#F9FAFB',
      text: '#111827'
    };
  }

  /**
   * Get default typography based on style
   */
  private getDefaultTypography(style: string): BrandTypography {
    const typographySchemes: { [key: string]: BrandTypography } = {
      'modern': {
        heading: 'Inter',
        body: 'Inter',
        description: 'Modern, clean, and highly readable sans-serif'
      },
      'professional': {
        heading: 'Roboto',
        body: 'Roboto',
        description: 'Professional, trustworthy, and corporate'
      },
      'playful': {
        heading: 'Nunito',
        body: 'Nunito',
        description: 'Fun, friendly, and approachable rounded font'
      },
      'luxury': {
        heading: 'Playfair Display',
        body: 'Source Sans Pro',
        description: 'Elegant serif headings with clean body text'
      }
    };

    return typographySchemes[style] || {
      heading: 'Inter',
      body: 'Inter',
      description: 'Versatile and readable typography'
    };
  }

  /**
   * Generate fallback taglines from response text
   */
  private generateFallbackTaglines(response: string, brandName: string): string[] {
    // Try to extract potential taglines from the response
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const taglines: string[] = [];

    for (const sentence of sentences) {
      const cleaned = sentence.trim();
      if (cleaned.length >= 10 && cleaned.length <= 50 && !cleaned.includes('{') && !cleaned.includes('}')) {
        taglines.push(cleaned);
        if (taglines.length >= 4) break;
      }
    }

    // If no good taglines found, generate generic ones
    if (taglines.length === 0) {
      return [
        `${brandName} - Innovation simplified`,
        `Building the future with ${brandName}`,
        `Smart solutions, better outcomes`,
        `Where ideas become reality`
      ];
    }

    return taglines;
  }
}

// Export singleton instance
export const geminiTextService = new GeminiTextService();
export default geminiTextService;
