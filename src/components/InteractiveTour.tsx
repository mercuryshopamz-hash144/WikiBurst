import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { X, ChevronRight, Zap, ArrowDown, Map as MapIcon, Bookmark, Globe2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { haptic } from '../lib/haptics';

export function InteractiveTour({ currentTab }: { currentTab: string }) {
  const { interactiveTourActive, interactiveTourStep, completeInteractiveTour, advanceInteractiveTour } = useStore();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!interactiveTourActive) return;
    
    // Logic to highlight UI elements based on the step
    const findTarget = () => {
      let selector = '';
      if (interactiveTourStep === 0) {
        // Step 0: Welcome to Feed, tap to read an article
        selector = '.tour-feed-article';
      } else if (interactiveTourStep === 1) {
        // Step 1: Article open, bookmark it
        selector = '.tour-bookmark-btn';
      } else if (interactiveTourStep === 2) {
        // Step 2: Go to Map tab
        selector = '.tour-map-tab';
      } else if (interactiveTourStep === 3) {
        // Step 3: Map view, tap a city
        selector = '.tour-city-marker';
      }

      if (selector) {
        // wait for elements to render
        setTimeout(() => {
           const el = document.querySelector(selector);
           if (el) {
             setTargetRect(el.getBoundingClientRect());
           } else {
             setTargetRect(null);
           }
        }, 300);
      } else {
        setTargetRect(null);
      }
    };

    findTarget();
    // Re-check target rect occasionally in case of layout shifts
    const interval = setInterval(findTarget, 1000);
    
    // Listen for clicks to automatically advance if they clicked the target
    const handleClick = (e: MouseEvent) => {
       if (interactiveTourStep > 3) return;
       // We use the current finding of selector
       let selector = '';
       if (interactiveTourStep === 0) selector = '.tour-feed-article';
       else if (interactiveTourStep === 1) selector = '.tour-bookmark-btn';
       else if (interactiveTourStep === 2) selector = '.tour-map-tab';
       else if (interactiveTourStep === 3) selector = '.tour-city-marker';

       const targetEl = e.target as HTMLElement;
       if (selector && targetEl.closest(selector)) {
          // If they are on step 0, wait a moment because the card expands
          setTimeout(() => advanceInteractiveTour(), 500);
       }
    };
    
    document.addEventListener('click', handleClick, true); // use capture to ensure it runs
    
    return () => {
       clearInterval(interval);
       document.removeEventListener('click', handleClick, true);
    };

  }, [interactiveTourActive, interactiveTourStep, currentTab, advanceInteractiveTour]);

  if (!interactiveTourActive) return null;

  const handleSkip = () => {
    haptic.light();
    completeInteractiveTour();
  };

  const getStepContent = () => {
    switch (interactiveTourStep) {
      case 0:
        return {
          title: "Burst Keşfi",
          desc: "Akışındaki ilk bilgi kapsülüne (burst) dokunarak detayları gör.",
          icon: <Zap className="text-amber-400" size={24} />,
          actionRequired: true
        };
      case 1:
        return {
          title: "Arşivleme",
          desc: "Bu bilgiyi kütüphanende sergilemek için kaydet (Bookmark).",
          icon: <Bookmark className="text-fuchsia-400" size={24} />,
          actionRequired: true
        };
      case 2:
        return {
          title: "Dünya Haritası",
          desc: "Alt menüden Harita (Map) sekmesine geçerek imparatorluğunu gör.",
          icon: <Globe2 className="text-blue-400" size={24} />,
          actionRequired: true
        };
      case 3:
        return {
          title: "İlk Şehrini Keşfet",
          desc: "Haritadaki kilitli şehirlerden birine dokun ve fethini başlat.",
          icon: <MapIcon className="text-emerald-400" size={24} />,
          actionRequired: true
        };
      default:
        return {
          title: "Tur Tamamlandı",
          desc: "Bilgi imparatorluğun seni bekliyor.",
          icon: null,
          actionRequired: false
        };
    }
  };

  const content = getStepContent();

  if (interactiveTourStep > 3) {
      setTimeout(() => completeInteractiveTour(), 2000);
  }

  // Calculate position for tooltip
  let tooltipStyle: React.CSSProperties = { bottom: '120px', left: '24px', right: '24px' };
  let pointerStyle: React.CSSProperties = { display: 'none' };
  
  if (targetRect) {
     const isTopHalf = targetRect.top < window.innerHeight / 2;
     
     if (isTopHalf) {
        tooltipStyle = { top: targetRect.bottom + 20 + 'px', left: '24px', right: '24px' };
        pointerStyle = {
           display: 'block',
           position: 'absolute',
           top: targetRect.bottom + 'px',
           left: targetRect.left + targetRect.width / 2 - 12 + 'px',
        };
     } else {
        tooltipStyle = { bottom: window.innerHeight - targetRect.top + 20 + 'px', left: '24px', right: '24px' };
        pointerStyle = {
           display: 'block',
           position: 'absolute',
           bottom: window.innerHeight - targetRect.top + 'px',
           left: targetRect.left + targetRect.width / 2 - 12 + 'px',
           transform: 'rotate(180deg)',
        };
     }
  }

  return (
    <div className="absolute inset-0 z-[400] pointer-events-none">
      {/* Dimmed Background Overlay */}
      <AnimatePresence>
         <motion.div 
           initial={{ opacity: 0 }} 
           animate={{ opacity: 1 }} 
           exit={{ opacity: 0 }}
           className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-all"
           style={targetRect ? {
              // Creating a hole in the overlay
              clipPath: `polygon(
                0% 0%, 0% 100%, 
                ${targetRect.left - 10}px 100%, 
                ${targetRect.left - 10}px ${targetRect.top - 10}px, 
                ${targetRect.right + 10}px ${targetRect.top - 10}px, 
                ${targetRect.right + 10}px ${targetRect.bottom + 10}px, 
                ${targetRect.left - 10}px ${targetRect.bottom + 10}px, 
                ${targetRect.left - 10}px 100%, 
                100% 100%, 100% 0%
              )`
           } : {}}
         />
      </AnimatePresence>
      
      {/* Pointer arrow */}
      {targetRect && (
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: [0, -10, 0] }}
           transition={{ repeat: Infinity, duration: 1.5 }}
           style={pointerStyle}
           className="z-[401] text-teal-400 drop-shadow-lg"
         >
            <ArrowDown size={32} />
         </motion.div>
      )}

      {/* Suggestion Card */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="absolute z-[402] pointer-events-auto"
         style={tooltipStyle}
      >
         <div className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-[24px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${((interactiveTourStep) / 4) * 100}%` }} 
                 className="h-full bg-teal-400"
               />
            </div>

            <button onClick={handleSkip} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
               <X size={20} />
            </button>

            <div className="flex gap-4 items-start">
               <div className="w-12 h-12 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                  {content.icon}
               </div>
               <div>
                  <h3 className="text-lg font-serif italic text-white mb-1 tracking-tight">{content.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed font-medium">{content.desc}</p>
               </div>
            </div>

            {/* If no action required, show next button */}
            {!content.actionRequired && interactiveTourStep <= 3 && (
               <button 
                 onClick={() => advanceInteractiveTour()}
                 className="w-full mt-6 py-3 bg-teal-500 text-black font-bold uppercase tracking-widest text-[10px] rounded-[16px] flex items-center justify-center gap-2"
               >
                  Devam Et <ChevronRight size={16} />
               </button>
            )}
            {content.actionRequired && (
               <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                 <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                 </span>
                 <p className="text-[10px] uppercase font-bold text-teal-400 tracking-widest">Burada eylem bekleniyor</p>
               </div>
            )}
         </div>
      </motion.div>
    </div>
  );
}
