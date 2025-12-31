import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AspectRatioSelector from './components/AspectRatioSelector';
import GeneratedImageCard from './components/GeneratedImageCard';
import { generateImageWithGemini, upscaleImageWithGemini } from './services/geminiService';
import { AspectRatio, GeneratedImage } from './types';
import { Wand2, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Square);
  const [isGenerating, setIsGenerating] = useState(false);
  const [upscalingId, setUpscalingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pixelgen_history');
    if (saved) {
      try {
        setGeneratedImages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save to local storage on update
  useEffect(() => {
    localStorage.setItem('pixelgen_history', JSON.stringify(generatedImages));
  }, [generatedImages]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const newImage = await generateImageWithGemini(prompt, aspectRatio);
      setGeneratedImages(prev => [newImage, ...prev]);
      setPrompt(''); // Clear prompt on success to encourage next creation
    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpscale = async (image: GeneratedImage) => {
    if (upscalingId) return; // Prevent multiple upscales at once

    setUpscalingId(image.id);
    setError(null);

    try {
      const upscaledImage = await upscaleImageWithGemini(image);
      setGeneratedImages(prev => [upscaledImage, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to upscale image. Please check your API key quota or try again.");
    } finally {
      setUpscalingId(null);
    }
  };

  const handleDelete = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 pb-20">
        
        {/* Generator Section */}
        <div className="mb-12 max-w-3xl mx-auto">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Wand2 className="text-indigo-400" />
              Start Creating
            </h2>

            <form onSubmit={handleGenerate} className="space-y-6">
              
              {/* Prompt Input */}
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your imagination... (e.g., A futuristic city in the clouds, cyberpunk style, cinematic lighting)"
                  className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-base md:text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600 resize-none"
                  disabled={isGenerating}
                  maxLength={1000}
                />
                <div className="absolute bottom-4 right-4 text-xs text-slate-600">
                  {prompt.length}/1000
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
                <div className="w-full md:w-auto">
                  <label className="block text-sm text-slate-400 mb-3 font-medium">Aspect Ratio</label>
                  <AspectRatioSelector 
                    selected={aspectRatio} 
                    onChange={setAspectRatio} 
                    disabled={isGenerating}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className={`
                    w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all duration-200
                    ${isGenerating || !prompt.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/25 transform hover:-translate-y-0.5 active:translate-y-0'}
                  `}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Dreaming...
                    </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      Generate
                    </>
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
              <ImageIcon size={20} className="text-slate-500" />
              Recent Creations
            </h3>
            <span className="text-sm text-slate-500">{generatedImages.length} items</span>
          </div>

          {generatedImages.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
              <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="text-slate-600" size={32} />
              </div>
              <p className="text-slate-500 font-medium">No images generated yet</p>
              <p className="text-slate-600 text-sm mt-1">Enter a prompt above to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {generatedImages.map((img) => (
                <GeneratedImageCard 
                  key={img.id} 
                  image={img} 
                  onDelete={handleDelete}
                  onUpscale={handleUpscale}
                  isUpscaling={upscalingId === img.id}
                />
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default App;