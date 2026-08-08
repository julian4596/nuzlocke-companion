### Task 1: Fix Party Offsets & Cleanup Magic Numbers

**Files:**
- Modify: `src/lib/GBASaveParser.ts`
- Modify: `tests/GBASaveParser.test.ts`

**Objective:**
The current parser hardcodes `0x0234` for the team size, which only works for FireRed/LeafGreen. Ruby/Sapphire/Emerald (RSE) use `0x0034`. Additionally, the previous phase's code review flagged hardcoded magic numbers (e.g. `0x0FF4`, `0xE000`, `4096`) as a maintainability issue. 

- [ ] **Step 1: Extract Magic Numbers**
Define constants at the top of `GBASaveParser.ts` (or within the class) for all magic numbers:
`SECTION_SIZE = 4096`
`SAVE_B_OFFSET = 0xE000`
`SECTION_ID_OFFSET = 0x0FF4`
`SAVE_INDEX_OFFSET = 0x0FFC`
`FRLG_TEAM_OFFSET = 0x0234`
`RSE_TEAM_OFFSET = 0x0034`

- [ ] **Step 2: Detect Correct Team Offset**
In `parseTeam`, check the integer at `FRLG_TEAM_OFFSET`. If it is `<= 6`, assume FRLG. Otherwise, check `RSE_TEAM_OFFSET`. Use the appropriate offset to read the team size and the team data (which starts 4 bytes after the size). If both are > 6, return an empty array (invalid save).

- [ ] **Step 3: Add `nickname` and `level` to `Pokemon` interface**
Update the `Pokemon` interface in `GBASaveParser.ts` to include:
```typescript
  speciesId?: number;
  level?: number;
  nickname?: string;
```

- [ ] **Step 4: Update Tests**
Add a test in `tests/GBASaveParser.test.ts` to verify that `parseTeam` successfully extracts PIDs when the team count is at `0x0034` (RSE) instead of `0x0234`.

Run `npm run test` and `npm run typecheck` before finishing.
