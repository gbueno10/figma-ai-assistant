# 📋 Checklist para GitHub Release

## Antes de publicar:

- [ ] Build do plugin gerado (dist/)
- [ ] Backend publicado no Docker Hub
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado

## Assets para anexar no GitHub Release:

1. `figma-ai-assistant-plugin-v1.0.0.zip` ✅ (já criado)
2. Link para Docker image: `gbueno10/figma-ai-backend:latest`

## Texto sugerido para o Release:

```markdown
# 🎨 Figma AI Assistant v1.0.0

## 🚀 Como Usar

### 1. Iniciar Backend (Docker)
```bash
docker pull gbueno10/figma-ai-backend:latest
docker run -d -p 3000:3000 -e OPENAI_API_KEY=sua-chave --name figma-ai-backend gbueno10/figma-ai-backend:latest
```

### 2. Instalar Plugin
1. Baixe `figma-ai-assistant-plugin-v1.0.0.zip`
2. Extraia o arquivo
3. No Figma Desktop: Plugins → Development → Import plugin from manifest
4. Selecione o `manifest.json` da pasta extraída

## 📦 O que há de novo

- ✨ Nova convenção de nomenclatura Dogo
- 🎯 Resize inteligente de frames
- 🤖 Otimização de texto com binary search
- 🐳 Backend totalmente dockerizado

## 📚 Documentação

- [Guia de Instalação Completo](./LEIA-ME-PRIMEIRO.md)
- [Quick Start](./docs/QUICK_START.md)
- [Documentação Docker](./docs/DOCKER.md)

## 🔗 Links

- **Docker Image**: https://hub.docker.com/r/gbueno10/figma-ai-backend
- **Repositório**: https://github.com/gbueno10/figma-ai-assistant
```

