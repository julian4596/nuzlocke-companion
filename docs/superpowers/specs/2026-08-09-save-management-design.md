# Save Management Design

## Overview
Currently, the Nuzlocke Companion only supports uploading a single save file, which is lost upon refreshing the page. We will implement a persistent storage solution using IndexedDB to store save files. This enables users to manage multiple runs, continue their last run, and see a list of imported saves.

## Architecture & Storage
- **IndexedDB**: We will use `idb-keyval` (or a similar lightweight wrapper) to interact with IndexedDB to store an array of `SavedRun` objects.
- **Data Model**:
  ```typescript
  interface SavedRun {
    id: string;
    name: string; // e.g. "Blaze Black Nuzlocke"
    startDate: string; // e.g. "30th of July"
    endDate: string; // e.g. "9th of August" or "Present"
    gameVersion: string; 
    badges: number; // Derived or manually tracked, maybe mocked for now based on save parser if possible
    deaths: number; // Derived from graveyard box if possible
    teamSprites: number[]; // Array of Pokemon IDs to display sprites
    saveBuffer: ArrayBuffer;
    lastPlayed: number; // Timestamp
  }
  ```

## UI Components
1. **Start Screen (`StartScreen.tsx`)**:
   - The initial view when the app loads.
   - Shows "Pokémon NUZLOCKE tracker".
   - "Continue" button: Loads the most recently played run (if any). Displays metadata (name, badges, deaths, team sprites).
   - "New Game" button: Might just redirect to load/create if we don't have a new game flow yet.
   - "Load Game" button: Opens the `LoadGameScreen`.

2. **Load Game Screen (`LoadGameScreen.tsx`)**:
   - Lists all saved runs with their names, dates, game version logos, and team sprites.
   - For each run, provides options to delete, export (download `.sav`), and load.
   - "Import saved game" button: Prompts the user to select a `.sav` file. Once selected, opens a modal to input `Run Name` and `Date Range`.
   - "Create game" button: TBD, possibly a future feature to start a run without a save file.

3. **Import Modal (`ImportSaveModal.tsx`)**:
   - A modal dialog that appears after a file is selected.
   - Fields: Run Name (text), Start Date, End Date.
   - On submit, saves the parsed run into IndexedDB and updates the list.

## Data Flow
1. App loads -> Fetches saved runs from IndexedDB.
2. If runs exist, `App.tsx` renders `StartScreen`. If none, maybe renders `StartScreen` with disabled "Continue".
3. User clicks "Load Game" -> Renders `LoadGameScreen`.
4. User clicks "Import saved game" -> Native file picker -> `ImportSaveModal` -> Save to DB -> List updates.
5. User clicks "Load" on a run or "Continue" on Start Screen -> Reads `saveBuffer` -> Parses it -> Updates `App.tsx` state (`team`, `boxes`, `currentView` to 'party').

## Open Questions & Future Considerations
- Badge and Death tracking: Currently the parser gives us `team` and `boxes`. We can count deaths from Box 14. Badges might require new parser logic or we default to 0 for now until implemented.
- We will need to install `idb-keyval` for IndexedDB interactions.
