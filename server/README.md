# Stoa API Server

Local API server that runs on your Mac mini to provide Stoa dashboard access to:
- ~/clawd workspace files
- OpenClaw configuration (~/.openclaw/config.json)
- Gateway control (restart, status)
- Memory files and search
- Skills directory
- Heartbeat configuration

## Setup

### 1. Install Dependencies

```bash
cd ~/stoa/server
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
PORT=3001
STOA_API_TOKEN=your-secret-token-here
```

**Generate a secure token:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save this token - you'll need to add it to your Stoa dashboard environment variables.

### 3. Build (Optional)

For production use:

```bash
npm run build
```

## Running

### Development Mode

```bash
npm run dev
```

This uses `tsx` to watch for changes and restart automatically.

### Production Mode

```bash
npm start
```

### As a Background Service (Recommended)

#### Using launchd (macOS)

1. **Edit the plist file** and update the token:

```bash
# Open the plist file
nano ~/stoa/server/com.stoa.api.plist

# Replace REPLACE_WITH_YOUR_SECRET_TOKEN with your actual token
```

2. **Create logs directory:**

```bash
mkdir -p ~/stoa/server/logs
```

3. **Build the server:**

```bash
cd ~/stoa/server
npm run build
```

4. **Copy plist to LaunchAgents:**

```bash
cp ~/stoa/server/com.stoa.api.plist ~/Library/LaunchAgents/
```

5. **Load and start the service:**

```bash
launchctl load ~/Library/LaunchAgents/com.stoa.api.plist
launchctl start com.stoa.api
```

6. **Check status:**

```bash
launchctl list | grep stoa
```

7. **View logs:**

```bash
tail -f ~/stoa/server/logs/stdout.log
tail -f ~/stoa/server/logs/stderr.log
```

#### Managing the Service

**Stop the service:**
```bash
launchctl stop com.stoa.api
```

**Restart the service:**
```bash
launchctl stop com.stoa.api
launchctl start com.stoa.api
```

**Unload the service:**
```bash
launchctl unload ~/Library/LaunchAgents/com.stoa.api.plist
```

**Reload after changes:**
```bash
launchctl unload ~/Library/LaunchAgents/com.stoa.api.plist
launchctl load ~/Library/LaunchAgents/com.stoa.api.plist
```

## Connecting Stoa Dashboard

Add these environment variables to your Vercel deployment:

```
STOA_API_URL=http://your-mac-mini-ip:3001
STOA_API_TOKEN=your-secret-token-here
```

**Local Development:**

Add to `.env.local` in the main Stoa directory (not server):

```
STOA_API_URL=http://localhost:3001
STOA_API_TOKEN=your-secret-token-here
```

## API Endpoints

### Health Check
```
GET /health
```

### Files
```
POST /api/file/read
POST /api/file/write
GET  /api/files/list?dir={optional}
```

### Memory
```
GET  /api/memory/list
GET  /api/memory/search?q={query}&limit={limit}
```

### Config
```
GET  /api/config
POST /api/config
```

### Heartbeat
```
GET  /api/heartbeat/config
POST /api/heartbeat/config
```

### Gateway
```
GET  /api/gateway/status
POST /api/gateway/restart
```

### Skills
```
GET  /api/skills/list
```

## Security

- All endpoints (except `/health`) require Bearer token authentication
- File operations are restricted to ~/clawd directory
- Config operations are restricted to ~/.openclaw/config.json
- Backups are created before config changes

## Troubleshooting

**Server won't start:**
- Check that port 3001 is available: `lsof -i :3001`
- Verify Node.js is installed: `node --version`
- Check logs: `tail -f ~/stoa/server/logs/*.log`

**Authentication errors:**
- Verify STOA_API_TOKEN matches in both server and dashboard
- Check Authorization header format: `Bearer {token}`

**File access errors:**
- Ensure ~/clawd directory exists
- Check file permissions
- Verify paths are within allowed directories

**Gateway restart fails:**
- Ensure openclaw CLI is installed: `which openclaw`
- Check OpenClaw is running: `openclaw gateway status`
- Verify user has permission to restart gateway

## Development

**Add new endpoints:**

1. Add handler in `server/index.ts`
2. Add function in `lib/stoa-api.ts`
3. Create Next.js API route in `app/api/`
4. Use in React components

**TypeScript:**

The server uses TypeScript with tsx for development. Types are inferred from Express and Node.js.

## Performance

- Average response time: < 50ms for file reads
- Memory usage: ~50MB
- CPU usage: < 1% idle, ~5% active

## License

MIT
