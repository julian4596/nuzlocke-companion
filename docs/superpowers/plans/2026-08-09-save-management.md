# Save Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement persistent save file storage using IndexedDB and build full-screen UI views (Start Screen, Load Game Screen) to manage these saves.

**Architecture:** We will use `idb-keyval` to interact with IndexedDB for storing an array of `SavedRun` objects. The UI will introduce new top-level components that act as a router before the main companion app loads.

**Tech Stack:** React, Tailwind CSS, `idb-keyval`, `lucide-react` (for icons)

## Global Constraints

- Must work entirely in the browser (IndexedDB).
- Save files (ArrayBuffers) must be persisted and loaded reliably.
- Match the visual aesthetics of the provided screenshots.

---

### Task 1: Setup & Storage Layer

**Files:**
- Modify: `package.json`
- Modify: `src/lib/types.ts`
- Create: `src/lib/db.ts`

**Interfaces:**
- Consumes: N/A
- Produces: `export interface SavedRun`, `export const getRuns: () => Promise<SavedRun[]>`, `export const saveRun: (run: SavedRun) => Promise<void>`, `export const deleteRun: (id: string) => Promise<void>`

- [ ] **Step 1: Install dependencies**

Run: `npm install idb-keyval lucide-react`

- [ ] **Step 2: Add SavedRun type**

Add to `src/lib/types.ts`:
```typescript
export interface SavedRun {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  gameVersion: string;
  badges: number;
  deaths: number;
  teamSprites: number[];
  saveBuffer: ArrayBuffer;
  lastPlayed: number;
}
```

- [ ] **Step 3: Implement DB utilities**

Create `src/lib/db.ts`:
```typescript
import { get, set } from 'idb-keyval';
import { SavedRun } from './types';

const STORE_KEY = 'nuzlocke_runs';

export async function getRuns(): Promise<SavedRun[]> {
  const runs = await get<SavedRun[]>(STORE_KEY);
  return runs || [];
}

export async function saveRun(run: SavedRun): Promise<void> {
  const runs = await getRuns();
  const existingIndex = runs.findIndex(r => r.id === run.id);
  
  if (existingIndex >= 0) {
    runs[existingIndex] = run;
  } else {
    runs.push(run);
  }
  
  await set(STORE_KEY, runs);
}

export async function deleteRun(id: string): Promise<void> {
  let runs = await getRuns();
  runs = runs.filter(r => r.id !== id);
  await set(STORE_KEY, runs);
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/types.ts src/lib/db.ts
git commit -m "feat: add indexeddb storage layer for save files"
```

---

### Task 2: Import Save Modal

**Files:**
- Create: `src/components/ImportSaveModal.tsx`

**Interfaces:**
- Consumes: `SaveLoader.tsx`
- Produces: `export default function ImportSaveModal(props: { isOpen: boolean; onClose: () => void; onImport: (name: string, startDate: string, endDate: string, buffer: ArrayBuffer) => void })`

- [ ] **Step 1: Implement ImportSaveModal**

Create `src/components/ImportSaveModal.tsx`. This modal will wrap the existing `SaveLoader` logic but ask for the run name and dates once a file is selected. 
- State variables for `name`, `startDate`, `endDate`, and `saveBuffer`.
- If `saveBuffer` is null, show `<SaveLoader onFileLoad={(buffer) => setSaveBuffer(buffer)} />`.
- If `saveBuffer` is set, show a form with inputs for Name, Start Date, and End Date, and a "Save" button to trigger `onImport`.

- [ ] **Step 2: Commit**

```bash
git add src/components/ImportSaveModal.tsx
git commit -m "feat: create import save modal"
```

---

### Task 3: Load Game Screen

**Files:**
- Create: `src/components/LoadGameScreen.tsx`

**Interfaces:**
- Consumes: `SavedRun` from `src/lib/types.ts`, `getRuns`, `deleteRun`, `saveRun` from `src/lib/db.ts`, `ImportSaveModal.tsx`
- Produces: `export default function LoadGameScreen(props: { onBack: () => void; onLoadRun: (run: SavedRun) => void })`

- [ ] **Step 1: Implement LoadGameScreen component**

Create `src/components/LoadGameScreen.tsx`.
- Fetch `runs` from `getRuns` on mount.
- Display a list of runs matching the screenshot (Title, dates, badge/death counts, pokemon sprites, delete/download/load buttons).
- Use `lucide-react` icons for buttons (Trash2, Download, Play/ArrowRight).
- When "Import saved game" is clicked, open `ImportSaveModal`.
- On `ImportSaveModal` submit, parse the buffer (to get gameVersion, badges, deaths, team sprites), create a `SavedRun` object, call `saveRun`, and refresh the list.
- When download button is clicked, create a blob from `run.saveBuffer` and trigger download.
- When load button is clicked, call `onLoadRun(run)`.

- [ ] **Step 2: Commit**

```bash
git add src/components/LoadGameScreen.tsx
git commit -m "feat: build load game screen"
```

---

### Task 4: Start Screen

**Files:**
- Create: `src/components/StartScreen.tsx`

**Interfaces:**
- Consumes: `SavedRun` from `src/lib/types.ts`
- Produces: `export default function StartScreen(props: { mostRecentRun: SavedRun | null; onContinue: () => void; onLoadGameClick: () => void })`

- [ ] **Step 1: Implement StartScreen component**

Create `src/components/StartScreen.tsx`.
- Dark background layout.
- "Pokémon NUZLOCKE tracker" logo.
- Menu options:
  - "Continue": Displayed if `mostRecentRun` exists. Shows run name, badges, deaths, and team sprite snippet. Calls `onContinue`.
  - "New Game": Just a disabled/dummy button for now, or triggers load game.
  - "Load Game": Calls `onLoadGameClick`.

- [ ] **Step 2: Commit**

```bash
git add src/components/StartScreen.tsx
git commit -m "feat: create start screen component"
```

---

### Task 5: Root App Routing

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `StartScreen`, `LoadGameScreen`, `getRuns`, `saveRun`, `SavedRun`
- Produces: Updated application entry point managing top-level views.

- [ ] **Step 1: Update App.tsx state and logic**

Modify `src/App.tsx`:
- Add state `topView` ('start' | 'load' | 'app'). Default to 'start'.
- Add state `runs: SavedRun[]` and `activeRun: SavedRun | null`.
- On mount, fetch runs via `getRuns()` and set them.
- If `topView === 'start'`, render `<StartScreen />`.
- If `topView === 'load'`, render `<LoadGameScreen />`.
- If `topView === 'app'`, render the existing `Sidebar` + `main` content.
- When a run is loaded (from StartScreen Continue or LoadGameScreen Load button):
  - Parse the save buffer again to populate `team` and `boxes` (or do it efficiently).
  - Update the `activeRun`'s `lastPlayed` timestamp, save it via `saveRun`, and set `topView('app')`.

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate new start and load game screens into app routing"
```
