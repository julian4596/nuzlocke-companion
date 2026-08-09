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
- **Game Detection:** Checks memory signatures at known offset locations to differentiate between Black/White and Black 2/White 2 (as offsets differ slightly between them).
- **Data Decryption:** Implements the Gen 5 LCRNG (Linear Congruential Random Number Generator) algorithm to decrypt the Pokemon data blocks.
- **Data Extraction:** Parses the active save slot to extract the trainer name, party Pokémon (up to 6), and PC boxes (up to 24 boxes of 30).

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
