#!/bin/bash

# ur-money Installation Script
# This script installs and starts ur-money

set -e

echo "=================================="
echo "  💰 ur-money Installation"
echo "=================================="
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✓ Docker and Docker Compose found"
    echo ""
    echo "Starting ur-money with Docker..."
    docker compose up -d
    echo ""
    echo "✓ ur-money is now running!"
    echo ""
    echo "Access the application at: http://localhost:3001"
    echo ""
    echo "To stop: docker compose down"
    echo "To view logs: docker compose logs -f"
elif command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo "✓ Node.js and npm found"
    echo ""
    echo "Installing dependencies..."
    npm install
    
    echo "Installing client dependencies..."
    cd client
    npm install
    cd ..
    
    echo "Building React frontend..."
    npm run build
    
    echo ""
    echo "✓ Installation complete!"
    echo ""
    echo "Starting ur-money..."
    echo "To stop the server, use: pkill -f 'node server/index.js'"
    npm start
else
    echo "❌ Error: Neither Docker nor Node.js found"
    echo ""
    echo "Please install one of the following:"
    echo "  1. Docker and Docker Compose (recommended)"
    echo "  2. Node.js (v14 or higher) and npm"
    echo ""
    echo "For more information, see README.md"
    exit 1
fi
