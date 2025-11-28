const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const { findByRnc, search } = require('./dataLoader');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '1mb' }));

// Serve the static UI for testing under /ui
app.use('/ui', express.static(path.join(__dirname, 'public')));

// If someone visits /ui, an index.html will be served automatically by express.static.

app.get('/', (req, res) => {
  res.send({ name: 'RNC Lookup API', version: '1.0.0', docs: '/api', ui: '/ui' });
});

app.get('/api', (req, res) => {
  res.json({
    routes: {
      exact: '/api/rnc/:rnc - GET exact match (9 digits or formatted)',
      search: '/api/search?query=:text&limit=10 - GET partial search (name, commercial name, RNC partial)',
      // bulk endpoint removed; use /api/rnc/:rnc or /api/search
    }
  });
});

// health check endpoint used by the UI to detect if backend is up
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', pid: process.pid, time: new Date().toISOString() });
});

app.get('/api/rnc/:rnc', async (req, res) => {
  const { rnc } = req.params;
  try {
    const found = await findByRnc(rnc);
    if (!found) return res.status(404).json({ error: 'RNC no encontrado' });
    return res.json(found);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error de servidor' });
  }
});

app.get('/api/search', async (req, res) => {
  const { query = '', limit = '20' } = req.query;
  const nlimit = Math.min(parseInt(limit, 10) || 20, 200);
  try {
    const results = await search(query, nlimit);
    res.json({ total: results.length, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error de servidor' });
  }
});

// NOTE: bulk lookup endpoint removed in favor of single unified search (client UI)

const os = require('os');

const HOST = process.env.HOST || '::'; // bind both IPv6 and IPv4 (dual-stack) when possible

app.listen(PORT, HOST, () => {
  console.log(`RNC Lookup API listening on http://${HOST}:${PORT} (dual-stack)`);
  console.log(`PID: ${process.pid}`);
  const nets = os.networkInterfaces();
  Object.keys(nets).forEach((name) => {
    for (const net of nets[name]) {
      // show IPv4 and IPv6 addresses for clarity
      if (net.family === 'IPv4' || net.family === 'IPv6') console.log(` - ${name}: ${net.address} (${net.family})`);
    }
  });
});
