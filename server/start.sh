#!/bin/bash
# Stoa API Server Startup Script

cd "$(dirname "$0")"

# Load environment variables
export $(cat .env | xargs)

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the server
exec /opt/homebrew/bin/node dist/index.js >> logs/stdout.log 2>> logs/stderr.log
