# Guides Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Guides section to group trainers by level caps and display raw stats extracted from the Excel data, while cleaning up the Sidebar.

**Architecture:** We will create a Python script to parse the `Pokemon Gen 3 Trainers DataSheet.xlsx` into a new `trainers.json` structure where trainers are grouped by level caps. The Nuzlocke Companion UI (`TrainersView.tsx` and `Sidebar.tsx`) will be updated to consume this new grouped structure and display the stats visually.

**Tech Stack:** Python (for parsing), React, TypeScript, TailwindCSS

## Global Constraints
- Do not remove any existing documentation comments in the code.
- Must use Git Bash for all terminal commands (wrap with `bash -c`).
- Output JSON must be formatted cleanly.

---

### Task 1: Parse Excel Data to JSON

**Files:**
- Create: `scripts/parse_trainers.py`
- Modify: `src/data/trainers.json`

**Interfaces:**
- Consumes: `docs/Pokemon Gen 3 Trainers DataSheet.xlsx` (AnyDoc Markdown representation)
- Produces: `src/data/trainers.json` (A structured JSON grouped by cap, containing `name`, `route`, `location`, `money`, `team` array with `species`, `level`, `moves`, `hp`, `atk`, `def`, `spa`, `spd`, `spe`).

- [ ] **Step 1: Write the parser script**
Create `scripts/parse_trainers.py` that reads the `trainers_data.md` (which we parsed from Excel using AnyDoc) or the Excel file directly, and structures the `FRLG Venusaur` section into groups based on level caps (we can infer the caps from the sequence of major trainers).
```python
# Minimal example of structure logic
import json

def parse():
    # Parsing logic here
    # Will output to src/data/trainers.json
    pass

if __name__ == "__main__":
    parse()
```

- [ ] **Step 2: Run the script**
Run: `python scripts/parse_trainers.py`
Expected: `src/data/trainers.json` is updated with the new structure.

- [ ] **Step 3: Commit**
```bash
git add scripts/parse_trainers.py src/data/trainers.json
git commit -m "feat: parse FRLG Venusaur data into grouped JSON with stats"
```

---

### Task 2: Clean up Sidebar Navigation

**Files:**
- Modify: `src/components/Sidebar.tsx:78-111`

**Interfaces:**
- Consumes: N/A
- Produces: Cleaner UI

- [ ] **Step 1: Remove Level Caps section**
Remove the `currentGame` conditional block that renders the Level Caps list at the bottom of the sidebar. Keep the "Guides" button.

- [ ] **Step 2: Commit**
```bash
git add src/components/Sidebar.tsx
git commit -m "refactor: remove Level Caps from sidebar"
```

---

### Task 3: Grouped Trainers UI with Stats

**Files:**
- Modify: `src/components/TrainersView.tsx`
- Modify: `src/App.tsx` (to pass the correct grouped data)

**Interfaces:**
- Consumes: `src/data/trainers.json`
- Produces: Grouped UI in the Guides tab

- [ ] **Step 1: Update Interfaces**
In `TrainersView.tsx`, update `TrainerPokemon` to include `hp`, `atk`, `def`, `spa`, `spd`, `spe` (all strings). Update `Props` if necessary.

- [ ] **Step 2: Implement Grouped Rendering**
Modify `TrainersView.tsx` to iterate over groups (e.g., if the JSON is structured as an array of Cap objects, or a Record of cap names to Trainer arrays). Render the Cap name as a header, and the trainers underneath it.

- [ ] **Step 3: Display Stats**
Inside the trainer's Pokémon loop, add a row below the species/level to display the stats:
```tsx
<div className="text-xs text-gray-400 mt-1 mb-2">
  HP {pkmn.hp} | Atk {pkmn.atk} | Def {pkmn.def} | SpA {pkmn.spa} | SpD {pkmn.spd} | Spe {pkmn.spe}
</div>
```

- [ ] **Step 4: Update App.tsx**
In `App.tsx`, ensure that `gameTrainers` is properly retrieved from the new `trainers.json` structure (e.g., accessing `trainersData['FRLG Venusaur']`).

- [ ] **Step 5: Run dev server to verify**
Run: `npm run dev`
Expected: The UI renders the groups and stats without errors.

- [ ] **Step 6: Commit**
```bash
git add src/components/TrainersView.tsx src/App.tsx
git commit -m "feat: group trainers by cap and display raw stats"
```
