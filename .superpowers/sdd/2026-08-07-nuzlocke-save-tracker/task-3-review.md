Commits:

Stat:
 src/App.tsx                   | 20 +++++++++++++++++++-
 src/components/SaveLoader.tsx | 36 ++++++++++++++++++++++++++++++++++++
 tests/App.test.tsx            |  5 +++++
 tests/SaveLoader.test.tsx     | 34 ++++++++++++++++++++++++++++++++++
 4 files changed, 94 insertions(+), 1 deletion(-)

Diff:
diff --git a/src/App.tsx b/src/App.tsx
index c732b16..626bea0 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -1,7 +1,25 @@
+import { useState } from 'react';
+import SaveLoader from './components/SaveLoader';
+
 export default function App() {
+  const [saveLoaded, setSaveLoaded] = useState<boolean>(false);
+  const [bufferSize, setBufferSize] = useState<number | null>(null);
+
+  const handleFileLoad = (buffer: ArrayBuffer) => {
+    setSaveLoaded(true);
+    setBufferSize(buffer.byteLength);
+    console.log('Save file loaded, size:', buffer.byteLength);
+  };
+
   return (
     <div className="min-h-screen bg-gray-900 text-white p-8">
-      <h1 className="text-3xl font-bold">Nuzlocke Save Tracker</h1>
+      <h1 className="text-3xl font-bold mb-6">Nuzlocke Save Tracker</h1>
+      <SaveLoader onFileLoad={handleFileLoad} />
+      {saveLoaded && bufferSize !== null && (
+        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
+          <p className="text-green-400 font-medium">Save file loaded successfully ({bufferSize} bytes)</p>
+        </div>
+      )}
     </div>
   );
 }
diff --git a/src/components/SaveLoader.tsx b/src/components/SaveLoader.tsx
new file mode 100644
index 0000000..df01366
--- /dev/null
+++ b/src/components/SaveLoader.tsx
@@ -0,0 +1,36 @@
+import React from 'react';
+
+interface Props {
+  onFileLoad: (buffer: ArrayBuffer) => void;
+}
+
+export default function SaveLoader({ onFileLoad }: Props) {
+  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
+    const file = e.target.files?.[0];
+    if (!file) return;
+    const reader = new FileReader();
+    reader.onload = (event) => {
+      const buffer = event.target?.result as ArrayBuffer;
+      if (buffer) {
+        onFileLoad(buffer);
+      }
+    };
+    reader.readAsArrayBuffer(file);
+  };
+
+  return (
+    <div className="p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700">
+      <label htmlFor="save-upload" className="block text-sm font-medium text-gray-300 mb-2">
+        Upload Save File (.sav)
+      </label>
+      <input 
+        id="save-upload"
+        type="file" 
+        accept=".sav,.dsv" 
+        aria-label="Upload Save File"
+        onChange={handleFileChange}
+        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" 
+      />
+    </div>
+  );
+}
diff --git a/tests/App.test.tsx b/tests/App.test.tsx
index cb047fe..afc82bb 100644
--- a/tests/App.test.tsx
+++ b/tests/App.test.tsx
@@ -1,10 +1,15 @@
 import { describe, it, expect } from 'vitest';
 import { render, screen } from '@testing-library/react';
 import App from '../src/App';
 
 describe('App Component', () => {
   it('renders the title', () => {
     render(<App />);
     expect(screen.getByText('Nuzlocke Save Tracker')).toBeDefined();
   });
+
+  it('renders SaveLoader component', () => {
+    render(<App />);
+    expect(screen.getByLabelText(/Upload Save File/i)).toBeDefined();
+  });
 });
diff --git a/tests/SaveLoader.test.tsx b/tests/SaveLoader.test.tsx
new file mode 100644
index 0000000..263d630
--- /dev/null
+++ b/tests/SaveLoader.test.tsx
@@ -0,0 +1,34 @@
+import { describe, it, expect, vi } from 'vitest';
+import { render, screen, fireEvent, waitFor } from '@testing-library/react';
+import SaveLoader from '../src/components/SaveLoader';
+
+describe('SaveLoader', () => {
+  it('renders a file input with label', () => {
+    const onFileLoad = vi.fn();
+    render(<SaveLoader onFileLoad={onFileLoad} />);
+    const input = screen.getByLabelText(/Upload Save File/i);
+    expect(input).toBeDefined();
+    expect(input.getAttribute('type')).toBe('file');
+  });
+
+  it('reads selected .sav file and calls onFileLoad with ArrayBuffer', async () => {
+    const onFileLoad = vi.fn();
+    render(<SaveLoader onFileLoad={onFileLoad} />);
+
+    const input = screen.getByLabelText(/Upload Save File/i);
+    
+    // Create a mock binary file
+    const fileContent = new Uint8Array([0x50, 0x4f, 0x4b, 0x45]); // "POKE"
+    const file = new File([fileContent.buffer], 'pokemon_emerald.sav', { type: 'application/octet-stream' });
+
+    fireEvent.change(input, { target: { files: [file] } });
+
+    await waitFor(() => {
+      expect(onFileLoad).toHaveBeenCalledTimes(1);
+    });
+
+    const callArg = onFileLoad.mock.calls[0][0];
+    expect(callArg).toBeInstanceOf(ArrayBuffer);
+    expect(new Uint8Array(callArg)).toEqual(fileContent);
+  });
+});

