import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './Card';
import { WikiArticle, fetchRandomArticles } from '../lib/wikipedia';
import { Loader2, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { haptic } from '../lib/haptics';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CompanionBubble } from './CompanionBubble';

export function Feed() {
  const { language } = useStore();
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async (isRefresh = false) => {
    const { topicWeights, language: storeLanguage } = useStore.getState();
    if (isRefresh) {
      setLoading(true);
      // Wait for at least 500ms for smooth UI feedback
      const start = Date.now();
      const newArticles = await fetchRandomArticles(5, topicWeights, storeLanguage);
      const diff = Date.now() - start;
      if (diff < 500) await new Promise(r => setTimeout(r, 500 - diff));
      setArticles(newArticles);
      setLoading(false);
      setActiveIndex(0);
      if (containerRef.current) containerRef.current.scrollTop = 0;
    } else {
      const newArticles = await fetchRandomArticles(5, topicWeights, storeLanguage);
      setArticles(prev => [...prev, ...newArticles]);
    }
  }, []);

  useEffect(() => {
    loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]); // Reload when language changes

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    
    if (index !== activeIndex && index >= 0 && index < articles.length) {
      setActiveIndex(index);
      haptic.light();
      
      // Micro-achievement: swipe dopamine
      import('canvas-confetti').then((confetti) => {
         confetti.default({
           particleCount: 15,
           spread: 40,
           origin: { y: 0.9, x: Math.random() > 0.5 ? 0.2 : 0.8 },
           colors: ['#2dd4bf', '#ffffff'],
           disableForReducedMotion: true
         });
      });
    }

    if (scrollHeight - scrollTop - clientHeight < clientHeight * 3 && !loading) {
      // Background preload
      loadMore(false);
    }
  };

  const handleRefresh = () => {
    haptic.medium();
    setArticles([]); // clear to show skeletons maybe?
    loadMore(true);
  };

  return (
    <div className="relative h-full w-full bg-[#0A0A0A]">
      {/* Loading overlay for initial load or refresh */}
      <AnimatePresence>
        {loading && articles.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-2xl bg-[#0A0A0A]"
          >
             <div className="flex flex-col items-center gap-4 text-white/50">
               <Loader2 className="animate-spin text-teal-400" size={32} />
               <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse text-neutral-400">Consulting the Imperial Archives...</p>
             </div>
          </motion.div>
        )}
        {!loading && articles.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0A]"
          >
            <p className="text-neutral-500 mb-6 text-[10px] font-bold uppercase tracking-widest">The Archives are currently sealed.</p>
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 transition-colors rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 active:scale-95"
            >
              <RefreshCw size={14} /> Retry Admission
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth pb-0"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {articles.map((article, index) => (
          <div key={`${article.id}-${index}`} className="w-full h-full snap-start snap-always tour-feed-article">
            <Card article={article} isActive={index === activeIndex} />
          </div>
        ))}
        {articles.length > 0 && (
          <div className="w-full h-full snap-start flex items-center justify-center">
            <Loader2 className="animate-spin text-white/30" size={32} />
          </div>
        )}
      </div>

      <button 
        onClick={handleRefresh}
        className={cn(
          "absolute right-6 bottom-32 z-[45] w-12 h-12 rounded-full overflow-hidden transition-all duration-300 active:scale-90 flex items-center justify-center",
          "backdrop-blur-2xl bg-black/40 shadow-sm",
          loading ? "opacity-50 pointer-events-none" : "hover:bg-black/60"
        )}
      >
        <RefreshCw size={20} className={cn("text-neutral-400", loading ? "animate-spin" : "")} />
      </button>

      <CompanionBubble />
    </div>
  );
}
