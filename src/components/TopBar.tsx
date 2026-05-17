import React, { useState } from 'react';
import { Search, Globe, Flame, Settings, X, Vibrate, Check, Bell } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { haptic } from '../lib/haptics';
import { SearchModal } from './SearchModal';

export function TopBar() {
  const { streak, level, xp, language, setLanguage, hapticsEnabled, toggleHaptics, notifications, markNotificationsRead } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'tr', name: 'Türkçe' }
  ];

  const handleGlobeClick = () => {
    haptic.medium();
    setShowSettings(true);
  };

  const handleSearchClick = () => {
    haptic.medium();
    setShowSearch(true);
  };

  return (
    <>
    <div className="absolute top-0 left-0 w-full z-40 p-4 flex justify-between items-start pointer-events-none">
      <div className="flex flex-col items-start gap-3">
        <div className="pointer-events-auto flex items-center gap-2 backdrop-blur-2xl bg-black/40 px-4 py-2 rounded-full shadow-sm">
          <Flame size={16} className="text-teal-400" />
          <span className="font-semibold text-white tracking-wide text-sm">{streak}</span>
        </div>
        
        <div className="pointer-events-auto flex items-center gap-2 backdrop-blur-2xl bg-black/40 px-4 py-2 rounded-full shadow-sm">
          <div className="w-5 h-5 bg-teal-400/20 rounded-full flex items-center justify-center text-[11px] font-bold text-teal-400">
            {level}
          </div>
          <div className="flex-1 w-20 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-teal-400 rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${(xp % 1000) / 10}%` }}
              transition={{ duration: 0.5, type: 'spring' }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pointer-events-auto">
        <button 
          onClick={handleSearchClick}
          className="w-10 h-10 flex items-center justify-center backdrop-blur-2xl bg-black/40 rounded-full text-neutral-400 hover:text-white transition-colors active:scale-95"
        >
          <Search size={18} />
        </button>
        <button 
          onClick={() => { setShowNotifications(true); markNotificationsRead(); }}
          className="w-10 h-10 relative flex items-center justify-center backdrop-blur-2xl bg-black/40 rounded-full text-neutral-400 hover:text-white transition-colors active:scale-95"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
             <span className="absolute top-0 right-0 w-3 h-3 bg-fuchsia-500 rounded-full border-2 border-[#0a0a0c]"></span>
          )}
        </button>
        <button 
          onClick={handleGlobeClick}
          className="w-10 h-10 flex items-center justify-center backdrop-blur-2xl bg-black/40 rounded-full text-neutral-400 hover:text-white transition-colors active:scale-95"
        >
          <Settings size={18} />
        </button>
      </div>
    </div>

    <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />

    <AnimatePresence>
      {showNotifications && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 w-80 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden pointer-events-auto"
        >
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h3 className="text-white font-bold tracking-tight">Notifications</h3>
             <button onClick={() => setShowNotifications(false)} className="text-neutral-500 hover:text-white">
                <X size={16} />
             </button>
          </div>
          <div className="flex flex-col max-h-96 overflow-y-auto">
             {notifications?.map(n => (
                <div key={n.id} className={`p-4 border-b border-white/5 ${!n.read ? 'bg-fuchsia-500/5' : ''}`}>
                   <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'season' ? 'bg-amber-500/20 text-amber-500' : 'bg-teal-500/20 text-teal-500'}`}>
                         <Bell size={14} />
                      </div>
                      <div>
                         <h4 className={`text-sm font-bold text-white mb-0.5 ${!n.read ? "drop-shadow-sm" : ""}`}>{n.title}</h4>
                         <p className="text-xs text-neutral-400 leading-snug">{n.message}</p>
                         <p className="text-[9px] text-neutral-600 mt-2 font-bold uppercase tracking-wider">{new Date(n.date).toLocaleDateString()}</p>
                      </div>
                   </div>
                </div>
             ))}
             {(!notifications || notifications.length === 0) && (
                <div className="p-8 text-center text-neutral-500 text-sm">No new notifications.</div>
             )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showSettings && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm px-4 pb-8 sm:p-0"
        >
           <motion.div 
              initial={{ y: "100%", scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-sm backdrop-blur-3xl bg-neutral-900/80 rounded-[40px] border border-white/10 shadow-[0_24px_40px_rgba(0,0,0,0.5)] p-6 relative"
           >
              <button 
                onClick={() => { haptic.light(); setShowSettings(false); }}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all active:scale-90"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-bold mb-8 mt-2 flex items-center gap-2 text-white">
                <Settings size={20} className="text-teal-400" />
                Settings
              </h3>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-4 block">Language</label>
                  <div className="flex flex-col gap-3">
                    {languages.map(l => (
                      <button 
                        key={l.code}
                        onClick={() => { 
                          haptic.medium(); 
                          setLanguage(l.code);
                        }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98]",
                          language === l.code ? "bg-teal-500/10 text-teal-400" : "bg-white/5 text-neutral-300"
                        )}
                      >
                        <span className="font-semibold text-sm">{l.name}</span>
                        {language === l.code && <Check size={18} className="text-teal-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-4 block">Preferences</label>
                  <button 
                    onClick={() => {
                      haptic.light();
                      toggleHaptics();
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <Vibrate size={18} className={hapticsEnabled ? "text-teal-400" : "text-neutral-500"} />
                      <span className="font-semibold text-sm text-neutral-200">Haptic Feedback</span>
                    </div>
                    <div className={cn("w-10 h-5 rounded-full p-1 transition-colors", hapticsEnabled ? "bg-teal-500/80" : "bg-neutral-800")}>
                      <motion.div 
                        animate={{ x: hapticsEnabled ? 20 : 0 }}
                        className="w-3 h-3 bg-white rounded-full shadow-sm"
                      />
                    </div>
                  </button>
                </div>
              </div>
           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
