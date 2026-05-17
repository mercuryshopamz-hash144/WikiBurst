import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WikiArticle } from '../lib/wikipedia';
import { isToday, isYesterday, formatISO, parseISO } from 'date-fns';

export interface AnalyticsEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface Friend {
  id: string;
  name: string;
  streak: number;
  avatar: string;
  xp: number;
}

export interface ReadingHistoryItem {
  id: number;
  title: string;
  category?: string;
  date: string;
}

export interface ExhibitComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  date: string;
  type?: string;
}

export interface LibraryArticle {
  article: WikiArticle;
  roomId: string; // e.g. "History Wing"
  note?: string;
  likes: number;
  inspiredCount?: number;
  comments: ExhibitComment[];
}

export interface Library {
  id: string;
  ownerId: string;
  coOwners: string[];
  name: string;
  theme: string;
  lat: number;
  lng: number;
  coatOfArms: string;
  isPublic: boolean;
  articles: LibraryArticle[];
  conqueredCount: number;
  sponsor?: string;
  cityId?: string;
  guestbook?: ExhibitComment[];
}

export interface AppSeason {
  id: string;
  name: string;
  theme: string;
  description: string;
  endsAt: string;
}

export interface AppEvent {
  id: string;
  name: string;
  type: 'tournament' | 'dominion' | 'world_project';
  description: string;
  progress?: number;
  goal?: number;
  endsAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'conquest' | 'season' | 'general' | 'event';
}

interface State {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  readArticleIds: number[];
  savedArticles: WikiArticle[];
  userName: string;
  companionName: string;
  companionMood: 'happy' | 'neutral' | 'sad' | 'excited';
  burstMinutes: number;
  burstActive: boolean;
  burstTimeRemaining: number;
  burstModeActive: boolean;
  
  // Personalization
  hasCompletedOnboarding: boolean;
  interactiveTourActive: boolean;
  interactiveTourStep: number;
  interests: string[];
  topicWeights: Record<string, number>;
  readingHistory: ReadingHistoryItem[];
  searchHistory: string[];
  timeSpent: number; // in seconds
  language: string; // 'en', 'tr', 'es'
  hapticsEnabled: boolean;
  showReturnWelcome: boolean;
  focusMode: boolean;
  
  // Economy & Social
  wisdomShards: number;
  prestigePoints: number;
  activeBuffs: string[];
  unlockedCosmetics: string[];
  referralCount: number;
  remixes: { articleId: number, note: string }[];
  
  // Library System
  libraries: Library[];
  
  // New Freemium & Communities features
  isPremium: boolean;
  premiumTier: 'none' | 'basic' | 'club' | 'sovereign' | 'eternal_mind';
  showPaywall: boolean;
  burstsToday: number;
  lastBurstDate: string | null;
  streakFreezes: number;
  analyticsEvents: AnalyticsEvent[];
  friends: Friend[];
  
  // Events & Notifications
  currentSeason: AppSeason;
  activeEvents: AppEvent[];
  notifications: AppNotification[];
  markNotificationsRead: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'read' | 'date'>) => void;
  
  // Actions
  setUserName: (name: string) => void;
  setShowPaywall: (show: boolean) => void;
  setCompanionName: (name: string) => void;
  upgradePremium: () => void;
  incrementBurst: () => boolean; // returns false if max bursts reached
  trackEvent: (type: string, data?: any) => void;
  useStreakFreeze: () => boolean;
  addFriend: (friend: Friend) => void;
  
  // Actions
  addXp: (amount: number) => void;
  checkStreak: () => void;
  markArticleRead: (article: WikiArticle) => void;
  saveArticle: (article: WikiArticle) => void;
  removeSavedArticle: (id: number) => void;
  setBurstMinutes: (minutes: number) => void;
  startBurst: () => void;
  endBurst: () => void;
  tickBurst: () => void;
  setCompanionMood: (mood: 'happy' | 'neutral' | 'sad' | 'excited') => void;
  completeOnboarding: (interests: string[]) => void;
  setInteractiveTourActive: (active: boolean) => void;
  advanceInteractiveTour: () => void;
  completeInteractiveTour: () => void;
  recordInteraction: (category: string, scoreDelta: number) => void;
  addTimeSpent: (seconds: number) => void;
  setLanguage: (lang: string) => void;
  toggleHaptics: () => void;
  setShowReturnWelcome: (show: boolean) => void;
  setFocusMode: (focus: boolean) => void;
  
  // Economy & Social Actions
  addWisdomShards: (amount: number) => void;
  addPrestigePoints: (amount: number) => void;
  spendWisdomShards: (amount: number) => boolean;
  spendPrestigePoints: (amount: number) => boolean;
  unlockCosmetic: (id: string, costShards: number, costPrestige: number) => boolean;
  activateBuff: (id: string, costShards: number) => boolean;
  addReferral: () => void;
  addRemix: (articleId: number, note: string) => void;
  setPremiumTier: (tier: 'none' | 'basic' | 'club' | 'sovereign' | 'eternal_mind') => void;
  
  // Search and Library
  addSearchQuery: (query: string) => void;
  createLibrary: (library: Omit<Library, 'id' | 'conqueredCount'> & { articles?: LibraryArticle[] }) => void;
  addArticleToLibrary: (libraryId: string, article: WikiArticle, roomId: string, note?: string) => void;
  conquerLibrarySection: (libraryId: string, roomId: string) => void;
}

const XP_PER_LEVEL = 1000;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      readArticleIds: [],
      savedArticles: [],
      userName: '',
      companionName: 'Aura',
      companionMood: 'neutral',
      burstMinutes: 15,
      burstActive: false,
      burstTimeRemaining: 0,
      burstModeActive: false,
      
      hasCompletedOnboarding: false,
      interactiveTourActive: false,
      interactiveTourStep: 0,
      interests: [],
      topicWeights: {},
      readingHistory: [],
      searchHistory: [],
      timeSpent: 0,
      language: 'en',
      hapticsEnabled: true,
      showReturnWelcome: false,
      focusMode: false,
      
      wisdomShards: 0,
      prestigePoints: 0,
      activeBuffs: [],
      unlockedCosmetics: [],
      referralCount: 0,
      remixes: [],
      libraries: [],

      isPremium: false,
      premiumTier: 'none',
      showPaywall: false,
      burstsToday: 0,
      lastBurstDate: null,
      streakFreezes: 0,
      analyticsEvents: [],
      friends: [
         { id: '1', name: 'Alex H.', streak: 5, xp: 4500, avatar: '1' },
         { id: '2', name: 'Sarah K.', streak: 12, xp: 12400, avatar: '2' }
      ],

      currentSeason: {
        id: 's4_renaissance',
        name: 'Renaissance Season',
        theme: 'Art & History',
        description: 'Bonus Shards for Art and History city libraries.',
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
      },
      activeEvents: [
        {
          id: 'evt_olympiad',
          name: 'Knowledge Olympiad',
          type: 'tournament',
          description: 'Global quiz tournament. Earn Points to climb the ladder!',
          progress: 1200,
          goal: 5000,
          endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
        },
        {
          id: 'evt_alexandria',
          name: 'Rebuilding Alexandria',
          type: 'world_project',
          description: 'Collaborative World Project: Donate Shards to unlock the Great Library for everyone.',
          progress: 450000,
          goal: 1000000,
          endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString()
        }
      ],
      notifications: [
        {
          id: 'n1',
          title: 'Season Started!',
          message: 'Renaissance Season has begun. Explore art and history!',
          date: new Date().toISOString(),
          read: false,
          type: 'season'
        }
      ],

      markNotificationsRead: () => set((state) => ({ notifications: state.notifications.map(n => ({...n, read: true})) })),
      addNotification: (notif) => set((state) => ({ 
        notifications: [{ id: Date.now().toString(), date: new Date().toISOString(), read: false, ...notif }, ...state.notifications] 
      })),

      setUserName: (name: string) => set({ userName: name }),
      setShowPaywall: (show) => set({ showPaywall: show }),
      
      setCompanionName: (name: string) => set({ companionName: name }),

      upgradePremium: () => set((state) => ({  
        isPremium: true, 
        streakFreezes: state.streakFreezes + 2,
        xp: state.xp + 500 // Bonus XP
      })),

      incrementBurst: () => {
        let success = true;
        set((state) => {
           const today = formatISO(new Date(), { representation: 'date' });
           let bursts = state.burstsToday;
           if (state.lastBurstDate !== today) {
              bursts = 0; // Reset
           }
           
           if (!state.isPremium && bursts >= 3) {
             success = false;
             return { lastBurstDate: today };
           }
           
           return { burstsToday: bursts + 1, lastBurstDate: today };
        });
        return success;
      },

      trackEvent: (type, data = {}) => set((state) => ({
        analyticsEvents: [{
          type,
          data,
          timestamp: new Date().toISOString()
        }, ...state.analyticsEvents].slice(0, 1000) // Keep last 1000
      })),

      useStreakFreeze: () => {
        let used = false;
        set((state) => {
           if (state.streakFreezes > 0) {
              used = true;
              return { streakFreezes: state.streakFreezes - 1 };
           }
           return {};
        });
        return used;
      },

      addFriend: (friend) => set((state) => ({
         friends: [...state.friends, friend]
      })),

      addXp: (amount) => set((state) => {
        const newXp = state.xp + amount;
        const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
        const mood = newLevel > state.level ? 'excited' : 'happy';
        return { xp: newXp, level: newLevel, companionMood: mood };
      }),

      checkStreak: () => set((state) => {
        const today = formatISO(new Date(), { representation: 'date' });
        if (!state.lastActiveDate) {
          return { streak: 1, lastActiveDate: today };
        }
        
        const lastDate = parseISO(state.lastActiveDate);
        if (isToday(lastDate)) {
          return {}; // Already active today
        } else if (isYesterday(lastDate)) {
          return { streak: state.streak + 1, lastActiveDate: today, companionMood: 'excited' };
        } else {
          // Streak broken
          // Check if it's been a while to give dopamine calibration "welcome back" bonus
          const daysSinceLastActive = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastActive >= 1) {
             // Dopamine hit: Give them 200 XP for returning
             const newXp = state.xp + (daysSinceLastActive >= 7 ? 500 : 200);
             const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
             return { streak: 1, lastActiveDate: today, companionMood: 'happy', xp: newXp, level: newLevel, showReturnWelcome: true };
          }
          
          return { streak: 1, lastActiveDate: today, companionMood: 'sad', showReturnWelcome: true };
        }
      }),

      markArticleRead: (article) => set((state) => {
        if (state.readArticleIds.includes(article.id)) return {};
        const historyItem: ReadingHistoryItem = {
          id: article.id,
          title: article.title,
          category: article.category,
          date: new Date().toISOString()
        };
        return { 
          readArticleIds: [...state.readArticleIds, article.id],
          readingHistory: [historyItem, ...state.readingHistory].slice(0, 100) // Keep last 100
        };
      }),

      saveArticle: (article) => set((state) => {
        if (state.savedArticles.some(a => a.id === article.id)) return {};
        return { savedArticles: [...state.savedArticles, article] };
      }),

      removeSavedArticle: (id) => set((state) => ({
        savedArticles: state.savedArticles.filter(a => a.id !== id)
      })),

      setBurstMinutes: (minutes) => set({ burstMinutes: minutes }),

      startBurst: () => set((state) => ({
        burstActive: true,
        burstTimeRemaining: state.burstMinutes * 60,
        burstModeActive: true
      })),

      endBurst: () => set({ burstActive: false, burstTimeRemaining: 0 }),

      tickBurst: () => set((state) => {
        if (!state.burstActive || state.burstTimeRemaining <= 0) return { burstActive: false };
        return { burstTimeRemaining: state.burstTimeRemaining - 1 };
      }),

      setCompanionMood: (mood) => set({ companionMood: mood }),

      completeOnboarding: (interests) => set((state) => {
        const initialWeights: Record<string, number> = {};
        interests.forEach(interest => {
          initialWeights[interest] = 2.0; // High initial weight for selected interests
        });
        return { hasCompletedOnboarding: true, interactiveTourActive: true, interactiveTourStep: 0, interests, topicWeights: initialWeights };
      }),

      setInteractiveTourActive: (active) => set({ interactiveTourActive: active }),
      advanceInteractiveTour: () => set((state) => ({ interactiveTourStep: state.interactiveTourStep + 1 })),
      completeInteractiveTour: () => set({ interactiveTourActive: false }),

      recordInteraction: (category, scoreDelta) => set((state) => {
        if (!category || category === 'General') return {};
        const currentWeight = state.topicWeights[category] || 1.0;
        // Cap weight between 0.1 and 5.0
        const newWeight = Math.max(0.1, Math.min(5.0, currentWeight + scoreDelta));
        return { topicWeights: { ...state.topicWeights, [category]: newWeight } };
      }),

      addTimeSpent: (seconds) => set((state) => ({ timeSpent: state.timeSpent + seconds })),
      
      setLanguage: (lang) => set({ language: lang }),
      toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
      setShowReturnWelcome: (show) => set({ showReturnWelcome: show }),
      setFocusMode: (focus) => set({ focusMode: focus }),
      
      addWisdomShards: (amount) => set((state) => ({ wisdomShards: state.wisdomShards + (state.isPremium ? amount * 2 : amount) })),
      addPrestigePoints: (amount) => set((state) => ({ prestigePoints: state.prestigePoints + amount })),
      spendWisdomShards: (amount) => {
         let success = false;
         set((state) => {
            if (state.wisdomShards >= amount) {
               success = true;
               return { wisdomShards: state.wisdomShards - amount };
            }
            return {};
         });
         return success;
      },
      spendPrestigePoints: (amount) => {
         let success = false;
         set((state) => {
            if (state.prestigePoints >= amount) {
               success = true;
               return { prestigePoints: state.prestigePoints - amount };
            }
            return {};
         });
         return success;
      },
      unlockCosmetic: (id, costShards, costPrestige) => {
         let success = false;
         set((state) => {
            if (state.wisdomShards >= costShards && state.prestigePoints >= costPrestige && !state.unlockedCosmetics.includes(id)) {
               success = true;
               return { 
                  wisdomShards: state.wisdomShards - costShards,
                  prestigePoints: state.prestigePoints - costPrestige,
                  unlockedCosmetics: [...state.unlockedCosmetics, id]
               };
            }
            return {};
         });
         return success;
      },
      activateBuff: (id, costShards) => {
         let success = false;
         set((state) => {
            // Note: If they are premium, Imperial Guard or similar buffs might be free or permanent, 
            // but for simplicity we treat this as a standard purchase if not permanent.
            if (state.wisdomShards >= costShards && !state.activeBuffs.includes(id)) {
               success = true;
               return {
                  wisdomShards: state.wisdomShards - costShards,
                  activeBuffs: [...state.activeBuffs, id]
               };
            }
            return {};
         });
         return success;
      },
      addReferral: () => set((state) => {
         const newCount = state.referralCount + 1;
         // Every referral gives 500 shards and 1 streak freeze
         return { referralCount: newCount, wisdomShards: state.wisdomShards + 500, streakFreezes: state.streakFreezes + 1 };
      }),
      addRemix: (articleId, note) => set((state) => ({ remixes: [...state.remixes, { articleId, note }] })),
      setPremiumTier: (tier) => set({ premiumTier: tier, isPremium: tier !== 'none' }),
      
      addSearchQuery: (query) => set((state) => ({ searchHistory: [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 10) })),
      createLibrary: (lib) => set((state) => ({
         libraries: [...state.libraries, { ...lib, id: Math.random().toString(36).substr(2, 9), articles: lib.articles || [], conqueredCount: 0, coOwners: lib.coOwners || [] }]
      })),
      addArticleToLibrary: (libraryId, article, roomId, note) => set((state) => ({
         libraries: state.libraries.map(lib => lib.id === libraryId ? { ...lib, articles: [...lib.articles, { article, roomId, likes: 0, comments: [], note }] } : lib)
      })),
      conquerLibrarySection: (libraryId, roomId) => set((state) => ({
         libraries: state.libraries.map(lib => lib.id === libraryId ? { ...lib, conqueredCount: lib.conqueredCount + 1 } : lib)
      }))
    }),
    {
      name: 'wikiburst-storage',
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        savedArticles: state.savedArticles,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        // interactiveTourActive and step are intentionally NOT persisted so if they reload they can skip or we don't trap them
        interests: state.interests,
        topicWeights: state.topicWeights,
        readingHistory: state.readingHistory,
        searchHistory: state.searchHistory,
        timeSpent: state.timeSpent,
        readArticleIds: state.readArticleIds,
        language: state.language,
        hapticsEnabled: state.hapticsEnabled,
        userName: state.userName,
        companionName: state.companionName,
        isPremium: state.isPremium,
        premiumTier: state.premiumTier,
        burstsToday: state.burstsToday,
        lastBurstDate: state.lastBurstDate,
        streakFreezes: state.streakFreezes,
        analyticsEvents: state.analyticsEvents,
        friends: state.friends,
        libraries: state.libraries,
        wisdomShards: state.wisdomShards,
        prestigePoints: state.prestigePoints,
        activeBuffs: state.activeBuffs,
        unlockedCosmetics: state.unlockedCosmetics,
        notifications: state.notifications
      }), // Persist specific fields
    }
  )
);
