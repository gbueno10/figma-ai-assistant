# 🚀 Guia Rápido - Figma AI Assistant Backend

## Para Usuários Finais (Usar o Backend)

### Método 1: Docker Pull (MAIS RÁPIDO) ⚡

Basta ter o Docker instalado e rodar:

```bash
# 1. Baixar a imagem
docker pull gbueno10/figma-ai-backend:latest

# 2. Rodar o container (sem precisar de API key!)
docker run -d \
  -p 3000:3000 \
  --name figma-ai-backend \
  gbueno10/figma-ai-backend:latest

# 3. Testar
curl http://localhost:3000/health
```

✅ **Pronto!** O backend está rodando em `http://localhost:3000`

> **💡 Nota**: A API key da OpenAI é configurada **no plugin do Figma**, não no backend!

### Método 2: Docker Compose (MAIS FÁCIL DE GERENCIAR) 🎯

1. **Crie um arquivo `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  backend:
    image: gbueno10/figma-ai-backend:latest
    container_name: figma-ai-backend
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
    restart: unless-stopped
```

2. **Inicie o backend:**

```bash
docker-compose up -d
```

> **💡 Nota**: Não precisa configurar `OPENAI_API_KEY` aqui! A chave é enviada pelo plugin do Figma em cada requisição.

4. **Comandos úteis:**

```bash
# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Reiniciar
docker-compose restart
```

---

## Para Desenvolvedores (Modificar o Backend)

### Método 3: Clonar e Buildar Localmente 👨‍💻

```bash
# 1. Clonar repositório
git clone https://github.com/gbueno10/figma-ai-assistant.git
cd figma-ai-assistant

# 2. Iniciar com Docker
./scripts/start-docker.sh

# Ou usar make
make docker-up
```

---

## 🔧 Configuração

### Variáveis de Ambiente Disponíveis

| Variável | Obrigatória | Descrição | Padrão |
|----------|-------------|-----------|--------|
| `OPENAI_API_KEY` | ❌ Não | Chave da API OpenAI (fallback, o plugin já envia) | - |
| `PORT` | ❌ Não | Porta do servidor | 3000 |
| `CORS_ORIGIN` | ❌ Não | Origens permitidas para CORS | * |
| `NODE_ENV` | ❌ Não | Ambiente de execução | production |

> **💡 Como funciona**: O plugin Figma envia a `OPENAI_API_KEY` em cada requisição. A variável de ambiente é apenas um fallback opcional.

### Exemplo Completo com Todas as Opções

```bash
docker run -d \
  -p 3000:3000 \
  -e CORS_ORIGIN=https://meusite.com \
  -e NODE_ENV=production \
  --name figma-ai-backend \
  --restart unless-stopped \
  gbueno10/figma-ai-backend:latest
```

> **💡 Nota**: `OPENAI_API_KEY` não é necessária aqui, pois o plugin já a envia automaticamente!

---

## 📍 Endpoints da API

Depois de iniciar, estes endpoints estarão disponíveis:

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Health check |
| `/api/design/analysis` | POST | Análise de design |
| `/api/design/modifications` | POST | Modificações de design |
| `/api/images/generate` | POST | Gerar imagem |
| `/api/images/edit` | POST | Editar imagem |

**Base URL**: `http://localhost:3000`

**Exemplo de teste:**
```bash
curl http://localhost:3000/health
# Resposta: {"status":"ok"}
```

---

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs
docker logs figma-ai-backend

# Verificar se a porta está em uso
lsof -i :3000
```

### Atualizar para versão mais recente

```bash
# Parar container atual
docker stop figma-ai-backend
docker rm figma-ai-backend

# Baixar nova versão
docker pull gbueno10/figma-ai-backend:latest

# Iniciar novamente
docker run -d -p 3000:3000 --name figma-ai-backend gbueno10/figma-ai-backend:latest
```

### Limpar tudo e recomeçar

```bash
docker stop figma-ai-backend
docker rm figma-ai-backend
docker rmi gbueno10/figma-ai-backend:latest
```

---

## 🔐 Segurança

⚠️ **IMPORTANTE:**
- **Nunca** compartilhe sua `OPENAI_API_KEY` publicamente
- A API key é armazenada **no plugin do Figma** (via `figma.clientStorage`)
- O backend **não armazena** a chave, apenas a recebe nas requisições
- Em produção, considere adicionar autenticação no backend

---

## 💻 Requisitos do Sistema

- Docker 20.10 ou superior
- 512MB de RAM disponível
- Conexão com internet para acessar OpenAI API

---

## 📦 Versões Disponíveis

- `latest` - Versão mais recente estável
- `v1.0.0` - Versão específica (quando versionado)

```bash
# Usar versão específica
docker pull gbueno10/figma-ai-backend:v1.0.0
```

---

## 🤝 Suporte

- 📖 Documentação completa: [DOCKER.md](./DOCKER.md)
- 🐛 Issues: https://github.com/gbueno10/figma-ai-assistant/issues
- 💬 Discussões: https://github.com/gbueno10/figma-ai-assistant/discussions

---

## 📝 Changelog

### v1.0.0 (Latest)
- ✅ Endpoint de health check
- ✅ API de design analysis
- ✅ API de modificações
- ✅ API de geração de imagens
- ✅ Suporte a CORS configurável
- ✅ Health checks automáticos
- ✅ Logging estruturado

---

**Última atualização**: Novembro 2025
