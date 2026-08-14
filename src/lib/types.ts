export interface SaveData {
  trainerName: string;
  gameVersion: string;
}

export interface Pokemon {
  pid: number;
  otid: number;
  speciesId?: number;
  level?: number;
  experience?: number;
  nature?: number;
  nickname?: string;
  isShiny?: boolean;
  abilityBit?: number;
  abilityId?: number;
  hp?: number;
  maxHp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  spAttack?: number;
  spDefense?: number;
  moves?: number[];
  pp?: number[];
  ivs?: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    spAttack: number;
    spDefense: number;
  };
  evs?: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    spAttack: number;
    spDefense: number;
  };
}

export interface SavedRun {
  id: string;
  name: string;
  gameVersion: string;
  badges: number;
  deaths: number;
  teamSprites: number[];
  saveBuffer: ArrayBuffer;
  lastPlayed: number;
  fileHandle?: any;
}
