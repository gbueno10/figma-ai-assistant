# 🐳 Docker Setup - Figma AI Assistant Backend

Este guia explica como executar o backend do Figma AI Assistant usando Docker.

## 📋 Pré-requisitos

- Docker (versão 20.10 ou superior)
- Docker Compose (versão 2.0 ou superior)

### Instalação do Docker

**macOS:**
```bash
brew install --cask docker
```

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

**Windows:**
- Baixe o Docker Desktop em: https://www.docker.com/products/docker-desktop

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

Primeiro, crie o arquivo `.env` no diretório `backend/`:

```bash
cp backend/.env.example backend/.env
```

Edite o arquivo `backend/.env` e adicione sua chave da OpenAI:

```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
PORT=3000
# CORS_ORIGIN=http://localhost:3300,https://your-domain.com
```

### 2. Iniciar o Backend

#### Opção A: Usando Scripts (Recomendado)

```bash
# Tornar scripts executáveis (apenas primeira vez)
chmod +x scripts/*.sh

# Iniciar o backend
./scripts/start-docker.sh

# Com rebuild (força reconstrução da imagem)
./scripts/start-docker.sh --build
```

#### Opção B: Docker Compose Direto

```bash
# Iniciar
docker-compose up -d

# Com build
docker-compose up -d --build
```

### 3. Verificar Status

```bash
# Status dos containers
docker-compose ps

# Verificar health
curl http://localhost:3000/health
```

## 📋 Comandos Úteis

### Ver Logs

```bash
# Usando script
./scripts/logs-docker.sh           # Últimas 100 linhas
./scripts/logs-docker.sh --follow  # Seguir logs em tempo real

# Docker Compose direto
docker-compose logs backend        # Últimas linhas
docker-compose logs -f backend     # Seguir logs
```

### Parar o Backend

```bash
# Usando script
./scripts/stop-docker.sh

# Docker Compose direto
docker-compose down
```

### Restart

```bash
docker-compose restart backend
```

### Rebuild Completo

```bash
# Parar tudo
docker-compose down

# Rebuild sem cache
docker-compose build --no-cache

# Iniciar
docker-compose up -d
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente

Você pode sobrescrever variáveis de ambiente ao iniciar:

```bash
# Mudar porta
FIGMA_AI_BACKEND_PORT=4000 docker-compose up -d

# Configurar CORS
CORS_ORIGIN=https://meusite.com docker-compose up -d
```

### Modo de Desenvolvimento

Para desenvolvimento local (com hot reload):

```bash
cd backend
npm install
npm run dev
```

### Docker Compose para Produção

Para produção, considere usar um arquivo separado:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Arquitetura Docker

```
┌─────────────────────────────────────┐
│  Dockerfile (Multi-stage Build)    │
├─────────────────────────────────────┤
│  Stage 1: Builder                   │
│  • Node 20 Alpine                   │
│  • Instala dependências             │
│  • Compila TypeScript               │
│  • Remove dev dependencies          │
├─────────────────────────────────────┤
│  Stage 2: Runner (Produção)         │
│  • Node 20 Alpine                   │
│  • Usuário não-root (nodejs)        │
│  • Apenas arquivos necessários      │
│  • Health check configurado         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  docker-compose.yml                 │
├─────────────────────────────────────┤
│  • Container: figma-ai-backend      │
│  • Network: figma-ai-network        │
│  • Health checks                    │
│  • Restart policy                   │
│  • Logging configurado              │
└─────────────────────────────────────┘
```

## 🔒 Segurança

O Dockerfile implementa várias práticas de segurança:

- ✅ **Usuário não-root**: Container roda como usuário `nodejs` (UID 1001)
- ✅ **Multi-stage build**: Imagem final menor e mais segura
- ✅ **Alpine Linux**: Imagem base mínima
- ✅ **Health checks**: Monitora status do container
- ✅ **.dockerignore**: Evita copiar arquivos desnecessários

## 🩺 Health Checks

O container possui health checks configurados:

```yaml
Interval: 30s    # Verifica a cada 30 segundos
Timeout: 10s     # Timeout de 10 segundos
Retries: 3       # 3 tentativas antes de marcar como unhealthy
Start Period: 5s # Aguarda 5s antes de começar
```

Verificar status:

```bash
docker inspect --format='{{.State.Health.Status}}' figma-ai-backend
```

## 📝 Logs

Os logs são configurados com rotação automática:

- **Max Size**: 10MB por arquivo
- **Max Files**: 3 arquivos mantidos
- **Driver**: json-file

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Verificar se a porta está em uso
lsof -i :3000

# Rebuild completo
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Erro de permissão

```bash
# Dar permissão aos scripts
chmod +x scripts/*.sh
```

### Container unhealthy

```bash
# Ver logs do health check
docker inspect figma-ai-backend | grep -A 10 Health

# Testar endpoint manualmente
docker exec figma-ai-backend wget -q -O- http://localhost:3000/health
```

### Limpar tudo e começar do zero

```bash
# Parar e remover containers, volumes e imagens
docker-compose down -v
docker system prune -a

# Rebuild e restart
docker-compose up -d --build
```

## 📍 Endpoints Disponíveis

Depois de iniciar o container:

- **Health Check**: http://localhost:3000/health
- **Design API**: http://localhost:3000/api/design
- **Images API**: http://localhost:3000/api/images

## 🔗 Integração com Plugin

O plugin Figma deve apontar para o backend Docker:

1. No plugin, configure a URL do backend:
   ```
   http://localhost:3000
   ```

2. Certifique-se de que o CORS está configurado corretamente no `.env`

## 📚 Próximos Passos

- [ ] Configurar CI/CD para build automático
- [ ] Deploy em ambiente de produção (AWS, GCP, Azure)
- [ ] Adicionar monitoramento (Prometheus, Grafana)
- [ ] Configurar reverse proxy (Nginx, Traefik)
- [ ] Implementar rate limiting
- [ ] Adicionar autenticação/autorização

## 🤝 Contribuindo

Para contribuir com melhorias no Docker setup:

1. Teste localmente
2. Documente mudanças
3. Atualize este README
4. Submeta PR

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `./scripts/logs-docker.sh`
2. Consulte a seção de Troubleshooting
3. Abra uma issue no GitHub

---

**Última atualização**: Novembro 2025
