import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WikiArticle } from '../lib/wikipedia';
import { Clock, Bookmark, Share2, X, ChevronDown, CheckCircle, ExternalLink, ThumbsDown, MessageSquarePlus, Castle, BookOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import { haptic } from '../lib/haptics';

import { ShareDialog } from './ShareDialog';

interface CardProps {
  article: WikiArticle;
  isActive: boolean;
  key?: React.Key;
}

export function Card({ article, isActive }: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showLibrarySelector, setShowLibrarySelector] = useState(false);
  const [showRemixBox, setShowRemixBox] = useState(false);
  const [remixNote, setRemixNote] = useState('');
  const [readProgress, setReadProgress] = useState(0);
  const { addXp, markArticleRead, saveArticle, savedArticles, readArticleIds, addRemix, addWisdomShards, focusMode, setFocusMode, libraries, addArticleToLibrary } = useStore();
  const isSaved = savedArticles.some(a => a.id === article.id);
  const [isRead, setIsRead] = useState(() => readArticleIds.includes(article.id));

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && !isRead) {
      timer = setTimeout(() => {
        addXp(10);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isActive, isRead, addXp]);

  const handleMarkAsRead = () => {
    if (isRead) return;
    
    let xpReward = 50;
    if (article.rarity === 'rare') xpReward = 150;
    if (article.rarity === 'epic') xpReward = 300;

    setIsRead(true);
    markArticleRead(article);
    addXp(xpReward);
    
    const baseCoins = article.rarity === 'epic' ? 100 : article.rarity === 'rare' ? 50 : 10;
    addWisdomShards(baseCoins);
    
    useStore.getState().recordInteraction(article.category || 'General', 0.5);
    haptic.success();
    
    if (article.rarity === 'epic') {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#d946ef', '#ffffff']
      });
    } else {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#14F4B8', '#ffffff', '#22D3B8']
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    let progress = 0;
    if (scrollHeight <= clientHeight + 10) {
      progress = 100;
    } else {
      progress = Math.min(100, (scrollTop / (scrollHeight - clientHeight)) * 100);
    }
    
    setReadProgress(progress);
  };

  // Helper effect to trigger read automatically if the article is too short to scroll
  useEffect(() => {
    if (expanded && !isRead) {
      const scrollContainer = document.getElementById(`scroll-container-${article.id}`);
      if (scrollContainer) {
         if (scrollContainer.scrollHeight <= scrollContainer.clientHeight + 10) {
            handleScroll({ currentTarget: scrollContainer } as any);
         }
      }
    }
  }, [expanded, isRead, article.id]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.medium();
    if (isSaved) {
       useStore.getState().removeSavedArticle(article.id);
       return;
    }
    
    // Instead of immediately saving, open library selector if they have libraries
    if (libraries.length > 0) {
       setShowLibrarySelector(true);
    } else {
       saveArticle(article);
       addXp(20);
       useStore.getState().recordInteraction(article.category || 'General', 1.0);
    }
  };

  const handleAddToLibrary = (libraryId: string, roomId: string) => {
     addArticleToLibrary(libraryId, article, roomId);
     saveArticle(article); // Also add to general saved list
     addXp(50);
     useStore.getState().recordInteraction(article.category || 'General', 1.0);
     setShowLibrarySelector(false);
     haptic.success();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.light();
    setShowShareDialog(true);
    addXp(10);
  };

  const handleNotInterested = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.medium();
    
    useStore.getState().recordInteraction(article.category || 'General', -0.5);
    addXp(5);
    
    setExpanded(false);
    setFocusMode(false);
    
    setTimeout(() => {
      const feed = document.querySelector('.snap-y'); // Get the scroll container loosely by class
      if (feed) {
         feed.scrollBy({ top: feed.clientHeight, behavior: 'smooth' });
      }
    }, 300);
  };

  return (
    <div className="relative w-full h-full bg-transparent overflow-hidden" onClick={() => !expanded && setExpanded(true)}>
      {/* Dynamic Background Image with Strong Vignette/Gradient */}
      {article.imageUrl ? (
        <div className="absolute inset-0 w-full h-full select-none pointer-events-none z-0">
          <img src={article.imageUrl} alt={article.title} className="w-full h-[60%] object-cover opacity-[0.85] mix-blend-luminosity" />
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-neutral-950 via-[#0A0A0A]/90 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full select-none pointer-events-none z-0 bg-gradient-to-b from-neutral-900/50 via-[#0A0A0A] to-[#0A0A0A] flex justify-center pt-24">
           <div className="w-40 h-40 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-inner flex items-center justify-center flex-col gap-4">
             <span className="text-7xl font-sans font-black text-white/[0.05] uppercase leading-none">{article.title.charAt(0)}</span>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={cn(
        "absolute bottom-0 w-full flex flex-col justify-end transition-all duration-300 pointer-events-none z-10",
        expanded ? "h-full bg-[#0A0A0A]/95 backdrop-blur-2xl" : "h-[85%] pb-24 px-2"
      )}>
        
        {/* Expanded View Scrollable Area */}
        <AnimatePresence>
          {expanded && (
            <motion.div 
              id={`scroll-container-${article.id}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute inset-0 pt-16 overflow-y-auto pb-32 pointer-events-auto hide-scrollbar"
              onScroll={handleScroll}
            >
              <div className="px-6 pt-8 pb-12 max-w-sm md:max-w-xl mx-auto">
                <div className="flex gap-3 mb-6 items-center flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-bold tracking-widest uppercase">
                    {article.category || 'Knowledge'}
                  </span>
                  {article.rarity === 'epic' && (
                    <span className="px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-400 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                      Epic Discovery
                    </span>
                  )}
                  {article.rarity === 'rare' && (
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                      Rare
                    </span>
                  )}
                  <span className="text-neutral-500 text-[11px] font-medium uppercase tracking-widest flex items-center gap-1">
                    <Clock size={12} /> {article.readTimeEstimate}M
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold mb-8 leading-[1.1] tracking-tight text-white">{article.title}</h1>
                
                {useStore.getState().remixes.some(r => r.articleId === article.id) && (
                   <div className="mb-6 bg-teal-500/10 border border-teal-500/30 rounded-[24px] p-5 shadow-sm">
                      <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"><MessageSquarePlus size={12} /> Your Remix</p>
                      <p className="text-sm font-medium text-white italic">"{useStore.getState().remixes.find(r => r.articleId === article.id)?.note}"</p>
                   </div>
                )}
                
                <div className="prose prose-invert prose-lg max-w-none text-neutral-300 leading-normal font-sans">
                  {article.extract.split('\n').filter(p => p.trim() !== '').map((p, i) => (
                    <p key={i} className="mb-6">{p}</p>
                  ))}
                </div>

                <div className="mt-16 flex justify-center pb-20">
                   {!isRead ? (
                     <div className="flex flex-col items-center gap-6">
                        <div className="text-neutral-500 text-[11px] font-bold tracking-widest uppercase">Almost there...</div>
                        <button 
                           onClick={(e) => { e.stopPropagation(); handleMarkAsRead(); }}
                           className="px-8 py-4 rounded-full bg-teal-500 text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_30px_rgba(45,212,191,0.3)] hover:bg-teal-400"
                        >
                           <BookOpen size={18} /> Mark as Read
                        </button>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center gap-6">
                       <div className="flex items-center gap-2 text-teal-400 bg-teal-500/10 px-6 py-3 rounded-full font-semibold text-sm">
                         <CheckCircle size={18} /> Mastered (+50 XP)
                       </div>
                       
                       {!showRemixBox ? (
                           <button 
                             onClick={(e) => { e.stopPropagation(); haptic.medium(); setShowRemixBox(true); }}
                             className="w-full max-w-[280px] bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 animate-pulse active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                           >
                             <MessageSquarePlus size={18} /> Add Remix (+100 Coins)
                           </button>
                       ) : (
                           <div className="w-full max-w-[280px] bg-white/10 p-4 rounded-[24px] border border-white/20">
                              <textarea autoFocus value={remixNote} onChange={e => setRemixNote(e.target.value)} onClick={e=>e.stopPropagation()} className="w-full bg-transparent text-white text-sm outline-none resize-none hide-scrollbar placeholder:text-neutral-500 mb-3" placeholder="Add your thought to this discovery..."></textarea>
                              <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); setShowRemixBox(false); }} className="flex-1 py-3 rounded-full text-xs font-bold text-neutral-400 hover:text-white bg-white/5 active:scale-95 transition-all">Cancel</button>
                                <button onClick={(e) => { e.stopPropagation(); if (remixNote) { addRemix(article.id, remixNote); addWisdomShards(100); addXp(50); haptic.success(); setShowRemixBox(false); confetti({particleCount:100, spread:60, origin:{y:0.7}, colors:['#fbbf24', '#ffffff']}); } }} className="flex-1 py-3 rounded-full text-xs font-bold text-black bg-amber-400 active:scale-95 transition-all">Publish</button>
                              </div>
                           </div>
                       )}

                       <a href={article.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-[13px] font-medium border border-neutral-800 px-4 py-2 rounded-full">
                         Read full article on Wikipedia
                         <ExternalLink size={14} />
                       </a>
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed/Preview Info */}
        <AnimatePresence>
          {!expanded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-[90%] mx-auto pointer-events-auto backdrop-blur-3xl bg-black/40 rounded-[32px] p-6 mb-6 shadow-2xl relative overflow-hidden"
            >
               <div className="mb-4 flex items-center gap-2 flex-wrap">
                 <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-bold tracking-widest uppercase">
                   {article.category || 'Knowledge'}
                 </span>
                 {article.rarity === 'epic' && (
                    <span className="px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-400 text-[10px] font-bold tracking-widest uppercase">
                      Epic
                    </span>
                 )}
                 {article.rarity === 'rare' && (
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-widest uppercase">
                      Rare
                    </span>
                 )}
                 <span className="text-neutral-500 text-[11px] font-medium tracking-widest uppercase">• {article.readTimeEstimate}m</span>
               </div>
               
               <h2 className="text-[28px] font-bold mt-1 mb-4 leading-tight tracking-tight text-white">
                 {article.title}
               </h2>
               
               <p className="text-[15px] text-neutral-400 line-clamp-3 leading-relaxed mb-6 font-medium pr-4">{article.extract}</p>
               
               <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                   <div className="flex items-center gap-1 text-teal-400 text-[11px] font-bold uppercase tracking-widest">
                     <span>+50 XP</span>
                   </div>
                   <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                     <span>Tap to Read</span>
                     <ChevronDown size={14} />
                   </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className={cn(
          "pointer-events-auto flex gap-3 transition-all duration-500",
          expanded ? "fixed bottom-10 left-1/2 -translate-x-1/2 backdrop-blur-3xl bg-black/60 p-2 rounded-full shadow-2xl z-50 flex-row" : "absolute right-4 bottom-40 flex-col z-20 opacity-90"
        )}>
          {expanded && (
             <>
               <button onClick={handleNotInterested} className="flex flex-col items-center gap-1 active:scale-90 transition-transform mr-2 pr-2 border-r border-white/10 group">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-3xl bg-white/5 group-hover:bg-red-500/10 text-neutral-400 group-hover:text-red-400 transition-colors">
                    <ThumbsDown size={20} strokeWidth={2} />
                  </div>
               </button>
               <button onClick={(e) => { e.stopPropagation(); haptic.light(); setFocusMode(!focusMode); }} className="flex flex-col items-center gap-1 active:scale-90 transition-transform mr-2 pr-2 border-r border-white/10">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-3xl transition-colors", focusMode ? "bg-teal-500/10 text-teal-400" : "bg-white/5 hover:bg-white/10 text-neutral-400")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v4a2 2 0 0 0 2 2h4"/><path d="M14 20h4a2 2 0 0 0 2-2v-4"/><path d="M20 10V6a2 2 0 0 0-2-2h-4"/><path d="M10 4H6a2 2 0 0 0-2 2v4"/></svg>
                  </div>
               </button>
             </>
          )}

          <button onClick={handleSave} className="tour-bookmark-btn flex flex-col items-center gap-1 active:scale-90 transition-transform">
             <div className={cn("w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-3xl transition-colors", expanded ? "bg-white/5 hover:bg-white/10" : "bg-black/40", isSaved ? "text-teal-400 bg-teal-500/10" : "text-neutral-400")}>
              <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} strokeWidth={2.5} />
            </div>
          </button>
          
          <button onClick={handleShare} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
             <div className={cn("w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-3xl transition-colors", expanded ? "bg-white/5 hover:bg-white/10" : "bg-black/40 text-neutral-400")}>
              <Share2 size={20} strokeWidth={2.5} />
            </div>
          </button>

          {expanded && libraries.length > 0 && !isSaved && (
             <button onClick={(e) => { e.stopPropagation(); setShowLibrarySelector(!showLibrarySelector); haptic.light(); }} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-3xl transition-colors", showLibrarySelector ? "bg-amber-500/10 text-amber-400" : "bg-white/5 hover:bg-white/10 text-amber-400/70")}>
                  <Castle size={20} strokeWidth={2} />
                </div>
             </button>
          )}

          {expanded && (
             <button onClick={(e) => { e.stopPropagation(); haptic.light(); setExpanded(false); setFocusMode(false); }} className="flex flex-col items-center gap-1 active:scale-90 transition-transform ml-2 pl-2 border-l border-white/10">
                <div className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-3xl bg-white/10 text-white">
                  <X size={20} strokeWidth={2.5} />
                </div>
             </button>
          )}
        </div>

        {/* Reading Progress Indicator */}
        {expanded && (
          <div className="fixed top-0 left-0 w-full h-1 bg-neutral-900 z-50 overflow-hidden">
            <div className="h-full bg-teal-400 transition-all duration-150 ease-out" style={{ width: `${readProgress}%` }} />
          </div>
        )}

      </div>

      <AnimatePresence>
        {showShareDialog && <ShareDialog article={article} onClose={() => setShowShareDialog(false)} />}
        
        {/* Library Selector Bottom Sheet */}
        {showLibrarySelector && (
          <motion.div 
             initial={{ y: "100%", opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: "100%", opacity: 0 }}
             onClick={(e) => e.stopPropagation()}
             className="absolute bottom-0 left-0 right-0 max-h-[60%] bg-black/90 backdrop-blur-3xl border-t border-white/10 rounded-t-[32px] p-6 z-50 overflow-y-auto"
          >
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-white flex items-center gap-2"><Castle size={20} className="text-amber-400" /> Add to Library</h3>
               <button onClick={(e) => { e.stopPropagation(); setShowLibrarySelector(false); }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-neutral-400"><X size={16} /></button>
             </div>
             
             <div className="flex flex-col gap-3">
                {libraries.map(lib => (
                   <div key={lib.id} className="p-4 rounded-[24px] bg-white/5 border border-white/10 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                         <div className="text-2xl">{lib.coatOfArms}</div>
                         <div>
                            <h4 className="font-bold text-white">{lib.name}</h4>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{lib.theme}</p>
                         </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                         {['History Wing', 'Science Lab', 'Main Hall'].map(room => (
                            <button 
                              key={room}
                              onClick={(e) => { e.stopPropagation(); handleAddToLibrary(lib.id, room); }}
                              className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-neutral-300 font-medium hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
                            >
                               {room}
                            </button>
                         ))}
                      </div>
                   </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
