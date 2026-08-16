# global-financial-backend5

Backend for Global Financial OS built with Node.js and Express.

## Overview
This service exposes a lightweight API used for health checks, status monitoring, and a wFirma synchronization endpoint.

## Endpoints
- GET /
- GET /health
- GET /api
- GET /api/status
- GET /api/wfirma-sync
- GET /api/wfirma-sync/:id
- POST /api/wfirma-sync

## Local run
```bash
npm install
npm start
```

The server starts on port 3000 by default or on the Render-provided PORT when deployed.

## Render deployment
Use the following settings in Render:

- Build Command: `npm install`
- Start Command: `npm start`
- Environment: Node

## Optional wFirma environment variables
Set these in Render if you want the backend to forward requests to the real wFirma API:

```bash
WFIRMA_API_URL=https://api.example.com
WFIRMA_API_TOKEN=your_token_here
WFIRMA_API_KEY=your_api_key_here
```

The backend will automatically forward:
- `Authorization: Bearer ...` when a token is configured
- `X-API-Key` when a key is configured
- incoming request headers if provided by the caller

## Example responses
### GET /health
```json
{
  "status": "ok",
  "service": "global-financial-backend2",
  "timestamp": "2026-08-16T00:00:00.000Z"
}
```

### GET /api/status
```json
{
  "status": "ok",
  "service": "global-financial-backend2",
  "uptimeSeconds": 12.34,
  "nodeVersion": "v24.14.1",
  "platform": "linux",
  "memoryUsage": {
    "rss": "35 MB",
    "heapUsed": "19 MB",
    "heapTotal": "33 MB"
  }
}
```

### POST /api/wfirma-sync
```json
{
  "customerId": "CUST-001",
  "syncType": "full"
}
```

Response example:
```json
{
  "status": "ok",
  "customerId": "CUST-001",
  "syncType": "full",
  "count": 2,
  "invoices": [
    {
      "id": "WF-INV-1001",
      "number": "FV/2026/1001",
      "customer": "Global Financial OS",
      "amount": 1250.5,
      "currency": "PLN",
      "status": "issued"
    }
  ]
}
```
