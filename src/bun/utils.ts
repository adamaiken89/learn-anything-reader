import { existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

export function normalizeModuleId(id: string | number): string {
  if (typeof id === 'number') return String(id).padStart(2, '0');
  return id;
}

export function subjectsDir(): string {
  const dev = join(process.cwd(), 'subjects');
  if (existsSync(dev)) return dev;
  return resolve(dirname(fileURLToPath(import.meta.url)), '..', 'subjects');
}

export function findSubjectsDir(): string | null {
  const dir = subjectsDir();
  return existsSync(dir) ? dir : null;
}
