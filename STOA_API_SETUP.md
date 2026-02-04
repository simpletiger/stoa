# Stoa API Setup Guide

This document describes how Stoa connects to the local API server on Mac mini for file access.

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│  Stoa (Vercel)      │ ◄─────► │  Stoa API Server     │ ◄─────► │  ~/clawd files  │
│  - Next.js app      │  HTTPS  │  - Express on Mac    │   FS    │  - Memory       │
│  - Public interface │         │  - Port 3001         │         │  - Config       │
└─────────────────────┘         └──────────────────────┘         └─────────────────┘
```

## Problem Solved

Stoa is deployed on Vercel (serverless) and cannot directly access files on the Mac mini (`~/clawd`, memory files, OpenClaw config). This API bridge allows Stoa to:

1. Read/write files in `~/clawd`
2. List and search memory files
3. Access OpenClaw skills
4. Read/write OpenClaw configuration

## Components

### 1. Stoa API Server (`~/stoa-api/`)

Local Express server running on Mac mini:
- **Port:** 3001
- **Auto-start:** macOS launch agent
- **Security:** Bearer token authentication, CORS, rate limiting
- **Endpoints:**
  - `POST /api/file/read` - Read file content
  - `POST /api/file/write` - Write file content
  - `GET /api/memory/list` - List memory files
  - `GET /api/memory/search` - Search memory files
  - `GET /api/skills/list` - List OpenClaw skills
  - `GET /api/config` - Read OpenClaw config
  - `POST /api/config` - Write OpenClaw config

### 2. Stoa API Client (`~/stoa/lib/stoa-api.ts`)

TypeScript client for Stoa to connect to the API server:
- Handles authentication
- Type-safe methods for all endpoints
- Error handling

### 3. Updated API Routes

All Stoa API routes (`~/stoa/app/api/*`) now proxy to the local API server instead of direct filesystem access:
- `/app/api/files/save/route.ts` - File writing
- `/app/api/memory/route.ts` - Memory operations
- `/app/api/config/route.ts` - Config operations
- `/app/api/skills/route.ts` - Skills listing

## Local Development Setup

### 1. Start the API Server

```bash
cd ~/stoa-api
npm start
```

Or install as service to auto-start:

```bash
cp ~/stoa-api/com.stoa.api.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.stoa.api.plist
launchctl start com.stoa.api
```

### 2. Configure Environment Variables

Edit `~/stoa/.env.local`:

```bash
STOA_API_URL=http://localhost:3001
STOA_API_TOKEN=da45594a332c0d551b976de89a46826e244d59a4539b47372be5cd86e161efdd
```

### 3. Run Stoa

```bash
cd ~/stoa
npm run dev
```

Visit http://localhost:3000 and test file operations.

## Vercel Deployment Setup

### 1. Get Mac Mini Public IP or Domain

You need a way for Vercel to reach your Mac mini. Options:

**Option A: Tailscale Funnel (Recommended)**
```bash
# Install Tailscale
brew install tailscale

# Start Tailscale
sudo tailscale up

# Enable Funnel for port 3001
tailscale funnel 3001
```

This gives you a public URL like: `https://your-machine.ts.net`

**Option B: Dynamic DNS + Port Forwarding**
- Set up Dynamic DNS (e.g., DuckDNS, No-IP)
- Forward port 3001 on your router to Mac mini
- Use your dynamic DNS URL

**Option C: Cloudflare Tunnel**
```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create stoa-api

# Route traffic
cloudflared tunnel route dns stoa-api api.yourdomain.com

# Run tunnel
cloudflared tunnel run --url http://localhost:3001 stoa-api
```

### 2. Update Stoa API Server CORS

Edit `~/stoa-api/.env`:

```bash
ALLOWED_ORIGIN=https://stoa-two.vercel.app
```

Restart the API server:

```bash
launchctl stop com.stoa.api && launchctl start com.stoa.api
```

### 3. Configure Vercel Environment Variables

In Vercel project settings, add:

```
STOA_API_URL=https://your-public-url
STOA_API_TOKEN=da45594a332c0d551b976de89a46826e244d59a4539b47372be5cd86e161efdd
```

### 4. Deploy

```bash
cd ~/stoa
git add .
git commit -m "Add Stoa API integration"
git push origin main
```

Vercel will auto-deploy.

## Testing

### Test API Server

```bash
cd ~/stoa-api
npm test
```

### Test Stoa Integration

```bash
# Start API server
cd ~/stoa-api && npm start

# In another terminal, start Stoa
cd ~/stoa && npm run dev

# Visit http://localhost:3000 and test:
# - Memory page (list and search)
# - Config editor
# - Skills page
# - File operations
```

## Troubleshooting

### Stoa can't connect to API server

1. **Check API server is running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check environment variables:**
   ```bash
   cat ~/stoa/.env.local | grep STOA_API
   ```

3. **Check CORS settings:**
   - Localhost should be allowed in development
   - Vercel domain must be in `ALLOWED_ORIGIN` for production

### API returns 401 Unauthorized

- Verify `STOA_API_TOKEN` matches in both `.env` files
- Check Authorization header is being sent

### API returns 403 Forbidden

- CORS issue - check `ALLOWED_ORIGIN` setting
- Verify request origin matches allowed origin

### File operations fail

- Check file paths are relative to `~/clawd`
- Verify permissions on files/directories
- Check API server logs: `tail -f ~/stoa-api/logs/error.log`

## Security Notes

1. **API Token:** Keep the token secret! Never commit to GitHub.
2. **CORS:** Only allow Stoa's Vercel domain in production.
3. **Firewall:** If exposing publicly, use Tailscale Funnel or Cloudflare Tunnel for encryption.
4. **Rate Limiting:** API has built-in rate limiting (100 req/15min per IP).
5. **Path Validation:** API validates all file paths to prevent directory traversal.

## API Token

```
da45594a332c0d551b976de89a46826e244d59a4539b47372be5cd86e161efdd
```

Add this to Vercel environment variables. Do NOT commit to GitHub!

## Next Steps

1. ✅ API server built and running
2. ✅ Stoa updated to use API
3. ⏳ Choose public access method (Tailscale/DNS/Cloudflare)
4. ⏳ Update CORS for Vercel domain
5. ⏳ Add Vercel environment variables
6. ⏳ Deploy to Vercel
7. ⏳ Test production deployment

## Resources

- API Server: `~/stoa-api/`
- API Documentation: `~/stoa-api/README.md`
- API Client: `~/stoa/lib/stoa-api.ts`
- Stoa Routes: `~/stoa/app/api/`
