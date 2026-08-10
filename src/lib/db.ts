import { get, set } from 'idb-keyval';
import { SavedRun } from './types';

const STORE_KEY = 'nuzlocke_runs';

export async function getRuns(): Promise<SavedRun[]> {
  const runs = await get<SavedRun[]>(STORE_KEY);
  return runs || [];
}

export async function saveRun(run: SavedRun): Promise<void> {
  const runs = await getRuns();
  const existingIndex = runs.findIndex(r => r.id === run.id);
  
  if (existingIndex >= 0) {
    runs[existingIndex] = run;
  } else {
    runs.push(run);
  }
  
  await set(STORE_KEY, runs);
}

export async function deleteRun(id: string): Promise<void> {
  let runs = await getRuns();
  runs = runs.filter(r => r.id !== id);
  await set(STORE_KEY, runs);
}
