import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { SelectionStep } from '../components/SelectionStep';
import { MediaInput } from '../components/MediaInput';
import { motion, AnimatePresence } from 'framer-motion';
import geminiImageService from '../services/geminiImageService';
import projectService from '../services/projectService';
import { voiceService } from '../services/voiceService';
import { useNavigate } from 'react-router-dom';
import { 
  Palette, 
  Type, 
  Download, 
  RefreshCw, 
  Sparkles,
  Copy,
  Building,
  Zap,
  Heart,
  Shield,
  Lightbulb,
  Users,
  Target,
  Briefcase,
  ShoppingCart,
  Camera,
  Gamepad2,
  Stethoscope,
  Edit2
} from 'lucide-react';

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

interface Typography {
  heading: string;
  body: string;
  description: string;
}

interface BrandKit {
  name: string;
  colors: ColorPalette;
  typography: Typography;
  logo: string;
  taglines: string[];
}

export function Brand() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [brandName, setBrandName] = useState('');
  const [refFiles, setRefFiles] = useState<File[]>([]);
  const [about, setAbout] = useState('');
  const [brandData, setBrandData] = useState({
    industry: '',
    style: '',
    values: '',
    prompt: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBrand, setGeneratedBrand] = useState<any>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedProject, setSavedProject] = useState<any>(null);

  const industryOptions = [
    {
      id: 'tech',
      title: 'Technology',
      description: 'Software, AI, startups',
      icon: Zap
    },
    {
      id: 'healthcare',
      title: 'Healthcare',
      description: 'Medical, wellness, fitness',
      icon: Stethoscope
    },
    {
      id: 'finance',
      title: 'Finance',
      description: 'Banking, investment, fintech',
      icon: Briefcase
    },
    {
      id: 'ecommerce',
      title: 'E-commerce',
      description: 'Retail, online stores',
      icon: ShoppingCart
    },
    {
      id: 'creative',
      title: 'Creative',
      description: 'Design, photography, media',
      icon: Camera
    },
    {
      id: 'gaming',
      title: 'Gaming',
      description: 'Games, entertainment, esports',
      icon: Gamepad2
    }
  ];

const styleOptions = [
  {
    id: 'modern',
    title: 'Modern',
    description: 'Clean, minimalist, contemporary',
    icon: Zap
  },
  {
    id: 'classic',
    title: 'Classic',
    description: 'Timeless, traditional, refined',
    icon: Type
  },
  {
    id: 'playful',
    title: 'Playful',
    description: 'Fun, energetic, creative',
    icon: Heart
  },
  {
    id: 'premium',
    title: 'Premium',
    description: 'Elegant, sophisticated, high-end',
    icon: Sparkles
  }
];

  const valueOptions = [
    {
      id: 'innovation',
      title: 'Innovation',
      description: 'Cutting-edge, forward-thinking',
      icon: Lightbulb
    },
    {
      id: 'trust',
      title: 'Trust',
      description: 'Reliable, secure, dependable',
      icon: Shield
    },
    {
      id: 'community',
      title: 'Community',
      description: 'People-focused, collaborative',
      icon: Users
    },
    {
      id: 'excellence',
      title: 'Excellence',
      description: 'Quality, precision, expertise',
      icon: Target
    }
  ];

  const updateBrandData = (field: string, value: string) => {
    setBrandData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = async () => {
    // Play voice confirmation if available
    if (voiceService.isVoiceSynthesisAvailable()) {
      const stepNames = ['Brand Name', 'Industry', 'Reference', 'Style', 'Values', 'Generate'];
      const currentStepName = stepNames[currentStep];
      const currentValue = getCurrentStepValue();
      
      if (currentStepName && currentValue) {
        try {
          await voiceService.playStepConfirmation(currentStepName, currentValue);
        } catch (error) {
          console.warn('Voice confirmation failed:', error);
        }
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  const getCurrentStepValue = () => {
    switch (currentStep) {
      case 0: return brandName || '';
      case 1: return industryOptions.find(t => t.id === brandData.industry)?.title || '';
      case 2: return refFiles.length ? 'Reference added' : '';
      case 3: return styleOptions.find(t => t.id === brandData.style)?.title || '';
      case 4: return brandData.values || '';
      default: return '';
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setBrandData({ industry: '', style: '', values: '', prompt: '' });
    setGeneratedBrand(null);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      // Build values labels for prompt
      const valueIds = brandData.values ? brandData.values.split(',') : [];
      const valueLabels = valueIds.map(id => valueOptions.find(v => v.id === id)?.title || id);
      const industryLabel = industryOptions.find(t => t.id === brandData.industry)?.title || brandData.industry || 'General';
      const styleLabel = styleOptions.find(s => s.id === brandData.style)?.title || brandData.style || 'Modern';

      const nameDirective = brandName.trim() ? `Use this brand name: ${brandName.trim()}` : 'Generate a short, memorable brand name (one or two words).';

      const textPrompt = `System persona:
You are a senior brand designer. Produce a complete brand kit and minimal monochrome-friendly assets.

Inputs
- Industry: ${industryLabel}
- Mood/Style: ${styleLabel}
- Values: ${valueLabels.join(', ') || '—'}
- ${nameDirective}
- About: ${about || '—'}

Return EXACTLY ONE JSON object as the FIRST text part with this shape:
{
  "name": "Brand Name",
  "taglines": ["...", "..."],
  "colors": { "primary": "#000000", "secondary": "#ffffff", "accent": "#888888" },
  "typography": { "heading": "Font Family", "body": "Font Family", "description": "Short rationale" }
}
- Only 2 taglines.
- Colors must be valid hex codes with good contrast and fit ${styleLabel} in ${industryLabel}.
- Typography should be web-safe or widely available.
- Reflect the "About" details in tone and choices.

After the JSON, return EXACTLY 1 IMAGE PART:
1) Logo: simple, vector-like, high-contrast, WHITE background (PNG), matching ${styleLabel}.
If a reference image is included, incorporate its elements tastefully.`;

      // Build parts for image model
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      parts.push({ text: textPrompt });

      let referenceInline: { mimeType: string; data: string } | null = null;
      if (refFiles.length > 0) {
        try {
          const { data, mimeType } = await geminiImageService.fileToBase64(refFiles[0]);
          referenceInline = { data, mimeType };
          parts.push({ inlineData: referenceInline });
        } catch (e) {
          console.warn('Failed to read reference image, continuing without it:', e);
        }
      }

      // Keep a textual prompt in brandData for saving
      const composedPrompt = `Brand Kit for ${brandName || '(auto-name)'} — Industry=${industryLabel}, Style=${styleLabel}, Values=${valueLabels.join(', ') || '—'}${referenceInline ? ', With reference image' : ''}${about ? `, About=${about}` : ''}`;

      const response = await geminiImageService.generateFromText({ parts });
      if (response.error) throw new Error(response.error);

      // Parse JSON from text part
      let parsed: any = {};
      if (response.textResponse) {
        try {
          parsed = JSON.parse(response.textResponse);
        } catch {
          const match = response.textResponse.match(/\{[\s\S]*\}/);
          if (match) {
            try { parsed = JSON.parse(match[0]); } catch {}
          }
        }
      }

      // Normalize to expected structure
      const imgs = response.images || [];
      const resultBrand = {
        name: brandName.trim() || parsed.name || 'Brand',
        taglines: Array.isArray(parsed.taglines) ? parsed.taglines.slice(0, 2) : [],
        colors: parsed.colors || { primary: '#000000', secondary: '#ffffff', accent: '#999999' },
        typography: parsed.typography || { heading: 'Inter', body: 'Inter', description: 'Modern, clean typography' },
        images: {
          logo: imgs[0] || null,
        },
        imagesTagged: [
          imgs[0] ? { tag: 'Logo', image: imgs[0] } : null,
        ].filter(Boolean)
      };

      setGeneratedBrand(resultBrand);

      // Save project locally
      const brandDataWithKit = {
        ...brandData,
        prompt: composedPrompt,
        style: brandData.style || 'modern',
        brandKit: resultBrand
      };

      const saveRes = await projectService.saveBrandProject({
        title: projectService.generateProjectTitle('brand', brandDataWithKit),
        brandData: brandDataWithKit
      });
      if (saveRes.error) {
        console.error('Failed to save project:', saveRes.error);
      } else {
        setSavedProject(saveRes.project);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate brand kit. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const saveProject = async (brandKit: any) => {
    try {
      setIsSaving(true);
      
      const title = projectService.generateProjectTitle('brand', brandData);
      const brandDataWithKit = {
        ...brandData,
        brandKit
      };
      
      const result = await projectService.saveBrandProject({
        title,
        brandData: brandDataWithKit
      });
      
      if (result.error) {
        console.error('Failed to save project:', result.error);
      } else {
        setSavedProject(result.project);
      }
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout showNavbar>
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
          {/* Progress Indicator */}
          {currentStep < 6 && (
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <div className="flex items-center justify-between overflow-x-auto scrollbar-hide">
                {['Brand Name', 'Industry', 'Reference', 'Style', 'Values', 'Generate'].map((step, i) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 ${
                      i === currentStep ? 'bg-black dark:bg-white text-white dark:text-black' : i < currentStep ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-white/20 text-gray-600 dark:text-white/60'
                    }`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    {i < 5 && (
                      <div className={`w-8 sm:w-10 lg:w-14 h-1 mx-1 sm:mx-2 ${i < currentStep ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-white/20'}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="hidden sm:flex justify-between mt-2">
                {['Brand Name', 'Industry', 'Reference', 'Style', 'Values', 'Generate'].map((s, i) => (
                  <span key={s} className={`text-xs ${i === currentStep ? 'text-black dark:text-white font-medium' : 'text-gray-500 dark:text-white/60'}`}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={generatedBrand ? 'results' : currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[500px]"
            >
            {!generatedBrand ? (
              <>
              {/* Step 1: Brand Name (optional) */}
              {currentStep === 0 && (
              <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6 lg:space-y-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white">What is your brand name? (optional)</h2>
                <div className="card p-4 sm:p-6 lg:p-8">
                  <div className="space-y-6 text-left">
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">Brand Name</label>
                      <input
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g., Nova Labs"
                        className="input"
                      />
                      <p className="text-xs text-gray-500 dark:text-white/60 mt-1">Leave blank to auto-generate a name.</p>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={nextStep} className="btn-primary">Continue</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Industry */}
            {currentStep === 1 && (
              <SelectionStep
                question="What industry is your brand in?"
                options={industryOptions}
                selectedValue={brandData.industry}
                onSelect={(value) => updateBrandData('industry', value)}
                onNext={nextStep}
                className="max-w-5xl mx-auto"
              />
            )}

            {/* Step 3: Upload Reference (optional) */}
            {currentStep === 2 && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white text-center mb-4 sm:mb-6">Upload a reference logo/image (optional)</h2>
                <div className="card p-4 sm:p-6 lg:p-8">
                  <MediaInput onFilesSelected={setRefFiles} maxFiles={1} multiple={false} />
                  <div className="flex justify-between mt-6">
                    <button onClick={prevStep} className="btn-secondary">Back</button>
                    <button onClick={nextStep} className="btn-primary">Continue</button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Mood/Style */}
            {currentStep === 3 && (
              <SelectionStep
                question="Choose a mood/style"
                options={styleOptions}
                selectedValue={brandData.style}
                onSelect={(value) => updateBrandData('style', value)}
                onNext={nextStep}
                className="max-w-4xl mx-auto"
              />
            )}

            {/* Step 5: Values */}
            {currentStep === 4 && (
              <SelectionStep
                question="Select brand values"
                options={valueOptions}
                selectedValue={brandData.values}
                onSelect={(value) => updateBrandData('values', value)}
                onNext={nextStep}
                multiSelect={true}
                className="max-w-4xl mx-auto"
              />
            )}

            {/* Step 6: Generate Brand Kit */}
            {currentStep === 5 && (
              <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white">Generate Brand Kit</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 mt-1 sm:mt-2">We'll create a brand name (if blank), taglines, a monochrome-ready color palette, typography, and visuals.</p>
                </div>

                {/* About the Brand */}
                <div className="card p-4 sm:p-6 lg:p-8">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">About the Brand (optional)</label>
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    rows={4}
                    placeholder="Briefly describe your brand, mission, audience, product/service, and personality"
                    className="input resize-none"
                  />
                </div>

                <div className="flex justify-between">
                  <button onClick={prevStep} className="btn-secondary">Back</button>
                  <button onClick={handleGenerate} disabled={isGenerating || !brandData.industry || !brandData.style} className="btn-primary flex items-center">
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" /> Generate Brand Kit
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
              </>
            ) : (
              <>
                {/* Error Display */}
          {error && (
            <div className="max-w-3xl mx-auto mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Generation Failed</h3>
                    <div className="mt-1 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Project Save Confirmation */}
          {savedProject && (
            <div className="max-w-3xl mx-auto mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Brand Identity Saved!</h3>
                    <div className="mt-1 text-sm text-green-700">
                      Your brand identity "{savedProject.title}" has been saved to your dashboard.
                      {isSaving && <span className="ml-2">Saving...</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

              <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Your Brand Kit</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                  <button onClick={resetWizard} className="btn-secondary flex items-center justify-center text-sm"><Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> New Brand</button>
                  <button onClick={handleGenerate} className="btn-secondary flex items-center justify-center text-sm"><RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Regenerate</button>
                </div>
              </div>

              {/* 1. Name */}
              <div className="card p-4 sm:p-5 lg:p-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-white/60 mb-2">Name</h3>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{generatedBrand.name}</div>
              </div>

              {/* 2. Slogans (2) */}
              <div className="card p-4 sm:p-5 lg:p-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-white/60 mb-2">Slogans (2)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {(generatedBrand.taglines || []).slice(0,2).map((t: string, i: number) => (
                    <div key={i} className="p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-white/10 text-sm sm:text-base text-gray-900 dark:text-white">{t}</div>
                  ))}
                </div>
              </div>

              {/* 3. Color Palette */}
              <div className="card p-4 sm:p-5 lg:p-6">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center"><Palette className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> Color Palette</h4>
                <div className="space-y-3">
                  {Object.entries(generatedBrand.colors).map(([name, color]) => (
                    <div key={name} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-white/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg shadow-sm border border-gray-300" style={{ backgroundColor: color as string }}></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white capitalize">{name}</div>
                          <div className="text-xs text-gray-500 dark:text-white/60 font-mono">{color as string}</div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg transition-colors" onClick={() => navigator.clipboard.writeText(color as string)} title="Copy color code">
                        <Copy className="w-4 h-4 text-gray-600 dark:text-white/60" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Typography */}
              <div className="card p-4 sm:p-5 lg:p-6">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center"><Type className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> Typography</h4>
                <div className="space-y-4">
                  <div className="p-3 sm:p-4 bg-gray-50 dark:bg-white/10 rounded-lg">
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-white/60 mb-1 sm:mb-2">Primary Font</div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">{generatedBrand.typography.heading}</div>
                    <div className="text-base text-gray-700 dark:text-white/80 mb-2">The quick brown fox jumps over the lazy dog</div>
                    <div className="text-sm text-gray-500 dark:text-white/60">{generatedBrand.typography.description}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/10 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-white/60 mb-2">Body Font</div>
                    <div className="text-base text-gray-700 dark:text-white/80 mb-2">{generatedBrand.typography.body}</div>
                    <div className="text-sm text-gray-700 dark:text-white/70">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</div>
                  </div>
                </div>
              </div>

{/* 5. Gallery */}
              <div className="card p-4 sm:p-5 lg:p-6">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">5. Gallery</h4>
                <div className="grid grid-cols-1 gap-4">
                  {generatedBrand.images?.logo && (
                    <div className="relative group border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden bg-white">
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs bg-black text-white dark:bg-white dark:text-black z-10">Logo</span>
                      <img src={geminiImageService.base64ToBlob(generatedBrand.images.logo.data, `image/${generatedBrand.images.logo.format || 'png'}`)} className="w-full h-48 object-contain p-4" />
                      <div className="p-2 text-right">
                        <button onClick={() => navigate('/editor', { state: { imageData: generatedBrand.images.logo.data, format: generatedBrand.images.logo.format, mimeType: `image/${generatedBrand.images.logo.format || 'png'}` } })} className="btn-secondary text-xs px-2 py-1 inline-flex items-center"><Edit2 className="w-3 h-3 mr-1" /> Edit</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </div>
            </>
            )}
            </motion.div>
          </AnimatePresence>

          {/* Brand Visuals section is integrated above with generated images */}
        </div>
      </div>
    </Layout>
  );
}
