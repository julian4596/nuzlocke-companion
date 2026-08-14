# Nuzlocke Companion Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement routing, fix PC storage grid/graveyard calculations, add manual badge tracking and auto-calculated deaths, improve Load Screen UI, and introduce Save File Auto-Reloading.

**Architecture:** Use `wouter` for lightweight routing. Refactor `App.tsx` into Route components. Update `GBASaveParser.ts` (and `App.tsx`) to dynamically identify the last box as the Graveyard and calculate deaths. Use `showOpenFilePicker` API in `SaveLoader` and `App` to poll `FileSystemFileHandle` for changes to the save file.

**Tech Stack:** React, TypeScript, TailwindCSS, wouter

## Global Constraints
- Commit each feature to `main` using standard commits.
- Ensure the app remains functional at each step.

---

### Task 1: Routing Implementation

**Files:**
- Modify: `package.json`
- Modify: `src/App.tsx`
- Modify: `src/components/Sidebar.tsx`

**Interfaces:**
- Produces: `wouter` routes wrapping the Start, Load, and Tracker views.

- [ ] **Step 1: Install `wouter`**
```bash
npm install wouter
```
- [ ] **Step 2: Update App.tsx with Routing**
Refactor `App.tsx` to use `<Route path="/">` for `StartScreen`, `<Route path="/load">` for `LoadGameScreen`, and `<Route path="/run/:id/:view?">` for the main tracker. Replace local `currentView` state with URL parameters using `useRoute` or `useParams`.

- [ ] **Step 3: Update Sidebar Links**
Modify `Sidebar.tsx` to use `wouter`'s `<Link>` component for changing views instead of calling `onViewChange` callbacks.

- [ ] **Step 4: Commit**
```bash
git add package.json package-lock.json src/App.tsx src/components/Sidebar.tsx
git commit -m "feat: implement routing with wouter"
```

---

### Task 2: PC Storage & Graveyard Dynamic Sizing and Death Calculation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/LoadGameScreen.tsx`

**Interfaces:**
- Consumes: `boxes` array from `parser.parseBoxes()`

- [ ] **Step 1: Fix Box Logic in App.tsx**
Update the rendering logic in `App.tsx` to compute PC storage and graveyard dynamically based on `boxes.length`.
```typescript
    if (currentView === 'boxes') {
      const allBoxData = boxes.slice(0, boxes.length - 1).flat();
      return <BoxView title={`PC Storage (Boxes 1-${boxes.length - 1})`} boxData={allBoxData} />;
    }

    if (currentView === 'graveyard') {
      const graveyardData = boxes[boxes.length - 1] || [];
      return <BoxView title={`💀 Graveyard (Box ${boxes.length})`} boxData={graveyardData} />;
    }
```

- [ ] **Step 2: Fix Death Calculation in LoadGameScreen**
In `handleImport`, calculate deaths dynamically by checking the last box.
```typescript
      const parsedBoxes = parser.parseBoxes(buffer);
      const graveyard = parsedBoxes[parsedBoxes.length - 1] || [];
      const deathsCount = graveyard.filter(p => p.speciesId && p.speciesId > 0).length;
      
      const newRun: SavedRun = {
        // ...
        deaths: deathsCount,
        // ...
      };
```

- [ ] **Step 3: Commit**
```bash
git add src/App.tsx src/components/LoadGameScreen.tsx
git commit -m "fix: dynamically size PC storage and calculate deaths from final box"
```

---

### Task 3: Manual Badge Tracking & Load Screen UI Improvements

**Files:**
- Modify: `src/components/LoadGameScreen.tsx`
- Modify: `src/lib/types.ts`
- Modify: `src/lib/db.ts`

**Interfaces:**
- Produces: Update badge functionality and extract action buttons.

- [ ] **Step 1: Add updateRun function to db.ts**
```typescript
export async function updateRun(id: string, updates: Partial<SavedRun>): Promise<void> {
  const runs = await getRuns();
  const index = runs.findIndex(r => r.id === id);
  if (index >= 0) {
    runs[index] = { ...runs[index], ...updates };
    await set(STORE_KEY, runs);
  }
}
```

- [ ] **Step 2: Update Run Card UI**
In `LoadGameScreen.tsx`, make the card body clickable to load the run.
Extract the Download and Delete buttons into a separate flex container aligned to the right, OUTSIDE the clickable load area.

- [ ] **Step 3: Add +/- Badge Buttons**
In the Run Card (or next to it), add small `+` and `-` buttons next to the Badge count. Wire them up to call `updateRun(run.id, { badges: newCount })` and re-fetch runs.

- [ ] **Step 4: Commit**
```bash
git add src/components/LoadGameScreen.tsx src/lib/db.ts
git commit -m "feat: add manual badge tracking and improve load screen UI"
```

---

### Task 4: Save File Auto-Reload

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/components/SaveLoader.tsx`
- Modify: `src/components/ImportSaveModal.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: File System Access API

- [ ] **Step 1: Update Types**
Add an optional `fileHandle?: any` (or `FileSystemFileHandle`) to the `SavedRun` type. 
*Note: FileSystemFileHandle cannot be stored in idb-keyval directly unless serialized, but for the current session we can keep it in memory or store it if supported.* For simplicity, we'll just track it in React state while the app is open.

- [ ] **Step 2: Update SaveLoader for File System API**
Update `SaveLoader` to optionally use `showOpenFilePicker`.
```typescript
  const handlePicker = async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'Save Files', accept: { '*/*': ['.sav', '.dsv'] } }]
        });
        const file = await handle.getFile();
        const buffer = await file.arrayBuffer();
        onFileLoad(buffer, file.name, handle);
      } catch (e) {
        // user cancelled or error
      }
    }
  };
```
Add a button for "Select Save File" that uses the picker if supported, falling back to the standard input.

- [ ] **Step 3: Setup Polling in App.tsx**
In `App.tsx`, when a run is loaded and a `fileHandle` is available in state, use `setInterval` (e.g. every 5 seconds) to call `handle.getFile()`, check if `file.lastModified` changed, and if so, re-read the `arrayBuffer` and call `handleLoadRun(updatedRun)`.

- [ ] **Step 4: Commit**
```bash
git add src/lib/types.ts src/components/SaveLoader.tsx src/components/ImportSaveModal.tsx src/App.tsx
git commit -m "feat: implement live save file auto-reload via file system access API"
```
