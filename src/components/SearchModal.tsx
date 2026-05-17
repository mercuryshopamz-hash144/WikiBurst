import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Loader2, ArrowRight, Library as LibraryIcon, MapPin } from 'lucide-react';
import { useStore } from '../store/useStore';
import { WikiArticle } from '../lib/wikipedia';
import { haptic } from '../lib/haptics';
import { mockLibraries } from '../data/mockLibraries';
import { CITIES } from '../data/cities';

interface SearchResult extends Omit<Partial<WikiArticle>, 'id'> {
  id: string;
  title: string;
  extract: string;
  imageUrl?: string;
  url?: string;
  type: 'article' | 'library' | 'city';
  metadata?: any;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { libraries } = useStore();
  
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const localResults: SearchResult[] = [];
        const lowerQuery = query.toLowerCase();
        
        // Search Cities
        CITIES.filter(c => c.name.toLowerCase().includes(lowerQuery) || c.country.toLowerCase().includes(lowerQuery)).slice(0, 3).forEach(c => {
           localResults.push({
             id: `city_${c.id}`,
             title: c.name,
             extract: `${c.country} • Tier ${c.tier || 1} City`,
             type: 'city',
             metadata: c
           });
        });
        
        // Search Libraries
        const allLibs = [...mockLibraries, ...libraries];
        allLibs.filter(l => l.name.toLowerCase().includes(lowerQuery) || l.theme.toLowerCase().includes(lowerQuery)).slice(0, 5).forEach(l => {
           const city = CITIES.find(c => c.id === l.cityId);
           localResults.push({
             id: `lib_${l.id}`,
             title: l.name,
             extract: `Theme: ${l.theme} • located in ${city?.name || 'Unknown'}`,
             type: 'library',
             metadata: l
           });
        });

        // Search Wikipedia
        const lang = useStore.getState().language;
        const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`);
        
        if (res.ok) {
          const data = await res.json();
          const searchResults = data.query?.search || [];
          
          if (searchResults.length > 0) {
            const titles = searchResults.slice(0, 4).map((s: any) => s.title).join('|');
            const detailRes = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exchars=150&exintro=1&explaintext=1&pithumbsize=200&titles=${encodeURIComponent(titles)}&format=json&origin=*`);
            
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              const pages = Object.values(detailData.query?.pages || {});
              
              const articles: SearchResult[] = pages.map((p: any) => ({
                id: `wiki_${p.pageid}`,
                title: p.title,
                extract: p.extract,
                imageUrl: p.thumbnail?.source,
                url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
                type: 'article'
              }));
              
              setResults([...localResults, ...articles]);
              setIsLoading(false);
              return;
            }
          }
        }
        
        setResults(localResults);
      } catch (err) {
        console.error("Search failed", err);
        // Fallback to local
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col pt-12"
        >
          <div className="px-4 flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
              <input 
                type="text"
                autoFocus
                placeholder="Search anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-teal-500/50 transition-colors"
               />
               {isLoading && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-400 animate-spin" />}
            </div>
            <button 
              onClick={() => { haptic.light(); onClose(); }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
            {query.length > 0 && query.length < 3 && (
              <p className="text-center text-sm text-neutral-500 mt-10">Type at least 3 characters to search</p>
            )}
            
            {!isLoading && query.length >= 3 && results.length === 0 && (
              <p className="text-center text-sm text-neutral-500 mt-10">No exact matches found.</p>
            )}

            <div className="space-y-4 pb-20">
              {results.map(article => (
                <div key={article.id} className="backdrop-blur-3xl bg-white/5 border border-white/10 rounded-3xl p-5 relative overflow-hidden">
                   <div className="flex gap-4">
                     {article.type === 'article' && article.imageUrl ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                          <img src={article.imageUrl} className="w-full h-full object-cover" />
                        </div>
                     ) : article.type === 'library' ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/30">
                           <LibraryIcon size={24} />
                        </div>
                     ) : article.type === 'city' ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                           <MapPin size={24} />
                        </div>
                     ) : (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
                           <Search className="opacity-50" />
                        </div>
                     )}
                     
                     <div className="flex-1">
                       <h3 className="text-white font-bold mb-1 leading-tight">{article.title}</h3>
                       <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed mb-3">{article.extract}</p>
                       
                       {article.type === 'article' && article.url && (
                         <a 
                           href={article.url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-full hover:bg-teal-500/20 transition-colors"
                         >
                           Read Article <ArrowRight size={12} />
                         </a>
                       )}
                       {article.type === 'library' && (
                          <button onClick={() => { haptic.light(); onClose(); }} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-fuchsia-400 bg-fuchsia-500/10 px-3 py-1.5 rounded-full hover:bg-fuchsia-500/20 transition-colors">
                             View Library (Map) <ArrowRight size={12} />
                          </button>
                       )}
                       {article.type === 'city' && (
                          <button onClick={() => { haptic.light(); onClose(); }} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition-colors">
                             Go to City <ArrowRight size={12} />
                          </button>
                       )}
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
