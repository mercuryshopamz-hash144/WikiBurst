import * as idb from 'idb-keyval';

export interface WikiArticle {
  id: number;
  title: string;
  extract: string;
  imageUrl?: string;
  url: string;
  readTimeEstimate: number;
  category?: string;
  partIndex?: number;
  totalParts?: number;
  rarity?: 'common' | 'rare' | 'epic';
}

const WIKI_CACHE_KEY = 'wikiburst_offline_cache';

export async function fetchRandomArticles(count = 10, topicWeights?: Record<string, number>, lang = 'en'): Promise<WikiArticle[]> {
  try {
    const promises = Array.from({ length: count * 2 }).map(() => fetchSingleRandomArticle(lang));
    const results = await Promise.allSettled(promises);
    
    let validArticles = results
      .filter((r): r is PromiseFulfilledResult<WikiArticle | null> => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value as WikiArticle);
      
    // Remove duplicates
    const uniqueIds = new Set();
    validArticles = validArticles.filter(a => {
      if (uniqueIds.has(a.id)) return false;
      uniqueIds.add(a.id);
      return true;
    });

    if (topicWeights && Object.keys(topicWeights).length > 0) {
       const scoredArticles = validArticles.map(article => {
         const score = Math.random(); // Add basic random score for now as REST API categories are sometimes sparse
         return { article, score };
       });
       scoredArticles.sort((a, b) => b.score - a.score);
       validArticles = scoredArticles.map(item => item.article);
    }
    
    const finalArticles = validArticles.slice(0, count);
    
    // Cache for offline
    if (finalArticles.length > 0) {
      idb.set(WIKI_CACHE_KEY, finalArticles).catch(() => {});
    }
    
    return finalArticles;
  } catch (error) {
    console.error('Failed to fetch Wikipedia articles:', error);
    // Offline fallback
    try {
      const cached = await idb.get<WikiArticle[]>(WIKI_CACHE_KEY);
      if (cached && cached.length > 0) return cached;
    } catch(e) {}
    
    return [];
  }
}

const REGIONAL_QUERIES: Record<string, string[]> = {
  tr: ["Türkiye gizli tarihi", "Göktürkler", "Anadolu medeniyetleri", "Osmanlı'nın bilinmeyen", "Türk mitolojisi efsaneleri", "Türk icatları", "Unutulmuş Türkler", "Türk destanları", "Anadolu efsaneleri", "Türk halk bilim", "Şaşırtıcı tarihi olaylar", "Selçuklu", "Göbeklitepe", "Mimar Sinan eserleri gizemi"],
  es: ["Historia de España oculta", "Mitología de España", "Imperio español misterios", "Misterios de América Latina", "Culturas precolombinas olvidadas", "Inventos españoles", "Leyendas españolas", "Personajes históricos olvidados", "Al-Ándalus", "Civilización maya secretos", "Incas", "Aztecas"],
  en: ["Unsolved historical mysteries", "Obscure ancient civilizations", "Forgotten historical figures", "Weird history", "Lost cities", "Little known historical facts", "Ancient myths and legends", "Unusual geographical features", "Historical secret societies", "Bizarre events in history", "Fascinating natural phenomena", "Rare artifacts", "Origins of words"]
};

async function fetchSingleRandomArticle(lang: string): Promise<WikiArticle | null> {
  const applyRegionalFilter = Math.random() < 0.7; // increased for more regional content
  let data: any = null;

  if (applyRegionalFilter) {
     const queries = REGIONAL_QUERIES[lang] || REGIONAL_QUERIES['en'];
     const query = queries[Math.floor(Math.random() * queries.length)];
     try {
        const searchRes = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*&srlimit=50`);
        if (searchRes.ok) {
           const searchData = await searchRes.json();
           const searchResults = searchData.query?.search || [];
           if (searchResults.length > 0) {
              const selectedItem = searchResults[Math.floor(Math.random() * searchResults.length)];
              const detailRes = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(selectedItem.title)}`);
              if (detailRes.ok) {
                 data = await detailRes.json();
              }
           }
        }
     } catch (err) {
        console.warn("Regional fetch failed", err);
     }
  }

  // Fallback if regional fetch failed or didn't run
  if (!data || data.type === 'disambiguation') {
    const generalQueries: Record<string, string[]> = {
      en: ["Unsolved mysteries", "Ancient inventions", "Lost civilizations", "Fascinating history", "Obscure science facts", "Legendary mythical creatures", "World wonders", "Unusual geography", "Forgotten historical events", "Space exploration history", "Deep sea discoveries"],
      tr: ["Çözülememiş gizemler", "Antik icatlar", "Kayıp uygarlıklar", "İlginç tarih", "Bilinmeyen bilimsel gerçekler", "Efsanevi mitolojik yaratıklar", "Dünya harikaları", "Sıradışı coğrafya", "Unutulmuş tarihi olaylar", "Uzay keşif tarihi", "Derin deniz keşifleri"],
      es: ["Misterios sin resolver", "Inventos antiguos", "Civilizaciones perdidas", "Historia fascinante", "Datos científicos oscuros", "Criaturas míticas legendarias", "Maravillas del mundo", "Geografía inusual", "Eventos históricos olvidados", "Historia de exploración espacial", "Descubrimientos en aguas profundas"]
    };
    const fallbackQueriesList = generalQueries[lang] || generalQueries['en'];
    const fallbackQuery = fallbackQueriesList[Math.floor(Math.random() * fallbackQueriesList.length)];
    try {
      const searchRes = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(fallbackQuery)}&utf8=&format=json&origin=*&srlimit=50`);
      if (searchRes.ok) {
         const searchData = await searchRes.json();
         const searchResults = searchData.query?.search || [];
         if (searchResults.length > 0) {
            const selectedItem = searchResults[Math.floor(Math.random() * searchResults.length)];
            const detailRes = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(selectedItem.title)}`);
            if (detailRes.ok) {
               data = await detailRes.json();
            }
         }
      }
    } catch(err) {
      console.warn("Fallback query failed", err);
    }
  }

  // Truly random fallback
  if (!data || data.type === 'disambiguation') {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`;
    const res = await fetch(url);
    if (!res.ok) return null;
    data = await res.json();
  }
  
  if (!data.extract || data.extract.length < 150) return null; // Skip stubs
  if (data.type === 'disambiguation') return null;

  // CENSORSHIP: Remove certain topics as per request
  const textStr = (data.title + " " + data.extract).toLowerCase();
  const bannedTerms = ['israel', 'israil', 'zionis', 'tel aviv', 'jerusalem', 'kudüs', 'idf', 'mossad'];
  if (bannedTerms.some(term => textStr.includes(term))) {
    return null;
  }

  // QUALITY: Filter out generic unpopular biographies
  const lowQualityTerms = ['footballer', 'cricketer', 'athlete', 'basketball player', 'futbolcu', 'basketbolcu', 'baseball player'];
  if (lowQualityTerms.some(term => textStr.includes(term))) {
    return null;
  }

  const wpm = 200;
  let readTime = Math.ceil(data.extract.split(' ').length / wpm);
  if (readTime < 1) readTime = 1;

  let category = 'General';
  if (data.description && typeof data.description === 'string') {
    const desc = data.description.toLowerCase();
    if (desc.includes('history') || desc.includes('century') || desc.includes('ancient')) category = 'History';
    else if (desc.includes('science') || desc.includes('physic') || desc.includes('biolog') || desc.includes('chemist')) category = 'Science';
    else if (desc.includes('technology') || desc.includes('software') || desc.includes('computing') || desc.includes('artificial intelligence')) category = 'Technology';
    else if (desc.includes('actor') || desc.includes('politician') || desc.includes('writer') || desc.includes('musician')) category = 'Biography';
    else if (desc.includes('city') || desc.includes('country') || desc.includes('river') || desc.includes('mountain')) category = 'Geography';
    else if (desc.includes('psycholog') || desc.includes('behavio') || desc.includes('mental')) category = 'Psychology';
    else if (desc.includes('econo') || desc.includes('financ') || desc.includes('business')) category = 'Economics';
    else if (desc.includes('space') || desc.includes('astronomy') || desc.includes('planet')) category = 'Space Exploration';
    else if (desc.includes('art') || desc.includes('paint') || desc.includes('sculpt')) category = 'Arts';
    else if (desc.includes('myth') || desc.includes('legend') || desc.includes('deity') || desc.includes('god')) category = 'Origins & Myths';
  }

  // Fallback to testing extract for category if it's still General
  if (category === 'General' && data.extract) {
    const text = data.extract.toLowerCase();
    if (text.includes('21st century') || text.includes('modern era') || text.includes('recent') || text.includes('contemporary')) category = "Today's World";
    else if (text.includes('mythology') || text.includes('origin of')) category = 'Origins & Myths';
  }

  const randomVal = Math.random();
  let rarity: 'common' | 'rare' | 'epic' = 'common';
  if (randomVal > 0.95) rarity = 'epic'; // 5% chance
  else if (randomVal > 0.75) rarity = 'rare'; // 20% chance

  return {
    id: data.pageid || Math.random(),
    title: data.title,
    extract: data.extract,
    imageUrl: data.thumbnail?.source,
    url: data.desktop?.page || data.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
    readTimeEstimate: readTime,
    category,
    rarity
  };
}
