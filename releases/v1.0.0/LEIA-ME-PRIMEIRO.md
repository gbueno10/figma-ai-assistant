# 🎨 Figma AI Assistant - Guia de Instalação Completo

## O que você baixou:

Este pacote contém o **plugin Figma** (frontend). O backend roda em Docker separadamente.

```
📦 Este pacote:
└── plugin/          ← Instalar no Figma
    ├── manifest.json
    └── dist/

🐳 Backend (Docker):
└── gbueno10/figma-ai-backend  ← Baixar separadamente
```

---

## 🚀 Passo a Passo (5 minutos)

### 1️⃣ Instalar Docker (se não tiver)

**Windows/Mac**: https://www.docker.com/products/docker-desktop

**Linux**:
```bash
curl -fsSL https://get.docker.com | sh
```

### 2️⃣ Obter Chave da OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Clique em **"Create new secret key"**
3. Copie a chave (começa com `sk-...`)

### 3️⃣ Iniciar Backend

```bash
docker pull gbueno10/figma-ai-backend:latest
docker run -d -p 3000:3000 -e OPENAI_API_KEY=SUA-CHAVE-AQUI --name figma-ai-backend gbueno10/figma-ai-backend:latest
```

**Testar se funcionou:**
```bash
curl http://localhost:3000/health
# Deve retornar: {"status":"ok"}
```

### 4️⃣ Instalar Plugin no Figma

1. Abra o **Figma Desktop** (não funciona no browser!)
2. Vá em **Plugins** → **Development** → **Import plugin from manifest...**
3. Navegue até a pasta `plugin/` deste pacote
4. Selecione o arquivo **`manifest.json`**
5. Pronto! 🎉

### 5️⃣ Usar o Plugin

1. Abra um arquivo no Figma
2. Vá em **Plugins** → **Figma AI Assistant**
3. Experimente as funcionalidades!

---

## 📚 Documentação Completa

- **Configuração Simples**: `docs/SETUP_FACIL.md`
- **Guia Rápido**: `docs/QUICK_START.md`
- **Documentação Docker**: `docs/DOCKER.md`

---

## 🆘 Problemas?

### Backend não inicia
```bash
# Ver o que está acontecendo
docker logs figma-ai-backend
```

### Plugin não conecta ao backend
- Certifique-se que o Docker está rodando: `docker ps`
- Teste o health check: `curl http://localhost:3000/health`

### "Invalid API Key"
- Verifique se copiou a chave correta da OpenAI
- Gere uma nova chave se necessário

---

## 🔄 Atualizar

### Atualizar Backend:
```bash
docker stop figma-ai-backend
docker rm figma-ai-backend
docker pull gbueno10/figma-ai-backend:latest
docker run -d -p 3000:3000 -e OPENAI_API_KEY=SUA-CHAVE --name figma-ai-backend gbueno10/figma-ai-backend:latest
```

### Atualizar Plugin:
1. Baixe a nova versão
2. No Figma: Plugins → Development → Remove plugin
3. Reimporte o novo `manifest.json`

---

**Versão**: $VERSION
**Última atualização**: $(date +"%d/%m/%Y")
