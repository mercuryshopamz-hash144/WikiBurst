import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Share2, X, Download, Loader2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { WikiArticle } from '../lib/wikipedia';
import { haptic } from '../lib/haptics';
import { useStore } from '../store/useStore';

interface ShareDialogProps {
  article: WikiArticle;
  onClose: () => void;
}

export function ShareDialog({ article, onClose }: ShareDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    haptic.medium();
    
    try {
      const dataUrl = await htmlToImage.toJpeg(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'wikiburst-card.jpg', { type: 'image/jpeg' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: article.title,
          text: `Discovered on Bilgi İmparatorluğu: ${article.title}`,
        });
      } else {
        // Fallback to download
        const link = document.createElement('a');
        link.download = 'wikiburst-card.jpg';
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
      onClose();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
      >
        <X size={20} />
      </button>

      {/* The visible Card to capture */}
      <div 
        ref={cardRef}
        className="w-full max-w-[320px] aspect-[4/5] rounded-[32px] overflow-hidden relative shadow-2xl bg-[#0A0A0A] border border-white/10 flex flex-col pt-10 px-8 pb-8"
        style={{ transform: 'scale(1)' }}
      >
        {/* Background Image/Gradient */}
        {article.imageUrl ? (
          <div className="absolute inset-0 z-0">
             <img src={article.imageUrl} alt="" className="w-full h-[60%] object-cover opacity-80 mix-blend-luminosity" crossOrigin="anonymous" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-bl from-teal-900/40 via-[#0A0A0A] to-[#0A0A0A]"></div>
        )}

        <div className="relative z-10 flex flex-col h-full items-center text-center justify-center pt-[10%]">
          <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-[10px] font-bold tracking-widest uppercase mb-4">
             {article.category || 'Knowledge'}
          </span>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight tracking-tight px-4">{article.title}</h2>
          <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed px-2 font-medium">{article.extract}</p>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Discovered by</span>
              <span className="text-sm font-bold text-white tracking-wide">{useStore.getState().userName || 'Explorer'}</span>
           </div>
           <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Bilgi İmparatorluğu</span>
              <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">+100 XP Link</span>
           </div>
        </div>
      </div>

      <button 
        onClick={handleShare}
        disabled={isGenerating}
        className="mt-8 bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
      >
        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
        {isGenerating ? 'Generating...' : 'Share Discovery'}
      </button>
    </motion.div>
  );
}
