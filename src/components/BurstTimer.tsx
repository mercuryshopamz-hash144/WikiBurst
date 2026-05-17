import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, X, Coffee, Brain, Gamepad2, Timer, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

import { DopamineMenu } from './DopamineMenu';

export function BurstTimer() {
  const { burstActive, burstTimeRemaining, burstModeActive, tickBurst, startBurst, endBurst, setBurstMinutes, addXp } = useStore();
  const [showConfig, setShowConfig] = useState(!burstModeActive);
  const [showBreakMenu, setShowBreakMenu] = useState(false);
  const [socialBreakActive, setSocialBreakActive] = useState(false);
  const [socialBreakTime, setSocialBreakTime] = useState(0);
  const [showDopamineMenu, setShowDopamineMenu] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (burstActive) {
      timer = setInterval(() => {
        tickBurst();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [burstActive, tickBurst]);

  useEffect(() => {
    if (burstModeActive && burstTimeRemaining === 0 && !showBreakMenu && burstActive === false) {
      // Burst just ended
      setShowBreakMenu(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      addXp(100); // Reward for completing burst
    }
  }, [burstTimeRemaining, burstModeActive, showBreakMenu, burstActive, addXp]);

  useEffect(() => {
    let breakTimer: NodeJS.Timeout;
    if (socialBreakActive && socialBreakTime > 0) {
      breakTimer = setInterval(() => {
        setSocialBreakTime(prev => {
          if (prev <= 1) {
             // Social break over! Send notification if supported
             if (Notification.permission === 'granted') {
               new Notification('Break Over!', {
                 body: 'Time to get back to learning! Open Bilgi İmparatorluğu for bonus XP.',
                 icon: '/vite.svg' // fallback
               });
             }
             setSocialBreakActive(false);
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(breakTimer);
  }, [socialBreakActive, socialBreakTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startSocialBreak = (minutes: number) => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setSocialBreakTime(minutes * 60);
    setSocialBreakActive(true);
    setShowBreakMenu(false);
    endBurst(); // reset burst fully
  };

  if (!burstModeActive && !showConfig) {
     return (
      <motion.div 
        drag
        dragConstraints={{ left: typeof window !== 'undefined' ? -window.innerWidth + 80 : -300, right: 20, top: -20, bottom: typeof window !== 'undefined' ? window.innerHeight - 80 : 600 }}
        dragMomentum={false}
        className="fixed top-20 right-6 z-40"
      >
        <button onClick={() => setShowConfig(true)} className="backdrop-blur-2xl bg-black/40 w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 transition-colors hover:text-white hover:bg-black/60 shadow-sm active:scale-95 cursor-grab active:cursor-grabbing">
           <Timer size={18} />
        </button>
      </motion.div>
     );
  }

  return (
    <>
      {/* Active Timer Display */}
      {burstModeActive && !showBreakMenu && !showConfig && (
        <motion.div 
          drag
          dragConstraints={{ left: typeof window !== 'undefined' ? -window.innerWidth + 120 : -300, right: 20, top: -20, bottom: typeof window !== 'undefined' ? window.innerHeight - 80 : 600 }}
          dragMomentum={false}
          className="fixed z-40 backdrop-blur-md bg-black/30 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-white/80 cursor-grab active:cursor-grabbing"
          style={{ top: '80px', right: '16px' }}
        >
          <span className="font-mono text-sm font-medium">{formatTime(burstTimeRemaining)}</span>
          <button onClick={() => burstActive ? endBurst() : startBurst()} className="hover:text-white transition-colors text-indigo-400">
             <X size={16} /> {/* Should really be a pause/stop icon, using X to cancel for now */}
          </button>
        </motion.div>
      )}

      {/* Config Modal */}
      <AnimatePresence>
        {showConfig && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/80 backdrop-blur-md"
          >
             <div className="w-full max-w-sm backdrop-blur-3xl bg-black/40 border border-white/5 rounded-[32px] p-6 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold flex items-center gap-2 text-white"><Flame className="text-teal-400" /> Focus Burst</h2>
                 <button onClick={() => setShowConfig(false)} className="text-neutral-500 hover:text-white transition-colors"><X size={20}/></button>
               </div>
               <p className="text-neutral-400 text-sm mb-8 font-medium">Set a timer for uninterrupted, mindful reading. Earn bonus XP.</p>
               
               <div className="grid grid-cols-2 gap-3 mb-8">
                 {[10, 15, 20, 25].map(m => (
                   <button 
                     key={m}
                     onClick={() => setBurstMinutes(m)}
                     className={cn(
                       "py-3 rounded-[20px] font-semibold transition-all duration-200 text-sm",
                       useStore.getState().burstMinutes === m ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "bg-white/5 border border-transparent hover:bg-white/10 text-neutral-400"
                     )}
                   >
                     {m} min
                   </button>
                 ))}
               </div>

               <button 
                 onClick={() => { 
                   if (useStore.getState().incrementBurst()) {
                     startBurst(); 
                     setShowConfig(false); 
                   } else {
                     useStore.getState().setShowPaywall(true);
                   }
                 }}
                 className="w-full py-4 bg-teal-400 text-[#0A0A0A] font-bold rounded-full hover:bg-teal-300 transition-colors shadow-sm text-sm tracking-wide"
               >
                 Start Burst
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Break Menu / Dopamine Menu */}
      <AnimatePresence>
        {showBreakMenu && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-0 bottom-0 z-50 p-6 backdrop-blur-3xl bg-[#0A0A0A]/90 border-t border-white/5 rounded-t-[40px] shadow-2xl"
          >
             <h2 className="text-[28px] font-bold mb-2 text-white">Great work.</h2>
             <p className="text-neutral-400 text-sm mb-8 font-medium">You completed your focus burst. Ready for a break?</p>

             <div className="space-y-3">
               <button onClick={() => setShowBreakMenu(false)} className="w-full flex items-center justify-between p-4 backdrop-blur-3xl bg-white/5 rounded-[24px] hover:bg-white/10 border border-transparent transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl"><Brain size={20} /></div>
                    <div className="text-left"><p className="font-semibold text-sm text-white">Keep Learning</p><p className="text-[11px] text-neutral-500 font-medium">Continue browsing</p></div>
                  </div>
               </button>

               <button onClick={() => { setShowBreakMenu(false); setShowDopamineMenu(true); }} className="w-full flex items-center justify-between p-4 backdrop-blur-3xl bg-white/5 rounded-[24px] hover:bg-white/10 border border-transparent transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl"><Gamepad2 size={20} /></div>
                    <div className="text-left"><p className="font-semibold text-sm text-white">Dopamine Menu</p><p className="text-[11px] text-neutral-500 font-medium">Quick in-app rewards</p></div>
                  </div>
               </button>

               <button onClick={() => startSocialBreak(10)} className="w-full flex items-center justify-between p-4 backdrop-blur-3xl bg-white/5 rounded-[24px] hover:bg-white/10 border border-transparent transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl"><Coffee size={20} /></div>
                    <div className="text-left"><p className="font-semibold text-sm text-white">Refresh (10m)</p><p className="text-[11px] text-neutral-500 font-medium">We'll remind you</p></div>
                  </div>
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Break Active Overlay (minimal) */}
      <AnimatePresence>
        {socialBreakActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-[#0A0A0A]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6"
          >
             <Coffee size={40} className="text-teal-400 mb-8 animate-pulse" />
             <h2 className="text-[28px] font-bold mb-3 text-center text-white tracking-tight">Enjoy your break.</h2>
             <p className="text-neutral-400 text-center mb-10 max-w-[280px] text-sm leading-relaxed">Minimize the app. We'll send you a notification when it's time to get back to learning.</p>
             
             <div className="text-6xl font-mono font-bold text-white mb-16 tabular-nums tracking-tighter">
               {formatTime(socialBreakTime)}
             </div>

             <button 
               onClick={() => { setSocialBreakActive(false); addXp(50); }}
               className="px-8 py-4 bg-white/5 text-neutral-300 hover:text-white font-bold rounded-full transition-transform active:scale-95 text-sm uppercase tracking-widest"
             >
               Return Early (+50 XP)
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
         {showDopamineMenu && (
            <DopamineMenu onClose={() => setShowDopamineMenu(false)} />
         )}
      </AnimatePresence>
    </>
  );
}
