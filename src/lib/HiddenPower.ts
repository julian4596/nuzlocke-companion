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

export function calculateHiddenPowerPower(ivs: IVs): number {
  const u = (ivs.hp % 4 === 2 || ivs.hp % 4 === 3) ? 1 : 0;
  const v = (ivs.attack % 4 === 2 || ivs.attack % 4 === 3) ? 1 : 0;
  const w = (ivs.defense % 4 === 2 || ivs.defense % 4 === 3) ? 1 : 0;
  const x = (ivs.speed % 4 === 2 || ivs.speed % 4 === 3) ? 1 : 0;
  const y = (ivs.spAttack % 4 === 2 || ivs.spAttack % 4 === 3) ? 1 : 0;
  const z = (ivs.spDefense % 4 === 2 || ivs.spDefense % 4 === 3) ? 1 : 0;

  return Math.floor(((u + 2*v + 4*w + 8*x + 16*y + 32*z) * 40) / 63) + 30;
}
