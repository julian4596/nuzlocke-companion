# Nuzlocke Save Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation of a React PWA that reads a Pokémon Gen 3 (GBA) save file via the browser's File API and extracts the player's name and Party Pokémon.

**Architecture:** A Vite + React + TypeScript + Tailwind single-page app (PWA) with a modular binary parser (`GBASaveParser.ts`) that decrypts 128KB Gen 3 `.sav` arrays using DataView.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, vite-plugin-pwa, Vitest.

## Global Constraints

- Must work 100% offline via client-side processing.
- Must compile successfully under strict TypeScript (`tsc --noEmit`).
- Must pass all Vitest unit tests before proceeding to the next task.
- Must use standard HTML5 File input for loading `.sav` files.

---

### Task 1: Initialize Vite React TypeScript Project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `tailwind.config.js`, `postcss.config.js`, `src/index.css`
- Test: `tests/setup.ts`

**Interfaces:**
- Consumes: None
- Produces: A running Vite dev server and passing Vitest test harness.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/App.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  it('renders the title', () => {
    render(<App />);
    expect(screen.getByText('Nuzlocke Save Tracker')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL because Vite/React/Vitest are not set up and `App.tsx` does not exist.

- [ ] **Step 3: Write minimal implementation**

Execute `npx -y create-vite@latest . --template react-ts` (force-overwrite if needed, or scaffold manually).
Install Tailwind CSS, Vitest, React Testing Library.
Configure `tailwind.config.js` and `vite.config.ts`.
Create `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold">Nuzlocke Save Tracker</h1>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold Vite React TS project with Tailwind and Vitest"
```

---

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

Run: `npx vitest run`
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

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/GBASaveParser.ts tests/GBASaveParser.test.ts
git commit -m "feat: add basic GBA save parser skeleton"
```

---

### Task 3: Implement File Uploader UI

**Files:**
- Create: `src/components/SaveLoader.tsx`
- Modify: `src/App.tsx`
- Create: `tests/SaveLoader.test.tsx`

**Interfaces:**
- Consumes: HTML5 File API events.
- Produces: Passes loaded `ArrayBuffer` up to `App.tsx` state.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/SaveLoader.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SaveLoader from '../src/components/SaveLoader';

describe('SaveLoader', () => {
  it('renders a file input', () => {
    const onFileLoad = vi.fn();
    render(<SaveLoader onFileLoad={onFileLoad} />);
    const input = screen.getByLabelText(/Upload Save File/i);
    expect(input).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run`
Expected: FAIL due to missing `SaveLoader.tsx`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/SaveLoader.tsx
import React from 'react';

interface Props {
  onFileLoad: (buffer: ArrayBuffer) => void;
}

export default function SaveLoader({ onFileLoad }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      onFileLoad(buffer);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700">
      <label className="block text-sm font-medium text-gray-300 mb-2">Upload Save File (.sav)</label>
      <input 
        type="file" 
        accept=".sav,.dsv" 
        aria-label="Upload Save File"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" 
      />
    </div>
  );
}
```

Modify `src/App.tsx` to include `<SaveLoader />` and log the buffer size on load.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/SaveLoader.tsx tests/SaveLoader.test.tsx src/App.tsx
git commit -m "feat: add SaveLoader UI component for file uploading"
```
