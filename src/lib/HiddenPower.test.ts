import { expect, test, describe } from 'vitest';
import { calculateHiddenPower } from './HiddenPower';

describe('Hidden Power Calculation', () => {
  test('Calculates Dark type for all 31 IVs', () => {
    const ivs = { hp: 31, attack: 31, defense: 31, speed: 31, spAttack: 31, spDefense: 31 };
    expect(calculateHiddenPower(ivs)).toBe('Dark');
  });

  test('Calculates Ground type for common spread (31/31/31/30/30/31)', () => {
    const ivs = { hp: 31, attack: 31, defense: 31, spAttack: 30, spDefense: 30, speed: 31 };
    expect(calculateHiddenPower(ivs)).toBe('Ground');
  });
});
