# 📋 Checklist para GitHub Release v1.2.0

## ✅ Antes de publicar:

- [x] Build do plugin gerado (dist/)
- [ ] Backend publicado no Docker Hub com tag v1.2.0
- [x] Documentação atualizada
- [x] RELEASE-NOTES.md criado
- [x] .zip do plugin gerado

## 📦 Assets para anexar no GitHub Release:

1. ✅ `figma-ai-assistant-plugin-v1.2.0.zip` (já criado)
2. 🐳 Link para Docker image: `gbueno10/figma-ai-backend:v1.2.0`

## 🚀 Publicar Backend no Docker Hub

```bash
./scripts/publish-docker.sh v1.2.0
```

## 📝 Suggested Release Text:

```markdown
# 🎨 Figma AI Assistant v1.2.0

## ✨ Key Improvements

### 🎯 Redesigned Interface
- **Settings and Setup** renamed for better clarity
- Collapsible settings menu saves screen space
- Analysis JSON appears minimized with click-to-expand
- New "Copy JSON" button for easier debugging

### 🖼️ Optimized Image Editing
- Frames automatically duplicated with Dogo naming convention
- Parallel processing with smart 50ms pauses
- Dimensions automatically updated in frame names

### 🏗️ Clean Code
- ~30 CSS lines removed
- ~20 unnecessary divs eliminated
- Simplified and more maintainable structure

## 🚀 Quick Installation

### 1️⃣ Backend (Docker)
```bash
docker pull gbueno10/figma-ai-backend:v1.2.0
docker run -d -p 3000:3000 \
  -e OPENAI_API_KEY=your-api-key-here \
  --name figma-ai-backend \
  gbueno10/figma-ai-backend:v1.2.0
```

### 2️⃣ Plugin (Figma)
1. Download `figma-ai-assistant-plugin-v1.2.0.zip` below
2. Extract the file
3. In Figma Desktop: **Plugins** → **Development** → **Import plugin from manifest**
4. Select the `manifest.json` from the `plugin/` folder

### 3️⃣ Configure
1. Open the plugin in Figma
2. Click "⚙️ Settings and Setup" to expand
3. Paste your OpenAI API Key (get it at: https://platform.openai.com/api-keys)
4. Verify Backend URL: `http://localhost:3000`

## 📚 Documentation

Included in the .zip:
- **LEIA-ME-PRIMEIRO.md** - Complete installation guide (Portuguese)
- **docs/QUICK_START.md** - Quick start guide
- **docs/SETUP_FACIL.md** - Easy setup (Portuguese)
- **docs/DOCKER.md** - Backend Docker documentation

## 🆙 Upgrading from v1.1.0

```bash
# Stop and remove old version
docker stop figma-ai-backend
docker rm figma-ai-backend

# Install new version
docker pull gbueno10/figma-ai-backend:v1.2.0
docker run -d -p 3000:3000 \
  -e OPENAI_API_KEY=your-key \
  --name figma-ai-backend \
  gbueno10/figma-ai-backend:v1.2.0
```

In Figma: remove the old version and import the new manifest.json

## 🔗 Useful Links

- 🐳 **Docker Hub**: https://hub.docker.com/r/gbueno10/figma-ai-backend
- 📖 **Repository**: https://github.com/gbueno10/figma-ai-assistant
- 🐛 **Issues**: https://github.com/gbueno10/figma-ai-assistant/issues
- 🔑 **OpenAI Keys**: https://platform.openai.com/api-keys

## 📊 Full Changelog

**v1.2.0 (November 2025)**
- ✨ Settings renamed to "Settings and Setup"
- ✨ Collapsible settings menu
- ✨ Minimized JSON with click-to-expand
- ✨ Copy JSON button added
- 🖼️ Frame duplication with Dogo naming before image editing
- 🏗️ CSS and HTML cleanup (~50 lines removed)
- 🎯 AI Design Modification moved to top (visual priority)
- 🔧 Story (1080x1920) button temporarily disabled
- 🐛 Fix: CSS cleanup after UI reorganization

**Full Changelog**: https://github.com/gbueno10/figma-ai-assistant/compare/v1.1.0...v1.2.0

---

Made with ❤️ for the Dogo community
```

