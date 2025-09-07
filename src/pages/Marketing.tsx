import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import InlineMicButton from '../components/InlineMicButton';
import geminiImageService from '../services/geminiImageService';
import projectService from '../services/projectService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Copy,
  Download,
  Upload,
  Mic,
  Type,
  X,
  ArrowRight,
  ArrowLeft,
  Instagram,
  Facebook,
  Mail,
  Video,
  Smile,
  Shield,
  Zap,
  Edit2,
  Users,
  Tag,
  Gift,
  ShoppingBag,
  Heart,
  PartyPopper,
  GraduationCap,
  Rocket,
  Timer,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface GeneratedContent {
  adCopy: string[];
  instagramCaptions: string[];
  bannerHeadlines: string[];
  adCreatives: string[]; // blob URLs for images
}

interface MultiGeneratedContent {
  [key: string]: {
    adCopy: string[];
    captions: string[];
    bannerHeadlines: string[];
    adCreatives: string[];
  };
}

export function Marketing() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [theme, setTheme] = useState('general');
  const [uploadedAssets, setUploadedAssets] = useState<File[]>([]);
  const [assetPreviews, setAssetPreviews] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('');
  const [audience, setAudience] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [multiResult, setMultiResult] = useState<MultiGeneratedContent | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const steps = [
    'Campaign Theme',
    'Upload Assets',
    'Product Description',
    'Tone/Style',
    'Audience',
    'Generate Results',
  ];

  const campaignTypes = [
    { id: 'instagram-ad', label: 'Instagram Ad', icon: Instagram },
    { id: 'facebook-ad', label: 'Facebook Ad', icon: Facebook },
    { id: 'email-campaign', label: 'Email Campaign', icon: Mail },
    { id: 'twitter-ad', label: 'X (Twitter) Ad', icon: Video },
  ];

  const campaignThemes = [
    { id: 'general', label: 'General Campaign', icon: Calendar, description: 'Evergreen content' },
    { id: 'black-friday', label: 'Black Friday', icon: Tag, description: 'Mega deals & savings' },
    { id: 'cyber-monday', label: 'Cyber Monday', icon: ShoppingBag, description: 'Online shopping event' },
    { id: 'christmas', label: 'Christmas / Holidays', icon: Gift, description: 'Festive season' },
    { id: 'valentines', label: "Valentine's Day", icon: Heart, description: 'Love & romance' },
    { id: 'new-year', label: 'New Year', icon: PartyPopper, description: 'Fresh starts' },
    { id: 'back-to-school', label: 'Back to School', icon: GraduationCap, description: 'Education season' },
    { id: 'product-launch', label: 'Product Launch', icon: Rocket, description: 'New arrivals' },
    { id: 'flash-sale', label: 'Flash Sale', icon: Timer, description: 'Limited time offer' },
  ];

  const tones = [
    { id: 'playful', label: 'Playful', icon: Smile, description: 'Fun and energetic' },
    { id: 'luxury', label: 'Luxury', icon: Sparkles, description: 'Premium and sophisticated' },
    { id: 'eco', label: 'Eco', icon: Shield, description: 'Sustainable and natural' },
    { id: 'bold', label: 'Bold', icon: Zap, description: 'Strong and impactful' },
  ];

  // Theme label (default to General Campaign)
  const themeLabel = useMemo(
    () => campaignThemes.find((t) => t.id === theme)?.label || 'General Campaign',
    [theme]
  );

  const canContinue = useMemo(() => {
    switch (currentStep) {
      case 0:
        return !!theme; // theme required
      case 1:
        return true; // assets optional
      case 2:
        return description.trim().length > 0;
      case 3:
        return !!tone;
      case 4:
        return audience.trim().length > 0;
      default:
        return true;
    }
  }, [currentStep, description, tone, audience, theme]);

  const handleUpload = (files: File[] | null) => {
    if (!files || files.length === 0) return;

    // Only accept images, enforce 10MB max per file
    const images = files.filter((f) => f.type.startsWith('image/'));
    const tooLarge = images.filter((f) => f.size > 10 * 1024 * 1024);

    if (tooLarge.length > 0) {
      setError(`These files exceed 10MB and were skipped: ${tooLarge.map((f) => f.name).join(', ')}`);
    }

    const accepted = images.filter((f) => f.size <= 10 * 1024 * 1024);
    if (accepted.length === 0) return;

    setUploadedAssets((prev) => [...prev, ...accepted]);
    const newPreviews = accepted.map((f) => URL.createObjectURL(f));
    setAssetPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeAsset = (index: number) => {
    setUploadedAssets((prev) => prev.filter((_, i) => i !== index));
    setAssetPreviews((prev) => {
      const url = prev[index];
      try { URL.revokeObjectURL(url); } catch {}
      return prev.filter((_, i) => i !== index);
    });
  };

  const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const buildSinglePrompt = (typeId: string) => {
    // Platform-specific cropping/aspect
    let crop = '';
    switch (typeId) {
      case 'instagram-ad':
        crop = 'Use Instagram feed square 1:1 cropping, 1080x1080. Subject centered, mobile-first composition.';
        break;
      case 'facebook-ad':
        crop = 'Use Facebook link ad horizontal 1.91:1 cropping, ~1200x628. Keep text within safe areas.';
        break;
      case 'twitter-ad':
        crop = 'Use X (Twitter) horizontal 16:9 cropping, ~1200x675. Strong left-to-right visual flow.';
        break;
      case 'email-campaign':
      default:
        crop = 'Use email banner 2:1 cropping, ~1200x600. Clear focal point with readable overlay text.';
        break;
    }

    return `System persona:
You are AdGen, an AI-powered Marketing Studio.
- Act as a professional marketing and branding agency.
- Help businesses create campaigns and brand kits instantly.
- Always produce results that are polished, practical, and usable in real-world marketing.

Outputs should always include:
- For Marketing Campaigns:
  - 2 ad copy variations (concise, high-conversion).
  - 2 captions with hashtags.
  - 3 banner headlines.
  - 3 ad creatives (images).
- For Brand Startup:
  - 2 slogans/taglines.
  - A 3-color palette (with hex codes).
  - Suggested typography styles (e.g., modern, playful, luxury).
  - A simple logo concept description (to pair with an image).

Constraints:
- Keep outputs clear, concise, and ready-to-use.
- Maintain consistency in the tone/style provided by the user.
- If the user uploads a product image or logo, ensure it appears consistently in prompts for images.

Tone:
- Creative, modern, and professional. Avoid generic, boring results.

Campaign Inputs
|- Campaign Platform: ${campaignTypes.find((t) => t.id === typeId)?.label || ''}
- Campaign Theme: ${themeLabel}
- Product Description: ${description}
- Tone/Style: ${tone}
- Target Audience: ${audience}
- Uploads: ${uploadedAssets.length} image asset(s) attached below as inline data (use them in all creatives where appropriate)

Guidance for Theme
- If theme is 'General Campaign', create evergreen, broadly applicable content.
- If theme is specific (e.g., Black Friday, Product Launch), reflect it in tone, offers, and visuals.

Platform-specific image guidance
- ${crop}
- Ensure cropping and composition match the platform above.

Output Requirements (return in one response):
1) Return a single JSON object as the FIRST text part exactly with the shape:
{
  "adCopy": ["...", "..."],
  "captions": ["...", "..."],
  "bannerHeadlines": ["...", "...", "..."]
}
- adCopy: 2 variations; short, punchy, 50-100 words max, conversion-focused.
- captions: 2 variations; engaging tone; include 5-10 relevant, on-brand hashtags.
- bannerHeadlines: 3 variations under 8-10 words; punchy and clear.

2) AFTER the JSON text part, return EXACTLY 3 image parts (inline image bytes) that visually match the campaign.
- Each image must reflect the product, tone (${tone}), target audience (${audience}), and the uploaded assets (if any: incorporate logo/product consistently).
- Prefer photorealistic, high-quality marketing visuals.
- Follow platform cropping: ${crop}
- Suggested formats: image/png or image/jpeg.

Notes
- Do not wrap JSON in code fences.
- Provide only one JSON object text part before the images.
- Then provide 3 inline image parts, one per image, in the order Image 1, Image 2, Image 3.
`;
  };

  const generate = async () => {
    setIsGenerating(true);
    setError('');
    setMultiResult(null);

    try {
      // Pre-encode uploaded assets once
      const inlineAssets: { mimeType: string; data: string }[] = [];
      for (const file of uploadedAssets) {
        const { data, mimeType } = await geminiImageService.fileToBase64(file);
        inlineAssets.push({ mimeType, data });
      }

      const aggregated: MultiGeneratedContent = {};
      for (const ct of campaignTypes) {
        const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
        parts.push({ text: buildSinglePrompt(ct.id) });
        for (const a of inlineAssets) parts.push({ inlineData: a });

        const response = await geminiImageService.generateFromText({ parts });
        if (response.error) throw new Error(response.error);

        let parsed: { adCopy?: string[]; captions?: string[]; instagramCaptions?: string[]; bannerHeadlines?: string[] } = {};
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

        const imageUrls: string[] = [];
        for (const img of response.images || []) {
          const url = geminiImageService.base64ToBlob(img.data, `image/${img.format || 'png'}`);
          imageUrls.push(url);
        }

        aggregated[ct.id] = {
          adCopy: parsed.adCopy || [],
          captions: (parsed.captions || parsed.instagramCaptions || []),
          bannerHeadlines: parsed.bannerHeadlines || [],
          adCreatives: imageUrls,
        };
      }

      setMultiResult(aggregated);
      setCurrentStep(steps.length - 1);
      // Set only Instagram expanded by default
      setExpandedSections({ 'instagram-ad': true });
      
      // Save project to history
      const campaignData = {
        type: theme,
        tone: tone,
        audience: audience,
        description: description,
        prompt: `Campaign: ${themeLabel}, Tone: ${tone}, Audience: ${audience}`,
        content: aggregated
      };
      
      const saveResult = await projectService.saveMarketingProject({
        title: `${themeLabel} - ${new Date().toLocaleDateString()}`,
        campaignData
      });
      
      if (saveResult.error) {
        console.error('Failed to save project:', saveResult.error);
      } else {
        console.log('Project saved successfully');
      }
    } catch (e: any) {
      console.error('Generation failed:', e);
      setError(e?.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch (e) { console.error(e); }
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ad-creative-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const editImage = async (imageUrl: string) => {
    try {
      // Convert blob URL to base64 for the editor
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const base64 = base64data.split(',')[1];
        navigate('/editor', { 
          state: { 
            imageData: base64,
            mimeType: blob.type,
            format: blob.type.split('/')[1] || 'png'
          } 
        });
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Failed to prepare image for editing:', error);
    }
  };
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const reset = () => {
    setCurrentStep(0);
    setTheme('general');
    setUploadedAssets([]);
    assetPreviews.forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
    setAssetPreviews([]);
    setDescription('');
    setTone('');
    setAudience('');
    setMultiResult(null);
    setError('');
  };

  return (
    <Layout showNavbar>
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
        
          {!multiResult && (
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <div className="flex items-center justify-between overflow-x-auto scrollbar-hide">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 ${
                      i === currentStep ? 'bg-black dark:bg-white text-white dark:text-black' : i < currentStep ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-white/20 text-gray-600 dark:text-white/60'
                    }`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-8 sm:w-10 lg:w-14 h-1 mx-1 sm:mx-2 ${i < currentStep ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-white/20'}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="hidden sm:flex justify-between mt-2">
                {steps.map((s, i) => (
                  <span key={s} className={`text-xs ${i === currentStep ? 'text-black dark:text-white font-medium' : 'text-gray-500 dark:text-white/60'}`}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={multiResult ? 'results' : currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[500px]"
            >
            {!multiResult ? (
              <>
              {currentStep === 0 && (
                <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 lg:space-y-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Step 1: Campaign Theme</h2>
                  <div className="card p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {campaignThemes.map((ct) => {
                        const Icon = ct.icon;
                        return (
                          <button
                            key={ct.id}
                            onClick={() => { setTheme(ct.id); setTimeout(next, 200); }}
                            className={`p-3 sm:p-4 lg:p-5 rounded-lg border-2 transition-all ${theme === ct.id ? 'border-black dark:border-white bg-gray-50 dark:bg-white/10' : 'border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/40'}`}
                          >
                            <Icon className="w-6 h-6 mb-2 mx-auto text-black dark:text-white" />
                            <p className="font-medium text-black dark:text-white text-sm">{ct.label}</p>
                            <p className="text-xs text-gray-600 dark:text-white/60 mt-1">{ct.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6 lg:space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Step 2: Upload Assets</h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 mt-1 sm:mt-2">Upload logo and/or product photos (optional)</p>
                  </div>
                  <div className="card p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

                  <div
                    className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
                      dragActive ? 'border-black dark:border-white bg-gray-50 dark:bg-white/10' : 'border-gray-300 dark:border-white/30'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const files = Array.from(e.dataTransfer.files || []);
                      handleUpload(files);
                    }}
                  >
                    <input
                      type="file"
                      id="asset-upload"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleUpload(Array.from(e.target.files || []))}
                    />
                    <label htmlFor="asset-upload" className="cursor-pointer inline-flex flex-col items-center">
                      <Upload className="w-10 h-10 text-gray-400 dark:text-white/40 mb-2" />
                      <span className="text-gray-600 dark:text-white/60">Click to upload or drag and drop</span>
                      <span className="text-xs text-gray-500 dark:text-white/40">PNG, JPG, GIF up to 10MB each</span>
                    </label>
                  </div>

                  {assetPreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {assetPreviews.map((url, idx) => (
                        <div key={idx} className="relative">
                          <img src={url} alt={`Asset ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <button onClick={() => removeAsset(idx)} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                    <div className="flex justify-between">
                      <button onClick={back} className="btn-secondary flex items-center"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                      <button onClick={next} disabled={!canContinue} className="btn-primary flex items-center">Continue <ArrowRight className="w-4 h-4 ml-2" /></button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6 lg:space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Step 3: Product Description</h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 mt-1 sm:mt-2">Tell us about your product</p>
                  </div>
                  <div className="card p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

                    <div className="flex justify-end mb-3 space-x-3">
                      <InlineMicButton 
                        onTranscript={(text) => setDescription(text)} 
                        autoSubmit 
                        onAutoSubmit={() => next()} 
                      />
                      <span className="text-gray-400">or</span>
                      <div className="flex items-center text-gray-600 dark:text-white/60 text-sm"><Type className="w-4 h-4 mr-1" /> Type below</div>
                    </div>

                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      placeholder="Describe your product, benefits, what makes it unique, etc."
                      className="input resize-none"
                    />

                    <div className="flex justify-between">
                      <button onClick={back} className="btn-secondary flex items-center"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                      <button onClick={next} disabled={!canContinue} className="btn-primary flex items-center">Continue <ArrowRight className="w-4 h-4 ml-2" /></button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6 lg:space-y-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Step 4: Tone/Style</h2>
                  <div className="card p-4 sm:p-6 lg:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {tones.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => { setTone(t.id); setTimeout(next, 200); }}
                          className={`p-4 sm:p-6 rounded-lg border-2 transition-all ${tone === t.id ? 'border-black dark:border-white bg-gray-50 dark:bg-white/10' : 'border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/40'}`}
                        >
                          <Icon className="w-7 h-7 mb-2 mx-auto text-black dark:text-white" />
                          <p className="font-medium text-black dark:text-white">{t.label}</p>
                          <p className="text-xs text-gray-600 dark:text-white/60">{t.description}</p>
                        </button>
                      );
                    })}
                    </div>

                    <div className="flex justify-between mt-6">
                      <button onClick={back} className="btn-secondary flex items-center"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6 lg:space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Step 5: Audience</h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 mt-1 sm:mt-2">Describe your target audience</p>
                  </div>
                  <div className="card p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                    <div className="flex items-center text-gray-600 dark:text-white/60"><Users className="w-5 h-5 mr-2" /> Target Audience</div>
                    <textarea
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      rows={4}
                      placeholder="E.g., Young professionals 25-35, eco-conscious, urban lifestyle, values premium quality and sustainability"
                      className="input resize-none"
                    />
                    <div className="flex justify-between">
                      <button onClick={back} className="btn-secondary flex items-center"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                      <button onClick={next} disabled={!canContinue} className="btn-primary flex items-center">Continue <ArrowRight className="w-4 h-4 ml-2" /></button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                  <div className="text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Step 6: Generate Results</h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 mt-1 sm:mt-2">Review your campaign settings and generate content</p>
                  </div>
                  <div className="card p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                    <div className="bg-gray-50 dark:bg-white/10 rounded-lg p-4 sm:p-6 space-y-2 text-xs sm:text-sm">
                      <div><span className="font-medium text-gray-700 dark:text-white/80">Theme:</span> <span className="text-black dark:text-white">{themeLabel}</span></div>
                      <div><span className="font-medium text-gray-700 dark:text-white/80">Assets:</span> <span className="text-black dark:text-white">{uploadedAssets.length} file(s)</span></div>
                      <div><span className="font-medium text-gray-700 dark:text-white/80">Product:</span> <span className="text-black dark:text-white">{description || '—'}</span></div>
                      <div><span className="font-medium text-gray-700 dark:text-white/80">Tone:</span> <span className="text-black dark:text-white">{tone || '—'}</span></div>
                      <div><span className="font-medium text-gray-700 dark:text-white/80">Audience:</span> <span className="text-black dark:text-white">{audience || '—'}</span></div>
                    </div>

                    <div className="flex justify-between">
                    <button onClick={back} className="btn-secondary flex items-center"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>
                    <button onClick={generate} disabled={isGenerating} className="btn-primary flex items-center">
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" /> Generate Campaign
                        </>
                      )}
                    </button>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-600">{error}</p></div>
                    )}
                  </div>
                </div>
              )}
              </>
            ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Campaign Results</h2>
                <button onClick={reset} className="btn-secondary">Create New</button>
              </div>

              {campaignTypes.map((ct, index) => {
                const r = multiResult?.[ct.id];
                if (!r) return null;
                const label = 'Captions';
                const isExpanded = expandedSections[ct.id];
                
                return (
                  <motion.div 
                    key={ct.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="space-y-4 border border-gray-200 dark:border-white/10 rounded-xl p-4 sm:p-6"
                  >
                    {/* Section Header with Collapse Toggle */}
                    <button
                      onClick={() => toggleSection(ct.id)}
                      className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
                    >
                      <h3 className="text-lg sm:text-xl font-semibold text-black dark:text-white">{ct.label}</h3>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 dark:text-white/60" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 dark:text-white/60" />
                      )}
                    </button>

                    {/* Collapsible Content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
                          <h4 className="text-base sm:text-lg font-semibold mb-3 text-black dark:text-white">Ad Copy (2)</h4>
                          <div className="space-y-3">
                            {r.adCopy.map((c, i) => (
                              <div key={i} className="bg-gray-50 dark:bg-white/10 rounded-lg p-3 sm:p-4 relative">
                                <p className="text-sm sm:text-base text-gray-900 dark:text-white pr-10">{c}</p>
                                <button onClick={() => copyToClipboard(c)} className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-white/20 rounded"><Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black dark:text-white" /></button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
                          <h4 className="text-base sm:text-lg font-semibold mb-3 text-black dark:text-white">{label} (2)</h4>
                          <div className="space-y-3">
                            {r.captions.map((c, i) => (
                              <div key={i} className="bg-gray-50 dark:bg-white/10 rounded-lg p-3 sm:p-4 relative">
                                <p className="text-sm sm:text-base text-gray-900 dark:text-white whitespace-pre-line pr-10">{c}</p>
                                <button onClick={() => copyToClipboard(c)} className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-white/20 rounded"><Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black dark:text-white" /></button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
                          <h4 className="text-base sm:text-lg font-semibold mb-3 text-black dark:text-white">Banner Headlines (3)</h4>
                          <div className="space-y-3">
                            {r.bannerHeadlines.map((h, i) => (
                              <div key={i} className="bg-gray-50 dark:bg-white/10 rounded-lg p-3 sm:p-4 relative">
                                <p className="text-sm sm:text-base lg:text-lg text-gray-900 dark:text-white font-semibold pr-10">{h}</p>
                                <button onClick={() => copyToClipboard(h)} className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-white/20 rounded"><Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black dark:text-white" /></button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {r.adCreatives.length > 0 && (
                          <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
                            <h4 className="text-base sm:text-lg font-semibold mb-3 text-black dark:text-white">Ad Creatives (3)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                              {r.adCreatives.map((url, i) => (
                                <div key={i} className="space-y-2 sm:space-y-3">
                                  <img src={url} alt={`${ct.label} Creative ${i + 1}`} className="w-full h-40 sm:h-48 object-cover rounded-lg" />
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <button onClick={() => downloadImage(url, i)} className="flex-1 btn-secondary text-xs sm:text-sm py-1.5 sm:py-2"><Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Download</button>
                                    <button onClick={() => editImage(url)} className="flex-1 btn-secondary text-xs sm:text-sm py-1.5 sm:py-2"><Edit2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Edit</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
            )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}

export default Marketing;

