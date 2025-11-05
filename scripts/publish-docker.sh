#!/bin/bash

# Script para publicar imagem no Docker Hub
# Uso: ./scripts/publish-docker.sh [version]

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuração
DOCKER_USERNAME="${DOCKER_USERNAME:-gbuenos}"  # Seu username do Docker Hub
IMAGE_NAME="ai-assistant-backend"
VERSION="${1:-latest}"

echo -e "${BLUE}🐳 Publishing Docker Image${NC}"
echo ""

# Verificar se está logado no Docker Hub
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}⚠️  Você precisa fazer login no Docker Hub primeiro${NC}"
    echo -e "${BLUE}Executando: docker login${NC}"
    docker login
    echo ""
fi

# Build da imagem
echo -e "${BLUE}🔨 Building image...${NC}"
docker build -t ${IMAGE_NAME}:${VERSION} ./backend

# Tag para Docker Hub
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
echo -e "${BLUE}🏷️  Tagging as: ${FULL_IMAGE_NAME}${NC}"
docker tag ${IMAGE_NAME}:${VERSION} ${FULL_IMAGE_NAME}

# Também tag como 'latest' se não for especificado
if [ "$VERSION" != "latest" ]; then
    docker tag ${IMAGE_NAME}:${VERSION} ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
    echo -e "${BLUE}🏷️  Also tagged as: ${DOCKER_USERNAME}/${IMAGE_NAME}:latest${NC}"
fi

# Push para Docker Hub
echo -e "${BLUE}📤 Pushing to Docker Hub...${NC}"
docker push ${FULL_IMAGE_NAME}

if [ "$VERSION" != "latest" ]; then
    docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
fi

echo ""
echo -e "${GREEN}✅ Image published successfully!${NC}"
echo ""
echo -e "${BLUE}📍 Para usar esta imagem, outras pessoas podem:${NC}"
echo ""
echo -e "   ${YELLOW}docker pull ${FULL_IMAGE_NAME}${NC}"
echo -e "   ${YELLOW}docker run -p 3000:3000 -e OPENAI_API_KEY=sk-xxx ${FULL_IMAGE_NAME}${NC}"
echo ""
echo -e "${BLUE}🔗 Link no Docker Hub:${NC}"
echo -e "   https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}"
echo ""
