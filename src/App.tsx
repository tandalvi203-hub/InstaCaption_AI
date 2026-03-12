/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  Image as ImageIcon,
  X,
  Rocket,
  Palette,
  Flame,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateCaptions, CaptionResult } from './services/gemini';

const STYLES = [
  { id: 'English', label: '🇬🇧 English', icon: Globe },
  { id: 'Marathi', label: 'मराठी Marathi', icon: Globe },
  { id: 'Tadka Mix', label: '🌶 Tadka Mix', icon: Flame },
  { id: 'Aesthetic', label: '✨ Aesthetic', icon: Palette },
  { id: 'Viral', label: '🚀 Viral', icon: Rocket },
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState('English');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setMimeType(file.type);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateCaptions(image, mimeType, selectedStyle);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Sparkle background effect
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  useEffect(() => {
    const newSparkles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="relative min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Background Sparkles */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="sparkle absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            boxShadow: '0 0 10px white',
          }}
        />
      ))}

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight glow-text">
            InstaCaption AI
          </h1>
        </div>
        <p className="text-lg opacity-90 font-medium">
          Turn your photos into viral captions ✨
        </p>
      </motion.header>

      <main className="w-full max-w-2xl z-10 space-y-6">
        {/* Upload Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 md:p-8"
        >
          <h2 className="text-xl font-semibold mb-6 text-center">Upload Your Photo</h2>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed border-white/40 rounded-3xl p-8 transition-all cursor-pointer group hover:border-white/60 hover:bg-white/5 ${image ? 'p-4' : 'py-12'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <AnimatePresence mode="wait">
              {!image ? (
                <motion.div 
                  key="upload-prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="p-4 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium">Drag & Drop Image or Upload</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="image-preview"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group/preview"
                >
                  <img 
                    src={image} 
                    alt="Preview" 
                    className="w-full max-h-[400px] object-contain rounded-2xl shadow-2xl border-4 border-white/20"
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                      setResult(null);
                    }}
                    className="absolute -top-3 -right-3 p-2 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {image && (
            <div className="mt-8 space-y-6">
              <div className="text-center">
                <p className="text-sm uppercase tracking-widest opacity-70 mb-4 font-bold">Choose Caption Style</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                        selectedStyle === style.id 
                        ? 'insta-gradient shadow-lg scale-105 ring-2 ring-white/50' 
                        : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <style.icon className="w-4 h-4" />
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 rounded-2xl btn-gradient text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate Caption
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                {result.captions.map((caption, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card p-5 flex items-start justify-between gap-4 group hover:bg-white/30 transition-all"
                  >
                    <div className="flex gap-3">
                      <Sparkles className="w-5 h-5 text-yellow-300 shrink-0 mt-1" />
                      <p className="text-lg leading-relaxed">{caption}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(caption, idx)}
                      className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/40 transition-all text-sm font-bold"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Hashtags */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center pt-4"
              >
                <p className="text-sm uppercase tracking-widest opacity-70 mb-4 font-bold">• Suggested Hashtags •</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {result.hashtags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors cursor-default"
                    >
                      #{tag.replace(/^#/, '')}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center opacity-60 text-sm">
        <p>© 2026 InstaCaption AI • Powered by Gemini</p>
      </footer>
    </div>
  );
}
