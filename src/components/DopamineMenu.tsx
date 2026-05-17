import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Wind, Droplet, Music } from 'lucide-react';
import { useStore } from '../store/useStore';
import confetti from 'canvas-confetti';
import { haptic } from '../lib/haptics';
import { cn } from '../lib/utils';

interface Props {
  onClose: () => void;
}

export function DopamineMenu({ onClose }: Props) {
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const { addXp } = useStore();

  const activities = [
    { id: 'breathe', title: 'Box Breathing', icon: <Wind size={24} strokeWidth={2.5} />, duration: 60, desc: 'Reset your nervous system' },
    { id: 'stretch', title: 'Quick Stretch', icon: <Droplet size={24} strokeWidth={2.5} />, duration: 30, desc: 'Release physical tension' },
    { id: 'visual', title: 'Visual Flow', icon: <Sparkles size={24} strokeWidth={2.5} />, duration: 45, desc: 'Mesmerizing patterns' },
    { id: 'lofi', title: 'Lofi Minute', icon: <Music size={24} strokeWidth={2.5} />, duration: 60, desc: 'Close your eyes and listen' },
  ];

  const handleComplete = () => {
    haptic.success();
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#14F4B8', '#ffffff', '#22D3B8']
    });
    addXp(20);
    setActiveActivity(null);
  };

  return (
    <div className="absolute inset-0 z-[60] bg-[#0A0A0A]/95 backdrop-blur-3xl p-6 flex flex-col items-center">
       {/* Ambient glow */}
       <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>

       <div className="w-full flex justify-between items-center mb-8 pt-12 max-w-sm relative z-10">
          <h2 className="text-xl font-bold text-teal-400 uppercase tracking-widest text-[11px] px-2 py-1">Dopamine Menu</h2>
          <button onClick={() => { haptic.light(); onClose(); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:text-white transition-all active:scale-90 shadow-sm">
            <X size={18} strokeWidth={2.5} />
          </button>
       </div>
       
       <p className="text-neutral-400 mb-10 text-sm font-medium text-center max-w-[280px] leading-relaxed relative z-10 mx-auto">Healthy, quick micro-breaks to refresh your brain without scrolling.</p>

       <div className="w-full max-w-sm relative z-10 flex-1">
         <AnimatePresence mode="wait">
            {!activeActivity ? (
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="grid grid-cols-2 gap-3"
              >
                 {activities.map(act => (
                   <button 
                     key={act.id}
                     onClick={() => { haptic.medium(); setActiveActivity(act.id); }}
                     className="backdrop-blur-3xl bg-black/40 border border-white/5 rounded-[24px] p-6 flex flex-col items-center text-center hover:bg-black/60 transition-colors shadow-sm active:scale-[0.98]"
                   >
                     <div className="text-teal-400 mb-4 bg-teal-500/10 p-3 rounded-[16px] shadow-sm">{act.icon}</div>
                     <div className="font-semibold text-white mb-1 text-sm tracking-wide">{act.title}</div>
                     <div className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">{act.duration}s</div>
                   </button>
                 ))}
              </motion.div>
            ) : (
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="flex-1 flex flex-col items-center justify-center mt-12"
              >
                  <ActiveActivityView id={activeActivity} onComplete={handleComplete} />
              </motion.div>
            )}
         </AnimatePresence>
       </div>
    </div>
  );
}

function ActiveActivityView({ id, onComplete }: { id: string, onComplete: () => void }) {
   const [progress, setProgress] = React.useState(0);
   
   React.useEffect(() => {
     const duration = id === 'stretch' ? 30 : id === 'visual' ? 45 : 60;
     const interval = setInterval(() => {
        setProgress(p => {
           if (p >= 100) {
              clearInterval(interval);
              setTimeout(onComplete, 500);
              return 100;
           }
           return p + (100 / (duration * 10)); // update 10 times a second
        });
     }, 100);
     return () => clearInterval(interval);
   }, [id, onComplete]);

    return (
      <div className="text-center w-full max-w-[280px] mx-auto">
        {id === 'breathe' && (
           <motion.div 
             animate={{ scale: [1, 1.6, 1.6, 1, 1] }}
             transition={{ duration: 16, repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
             className="w-32 h-32 bg-teal-500/10 border-2 border-teal-400/50 rounded-full mx-auto mb-16 flex items-center justify-center text-teal-400 font-bold tracking-widest"
           >
              IN/OUT
           </motion.div>
        )}
        {id === 'stretch' && (
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mb-16"
            >
              🧘‍♀️
            </motion.div>
        )}
        {id === 'visual' && (
           <motion.div 
              animate={{ rotate: 360, borderRadius: ["20%", "50%", "30%", "20%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-40 h-40 bg-teal-400/20 mx-auto mb-16 opacity-90 blur-md border-[20px] border-teal-500/30"
           />
        )}
         {id === 'lofi' && (
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-16 flex justify-center"
            >
              <Music size={80} strokeWidth={1} className="text-teal-400/50" />
            </motion.div>
        )}
        
        <h3 className="text-2xl font-bold mb-10 tracking-tight text-white">Relax & Let Go</h3>
        
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-teal-400 transition-all duration-100 ease-linear rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <button 
          onClick={() => { haptic.light(); onComplete(); }} 
          className="mt-10 px-6 py-2 rounded-full text-neutral-500 text-[11px] font-bold uppercase tracking-widest active:scale-95 transition-all hover:bg-white/5"
        >
          Skip
        </button>
      </div>
   );
}
