# OnlyFans Puppeteer Service

A Node.js service that handles real OnlyFans browser automation using Puppeteer. This service runs separately from your main application to handle browser automation tasks that cannot be performed in Supabase Edge Functions.

## Features

- Real browser automation with Puppeteer
- Anti-detection measures (stealth mode)
- Rate limiting and security
- Production-ready with Chromium
- CORS and security headers
- Session tracking

## Quick Setup

### Local Development

1. Install dependencies:
```bash
cd nodejs-puppeteer-service
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start the service:
```bash
npm run dev
```

The service will run on `http://localhost:3001`

### Production Deployment

#### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard:
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=https://your-app-domain.com`

#### Option 2: Railway

1. Connect your GitHub repo to Railway
2. Set environment variables:
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=https://your-app-domain.com`

#### Option 3: Render

1. Connect your GitHub repo to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

#### Option 4: DigitalOcean App Platform

1. Create new app from GitHub repo
2. Set build command: `npm install`
3. Set run command: `npm start`
4. Configure environment variables

## API Endpoints

### POST /api/onlyfans/login

Performs OnlyFans login automation and extracts session data.

**Request:**
```json
{
  "username": "your_username",
  "password": "your_password", 
  "sessionId": "tracking_session_id"
}
```

**Response:**
```json
{
  "success": true,
  "cookies": [...],
  "localStorage": {...},
  "authHeaders": {...},
  "userAgent": "...",
  "sessionId": "tracking_session_id"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "onlyfans-puppeteer-service", 
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Security Features

- Rate limiting (10 requests per minute per IP)
- CORS protection
- Security headers with Helmet
- Input validation
- Anti-detection browser configuration
- Stealth mode Puppeteer setup

## Anti-Detection Measures

- Random user agents
- Random viewport sizes
- Disabled automation flags
- Human-like typing delays
- Network idle waiting
- JavaScript modifications to hide automation

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins

## Troubleshooting

### Chrome/Chromium Issues
If you encounter Chrome-related errors in production, ensure the hosting platform supports Puppeteer. Vercel and Railway work well with the `@sparticuz/chromium` package.

### Memory Issues
For memory-constrained environments, you can reduce Puppeteer's resource usage by adding these args:
```javascript
'--memory-pressure-off',
'--max_old_space_size=4096'
```

### Rate Limiting
The service includes rate limiting. If you need higher limits, modify the rate limit logic in the API route handlers.

## Integration

Update your Edge Function to call this service instead of using mock data. Replace the base URL with your deployed service URL:

```javascript
const PUPPETEER_SERVICE_URL = 'https://your-service.vercel.app';
```

## Legal Notice

This service is for legitimate automation purposes only. Users are responsible for complying with OnlyFans' Terms of Service and applicable laws. Use responsibly and ensure you have proper authorization for any accounts you automate.