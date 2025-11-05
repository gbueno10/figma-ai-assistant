#!/bin/bash

# Script para ver logs do backend em Docker
# Uso: ./scripts/logs-docker.sh [-f|--follow]

set -e

# Cores para output
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Figma AI Assistant - Docker Logs${NC}"
echo ""

if [ "$1" == "-f" ] || [ "$1" == "--follow" ]; then
    echo -e "${BLUE}Seguindo logs (Ctrl+C para sair)...${NC}"
    echo ""
    docker-compose logs -f backend
else
    echo -e "${BLUE}Últimas 100 linhas:${NC}"
    echo ""
    docker-compose logs --tail=100 backend
fi
