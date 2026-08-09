# Gen 5 Save Parsing Architecture & Implementation Design

## 1. Goal
Refactor the save parsing logic of the Nuzlocke Companion app to support multiple generations scalably and implement support for Generation 5 (NDS) save files (Black, White, Black 2, White 2). 

## 2. Shared Types (`src/lib/types.ts`)
The `Pokemon` and `SaveData` interfaces will be extracted from `GBASaveParser.ts` into a dedicated `types.ts` file. This guarantees that UI components (`PokemonCard`, `BoxView`) remain completely decoupled from the parsing logic and the save file's generation of origin.

## 3. Base Save Parser (`src/lib/BaseSaveParser.ts`)
An abstract base class `BaseSaveParser` will define the core contract:
```typescript
import { SaveData, Pokemon } from './types';

export abstract class BaseSaveParser {
  abstract parse(buffer: ArrayBuffer): SaveData;
  abstract parseTeam(buffer: ArrayBuffer): Pokemon[];
  abstract parseBoxes(buffer: ArrayBuffer): Pokemon[][];
}
```
Existing logic in `GBASaveParser.ts` will be updated to `extend` this base class.

## 4. Save Manager (`src/lib/SaveManager.ts`)
A factory class `SaveManager` will serve as the entry point for parsing any save file. It will contain a method to detect the generation and return the appropriate parser instance.
- **Gen 3 (GBA)**: Detected by evaluating the internal block section IDs (which the existing parser already does).
- **Gen 5 (NDS)**: Detected by checking for the exact 512 KB (524,288 bytes) file size and verifying specific save signatures inside the file.

## 5. Gen 5 Parser (`src/lib/Gen5SaveParser.ts`)
A new parser class extending `BaseSaveParser` will handle Generation 5 specific formats.
- **Game Detection:** Determine the active save slot (Block 1 at `0x0`, Block 2 at `0x24000`). Select the one with the higher save index/valid checksum. To differentiate BW from B2W2, use the offsets below:
  - **BW Offsets:** Party Pokémon at `0x18E08`, Trainer Data at `0x19404`, Boxed Pokémon at `0x400`.
  - **B2W2 Offsets:** Party Pokémon at `0x18E00`, Trainer Data at `0x19400`, Boxed Pokémon at `0x400`.
- **Data Decryption:** Gen 5 uses a PRNG to encrypt Pokemon data blocks. The LCRNG algorithm is: `seed = (seed * 0x41C64E6D + 0x6073) & 0xFFFFFFFF`. The initial seed for decrypting a Pokemon is its checksum (read from 0x06).
- **Data Extraction:** Parse the active save slot to extract the trainer name, party Pokémon (up to 6, 220-byte structures), and PC boxes (up to 24 boxes of 30, 136-byte structures). Pokémon data uses block shuffling based on `((PID & 0x3E000) >> 13) % 24`.
  - **Block Permutations:** 0=ABCD, 1=ABDC, 2=ACBD, 3=ACDB, 4=ADBC, 5=ADCB, 6=BACD, 7=BADC, 8=BCAD, 9=BCDA, 10=BDAC, 11=BDCA, 12=CABD, 13=CADB, 14=CBAD, 15=CBDA, 16=CDAB, 17=CDBA, 18=DABC, 19=DACB, 20=DBAC, 21=DBCA, 22=DCAB, 23=DCBA.
  - **Decrypted Offsets:**
    - Block A (0x08-0x27): Species (0x08, 16-bit), OT ID (0x0C, 16-bit), OT SID (0x0E, 16-bit).
    - Block B (0x28-0x47): Moves (0x28, 4x 16-bit).
    - Block C (0x48-0x67): Nickname (0x48, 22 bytes, 11 UTF-16LE characters).
    - Party Stats (0x88-0xDB): Level (0x8C, 8-bit). For Box Pokémon without Party Stats, calculate Level from EXP (or default to 0 for this task if EXP table isn't available).
    - Shiny calculation: `isShiny = (OTID ^ OTSID ^ (PID & 0xFFFF) ^ (PID >>> 16)) < 8`

## 6. App.tsx Integration
`handleFileLoad` in `App.tsx` will be refactored to use the new `SaveManager`:
```typescript
const parser = SaveManager.getParser(buffer);
const parsedData = parser.parse(buffer);
const parsedTeam = parser.parseTeam(buffer);
const parsedBoxes = parser.parseBoxes(buffer);
```
No other UI components need to change because the types are uniform.

## 7. Error Handling
The `SaveManager` will throw a clear Error if a file is neither a valid Gen 3 nor a valid Gen 5 save file, which `App.tsx` will catch and display to the user.
