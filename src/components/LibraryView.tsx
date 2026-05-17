import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Library, useStore } from '../store/useStore';
import { Castle, User, Heart, MessageCircle, Map, PlayCircle, Trophy, Route, Crown, Sparkles, LayoutGrid, X } from 'lucide-react';
import { haptic } from '../lib/haptics';
import { cn } from '../lib/utils';
import { getPlayerRank, getRankColor, PlayerRank } from '../lib/ranks';

interface Props {
  library: Library;
  onClose: () => void;
  onChallenge: () => void;
}

export function LibraryView({ library, onClose, onChallenge }: Props) {
  const { userName, isPremium, addWisdomShards, level } = useStore();
  const [activeRoom, setActiveRoom] = useState<string>('All');
  const [playingTour, setPlayingTour] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [viewingExhibit, setViewingExhibit] = useState<any>(null);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showGuestbook, setShowGuestbook] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [narrationText, setNarrationText] = useState<string | null>(null);

  // Calculate owner rank
  let ownerRank: PlayerRank = 'Knowledge Seeker';
  if (library.ownerId === 'me') {
     ownerRank = getPlayerRank(level);
  } else {
     ownerRank = getPlayerRank(library.conqueredCount * 2); // mock rank for others
  }
  const rankColor = getRankColor(ownerRank);

  const submitComment = () => {
    if (!commentText.trim()) return;
    haptic.success();
    if (viewingExhibit) {
       viewingExhibit.comments.push({ id: Math.random().toString(), userId: 'me', userName, text: commentText, date: new Date().toISOString(), type: 'comment' });
    } else if (showGuestbook) {
       // Just mock adding to a "guestbook" on the library. Since library is copied from state, we can't easily persist without mutating state correctly, but this is a mock.
       if (!library.guestbook) library.guestbook = [];
       library.guestbook.push({ id: Math.random().toString(), userId: 'me', userName, text: commentText, date: new Date().toISOString() });
    }
    setCommentText('');
    setCommenting(false);
    addWisdomShards(10);
  };
  
  const submitReaction = (type: 'like' | 'inspired') => {
     haptic.light(); 
     addWisdomShards(5); 
     if (type === 'like') viewingExhibit.likes += 1;
     else viewingExhibit.inspiredCount = (viewingExhibit.inspiredCount || 0) + 1;
     setViewingExhibit({...viewingExhibit});
  }
  
  const rooms = ['All', ...Array.from(new Set(library.articles.map(a => a.roomId)))];
  const filteredArticles = activeRoom === 'All' ? library.articles : library.articles.filter(a => a.roomId === activeRoom);

  const endTour = () => {
     setPlayingTour(false);
     setNarrationText(null);
     if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const playNarrationForIndex = async (index: number) => {
     if (index >= filteredArticles.length) {
        endTour();
        return;
     }
     setTourIndex(index);
     setNarrationText("Thinking...");
     try {
       const { getExhibitNarration } = await import('../lib/gemini');
       const exhibit = filteredArticles[index].article;
       const context = `Library: ${library.name}, Theme: ${library.theme}`;
       const narration = await getExhibitNarration(exhibit.title, exhibit.extract, context);
       
       if (playingTour && narration) {
          setNarrationText(narration);
          if (window.speechSynthesis) {
             window.speechSynthesis.cancel();
             const utterance = new SpeechSynthesisUtterance(narration);
             utterance.rate = 1.0;
             utterance.pitch = 1.0;
             utterance.onend = () => {
                // Wait 2 seconds before next
                setTimeout(() => {
                   if (playingTour) playNarrationForIndex(index + 1);
                }, 2000);
             };
             utterance.onerror = () => {
                setTimeout(() => {
                   if (playingTour) playNarrationForIndex(index + 1);
                }, 4000); // Fallback to timer if speech fails
             };
             window.speechSynthesis.speak(utterance);
          } else {
             // Fallback 
             setTimeout(() => {
                if (playingTour) playNarrationForIndex(index + 1);
             }, 5000);
          }
       }
     } catch(e) {
       console.error("AI Narration error", e);
       // Fallback 
       setTimeout(() => {
          if (playingTour) playNarrationForIndex(index + 1);
       }, 4000);
     }
  };

  const startTour = () => {
     if (filteredArticles.length === 0) return;
     setPlayingTour(true);
     playNarrationForIndex(0);
     haptic.success();
  };

  // cleanup 
  useEffect(() => {
     return () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
     };
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0a0a0c] z-[300] flex flex-col overflow-hidden font-sans">
       
       {/* Ambient Background */}
       <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-teal-500/20 to-transparent blur-3xl"></div>
       </div>

       {/* Safe Header */}
       <div className="relative z-10 px-6 pt-12 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-2xl relative shadow-2xl">
                {library.coatOfArms}
                {library.conqueredCount > 10 && (
                   <div className="absolute -bottom-2 w-full flex justify-center">
                      <div className="bg-amber-500/20 border border-amber-500/50 backdrop-blur-md text-amber-400 w-6 h-6 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                         <Crown size={12} />
                      </div>
                   </div>
                )}
             </div>
             <div>
                <h1 className="text-[32px] font-serif italic text-white tracking-tight leading-none mb-2 drop-shadow-md">{library.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                   <span className={cn("text-[9px] uppercase border px-2 py-1 rounded-md font-bold tracking-widest", rankColor, library.ownerId === 'me' ? "" : "opacity-80")}>
                      {library.ownerId === 'me' ? `Your Empire • ${ownerRank}` : `Curator: ${ownerRank}`}
                   </span>
                   {library.sponsor && (
                      <span className="text-[9px] bg-white/10 px-2 py-1 rounded-md text-white font-bold tracking-widest uppercase">{library.sponsor}</span>
                   )}
                </div>
             </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-colors shadow-lg">
             <X size={20} />
          </button>
       </div>

       {playingTour ? (
          <div className="flex-1 relative bg-black flex flex-col">
             <AnimatePresence mode="wait">
                <motion.div 
                   key={tourIndex}
                   initial={{ opacity: 0, scale: 1.05 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 1, ease: 'easeOut' }}
                   className="absolute inset-0"
                >
                   {filteredArticles[tourIndex]?.article.imageUrl && (
                      <img src={filteredArticles[tourIndex].article.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                   
                   <div className="absolute bottom-32 left-8 right-8 text-center text-white">
                      <span className="text-teal-400 uppercase tracking-widest text-[9px] font-bold mb-3 block">Exhibition {tourIndex + 1} of {filteredArticles.length}</span>
                      <h2 className="text-4xl font-serif italic mb-6 leading-tight drop-shadow-xl">{filteredArticles[tourIndex]?.article.title}</h2>
                      {narrationText ? (
                         <div className="bg-black/60 backdrop-blur-md p-6 rounded-[24px] border border-white/10 max-w-2xl mx-auto">
                            <Sparkles className="text-amber-400 mx-auto mb-3" size={20} />
                            <p className="text-lg text-amber-50 leading-relaxed font-serif italic drop-shadow-md">"{narrationText}"</p>
                         </div>
                      ) : (
                         <p className="text-lg text-neutral-300 leading-relaxed font-serif max-w-2xl mx-auto drop-shadow-md">"{filteredArticles[tourIndex]?.article.extract}"</p>
                      )}
                   </div>
                </motion.div>
             </AnimatePresence>
             <button onClick={endTour} className="absolute bottom-12 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold tracking-widest uppercase text-xs z-50 hover:bg-white/20 transition-all shadow-2xl">End Tour</button>
          </div>
       ) : (
          <div className="flex-1 overflow-y-auto hide-scrollbar px-6 flex flex-col gap-10 pb-32 relative z-10">
             
             {/* Action Bar */}
             <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[32px] p-2 flex gap-2">
                <button onClick={startTour} className="flex-1 py-4 bg-teal-500 text-black rounded-[24px] text-sm font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-teal-400 transition-colors">
                   <PlayCircle size={18} /> Guided Tour
                </button>
                <button onClick={() => { setShowGuestbook(true); setCommenting(true); }} className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-[24px] text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-white/10">
                   <User size={18} /> Guestbook
                </button>
                {library.ownerId === 'me' && (
                   <button onClick={() => setShowManager(true)} className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-[24px] text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-white/10">
                      <LayoutGrid size={18} /> Edit
                   </button>
                )}
             </div>

             {/* Events (Other empires only) */}
             {library.ownerId !== 'me' && (
                <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-6 rounded-[32px] relative overflow-hidden backdrop-blur-sm">
                   <div className="absolute -right-10 -bottom-10 text-amber-500/20 w-48 h-48 pointer-events-none">
                      <Trophy style={{ width: '100%', height: '100%' }} />
                   </div>
                   <div className="relative z-10">
                      <h3 className="text-white font-bold mb-2 flex items-center gap-3 text-lg">Empire Challenge <span className="px-3 py-1 rounded-md bg-amber-500 text-black text-[9px] uppercase font-black tracking-widest">Live</span></h3>
                      <p className="text-neutral-400 text-sm mb-6 w-3/4 leading-relaxed font-medium">Outsmart the curator of this library to gain 7 days of "Dominance" and earn 500 shards.</p>
                      <button onClick={onChallenge} className="bg-amber-500 text-black px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-amber-400 transition-colors inline-block tracking-wide">Start Conquest Battle</button>
                   </div>
                </div>
             )}
             
             {/* Room Navigation */}
             <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4 px-2">Wings & Rooms</h3>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mask-linear">
                   {rooms.map(r => (
                      <button 
                         key={r}
                         onClick={() => setActiveRoom(r)}
                         className={`whitespace-nowrap px-6 py-3 rounded-full border text-sm font-bold transition-all ${activeRoom === r ? 'bg-white text-black border-white shadow-lg' : 'bg-transparent border-white/10 text-neutral-400 hover:text-white hover:border-white/20'}`}
                      >
                         {r}
                      </button>
                   ))}
                </div>
             </div>

             {/* Exhibits Grid */}
             <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-6 px-2 flex items-center gap-2">Exhibits on Display ({filteredArticles.length})</h3>
                {filteredArticles.length === 0 ? (
                   <div className="text-center py-20 text-neutral-500 bg-white/5 rounded-[40px] border border-white/5 border-dashed">
                      <Castle size={32} className="mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-medium">This grand hall is empty.</p>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                      {filteredArticles.map((item, idx) => (
                         <div key={idx} onClick={() => setViewingExhibit(item)} className="rounded-[32px] bg-white/5 border border-white/10 overflow-hidden cursor-pointer shadow-xl group hover:bg-white/10 transition-colors backdrop-blur-sm relative">
                            {item.article.imageUrl && (
                               <div className="h-64 w-full overflow-hidden relative">
                                  <img src={item.article.imageUrl} alt={item.article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent"></div>
                               </div>
                            )}
                            <div className={cn("p-6", item.article.imageUrl ? "absolute bottom-0 left-0 right-0" : "")}>
                               <h4 className="text-white font-black text-2xl mb-2 leading-tight drop-shadow-md">{item.article.title}</h4>
                               {!item.article.imageUrl && <p className="text-neutral-400 text-sm line-clamp-3 leading-relaxed mb-6 font-serif">"{item.article.extract}"</p>}
                               
                               <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                  <div className="flex items-center gap-4">
                                     <span className="text-xs text-white/70 font-medium flex items-center gap-1"><Heart size={14} className="text-pink-500" /> {item.likes}</span>
                                     <span className="text-xs text-white/70 font-medium flex items-center gap-1"><MessageCircle size={14} /> {item.comments?.length || 0}</span>
                                     <span className="text-xs text-white/70 font-medium flex items-center gap-1"><Sparkles size={14} className="text-amber-400" /> {item.inspiredCount || 0}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
       )}

       {/* Fullscreen Exhibit Modal */}
       <AnimatePresence>
          {viewingExhibit && (
             <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="absolute inset-0 bg-[#0a0a0c] z-50 flex flex-col overflow-y-auto">
                <div className="z-20 px-6 pt-12 pb-4 flex justify-between items-center">
                   <div className="backdrop-blur-md bg-white/10 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                       <span className="text-teal-400 uppercase tracking-widest font-black text-[9px]">{viewingExhibit.roomId}</span>
                   </div>
                   <button onClick={() => { setViewingExhibit(null); setCommenting(false); }} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 shadow-lg"><X size={20} /></button>
                </div>
                
                <div className="px-6 pb-32">
                    {viewingExhibit.article.imageUrl && (
                       <div className="w-full h-80 rounded-[40px] overflow-hidden mb-10 shadow-2xl border border-white/5">
                           <img src={viewingExhibit.article.imageUrl} alt="" className="w-full h-full object-cover" />
                       </div>
                    )}
                    
                    <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 leading-tight tracking-tight">{viewingExhibit.article.title}</h2>
                    
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] mb-10 backdrop-blur-sm">
                        <p className="text-xl text-neutral-300 leading-relaxed font-serif italic max-w-3xl">"{viewingExhibit.article.extract}"</p>
                    </div>

                    {viewingExhibit.note && (
                       <div className="bg-teal-500/10 p-8 rounded-[40px] border border-teal-500/20 relative mb-10">
                          <div className="absolute -top-3 left-8 bg-[#0a0a0c] px-3 font-bold text-teal-400 uppercase tracking-widest text-[10px]">Curator's Note</div>
                          <p className="text-base text-teal-50 leading-relaxed">"{viewingExhibit.note}"</p>
                       </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-8 mt-auto">
                       <button onClick={() => submitReaction('like')} className="flex items-center justify-center gap-3 p-5 bg-white/5 rounded-[24px] flex-1 text-white font-bold border border-white/10 hover:bg-pink-500/10 hover:text-pink-400 hover:border-pink-500/40 transition-all">
                          <Heart size={20} className="fill-current opacity-50" /> Like ({viewingExhibit.likes})
                       </button>
                       <button onClick={() => submitReaction('inspired')} className="flex items-center justify-center gap-3 p-5 bg-white/5 rounded-[24px] flex-1 text-white font-bold border border-white/10 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/40 transition-all">
                          <Sparkles size={20} className="fill-current opacity-50" /> Inspired ({viewingExhibit.inspiredCount || 0})
                       </button>
                       <button onClick={() => setCommenting(!commenting)} className="flex items-center justify-center gap-3 p-5 bg-white/5 rounded-[24px] flex-1 text-white font-bold border border-white/10 hover:bg-white/10 transition-all">
                          <MessageCircle size={20} /> Discuss ({viewingExhibit.comments?.length || 0})
                       </button>
                    </div>
                    
                    {commenting && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 flex flex-col gap-3">
                           <textarea autoFocus value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Leave a thought for the curator..." className="w-full bg-white/5 border border-white/10 rounded-[24px] p-5 text-white text-base focus:outline-none focus:border-teal-500/50 resize-none h-32" />
                           <button onClick={submitComment} className="bg-teal-500 text-black py-4 font-bold rounded-[20px] text-base shadow-xl hover:bg-teal-400 transition-colors w-full sm:w-auto self-end px-12">Submit</button>
                       </motion.div>
                    )}
                    
                    {viewingExhibit.comments?.length > 0 && (
                       <div className="mt-16 space-y-4">
                          <h4 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-6 px-2">Visitor Log</h4>
                          {viewingExhibit.comments.map((c: any) => (
                             <div key={c.id} className="bg-white/5 p-6 rounded-[24px] border border-white/5 backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-3">
                                   <span className="text-teal-400 text-[10px] font-bold uppercase tracking-widest">{c.userName || 'Visitor'}</span>
                                   <span className="text-neutral-600 text-[10px]">{new Date(c.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-base text-neutral-300 leading-relaxed font-serif italic">"{c.text}"</p>
                             </div>
                          ))}
                       </div>
                    )}
                </div>
             </motion.div>
          )}
       </AnimatePresence>

       {/* Guestbook Modal */}
       <AnimatePresence>
          {showGuestbook && !viewingExhibit && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0a0a0c] border border-white/10 rounded-[40px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                   <button onClick={() => { setShowGuestbook(false); setCommenting(false); }} className="absolute top-6 right-6 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white"><X size={18} /></button>
                   <h2 className="text-2xl font-black text-white mb-2">Library Guestbook</h2>
                   <p className="text-neutral-400 mb-8 text-sm">Leave a public message for the curator and future visitors.</p>

                   {commenting ? (
                      <div className="flex flex-col gap-3">
                          <textarea autoFocus value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Your message..." className="w-full bg-white/5 border border-white/10 rounded-[24px] p-5 text-white text-base focus:outline-none focus:border-teal-500/50 resize-none h-32" />
                          <button onClick={submitComment} className="bg-teal-500 text-black py-4 font-bold rounded-[20px] text-base shadow-xl hover:bg-teal-400 transition-colors w-full">Sign Guestbook</button>
                      </div>
                   ) : (
                      <button onClick={() => setCommenting(true)} className="w-full py-4 rounded-[20px] bg-white/5 text-white font-bold border border-white/10 hover:bg-white/10">Write a Message</button>
                   )}

                   <div className="mt-8 pt-8 border-t border-white/10 max-h-64 overflow-y-auto hide-scrollbar space-y-4">
                      {library.guestbook?.length > 0 ? library.guestbook.map((entry: any) => (
                         <div key={entry.id} className="bg-white/5 p-4 rounded-[20px]">
                            <div className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mb-2">{entry.userName}</div>
                            <div className="text-sm text-neutral-300 font-serif italic">"{entry.text}"</div>
                         </div>
                      )) : (
                         <div className="text-center text-neutral-500 py-4 text-sm font-serif italic">No signatures yet. Be the first!</div>
                      )}
                   </div>
                </motion.div>
             </motion.div>
          )}
       </AnimatePresence>

       {/* Manager Modal */}
       <AnimatePresence>
          {showManager && (
             <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute inset-0 z-[500] bg-[#0a0a0c] flex flex-col">
                <div className="z-20 px-6 pt-12 pb-6 flex justify-between items-center border-b border-white/5">
                   <h2 className="text-2xl font-black text-white flex items-center gap-3"><LayoutGrid className="text-teal-400" /> Curator's Desk</h2>
                   <button onClick={() => setShowManager(false)} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all"><X size={20} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-10 pb-32">
                   
                   <div>
                      <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">AI Content Quality Assistant</h3>
                      <div className="bg-gradient-to-br from-fuchsia-500/10 to-transparent border border-fuchsia-500/20 rounded-[32px] p-6 backdrop-blur-md">
                         <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="text-fuchsia-400" size={24} />
                            <h4 className="text-white font-bold text-lg">Curator AI</h4>
                         </div>
                         <p className="text-sm text-neutral-400 mb-6 leading-relaxed">Let Gemini analyze your exhibits and suggest better tags, thematic connections, and missing topics to make your library legendary.</p>
                         <button 
                            onClick={async () => {
                               try {
                                 const { getCuratorAssistantSuggestions } = await import('../lib/gemini');
                                 const suggestions = await getCuratorAssistantSuggestions(library.name, library.articles);
                                 if (suggestions && suggestions.length > 0) {
                                    alert(suggestions.map((s:any) => `[${s.type}] ${s.suggestion}`).join('\n\n'));
                                 } else {
                                    alert('AI says your library is perfect as is!');
                                 }
                               } catch (e) {
                                 alert('AI is resting.');
                               }
                            }}
                            className="w-full py-4 bg-fuchsia-500/20 border border-fuchsia-500/40 rounded-[20px] text-fuchsia-300 font-bold hover:bg-fuchsia-500/30 transition-colors">
                            Consult AI Curator
                         </button>
                      </div>
                   </div>

                   <div>
                      <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">Tour & Layout</h3>
                      <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-md">
                         <p className="text-sm text-neutral-400 mb-6 leading-relaxed">Arrange the flow of exhibits or customize the Guided Tour experience for your visitors.</p>
                         <button className="w-full py-4 bg-white/5 border border-white/10 rounded-[20px] text-white font-bold mb-3 hover:bg-white/10 transition-colors">Re-order Exhibits</button>
                         <button className="w-full py-4 bg-teal-500/10 border border-teal-500/20 rounded-[20px] text-teal-400 font-bold hover:bg-teal-500/20 transition-colors">Create Themed Guided Tour</button>
                      </div>
                   </div>

                   <div>
                      <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">Manage Exhibits ({library.articles.length})</h3>
                      <div className="space-y-4">
                         {library.articles.map((item, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-[24px] p-4 flex gap-4 items-center">
                               {item.article.imageUrl ? (
                                  <img src={item.article.imageUrl} className="w-16 h-16 rounded-xl object-cover" />
                               ) : (
                                  <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center"><Castle className="opacity-50" /></div>
                               )}
                               <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-bold text-white truncate">{item.article.title}</h4>
                                  <p className="text-[10px] text-teal-400 uppercase tracking-widest font-bold mt-1 bg-teal-500/10 inline-block px-2 py-0.5 rounded-full">{item.roomId}</p>
                               </div>
                               <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 hover:bg-white/10">...</button>
                            </div>
                         ))}
                      </div>
                   </div>

                </div>
             </motion.div>
          )}
       </AnimatePresence>

    </motion.div>
  );
}
