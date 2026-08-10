const TYPES = [
  'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel',
  'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark'
];

interface IVs {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
}

export function calculateHiddenPower(ivs: IVs): string {
  const a = ivs.hp % 2;
  const b = ivs.attack % 2;
  const c = ivs.defense % 2;
  const d = ivs.speed % 2;
  const e = ivs.spAttack % 2;
  const f = ivs.spDefense % 2;

  const typeIndex = Math.floor(((a + 2*b + 4*c + 8*d + 16*e + 32*f) * 15) / 63);
  
  return TYPES[typeIndex];
}
