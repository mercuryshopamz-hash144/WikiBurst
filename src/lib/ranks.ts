export type PlayerRank = 'Knowledge Seeker' | 'Explorer' | 'City Lord' | 'National Sovereign' | 'Imperial Overlord';

export function getPlayerRank(level: number): PlayerRank {
  if (level >= 25) return 'Imperial Overlord';
  if (level >= 15) return 'National Sovereign';
  if (level >= 8) return 'City Lord';
  if (level >= 4) return 'Explorer';
  return 'Knowledge Seeker';
}

export function getRankHexColor(rank: PlayerRank): string {
  switch (rank) {
    case 'Imperial Overlord': return '#e879f9'; // fuchsia-400
    case 'National Sovereign': return '#fb7185'; // rose-400
    case 'City Lord': return '#fbbf24'; // amber-400
    case 'Explorer': return '#2dd4bf'; // teal-400
    case 'Knowledge Seeker': return '#a3a3a3'; // neutral-400
  }
}

export function getRankColor(rank: PlayerRank): string {
  switch (rank) {
    case 'Imperial Overlord': return 'text-fuchsia-400 border-fuchsia-400 bg-fuchsia-500/10 shadow-[0_0_15px_rgba(232,121,249,0.5)]';
    case 'National Sovereign': return 'text-rose-400 border-rose-400 bg-rose-500/10 shadow-[0_0_10px_rgba(251,113,133,0.3)]';
    case 'City Lord': return 'text-amber-400 border-amber-400 bg-amber-500/10';
    case 'Explorer': return 'text-teal-400 border-teal-400 bg-teal-500/10';
    case 'Knowledge Seeker': return 'text-neutral-400 border-neutral-400 bg-neutral-500/10';
  }
}
