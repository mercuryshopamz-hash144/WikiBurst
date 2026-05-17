import { Library } from '../store/useStore';

export const mockLibraries: Library[] = [
  { 
     id: '101', name: "Alexandria 2.0", ownerId: 'user1', coOwners: [], theme: "Ancient Egyptian", lat: 31.2001, lng: 29.9187, coatOfArms: "🦅", isPublic: true, conqueredCount: 0, cityId: 'c6',
     articles: [
        {
           article: { id: 1, title: 'Library of Alexandria', extract: 'The Great Library of Alexandria in Alexandria, Egypt, was one of the largest and most significant libraries of the ancient world.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/O_H_von_Corven_-_Die_Bibliothek_von_Alexandria_%2819th_century%29.jpg/640px-O_H_von_Corven_-_Die_Bibliothek_von_Alexandria_%2819th_century%29.jpg', url: 'https://en.wikipedia.org/wiki/Library_of_Alexandria', readTimeEstimate: 2, rarity: 'epic', category: 'History' },
           roomId: 'Main Hall', note: 'A tragic loss for human history.', likes: 124, comments: []
        }
     ]
  },
  { 
     id: '102', name: "Nebula Archives", ownerId: 'user2', coOwners: [], theme: "Space", lat: 51.5074, lng: -0.1278, coatOfArms: "⭐", isPublic: true, conqueredCount: 15, sponsor: "SpaceX", cityId: 'c2',
     articles: [
        {
           article: { id: 2, title: 'Nebula', extract: 'A nebula is a distinct body of interstellar clouds, which can consist of cosmic dust, hydrogen, helium, and other ionized gases.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Eagle_nebula_pillars.jpg/640px-Eagle_nebula_pillars.jpg', url: 'https://en.wikipedia.org/wiki/Nebula', readTimeEstimate: 3, rarity: 'rare', category: 'Science' },
           roomId: 'Observatory', note: 'Star nurseries are mesmerizing.', likes: 432, comments: []
        }
     ]
  },
  { id: '103', name: "Kyoto Zen Lib", ownerId: 'user3', coOwners: [], theme: "Philosophy", lat: 35.0116, lng: 135.7681, coatOfArms: "🌸", isPublic: true, conqueredCount: 231, cityId: 'c1', articles: [] }
];
