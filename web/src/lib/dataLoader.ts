import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export interface RncRecord {
  rnc: string;
  razonSocial: string;
  nombreComercial: string;
  actividadEconomica?: string;
  fechaConstitucion?: string;
  estado?: string;
  regimenPagos?: string;
  [key: string]: any;
}

const DATA_DIR = path.join(process.cwd(), 'data');

// Cache for loaded prefixes
const prefixCache = new Map<string, Record<string, RncRecord> | null>();

function normalizeRnc(rnc: string): string {
  return String(rnc).replace(/[^0-9]/g, '');
}

async function loadPrefix(prefix: string): Promise<Record<string, RncRecord> | null> {
  if (!/^[0-9]{3}$/.test(prefix)) return null;

  if (prefixCache.has(prefix)) return prefixCache.get(prefix) || null;

  const filePath = path.join(DATA_DIR, `${prefix}.json`);

  if (!existsSync(filePath)) {
    prefixCache.set(prefix, null);
    return null;
  }

  try {
    const content = await fs.readFile(filePath, { encoding: 'utf8' });
    const data = JSON.parse(content);
    prefixCache.set(prefix, data);
    return data;
  } catch (err) {
    console.error('Failed to parse JSON', filePath, err);
    prefixCache.set(prefix, null);
    return null;
  }
}

export async function findByRnc(rawRnc: string): Promise<RncRecord | null> {
  const rnc = normalizeRnc(rawRnc);
  if (!/^[0-9]{9}$/.test(rnc)) return null;
  const prefix = rnc.substring(0, 3);
  const bucket = await loadPrefix(prefix);
  if (!bucket) return null;
  return bucket[rnc] || null;
}

export async function search(query: string, limit: number = 20): Promise<RncRecord[]> {
  const q = String(query).toLowerCase().trim();
  if (!q) return [];

  let files: string[] = [];
  try {
    files = await fs.readdir(DATA_DIR);
  } catch (e) {
    console.error("Data dir not found", e);
    return [];
  }

  const results: RncRecord[] = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const prefix = file.replace('.json', '');
    const bucket = await loadPrefix(prefix);
    if (!bucket) continue;

    for (const rnc in bucket) {
      if (results.length >= limit) break;
      const rec = bucket[rnc];

      if (rnc.includes(q) ||
        (rec.razonSocial && rec.razonSocial.toLowerCase().includes(q)) ||
        (rec.nombreComercial && rec.nombreComercial.toLowerCase().includes(q))) {
        results.push(rec);
      }
    }
    if (results.length >= limit) break;
  }
  return results;
}
