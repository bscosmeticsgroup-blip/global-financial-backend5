const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'global-financial-backend2',
    status: 'ok',
    message: 'API is running.'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'global-financial-backend2',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/wfirma-sync', async (req, res) => {
  try {
    res.status(200).json({
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
