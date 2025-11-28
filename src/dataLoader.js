const fs = require('fs');
const path = require('path');

// Path where procesar.js writes the JSON chunked files
const DATA_DIR = path.join(__dirname, '..', 'dist', 'sitio-para-netlify', 'data');

// Simple in-memory cache of loaded prefix files
const prefixCache = new Map();

function normalizeRnc(rnc) {
  return String(rnc).replace(/[^0-9]/g, '');
}

async function loadPrefix(prefix) {
  if (!/^[0-9]{3}$/.test(prefix)) throw new Error('Invalid prefix');

  if (prefixCache.has(prefix)) return prefixCache.get(prefix);

  const filePath = path.join(DATA_DIR, `${prefix}.json`);
  if (!fs.existsSync(filePath)) {
    prefixCache.set(prefix, null);
    return null;
  }

  const content = await fs.promises.readFile(filePath, { encoding: 'utf8' });
  try {
    const data = JSON.parse(content);
    prefixCache.set(prefix, data);
    return data;
  } catch (err) {
    console.error('Failed to parse JSON', filePath, err);
    prefixCache.set(prefix, null);
    return null;
  }
}

async function findByRnc(rawRnc) {
  const rnc = normalizeRnc(rawRnc);
  if (!/^[0-9]{9}$/.test(rnc)) return null;
  const prefix = rnc.substring(0, 3);
  const bucket = await loadPrefix(prefix);
  if (!bucket) return null;
  return bucket[rnc] || null;
}

// Partial search across the chunks — will scan files and stop when limit reached
async function search(query, limit = 20) {
  query = String(query).toLowerCase().trim();
  if (!query) return [];

  const files = await fs.promises.readdir(DATA_DIR);
  const results = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const prefix = file.replace('.json', '');
    const bucket = await loadPrefix(prefix);
    if (!bucket) continue;

    for (const rnc in bucket) {
      if (results.length >= limit) break;
      const rec = bucket[rnc];
      // search by rnc digits or by names
      if (rnc.includes(query) || (rec.razonSocial && rec.razonSocial.toLowerCase().includes(query)) || (rec.nombreComercial && rec.nombreComercial.toLowerCase().includes(query))) {
        results.push(rec);
      }
    }
    if (results.length >= limit) break;
  }
  return results;
}

module.exports = { loadPrefix, findByRnc, search };
