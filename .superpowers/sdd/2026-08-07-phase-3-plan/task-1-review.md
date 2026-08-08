Commits:

Stat:
 src/lib/GBASaveParser.ts    | 65 ++++++++++++++++++++++++++++++++-------------
 tests/GBASaveParser.test.ts | 37 ++++++++++++++++++++++++++
 2 files changed, 83 insertions(+), 19 deletions(-)

Diff:
diff --git a/src/lib/GBASaveParser.ts b/src/lib/GBASaveParser.ts
index 6a52990..4127266 100644
--- a/src/lib/GBASaveParser.ts
+++ b/src/lib/GBASaveParser.ts
@@ -1,86 +1,113 @@
+export const SECTION_SIZE = 4096;
+export const SAVE_B_OFFSET = 0xE000;
+export const SECTION_ID_OFFSET = 0x0FF4;
+export const SAVE_INDEX_OFFSET = 0x0FFC;
+export const FRLG_TEAM_OFFSET = 0x0234;
+export const RSE_TEAM_OFFSET = 0x0034;
+export const MAX_SAVE_SIZE = 2097152;
+
 export interface SaveData {
   trainerName: string;
 }
 
 export interface Pokemon {
   pid: number;
   otid: number;
   speciesId?: number;
   level?: number;
+  nickname?: string;
 }
 
 export class GBASaveParser {
   validateSize(buffer: ArrayBuffer): void {
-    if (buffer.byteLength > 2097152) { // 2MB max
+    if (buffer.byteLength > MAX_SAVE_SIZE) {
       throw new Error('Invalid save file size. Expected maximum 2MB GBA save.');
     }
   }
 
   parse(buffer: ArrayBuffer): SaveData {
     this.validateSize(buffer);
     return { trainerName: 'Player' }; // Stub for now
   }
 
   public findActiveSaveOffset(buffer: ArrayBuffer): number {
-    if (buffer.byteLength < 0x0FFC + 4) {
+    if (buffer.byteLength < SAVE_INDEX_OFFSET + 4) {
       return 0x0000;
     }
     const view = new DataView(buffer);
-    let saveAIndex = view.getUint32(0x0FFC, true);
+    let saveAIndex = view.getUint32(SAVE_INDEX_OFFSET, true);
     if (saveAIndex === 0xFFFFFFFF) saveAIndex = -1;
 
     let saveBIndex = -1;
-    if (buffer.byteLength >= 114688) {
-      const idx = view.getUint32(0xE000 + 0x0FFC, true);
+    if (buffer.byteLength >= SAVE_B_OFFSET + SAVE_INDEX_OFFSET + 4) {
+      const idx = view.getUint32(SAVE_B_OFFSET + SAVE_INDEX_OFFSET, true);
       if (idx !== 0xFFFFFFFF) saveBIndex = idx;
     }
 
-    return saveBIndex > saveAIndex ? 0xE000 : 0x0000;
+    return saveBIndex > saveAIndex ? SAVE_B_OFFSET : 0x0000;
   }
 
   public parseTeam(buffer: ArrayBuffer): Pokemon[] {
     if (buffer.byteLength < 65536) {
       return [];
     }
     const activeOffset = this.findActiveSaveOffset(buffer);
     const view = new DataView(buffer);
     
     // Find Section 1 (Team/Items)
     let section1Offset = -1;
     for (let i = 0; i < 14; i++) {
-      const sectionStart = activeOffset + (i * 4096);
-      if (sectionStart + 0x0FF4 + 2 > buffer.byteLength) {
+      const sectionStart = activeOffset + (i * SECTION_SIZE);
+      if (sectionStart + SECTION_ID_OFFSET + 2 > buffer.byteLength) {
         break;
       }
-      const sectionId = view.getUint16(sectionStart + 0x0FF4, true);
+      const sectionId = view.getUint16(sectionStart + SECTION_ID_OFFSET, true);
       if (sectionId === 1) {
         section1Offset = sectionStart;
         break;
       }
     }
     
     if (section1Offset === -1) return [];
-    
-    // FireRed/LeafGreen Party offset in Section 1 is 0x0234 (Count) and 0x0238 (Data)
-    // Note: Emerald is 0x0234 as well. Ruby/Sapphire is 0x0234.
-    if (section1Offset + 0x0234 + 4 > buffer.byteLength) return [];
-    const partyCount = view.getUint32(section1Offset + 0x0234, true);
-    const safeCount = Math.min(partyCount, 6);
-    
+
+    let teamOffset = -1;
+    let partyCount = 0;
+
+    // Check FRLG team count first
+    if (section1Offset + FRLG_TEAM_OFFSET + 4 <= buffer.byteLength) {
+      const frlgCount = view.getUint32(section1Offset + FRLG_TEAM_OFFSET, true);
+      if (frlgCount <= 6) {
+        teamOffset = FRLG_TEAM_OFFSET;
+        partyCount = frlgCount;
+      }
+    }
+
+    // If FRLG check failed (> 6), check RSE team count
+    if (teamOffset === -1 && section1Offset + RSE_TEAM_OFFSET + 4 <= buffer.byteLength) {
+      const rseCount = view.getUint32(section1Offset + RSE_TEAM_OFFSET, true);
+      if (rseCount <= 6) {
+        teamOffset = RSE_TEAM_OFFSET;
+        partyCount = rseCount;
+      }
+    }
+
+    if (teamOffset === -1) return [];
+
+    const teamDataOffset = section1Offset + teamOffset + 4;
     const team: Pokemon[] = [];
-    for (let i = 0; i < safeCount; i++) {
-      const pkmnOffset = section1Offset + 0x0238 + (i * 100);
+    for (let i = 0; i < partyCount; i++) {
+      const pkmnOffset = teamDataOffset + (i * 100);
       if (pkmnOffset + 8 > buffer.byteLength) {
         break;
       }
       const pid = view.getUint32(pkmnOffset, true);
       const otid = view.getUint32(pkmnOffset + 4, true);
-      // Decryption and species mapping will be added in the next task
       team.push({ pid, otid });
     }
     
     return team;
   }
 }
 
 
+
diff --git a/tests/GBASaveParser.test.ts b/tests/GBASaveParser.test.ts
index f4f03d6..7d83c25 100644
--- a/tests/GBASaveParser.test.ts
+++ b/tests/GBASaveParser.test.ts
@@ -79,24 +79,61 @@ describe('GBASaveParser Team Extraction', () => {
     view.setUint32(pkmnOffset, 0x12345678, true); // PID
     view.setUint32(pkmnOffset + 4, 0x87654321, true); // OTID
     
     const parser = new GBASaveParser();
     const team = parser.parseTeam(buffer);
     
     expect(team.length).toBe(1);
     expect(team[0].pid).toBe(0x12345678);
   });
 
+  it('should parse a pokemon team from RSE offset (0x0034)', () => {
+    const buffer = new ArrayBuffer(65536);
+    const view = new DataView(buffer);
+    
+    // Mock Save A as active
+    view.setUint32(0x0FFC, 10, true);
+    
+    // Section 1 (Team/Items) ID at 0x1000 + 0x0FF4
+    view.setUint16(0x1000 + 0x0FF4, 1, true); // Section ID 1
+    
+    // Set FRLG offset to invalid count (> 6)
+    view.setUint32(0x1000 + 0x0234, 0xFFFFFFFF, true);
+    
+    // Set RSE Party Count at 0x0034
+    view.setUint32(0x1000 + 0x0034, 2, true);
+    
+    // Set Pokemon 1 PID and OTID at 0x1000 + 0x0038
+    const pkmn1Offset = 0x1000 + 0x0038;
+    view.setUint32(pkmn1Offset, 0xAABBCCDD, true);
+    view.setUint32(pkmn1Offset + 4, 0x11223344, true);
+
+    // Set Pokemon 2 PID and OTID at 0x1000 + 0x0038 + 100
+    const pkmn2Offset = pkmn1Offset + 100;
+    view.setUint32(pkmn2Offset, 0x55667788, true);
+    view.setUint32(pkmn2Offset + 4, 0x99AABBCC, true);
+    
+    const parser = new GBASaveParser();
+    const team = parser.parseTeam(buffer);
+    
+    expect(team.length).toBe(2);
+    expect(team[0].pid).toBe(0xAABBCCDD);
+    expect(team[0].otid).toBe(0x11223344);
+    expect(team[1].pid).toBe(0x55667788);
+    expect(team[1].otid).toBe(0x99AABBCC);
+  });
+
   it('should return an empty array without throwing RangeError when buffer is smaller than 65536 bytes', () => {
     const parser = new GBASaveParser();
     expect(parser.parseTeam(new ArrayBuffer(0))).toEqual([]);
     expect(parser.parseTeam(new ArrayBuffer(100))).toEqual([]);
     expect(parser.parseTeam(new ArrayBuffer(4096))).toEqual([]);
   });
 
   it('should return 0x0000 without throwing RangeError when buffer is smaller than 0x1000 bytes', () => {
     const parser = new GBASaveParser();
     expect(parser.findActiveSaveOffset(new ArrayBuffer(10))).toBe(0x0000);
   });
 });
 
 
+

