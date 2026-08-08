# GBA Save Parser Design

## Goal
Extract Party Pokémon data from Gen 3 GBA Save files (FireRed/LeafGreen) entirely client-side using JavaScript `DataView`.

## Architecture
- **Save Parser Core**: A utility class `GBASaveParser` that takes an `ArrayBuffer`.
- **Save Slot Detection**: Reads the 14 sections (4KB each) for Save A (0x0000-0xDFFF) and Save B (0xE000-0x1BFFF). Finds the most recent save slot by checking the Save Index at `0x0FFC` in each section.
- **Section 1 Extraction**: Locates Section ID 1 (Team/Items). Reads Party Count and 100-byte Party Pokémon structures.
- **Decryption**: For each Pokémon:
  - Read `PID` (4 bytes) and `OTID` (4 bytes).
  - Calculate `Decryption Key = PID XOR OTID`.
  - Unshuffle the 48-byte substructures (G, A, E, M) using `PID % 24`.
  - Decrypt the 48 bytes by XORing with the Decryption Key (32-bit chunks).
- **Data Mapping**: Extract Species ID, Level, Current HP, Max HP, and Stats.

## Data Flow
`SaveLoader.tsx` -> `ArrayBuffer` -> `GBASaveParser.parse(buffer)` -> `Team[]` -> `App.tsx State`.

## UI
Update `App.tsx` to render the parsed `Team[]` in a simple grid showing the Pokémon Species ID, Level, and HP.
