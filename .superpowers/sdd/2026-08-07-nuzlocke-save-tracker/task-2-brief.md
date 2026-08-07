### Task 2: Implement Core GBA Save Parser Skeleton

**Files:**
- Create: `src/lib/GBASaveParser.ts`
- Create: `tests/GBASaveParser.test.ts`

**Interfaces:**
- Consumes: A loaded `ArrayBuffer` representing a `.sav` file.
- Produces: `GBASaveParser` class with a `parse(buffer: ArrayBuffer)` method returning a basic `SaveData` interface.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/GBASaveParser.test.ts
import { describe, it, expect } from 'vitest';
import { GBASaveParser } from '../src/lib/GBASaveParser';

describe('GBASaveParser', () => {
  it('should initialize and throw on invalid size', () => {
    const parser = new GBASaveParser();
    const badBuffer = new ArrayBuffer(100);
    expect(() => parser.parse(badBuffer)).toThrow('Invalid save file size');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/GBASaveParser.test.ts`
Expected: FAIL due to missing `GBASaveParser`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/GBASaveParser.ts
export interface SaveData {
  trainerName: string;
}

export class GBASaveParser {
  parse(buffer: ArrayBuffer): SaveData {
    if (buffer.byteLength !== 131072 && buffer.byteLength !== 65536) { // 128KB or 64KB
      throw new Error('Invalid save file size. Expected 64KB or 128KB GBA save.');
    }
    return { trainerName: "Player" }; // Stub for now
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/GBASaveParser.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/GBASaveParser.ts tests/GBASaveParser.test.ts
git commit -m "feat: add basic GBA save parser skeleton"
```
