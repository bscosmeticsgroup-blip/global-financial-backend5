# global-financial-backend5

Backend for Global Financial OS built with Node.js and Express.

## Overview
This service exposes a lightweight API used for health checks and basic integration status.

## Endpoints
- GET /
- GET /health
- GET /api
- GET /api/status
- GET /api/wfirma-sync

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
