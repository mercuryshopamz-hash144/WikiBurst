import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useStore, Library } from '../store/useStore';
import { Castle, Search, Shield, Info, CopyPlus, Trophy, MapPin, Crown, Globe2, Sparkles, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptic } from '../lib/haptics';
import { getPlayerRank, getRankHexColor, getRankColor } from '../lib/ranks';
import { analyzeThemeMatch, generateCityUnlockQuiz, QuizQuestion } from '../lib/gemini';
import { LibraryQuiz } from './LibraryQuiz';
import { LibraryView } from './LibraryView';
import { CITIES, City } from '../data/cities';
import { mockLibraries } from '../data/mockLibraries';
import confetti from 'canvas-confetti';

// Custom icons
const getCityIcon = (tier: number, isOwned: boolean) => {
  const size = isOwned ? (tier === 3 ? 36 : tier === 2 ? 30 : 24) : (tier === 3 ? 28 : tier === 2 ? 20 : 14);
  const colorClass = isOwned ? 'bg-teal-500' : tier === 3 ? 'bg-fuchsia-500' : tier === 2 ? 'bg-amber-500' : 'bg-neutral-600';
  const shadowClass = isOwned 
    ? 'shadow-[0_0_30px_rgba(45,212,191,0.8)]' 
    : tier === 3 ? 'shadow-[0_0_20px_rgba(217,70,239,0.5)]' 
    : tier === 2 ? 'shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
    : 'shadow-sm';
    
  let iconHtml = '';
  if (isOwned) {
     const innerSize = size * 0.5;
     iconHtml = `<span style="font-size: ${innerSize}px; display: flex; align-items: center; justify-content: center; margin-top: -1px;">🏰</span>`;
  } else if (tier === 3) {
     const innerSize = size * 0.6;
     iconHtml = `<span class="text-black" style="font-size: ${innerSize}px; font-weight: 900; line-height: 1; display: flex; align-items: center; justify-content: center; margin-top:-1px;">★</span>`;
  } else if (tier === 2) {
     const innerSize = size * 0.6;
     iconHtml = `<span class="text-black" style="font-size: ${innerSize}px; font-weight: 900; line-height: 1; display: flex; align-items: center; justify-content: center; margin-top:-1px;">♦</span>`;
  } else {
     const innerSize = size * 0.5;
     iconHtml = `<span class="text-black" style="font-size: ${innerSize}px; font-weight: 900; line-height: 1; display: flex; align-items: center; justify-content: center; margin-top:-1px;">•</span>`;
  }

  const pulseHtml = isOwned ? `
    <div class="absolute inset-[0px] rounded-full border border-teal-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></div>
    <div class="absolute inset-[0px] rounded-full border border-teal-500/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style="animation-delay: 500ms;"></div>
  ` : '';

  return new L.DivIcon({
    className: 'bg-transparent border-none tour-city-marker',
    html: `
      <div class="relative flex items-center justify-center font-sans" style="width: ${size}px; height: ${size}px;">
        ${pulseHtml}
        <div class="relative z-10 w-full h-full rounded-full border-2 border-black flex items-center justify-center ${colorClass} ${shadowClass}">
           ${iconHtml}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

function LocationSelector({ onLocationSelected }: { onLocationSelected: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function CityGateQuiz({ questions, onSuccess }: { questions: QuizQuestion[], onSuccess: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const q = questions[currentIdx];

  const handleSelect = (idx: number) => {
    setSelected(idx);
    if (idx === q.correctIndex) {
       haptic.success();
       setTimeout(() => {
          if (currentIdx < questions.length - 1) {
             setCurrentIdx(currentIdx + 1);
             setSelected(null);
          } else {
             onSuccess();
          }
       }, 1000);
    } else {
       haptic.error();
       setMistakes(m => m + 1);
    }
  };

  if (mistakes >= 2) {
     return (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
           <Shield size={48} className="text-rose-500 mb-4" />
           <h3 className="text-xl font-bold text-white mb-2">Gate Closed</h3>
           <p className="text-neutral-400 mb-6">Your local knowledge is lacking. Return after studying more about this city.</p>
        </div>
     );
  }

  return (
    <div className="flex-1 flex flex-col">
       <div className="flex justify-between items-center mb-8">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Question {currentIdx + 1}/{questions.length}</div>
          <div className="text-xs font-bold text-rose-500 uppercase tracking-widest">Mistakes: {mistakes}/2</div>
       </div>
       <h3 className="text-xl font-bold text-white mb-8 leading-relaxed">{q?.question}</h3>
       <div className="flex flex-col gap-3">
          {q?.options.map((opt, idx) => {
             const isSelected = selected === idx;
             const isCorrect = idx === q.correctIndex;
             let bg = "bg-white/5 border border-white/10 hover:bg-white/10";
             if (isSelected) {
                bg = isCorrect ? "bg-teal-500/20 border-teal-500 text-teal-400" : "bg-rose-500/20 border-rose-500 text-rose-400";
             } else if (selected !== null && isCorrect) {
                bg = "bg-teal-500/20 border-teal-500 text-teal-400";
             }
             return (
                <button 
                  key={idx} 
                  disabled={selected !== null}
                  onClick={() => handleSelect(idx)}
                  className={`p-4 rounded-2xl text-left text-sm font-bold transition-all ${bg}`}
                >
                  {opt}
                </button>
             );
          })}
       </div>
    </div>
  );
}

function CityFactCard({ fact }: { fact: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = fact.length > 80;
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-10"><Crown size={40} /></div>
      <span className="text-[9px] uppercase tracking-widest text-amber-500 font-bold block mb-1">Did you know?</span>
      <p className={`text-xs text-amber-100/80 leading-relaxed relative z-10 ${expanded || !isLong ? '' : 'line-clamp-2'}`}>
         {fact}
      </p>
      {isLong && (
         <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-amber-500/80 relative z-10 uppercase font-bold mt-2 hover:text-amber-500 transition-colors">
           {expanded ? 'Show Less' : 'Read More'}
         </button>
      )}
    </div>
  );
}

export function MapTab() {
  const { isPremium, level, libraries, premiumTier, createLibrary, addXp, conquerLibrarySection, currentSeason, activeEvents } = useStore();
  const [showEvents, setShowEvents] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLibParams, setNewLibParams] = useState({ name: '', theme: 'History', coatOfArms: '🛡️' });
  const [activeLibrary, setActiveLibrary] = useState<Library | null>(null);
  const [activeCity, setActiveCity] = useState<City | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showLibraryView, setShowLibraryView] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showEmpire, setShowEmpire] = useState(false);
  const [foundError, setFoundError] = useState<string | null>(null);
  const [showGateQuiz, setShowGateQuiz] = useState(false);
  const [gateQuestions, setGateQuestions] = useState<QuizQuestion[]>([]);
  const [gateLoading, setGateLoading] = useState(true);
  const [showFactSubmit, setShowFactSubmit] = useState(false);
  const [factText, setFactText] = useState('');
  const [factLoading, setFactLoading] = useState(false);
  const [showDominanceModal, setShowDominanceModal] = useState<City | null>(null);

  const handleFactSubmit = async () => {
     if (factText.length < 10) return;
     setFactLoading(true);
     // Simulate Gemini Verification
     setTimeout(() => {
        setFactLoading(false);
        setFactText('');
        setShowFactSubmit(false);
        haptic.success();
        alert('Fact submitted! It will be reviewed by the Community and AI before publishing.');
     }, 2000);
  };

  const handleCreate = async () => {
     if (!newLibParams.name || !activeCity) return;
     
     const myLibrariesCount = libraries.filter(l => l.ownerId === 'me').length;
     const maxLibraries = premiumTier === 'none' ? 1 : premiumTier === 'basic' ? 3 : 10;
     const savedCount = useStore.getState().savedArticles.length;
     
     if (myLibrariesCount >= maxLibraries) {
        setFoundError(`Limit reached (${maxLibraries} libraries). Upgrade for more!`);
        return;
     }

     if (activeCity.tier === 3) {
        if (level < 15 || savedCount < 12) {
           setFoundError("Tier 3 (Legendary): Requires 'National Sovereign' rank (Level 15+) and 12+ bookmarks.");
           return;
        }
     }
     if (activeCity.tier === 2) {
        if (level < 8 || savedCount < 5) {
           setFoundError("Tier 2 (Important): Requires 'City Lord' rank (Level 8+) and 5+ bookmarks.");
           return;
        }
     }
     
     setFoundError(null);
     
     // Local Knowledge Gate Check
     const isLocalBypass = activeCity.tier === 1; // Tier 1 cities don't need theme checks
     if (!isLocalBypass) {
         setFoundError("Checking Local Knowledge relevance...");
         const analysis = await analyzeThemeMatch(useStore.getState().savedArticles.slice(0, 20), activeCity);
         if (!analysis.isRelevant) {
             setFoundError(`Not enough local knowledge! Gemini says: ${analysis.reason}. Try reading about: ${analysis.topicToLearn}`);
             return;
         }
         
         // If relevant, we need to show the quiz. 
         setFoundError(null);
         setShowGateQuiz(true);
         setGateLoading(true);
         const questions = await generateCityUnlockQuiz(activeCity.name, activeCity.theme);
         if (questions && questions.length > 0) {
            setGateQuestions(questions);
            setGateLoading(false);
         } else {
            // fallback if gemini fails
            finalizeCreateLibrary();
         }
         return;
     }

     finalizeCreateLibrary();
  };

  const finalizeCreateLibrary = () => {
     if (!activeCity) return;
     // Auto-create rooms/wings from user's saved articles.
     // We will pick up to 10 saved articles and map their categories to room names.
     const topArticles = [...useStore.getState().savedArticles].slice(0, 10);
     const libraryArticles = topArticles.map(article => ({
        article,
        roomId: article.category ? `${article.category} Wing` : 'Main Hall',
        likes: 0,
        comments: [],
        note: 'Auto-curated upon library foundation.'
     }));
     
     createLibrary({ 
        name: newLibParams.name,
        theme: newLibParams.theme,
        coatOfArms: newLibParams.coatOfArms,
        lat: activeCity.lat, 
        lng: activeCity.lng,
        ownerId: 'me', 
        coOwners: [],
        isPublic: true,
        cityId: activeCity.id,
        articles: libraryArticles
     });
     
     // Success celebration
     const duration = 3 * 1000;
     const animationEnd = Date.now() + duration;
     const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

     const interval: any = setInterval(function() {
       const timeLeft = animationEnd - Date.now();

       if (timeLeft <= 0) {
         return clearInterval(interval);
       }

       const particleCount = 50 * (timeLeft / duration);
       confetti({
         ...defaults, particleCount,
         origin: { x: Math.random() * 0.2 + 0.4, y: Math.random() * 0.2 + 0.4 } // Center of map
       });
     }, 250);

     useStore.getState().addPrestigePoints(activeCity.tier * 50);
     addXp(activeCity.tier * 200);

     setCreating(false);
     setShowGateQuiz(false);
     setShowDominanceModal(activeCity);
     haptic.success();
     // We do NOT clear activeCity here so the modal can use it easily, or we use showDominanceModal to dictate it
  };
  
  const handleConquered = () => {
     if (activeLibrary) {
       conquerLibrarySection(activeLibrary.id, 'Main Hall');
       
       const libraryCity = CITIES.find(c => c.id === activeLibrary.cityId);
       const tierModifier = libraryCity ? libraryCity.tier : 1;
       
       addXp(100 * tierModifier);
       useStore.getState().addPrestigePoints(tierModifier * 25);
       haptic.success();

       confetti({
         particleCount: 100,
         spread: 70,
         origin: { y: 0.6 },
         zIndex: 9999,
         colors: ['#f59e0b', '#fbbf24', '#fcd34d']
       });
       
       if (libraryCity) {
          setShowDominanceModal({ ...libraryCity, tier: tierModifier as any });
          setActiveCity(libraryCity);
       }
     }
  };
  
  const allLibraries = [...mockLibraries, ...libraries];
  const activeCityLibraries = activeCity ? allLibraries.filter(l => l.cityId === activeCity.id || (Math.abs(l.lat - activeCity.lat) < 1 && Math.abs(l.lng - activeCity.lng) < 1)) : [];

  const handleRecommendCity = async () => {
    try {
      const unvisitedCities = CITIES.filter(c => !libraries.some(l => l.cityId === c.id && l.ownerId === 'me'));
      if (unvisitedCities.length === 0) {
        setFoundError("You have visited all available cities!");
        return;
      }
      
      setFoundError("Consulting your Imperial Advisors...");
      const { getCityRecommendation } = await import('../lib/gemini');
      
      const currentCityNames = libraries.filter(l => l.ownerId === 'me').map(l => CITIES.find(c => c.id === l.cityId)?.name || '');
      const currentCity = currentCityNames.length > 0 ? currentCityNames[0] : "Rome";
      const userInterests = useStore.getState().interests || ["History", "Architecture"];
      
      const recommendationText = await getCityRecommendation(currentCity, userInterests);
      
      // Attempt to find the city in CITIES that matches the recommendation
      let recommended: City | null = null;
      if (recommendationText) {
         recommended = unvisitedCities.find(c => recommendationText.includes(c.name)) || null;
      }
      
      if (!recommended) {
         let availableCities = unvisitedCities;
         if (level < 8) availableCities = unvisitedCities.filter(c => (c.tier || 1) === 1);
         else if (level < 15) availableCities = unvisitedCities.filter(c => (c.tier || 1) <= 2);
         if (availableCities.length === 0) availableCities = unvisitedCities;
         recommended = availableCities[Math.floor(Math.random() * availableCities.length)];
      }

      setFoundError(recommendationText ? `Advisor says: ${recommendationText}` : null);
      setActiveCity(recommended);
      haptic.success();
    } catch (e) {
      console.error(e);
      setFoundError("Advisors are currently resting.");
    }
  };

  return (
    <div className="h-full w-full relative z-10 flex flex-col pt-12 pb-32">
       <div className="px-6 mb-4 flex items-center justify-between z-20 pointer-events-none drop-shadow-xl">
         <h1 className="text-[32px] font-serif italic text-white tracking-tight pointer-events-auto">Bilgi İmparatorluğu.</h1>
         <div className="flex items-center gap-2 pointer-events-auto">
            <button onClick={handleRecommendCity} className="w-10 h-10 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 transition-colors flex items-center justify-center text-indigo-400 border border-indigo-500/40">
              <Sparkles size={18} />
            </button>
            <button onClick={() => setShowEmpire(true)} className="w-10 h-10 rounded-full bg-fuchsia-500/20 hover:bg-fuchsia-500/30 transition-colors flex items-center justify-center text-fuchsia-400 border border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.2)]">
              <Globe2 size={18} />
            </button>
            <button onClick={() => setShowEvents(true)} className="w-10 h-10 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors flex items-center justify-center text-blue-400 border border-blue-500/40">
              <Calendar size={18} />
            </button>
            <button onClick={() => setShowLeaderboard(true)} className="w-10 h-10 rounded-full bg-amber-500/20 hover:bg-amber-500/30 transition-colors flex items-center justify-center text-amber-400 border border-amber-500/40">
              <Trophy size={18} />
            </button>
            <button onClick={() => setCreating(true)} className="w-10 h-10 rounded-full bg-teal-500/20 hover:bg-teal-500/30 transition-colors flex items-center justify-center text-teal-400 border border-teal-500/40">
              <CopyPlus size={18} />
            </button>
         </div>
       </div>

       <div className="flex-1 w-full relative z-0 overflow-hidden rounded-[32px] border border-white/10 mx-auto max-w-[calc(100%-48px)] h-full mb-8 shadow-2xl bg-[#0a0a0a]">
          <div className="absolute inset-0">
            <MapContainer center={[48.8566, 2.3522]} zoom={4} style={{ height: '100%', width: '100%', background: '#0a0a0a' }} zoomControl={false}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            
            {CITIES.map(city => {
               const myLibHere = allLibraries.find(l => l.cityId === city.id && l.ownerId === 'me');
               const iconToUse = getCityIcon(city.tier || 1, !!myLibHere);
               const userRank = getPlayerRank(level);
               const territoryColor = getRankHexColor(userRank);
               return (
                  <React.Fragment key={city.id}>
                    {myLibHere && (
                       <Circle 
                         center={[city.lat, city.lng]} 
                         radius={city.tier === 3 ? 500000 : city.tier === 2 ? 300000 : 150000} 
                         pathOptions={{ color: territoryColor, fillColor: territoryColor, fillOpacity: 0.15, weight: 2, dashArray: '4' }} 
                       />
                    )}
                    <Marker position={[city.lat, city.lng]} icon={iconToUse} eventHandlers={{ click: () => setActiveCity(city) }} />
                  </React.Fragment>
               );
            })}
          </MapContainer>
          </div>
          
          <div className="absolute top-4 left-4 right-4 z-[999] pointer-events-none flex flex-col gap-2">
             {creating && !foundError && (
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-black/60 backdrop-blur-xl border border-teal-500/30 text-teal-400 p-3 rounded-2xl text-xs font-bold text-center pointer-events-auto shadow-lg">
                   Select a City to found your Library.
                </motion.div>
             )}
             <AnimatePresence>
               {foundError && (
                  <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="bg-black/80 backdrop-blur-xl border border-rose-500/50 text-rose-400 p-4 rounded-2xl text-[11px] font-bold text-center pointer-events-auto shadow-xl flex items-center justify-between">
                     <span>{foundError}</span>
                     <button onClick={() => setFoundError(null)} className="ml-2 w-6 h-6 flex items-center justify-center bg-white/10 rounded-full text-white">×</button>
                  </motion.div>
               )}
             </AnimatePresence>
          </div>
       </div>

       {/* Bottom Sheets */}
       <AnimatePresence>
         {activeCity && !creating && !activeLibrary && (
             <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }} className="absolute bottom-24 left-6 right-6 z-50 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h3 className="text-2xl font-bold text-white leading-none">{activeCity.name}</h3>
                      <p className="text-xs text-amber-500 font-bold tracking-widest mt-1 uppercase flex items-center gap-1">
                        Tier {activeCity.tier} <MapPin size={10} /> {activeCity.country}
                      </p>
                   </div>
                   <button onClick={() => setActiveCity(null)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-neutral-400">×</button>
                </div>
                
                <p className="text-neutral-400 text-sm mb-4">{activeCity.description}</p>
                
                {activeCity.fact && <CityFactCard fact={activeCity.fact} />}
                
                {activeCityLibraries.length > 0 && (
                   <div className="mb-6">
                      <h4 className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-3">Libraries Here ({activeCityLibraries.length})</h4>
                      <div className="flex flex-col gap-2">
                         {activeCityLibraries.map(lib => (
                            <button key={lib.id} onClick={() => setActiveLibrary(lib)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors text-left">
                               <div className="w-10 h-10 bg-neutral-900 rounded-full border border-teal-500/30 flex items-center justify-center text-lg">{lib.coatOfArms}</div>
                               <div className="flex-1">
                                  <div className="font-bold text-white text-sm">{lib.name}</div>
                                  <div className="text-[10px] text-neutral-400 uppercase">{lib.ownerId === 'me' ? 'Yours' : 'Public'} • {lib.theme}</div>
                               </div>
                               <Castle size={16} className="text-teal-400" />
                            </button>
                         ))}
                      </div>
                   </div>
                )}

                {!activeCityLibraries.some(l => l.ownerId === 'me') && (
                   <button onClick={() => setCreating(true)} className="w-full bg-teal-500 text-black py-3 rounded-xl text-sm font-bold tracking-widest uppercase flex justify-center items-center gap-2">
                      Found Library Here <CopyPlus size={16} />
                   </button>
                )}
             </motion.div>
         )}

         {creating && activeCity && (
            <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }} className="absolute bottom-6 left-6 right-6 z-50 bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-2xl">
               <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Castle size={18} className="text-teal-400" /> Found in {activeCity.name}</h3>
               <p className="text-xs text-neutral-400 mb-6">{activeCity.theme} • Tier {activeCity.tier}</p>
               <input autoFocus type="text" placeholder="Library Name" value={newLibParams.name} onChange={e => setNewLibParams(p => ({ ...p, name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base text-white mb-6 focus:outline-none focus:border-teal-500/50 transition-colors" />
               
               <div className="mb-6">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest mb-3 block">Theme</span>
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mask-linear">
                     {['History', 'Science', 'Space', 'Arts', 'Philosophy', 'Technology', activeCity.theme].filter((v, i, a) => a.indexOf(v) === i).map(theme => (
                        <button 
                           key={theme}
                           onClick={() => setNewLibParams(p => ({ ...p, theme }))}
                           className={`whitespace-nowrap px-4 py-2 rounded-full border text-xs font-bold transition-all ${newLibParams.theme === theme ? 'bg-teal-500 text-black border-teal-500 shadow-[0_0_15px_rgba(45,212,191,0.3)]' : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'}`}
                        >
                           {theme}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="mb-8">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest mb-3 block">Coat of Arms</span>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 mask-linear">
                     {['🛡️', '👑', '⚔️', '🦉', '🏛️', '🎭', '🔮', '✨', '🪐', '🧠'].map(emoji => (
                        <button 
                           key={emoji}
                           onClick={() => setNewLibParams(p => ({ ...p, coatOfArms: emoji }))}
                           className={`flex-shrink-0 w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl transition-all ${newLibParams.coatOfArms === emoji ? 'bg-teal-500/20 border-teal-500 shadow-[0_0_15px_rgba(45,212,191,0.2)]' : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100 hover:bg-white/10'}`}
                        >
                           {emoji}
                        </button>
                     ))}
                  </div>
               </div>
               
               <div className="flex gap-3">
                 <button onClick={() => setCreating(false)} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-neutral-400 text-sm font-bold hover:bg-white/10 transition-colors">Cancel</button>
                 <button onClick={handleCreate} disabled={!newLibParams.name} className="flex-1 py-4 rounded-2xl bg-teal-500 text-black text-sm font-bold shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-50 disabled:shadow-none transition-all">Found Library</button>
               </div>
            </motion.div>
         )}

         {activeLibrary && !creating && (
            <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }} className="absolute bottom-24 left-6 right-6 z-50 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-neutral-900 rounded-full border border-teal-500/30 flex items-center justify-center text-xl">
                        {activeLibrary.coatOfArms}
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{activeLibrary.name}</h3>
                        <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">{activeLibrary.ownerId === 'me' ? 'Your Library' : 'Public Library'}</p>
                     </div>
                  </div>
                  <button onClick={() => setActiveLibrary(null)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-neutral-400">×</button>
               </div>
               
               <div className="flex items-center gap-4 mt-6 border-t border-white/5 pt-4">
                  <div className="flex flex-col">
                     <span className="text-xs text-neutral-500 font-medium">Articles</span>
                     <span className="text-sm font-bold text-white">{activeLibrary.articles?.length || 0}</span>
                  </div>
                  <div className="w-[1px] h-8 bg-white/10"></div>
                  <div className="flex flex-col">
                     <span className="text-xs text-neutral-500 font-medium">Theme</span>
                     <span className="text-sm font-bold text-white">{activeLibrary.theme}</span>
                  </div>
                  <div className="w-[1px] h-8 bg-white/10"></div>
                  <div className="flex flex-col">
                     <span className="text-xs text-neutral-500 font-medium">Conquests</span>
                     <span className="text-sm font-bold text-orange-400">{activeLibrary.conqueredCount}</span>
                  </div>
               </div>

               {activeLibrary.ownerId === 'me' ? (
                  <div className="flex gap-2 w-full mt-6">
                     <button 
                        onClick={() => setShowFactSubmit(true)} 
                        className="flex-1 bg-white/5 hover:bg-white/10 transition-colors text-teal-400 py-3 rounded-xl text-xs font-bold tracking-widest uppercase flex justify-center items-center gap-2"
                     >
                        Submit Fact
                     </button>
                     <button 
                        onClick={() => { setShowLibraryView(true); }} 
                        className="flex-1 bg-white/10 hover:bg-white/20 transition-colors text-white py-3 rounded-xl text-xs font-bold tracking-widest uppercase flex justify-center items-center gap-2"
                     >
                        Enter Museum <Castle size={14} />
                     </button>
                  </div>
               ) : (
                  <div className="flex gap-2 w-full mt-6">
                     <button 
                        onClick={() => { setShowLibraryView(true); }} 
                        className="flex-1 bg-white/10 hover:bg-white/20 transition-colors text-white py-3 rounded-xl text-xs font-bold tracking-widest uppercase flex justify-center items-center gap-2"
                     >
                        Visit <Castle size={14} />
                     </button>
                     <button 
                        onClick={() => setShowQuiz(true)} 
                        className="flex-1 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-amber-500 py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase flex justify-center items-center gap-2"
                     >
                        Challenge <Shield size={14} />
                     </button>
                  </div>
               )}
            </motion.div>
         )}
       </AnimatePresence>
       
       <AnimatePresence>
          {showLibraryView && activeLibrary && (
             <LibraryView 
                library={activeLibrary} 
                onClose={() => setShowLibraryView(false)} 
                onChallenge={() => { setShowLibraryView(false); setShowQuiz(true); }}
             />
          )}
       </AnimatePresence>
       
       {showQuiz && activeLibrary && <LibraryQuiz myLibrary={activeCityLibraries.find(l => l.ownerId === 'me') || null} library={activeLibrary} onClose={() => setShowQuiz(false)} onConquered={handleConquered} />}
       
       <AnimatePresence>
         {showFactSubmit && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
               <div className="bg-neutral-900 border border-white/10 p-6 rounded-3xl w-full max-w-sm">
                  <h3 className="text-xl font-bold text-white mb-2">Submit Local Fact</h3>
                  <p className="text-xs text-neutral-400 mb-4">Your fact will be verified by Gemini and community votes before being added to {activeLibrary?.name}.</p>
                  <textarea 
                     value={factText} 
                     onChange={e => setFactText(e.target.value)} 
                     placeholder="e.g. The library was actually built on..."
                     className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white mb-4 focus:outline-none focus:border-teal-500/50 resize-none"
                  />
                  <div className="flex gap-2">
                     <button onClick={() => setShowFactSubmit(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-neutral-400 font-bold">Cancel</button>
                     <button onClick={handleFactSubmit} disabled={factText.length < 10 || factLoading} className="flex-1 py-3 rounded-xl bg-teal-500 text-black font-bold disabled:opacity-50">
                        {factLoading ? 'Verifying...' : 'Submit'}
                     </button>
                  </div>
               </div>
            </motion.div>
         )}
       </AnimatePresence>
       
       <AnimatePresence>
         {showGateQuiz && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex flex-col pt-16 px-6">
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Crown className="text-fuchsia-400" /> City Gate</h2>
                   <button onClick={() => setShowGateQuiz(false)} className="bg-white/10 w-8 h-8 flex items-center justify-center rounded-full text-white">×</button>
                </div>
                {gateLoading ? (
                   <div className="flex-1 flex flex-col items-center justify-center">
                     <Castle size={48} className="text-teal-400 mb-4 animate-bounce" />
                     <p className="text-white font-bold animate-pulse">Generating Local Knowledge Trial...</p>
                   </div>
                ) : (
                   <CityGateQuiz questions={gateQuestions} onSuccess={finalizeCreateLibrary} />
                )}
            </motion.div>
         )}
       </AnimatePresence>
       
       <AnimatePresence>
         {showDominanceModal && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="absolute inset-0 bg-black/90 backdrop-blur-3xl z-[300] flex flex-col items-center justify-center p-6 text-center">
               <div className="absolute inset-0 bg-gradient-to-t from-teal-500/20 via-transparent to-purple-500/10 pointer-events-none" />
               <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                 <Crown size={80} className="text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] mb-6" />
               </motion.div>
               <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter drop-shadow-lg">City Conquered!</h2>
               <div className="text-lg font-bold text-teal-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                 <MapPin size={18} /> {showDominanceModal.name} Dominance <Shield size={18} />
               </div>
               
               <p className="text-neutral-300 text-sm mb-8 leading-relaxed max-w-xs">
                 You have successfully established a foothold in {showDominanceModal.name}. Your library will now exert cultural dominance over this region.
               </p>

               <div className="w-full max-w-xs flex flex-col gap-4 mb-10">
                 <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                   <span className="text-neutral-400 font-bold uppercase tracking-widest text-xs">XP Gained</span>
                   <span className="text-teal-400 font-black text-xl">+{showDominanceModal.tier * 200}</span>
                 </div>
                 <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                   <span className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Prestige Points</span>
                   <span className="text-purple-400 font-black text-xl">+{showDominanceModal.tier * 50}</span>
                 </div>
               </div>

               <button 
                 onClick={() => { setShowDominanceModal(null); setActiveCity(null); }}
                 className="w-full max-w-xs py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]"
               >
                 Claim Domain
               </button>
            </motion.div>
         )}
       </AnimatePresence>

       <AnimatePresence>
         {showEvents && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0a0a0c]/95 backdrop-blur-3xl z-[200] flex flex-col pt-12 px-6 overflow-y-auto">
               <div className="flex justify-between items-center mb-8 py-4">
                  <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-md"><Calendar className="text-blue-400" size={28} /> Global Events</h2>
                  <button onClick={() => setShowEvents(false)} className="bg-white/5 hover:bg-white/10 w-12 h-12 flex items-center justify-center rounded-full text-white transition-colors border border-white/10">×</button>
               </div>
               
               <div className="space-y-10 pb-32">
                  <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-6 rounded-[32px] relative overflow-hidden backdrop-blur-md shadow-xl group">
                     <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/20 blur-3xl pointer-events-none"></div>
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-amber-500 text-black px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold">Active Season</span>
                           <span className="text-amber-500 text-[10px] font-bold tracking-widest uppercase">Ends {currentSeason?.endsAt ? new Date(currentSeason.endsAt).toLocaleDateString() : 'Soon'}</span>
                        </div>
                        <h3 className="text-white font-black text-2xl mb-1 drop-shadow-md">{currentSeason?.name || 'Current Season'}</h3>
                        <p className="text-amber-200/80 text-sm mb-4 font-medium leading-relaxed">{currentSeason?.description || 'Earn bonus rewards depending on the season.'}</p>
                        
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-xl">✨</div>
                           <div>
                              <div className="text-white font-bold text-sm">Theme: {currentSeason?.theme}</div>
                              <div className="text-neutral-400 text-xs mt-0.5">Explore cities that match this theme to multiply your Shards & XP.</div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div>
                     <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-6 px-2 flex items-center gap-2 border-b border-white/10 pb-2">Ongoing Events</h3>
                     <div className="flex flex-col gap-4">
                        {activeEvents?.map((event) => (
                           <div key={event.id} className="bg-white/5 border border-white/10 rounded-[28px] p-5 relative overflow-hidden">
                              <div className="flex justify-between items-start mb-3">
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <span className={`px-2 py-0.5 rounded uppercase tracking-wider text-[9px] font-bold ${event.type === 'tournament' ? 'bg-fuchsia-500 text-black' : event.type === 'world_project' ? 'bg-teal-500 text-black' : 'bg-blue-500 text-black'}`}>
                                          {event.type.replace('_', ' ')}
                                       </span>
                                       <span className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase">
                                          Ends {new Date(event.endsAt).toLocaleDateString()}
                                       </span>
                                    </div>
                                    <h4 className="text-white font-bold text-lg leading-tight">{event.name}</h4>
                                 </div>
                              </div>
                              <p className="text-neutral-400 text-sm mb-4">{event.description}</p>
                              
                              {event.goal && (
                                 <div className="mb-4">
                                    <div className="flex justify-between text-xs text-neutral-400 font-bold mb-1.5">
                                       <span>Progress</span>
                                       <span className={event.type === 'world_project' ? 'text-teal-400' : 'text-fuchsia-400'}>
                                          {event.progress?.toLocaleString()} / {event.goal.toLocaleString()}
                                       </span>
                                    </div>
                                    <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                       <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${Math.min(100, ((event.progress || 0) / event.goal) * 100)}%` }}
                                          className={`h-full ${event.type === 'world_project' ? 'bg-teal-500' : 'bg-fuchsia-500'}`}
                                       />
                                    </div>
                                 </div>
                              )}
                              
                              <button className={`w-full py-3 rounded-xl text-xs font-bold tracking-widest uppercase flex justify-center items-center gap-2 ${event.type === 'world_project' ? 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20' : 'bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20'} transition-colors`}>
                                 {event.type === 'world_project' ? 'Contribute Shards' : 'View Leaderboard'}
                              </button>
                           </div>
                        ))}
                        
                        {!activeEvents || activeEvents.length === 0 && (
                           <div className="text-center py-8 text-neutral-500 text-sm">No active events currently.</div>
                        )}
                     </div>
                  </div>
               </div>
            </motion.div>
         )}
       </AnimatePresence>

       <AnimatePresence>
         {showLeaderboard && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0a0a0c]/95 backdrop-blur-3xl z-[200] flex flex-col pt-12 px-6 overflow-y-auto">
               <div className="flex justify-between items-center mb-8 py-4">
                  <h2 className="text-3xl font-black text-white flex items-center gap-3 drop-shadow-md"><Globe2 className="text-blue-400" size={28} /> Network</h2>
                  <button onClick={() => setShowLeaderboard(false)} className="bg-white/5 hover:bg-white/10 w-12 h-12 flex items-center justify-center rounded-full text-white transition-colors border border-white/10">×</button>
               </div>
               
               <div className="space-y-10 pb-32">
                  
                  <div>
                     <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-6 px-2 flex items-center gap-2 border-b border-white/10 pb-2">National Sovereigns</h3>
                     <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
                        {['Alice', 'Bob', 'Charlie'].map(friend => (
                           <div key={friend} className="snap-center shrink-0 w-32 bg-white/5 border border-white/10 rounded-[24px] p-4 text-center cursor-pointer hover:bg-white/10 transition-colors">
                              <div className="w-12 h-12 bg-neutral-800 rounded-full mx-auto mb-3 flex items-center justify-center text-xl shadow-md border border-white/10">👑</div>
                              <h4 className="text-white font-bold text-sm mb-1">{friend}</h4>
                              <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Level 12</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div>
                     <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-6 px-2 flex items-center gap-2 border-b border-white/10 pb-2">Most Visited Libraries</h3>
                     <div className="grid gap-4">
                        {[...allLibraries].sort((a,b) => b.conqueredCount - a.conqueredCount).slice(0, 10).map((lib, idx) => {
                           const city = CITIES.find(c => c.id === lib.cityId);
                           return (
                            <div key={lib.id} onClick={() => { setShowLeaderboard(false); setActiveLibrary(lib); }} className="flex items-center gap-4 bg-white/5 border border-white/10 hover:bg-white/10 p-4 rounded-[24px] cursor-pointer transition-all shadow-md">
                               <div className="w-6 font-black text-neutral-500 text-lg opacity-50">#{idx + 1}</div>
                               <div className="text-3xl w-14 h-14 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner border border-white/5">{lib.coatOfArms}</div>
                               <div className="flex-1">
                                  <h3 className="font-bold text-white text-lg drop-shadow-sm">{lib.name}</h3>
                                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium text-teal-400">{city ? city.name : ''} • {lib.theme}</p>
                               </div>
                               <div className="text-amber-400 font-bold flex flex-col items-end">
                                  <span>{lib.conqueredCount} <span className="text-pink-500">♥</span></span>
                                  <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Curators</span>
                               </div>
                            </div>
                           );
                        })}
                     </div>
                  </div>

               </div>
            </motion.div>
         )}
         {showEmpire && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0a0a0c]/95 backdrop-blur-3xl z-[200] flex flex-col pt-12 px-6 overflow-y-auto pb-32">
               <div className="flex justify-between items-center mb-8 py-4">
                  <h2 className="text-3xl font-black text-white flex items-center gap-3"><Globe2 className="text-fuchsia-400" size={28} /> Treasury</h2>
                  <button onClick={() => setShowEmpire(false)} className="bg-white/5 hover:bg-white/10 w-12 h-12 flex items-center justify-center rounded-full text-white transition-colors border border-white/10">×</button>
               </div>
               
               {/* Core Economy Status */}
               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/20 p-5 rounded-[24px] backdrop-blur-sm">
                     <h3 className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Sparkles size={12} /> Wisdom Shards</h3>
                     <div className="text-4xl font-black text-white drop-shadow-md">{useStore.getState().wisdomShards.toLocaleString()}</div>
                     <p className="text-xs text-neutral-400 mt-2 font-medium">Earn by visiting, conquering, and reading daily.</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 p-5 rounded-[24px] backdrop-blur-sm relative overflow-hidden">
                     {isPremium && <div className="absolute top-2 right-2 bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-widest">+2x Boost</div>}
                     <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Crown size={12} /> Prestige Points</h3>
                     <div className="text-4xl font-black text-white drop-shadow-md">{useStore.getState().prestigePoints.toLocaleString()}</div>
                     <p className="text-xs text-neutral-400 mt-2 font-medium">Earn via Dominance & Top City checks.</p>
                  </div>
               </div>

               {/* Spending & Upgrades - The Market */}
               <div className="mb-10">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-6 px-2 border-b border-white/10 pb-2 flex items-center justify-between">
                     <span>The Grand Bazaar</span>
                  </h3>
                  
                  <div className="space-y-4">
                     {/* Buff: Imperial Guard */}
                     <div className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 p-5 rounded-[24px] flex items-center gap-4 cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 shrink-0"><Shield size={24} /></div>
                        <div className="flex-1">
                           <h4 className="font-bold text-white mb-1">Imperial Guard Shield</h4>
                           <p className="text-xs text-neutral-400">Protect one library from conquest for 24h.</p>
                        </div>
                        <button onClick={() => {
                           if(useStore.getState().spendWisdomShards(500)) alert('Purchased Imperial Guard Shield!'); else alert('Not enough Shards!');
                        }} className="px-4 py-2 bg-white/10 rounded-xl text-white font-bold text-xs flex items-center gap-1 hover:bg-white/20"><Sparkles size={12} className="text-teal-400"/> 500</button>
                     </div>

                     {/* Buff: City Unlock Booster */}
                     <div className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 p-5 rounded-[24px] flex items-center gap-4 cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shrink-0"><MapPin size={24} /></div>
                        <div className="flex-1">
                           <h4 className="font-bold text-white mb-1">Pioneer's Compass</h4>
                           <p className="text-xs text-neutral-400">Unlock a distant city without local visits.</p>
                        </div>
                        <button onClick={() => {
                           if(useStore.getState().spendPrestigePoints(10)) alert('Purchased Pioneer\'s Compass!'); else alert('Not enough Prestige!');
                        }} className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300 font-bold text-xs flex items-center gap-1 hover:bg-purple-500/30"><Crown size={12} className="text-purple-400"/> 10</button>
                     </div>

                     {/* Cosmetic: Theme */}
                     <div className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 p-5 rounded-[24px] flex items-center gap-4 cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/20 shrink-0"><Castle size={24} /></div>
                        <div className="flex-1">
                           <h4 className="font-bold text-white mb-1">Ethereal Library Skin</h4>
                           <p className="text-xs text-neutral-400">Apply a floating glassmorphism theme to a library.</p>
                        </div>
                        <button onClick={() => {
                           if(useStore.getState().unlockCosmetic('skin_ethereal', 2000, 5)) alert('Unlocked Ethereal Theme!'); else alert('Insufficient Shards/Prestige!');
                        }} className="px-4 py-2 bg-white/10 rounded-xl text-white font-bold text-xs flex flex-col gap-1 hover:bg-white/20">
                           <div className="flex items-center gap-1"><Sparkles size={10} className="text-teal-400"/> 2k</div>
                           <div className="flex items-center gap-1 text-purple-400"><Crown size={10} /> 5</div>
                        </button>
                     </div>
                  </div>
               </div>

               {/* Empire Overview visual */}
               <div className="bg-fuchsia-500/5 border border-fuchsia-500/10 p-6 rounded-[32px] mb-8 relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-4 right-4 opacity-10 pointer-events-none mix-blend-screen">
                     <Crown size={120} className="text-fuchsia-400" />
                  </div>
                  <h3 className="text-sm font-bold text-fuchsia-400 uppercase tracking-widest mb-1">Knowledge Power Score</h3>
                  <div className="text-5xl font-black text-white mb-6 drop-shadow-md">{level * 100 + libraries.filter(l => l.ownerId === 'me').length * 500} <span className="text-lg text-fuchsia-300/50">KP</span></div>
                  <div className="flex gap-4 relative z-10">
                     <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex-1 text-center font-bold text-white backdrop-blur-md">
                        <div className="text-3xl mb-1">{libraries.filter(l => l.ownerId === 'me').length}</div>
                        <div className="text-[9px] text-neutral-400 uppercase tracking-widest">Cities Controlled</div>
                     </div>
                     <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex-1 text-center font-bold text-white backdrop-blur-md">
                        <div className="text-3xl mb-1">{Array.from(new Set(libraries.filter(l => l.ownerId === 'me').map(l => CITIES.find(c => c.id === l.cityId)?.country))).filter(Boolean).length}</div>
                        <div className="text-[9px] text-neutral-400 uppercase tracking-widest">Global Reach</div>
                     </div>
                  </div>
               </div>

               <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-6 px-2 border-b border-white/10 pb-2 flex justify-between items-center">
                  <span>Your Imperial Holdings</span>
                  <span className="text-fuchsia-400 font-black">{libraries.filter(l => l.ownerId === 'me').length} Domains</span>
               </h3>
               
               <div className="relative w-full h-80 overflow-hidden rounded-[32px] bg-gradient-to-b from-[#0a0a0c] to-black/40 border border-white/5 mb-8 perspective-[1000px] flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-[#0a0a0c] z-10 pointer-events-none"></div>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)_translateY(-100px)_translateZ(-200px)] opacity-50"></div>
                  
                  <motion.div 
                     initial={{ rotateX: 60, rotateZ: -45, scale: 0.8 }}
                     animate={{ rotateX: 60, rotateZ: -45, scale: 1 }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="grid grid-cols-3 gap-8 transform-style-3d origin-center"
                  >
                     {libraries.filter(l => l.ownerId === 'me').map((lib, i) => (
                        <motion.div 
                           key={lib.id} 
                           initial={{ z: 0 }}
                           animate={{ z: [0, 20 + i * 2, 0] }}
                           transition={{ repeat: Infinity, repeatType: "reverse", duration: 4, delay: i * 0.2 }}
                           className="w-16 h-16 bg-gradient-to-br from-white/10 to-teal-500/10 border-2 border-teal-500/30 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-[0_20px_40px_rgba(20,244,184,0.1),_inset_0_1px_1px_rgba(255,255,255,0.2)] relative transform-style-3d"
                        >
                           <div className="absolute -top-12 left-1/2 -translate-x-1/2 -rotate-z-[-45] rotate-x-[-60] whitespace-nowrap flex flex-col items-center pointer-events-none">
                              <span className="text-white font-black text-xs bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 shadow-xl">
                                 {lib.name}
                              </span>
                           </div>
                           <div className="absolute -inset-4 bg-teal-500/20 blur-xl rounded-full opacity-50"></div>
                           <span className="relative z-10 drop-shadow-md">{lib.coatOfArms}</span>
                        </motion.div>
                     ))}
                     {libraries.filter(l => l.ownerId === 'me').length === 0 && (
                        <div className="col-span-3 text-center -rotate-z-[-45] rotate-x-[-60] text-neutral-500 font-bold text-sm">
                           No territories yet.
                        </div>
                     )}
                  </motion.div>
               </div>
            </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}
