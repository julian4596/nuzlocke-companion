# Gen 5 Save Parsing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the save parser architecture to support multiple generations and implement Gen 5 (Black/White, Black 2/White 2) save parsing.

**Architecture:** We will extract common interfaces to `types.ts`, create a `BaseSaveParser` abstract class, and build a `SaveManager` factory to route save buffers to the correct parser. Then we'll build the `Gen5SaveParser` for NDS saves.

**Tech Stack:** TypeScript, React, Vite, Vitest

## Global Constraints

- Must use ES modules and TypeScript.
- Gen 5 saves are 524,288 bytes (512 KB) exactly.

---

### Task 1: Extract Shared Types

**Files:**
- Create: `src/lib/types.ts`
- Modify: `src/lib/GBASaveParser.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `SaveData` and `Pokemon` interfaces in `src/lib/types.ts`

- [ ] **Step 1: Write the types definition**

```typescript
// src/lib/types.ts
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
  abilityBit?: number;
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
```

- [ ] **Step 2: Refactor GBASaveParser to use extracted types**

Remove `SaveData` and `Pokemon` interfaces from `src/lib/GBASaveParser.ts` and add:
```typescript
import { SaveData, Pokemon } from './types';
```

- [ ] **Step 3: Refactor App.tsx to use extracted types**

Update import in `src/App.tsx`:
```typescript
import { GBASaveParser } from '@/lib/GBASaveParser';
import { Pokemon } from '@/lib/types';
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS without errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/GBASaveParser.ts src/App.tsx
git commit -m "refactor: extract SaveData and Pokemon types"
```

---

### Task 2: Create BaseSaveParser

**Files:**
- Create: `src/lib/BaseSaveParser.ts`
- Modify: `src/lib/GBASaveParser.ts`

**Interfaces:**
- Consumes: `SaveData`, `Pokemon` from `types.ts`
- Produces: `BaseSaveParser` abstract class

- [ ] **Step 1: Create BaseSaveParser.ts**

```typescript
// src/lib/BaseSaveParser.ts
import { SaveData, Pokemon } from './types';

export abstract class BaseSaveParser {
  abstract parse(buffer: ArrayBuffer): SaveData;
  abstract parseTeam(buffer: ArrayBuffer): Pokemon[];
  abstract parseBoxes(buffer: ArrayBuffer): Pokemon[][];
}
```

- [ ] **Step 2: Refactor GBASaveParser to extend BaseSaveParser**

Modify `src/lib/GBASaveParser.ts`:
```typescript
import { BaseSaveParser } from './BaseSaveParser';
// ...
export class GBASaveParser extends BaseSaveParser {
// ...
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/BaseSaveParser.ts src/lib/GBASaveParser.ts
git commit -m "feat: create BaseSaveParser"
```

---

### Task 3: Create SaveManager

**Files:**
- Create: `src/lib/SaveManager.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `BaseSaveParser`, `GBASaveParser`
- Produces: `SaveManager.getParser(buffer: ArrayBuffer): BaseSaveParser`

- [ ] **Step 1: Create SaveManager.ts**

```typescript
// src/lib/SaveManager.ts
import { BaseSaveParser } from './BaseSaveParser';
import { GBASaveParser } from './GBASaveParser';
// import { Gen5SaveParser } from './Gen5SaveParser'; // To be added in Task 4

export class SaveManager {
  static getParser(buffer: ArrayBuffer): BaseSaveParser {
    // 524288 bytes is exactly 512KB (Gen 5 NDS saves)
    if (buffer.byteLength === 524288) {
       throw new Error("Gen 5 parser not yet implemented");
    }
    
    // Default to GBA parser for everything else
    // GBASaveParser handles its own size validation
    return new GBASaveParser();
  }
}
```

- [ ] **Step 2: Refactor App.tsx to use SaveManager**

Modify `src/App.tsx`:
```typescript
// Remove GBASaveParser import
import { SaveManager } from '@/lib/SaveManager';

// Inside handleFileLoad:
// const parser = new GBASaveParser(); -> const parser = SaveManager.getParser(buffer);
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/SaveManager.ts src/App.tsx
git commit -m "feat: implement SaveManager factory"
```

---

### Task 4: Implement Gen5SaveParser

**Files:**
- Create: `src/lib/Gen5SaveParser.ts`
- Modify: `src/lib/SaveManager.ts`

**Interfaces:**
- Consumes: `BaseSaveParser`, `types.ts`
- Produces: `Gen5SaveParser` implementation

- [ ] **Step 1: Create Gen5SaveParser skeleton**

```typescript
// src/lib/Gen5SaveParser.ts
import { BaseSaveParser } from './BaseSaveParser';
import { SaveData, Pokemon } from './types';

export class Gen5SaveParser extends BaseSaveParser {
  private detectGameVersion(buffer: ArrayBuffer): string {
    // Basic heuristic: check if B2W2 offsets exist, else assume BW
    return 'Black/White';
  }

  parse(buffer: ArrayBuffer): SaveData {
    return { trainerName: 'Player', gameVersion: this.detectGameVersion(buffer) };
  }

  parseTeam(buffer: ArrayBuffer): Pokemon[] {
    // Returning empty array until full LCRNG decryption is implemented
    return [];
  }

  parseBoxes(buffer: ArrayBuffer): Pokemon[][] {
    return Array.from({ length: 24 }, () => []);
  }
}
```

- [ ] **Step 2: Update SaveManager to use Gen5SaveParser**

Modify `src/lib/SaveManager.ts`:
```typescript
import { BaseSaveParser } from './BaseSaveParser';
import { GBASaveParser } from './GBASaveParser';
import { Gen5SaveParser } from './Gen5SaveParser';

export class SaveManager {
  static getParser(buffer: ArrayBuffer): BaseSaveParser {
    if (buffer.byteLength === 524288) {
       return new Gen5SaveParser();
    }
    return new GBASaveParser();
  }
}
```

- [ ] **Step 3: Implement Gen 5 LCRNG and Parsing logic**

*(Note: The implementer will need to expand `Gen5SaveParser.ts` with the actual block offsets, LCRNG decryption, and struct mapping for Gen 5. This requires reading the PRNG seed from the Pokemon block checksum and unshuffling the substructures. For this plan step, we assume the implementer has access to Gen 5 save structure docs or will research it during execution.)*

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/Gen5SaveParser.ts src/lib/SaveManager.ts
git commit -m "feat: implement Gen5SaveParser"
```
