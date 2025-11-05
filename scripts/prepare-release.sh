#!/bin/bash

# Script para preparar release completo do Figma AI Assistant
# Gera .zip do plugin + instruções para distribuição

set -e

VERSION=${1:-"v1.0.0"}
RELEASE_DIR="releases/$VERSION"

echo "🚀 Preparando release $VERSION..."

# 1. Criar estrutura de diretórios
mkdir -p "$RELEASE_DIR/plugin"
mkdir -p "$RELEASE_DIR/docs"

# 2. Build do plugin
echo "📦 Fazendo build do plugin..."
npm run build

# 3. Copiar arquivos do plugin
echo "📋 Copiando arquivos do plugin..."
cp manifest.json "$RELEASE_DIR/plugin/"
cp -r dist "$RELEASE_DIR/plugin/"

# 4. Criar README específico do plugin
cat > "$RELEASE_DIR/plugin/README.md" << 'EOF'
# Figma AI Assistant - Plugin

## 🔧 Instalação

1. **Abra o Figma Desktop**
2. Vá em **Plugins** → **Development** → **Import plugin from manifest...**
3. Selecione o arquivo **`manifest.json`** desta pasta
4. Pronto! O plugin estará disponível em **Plugins** → **Figma AI Assistant**

## ⚙️ Configuração

O plugin precisa do **backend rodando** para funcionar.

### Iniciar Backend:

```bash
docker pull gbueno10/figma-ai-backend:latest
docker run -d -p 3000:3000 -e OPENAI_API_KEY=sua-chave-aqui --name figma-ai-backend gbueno10/figma-ai-backend:latest
```

### Obter chave OpenAI:
https://platform.openai.com/api-keys

## 📡 Endpoints

O plugin se conecta ao backend em: `http://localhost:3000`

Certifique-se de que o backend está rodando antes de usar o plugin!

## 🆘 Troubleshooting

### "Failed to connect to backend"
- Verifique se o Docker está rodando: `docker ps`
- Teste o health check: `curl http://localhost:3000/health`
- Veja os logs: `docker logs figma-ai-backend`

### "Invalid API Key"
- Verifique se a `OPENAI_API_KEY` está correta
- Gere uma nova chave em: https://platform.openai.com/api-keys

EOF

# 5. Copiar documentação
echo "📚 Copiando documentação..."
cp SETUP_FACIL.md "$RELEASE_DIR/docs/"
cp QUICK_START.md "$RELEASE_DIR/docs/"
cp DOCKER.md "$RELEASE_DIR/docs/"
cp README.md "$RELEASE_DIR/docs/README-PROJECT.md"

# 6. Criar instruções completas
cat > "$RELEASE_DIR/LEIA-ME-PRIMEIRO.md" << 'EOF'
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
EOF

# 7. Criar .zip do plugin
echo "🗜️ Criando arquivo .zip..."
cd "$RELEASE_DIR"
zip -r "figma-ai-assistant-plugin-$VERSION.zip" plugin/
cd ../..

# 8. Criar checklist para GitHub Release
cat > "$RELEASE_DIR/GITHUB-RELEASE-CHECKLIST.md" << EOF
# 📋 Checklist para GitHub Release

## Antes de publicar:

- [ ] Build do plugin gerado (dist/)
- [ ] Backend publicado no Docker Hub
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado

## Assets para anexar no GitHub Release:

1. \`figma-ai-assistant-plugin-$VERSION.zip\` ✅ (já criado)
2. Link para Docker image: \`gbueno10/figma-ai-backend:latest\`

## Texto sugerido para o Release:

\`\`\`markdown
# 🎨 Figma AI Assistant $VERSION

## 🚀 Como Usar

### 1. Iniciar Backend (Docker)
\`\`\`bash
docker pull gbueno10/figma-ai-backend:latest
docker run -d -p 3000:3000 -e OPENAI_API_KEY=sua-chave --name figma-ai-backend gbueno10/figma-ai-backend:latest
\`\`\`

### 2. Instalar Plugin
1. Baixe \`figma-ai-assistant-plugin-$VERSION.zip\`
2. Extraia o arquivo
3. No Figma Desktop: Plugins → Development → Import plugin from manifest
4. Selecione o \`manifest.json\` da pasta extraída

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
\`\`\`

EOF

echo "✅ Release preparado em: $RELEASE_DIR"
echo ""
echo "📦 Arquivos criados:"
echo "   - figma-ai-assistant-plugin-$VERSION.zip"
echo "   - LEIA-ME-PRIMEIRO.md"
echo "   - plugin/ (pasta completa)"
echo "   - docs/ (documentação)"
echo ""
echo "🎯 Próximos passos:"
echo "   1. Publicar backend no Docker Hub:"
echo "      ./scripts/publish-docker.sh $VERSION"
echo ""
echo "   2. Criar GitHub Release:"
echo "      - Vá em: https://github.com/gbueno10/figma-ai-assistant/releases/new"
echo "      - Tag: $VERSION"
echo "      - Anexe: $RELEASE_DIR/figma-ai-assistant-plugin-$VERSION.zip"
echo "      - Use o texto de: $RELEASE_DIR/GITHUB-RELEASE-CHECKLIST.md"
echo ""
echo "   3. Compartilhar com usuários:"
echo "      - Link do GitHub Release"
echo "      - Instrução: Baixe o .zip + rode Docker"
