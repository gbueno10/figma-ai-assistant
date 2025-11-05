#!/bin/bash

# Script para criar repositório no Docker Hub via API
# Uso: ./scripts/create-dockerhub-repo.sh

set -e

DOCKER_USERNAME="gbueno10"
REPO_NAME="figma-ai-backend"
DESCRIPTION="Backend for Figma AI Assistant plugin - OpenAI powered design automation"
FULL_DESCRIPTION="Backend server for the Figma AI Assistant plugin. Provides AI-powered design analysis, modifications, and image generation capabilities using OpenAI. The API key is configured in the Figma plugin (frontend), not in the backend."

echo "🐳 Criando repositório no Docker Hub"
echo ""
echo "📋 Informações:"
echo "   Username: $DOCKER_USERNAME"
echo "   Repository: $REPO_NAME"
echo "   Full name: $DOCKER_USERNAME/$REPO_NAME"
echo ""

# Verificar se o usuário está logado
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando!"
    exit 1
fi

echo "🔐 Para criar o repositório, precisamos de um Access Token do Docker Hub"
echo ""
echo "📝 Como obter:"
echo "   1. Vá em: https://hub.docker.com/settings/security"
echo "   2. Clique em 'New Access Token'"
echo "   3. Nome: 'CLI Access' (ou qualquer nome)"
echo "   4. Access permissions: 'Read, Write, Delete'"
echo "   5. Clique em 'Generate'"
echo "   6. Copie o token (você só verá uma vez!)"
echo ""
read -sp "Cole seu Docker Hub Access Token aqui: " DOCKER_TOKEN
echo ""
echo ""

if [ -z "$DOCKER_TOKEN" ]; then
    echo "❌ Token não fornecido!"
    exit 1
fi

echo "🚀 Criando repositório..."

# Criar repositório via API
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://hub.docker.com/v2/repositories/" \
  -H "Authorization: Bearer $DOCKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"namespace\": \"$DOCKER_USERNAME\",
    \"name\": \"$REPO_NAME\",
    \"description\": \"$DESCRIPTION\",
    \"full_description\": \"$FULL_DESCRIPTION\",
    \"is_private\": false
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Repositório criado com sucesso!"
    echo ""
    echo "📦 Detalhes:"
    echo "   URL: https://hub.docker.com/r/$DOCKER_USERNAME/$REPO_NAME"
    echo "   Image: $DOCKER_USERNAME/$REPO_NAME:latest"
    echo ""
    echo "🎯 Próximo passo:"
    echo "   ./scripts/publish-docker.sh v1.0.0"
elif [ "$HTTP_CODE" -eq 409 ]; then
    echo "ℹ️  Repositório já existe!"
    echo ""
    echo "📦 Detalhes:"
    echo "   URL: https://hub.docker.com/r/$DOCKER_USERNAME/$REPO_NAME"
    echo ""
    echo "🎯 Você já pode publicar:"
    echo "   ./scripts/publish-docker.sh v1.0.0"
elif [ "$HTTP_CODE" -eq 401 ]; then
    echo "❌ Erro de autenticação!"
    echo "   Token inválido ou expirado."
    echo "   Gere um novo token em: https://hub.docker.com/settings/security"
    exit 1
else
    echo "❌ Erro ao criar repositório (HTTP $HTTP_CODE)"
    echo ""
    echo "Resposta:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    exit 1
fi
