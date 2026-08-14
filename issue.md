# Graveyard / PC Storage View Crashes with "TypeError: Cannot read properties of null (reading 'graveyardBoxes')"

## Description
When attempting to load a **Pokémon Blaze Black** (or other Black 1 ROM Hack) save file, the Graveyard and PC Storage views fail to load and instead crash the application on refresh.

### The Error
Refreshing the page while on the Graveyard tab produces the following error in the developer console:

```
TypeError: Cannot read properties of null (reading 'graveyardBoxes')
    at Wv (index-BrC0oLzJ.js:48:83012)
    at I1 (index-BrC0oLzJ.js:38:16951)
    ...
```

## Root Cause Analysis
This is caused by a chain of two distinct issues (one in the save parser, one in the React UI state):

### 1. Gen 5 Save Parser (Version Detection)
The `Gen5SaveParser.detectGameVersion()` logic historically attempted to distinguish BW from B2W2 by reading the save counter index at specific offsets:
- BW: `0x23FFC` and `0x47FFC`
- B2W2: `0x25FFC` and `0x4BFFC`

In a **Blaze Black (BW1)** save file, the offset `0x25FFC` falls squarely into Block 2's PC Storage data. Because PC storage is encrypted data, it frequently results in random integer values. If this random integer happens to be less than 1,000,000, the parser incorrectly identified it as a valid B2W2 save counter. 
This caused the parser to assume a block size of `0x26000` instead of `0x24000`, leading to out-of-bounds reads for party/box counts, returning `0` Pokémon.

### 2. React UI State (`App.tsx`)
Because the parser returned an empty party array (`parsedTeam.length === 0`), `App.tsx` silently skipped calling `setActiveRun(activeRun)`.
When the user refreshed the page on `/run/:id/graveyard`:
1. The component rendered synchronously.
2. `activeRun` was initially `null` while the DB fetch was pending.
3. `renderContent` lacked a loading state guard for the Graveyard view, passing `activeRun={null!}`.
4. `GraveyardView` immediately attempted to read `activeRun.graveyardBoxes`, crashing the entire React tree before it could recover.

## Screenshots & Logs
**Console Output (Parser thinking game is B2W2):**
```text
--- GRAVEYARD DEBUG ---
Game Version: Black 2/White 2
activeRun.graveyardBoxes: (24) [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
graveyardData.length: 0
boxes array length: 24
First selected box contents: []
-----------------------
```

## Proposed Fix
1. **Parser Fix**: Instead of relying solely on save counters, read the Trainer Name string from `0x00000 + 0x19404` and compare it against the expected Slot 2 offsets (`0x24000` and `0x26000`). This definitively identifies the block size without false positives from random encrypted PC data.
2. **React Fix**: Add an `if (!activeRun)` loading guard at the top of `renderContent` in `App.tsx` to prevent the UI from crashing on direct navigation/refresh.
