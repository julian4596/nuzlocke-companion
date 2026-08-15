import '@testing-library/jest-dom';
import { vi } from 'vitest';

const memoryStore = new Map<string, any>();

vi.mock('idb-keyval', () => ({
  get: vi.fn(async (key: string) => memoryStore.get(key)),
  set: vi.fn(async (key: string, val: any) => { memoryStore.set(key, val); }),
  del: vi.fn(async (key: string) => { memoryStore.delete(key); }),
  clear: vi.fn(async () => { memoryStore.clear(); }),
}));

const localStore = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => localStore.get(key) || null,
  setItem: (key: string, value: string) => localStore.set(key, value.toString()),
  removeItem: (key: string) => localStore.delete(key),
  clear: () => localStore.clear(),
  length: 0,
  key: (i: number) => Array.from(localStore.keys())[i] || null,
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});
