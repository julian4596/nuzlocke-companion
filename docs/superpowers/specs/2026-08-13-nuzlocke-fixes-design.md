# Nuzlocke Companion Improvements

## 1. PC Storage & Graveyard Dynamic Sizing
**Problem**: The app currently hardcodes PC storage to indices 0-12 (Boxes 1-13) and the Graveyard to index 13 (Box 14). This breaks on games like Gen 5 which have 24 boxes, causing missing Pokémon.
**Solution**: 
- Calculate the total number of boxes dynamically based on the parsed data (`boxes.length`).
- The "Graveyard" (Death Box) will always be the **last available box** (`boxes[boxes.length - 1]`).
- The "PC Storage" view will render all other boxes (`boxes.slice(0, boxes.length - 1).flat()`) dumped into a single unified grid, as requested.

## 2. Badges & Deaths Tracking
**Problem**: Badges and deaths are not currently tracking or updating correctly in the Run Card.
**Solution**:
- **Deaths**: Automatically calculated by counting the number of valid Pokémon (species ID > 0) present in the Graveyard box.
- **Badges**: Since badge event flags vary wildly between games and ROM hacks, we will add manual `+` and `-` buttons on the Load Game screen (or Sidebar) to let the user increment/decrement their badge count safely. This value will persist in the `SavedRun` database.

## 3. Save File Auto-Reload
**Problem**: Users have to manually re-import their save file every time they make progress.
**Solution**: 
- Utilize the **File System Access API** (`showOpenFilePicker`).
- When importing a save, the app retains a `FileSystemFileHandle`. 
- The app sets up a background polling interval (e.g., every 3 seconds) to check if the file's `lastModified` timestamp has changed. If the emulator writes to the save, the app will automatically re-read the ArrayBuffer and update the React state in real-time.

## 4. Load Game Screen UI
**Problem**: Clicking the card to load is unintuitive, and action buttons are too easily misclicked.
**Solution**:
- Make the entire Run Card a clickable element that triggers the game load.
- Extract the "Download" and "Delete" buttons and place them outside of the main clickable card area (e.g., aligned to the far right or below the card).

## 5. Routing Implementation
**Problem**: The app currently uses local state (`topView` and `currentView`) to manage navigation, which breaks the browser's back button and makes URLs unshareable.
**Solution**:
- Install `react-router-dom`.
- Define standard routes:
  - `/` -> Start Screen
  - `/load` -> Load Game Screen
  - `/run/:id` -> Layout Wrapper for a specific run
  - `/run/:id/party` -> Party View
  - `/run/:id/pc` -> PC Storage
  - `/run/:id/graveyard` -> Graveyard
- Migrate existing view states into the Router layout.

## Implementation Plan
I will group these changes logically into separate branches/commits:
1. `feature/routing`: Install react-router and refactor navigation.
2. `feature/storage-dynamic-sizing`: Fix PC/Graveyard box indices and calculate deaths automatically.
3. `feature/ui-improvements`: Fix the Load Game screen layout and add manual Badge controls.
4. `feature/auto-reload`: Implement the File System Access API for live reloading.
