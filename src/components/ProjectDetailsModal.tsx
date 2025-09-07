import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, Palette, Type, Sparkles, Zap, Edit2 } from 'lucide-react';
import { ProjectWithDetails } from '../services/projectService';
import geminiImageService from '../services/geminiImageService';
import { useNavigate } from 'react-router-dom';

interface ProjectDetailsModalProps {
  project: ProjectWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailsModal({ project, isOpen, onClose }: ProjectDetailsModalProps) {
  const navigate = useNavigate();
  
  if (!project) return null;

  const isMarketing = project.type === 'marketing';
  const data = project.data;
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadImage = (imageUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white dark:bg-black rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-200 dark:border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white">
                    {project.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-white/60 mt-1">
                    {isMarketing ? 'Marketing Campaign' : 'Brand Identity'} • Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-white/60" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 sm:p-6 space-y-6">
                {isMarketing ? (
                  // Marketing Campaign Results
                  <>
                    {/* Campaign Details */}
                    <div className="card p-4">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">Campaign Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-white/60">Theme:</span>
                          <p className="font-medium text-black dark:text-white">{data.type || 'General'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-white/60">Tone:</span>
                          <p className="font-medium text-black dark:text-white capitalize">{data.tone || 'Professional'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-white/60">Audience:</span>
                          <p className="font-medium text-black dark:text-white">{data.audience || 'General'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Generated Content */}
                    {data.content && (
                      <>
                        {/* Ad Copy */}
                        {data.content.facebook?.adCopy && (
                          <div className="card p-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">
                              Ad Copy ({data.content.facebook.adCopy.length})
                            </h3>
                            <div className="space-y-3">
                              {data.content.facebook.adCopy.map((copy: string, i: number) => (
                                <div key={i} className="bg-gray-50 dark:bg-white/10 rounded-lg p-3 relative group">
                                  <p className="text-sm text-gray-900 dark:text-white pr-10">{copy}</p>
                                  <button
                                    onClick={() => copyToClipboard(copy)}
                                    className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-white/20 rounded transition-all"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-white/60" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Captions */}
                        {data.content.instagram?.captions && (
                          <div className="card p-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">
                              Social Captions ({data.content.instagram.captions.length})
                            </h3>
                            <div className="space-y-3">
                              {data.content.instagram.captions.map((caption: string, i: number) => (
                                <div key={i} className="bg-gray-50 dark:bg-white/10 rounded-lg p-3 relative group">
                                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line pr-10">{caption}</p>
                                  <button
                                    onClick={() => copyToClipboard(caption)}
                                    className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-white/20 rounded transition-all"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-white/60" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Ad Creatives */}
                        {(data.content.facebook?.adCreatives || data.content.instagram?.adCreatives) && (
                          <div className="card p-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">
                              Ad Creatives
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {(data.content.facebook?.adCreatives || data.content.instagram?.adCreatives || []).map((imageUrl: string, i: number) => (
                                <div key={i} className="relative group border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
                                  <img src={imageUrl} alt={`Creative ${i + 1}`} className="w-full h-48 object-cover" />
                                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={async () => {
                                          // Convert blob URL to base64 for the editor
                                          try {
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
                                                  format: blob.type.split('/')[1] || 'png',
                                                  defaultPrompt: 'Enhance the ad creative, adjust colors, improve composition, or describe your changes'
                                                } 
                                              });
                                              onClose();
                                            };
                                            reader.readAsDataURL(blob);
                                          } catch (error) {
                                            console.error('Failed to prepare image for editing:', error);
                                          }
                                        }}
                                        className="p-1.5 bg-white/90 hover:bg-white rounded text-black"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => downloadImage(imageUrl, `creative-${i + 1}.png`)}
                                        className="p-1.5 bg-white/90 hover:bg-white rounded text-black"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  // Brand Kit Results
                  <>
                    {/* Brand Details */}
                    <div className="card p-4">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">Brand Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-white/60">Industry:</span>
                          <p className="font-medium text-black dark:text-white capitalize">{data.industry}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-white/60">Style:</span>
                          <p className="font-medium text-black dark:text-white capitalize">{data.style}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-white/60">Values:</span>
                          <p className="font-medium text-black dark:text-white capitalize">{data.values}</p>
                        </div>
                      </div>
                    </div>

                    {data.brandKit && (
                      <>
                        {/* Brand Name */}
                        <div className="card p-4">
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-2">Brand Name</h3>
                          <div className="text-2xl font-bold text-black dark:text-white">{data.brandKit.name}</div>
                        </div>

                        {/* Taglines */}
                        {data.brandKit.taglines && (
                          <div className="card p-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">Taglines</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {data.brandKit.taglines.map((tagline: string, i: number) => (
                                <div key={i} className="p-2.5 bg-gray-50 dark:bg-white/10 rounded-lg text-sm text-black dark:text-white">
                                  {tagline}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Colors */}
                        {data.brandKit.colors && (
                          <div className="card p-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3 flex items-center">
                              <Palette className="w-4 h-4 mr-1.5" /> Color Palette
                            </h3>
                            <div className="space-y-2">
                              {Object.entries(data.brandKit.colors).map(([name, color]) => (
                                <div key={name} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-white/10 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-8 h-8 rounded-lg border border-gray-300 dark:border-white/20" 
                                      style={{ backgroundColor: color as string }}
                                    />
                                    <div>
                                      <div className="text-sm font-medium text-black dark:text-white capitalize">{name}</div>
                                      <div className="text-xs text-gray-500 dark:text-white/60 font-mono">{color as string}</div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(color as string)}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/20 rounded transition-colors"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-white/60" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Typography */}
                        {data.brandKit.typography && (
                          <div className="card p-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3 flex items-center">
                              <Type className="w-4 h-4 mr-1.5" /> Typography
                            </h3>
                            <div className="space-y-3">
                              <div className="p-3 bg-gray-50 dark:bg-white/10 rounded-lg">
                                <div className="text-xs text-gray-600 dark:text-white/60 mb-1">Heading Font</div>
                                <div className="text-lg font-bold text-black dark:text-white">{data.brandKit.typography.heading}</div>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-white/10 rounded-lg">
                                <div className="text-xs text-gray-600 dark:text-white/60 mb-1">Body Font</div>
                                <div className="text-base text-black dark:text-white">{data.brandKit.typography.body}</div>
                              </div>
                              {data.brandKit.typography.description && (
                                <p className="text-xs text-gray-500 dark:text-white/60 italic">
                                  {data.brandKit.typography.description}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Logo */}
                        {data.brandKit.images?.logo && (
                          <div className="card p-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-3">Logo</h3>
                            <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden bg-white">
                              <img 
                                src={geminiImageService.base64ToBlob(
                                  data.brandKit.images.logo.data, 
                                  `image/${data.brandKit.images.logo.format || 'png'}`
                                )} 
                                className="w-full h-48 object-contain p-4" 
                              />
                              <div className="p-2 border-t border-gray-200 dark:border-white/10 flex justify-end">
                                <button
                                  onClick={() => navigate('/editor', { 
                                    state: { 
                                      imageData: data.brandKit.images.logo.data, 
                                      format: data.brandKit.images.logo.format,
                                      mimeType: `image/${data.brandKit.images.logo.format || 'png'}`,
                                      defaultPrompt: 'Enhance the logo, improve contrast, refine edges, or describe your changes' 
                                    } 
                                  })}
                                  className="btn-secondary text-xs px-3 py-1.5 flex items-center"
                                >
                                  <Edit2 className="w-3 h-3 mr-1" /> Edit in Editor
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                  <button
                    onClick={() => {
                      navigate(isMarketing ? '/marketing' : '/brand');
                      onClose();
                    }}
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    Create Similar
                  </button>
                  <button onClick={onClose} className="btn-primary px-4 py-2 text-sm">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
