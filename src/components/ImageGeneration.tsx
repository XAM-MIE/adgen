import React, { useState } from 'react';
import { 
  Sparkles, 
  Download, 
  RefreshCw, 
  Copy, 
  Image as ImageIcon,
  Edit3,
  Palette,
  Settings,
  Trash2
} from 'lucide-react';
import MediaInput from './MediaInput';
import geminiImageService, { 
  ImageGenerationResult, 
  GeneratedImage 
} from '../services/geminiImageService';

interface ImageGenerationProps {
  mode?: 'generate' | 'edit' | 'restore';
  title?: string;
  placeholder?: string;
  className?: string;
  onImageGenerated?: (result: ImageGenerationResult) => void;
}

export function ImageGeneration({ 
  mode = 'generate',
  title,
  placeholder,
  className = '',
  onImageGenerated
}: ImageGenerationProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [textResponse, setTextResponse] = useState('');
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const getTitle = () => {
    if (title) return title;
    switch (mode) {
      case 'edit': return 'Edit Images with AI';
      case 'restore': return 'Restore & Enhance Photos';
      default: return 'Generate Images with AI';
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    switch (mode) {
      case 'edit': 
        return 'Describe how you want to edit the uploaded image(s)... e.g., "Change the background to a sunset beach scene" or "Make the person wear a red jacket"';
      case 'restore':
        return 'Describe any specific restoration needs... e.g., "Restore and colorize this black and white photo" or "Enhance quality and fix scratches"';
      default:
        return 'Describe the image you want to generate... e.g., "A modern minimalist logo for a tech startup" or "A professional headshot photo for marketing materials"';
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    if (mode !== 'generate' && selectedFiles.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedImages([]);
    setTextResponse('');

    try {
      let result: ImageGenerationResult;

      if (mode === 'generate') {
        // Text-to-image generation
        result = await geminiImageService.generateFromText({ prompt });
      } else if (selectedFiles.length === 1) {
        // Single image editing/restoration
        const fileData = await geminiImageService.fileToBase64(selectedFiles[0]);
        
        if (mode === 'restore') {
          result = await geminiImageService.restorePhoto(
            fileData.data, 
            fileData.mimeType, 
            prompt.trim() || undefined
          );
        } else {
          result = await geminiImageService.editImage({
            prompt,
            imageData: fileData.data,
            mimeType: fileData.mimeType
          });
        }
      } else {
        // Multiple image editing
        const imageData = await Promise.all(
          selectedFiles.map(file => geminiImageService.fileToBase64(file))
        );
        
        result = await geminiImageService.editMultipleImages({
          prompt,
          images: imageData
        });
      }

      if (result.error) {
        setError(result.error);
      } else {
        setGeneratedImages(result.images);
        setTextResponse(result.textResponse || '');
        onImageGenerated?.(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (image: GeneratedImage, index: number) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `generated-image-${timestamp}-${index + 1}`;
    geminiImageService.downloadImage(image.data, filename, image.format);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
  };

  const clearAll = () => {
    setPrompt('');
    setGeneratedImages([]);
    setTextResponse('');
    setError('');
    setSelectedFiles([]);
    setSelectedImageIndex(null);
  };

  const selectImageForEdit = (image: GeneratedImage, index: number) => {
    setSelectedImageIndex(index);
    // Convert generated image back to File for editing
    // This would require additional implementation if we want to chain edits
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{getTitle()}</h2>
        <p className="text-gray-600">
          {mode === 'generate' && 'Create stunning images from text descriptions'}
          {mode === 'edit' && 'Upload images and describe how you want them modified'}
          {mode === 'restore' && 'Upload old or damaged photos for AI-powered restoration'}
        </p>
      </div>

      {/* Image Upload (for edit/restore modes) */}
      {mode !== 'generate' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            Upload Images
          </h3>
          <MediaInput
            onFilesSelected={setSelectedFiles}
            maxFiles={mode === 'restore' ? 1 : 3}
            acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
            multiple={mode !== 'restore'}
          />
        </div>
      )}

      {/* Prompt Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Edit3 className="w-5 h-5 mr-2" />
            Description
          </h3>
          {prompt && (
            <button
              onClick={copyPrompt}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </button>
          )}
        </div>
        
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={getPlaceholder()}
            rows={4}
            className="input resize-none"
            disabled={isGenerating}
          />
          {prompt.length > 0 && (
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {prompt.length} characters
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex space-x-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || (mode !== 'generate' && selectedFiles.length === 0)}
          className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Sparkles className="w-5 h-5 mr-2" />
              {mode === 'generate' ? 'Generate Images' : 
               mode === 'edit' ? 'Edit Images' : 'Restore Images'}
            </div>
          )}
        </button>
        
        {(generatedImages.length > 0 || selectedFiles.length > 0 || prompt) && (
          <button
            onClick={clearAll}
            className="btn-secondary px-6 py-3 flex items-center"
            disabled={isGenerating}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Text Response */}
      {textResponse && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">AI Response</h4>
          <p className="text-sm text-blue-800">{textResponse}</p>
        </div>
      )}

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Generated Images</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleGenerate}
                className="btn-secondary flex items-center"
                disabled={isGenerating}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {generatedImages.map((image, index) => {
              const imageUrl = geminiImageService.base64ToBlob(image.data, `image/${image.format}`);
              
              return (
                <div key={index} className="card p-4 group">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={imageUrl}
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <button
                          onClick={() => downloadImage(image, index)}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                          title="Download image"
                        >
                          <Download className="w-4 h-4 text-gray-700" />
                        </button>
                        {mode === 'generate' && (
                          <button
                            onClick={() => selectImageForEdit(image, index)}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                            title="Edit this image"
                          >
                            <Edit3 className="w-4 h-4 text-gray-700" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Image {index + 1}
                      </p>
                      <p className="text-xs text-gray-500">
                        {image.format.toUpperCase()} format
                      </p>
                    </div>
                    <button
                      onClick={() => downloadImage(image, index)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGeneration;
