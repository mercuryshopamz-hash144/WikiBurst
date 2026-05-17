import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Trophy, Clock, Brain, Flame, Target, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { ProgressShareDialog } from './ProgressShareDialog';

export function ProgressTab() {
  const { xp, level, streak, readArticleIds, savedArticles, timeSpent, companionMood, topicWeights, readingHistory } = useStore();
  const [showShare, setShowShare] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const handleGenerateReport = async () => {
    if (aiReport) return;
    setIsGeneratingReport(true);
    
    setTimeout(() => {
      const titles = readingHistory.slice(0, 3).map(h => h.title);
      let reportStr = '';
      if (titles.length === 0) reportStr = "You're at the beginning of your journey. Ready to start exploring?";
      else reportStr = `This week, you expanded your worldview by exploring ${titles.join(', ')} and more! Your mind is becoming a vast library of interconnected concepts. Keep nurturing that curiosity!`;
      
      setAiReport(reportStr);
      setIsGeneratingReport(false);
    }, 1500);
  };

  const getCompanionExpression = () => {
    switch (companionMood) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'sad': return '🥺';
      default: 
        const name = useStore.getState().companionName;
        if (name === 'Einstein') return '👨‍🔬';
        if (name === 'Da Vinci') return '🎨';
        if (name === 'Cleopatra') return '👑';
        if (name === 'Socrates') return '🏛️';
        if (name === 'Oppenheimer') return '⚛️';
        return '✨';
    }
  };

  const getCompanionMessage = () => {
    switch (companionMood) {
      case 'happy': return "You're doing great! Keep building that knowledge.";
      case 'excited': return "Amazing progress! Your brain is growing!";
      case 'sad': return "I miss our learning sessions. Let's read something!";
      default: return "Ready to discover something new today?";
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto px-6 pt-24 pb-32 custom-scrollbar relative z-10">
       <h1 className="text-[28px] font-bold mb-8 text-white tracking-tight pt-4">Progress.</h1>
       
       {/* Interactive Companion Banner */}
       <div className="backdrop-blur-3xl bg-black/40 rounded-[32px] p-6 mb-8 relative flex items-center gap-5 overflow-hidden border border-white/5 shadow-2xl">
         <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full pointer-events-none"></div>
         <motion.div 
           animate={companionMood === 'excited' ? { y: [0, -10, 0] } : {}}
           transition={{ repeat: Infinity, duration: 2 }}
           className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-teal-500/20 z-10 shrink-0"
         >
           {getCompanionExpression()}
         </motion.div>
         <div className="z-10 flex-1">
           <div className="flex items-center justify-between mb-1.5">
             <h3 className="font-semibold text-white text-sm tracking-wide">{useStore.getState().companionName}</h3>
             <button 
               onClick={() => {
                 const newName = prompt("Name your companion:", useStore.getState().companionName);
                 if (newName && newName.trim()) {
                   useStore.getState().setCompanionName(newName.trim());
                 }
               }}
               className="text-[10px] text-teal-400 uppercase tracking-widest font-bold"
             >
               Rename
             </button>
           </div>
           <p className="text-xs text-neutral-400 leading-relaxed font-medium">"{getCompanionMessage()}"</p>
         </div>
       </div>

       <div className="grid grid-cols-2 gap-3 mb-10">
          <StatCard icon={<Target size={16} />} title="Level" value={level.toString()} subtitle={`${xp} XP Total`} color="teal" />
          <StatCard icon={<Flame size={16} />} title="Streak" value={`${streak}d`} subtitle="Keep it up!" color="teal" />
          <StatCard icon={<Brain size={16} />} title="Read" value={readArticleIds.length.toString()} subtitle="Full articles" color="teal" />
          <StatCard icon={<Clock size={16} />} title="Focus" value={`${Math.floor(timeSpent / 60)}m`} subtitle="Total time" color="teal" />
       </div>

       {Object.keys(topicWeights).length > 0 && (
         <div className="mb-10">
           <div className="flex items-center justify-between mb-5">
             <h2 className="text-lg font-bold flex items-center gap-2 text-white">Your Brain</h2>
             <button onClick={() => setShowShare(true)} className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
               Weekly Report <ChevronRight size={14} />
             </button>
           </div>
           <div className="backdrop-blur-3xl bg-black/40 border border-white/5 rounded-[32px] p-6 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-3xl rounded-full pointer-events-none -mr-20 -mt-20"></div>
             
             <div className="h-48 w-full relative z-10 mb-4 -mx-4">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={Object.entries(topicWeights).map(([subject, A]) => ({ subject, A })).slice(0, 6)}>
                   <PolarGrid gridType="polygon" stroke="rgba(255,255,255,0.05)" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600 }} />
                   <Radar name="Knowledge" dataKey="A" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.2} />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
             
             <div className="relative z-10 space-y-1">
               <p className="text-sm text-neutral-300 font-medium mb-4">This week you discovered <strong>{readArticleIds.length}</strong> new concepts.</p>
               
               <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                 {aiReport ? (
                   <div>
                     <h4 className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Brain size={10} /> AI Insight</h4>
                     <p className="text-xs text-neutral-300 leading-relaxed italic">"{aiReport}"</p>
                   </div>
                 ) : (
                   <button 
                     onClick={handleGenerateReport}
                     className="w-full text-xs font-semibold bg-teal-500/10 text-teal-400 py-3 rounded-xl hover:bg-teal-500/20 transition-colors flex items-center justify-center gap-2"
                   >
                     {isGeneratingReport ? <span className="animate-pulse">Analyzing...</span> : "Generate AI Insight"}
                   </button>
                 )}
               </div>
             </div>
           </div>
         </div>
       )}

       <div className="mb-10">
         <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white"><Target className="text-teal-400" size={20}/> Daily Challenge</h2>
         <div className="backdrop-blur-3xl bg-black/40 border border-white/5 p-5 rounded-[24px] shadow-sm flex items-center justify-between">
           <div>
             <h3 className="font-semibold text-white text-sm mb-1">Explorer's Vow</h3>
             <p className="text-xs text-neutral-500 font-medium">Discover 3 new concepts today</p>
           </div>
           <div className="flex flex-col items-end gap-2">
             <span className="text-xs font-bold text-teal-400">{Math.min(readingHistory.filter(h => new Date(h.date).toDateString() === new Date().toDateString()).length, 3)} / 3</span>
             <div className="w-20 h-1.5 bg-black/60 rounded-full overflow-hidden shadow-inner">
               <div className="h-full bg-teal-400 transition-all" style={{ width: `${Math.min((readingHistory.filter(h => new Date(h.date).toDateString() === new Date().toDateString()).length / 3) * 100, 100)}%` }}></div>
             </div>
           </div>
         </div>
       </div>

       <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white"><Trophy className="text-teal-400" size={20}/> Achievements</h2>
       <div className="space-y-3">
          <AchievementCard 
             title="First Burst" 
             desc="Completed your first reading burst" 
             progress={readArticleIds.length > 0 ? 100 : 0} 
             unlocked={readArticleIds.length > 0} 
          />
          <AchievementCard 
             title="Curious Mind" 
             desc="Read 10 articles completely" 
             progress={Math.min(100, (readArticleIds.length / 10) * 100)} 
             unlocked={readArticleIds.length >= 10} 
          />
          <AchievementCard 
             title="Scholar" 
             desc="Reach level 5" 
             progress={Math.min(100, (level / 5) * 100)} 
             unlocked={level >= 5} 
          />
          <AchievementCard 
             title="Focus Master" 
             desc="Spend 60 minutes learning" 
             progress={Math.min(100, (timeSpent / 3600) * 100)} 
             unlocked={timeSpent >= 3600} 
          />
       </div>

       <AnimatePresence>
         {showShare && <ProgressShareDialog onClose={() => setShowShare(false)} />}
       </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon }: { title: string, value: string, subtitle: string, color?: string, icon: React.ReactNode }) {
  return (
    <div className={`backdrop-blur-3xl bg-black/40 p-5 rounded-[24px] relative overflow-hidden shadow-sm border border-white/5`}>
      <div className="relative z-10">
        <div className={`text-[10px] font-bold tracking-widest uppercase mb-3 flex items-center gap-1.5 text-teal-400`}>
          {icon} {title}
        </div>
        <div className="text-[28px] font-bold mb-1 text-white tracking-tight">{value}</div>
        <div className="text-[11px] text-neutral-500 font-medium">{subtitle}</div>
      </div>
    </div>
  );
}

function AchievementCard({ title, desc, unlocked, progress }: { title: string, desc: string, unlocked: boolean, progress: number }) {
  return (
    <div className={`p-5 rounded-[24px] flex items-center gap-4 transition-all shadow-sm backdrop-blur-3xl relative overflow-hidden ${unlocked ? 'bg-black/60 border border-white/5' : 'bg-black/20 border border-transparent opacity-50'}`}>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-xl shrink-0 ${unlocked ? 'bg-teal-500/10 text-teal-400' : 'bg-white/5 text-neutral-600'}`}>
           {unlocked ? '🏆' : '🔒'}
        </div>
      </div>
      <div className="flex-1 relative z-10">
        <div className="flex justify-between items-center mb-1">
           <div className={`text-sm font-bold ${unlocked ? 'text-white' : 'text-neutral-400'}`}>{title}</div>
           {!unlocked && <div className="text-[10px] font-bold text-neutral-600">{Math.round(progress)}%</div>}
        </div>
        <div className="text-xs text-neutral-500 font-medium">{desc}</div>
        {!unlocked && (
          <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden mb-1">
             <div className="h-full bg-neutral-600" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
