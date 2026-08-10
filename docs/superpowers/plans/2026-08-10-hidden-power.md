# Hidden Power Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the calculated Hidden Power type of a Pokémon based on its IVs within the `PokemonCard` component.

**Architecture:** A new pure utility module `HiddenPower.ts` will parse IVs to calculate the type based on standard mechanics formulas. The `PokemonCard` component will import and display this type in a badge next to the IVs header.

**Tech Stack:** React, TypeScript, TailwindCSS

## Global Constraints

- No normal or fairy type for hidden power
- Layout must remain clean and responsive when badge is added
- The formula relies on even (0) and odd (1) IV values
- Must not crash if IVs are missing

---

### Task 1: Create Hidden Power Utility

**Files:**
- Create: `src/lib/HiddenPower.ts`
- Create: `src/lib/HiddenPower.test.ts`

**Interfaces:**
- Consumes: `{ hp: number, attack: number, defense: number, speed: number, spAttack: number, spDefense: number }`
- Produces: `calculateHiddenPower(ivs: { hp: number, attack: number, defense: number, speed: number, spAttack: number, spDefense: number }) -> string`

- [ ] **Step 1: Write the failing test**

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/HiddenPower.test.ts`
Expected: FAIL with module not found or function not defined

- [ ] **Step 3: Write minimal implementation**

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/HiddenPower.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/HiddenPower.ts src/lib/HiddenPower.test.ts
git commit -m "feat: add calculateHiddenPower utility"
```

### Task 2: Integrate into PokemonCard Component

**Files:**
- Modify: `src/components/PokemonCard.tsx`

**Interfaces:**
- Consumes: `calculateHiddenPower` from `src/lib/HiddenPower.ts`, `pkmn.ivs` from component props
- Produces: UI change

- [ ] **Step 1: Write the failing test**

*(We will skip component TDD here for simplicity, assuming visual verification is sufficient for this pure UI task)*

- [ ] **Step 2: Write implementation**

Modify `src/components/PokemonCard.tsx`:

1. Import the utility at the top:
```typescript
import { calculateHiddenPower } from '@/lib/HiddenPower';
```

2. Replace the IVs header block (around line 118):
```tsx
      {pkmn.ivs && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-gray-500 uppercase font-semibold">IVs</p>
            <span className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded">
              HP: {calculateHiddenPower(pkmn.ivs)}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1 text-[10px] text-center bg-gray-900 p-1.5 rounded-lg border border-gray-700">
```

- [ ] **Step 3: Run app to verify visual layout passes**

Run: `npm run dev` (if not already running)
Expected: Open the UI and visually confirm the new "HP: Type" badge next to the "IVs" label on any Pokémon with IVs.

- [ ] **Step 4: Commit**

```bash
git add src/components/PokemonCard.tsx
git commit -m "feat(ui): display hidden power type on pokemon card"
```
