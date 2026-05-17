export interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  tier: 1 | 2 | 3;
  theme: string;
  description: string;
  fact?: string;
}

export const CITIES: City[] = [
  { id: 'c1', name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, tier: 3, theme: 'Ottoman Majestic', description: 'The crossroad of continents, requires vast knowledge of its history.', fact: 'Istanbul is the only pan-continental city in the world that is situated on two continents, Europe and Asia. Founded as Byzantium in 660 BCE, it later became Constantinople, serving as the imperial capital for almost 16 centuries through the Roman/Byzantine, Latin, and Ottoman empires before the Turkish Republic moved its capital to Ankara. However, Istanbul remains the cultural and economic heart of Turkey.' },
  { id: 'c2', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, tier: 3, theme: 'Elegant Glass', description: 'The city of light, demanding artistic and historical expertise.', fact: 'There are exactly 1,665 steps to the top of the Eiffel Tower, but most visitors take the elevator. When Gustav Eiffel\'s company built the tower for the 1889 World\'s Fair, it was heavily criticized by leading artists and intellectuals, yet it survived and became a global cultural icon. Today, it is the most-visited paid monument in the world.' },
  { id: 'c3', name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, tier: 3, theme: 'Classical Roman', description: 'The eternal city, seat of an ancient empire.', fact: 'Rome has a sovereign state located entirely within its city limits: Vatican City.' },
  { id: 'c4', name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, tier: 3, theme: 'Art Deco', description: 'The city that never sleeps, a center of modern culture.', fact: 'The New York Public Library has over 50 million items, making it the second largest in the US.' },
  { id: 'c5', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, tier: 3, theme: 'Cyberpunk Minimal', description: 'A blend of hyper-modernity and ancient tradition.', fact: 'Tokyo was originally named Edo, which means "estuary". The name was changed to Tokyo in 1868.' },
  { id: 'c6', name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, tier: 3, theme: 'Ancient Egyptian', description: 'The cradle of civilization, home to the pharaohs.', fact: 'Cairo is known as the "city of a thousand minarets" for its preponderance of Islamic architecture.' },
  
  { id: 'c7', name: 'Izmir', country: 'Turkey', lat: 38.4237, lng: 27.1428, tier: 2, theme: 'Aegean Breeze', description: 'Pearl of the Aegean.', fact: 'One of the oldest continuously inhabited cities in the Mediterranean region, formally known as Smyrna.' },
  { id: 'c8', name: 'Lyon', country: 'France', lat: 45.7640, lng: 4.8357, tier: 2, theme: 'Renaissance', description: 'The gastronomic capital.', fact: 'Lyon was the capital of the Gauls during the Roman Empire.' },
  { id: 'c9', name: 'Naples', country: 'Italy', lat: 40.8518, lng: 14.2681, tier: 2, theme: 'Mediterranean', description: 'Rich in history and culture.', fact: 'The modern pizza was invented in Naples, specifically the Margherita.' },
  { id: 'c10', name: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298, tier: 2, theme: 'Industrial', description: 'The glowing heart of the midwest.', fact: 'The first ever Ferris wheel was built in Chicago for the 1893 World\'s Columbian Exposition.' },
  { id: 'c11', name: 'Kyoto', country: 'Japan', lat: 35.0116, lng: 135.7681, tier: 2, theme: 'Traditional Zen', description: 'The cultural capital.', fact: 'Kyoto has over 1,000 Buddhist temples and 400 Shinto shrines.' },
  
  { id: 'c12', name: 'Bursa', country: 'Turkey', lat: 40.1824, lng: 29.0669, tier: 1, theme: 'Green Ottoman', description: 'First major capital of the Ottoman State.', fact: 'Bursa is historically known as "Yeşil Bursa" (Green Bursa) due to its beautiful parks and gardens.' },
  { id: 'c13', name: 'Marseille', country: 'France', lat: 43.2965, lng: 5.3698, tier: 1, theme: 'Coastal', description: 'A historic port city.', fact: 'Marseille is the oldest city in France, founded by Greek mariners in 600 BC.' },
  { id: 'c14', name: 'Florence', country: 'Italy', lat: 43.7696, lng: 11.2558, tier: 1, theme: 'Renaissance Core', description: 'Birthplace of the Renaissance.', fact: 'During the 14th century, Florence became the birthplace of the Renaissance, which spread globally.' },
];
