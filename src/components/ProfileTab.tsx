import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { User, Bookmark, History, Settings, ExternalLink, ShieldCheck, Moon, Sparkles, Snowflake, Users, Share2, Award, Coins, Gem, ScrollText, Globe, GraduationCap, Map, Eye } from 'lucide-react';
import { KnowledgeTree } from './KnowledgeTree';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { formatISO, parseISO, formatDistanceToNow } from 'date-fns';
import { getPlayerRank, getRankColor } from '../lib/ranks';

import { CITIES, City } from '../data/cities';

function EmpireStory() {
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { xp, level, streak, libraries } = useStore();

  const handleGenerate = async () => {
     setLoading(true);
     const { getEmpireNarrative } = await import('../lib/gemini');
     const myLibrariesCount = libraries.filter(l => l.ownerId === 'me').length;
     const result = await getEmpireNarrative({ level, xp, streak, libraries: myLibrariesCount });
     setStory(result);
     setLoading(false);
  };

  return (
    <div className="mb-10 backdrop-blur-3xl bg-neutral-900 border border-white/10 rounded-[24px] p-5 shadow-sm">
       <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
          <ScrollText className="text-amber-400" size={14} /> Imperial Chronicle
       </h2>
       {story ? (
          <div>
            <p className="text-sm text-neutral-300 italic font-serif leading-relaxed mb-4">"{story}"</p>
            <button onClick={handleGenerate} disabled={loading} className="text-[10px] py-2 px-4 rounded-full border border-white/10 uppercase font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors">Generate New Chronicle</button>
          </div>
       ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-xs text-neutral-400 mb-2 font-medium leading-relaxed">Let your Imperial AI Advisors pen an epic chronicle of your conquests this month.</p>
            <button onClick={handleGenerate} disabled={loading} className="w-full bg-amber-500/10 text-amber-500 border border-amber-500/30 px-6 py-3 rounded-[16px] text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-all disabled:opacity-50">
               {loading ? 'Consulting Advisors...' : 'Pen the Chronicle'}
            </button>
          </div>
       )}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
};

export function ProfileTab() {
  const { xp, level, savedArticles, readingHistory, isPremium, premiumTier, streakFreezes, friends, setShowPaywall, wisdomShards, libraries } = useStore();
  const userRank = getPlayerRank(level);
  const rankColor = getRankColor(userRank);
  
  // Calculate Empire Status
  const myLibraries = libraries.filter(l => l.ownerId === 'me');
  const myCities = myLibraries.map(l => CITIES.find(c => c.id === l.cityId)).filter(Boolean) as City[];
  const countries = Array.from(new Set(myCities.map(c => c.country)));
  
  const empireStatus = countries.map(country => {
     const citiesInCountry = myCities.filter(c => c.country === country);
     const totalCitiesInCountry = CITIES.filter(c => c.country === country).length;
     if (citiesInCountry.length >= 3 || (citiesInCountry.length === totalCitiesInCountry && totalCitiesInCountry > 0)) {
        return `Dominance in ${country} 👑`;
     } else if (citiesInCountry.length > 0) {
        return `Presence in ${country}`;
     }
     return null;
  }).filter(Boolean);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="h-full w-full overflow-y-auto px-6 pt-24 pb-32 custom-scrollbar relative z-10">
       <motion.div variants={itemVariants} className="flex items-center justify-between mb-8 pt-4">
         <h1 className="text-[32px] font-serif italic text-white tracking-tight">Your Empire</h1>
         <div className="w-12 h-12 rounded-full bg-teal-500/20 p-0.5 relative">
           {['sovereign', 'eternal_mind'].includes(premiumTier) ? (
             <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-full flex items-center justify-center border-2 border-[#0A0A0A] z-10 shadow-[0_0_15px_rgba(251,191,36,0.5)]">
               <Sparkles size={10} className="text-black" />
             </div>
           ) : premiumTier === 'basic' && (
             <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center border-2 border-[#0A0A0A] z-10 shadow-[0_0_10px_rgba(45,212,191,0.5)]">
               <Sparkles size={10} className="text-black" />
             </div>
           )}
           <div className="w-full h-full rounded-full bg-neutral-900 border border-teal-500/30 flex items-center justify-center overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Explorer${level}`} alt="Avatar" className="w-10 h-10 grayscale hover:grayscale-0 transition-all" />
           </div>
         </div>
       </motion.div>
       
       {/* Level Hero */}
       <motion.div variants={itemVariants} className="backdrop-blur-3xl bg-black/40 border border-white/5 p-6 rounded-[32px] shadow-sm relative overflow-hidden mb-4">
         <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-500/10 blur-3xl rounded-full pointer-events-none"></div>
         {['sovereign', 'eternal_mind'].includes(premiumTier) && <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>}
         
         {!isPremium && (
           <button 
             onClick={() => setShowPaywall(true)}
             className="absolute top-4 right-4 bg-teal-500/10 hover:bg-teal-500/20 transition-colors text-teal-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-teal-500/20 flex items-center gap-1.5"
           >
             <Sparkles size={12} /> GoPro
           </button>
         )}

         <div className="flex items-center gap-6 relative z-10 mt-2">
           <div className="w-20 h-20 rounded-[24px] bg-teal-500/10 flex items-center justify-center shadow-inner border border-teal-500/20 shrink-0">
             <span className="text-4xl font-serif text-teal-400">{level}</span>
           </div>
           <div className="flex-1">
             <h2 className="text-lg font-bold text-white mb-1 tracking-wide">{useStore.getState().userName || 'Explorer'}</h2>
             <span className={cn("inline-block px-2 py-0.5 rounded-full border text-[9px] mb-3 font-bold uppercase tracking-widest", rankColor)}>{userRank} • Lvl {level}</span>
             <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden shadow-inner flex mb-1">
               <div className="h-full bg-teal-400" style={{ width: `${(xp % 1000) / 10}%` }}></div>
             </div>
             <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest text-right">{xp % 1000} / 1000 XP</p>
           </div>
         </div>
         
         <div className="mt-6 flex items-center gap-2 border-t border-white/5 pt-4">
           <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border", isPremium || streakFreezes > 0 ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-neutral-800 border-neutral-700 text-neutral-500")}>
             <Snowflake size={14} />
           </div>
           <div className="flex-1">
             <p className="text-xs font-semibold text-white flex items-center gap-1">Streak Shields {(premiumTier === 'basic') && <span className="bg-teal-500/20 text-teal-400 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ml-1">Pro</span>} {['sovereign', 'eternal_mind'].includes(premiumTier) && <span className="bg-amber-500/20 text-amber-400 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ml-1">Sov</span>}</p>
             <p className="text-[10px] text-neutral-500 font-medium tracking-wide">{['sovereign', 'eternal_mind'].includes(premiumTier) ? 'Unlimited' : streakFreezes > 0 ? `${streakFreezes} remaining` : 'None equipped.'}</p>
           </div>
           {(!isPremium && streakFreezes === 0) && (
              <button 
                onClick={() => setShowPaywall(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors"
              >
                Equip
              </button>
           )}
         </div>
       </motion.div>

       {/* Economy Info Drop */}
       <motion.div variants={itemVariants} className="flex gap-4 mb-6">
         <div className="flex-1 backdrop-blur-3xl bg-amber-500/5 border border-amber-500/10 p-4 rounded-[24px] flex items-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mr-3 border border-amber-500/20 shadow-inner">
               <Coins size={18} />
            </div>
            <div>
               <p className="text-xs font-bold text-white mb-0.5">{wisdomShards}</p>
               <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Shards</p>
            </div>
         </div>
       </motion.div>
       
       {empireStatus.length > 0 && (
         <motion.div variants={itemVariants} className="mb-10">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
               <Gem className="text-teal-400" size={14} /> Empire Control
            </h2>
            <div className="flex flex-wrap gap-2">
               {empireStatus.map((status, idx) => (
                  <div key={idx} className="backdrop-blur-3xl bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-[16px] text-[10px] font-bold text-teal-400 uppercase tracking-widest shadow-sm">
                     {status}
                  </div>
               ))}
            </div>
         </motion.div>
       )}

       <motion.div variants={itemVariants}>
         <EmpireStory />
       </motion.div>

       {/* Future Features (Placeholders) */}
       <motion.div variants={itemVariants} className="mb-10">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
               <Eye className="text-neutral-400" size={14} /> Future Visions
            </h2>
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white/5 border border-white/5 rounded-[20px] p-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Globe className="text-purple-400 mb-3" size={20} />
                  <h3 className="text-xs font-bold text-white mb-1">Global Archive</h3>
                  <p className="text-[9px] text-neutral-500 leading-relaxed uppercase tracking-widest font-bold">Planned Q3</p>
               </div>
               <div className="bg-white/5 border border-white/5 rounded-[20px] p-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Map className="text-blue-400 mb-3" size={20} />
                  <h3 className="text-xs font-bold text-white mb-1">Player Cities</h3>
                  <p className="text-[9px] text-neutral-500 leading-relaxed uppercase tracking-widest font-bold">In Development</p>
               </div>
               <div className="bg-white/5 border border-white/5 rounded-[20px] p-4 relative overflow-hidden group col-span-2">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center gap-3">
                     <GraduationCap className="text-amber-400" size={20} />
                     <div>
                        <h3 className="text-xs font-bold text-white mb-1">Education Partners</h3>
                        <p className="text-[9px] text-neutral-500 leading-relaxed uppercase tracking-widest font-bold">University Integration</p>
                     </div>
                  </div>
               </div>
            </div>
       </motion.div>

       {/* Tabs area for Saved and History */}
       <div className="space-y-10">

         <motion.section variants={itemVariants}>
           <div className="flex items-center gap-2 mb-5">
             <Users className="text-neutral-500" size={14} />
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Community & Allies</h2>
           </div>
           
           <div className="backdrop-blur-3xl bg-black/40 border border-white/5 rounded-[24px] p-5 shadow-sm mb-4">
             <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                <span className="text-sm font-semibold text-white">Refer a Scholar</span>
                <button 
                  onClick={() => {
                    useStore.getState().addReferral(); // simulate referral
                    if (navigator.share) {
                      navigator.share({ title: 'Bilgi İmparatorluğu', text: 'Master any topic and build your knowledge streak!', url: 'https://bilgi-imparatorlugu.app' });
                    }
                  }}
                  className="bg-white/10 border border-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Share2 size={12} /> Invite
                </button>
             </div>
             <p className="text-xs text-neutral-400 font-medium leading-relaxed mb-3">Invite an ally to grant them 7 days of Pro, and receive <strong className="text-amber-400">500 Coins + 1 Shield</strong> when they reach Level 2.</p>
             <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Successful Invites <span className="text-white ml-2">{useStore.getState().referralCount}</span></p>
           </div>
           
           <div className="flex flex-col gap-3">
             {friends.map(friend => (
               <div key={friend.id} className="backdrop-blur-3xl bg-black/20 border border-white/5 p-4 rounded-[20px] flex items-center shadow-sm">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.avatar}`} className="w-10 h-10 grayscale rounded-full border border-white/10 mr-4" />
                 <div className="flex-1">
                   <h3 className="font-semibold text-neutral-200 text-sm">{friend.name}</h3>
                   <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">Lvl {Math.floor(friend.xp / 1000) + 1}</p>
                 </div>
                 <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                       🔥 {friend.streak}
                    </div>
                 </div>
               </div>
             ))}
           </div>
         </motion.section>

         <motion.section variants={itemVariants}>
           <KnowledgeTree />
         </motion.section>

         <motion.section variants={itemVariants}>
           <div className="flex items-center gap-2 mb-4">
             <Bookmark className="text-neutral-500" size={14} />
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Saved Exhibits ({savedArticles.length})</h2>
           </div>
           {savedArticles.length === 0 ? (
             <div className="backdrop-blur-3xl bg-black/20 border border-white/5 p-6 rounded-[24px] text-center text-neutral-600 shadow-sm text-xs uppercase tracking-widest font-bold">
                Empty Archives
             </div>
           ) : (
             <div className="flex flex-col gap-3">
               {savedArticles.map(article => (
                 <a href={article.url} target="_blank" rel="noreferrer" key={article.id} className="backdrop-blur-3xl bg-black/40 border border-white/5 p-4 rounded-[20px] flex items-center justify-between hover:bg-black/60 transition-colors shadow-sm group">
                   <div className="flex-1 pr-4">
                     <h3 className="font-medium text-neutral-200 line-clamp-1 group-hover:text-teal-400 transition-colors text-sm">{article.title}</h3>
                     <p className="text-[9px] text-neutral-500 mt-1 uppercase tracking-widest font-bold">{article.category || 'General'}</p>
                   </div>
                   <ExternalLink size={14} className="text-neutral-600 group-hover:text-teal-400 transition-colors" />
                 </a>
               ))}
             </div>
           )}
         </motion.section>

         <motion.section variants={itemVariants}>
           <div className="flex items-center gap-2 mb-4">
             <History className="text-neutral-500" size={14} />
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Chronicle of Visits</h2>
           </div>
           {readingHistory.length === 0 ? (
             <div className="backdrop-blur-3xl bg-black/20 border border-white/5 p-6 rounded-[24px] text-center text-neutral-600 shadow-sm text-xs uppercase tracking-widest font-bold">
                No past visits.
             </div>
           ) : (
             <div className="flex flex-col gap-3">
               {readingHistory.slice(0, 5).map(item => (
                 <div key={`${item.id}-${item.date}`} className="backdrop-blur-3xl bg-black/20 border border-white/5 p-4 rounded-[20px] flex items-center justify-between shadow-sm">
                   <div className="flex-1">
                     <h3 className="font-medium text-neutral-300 line-clamp-1 text-sm">{item.title}</h3>
                     <p className="text-[9px] text-neutral-600 mt-1 uppercase tracking-widest font-bold">{formatDistanceToNow(parseISO(item.date))} ago</p>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </motion.section>
         
         <motion.section variants={itemVariants}>
           <div className="flex items-center justify-between p-4 bg-teal-500/5 border border-teal-500/20 rounded-[20px] mb-8">
              <span className="text-[9px] uppercase tracking-widest font-bold text-teal-500">Install App</span>
              <button 
                onClick={() => alert("Tap Share -> Add to Home Screen")} 
                className="text-[9px] uppercase tracking-widest font-bold text-black bg-teal-400 px-3 py-1.5 rounded-full"
              >
                Install
              </button>
           </div>
         </motion.section>
         
         <motion.section variants={itemVariants}>
           <div className="flex items-center gap-2 mb-4">
             <Settings className="text-neutral-600" size={14} />
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">Preferences</h2>
           </div>
           <div className="backdrop-blur-3xl bg-black/40 border border-white/5 rounded-[24px] shadow-sm overflow-hidden mb-12">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-neutral-400 text-[11px] uppercase tracking-widest font-bold"><ShieldCheck size={14} className="text-neutral-600" /> Privacy & Data</div>
              </div>
              <div className="p-4 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors" onClick={() => {
                 if (Notification.permission === 'default') {
                   Notification.requestPermission().then(p => {
                     if (p === 'granted') alert("Notifications enabled for daily streaks!");
                   });
                 } else {
                   alert(`Notification status: ${Notification.permission}`);
                 }
              }}>
                <div className="flex items-center gap-3 text-neutral-400 text-[11px] uppercase tracking-widest font-bold">
                  <div className="relative">
                    <Sparkles size={14} className="text-neutral-600" />
                  </div>
                  Daily Reminders
                </div>
                <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${Notification.permission === 'granted' ? 'bg-teal-500' : 'bg-neutral-800'}`}>
                   <div className={`w-4 h-4 rounded-full bg-white transition-transform ${Notification.permission === 'granted' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </div>
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors" 
                onClick={() => {
                  useStore.getState().setInteractiveTourActive(true);
                  useStore.setState({ interactiveTourStep: 0 });
                  window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'home' }));
                }}
              >
                <div className="flex items-center gap-3 text-neutral-400 text-[11px] uppercase tracking-widest font-bold">
                  <Eye size={14} className="text-neutral-600" />
                  Replay Interactive Tour
                </div>
                <ExternalLink size={14} className="text-neutral-600" />
              </div>
              <div className="p-4 flex items-center justify-between border-t border-white/5 cursor-pointer hover:bg-red-500/10 transition-colors"
                onClick={async () => {
                  try {
                    const { logOut } = await import('../firebase');
                    await logOut();
                    useStore.setState({ hasCompletedOnboarding: false });
                    localStorage.removeItem('wikiburst-storage');
                    window.location.reload();
                  } catch (e) {
                    console.error("Logout failed", e);
                  }
                }}
              >
                <div className="flex items-center gap-3 text-red-500/80 text-[11px] uppercase tracking-widest font-bold">
                  Sistemi Sıfırla ve Çıkış Yap
                </div>
              </div>
              <div className="p-4 flex items-center justify-between bg-black/20 border-t border-white/5">
                <div className="flex items-center gap-3 text-neutral-700 text-[9px] font-black tracking-widest uppercase">Bilgi İmparatorluğu v3.0 (Master)</div>
              </div>
           </div>
         </motion.section>
       </div>
    </motion.div>
  );
}

