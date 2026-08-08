import baseStatsData from '../data/baseStats.json';

interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
  growthRate: string;
}

export const NATURES = [
  { name: 'Hardy', up: null, down: null },
  { name: 'Lonely', up: 'atk', down: 'def' },
  { name: 'Brave', up: 'atk', down: 'spe' },
  { name: 'Adamant', up: 'atk', down: 'spa' },
  { name: 'Naughty', up: 'atk', down: 'spd' },
  
  { name: 'Bold', up: 'def', down: 'atk' },
  { name: 'Docile', up: null, down: null },
  { name: 'Relaxed', up: 'def', down: 'spe' },
  { name: 'Impish', up: 'def', down: 'spa' },
  { name: 'Lax', up: 'def', down: 'spd' },
  
  { name: 'Timid', up: 'spe', down: 'atk' },
  { name: 'Hasty', up: 'spe', down: 'def' },
  { name: 'Serious', up: null, down: null },
  { name: 'Jolly', up: 'spe', down: 'spa' },
  { name: 'Naive', up: 'spe', down: 'spd' },
  
  { name: 'Modest', up: 'spa', down: 'atk' },
  { name: 'Mild', up: 'spa', down: 'def' },
  { name: 'Quiet', up: 'spa', down: 'spe' },
  { name: 'Bashful', up: null, down: null },
  { name: 'Rash', up: 'spa', down: 'spd' },
  
  { name: 'Calm', up: 'spd', down: 'atk' },
  { name: 'Gentle', up: 'spd', down: 'def' },
  { name: 'Sassy', up: 'spd', down: 'spe' },
  { name: 'Careful', up: 'spd', down: 'spa' },
  { name: 'Quirky', up: null, down: null },
];

function getExpForLevel(level: number, growthRate: string): number {
  if (level <= 1) return 0;
  const n = level;
  switch (growthRate) {
    case 'fast': return Math.floor(0.8 * Math.pow(n, 3));
    case 'medium':
    case 'medium-fast': return Math.pow(n, 3);
    case 'medium-slow': return Math.floor(1.2 * Math.pow(n, 3) - 15 * Math.pow(n, 2) + 100 * n - 140);
    case 'slow': return Math.floor(1.25 * Math.pow(n, 3));
    case 'erratic': {
      if (n <= 50) return Math.floor((Math.pow(n, 3) * (100 - n)) / 50);
      if (n <= 68) return Math.floor((Math.pow(n, 3) * (150 - n)) / 100);
      if (n <= 98) return Math.floor((Math.pow(n, 3) * Math.floor((1911 - 10 * n) / 3)) / 500);
      return Math.floor((Math.pow(n, 3) * (160 - n)) / 100);
    }
    case 'fluctuating': {
      if (n <= 15) return Math.floor((Math.pow(n, 3) * (Math.floor((n + 1) / 3) + 24)) / 50);
      if (n <= 36) return Math.floor((Math.pow(n, 3) * (n + 14)) / 50);
      return Math.floor((Math.pow(n, 3) * (Math.floor(n / 2) + 32)) / 50);
    }
    default:
      return Math.pow(n, 3);
  }
}

export function calculateLevelFromExp(exp: number, growthRate: string): number {
  for (let lvl = 100; lvl >= 1; lvl--) {
    if (exp >= getExpForLevel(lvl, growthRate)) {
      return lvl;
    }
  }
  return 1;
}

export function calculateStats(
  speciesId: number, 
  exp: number, 
  natureIndex: number, 
  ivs: Record<string, number>, 
  evs: Record<string, number>
) {
  const base = (baseStatsData as any)[speciesId.toString()] as BaseStats;
  if (!base) return null;
  
  const level = calculateLevelFromExp(exp, base.growthRate);
  const nature = NATURES[natureIndex];
  
  const calcStat = (statName: keyof BaseStats) => {
    if (statName === 'hp') {
      return Math.floor((2 * base.hp + ivs.hp + Math.floor(evs.hp / 4)) * level / 100) + level + 10;
    }
    
    // For Attack, Defense, Speed, Sp. Attack and Sp. Defense, our EV/IV keys are slightly different
    let ivKey = statName as string;
    if (statName === 'atk') ivKey = 'attack';
    if (statName === 'def') ivKey = 'defense';
    if (statName === 'spe') ivKey = 'speed';
    if (statName === 'spa') ivKey = 'spAttack';
    if (statName === 'spd') ivKey = 'spDefense';
    
    const b = base[statName] as number;
    const iv = ivs[ivKey] as number;
    const ev = evs[ivKey] as number;
    
    let raw = Math.floor((2 * b + iv + Math.floor(ev / 4)) * level / 100) + 5;
    
    if (nature.up === statName) raw = Math.floor(raw * 1.1);
    if (nature.down === statName) raw = Math.floor(raw * 0.9);
    
    return raw;
  };
  
  return {
    level,
    nature: nature.name,
    hp: calcStat('hp'),
    maxHp: calcStat('hp'),
    atk: calcStat('atk'),
    def: calcStat('def'),
    spa: calcStat('spa'),
    spd: calcStat('spd'),
    spe: calcStat('spe'),
  };
}
