# Stoa API Server Setup Guide

The Stoa dashboard needs a local API server running on your Mac mini to access files, config, and control the gateway.

## Quick Start

```bash
cd ~/stoa/server
chmod +x setup.sh
./setup.sh
```

This will:
1. Install dependencies
2. Generate a secure API token
3. Create `.env` file
4. Build the server
5. Configure the launchd service

## Manual Setup

If you prefer to set up manually:

### 1. Install Dependencies

```bash
cd ~/stoa/server
npm install
```

### 2. Create Environment File

```bash
# Generate a secure token
TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Create .env file
cat > .env << EOF
PORT=3001
STOA_API_TOKEN=$TOKEN
EOF

# Print the token for later use
echo "Your API token: $TOKEN"
```

### 3. Build the Server

```bash
npm run build
```

### 4. Test Locally

```bash
npm run dev
```

Visit http://localhost:3001/health - you should see:
```json
{"success":true,"status":"healthy","timestamp":"..."}
```

### 5. Install as Service

```bash
# Update the plist with your token
sed "s/REPLACE_WITH_YOUR_SECRET_TOKEN/$TOKEN/g" com.stoa.api.plist > ~/Library/LaunchAgents/com.stoa.api.plist

# Create logs directory
mkdir -p logs

# Load and start the service
launchctl load ~/Library/LaunchAgents/com.stoa.api.plist
launchctl start com.stoa.api

# Check it's running
launchctl list | grep stoa
```

### 6. Configure Stoa Dashboard

#### For Local Development

Create `.env.local` in the main Stoa directory (~/stoa):

```bash
STOA_API_URL=http://localhost:3001
STOA_API_TOKEN=your-token-here
```

#### For Production (Vercel)

Add environment variables in Vercel dashboard:

```
STOA_API_URL=http://your-mac-mini-ip:3001
STOA_API_TOKEN=your-token-here
```

**Note:** For production, you'll need to either:
- Expose port 3001 on your Mac mini (not recommended for security)
- Use a VPN/tunnel (recommended)
- Run the dashboard locally instead of Vercel

## Features Now Available

With the server running, you can:

### ✅ Config Page
- View and edit OpenClaw configuration
- Real-time JSON validation
- Automatic backups before changes
- Changes take effect on gateway restart

### ✅ Heartbeat Page
- View current heartbeat frequency
- Adjust interval (5-240 minutes)
- Quick presets (15, 30, 60, 120 minutes)
- View heartbeat prompt
- Gateway status and control
- **Restart Gateway button** - safely restart OpenClaw

### ✅ Files Page (NEW!)
- Browse all files in ~/clawd
- Edit existing files
- **Create new files** (like SHIELD.md)
- Auto-save with status feedback
- Real-time file list updates

### ✅ Soul, Agents, User, Tools, Identity Pages
- Full edit capabilities
- Changes sync immediately
- File-based persistence

## Troubleshooting

### Server Won't Start

**Check port availability:**
```bash
lsof -i :3001
```

If something is using port 3001, either:
- Kill that process
- Change PORT in .env to another value (e.g., 3002)

**Check logs:**
```bash
tail -f ~/stoa/server/logs/stdout.log
tail -f ~/stoa/server/logs/stderr.log
```

### Dashboard Can't Connect

**Verify server is running:**
```bash
curl http://localhost:3001/health
```

Should return: `{"success":true,...}`

**Check environment variables:**
```bash
# In ~/stoa directory
cat .env.local | grep STOA_API
```

Make sure token matches!

### Gateway Restart Fails

**Verify OpenClaw is installed:**
```bash
which openclaw
openclaw gateway status
```

**Check permissions:**
The user running the server needs permission to run `openclaw gateway restart`.

### File Operations Fail

**Check clawd directory exists:**
```bash
ls -la ~/clawd
```

**Verify permissions:**
```bash
ls -ld ~/clawd
```

Should be owned by your user and writable.

## Security Notes

- The API token is a secret - treat it like a password
- Never commit .env files to git (.gitignore handles this)
- The server only accepts connections from localhost by default
- File operations are restricted to ~/clawd directory
- Config operations are restricted to ~/.openclaw/config.json

## Managing the Service

**Stop:**
```bash
launchctl stop com.stoa.api
```

**Start:**
```bash
launchctl start com.stoa.api
```

**Restart:**
```bash
launchctl stop com.stoa.api && launchctl start com.stoa.api
```

**Unload (disable autostart):**
```bash
launchctl unload ~/Library/LaunchAgents/com.stoa.api.plist
```

**Reload (after changes):**
```bash
launchctl unload ~/Library/LaunchAgents/com.stoa.api.plist
launchctl load ~/Library/LaunchAgents/com.stoa.api.plist
```

**View status:**
```bash
launchctl list | grep stoa
```

**View logs:**
```bash
tail -f ~/stoa/server/logs/stdout.log
```

## Development Workflow

When working on the server:

1. Make changes to `server/index.ts`
2. Run in dev mode: `npm run dev` (auto-reloads on changes)
3. Test with curl or the dashboard
4. When ready for production:
   ```bash
   npm run build
   launchctl stop com.stoa.api
   launchctl start com.stoa.api
   ```

## Next Steps

Once the server is running:

1. **Test the heartbeat page** - adjust your check-in frequency
2. **Try the Files page** - create SHIELD.md or other workspace files
3. **Use the Config page** - adjust OpenClaw settings
4. **Test Gateway restart** - make sure it works from the dashboard

Enjoy your fully-connected Stoa dashboard! 🏛️
