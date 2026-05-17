import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, X, Shield, Zap, Infinity as InfinityIcon, Activity, Crown, Coins } from 'lucide-react';
import { useStore } from '../store/useStore';
import confetti from 'canvas-confetti';
import { haptic } from '../lib/haptics';

export function Paywall({ onClose }: { onClose: () => void }) {
  const { setPremiumTier, trackEvent } = useStore();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'sovereign' | 'eternal_mind'>('sovereign');

  const handleSubscribe = () => {
    haptic.success();
    confetti({ particleCount: 150, spread: 80, colors: ['#14F4B8', '#ffffff', '#22D3B8'] });
    trackEvent('premium_upgraded', { plan: selectedPlan });
    setPremiumTier(selectedPlan); 
    setTimeout(onClose, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[120] bg-[#0A0A0A] flex flex-col pt-12 pb-8 px-4 overflow-y-auto"
    >
      <button 
        onClick={() => { haptic.light(); onClose(); }}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:text-white transition-colors z-10"
      >
        <X size={20} />
      </button>

      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-sm md:max-w-xl mx-auto w-full flex flex-col flex-1 relative z-10 pt-4">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500/20 to-amber-500/20 flex items-center justify-center border border-white/10">
            <Crown size={16} className="text-amber-400" />
          </div>
          <span className="text-sm font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-amber-200">Bilgi İmparatorluğu Tiers</span>
        </div>
        
        <h1 className="text-3xl font-black mb-2 tracking-tight text-center text-white leading-tight">Elevate your<br/>Mind.</h1>
        <p className="text-neutral-400 mb-8 font-medium text-center text-sm">Choose the path that fits your curiosity.</p>

        <div className="flex bg-white/5 p-1 rounded-full mb-6 relative z-10 mx-6">
           <button onClick={() => setSelectedPlan('basic')} className={`flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedPlan === 'basic' ? 'bg-white/10 text-white' : 'text-neutral-500'}`}>Explorer</button>
           <button onClick={() => setSelectedPlan('sovereign')} className={`flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedPlan === 'sovereign' ? 'bg-gradient-to-r from-teal-500/20 to-amber-500/20 text-white border border-white/10' : 'text-neutral-500'}`}>Sovereign</button>
        </div>

        <div className="space-y-4 mb-8 min-h-[160px] mx-6">
           <AnimatePresence mode="wait">
             {selectedPlan === 'sovereign' || selectedPlan === 'eternal_mind' ? (
                <motion.div key="sovereign" initial={{opacity:0, x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4">
                  <Feature icon={<Sparkles size={18} />} text="Full Empire Management Tools" highlight={true} />
                  <Feature icon={<Shield size={18} />} text="'Imperial Guard' Buff (Minor protection)" highlight={true} />
                  <Feature icon={<Coins size={18} />} text="2x Wisdom Shards Earn Rate" highlight={true} />
                  <Feature icon={<Crown size={18} />} text="Exclusive Legendary Skins & Visuals" />
                </motion.div>
             ) : (
                <motion.div key="basic" initial={{opacity:0, x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} className="space-y-4">
                  <Feature icon={<InfinityIcon size={18} />} text="Unlimited Focus Bursts" />
                  <Feature icon={<Shield size={18} />} text="Basic Streak Protection" />
                  <Feature icon={<Activity size={18} />} text="Access to Seasonal Events" />
                  <Feature icon={<Zap size={18} />} text="Basic Analytics" />
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="mt-auto space-y-3 mb-6 mx-6">
           {selectedPlan === 'sovereign' || selectedPlan === 'eternal_mind' ? (
              <>
                 <button 
                  onClick={() => { haptic.light(); setSelectedPlan('sovereign'); }}
                  className={`w-full p-4 rounded-[24px] border transition-all ${selectedPlan === 'sovereign' ? 'bg-gradient-to-br from-teal-500/10 to-amber-500/10 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 'bg-white/5 border-transparent'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold ${selectedPlan === 'sovereign' ? 'text-amber-400' : 'text-white'}`}>Yearly <span className="bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full text-[10px] uppercase ml-2 tracking-widest font-black">Best</span></span>
                      <span className={`font-bold ${selectedPlan === 'sovereign' ? 'text-amber-400' : 'text-white'}`}>$59.99</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-medium">$5.00/mo</span>
                  </div>
                </button>
                <button 
                  onClick={() => { haptic.light(); setSelectedPlan('eternal_mind'); }}
                  className={`w-full p-4 rounded-[24px] border transition-all ${selectedPlan === 'eternal_mind' ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.1)]' : 'bg-white/5 border-transparent'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold ${selectedPlan === 'eternal_mind' ? 'text-purple-400' : 'text-white'}`}>Eternal Mind (Lifetime)</span>
                      <span className={`font-bold ${selectedPlan === 'eternal_mind' ? 'text-purple-400' : 'text-white'}`}>$149.99</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-medium">One-time payment + Unique Title</span>
                  </div>
                </button>
              </>
           ) : (
             <>
               <button 
                 onClick={() => { haptic.light(); setSelectedPlan('basic'); }}
                 className={`w-full p-4 rounded-[24px] border transition-all bg-teal-500/10 border-teal-500/40`}
               >
                 <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-teal-400">Yearly</span>
                    <span className="font-bold text-teal-400">$39.99</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-medium">$3.33/mo</span>
                 </div>
               </button>
             </>
           )}
        </div>

        <div className="px-6 mb-6">
           <button 
             onClick={handleSubscribe}
             className={`w-full py-4 rounded-full font-bold tracking-wide active:scale-95 transition-transform ${selectedPlan === 'sovereign' || selectedPlan === 'eternal_mind' ? 'bg-gradient-to-r from-amber-400 to-amber-200 text-[#0A0A0A] shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'bg-teal-400 text-[#0A0A0A] shadow-[0_0_20px_rgba(20,244,184,0.3)]'}`}
           >
             {selectedPlan === 'eternal_mind' ? 'Unlock Forever' : 'Unlock Now'}
           </button>
           <p className="text-[10px] text-neutral-600 text-center mt-4">Cancel anytime. Terms & Privacy apply.</p>
        </div>
      </div>
    </motion.div>
  );
}

function Feature({ icon, text, highlight = false }: { icon: React.ReactNode, text: string, highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${highlight ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'}`}>
        {icon}
      </div>
      <span className={`text-sm font-bold ${highlight ? 'text-amber-100' : 'text-neutral-300'}`}>{text}</span>
    </div>
  )
}
