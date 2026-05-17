import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { Sparkles, ArrowRight, Library, Globe2, Gem, Coins, ChevronRight, Crown, Layers, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { haptic } from '../lib/haptics';

const TOPICS = [
  { id: 'History', label: 'Tarih', icon: <span className="text-xl">🏛️</span> },
  { id: 'Science', label: 'Bilim', icon: <span className="text-xl">⚛️</span> },
  { id: 'Technology', label: 'Teknoloji', icon: <span className="text-xl">💻</span> },
  { id: 'Nature', label: 'Doğa', icon: <span className="text-xl">🌿</span> },
  { id: 'Philosophy', label: 'Felsefe', icon: <span className="text-xl">🤔</span> },
  { id: 'Art', label: 'Sanat', icon: <span className="text-xl">🎨</span> },
  { id: 'Geography', label: 'Coğrafya', icon: <span className="text-xl">🗺️</span> },
  { id: 'Space', label: 'Uzay', icon: <span className="text-xl">🚀</span> },
  { id: 'Culture', label: 'Kültür', icon: <span className="text-xl">🎭</span> },
];

const TOUR_SLIDES = [
  {
    id: 'burst',
    icon: <Zap size={32} className="text-fuchsia-400" />,
    title: "Burst Keşfi & Arşivleme",
    desc: "Her gün sana özel, rafine bilgi kapsülleri (bursts) sunulur. İlgini çekenleri arşive ekle.",
    color: "from-fuchsia-500/20 to-transparent",
    border: "border-fuchsia-500/30"
  },
  {
    id: 'library',
    icon: <Library size={32} className="text-amber-400" />,
    title: "Kütüphane Küratörlüğü",
    desc: "Kaydettiğin bilgileri Imperial Kütüphanelerinde sergile. Kendi odalarını yarat ve bilgiyi kategorize et.",
    color: "from-amber-500/20 to-transparent",
    border: "border-amber-500/30"
  },
  {
    id: 'conquest',
    icon: <Globe2 size={32} className="text-blue-400" />,
    title: "Şehirler & Fetih",
    desc: "Dünya haritasında tarihi şehirlerin kilidini aç. Belirli bir alanda uzmanlaşarak şehri fethet ve kütüphaneni oraya kur.",
    color: "from-blue-500/20 to-transparent",
    border: "border-blue-500/30"
  },
  {
    id: 'economy',
    icon: <Coins size={32} className="text-emerald-400" />,
    title: "İmparatorluk Ekonomisi",
    desc: "Öğrendikçe Wisdom Shards (Bilgelik Parçaları) kazan. Premium eserlere eriş ve imparatorluk statünü yükselt.",
    color: "from-emerald-500/20 to-transparent",
    border: "border-emerald-500/30"
  }
];

export function Onboarding() {
  const [step, setStep] = useState<'splash' | 'philosophy' | 'tour' | 'topics' | 'login'>('splash');
  const [tourIndex, setTourIndex] = useState(0);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const { completeOnboarding, setUserName } = useStore();

  const toggleTopic = (id: string) => {
    haptic.light();
    setSelected(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const finishOnboarding = () => {
    haptic.success();
    confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 }, colors: ['#14F4B8', '#f59e0b', '#d946ef'] });
    completeOnboarding(selected.length > 0 ? selected : ['History', 'Science', 'Art']);
  };

  return (
    <div className="absolute inset-0 z-[500] bg-[#0A0A0A] flex flex-col overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        
        {step === 'splash' && (
          <motion.div 
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center relative"
          >
            {/* Elegant dark map animation background placeholder */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
               <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 blur-[120px] rounded-full"></div>
               <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/20 blur-[120px] rounded-full"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite]"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
            </div>

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
               <div className="w-24 h-24 bg-gradient-to-br from-teal-500/20 to-teal-900/40 rounded-[32px] flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_60px_rgba(45,212,191,0.15)] ring-1 ring-white/5 backdrop-blur-xl">
                 <Crown size={40} className="text-white drop-shadow-lg" />
               </div>
               
               <h1 className="text-[40px] font-serif italic text-white mb-6 tracking-tight leading-none drop-shadow-2xl">
                 Bilgi<br />İmparatorluğu.
               </h1>
               
               <p className="text-neutral-400 text-sm tracking-widest uppercase font-bold max-w-[260px] leading-relaxed mb-16 relative">
                 <span className="absolute -left-4 top-0 text-white/10 text-4xl font-serif">"</span>
                 Bilgi Güçtür.<br/>Bilgin Kadar Hükmedersin.
                 <span className="absolute -right-4 bottom-0 text-white/10 text-4xl font-serif">"</span>
               </p>

               <button 
                 onClick={() => { haptic.medium(); setStep('philosophy'); }}
                 className="w-full py-5 bg-white text-[#0A0A0A] font-bold rounded-full flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] text-sm tracking-widest uppercase"
               >
                 İmparatorluğunu İnşa Et <ArrowRight size={18} />
               </button>
               
               <button 
                 onClick={() => { haptic.light(); setStep('login'); }}
                 className="mt-6 text-[10px] text-neutral-500 tracking-widest uppercase font-bold hover:text-white transition-colors"
               >
                 I already have an empire
               </button>
            </div>
          </motion.div>
        )}

        {step === 'philosophy' && (
           <PhilosophyStep key="philosophy" onNext={() => setStep('tour')} />
        )}

        {step === 'tour' && (
          <motion.div 
            key="tour"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col pt-20 px-6 pb-12 w-full relative"
          >
            {/* Skip Button */}
            <button 
               onClick={() => { haptic.medium(); setStep('topics'); }}
               className="absolute top-12 right-6 text-[10px] uppercase font-bold tracking-widest text-neutral-500 hover:text-white transition-colors z-20 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/5"
            >
               Skip Tour
            </button>

            {/* Progress Indicators */}
            <div className="flex gap-2 mb-12 max-w-sm mx-auto w-full pt-4">
              {TOUR_SLIDES.map((_, idx) => (
                <div key={idx} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: idx <= tourIndex ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-white"
                  />
                </div>
              ))}
            </div>

            <div className="flex-1 flex flex-col justify-center items-center w-full max-w-sm mx-auto relative perspective-[1000px]">
               <AnimatePresence mode="wait">
                 <motion.div 
                   key={tourIndex}
                   initial={{ opacity: 0, y: 20, rotateX: 10 }}
                   animate={{ opacity: 1, y: 0, rotateX: 0 }}
                   exit={{ opacity: 0, y: -20, rotateX: -10 }}
                   transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                   className={cn(
                     "w-full aspect-[4/5] rounded-[40px] border p-8 flex flex-col bg-gradient-to-b relative overflow-hidden backdrop-blur-3xl shadow-2xl",
                     TOUR_SLIDES[tourIndex].color,
                     TOUR_SLIDES[tourIndex].border
                   )}
                 >
                   {/* Techy background pattern */}
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_50%)]"></div>
                   <div className="absolute -inset-1 bg-gradient-to-b from-white/10 to-transparent opacity-30 rounded-[40px] pointer-events-none"></div>
                   
                   <div className="w-16 h-16 rounded-[24px] bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 mb-auto shadow-inner relative z-10">
                     {TOUR_SLIDES[tourIndex].icon}
                   </div>
                   
                   <div className="relative z-10 mt-8">
                     <h2 className="text-2xl font-serif italic text-white mb-4 tracking-tight drop-shadow-md">
                       {TOUR_SLIDES[tourIndex].title}
                     </h2>
                     <p className="text-neutral-300 text-sm leading-relaxed drop-shadow-md">
                       {TOUR_SLIDES[tourIndex].desc}
                     </p>
                   </div>
                 </motion.div>
               </AnimatePresence>
            </div>

            <div className="mt-12 w-full max-w-sm mx-auto flex gap-4">
              <button 
                onClick={() => {
                  haptic.light();
                  if (tourIndex > 0) setTourIndex(tourIndex - 1);
                }}
                className={cn(
                  "py-4 px-6 rounded-[20px] font-bold text-sm tracking-widest uppercase transition-all backdrop-blur-md border border-white/10",
                  tourIndex === 0 ? "opacity-0 pointer-events-none" : "bg-white/5 text-white hover:bg-white/10"
                )}
              >
                Geri
              </button>
              <button 
                onClick={() => {
                  haptic.medium();
                  if (tourIndex < TOUR_SLIDES.length - 1) {
                    setTourIndex(tourIndex + 1);
                  } else {
                    setStep('topics');
                  }
                }}
                className="flex-1 py-4 px-6 rounded-[20px] font-bold text-sm tracking-widest uppercase transition-all bg-white text-[#0A0A0A] hover:bg-neutral-200 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex justify-center items-center gap-2"
              >
                {tourIndex === TOUR_SLIDES.length - 1 ? 'Başla' : 'İleri'} <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'topics' && (
          <motion.div 
            key="topics"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col pt-24 px-6 pb-12 overflow-y-auto w-full mx-auto max-w-md relative"
          >
            <div className="text-left mb-10 w-full">
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-4 block">Kişiselleştirme</span>
              <h1 className="text-[32px] font-serif italic text-white mb-4 tracking-tight leading-tight">İmparatorluğun  Odak Noktası</h1>
              <p className="text-neutral-400 text-sm font-normal leading-relaxed">İlgini çeken 3 ana disiplini seç. İlk şehrini bu alanlardaki bilginle inşa edeceksin.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-12 w-full">
              {TOPICS.map((topic, i) => {
                const isSelected = selected.includes(topic.id);
                return (
                  <motion.button
                    key={topic.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTopic(topic.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-[24px] transition-all duration-300 border backdrop-blur-md",
                      isSelected 
                        ? "bg-teal-500/20 border-teal-500/50 shadow-[0_0_20px_rgba(45,212,191,0.15)] ring-1 ring-teal-500" 
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center mb-3 text-xl shadow-inner border border-white/5">
                      {topic.icon}
                    </div>
                    <span className={cn("text-xs font-bold uppercase tracking-widest transition-colors", isSelected ? "text-teal-400" : "")}>{topic.label}</span>
                  </motion.button>
                )
              })}
            </div>

            <div className="mt-auto w-full">
              <button
                onClick={() => { haptic.medium(); setStep('login'); }}
                disabled={selected.length === 0}
                className={cn(
                  "w-full py-5 rounded-full font-bold text-sm tracking-widest uppercase transition-all duration-300 flex justify-center items-center gap-2",
                  selected.length > 0 
                    ? "bg-white text-[#0A0A0A] hover:bg-neutral-200 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]" 
                    : "bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5"
                )}
              >
                {selected.length === 0 ? 'Disiplin Seç' : 'İmzayı At'} {selected.length > 0 && <ArrowRight size={16} />}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'login' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col pt-32 px-8 max-w-sm mx-auto w-full text-center"
          >
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full mx-auto flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
               <Layers size={32} className="text-amber-400" />
            </div>

            <h2 className="text-[32px] font-serif italic text-white mb-4 tracking-tight">Efsane Başlıyor</h2>
            <p className="text-neutral-400 text-sm mb-12 leading-relaxed max-w-[240px] mx-auto text-center">Tarih seni nasıl hatırlayacak? İmparatorluğunu kurmadan önce ismini kayıtlara geçir.</p>
            
            <input 
              type="text" 
              placeholder="İmparator İsmi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 transition-colors mb-10 text-center text-lg font-serif italic focus:ring-1 focus:ring-amber-500/50"
              autoFocus
            />
            
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={async () => {
                  try {
                    const { signInWithGoogle } = await import('../firebase');
                    await signInWithGoogle();
                  } catch(e) {
                    console.error('Google Sign In failed:', e);
                  }
                  if (name.trim()) setUserName(name);
                  finishOnboarding();
                }}
                disabled={!name.trim()}
                className={cn("w-full py-5 bg-white text-[#0A0A0A] font-bold rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all text-sm tracking-widest uppercase", !name.trim() && "opacity-50 pointer-events-none")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                Google ile Devam Et
              </button>
              <button 
                onClick={async () => {
                   try {
                     const { signInGuest } = await import('../firebase');
                     await signInGuest();
                   } catch(e) {
                     console.error('Guest Sign In failed:', e);
                   }
                   if (name.trim()) setUserName(name);
                   finishOnboarding();
                }}
                disabled={!name.trim()}
                className={cn("w-full py-5 bg-transparent border-2 border-white/10 text-white font-bold rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-white/5 text-[10px] tracking-widest uppercase", !name.trim() && "opacity-50 pointer-events-none")}
              >
                Misafir Olarak Gir <ArrowRight size={14} />
              </button>
            </div>
            
            <p className="mt-8 text-[10px] tracking-widest uppercase font-bold text-neutral-600 block">
              Dünyanın en büyük arşivine adım atıyorsun
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PhilosophyStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [phase, setPhase] = useState(0);

  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 3000); // transition to black
    const t2 = setTimeout(() => setPhase(2), 5000); // empire building message
    const t3 = setTimeout(() => setPhase(3), 8500); // quote
    const t4 = setTimeout(() => setPhase(4), 12500); // show button
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
    >
       <AnimatePresence mode="wait">
          {phase === 0 && (
             <motion.div 
               key="doomscroll"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.1 }}
               transition={{ duration: 1 }}
               className="flex flex-col items-center gap-4 w-full max-w-sm"
             >
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A] z-10 pointer-events-none" />
                   <motion.div 
                      animate={{ y: [0, -1200] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                      className="flex flex-col items-center gap-6 opacity-40 pointer-events-none w-[120%] -rotate-6"
                   >
                      {[...Array(6)].map((_, i) => (
                         <div key={i} className="w-full flex-shrink-0 bg-white/5 rounded-2xl border border-white/10 p-4 gap-4 flex flex-col blur-[2px]">
                            <div className="flex gap-3 items-center">
                               <div className="w-10 h-10 rounded-full bg-white/10" />
                               <div className="flex flex-col gap-2">
                                  <div className="w-24 h-3 rounded-full bg-white/10" />
                                  <div className="w-16 h-2 rounded-full bg-white/5" />
                               </div>
                            </div>
                            <div className="w-full h-48 rounded-xl bg-gradient-to-br from-white/10 to-transparent" />
                         </div>
                      ))}
                   </motion.div>
                </div>
                
                <div className="z-10 flex flex-col items-center gap-2 mt-20">
                   <h2 className="text-4xl font-black text-neutral-300 tracking-tighter uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">Sonsuz Kaydırma.</h2>
                   <h2 className="text-4xl font-black text-neutral-400 tracking-tighter uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">Sığ Gürültü.</h2>
                   <h2 className="text-4xl font-black text-red-500/90 tracking-tighter uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">Zaman Kaybı.</h2>
                </div>
             </motion.div>
          )}

          {phase === 1 && (
             <motion.div
               key="black"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="inset-0 absolute bg-black z-20"
             />
          )}

          {phase >= 2 && (
             <motion.div 
               key="empire"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 2 }}
               className="relative z-30 flex flex-col items-center justify-center w-full"
             >
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                   <div className="w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full mix-blend-screen" />
                </div>
                
                {phase >= 2 && (
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 1 }}
                   >
                     <Crown size={48} className="text-amber-400/80 mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                     <h2 className="text-3xl font-serif italic text-white mb-12 tracking-tight drop-shadow-xl text-center">Artık bir miras inşa etme zamanı.</h2>
                   </motion.div>
                )}

                {phase >= 3 && (
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 1 }}
                     className="max-w-xs relative text-left"
                   >
                     <span className="absolute -left-6 -top-4 text-white/10 text-5xl font-serif">"</span>
                     <p className="text-neutral-300 text-sm italic leading-relaxed mb-4 font-serif">
                       Biz sürekli olarak yaptığımız şeyleriz. O halde mükemmellik bir eylem değil, bir alışkanlıktır.
                     </p>
                     <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest text-right">
                       — Aristoteles
                     </p>
                   </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase >= 4 ? 1 : 0 }}
                  className="mt-16 w-full"
                >
                  <button 
                    onClick={() => { haptic.medium(); onNext(); }}
                    className="w-full py-4 text-[#0A0A0A] bg-amber-400 hover:bg-amber-300 font-bold rounded-full transition-all active:scale-95 shadow-[0_0_30px_rgba(251,191,36,0.3)] text-xs tracking-widest uppercase flex items-center justify-center gap-2 pointer-events-auto cursor-pointer"
                  >
                    Başla <ArrowRight size={16} />
                  </button>
                </motion.div>
             </motion.div>
          )}
       </AnimatePresence>
    </motion.div>
  );
}

