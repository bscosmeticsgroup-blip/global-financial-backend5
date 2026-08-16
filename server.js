const express = require('express');
const cors = require('cors');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const WFIRMA_API_URL = process.env.WFIRMA_API_URL || '';
const WFIRMA_API_TOKEN = process.env.WFIRMA_API_TOKEN || '';
const WFIRMA_API_KEY = process.env.WFIRMA_API_KEY || '';

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const toJsonError = (status, error, details) => ({
  status: 'error',
  error,
  details,
  httpStatus: status
});

const getForwardHeaders = (req, extraHeaders = {}) => {
  const incomingAuth = req?.headers?.authorization;
  const incomingApiKey = req?.headers?.['x-api-key'];

  const headers = {
    Accept: 'application/json',
    ...extraHeaders
  };

  if (incomingAuth) {
    headers.Authorization = incomingAuth;
  } else if (WFIRMA_API_TOKEN) {
    headers.Authorization = `Bearer ${WFIRMA_API_TOKEN}`;
  }

  if (incomingApiKey) {
    headers['X-API-Key'] = incomingApiKey;
  } else if (WFIRMA_API_KEY) {
    headers['X-API-Key'] = WFIRMA_API_KEY;
  }

  return headers;
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);

  const contentType = response.headers.get('content-type') || '';
  const rawText = await response.text();
  const payload = contentType.includes('application/json') && rawText ? JSON.parse(rawText) : rawText;

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    payload
  };
};

app.use(cors());
app.use(express.json({ limit: '1mb', strict: true }));
app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms ${req.ip || 'unknown-ip'}`
    );
  });

  next();
});

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

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

app.get('/api/wfirma-sync', async (req, res) => {
  try {
    if (WFIRMA_API_URL) {
      const upstream = await fetchJson(`${WFIRMA_API_URL.replace(/\/$/, '')}/invoices`, {
        method: 'GET',
        headers: getForwardHeaders(req)
      });

      if (!upstream.ok) {
        return res.status(upstream.status || 502).json(
          toJsonError(upstream.status || 502, 'Upstream wFirma request failed', upstream.payload)
        );
      }

      const invoices = Array.isArray(upstream.payload) ? upstream.payload : upstream.payload?.invoices || [];
      return res.status(200).json({
        status: 'ok',
        source: 'wfirma-api',
        count: invoices.length,
        invoices,
        message: 'Data synced from wFirma API.'
      });
    }

    const payload = {
      status: 'ok',
      source: 'sample-data',
      count: 2,
      invoices: buildSampleInvoices(),
      message: 'Backend Render działa poprawnie. Poniżej przykładowe dane wFirma.'
    };

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json(toJsonError(500, 'wfirma sync failed', error.message));
  }
});

app.get('/api/wfirma-sync/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length === 0) {
      return res.status(400).json(toJsonError(400, 'Validation failed', 'Route param id is required.'));
    }

    if (WFIRMA_API_URL) {
      const upstream = await fetchJson(`${WFIRMA_API_URL.replace(/\/$/, '')}/invoices/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: getForwardHeaders(req)
      });

      if (!upstream.ok) {
        return res.status(upstream.status || 404).json(
          toJsonError(upstream.status || 404, 'wFirma invoice request failed', upstream.payload)
        );
      }

      return res.status(200).json({
        status: 'ok',
        source: 'wfirma-api',
        invoice: upstream.payload || null,
        message: 'Invoice loaded successfully from wFirma API.'
      });
    }

    const sampleInvoices = buildSampleInvoices();
    const invoice = sampleInvoices.find((item) => item.id === id || item.number === id) || null;

    if (!invoice) {
      return res.status(404).json(toJsonError(404, 'Invoice not found', `No sample invoice found for id: ${id}`));
    }

    return res.status(200).json({
      status: 'ok',
      source: 'sample-data',
      invoice,
      message: 'Invoice loaded successfully from sample data.'
    });
  } catch (error) {
    return res.status(500).json(toJsonError(500, 'wfirma sync request failed', error.message));
  }
});

app.post('/api/wfirma-sync', async (req, res) => {
  try {
    const body = req.body;

    if (!isPlainObject(body)) {
      return res.status(400).json(toJsonError(400, 'Invalid request body', 'Expected a JSON object.'));
    }

    const { customerId, syncType = 'full' } = body;

    if (!customerId || typeof customerId !== 'string' || customerId.trim().length === 0) {
      return res.status(400).json(
        toJsonError(400, 'Validation failed', 'Field customerId is required and must be a non-empty string.')
      );
    }

    const allowedSyncTypes = ['full', 'incremental'];
    if (!allowedSyncTypes.includes(syncType)) {
      return res.status(400).json(
        toJsonError(400, 'Validation failed', `syncType must be one of: ${allowedSyncTypes.join(', ')}`)
      );
    }

    if (WFIRMA_API_URL) {
      const upstream = await fetchJson(`${WFIRMA_API_URL.replace(/\/$/, '')}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getForwardHeaders(req)
        },
        body: JSON.stringify({ customerId, syncType, payload: body })
      });

      if (!upstream.ok) {
        return res.status(upstream.status || 502).json(
          toJsonError(upstream.status || 502, 'Upstream wFirma sync failed', upstream.payload)
        );
      }

      return res.status(200).json({
        status: 'ok',
        source: 'wfirma-api',
        ...((typeof upstream.payload === 'object' && upstream.payload !== null) ? upstream.payload : { payload: upstream.payload }),
        message: 'wFirma synchronization completed successfully via upstream API.'
      });
    }

    const sampleInvoices = buildSampleInvoices();
    return res.status(200).json({
      status: 'ok',
      source: 'sample-data',
      customerId,
      syncType,
      count: sampleInvoices.length,
      invoices: sampleInvoices,
      message: 'wFirma synchronization completed successfully.'
    });
  } catch (error) {
    return res.status(500).json(toJsonError(500, 'wfirma sync failed', error.message));
  }
});

app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json(
      toJsonError(400, 'Invalid JSON payload', 'The request body contains malformed JSON.')
    );
  }

  console.error('Unhandled error:', err);
  return res.status(500).json(
    toJsonError(500, 'Internal server error', err && err.message ? err.message : 'Unexpected server failure.')
  );
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
