# Guides Section Redesign

## Purpose
Enhance the "Guides" section of the Nuzlocke Companion app by grouping trainers by Level Cap (to better align with how Nuzlocke players plan their runs) and adding detailed stat/IV information extracted from the source Excel data. Additionally, streamline the sidebar navigation by removing the redundant "Level Caps" list.

## Architecture & Data Flow
1. **Data Source Update (`src/data/trainers.json`)**:
   - We will parse `Pokemon Gen 3 Trainers DataSheet.xlsx` (specifically the `FRLG Venusaur` section, updating the current hardcoded `FRLG Charizard`) into a JSON format.
   - The new JSON structure must include stats: `hp`, `atk`, `def`, `spa`, `spd`, `spe`.
   - The data must also be associated with the upcoming Level Cap to allow grouping. This might require matching trainers to the caps listed in `src/data/levelCaps.json` or inferring them chronologically.
2. **Sidebar Component (`Sidebar.tsx`)**:
   - The Level Caps section (lines 78-110) will be removed to reduce clutter.
   - The "Guides" button remains and functions as the primary entry point to trainer data.
3. **Trainers View Component (`TrainersView.tsx`)**:
   - Will be updated to group trainers by "Level Cap".
   - The state/props will handle a grouped data structure (e.g., `Record<string, Trainer[]>`).
   - The UI will render sections for each Cap with collapsible headers.
4. **Trainer Card Component (within `TrainersView.tsx`)**:
   - Expanded to include a new row under the Pokémon species and level, displaying the raw stats (HP, Atk, Def, SpA, SpD, Spe).

## Components

### `Sidebar.tsx`
- **Action**: Delete the conditional rendering block for `currentGame` that maps and displays `levelCapsData`.

### `TrainersView.tsx`
- **Action**: Modify the `TrainerPokemon` interface to include stats (`hp`, `atk`, `def`, `spa`, `spd`, `spe`).
- **Action**: Update the component to iterate over grouped trainers (by cap) instead of a flat list.
- **Action**: Add styling for the stat display inside the Pokemon item block.

### Data Scripts
- **Action**: Create or update a Python script (e.g., `parse_trainers_xlsx.py`) to correctly extract the FRLG Venusaur sheet, associate trainers with the next level cap (using chronological order or explicit mappings), and output a new `trainers.json`.

## Error Handling
- If a trainer lacks stat data (e.g., parsing error), the component should gracefully fallback to hiding the stats row or showing "Stats Unknown".
- If a trainer cannot be mapped to a specific cap, they will be placed in an "Other / Uncategorized" section at the end.

## Testing
- Verify that `trainers.json` parses successfully and the app loads without crashing.
- Test the collapsible sections in `TrainersView` to ensure performance isn't impacted by rendering too many trainers at once.
- Visually verify that the stats align correctly and match the data in the original Excel sheet.
