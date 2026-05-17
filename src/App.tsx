import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { Feed } from './components/Feed';
import { BurstTimer } from './components/BurstTimer';
import { Onboarding } from './components/Onboarding';
import { MapTab } from './components/MapTab';
import { ProgressTab } from './components/ProgressTab';
import { ProfileTab } from './components/ProfileTab';
import { Paywall } from './components/Paywall';
import { ReturnWelcomeDialog } from './components/ReturnWelcomeDialog';
import { InteractiveTour } from './components/InteractiveTour';
import { useStore } from './store/useStore';
import { Compass, User } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { auth } from './firebase';
import { syncUserProfile, subscribeToLibraries } from './services/db';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const { checkStreak, hasCompletedOnboarding, addTimeSpent, burstActive, showPaywall, setShowPaywall, showReturnWelcome, focusMode } = useStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthReady(true);
      if (user) {
        syncUserProfile().catch(console.warn);
        try {
          subscribeToLibraries();
        } catch(e) {
          console.warn(e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check daily streak on mount
    checkStreak();

    // Setup basic service worker for notifications if available
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // In a real app we'd register a sw.js here
    }
  }, [checkStreak]);

  // Track global time spent when user is active
  useEffect(() => {
    const handleNavigation = (e: any) => {
       setCurrentTab(e.detail);
    };
    window.addEventListener('app-navigate', handleNavigation);
    return () => window.removeEventListener('app-navigate', handleNavigation);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      // Only record time if document is visible
      if (!document.hidden) {
        addTimeSpent(1); // add 1 second
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [addTimeSpent]);

  return (
    <div className="relative w-full h-full bg-[#0A0A0A] text-white overflow-hidden sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto selection:bg-teal-500/30">
      {/* Ultra-minimal Background - No vibrant blobs, just deep space */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 to-[#0A0A0A] pointer-events-none"></div>

      {!hasCompletedOnboarding && <Onboarding />}
      <InteractiveTour currentTab={currentTab} />

      {!focusMode && currentTab === 'home' && <TopBar />}
      
      {!focusMode && currentTab !== 'home' && (
         <button onClick={() => setCurrentTab('home')} className="absolute top-6 left-6 z-40 bg-black/40 backdrop-blur-md w-12 h-12 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/10 transition-colors shadow-lg active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m15 18-6-6 6-6"/></svg>
         </button>
      )}
      
      <main className={cn("w-full h-full relative z-0", focusMode ? "pb-0" : "pb-20")}>
        {currentTab === 'home' && <Feed />}
        {currentTab === 'empire' && <MapTab />}
        {currentTab === 'progress' && <ProgressTab />}
        {currentTab === 'profile' && <ProfileTab />}
      </main>

      {currentTab === 'home' && <BurstTimer />}
      {!focusMode && <BottomNav currentTab={currentTab} setTab={setCurrentTab} />}
      
      <AnimatePresence>
        {showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}
        {hasCompletedOnboarding && showReturnWelcome && <ReturnWelcomeDialog />}
      </AnimatePresence>
    </div>
  );
}

function PlaceholderTab({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center text-white/40 gap-4 pt-20 relative z-10">
      <div className="p-6 bg-white/5 border border-white/10 rounded-full shadow-2xl backdrop-blur-xl">{icon}</div>
      <h2 className="text-2xl font-bold text-white mt-2">{title}</h2>
      <p className="text-sm">{desc}</p>
      <div className="mt-8 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-xs uppercase tracking-widest font-bold text-white/50 backdrop-blur-md">Coming Soon</div>
    </div>
  );
}

