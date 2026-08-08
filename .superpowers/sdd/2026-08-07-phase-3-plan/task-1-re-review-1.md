Commits:

Stat:
 src/lib/GBASaveParser.ts    |  6 ++---
 tests/GBASaveParser.test.ts | 65 ++++++++++++++++++++++++++-------------------
 2 files changed, 40 insertions(+), 31 deletions(-)

Diff:
diff --git a/src/lib/GBASaveParser.ts b/src/lib/GBASaveParser.ts
index 4127266..ce41ad5 100644
--- a/src/lib/GBASaveParser.ts
+++ b/src/lib/GBASaveParser.ts
@@ -69,30 +69,30 @@ export class GBASaveParser {
     }
     
     if (section1Offset === -1) return [];
 
     let teamOffset = -1;
     let partyCount = 0;
 
     // Check FRLG team count first
     if (section1Offset + FRLG_TEAM_OFFSET + 4 <= buffer.byteLength) {
       const frlgCount = view.getUint32(section1Offset + FRLG_TEAM_OFFSET, true);
-      if (frlgCount <= 6) {
+      if (frlgCount >= 1 && frlgCount <= 6) {
         teamOffset = FRLG_TEAM_OFFSET;
         partyCount = frlgCount;
       }
     }
 
-    // If FRLG check failed (> 6), check RSE team count
+    // If FRLG check failed (not between 1 and 6), check RSE team count
     if (teamOffset === -1 && section1Offset + RSE_TEAM_OFFSET + 4 <= buffer.byteLength) {
       const rseCount = view.getUint32(section1Offset + RSE_TEAM_OFFSET, true);
-      if (rseCount <= 6) {
+      if (rseCount >= 1 && rseCount <= 6) {
         teamOffset = RSE_TEAM_OFFSET;
         partyCount = rseCount;
       }
     }
 
     if (teamOffset === -1) return [];
 
     const teamDataOffset = section1Offset + teamOffset + 4;
     const team: Pokemon[] = [];
     for (let i = 0; i < partyCount; i++) {
diff --git a/tests/GBASaveParser.test.ts b/tests/GBASaveParser.test.ts
index 7d83c25..e0b6f43 100644
--- a/tests/GBASaveParser.test.ts
+++ b/tests/GBASaveParser.test.ts
@@ -1,17 +1,26 @@
 import { describe, it, expect } from 'vitest';
-import { GBASaveParser } from '@/lib/GBASaveParser';
+import {
+  GBASaveParser,
+  SECTION_SIZE,
+  SAVE_B_OFFSET,
+  SECTION_ID_OFFSET,
+  SAVE_INDEX_OFFSET,
+  FRLG_TEAM_OFFSET,
+  RSE_TEAM_OFFSET,
+  MAX_SAVE_SIZE,
+} from '@/lib/GBASaveParser';
 
 describe('GBASaveParser', () => {
   it('should initialize and throw on invalid size over 2MB', () => {
     const parser = new GBASaveParser();
-    const badBuffer = new ArrayBuffer(2097153);
+    const badBuffer = new ArrayBuffer(MAX_SAVE_SIZE + 1);
     expect(() => parser.parse(badBuffer)).toThrow('Invalid save file size');
   });
 
   it('should accept valid 128KB save file', () => {
     const parser = new GBASaveParser();
     const valid128kBuffer = new ArrayBuffer(131072);
     const result = parser.parse(valid128kBuffer);
     expect(result).toBeDefined();
     expect(result.trainerName).toBe('Player');
   });
@@ -24,97 +33,97 @@ describe('GBASaveParser', () => {
     expect(result.trainerName).toBe('Player');
   });
 });
 
 describe('GBASaveParser Save Slot Detection', () => {
   it('should identify the correct active save offset', () => {
     // Create a mock 64KB buffer
     const buffer = new ArrayBuffer(65536);
     const view = new DataView(buffer);
     
-    // Save A: Section 0 at 0x0000, Save Index at 0x0FFC = 5
-    view.setUint32(0x0FFC, 5, true); // Little endian
+    // Save A: Section 0 at 0x0000, Save Index at SAVE_INDEX_OFFSET = 5
+    view.setUint32(SAVE_INDEX_OFFSET, 5, true); // Little endian
     
-    // Save B: Section 0 at 0xE000, Save Index at 0xEFFC = 10 (Most recent)
-    view.setUint32(0xE000 + 0x0FFC, 10, true);
+    // Save B: Section 0 at SAVE_B_OFFSET, Save Index at SAVE_B_OFFSET + SAVE_INDEX_OFFSET = 10 (Most recent)
+    view.setUint32(SAVE_B_OFFSET + SAVE_INDEX_OFFSET, 10, true);
     
     const parser = new GBASaveParser();
     const offset = parser.findActiveSaveOffset(buffer);
     
-    expect(offset).toBe(0xE000);
+    expect(offset).toBe(SAVE_B_OFFSET);
   });
 
   it('should return 0x0000 when Save A has a higher save index', () => {
     const buffer = new ArrayBuffer(65536);
     const view = new DataView(buffer);
     
-    // Save A: Section 0 at 0x0000, Save Index at 0x0FFC = 15
-    view.setUint32(0x0FFC, 15, true);
+    // Save A: Section 0 at 0x0000, Save Index at SAVE_INDEX_OFFSET = 15
+    view.setUint32(SAVE_INDEX_OFFSET, 15, true);
     
-    // Save B: Section 0 at 0xE000, Save Index at 0xEFFC = 10
-    view.setUint32(0xE000 + 0x0FFC, 10, true);
+    // Save B: Section 0 at SAVE_B_OFFSET, Save Index at SAVE_B_OFFSET + SAVE_INDEX_OFFSET = 10
+    view.setUint32(SAVE_B_OFFSET + SAVE_INDEX_OFFSET, 10, true);
     
     const parser = new GBASaveParser();
     const offset = parser.findActiveSaveOffset(buffer);
     
     expect(offset).toBe(0x0000);
   });
 });
 
 describe('GBASaveParser Team Extraction', () => {
   it('should parse and decrypt a pokemon team', () => {
     const buffer = new ArrayBuffer(65536);
     const view = new DataView(buffer);
     
     // Mock Save A as active
-    view.setUint32(0x0FFC, 10, true);
+    view.setUint32(SAVE_INDEX_OFFSET, 10, true);
     
-    // Section 1 (Team/Items) ID at 0x1000 + 0x0FF4
-    view.setUint16(0x1000 + 0x0FF4, 1, true); // Section ID 1
+    // Section 1 (Team/Items) ID at SECTION_SIZE + SECTION_ID_OFFSET
+    view.setUint16(SECTION_SIZE + SECTION_ID_OFFSET, 1, true); // Section ID 1
     
     // Set Party Count
-    view.setUint32(0x1000 + 0x0234, 1, true); 
+    view.setUint32(SECTION_SIZE + FRLG_TEAM_OFFSET, 1, true); 
     
     // Set Pokemon 1 PID and OTID
-    const pkmnOffset = 0x1000 + 0x0238;
+    const pkmnOffset = SECTION_SIZE + FRLG_TEAM_OFFSET + 4;
     view.setUint32(pkmnOffset, 0x12345678, true); // PID
     view.setUint32(pkmnOffset + 4, 0x87654321, true); // OTID
     
     const parser = new GBASaveParser();
     const team = parser.parseTeam(buffer);
     
     expect(team.length).toBe(1);
     expect(team[0].pid).toBe(0x12345678);
   });
 
-  it('should parse a pokemon team from RSE offset (0x0034)', () => {
+  it('should parse a pokemon team from RSE offset when FRLG offset is 0', () => {
     const buffer = new ArrayBuffer(65536);
     const view = new DataView(buffer);
     
     // Mock Save A as active
-    view.setUint32(0x0FFC, 10, true);
+    view.setUint32(SAVE_INDEX_OFFSET, 10, true);
     
-    // Section 1 (Team/Items) ID at 0x1000 + 0x0FF4
-    view.setUint16(0x1000 + 0x0FF4, 1, true); // Section ID 1
+    // Section 1 (Team/Items) ID at SECTION_SIZE + SECTION_ID_OFFSET
+    view.setUint16(SECTION_SIZE + SECTION_ID_OFFSET, 1, true); // Section ID 1
     
-    // Set FRLG offset to invalid count (> 6)
-    view.setUint32(0x1000 + 0x0234, 0xFFFFFFFF, true);
+    // FRLG offset (0x0234) is 0 (e.g. empty slot #6 in RSE save with 1-5 Pokemon)
+    view.setUint32(SECTION_SIZE + FRLG_TEAM_OFFSET, 0, true);
     
-    // Set RSE Party Count at 0x0034
-    view.setUint32(0x1000 + 0x0034, 2, true);
+    // Set RSE Party Count at RSE_TEAM_OFFSET
+    view.setUint32(SECTION_SIZE + RSE_TEAM_OFFSET, 2, true);
     
-    // Set Pokemon 1 PID and OTID at 0x1000 + 0x0038
-    const pkmn1Offset = 0x1000 + 0x0038;
+    // Set Pokemon 1 PID and OTID at SECTION_SIZE + RSE_TEAM_OFFSET + 4
+    const pkmn1Offset = SECTION_SIZE + RSE_TEAM_OFFSET + 4;
     view.setUint32(pkmn1Offset, 0xAABBCCDD, true);
     view.setUint32(pkmn1Offset + 4, 0x11223344, true);
 
-    // Set Pokemon 2 PID and OTID at 0x1000 + 0x0038 + 100
+    // Set Pokemon 2 PID and OTID at SECTION_SIZE + RSE_TEAM_OFFSET + 4 + 100
     const pkmn2Offset = pkmn1Offset + 100;
     view.setUint32(pkmn2Offset, 0x55667788, true);
     view.setUint32(pkmn2Offset + 4, 0x99AABBCC, true);
     
     const parser = new GBASaveParser();
     const team = parser.parseTeam(buffer);
     
     expect(team.length).toBe(2);
     expect(team[0].pid).toBe(0xAABBCCDD);
     expect(team[0].otid).toBe(0x11223344);
@@ -122,18 +131,18 @@ describe('GBASaveParser Team Extraction', () => {
     expect(team[1].otid).toBe(0x99AABBCC);
   });
 
   it('should return an empty array without throwing RangeError when buffer is smaller than 65536 bytes', () => {
     const parser = new GBASaveParser();
     expect(parser.parseTeam(new ArrayBuffer(0))).toEqual([]);
     expect(parser.parseTeam(new ArrayBuffer(100))).toEqual([]);
     expect(parser.parseTeam(new ArrayBuffer(4096))).toEqual([]);
   });
 
-  it('should return 0x0000 without throwing RangeError when buffer is smaller than 0x1000 bytes', () => {
+  it('should return 0x0000 without throwing RangeError when buffer is smaller than SECTION_SIZE bytes', () => {
     const parser = new GBASaveParser();
     expect(parser.findActiveSaveOffset(new ArrayBuffer(10))).toBe(0x0000);
   });
 });
 
 
 

