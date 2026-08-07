# Nuzlocke & Save Parser iOS App Design

## Overview
A client-side iOS Progressive Web App (PWA) that allows users to parse Pokémon ROM Hack save files locally on their device. It extracts detailed team and box data and provides an embedded Nuzlocke tracking and boss preparation guide.

## Goals
- Allow importing of `.sav` (GBA Gen 3) and `.dsv`/`.sav` (NDS Gen 4/5) save files directly from the iOS Files app.
- Provide a clean, native-feeling mobile experience (installable to the iOS Home Screen).
- Completely client-side (no backend required, total privacy, instantaneous parsing).
- Support for Drayano ROM hacks (FireRed Omega, Renegade Platinum, Blaze Black) for level caps and boss teams.

## Architecture & Hosting
- **Tech Stack**: React + Vite + TypeScript.
- **Styling**: Tailwind CSS for a responsive, mobile-first design.
- **PWA Configuration**: A web manifest and service worker enabling the app to be installed to the iOS Home screen, offering a standalone full-screen experience and offline caching.

## Data Flow & File Sync
- **Limitation Addressed**: iOS Safari does not support the File System Access API's persistent `showOpenFilePicker`.
- **Workflow**: 
  1. User plays on an emulator (e.g. Delta) and saves the game.
  2. User switches to the Nuzlocke Tracker PWA and taps a "Sync Save" button.
  3. The native iOS file picker appears, the user selects the `.sav` or `.dsv` file.
  4. The app parses the file using `FileReader`/`ArrayBuffer` and immediately updates the UI.

## Components & Modules

### 1. Save File Parsers
- **Gen 3 Parser**: Parses 128KB/64KB GBA save files (LeafGreen, FireRed Omega). Handles decryption of 100-byte Party and 80-byte PC Box structures using PID XOR logic.
- **Gen 4/5 Parser**: Parses NDS save formats (Renegade Platinum, Blaze Black). Handles block shuffling, checksums, and decryption of the 136-byte Pokémon structures.
- **Data Extracted**: Species, Level, IVs, EVs, Nature, Ability, Current HP, Status, 4 Moves, Held Item, and Shininess.

### 2. Nuzlocke Tracker Dashboard
- **Party View**: Rich cards showing your 6 current Pokémon and all their competitive stats.
- **Encounter Routing**: Auto-detects encounters based on `met_location` IDs, matching them to routes. 
- **Graveyard**: Manual toggle to move fainted Pokémon to the graveyard, keeping a history of your run.

### 3. Boss Prep & Level Cap Guides
- **Static Game Data**: JSON datasets containing base stats, items, moves, and abilities for Gen 3-5.
- **Hack-Specific Data**: Boss rosters, levels, held items, and level caps for FireRed Omega, Renegade Platinum, and Blaze Black.
- **Analysis Engine**: A UI section that contrasts your current Party against an upcoming boss (e.g. Roark in Renegade Platinum), highlighting type advantages and speed ties.

## Testing & Verification
- Test parsing against sample `.sav` files from Gen 3 and Gen 4.
- Verify iOS PWA installation (manifest correctly triggers "Add to Home Screen" prompt mechanics).
- Verify Tailwind UI is mobile-responsive and thumb-friendly.

## Future Expansion
- Export team to Pokémon Showdown format for damage calculator integration.
- Capacitor wrapper for a native `.ipa` app build (if PWA limitations prove problematic later).
