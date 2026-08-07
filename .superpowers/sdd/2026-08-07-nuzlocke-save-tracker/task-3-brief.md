### Task 3: Implement File Uploader UI

**Files:**
- Create: `src/components/SaveLoader.tsx`
- Modify: `src/App.tsx`
- Create: `tests/SaveLoader.test.tsx`

**Interfaces:**
- Consumes: HTML5 File API events.
- Produces: Passes loaded `ArrayBuffer` up to `App.tsx` state.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/SaveLoader.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SaveLoader from '../src/components/SaveLoader';

describe('SaveLoader', () => {
  it('renders a file input', () => {
    const onFileLoad = vi.fn();
    render(<SaveLoader onFileLoad={onFileLoad} />);
    const input = screen.getByLabelText(/Upload Save File/i);
    expect(input).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/SaveLoader.test.tsx`
Expected: FAIL due to missing `SaveLoader.tsx`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/SaveLoader.tsx
import React from 'react';

interface Props {
  onFileLoad: (buffer: ArrayBuffer) => void;
}

export default function SaveLoader({ onFileLoad }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      onFileLoad(buffer);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700">
      <label htmlFor="save-upload" className="block text-sm font-medium text-gray-300 mb-2">Upload Save File (.sav)</label>
      <input 
        id="save-upload"
        type="file" 
        accept=".sav,.dsv" 
        aria-label="Upload Save File"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" 
      />
    </div>
  );
}
```

Modify `src/App.tsx` to include `<SaveLoader />` and log the buffer size on load.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/SaveLoader.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/SaveLoader.tsx tests/SaveLoader.test.tsx src/App.tsx
git commit -m "feat: add SaveLoader UI component for file uploading"
```
