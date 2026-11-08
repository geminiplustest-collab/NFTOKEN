/**
 * Netflix Gen 2.0 — JIYYAD TOOLS
 * Proxy → https://nftoken.zone.id/api/auto-generate
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const API = process.env.NFTOKEN_API || 'https://nftoken.zone.id/api/auto-generate';
const MAX_RETRIES = 3;

app.use(cors());
app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

async function generateOnce() {
  const { data, status } = await axios.post(
    API,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      timeout: 20000,
      validateStatus: () => true,
    }
  );
  return { data, status };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'Netflix Gen 2.0', brand: 'JIYYAD TOOLS' });
});

app.post('/api/generate', async (req, res) => {
  const start = Date.now();
  let lastErr = 'Gagal generate';
  try {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const { data } = await generateOnce();
      if (data && data.success && data.token) {
        return res.json({
          status: true,
          time: `${Date.now() - start}ms`,
          result: {
            token: data.token,
            expiry: data.expiry,
            profile: data.profile || {},
            links: data.links || {},
            type: data.type,
          },
        });
      }
      lastErr = data?.error || data?.message || 'Gagal generate link. Coba lagi nanti.';
      if (i < MAX_RETRIES - 1) await new Promise((r) => setTimeout(r, 1000));
    }
    res.json({ status: false, error: lastErr, time: `${Date.now() - start}ms` });
  } catch (e) {
    res.status(500).json({
      status: false,
      error: e.message || 'Error server',
      time: `${Date.now() - start}ms`,
    });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Netflix Gen 2.0 → http://localhost:${PORT}`));
