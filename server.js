const express = require('express');
const cors = require('cors');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'global-financial-backend2',
    status: 'ok',
    message: 'API is running.',
    endpoints: {
      health: '/health',
      api: '/api',
      status: '/api/status',
      wfirmaSync: '/api/wfirma-sync'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'global-financial-backend2',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    service: 'global-financial-backend2',
    status: 'ok',
    description: 'Backend for Global Financial OS',
    availableEndpoints: [
      '/health',
      '/api',
      '/api/status',
      '/api/wfirma-sync'
    ],
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  const memory = process.memoryUsage();

  res.status(200).json({
    status: 'ok',
    service: 'global-financial-backend2',
    uptimeSeconds: Number(process.uptime().toFixed(2)),
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: {
      rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/wfirma-sync', async (req, res) => {
  try {
    res.status(200).json({
      status: 'ok',
      count: 0,
      invoices: [],
      message: 'Backend Render działa poprawnie. Brak danych wFirma.'
    });
  } catch (error) {
    res.status(500).json({
      error: 'wfirma sync failed',
      details: error.message
    });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
