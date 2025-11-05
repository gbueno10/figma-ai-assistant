#!/bin/bash

# Script para iniciar o backend em Docker
# Uso: ./scripts/start-docker.sh [--build]

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Figma AI Assistant - Docker Startup${NC}"
echo ""

# Verificar se o arquivo .env existe
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo backend/.env não encontrado!${NC}"
    echo -e "${YELLOW}📝 Criando a partir do .env.example...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Arquivo .env criado. Por favor, configure suas variáveis de ambiente.${NC}"
    echo ""
fi

# Verificar se deve fazer build
if [ "$1" == "--build" ] || [ "$1" == "-b" ]; then
    echo -e "${BLUE}🔨 Fazendo build das imagens Docker...${NC}"
    docker-compose build --no-cache
    echo ""
fi

# Iniciar containers
echo -e "${BLUE}🚀 Iniciando containers...${NC}"
docker-compose up -d

# Aguardar backend estar pronto
echo ""
echo -e "${BLUE}⏳ Aguardando backend estar pronto...${NC}"
sleep 3

# Verificar status
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo -e "${GREEN}✅ Backend iniciado com sucesso!${NC}"
    echo ""
    echo -e "${GREEN}📍 Endpoints disponíveis:${NC}"
    echo -e "   • Health: ${BLUE}http://localhost:3000/health${NC}"
    echo -e "   • Design: ${BLUE}http://localhost:3000/api/design${NC}"
    echo -e "   • Images: ${BLUE}http://localhost:3000/api/images${NC}"
    echo ""
    echo -e "${BLUE}📋 Comandos úteis:${NC}"
    echo -e "   • Ver logs:    ${YELLOW}docker-compose logs -f backend${NC}"
    echo -e "   • Parar:       ${YELLOW}docker-compose down${NC}"
    echo -e "   • Rebuild:     ${YELLOW}./scripts/start-docker.sh --build${NC}"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠️  Erro ao iniciar o backend. Verifique os logs:${NC}"
    echo -e "   ${YELLOW}docker-compose logs backend${NC}"
    echo ""
    exit 1
fi
