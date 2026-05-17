import React from 'react';
import { Home, Map as MapIcon, Trophy, User, Bookmark } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { haptic } from '../lib/haptics';

interface BottomNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export function BottomNav({ currentTab, setTab }: BottomNavProps) {
  const { companionMood } = useStore();

  const getCompanionEmoji = () => {
    switch (companionMood) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'sad': return '🥺';
      default: return '🙂';
    }
  };

  return (
    <div className="absolute bottom-0 w-full z-40 bg-transparent pt-4 pb-8 px-6 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between max-w-sm md:max-w-xl mx-auto relative backdrop-blur-2xl bg-black/60 rounded-[32px] px-8 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        <NavItem id="home" icon={<Home size={22} />} label="Read" currentTab={currentTab} onClick={() => setTab('home')} />
        <NavItem id="empire" icon={<MapIcon size={22} />} label="Map" currentTab={currentTab} onClick={() => setTab('empire')} className="tour-map-tab" />
        
        {/* Center Companion/Progress Hub */}
        <div className="relative -mt-6 z-50">
           <button 
             onClick={() => { typeof haptic !== 'undefined' && haptic.light(); setTab('progress'); }}
             className={cn(
               "w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-transform active:scale-95 shadow-lg bg-teal-500/10 text-teal-400 p-0.5",
             )}
           >
             <div className="w-full h-full rounded-full bg-neutral-900/90 flex items-center justify-center overflow-hidden backdrop-blur-xl">
               {getCompanionEmoji()}
             </div>
           </button>
        </div>

        <NavItem id="progress" icon={<Trophy size={22} />} label="Progress" currentTab={currentTab} onClick={() => setTab('progress')} />
        <NavItem id="profile" icon={<User size={22} />} label="Profile" currentTab={currentTab} onClick={() => setTab('profile')} />
      </div>
    </div>
  );
}

function NavItem({ id, icon, label, currentTab, onClick, className }: { id: string, icon: React.ReactNode, label: string, currentTab: string, onClick: () => void, className?: string }) {
  const active = currentTab === id;
  return (
    <button 
      onClick={() => { haptic.light(); onClick(); }}
      className={cn(
        "flex flex-col items-center gap-1 transition-all active:scale-90 w-12",
        active ? "text-teal-400" : "text-neutral-500 hover:text-neutral-300",
        className
      )}
    >
      {icon}
      <span className={cn("text-[9px] uppercase tracking-wider font-bold", active ? "opacity-100" : "opacity-0 hidden md:block md:opacity-50")}>{label}</span>
    </button>
  );
}
