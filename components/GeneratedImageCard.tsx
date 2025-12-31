import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { Download, Trash2, Maximize2, X, Zap, Loader2 } from 'lucide-react';

interface GeneratedImageCardProps {
  image: GeneratedImage;
  onDelete: (id: string) => void;
  onUpscale?: (image: GeneratedImage) => void;
  isUpscaling?: boolean;
}

const GeneratedImageCard: React.FC<GeneratedImageCardProps> = ({ 
  image, 
  onDelete, 
  onUpscale,
  isUpscaling = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `pixelgen-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleUpscaleClick = async () => {
    if (!onUpscale) return;

    // Check for API Key selection requirement for Gemini 3 Pro models
    if ((window as any).aistudio) {
      try {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
          // We assume if openSelectKey resolves, the user has selected a key.
          // In a real scenario, we might want to double-check hasSelectedApiKey again.
        }
        
        // Check again to be sure, or just proceed if we trust the flow
        const keySelected = await (window as any).aistudio.hasSelectedApiKey();
        if (keySelected) {
           onUpscale(image);
        }
      } catch (e) {
        console.log("API Key selection cancelled or failed", e);
        // User likely closed the dialog, do nothing
      }
    } else {
      // Fallback for environments where aistudio is not injected (e.g. local dev without wrapper)
      // Just try to call it
      onUpscale(image);
    }
  };

  const isHighRes = image.resolution === '4K';

  return (
    <>
      <div 
        className="group relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-slate-600 hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-square w-full relative bg-slate-900">
            <img 
              src={image.url} 
              alt={image.prompt} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Badges */}
            <div className="absolute top-3 right-3 flex gap-2">
               {isHighRes && (
                 <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                   4K
                 </span>
               )}
            </div>

            {/* Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

            {/* Actions */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 transform transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <p className="text-white text-sm font-medium line-clamp-2 mb-3 drop-shadow-md">
                {image.prompt}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-1 rounded backdrop-blur-sm">
                  {image.aspectRatio}
                </span>
                <div className="flex space-x-2">
                   {/* Upscale Button */}
                   {!isHighRes && onUpscale && (
                     <button
                       onClick={handleUpscaleClick}
                       disabled={isUpscaling}
                       className={`p-2 rounded-full backdrop-blur-md transition-colors ${isUpscaling ? 'bg-indigo-500/50 cursor-wait' : 'bg-white/10 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200'}`}
                       title="Upscale to 4K"
                     >
                        {isUpscaling ? <Loader2 size={16} className="animate-spin text-white" /> : <Zap size={16} />}
                     </button>
                   )}

                   <button 
                    onClick={toggleFullscreen}
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-indigo-300 transition-colors backdrop-blur-md"
                    title="View Fullscreen"
                  >
                    <Maximize2 size={16} />
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-emerald-300 transition-colors backdrop-blur-md"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(image.id)}
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 transition-colors backdrop-blur-md"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <button 
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>
          
          <img 
            src={image.url} 
            alt={image.prompt}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
          />
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full flex gap-4 border border-white/10">
             <button onClick={handleDownload} className="text-white hover:text-indigo-400 transition-colors flex items-center gap-2 text-sm font-medium">
                <Download size={18} /> Download High-Res
             </button>
             {isHighRes && <span className="text-amber-400 flex items-center gap-1 text-sm font-bold px-2"><Zap size={14} fill="currentColor"/> 4K Ultra HD</span>}
          </div>
        </div>
      )}
    </>
  );
};

export default GeneratedImageCard;