import { expect, test, describe, it } from 'vitest';
import { calculateHiddenPower, calculateHiddenPowerPower } from './HiddenPower';

describe('Hidden Power Calculation', () => {
  test('Calculates Dark type for all 31 IVs', () => {
    const ivs = { hp: 31, attack: 31, defense: 31, speed: 31, spAttack: 31, spDefense: 31 };
    expect(calculateHiddenPower(ivs)).toBe('Dark');
  });

  test('Calculates Ground type for common spread (31/31/31/30/30/31)', () => {
    const ivs = { hp: 31, attack: 31, defense: 31, spAttack: 30, spDefense: 30, speed: 31 };
    expect(calculateHiddenPower(ivs)).toBe('Ground');
  });

  describe('calculateHiddenPowerPower', () => {
    it('should calculate 70 power correctly (all 31 IVs)', () => {
      const ivs = { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 };
      expect(calculateHiddenPowerPower(ivs)).toBe(70);
    });

    it('should calculate 30 power correctly (all 0 IVs)', () => {
      const ivs = { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
      expect(calculateHiddenPowerPower(ivs)).toBe(30);
    });
  });
});
