# 🚀 Como Usar o Figma AI Assistant Backend

> **TL;DR**: Copie, cole e rode! ⚡

## 📋 Pré-requisitos

- Docker instalado ([Download aqui](https://www.docker.com/products/docker-desktop))

> **💡 Sobre a chave OpenAI**: Você vai configurá-la no **plugin do Figma** (não no backend!)

## ⚡ Início Ultra-Rápido (1 Comando)

```bash
docker run -d -p 3000:3000 --name figma-ai-backend gbueno10/figma-ai-backend:latest
```

**Pronto!** 🎉 Acesse: http://localhost:3000/health

> **💡 Nota**: Não precisa configurar `OPENAI_API_KEY` aqui! O plugin do Figma já envia a chave automaticamente.

---

## 🎯 Forma Recomendada (Docker Compose)

### Passo 1: Criar os Arquivos

**1.1 Crie `docker-compose.yml`:**

```yaml
version: '3.8'
services:
  backend:
    image: gbueno10/figma-ai-backend:latest
    ports:
      - "3000:3000"
    restart: unless-stopped
```

> **💡 Nota**: Não precisa de arquivo `.env`! A chave OpenAI é enviada pelo plugin do Figma.

### Passo 2: Iniciar

```bash
docker-compose up -d
```

### Passo 3: Testar

```bash
curl http://localhost:3000/health
```

**Deve retornar:** `{"status":"ok"}`

---

## 📱 Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Ver status
docker-compose ps

# Atualizar para versão mais recente
docker-compose pull
docker-compose up -d
```

---

## 🔌 Conectar com o Plugin Figma

1. No Figma, abra o plugin **AI Design Assistant**
2. Configure a URL do backend: `http://localhost:3000`
3. Pronto! O plugin agora usa seu backend local.

---

## 🐛 Algo Deu Errado?

### Backend não inicia

```bash
# Ver o que aconteceu
docker logs figma-ai-backend
```

### Porta 3000 já em uso

```bash
# Use outra porta (exemplo: 4000)
docker run -d -p 4000:3000 -e OPENAI_API_KEY=sk-xxx --name figma-ai-backend gbueno10/figma-ai-backend:latest

# E configure o plugin para usar: http://localhost:4000
```

### Atualizar para versão mais recente

```bash
docker stop figma-ai-backend
docker rm figma-ai-backend
docker pull gbueno10/figma-ai-backend:latest
docker run -d -p 3000:3000 -e OPENAI_API_KEY=sk-xxx --name figma-ai-backend gbueno10/figma-ai-backend:latest
```

---

## 📞 Precisa de Ajuda?

- 📖 [Documentação Completa](https://github.com/gbueno10/figma-ai-assistant)
- 🐛 [Reportar Problema](https://github.com/gbueno10/figma-ai-assistant/issues)
- 💬 [Perguntas](https://github.com/gbueno10/figma-ai-assistant/discussions)

---

## 🔐 Segurança

⚠️ **NUNCA** compartilhe sua chave da API OpenAI publicamente!

---

**Feito com ❤️ para a comunidade Figma**
