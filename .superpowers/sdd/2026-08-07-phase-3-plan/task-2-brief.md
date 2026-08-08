### Task 2: Decrypt Pokemon Data and Extract Attributes

**Files:**
- Modify: `src/lib/GBASaveParser.ts`
- Modify: `tests/GBASaveParser.test.ts`
- Modify: `src/App.tsx` (UI to render Nickname and Level)

**Objective:**
Extract the Nickname and Level (which are unencrypted), and decrypt the 48-byte encrypted block to get the Species ID.

- [ ] **Step 1: Read Nickname and Level**
The Pokemon struct is 100 bytes long.
- **Nickname** is a 10-byte string starting at offset `8`. Gen 3 uses a proprietary character encoding, but for this task, you can just return the raw byte array or a placeholder string like `"Nickname"` or read it as ASCII for now (it will look mostly like garbage but some english chars might match). Actually, just leave `nickname: "Unknown"` for now until we implement the Gen 3 Charset mapping in the future.
Wait, let's just use a placeholder for Nickname if it's too complex.
Let's actually just extract `level` (1 byte at offset `84`).
- **Level** is an unsigned 8-bit int at offset `84` (`0x54`).

- [ ] **Step 2: Substructure Mapping**
To get the Species ID, we must decrypt the 48-byte block at offset `32` (`0x20`).
The block contains 4 substructures (12 bytes each): Growth (G), Attacks (A), EVs (E), Misc (M).
The order is determined by `PID % 24`.
Create a helper array mapping `0` to `23` to the index of the Growth block (e.g. 0 = GAEM, so Growth is at index 0. 1 = GAME, Growth is at index 0... 12 = EGAM, Growth is at index 1).
Or just decrypt the entire 48-byte block!

- [ ] **Step 3: Decrypt the 48-byte Block**
The decryption key is `PID ^ OTID`.
The 48-byte block (offset `32` to `80`) is decrypted by reading it 4 bytes (32-bit uint) at a time, XORing it with the key, and writing it back to a temporary buffer.

- [ ] **Step 4: Read Species ID**
Using the `PID % 24` order, find where the 12-byte Growth block is in the decrypted 48-byte buffer.
The Species ID is the first 2 bytes (16-bit uint) of the Growth block!
Assign it to `speciesId`.

- [ ] **Step 5: Update the UI**
In `src/App.tsx`, display the `Level` and `Species ID` on the Pokemon card!

- [ ] **Step 6: Update Tests**
Add a test in `tests/GBASaveParser.test.ts` that provides a mock 100-byte Pokemon block, encrypts a Growth block with a specific Species ID, sets the Level, and verifies `parseTeam` extracts them correctly.
