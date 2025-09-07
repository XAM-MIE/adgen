import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Upload, X, Download, Wand2, Mic } from 'lucide-react';
import geminiImageService from '../services/geminiImageService';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import InlineMicButton from '../components/InlineMicButton';

export default function Editor() {
  const location = useLocation() as any;
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [prompt, setPrompt] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If navigated with an image, preload it as the editing target
  useEffect(() => {
    const initial = location?.state as { imageData?: string; mimeType?: string; format?: string } | undefined;
    if (initial?.imageData) {
      try {
        const mimeType = initial.mimeType || `image/${initial.format || 'png'}`;
        const byteStr = atob(initial.imageData);
        const bytes = new Uint8Array(byteStr.length);
        for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
        const blob = new Blob([bytes], { type: mimeType });
        const f = new File([blob], `imported.${(initial.format || 'png')}`, { type: mimeType });
        setFile(f);
        const url = URL.createObjectURL(blob);
        setPreview(url);
      } catch (e) {
        console.warn('Failed to preload editor image:', e);
      }
    }
  }, [location]);

  const handleFile = async (f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const remove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview('');
    setFile(null);
    setResultUrl('');
  };

  const runEdit = async (overridePrompt?: string) => {
    const promptToUse = (overridePrompt ?? prompt).trim();
    if (!file || !promptToUse) {
      setError('Add an image and a prompt.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data, mimeType } = await geminiImageService.fileToBase64(file);
      const res = await geminiImageService.editImage({ prompt: promptToUse, imageData: data, mimeType });
      if (res.error) throw new Error(res.error);
      if (res.images && res.images.length) {
        const url = geminiImageService.base64ToBlob(res.images[0].data, `image/${res.images[0].format || 'png'}`);
        setResultUrl(url);
      } else {
        setError('No edited image returned.');
      }
    } catch (e: any) {
      setError(e?.message || 'Edit failed.');
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'edited.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Layout showNavbar>
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8 lg:mb-10"
          >
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black dark:text-white">Ad Image Editor</h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 mt-1">Edit product images with AI</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
            {/* Left: Upload and Prompt */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card p-4 sm:p-5 lg:p-6"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">Upload Image</label>
                {!file ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="editor-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                    />
                    <label htmlFor="editor-upload" className="cursor-pointer inline-flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-600 dark:text-white/60">Click to upload</span>
                      <span className="text-xs text-gray-500 dark:text-white/50">PNG, JPG up to 10MB</span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img src={preview} className="w-full h-64 object-cover rounded-lg" />
                    <button onClick={remove} className="absolute top-2 right-2 p-1 bg-white dark:bg-black rounded-full shadow">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-black dark:text-white">Edit Prompt</label>
                  <InlineMicButton onTranscript={(t) => setPrompt(t)} autoSubmit onAutoSubmit={(text) => { if (file) runEdit(text || undefined); }} />
                </div>
                <textarea
                  className="input h-28 resize-none bg-white dark:bg-black border-gray-300 dark:border-white/20 text-black dark:text-white"
                  placeholder="e.g., Replace the background with a clean studio white, increase contrast, keep the product centered"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {error && (
                <div className="mt-3 text-sm text-red-600">{error}</div>
              )}

              <div className="mt-4">
                <button onClick={runEdit} disabled={loading || !file || !prompt.trim()} className="btn-primary w-full flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Editing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" /> Apply Edit
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Right: Result */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card p-4 sm:p-5 lg:p-6"
            >
              <h3 className="text-lg font-semibold text-black dark:text-white mb-3">Result</h3>
              <AnimatePresence mode="wait">
              {resultUrl ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={resultUrl} className="w-full h-80 object-cover rounded-lg mb-3" />
                  <button onClick={download} className="btn-secondary w-full flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-80 rounded-lg border border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-500 dark:text-white/60"
                >
                  No result yet
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

