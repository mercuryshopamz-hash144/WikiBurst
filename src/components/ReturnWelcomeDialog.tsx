import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Sparkles, Flame, MoveRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { haptic } from '../lib/haptics';

export function ReturnWelcomeDialog() {
  const { companionName, readingHistory, setCompanionMood, addXp, setShowReturnWelcome } = useStore();

  const unfinishedArticle = readingHistory.length > 0 ? readingHistory[0] : null;

  const EMOJIS: Record<string, string> = {
    Einstein: '👨‍🔬',
    'Da Vinci': '🎨',
    Cleopatra: '👑',
    Socrates: '🏛️',
    Oppenheimer: '⚛️',
    Aura: '✨'
  };

  const handleClaim = () => {
    haptic.success();
    confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
    addXp(100);
    setCompanionMood('excited');
    setShowReturnWelcome(false);
  };

  const handleClose = () => {
    setShowReturnWelcome(false);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-sm bg-[#0A0A0A] border border-teal-500/30 shadow-[0_0_80px_rgba(45,212,191,0.15)] rounded-[32px] p-8 text-center relative overflow-hidden"
        >
          <button onClick={handleClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
            <X size={20} />
          </button>
          
          <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border border-teal-500/20 shadow-inner">
            {EMOJIS[companionName] || '✨'}
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome back!</h2>
          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
            {companionName} missed guiding you. Let's rebuild your momentum.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between text-left">
            <div>
              <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mb-1">Momentum Boost</p>
              <p className="text-white font-semibold text-lg">+100 XP</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
               <Flame size={24} />
            </div>
          </div>

          {unfinishedArticle && (
            <div className="text-left mb-8 border-l-2 border-teal-500 pl-4 py-1">
              <p className="text-xs text-neutral-500 font-medium mb-1">Continue exploring:</p>
              <p className="text-sm text-white font-semibold line-clamp-1">{unfinishedArticle.title}</p>
            </div>
          )}

          <button 
            onClick={handleClaim}
            className="w-full py-4 rounded-full font-bold bg-teal-400 text-[#0A0A0A] active:scale-95 transition-all text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(45,212,191,0.3)] flex items-center justify-center gap-2"
          >
            Claim & Continue <MoveRight size={18} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
