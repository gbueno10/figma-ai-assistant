#!/bin/bash

# Script para publicar backend no Docker Hub
# Uso: ./scripts/publish-docker.sh [version]

set -e

VERSION=${1:-"latest"}
IMAGE_NAME="gbuenos/figma-ai-backend"
BACKEND_DIR="backend"

echo "🐳 Publishing Docker image: $IMAGE_NAME:$VERSION"
echo ""

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop."
  exit 1
fi

# Verificar se está logado no Docker Hub
if ! docker info | grep -q "Username"; then
  echo "🔐 Fazendo login no Docker Hub..."
  docker login
fi

echo "📦 Step 1/4: Building Docker image..."
cd "$BACKEND_DIR"
docker build -t "$IMAGE_NAME:$VERSION" -t "$IMAGE_NAME:latest" .
cd ..

echo ""
echo "🔍 Step 2/4: Verifying image..."
docker images | grep "$IMAGE_NAME"

echo ""
echo "🚀 Step 3/4: Pushing to Docker Hub..."
docker push "$IMAGE_NAME:$VERSION"

if [ "$VERSION" != "latest" ]; then
  echo ""
  echo "🚀 Step 4/4: Pushing 'latest' tag..."
  docker push "$IMAGE_NAME:latest"
else
  echo ""
  echo "✅ Step 4/4: Skipped (version is already 'latest')"
fi

echo ""
echo "✅ Successfully published!"
echo ""
echo "📋 Image details:"
echo "   - Name: $IMAGE_NAME"
echo "   - Tags: $VERSION, latest"
echo "   - URL: https://hub.docker.com/r/$IMAGE_NAME"
echo ""
echo "🎯 To use this image:"
echo "   docker pull $IMAGE_NAME:$VERSION"
echo "   docker run -d -p 3000:3000 -e OPENAI_API_KEY=your-key $IMAGE_NAME:$VERSION"
echo ""
