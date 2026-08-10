# Hidden Power Field Design

## Goal
Display the calculated Hidden Power type of a Pokémon based on its Individual Values (IVs) within the `PokemonCard` component.

## Architecture & Data Flow

1. **Utility Module**: A new pure function file will be created at `src/lib/HiddenPower.ts`.
2. **Logic**:
   - The file will export `calculateHiddenPower(ivs)`.
   - It will extract the least significant bit (even = 0, odd = 1) from each of the 6 stats.
   - It will apply the standard formula: `floor(((HP + 2*Atk + 4*Def + 8*Spe + 16*SpA + 32*SpD) * 15) / 63)`.
   - The resulting integer (0-15) will map to an array of types (Fighting through Dark).
3. **Component Integration**: 
   - `PokemonCard.tsx` will import `calculateHiddenPower`.
   - When rendering the IVs section, it will pass `pkmn.ivs` to the function to obtain the type string.
   - The type will be rendered alongside the IVs section header.

## UI Components
- The existing `<p>` tag for the "IVs" header in `PokemonCard.tsx` will be converted to a flexbox container.
- A new pill/badge will be added next to the text, styled with Tailwind (e.g., small text, rounded corners, subtle background) to display "HP: [Type]".
- It will only display if IVs are present on the Pokémon data object.

## Testing & Verification
- Verify that a Pokémon with 31 IVs in all stats shows as "HP: Dark".
- Verify that the layout remains clean and responsive when the badge is added.
