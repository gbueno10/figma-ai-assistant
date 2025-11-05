#!/bin/bash

# Script para parar o backend em Docker
# Uso: ./scripts/stop-docker.sh [--remove-volumes]

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Figma AI Assistant - Docker Shutdown${NC}"
echo ""

if [ "$1" == "--remove-volumes" ] || [ "$1" == "-v" ]; then
    echo -e "${RED}🗑️  Parando containers e removendo volumes...${NC}"
    docker-compose down -v
else
    echo -e "${BLUE}🛑 Parando containers...${NC}"
    docker-compose down
fi

echo ""
echo -e "${GREEN}✅ Containers parados com sucesso!${NC}"
echo ""
