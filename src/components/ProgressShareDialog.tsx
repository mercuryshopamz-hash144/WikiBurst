import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Share2, X, Download, Loader2, Brain, Flame, Target } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { haptic } from '../lib/haptics';
import { useStore } from '../store/useStore';

interface ProgressShareDialogProps {
  onClose: () => void;
}

export function ProgressShareDialog({ onClose }: ProgressShareDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { xp, streak, level, readArticleIds, companionName } = useStore();

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    haptic.medium();
    
    try {
      const dataUrl = await htmlToImage.toJpeg(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'wikiburst-progress.jpg', { type: 'image/jpeg' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Bilgi İmparatorluğu Progress',
          text: `I've explored ${readArticleIds.length} concepts and reached Level ${level} on Bilgi İmparatorluğu! 🔥`,
        });
      } else {
        const link = document.createElement('a');
        link.download = 'wikiburst-progress.jpg';
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

      <div 
        ref={cardRef}
        className="w-full max-w-[320px] aspect-[4/5] rounded-[32px] overflow-hidden relative shadow-[0_30px_60px_rgba(45,212,191,0.2)] bg-[#0A0A0A] border border-teal-500/20 flex flex-col p-8"
        style={{ transform: 'scale(1)' }}
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/20 blur-[80px] rounded-full pointer-events-none -ml-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col h-full items-center text-center justify-center">
          <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mb-6 shadow-inner border border-teal-500/30">
            <Brain size={40} className="text-teal-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 leading-tight tracking-tight px-4">Master Explorer</h2>
          <p className="text-sm text-neutral-400 mb-8 font-medium">Level {level} • {xp} XP</p>
          
          <div className="flex gap-4 mb-6">
             <div className="flex flex-col items-center bg-black/40 backdrop-blur-md border border-white/5 p-4 rounded-3xl w-24">
                <Flame className="text-orange-400 mb-2" size={24} />
                <span className="text-2xl font-bold text-white leading-none mb-1">{streak}</span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Days</span>
             </div>
             <div className="flex flex-col items-center bg-black/40 backdrop-blur-md border border-white/5 p-4 rounded-3xl w-24">
                <Target className="text-teal-400 mb-2" size={24} />
                <span className="text-2xl font-bold text-white leading-none mb-1">{readArticleIds.length}</span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Concepts</span>
             </div>
          </div>
          
          <p className="text-xs text-neutral-500 tracking-wider">With my companion <span className="text-teal-400 font-bold">{companionName}</span></p>
        </div>

        <div className="relative z-10 mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Built my brain on</span>
              <span className="text-sm font-bold text-white tracking-wide">Bilgi İmparatorluğu</span>
           </div>
           <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
           </div>
        </div>
      </div>

      <button 
        onClick={handleShare}
        disabled={isGenerating}
        className="mt-8 bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
      >
        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
        {isGenerating ? 'Generating...' : 'Share Progress'}
      </button>
    </motion.div>
  );
}
