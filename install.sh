#!/bin/bash

# 🚀 Figma AI Assistant - Easy Install Script
# This script helps you set up the backend with your credentials

echo "🚀 Figma AI Assistant - Backend Setup"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed"
    echo "Please install Docker Compose first"
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Stop and remove old container
echo "🧹 Cleaning up old containers..."
docker rm -f figma-ai-backend 2>/dev/null || true
docker-compose down 2>/dev/null || true
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ Found existing .env file"
    echo ""
    read -p "Do you want to use the existing .env file? (y/n): " use_existing
    
    if [ "$use_existing" != "y" ]; then
        rm .env
        echo "Removed old .env file"
    fi
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    echo ""
    
    # OpenAI API Key
    read -p "Enter your OpenAI API Key (sk-proj-...): " openai_key
    
    # Google Client ID
    echo ""
    echo "Google Drive OAuth2 Configuration"
    echo "Get these from: https://console.cloud.google.com/"
    echo ""
    read -p "Enter your Google Client ID: " google_client_id
    
    # Google Client Secret
    read -p "Enter your Google Client Secret: " google_client_secret
    
    # Google Redirect URI (with default)
    echo ""
    read -p "Enter Google Redirect URI [http://localhost:3000/api/drive/callback]: " google_redirect_uri
    google_redirect_uri=${google_redirect_uri:-http://localhost:3000/api/drive/callback}
    
    # Port (with default)
    echo ""
    read -p "Enter backend port [3000]: " port
    port=${port:-3000}
    
    # Create .env file
    cat > .env << EOF
# Figma AI Assistant - Environment Variables
OPENAI_API_KEY=$openai_key
FIGMA_AI_BACKEND_PORT=$port
CORS_ORIGIN=

# Google Drive OAuth2 Configuration
GOOGLE_CLIENT_ID=$google_client_id
GOOGLE_CLIENT_SECRET=$google_client_secret
GOOGLE_REDIRECT_URI=$google_redirect_uri
EOF
    
    echo ""
    echo "✅ .env file created successfully"
fi

echo ""
echo "🐳 Starting Docker container..."
docker-compose up -d

# Wait for container to start
echo ""
echo "⏳ Waiting for container to start..."
sleep 3

# Check if container is running
if docker ps | grep -q figma-ai-backend; then
    echo ""
    echo "✅ Backend is running!"
    echo ""
    echo "📊 Container status:"
    docker ps | grep figma-ai-backend
    echo ""
    echo "📝 View logs with: docker logs -f figma-ai-backend"
    echo "🛑 Stop with: docker-compose down"
    echo ""
    echo "🎉 Setup complete! Your backend is ready at http://localhost:$port"
else
    echo ""
    echo "❌ Container failed to start. Showing logs:"
    docker logs figma-ai-backend
    echo ""
    echo "Please check the error above and try again."
    exit 1
fi
