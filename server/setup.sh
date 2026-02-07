#!/bin/bash
# Stoa API Server Setup Script

set -e

echo "🏛️  Stoa API Server Setup"
echo "========================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from ~/stoa/server directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate token if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "🔐 Generating secure API token..."
    TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    cat > .env << EOF
PORT=3001
STOA_API_TOKEN=$TOKEN
EOF
    
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Add this to your Stoa dashboard environment variables:"
    echo "   STOA_API_URL=http://localhost:3001"
    echo "   STOA_API_TOKEN=$TOKEN"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Create logs directory
mkdir -p logs
echo "✅ Created logs directory"

# Build the server
echo "🔨 Building server..."
npm run build

# Update launchd plist with actual token
if [ -f ".env" ]; then
    source .env
    sed "s/REPLACE_WITH_YOUR_SECRET_TOKEN/$STOA_API_TOKEN/g" com.stoa.api.plist > com.stoa.api.configured.plist
    echo "✅ Configured launchd plist"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Test the server: npm run dev"
echo "2. Install as service:"
echo "   cp com.stoa.api.configured.plist ~/Library/LaunchAgents/com.stoa.api.plist"
echo "   launchctl load ~/Library/LaunchAgents/com.stoa.api.plist"
echo "   launchctl start com.stoa.api"
echo ""
echo "3. Add environment variables to Stoa dashboard (Vercel or .env.local)"
echo ""
