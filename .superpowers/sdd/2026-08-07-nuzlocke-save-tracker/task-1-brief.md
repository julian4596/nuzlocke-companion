### Task 1: Initialize Vite React TypeScript Project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `tailwind.config.js`, `postcss.config.js`, `src/index.css`
- Test: `tests/setup.ts`

**Interfaces:**
- Consumes: None
- Produces: A running Vite dev server and passing Vitest test harness.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/App.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  it('renders the title', () => {
    render(<App />);
    expect(screen.getByText('Nuzlocke Save Tracker')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL because Vite/React/Vitest are not set up and `App.tsx` does not exist.

- [ ] **Step 3: Write minimal implementation**

Execute `npx -y create-vite@latest . --template react-ts` (force-overwrite if needed, or scaffold manually).
Install Tailwind CSS, Vitest, React Testing Library.
Configure `tailwind.config.js` and `vite.config.ts`.
Create `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold">Nuzlocke Save Tracker</h1>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold Vite React TS project with Tailwind and Vitest"
```
