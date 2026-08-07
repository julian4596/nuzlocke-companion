Commits:

Stat:
 src/lib/GBASaveParser.ts    | 12 ++++++++++++
 tests/GBASaveParser.test.ts | 26 ++++++++++++++++++++++++++
 2 files changed, 38 insertions(+)

Diff:
diff --git a/src/lib/GBASaveParser.ts b/src/lib/GBASaveParser.ts
new file mode 100644
index 0000000..5a3a2f3
--- /dev/null
+++ b/src/lib/GBASaveParser.ts
@@ -0,0 +1,12 @@
+export interface SaveData {
+  trainerName: string;
+}
+
+export class GBASaveParser {
+  parse(buffer: ArrayBuffer): SaveData {
+    if (buffer.byteLength !== 131072 && buffer.byteLength !== 65536) { // 128KB or 64KB
+      throw new Error('Invalid save file size. Expected 64KB or 128KB GBA save.');
+    }
+    return { trainerName: 'Player' }; // Stub for now
+  }
+}
diff --git a/tests/GBASaveParser.test.ts b/tests/GBASaveParser.test.ts
new file mode 100644
index 0000000..d04169e
--- /dev/null
+++ b/tests/GBASaveParser.test.ts
@@ -0,0 +1,26 @@
+import { describe, it, expect } from 'vitest';
+import { GBASaveParser } from '../src/lib/GBASaveParser';
+
+describe('GBASaveParser', () => {
+  it('should initialize and throw on invalid size', () => {
+    const parser = new GBASaveParser();
+    const badBuffer = new ArrayBuffer(100);
+    expect(() => parser.parse(badBuffer)).toThrow('Invalid save file size');
+  });
+
+  it('should accept valid 128KB save file', () => {
+    const parser = new GBASaveParser();
+    const valid128kBuffer = new ArrayBuffer(131072);
+    const result = parser.parse(valid128kBuffer);
+    expect(result).toBeDefined();
+    expect(result.trainerName).toBe('Player');
+  });
+
+  it('should accept valid 64KB save file', () => {
+    const parser = new GBASaveParser();
+    const valid64kBuffer = new ArrayBuffer(65536);
+    const result = parser.parse(valid64kBuffer);
+    expect(result).toBeDefined();
+    expect(result.trainerName).toBe('Player');
+  });
+});

