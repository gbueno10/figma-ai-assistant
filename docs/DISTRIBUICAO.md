# 📦 Entendendo a Distribuição do Figma AI Assistant

## 🤔 A Confusão Comum

Muita gente acha que o Docker "empacota tudo", mas **NÃO é assim!**

```
❌ ERRADO: Achar que Docker = Plugin completo

✅ CORRETO: Docker = Apenas Backend (servidor Node.js)
```

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────┐
│         💻 COMPUTADOR DO USUÁRIO            │
│                                             │
│  ┌──────────────┐         ┌──────────────┐ │
│  │   FIGMA      │  HTTP   │   DOCKER     │ │
│  │   DESKTOP    │ ──────► │   BACKEND    │ │
│  │              │         │              │ │
│  │  Plugin JS   │         │  Node.js +   │ │
│  │  (Frontend)  │         │  Express +   │ │
│  │              │ fetch() │  OpenAI      │ │
│  └──────────────┘         └──────────────┘ │
│        ↑                         ↑          │
│        │                         │          │
│   manifest.json              porta 3000     │
│   + dist/                                   │
└─────────────────────────────────────────────┘
```

---

## 📋 O que cada parte contém:

### 🐳 **BACKEND (Docker Container)**

**O que está dentro:**
```
gbueno10/figma-ai-backend:latest
├── Node.js runtime
├── Express.js
├── OpenAI client
├── Rotas da API (/api/design, /api/images)
└── Health check endpoint
```

**O que NÃO está dentro:**
- ❌ Plugin do Figma
- ❌ Interface UI do Figma
- ❌ Código que roda no Figma Desktop

**Como distribuir:**
```bash
# Usuário simplesmente roda:
docker pull gbueno10/figma-ai-backend:latest
docker run -d -p 3000:3000 -e OPENAI_API_KEY=xxx --name figma-ai-backend gbueno10/figma-ai-backend
```

---

### 🎨 **FRONTEND (Figma Plugin)**

**O que precisa distribuir:**
```
figma-plugin/
├── manifest.json          ← Define o plugin no Figma
└── dist/                  ← Código compilado
    ├── code.js           ← Lógica principal (TypeScript compilado)
    └── ui.html           ← Interface do plugin
```

**Como distribuir:**

#### Opção A: ZIP File
```bash
# Você cria:
zip -r figma-plugin.zip manifest.json dist/

# Usuário:
1. Baixa o .zip
2. Extrai
3. Figma → Plugins → Development → Import plugin from manifest
4. Seleciona manifest.json
```

#### Opção B: GitHub Release
```bash
# Você:
1. git tag v1.0.0
2. git push --tags
3. GitHub Releases → Create new release
4. Anexa figma-plugin.zip

# Usuário:
1. Vai no GitHub Release
2. Baixa figma-plugin.zip
3. Instala no Figma
```

---

## 🚀 Processo Completo de Distribuição

### Para VOCÊ (desenvolvedor):

```bash
# 1. Publicar Backend no Docker Hub
./scripts/publish-docker.sh v1.0.0

# 2. Preparar Release do Plugin
./scripts/prepare-release.sh v1.0.0

# 3. Criar GitHub Release
# - Vai em https://github.com/gbueno10/figma-ai-assistant/releases/new
# - Anexa: releases/v1.0.0/figma-ai-assistant-plugin-v1.0.0.zip
# - Adiciona instruções
```

### Para USUÁRIO FINAL:

```bash
# 1. Instalar Backend (1 comando!)
docker run -d -p 3000:3000 -e OPENAI_API_KEY=xxx --name figma-ai-backend gbueno10/figma-ai-backend:latest

# 2. Baixar Plugin
# - Vai no GitHub Release
# - Baixa figma-ai-assistant-plugin-v1.0.0.zip
# - Extrai

# 3. Instalar Plugin no Figma
# - Figma Desktop → Plugins → Development → Import plugin from manifest
# - Seleciona manifest.json
```

---

## 💡 Analogia Simples

Pensa assim:

```
BACKEND (Docker)     = Motor de um carro
FRONTEND (Plugin)    = Volante, pedais, painel

O motor (backend) pode estar rodando perfeito,
mas sem volante (plugin) você não consegue dirigir!

E vice-versa: você pode ter o volante (plugin instalado),
mas sem motor (backend) não vai a lugar nenhum!
```

---

## 📦 Resumo das Distribuições

| O que distribuir | Como | Onde | Quem usa |
|------------------|------|------|----------|
| **Backend** | Docker Hub | `docker pull gbueno10/figma-ai-backend` | Qualquer pessoa |
| **Plugin** | GitHub Release | Download do .zip | Designers/Devs |
| **Docs** | GitHub repo | README + docs/ | Todos |
| **Código fonte** | GitHub repo | Clone completo | Desenvolvedores |

---

## 🎯 Estratégia Recomendada

### **Para usuários finais (não-técnicos):**

**Documentação ultra-simples:**
```markdown
# Como instalar

1. Rode isto no terminal:
   docker run -d -p 3000:3000 -e OPENAI_API_KEY=sua-chave --name figma-ai-backend gbueno10/figma-ai-backend

2. Baixe: [figma-plugin.zip](link)

3. No Figma: Plugins → Import → Selecione manifest.json

Pronto!
```

### **Para desenvolvedores:**

**GitHub completo:**
```bash
git clone https://github.com/gbueno10/figma-ai-assistant
cd figma-ai-assistant
./scripts/start-docker.sh
npm run build
# Importa plugin no Figma
```

---

## 🔄 Workflow de Updates

### Quando você atualiza o backend:
```bash
./scripts/publish-docker.sh v1.0.1
```
Usuários atualizam:
```bash
docker pull gbueno10/figma-ai-backend:latest
docker restart figma-ai-backend
```

### Quando você atualiza o plugin:
```bash
./scripts/prepare-release.sh v1.0.1
# Cria novo GitHub Release
```
Usuários:
```
1. Removem plugin antigo no Figma
2. Baixam novo .zip
3. Reimportam manifest.json
```

---

## ✅ Checklist Final

Antes de distribuir, certifique-se:

**Backend:**
- [ ] Build do Docker funcionando
- [ ] Imagem publicada no Docker Hub
- [ ] Health check respondendo
- [ ] Documentação de endpoints clara

**Plugin:**
- [ ] `npm run build` executado
- [ ] `dist/` gerado corretamente
- [ ] `manifest.json` atualizado (versão, permissões)
- [ ] Testado localmente no Figma

**Documentação:**
- [ ] README.md atualizado
- [ ] QUICK_START.md criado
- [ ] SETUP_FACIL.md em português
- [ ] Instruções de API key claras

**Release:**
- [ ] Tag git criada (`v1.0.0`)
- [ ] GitHub Release criado
- [ ] .zip do plugin anexado
- [ ] Link do Docker Hub na descrição

---

## 🆘 FAQ

### "Posso colocar o plugin dentro do Docker?"
**Não faz sentido!** O plugin roda **dentro do Figma Desktop**, não em um container.
O Figma precisa ter acesso direto aos arquivos `manifest.json` e `dist/`.

### "Como o plugin 'encontra' o backend?"
No código do plugin, você tem:
```typescript
const BACKEND_URL = 'http://localhost:3000';
fetch(`${BACKEND_URL}/api/design/analysis`, ...);
```
O plugin faz requisições HTTP normais para o backend.

### "Usuário precisa instalar Node.js?"
- **Para backend**: NÃO! Docker já tem tudo dentro.
- **Para plugin**: NÃO! O Figma roda o código JavaScript compilado.
- **Para desenvolvimento**: SIM, você precisa para buildar.

### "Posso hospedar o backend na nuvem?"
**SIM!** Pode colocar em:
- AWS (ECS, EC2, Lambda)
- Google Cloud Run
- Azure Container Instances
- Railway, Render, Fly.io

Aí o plugin conecta em `https://seu-backend.com` em vez de `localhost:3000`.

---

**Resumo Final:**
- 🐳 **Docker** = Backend (servidor API)
- 🎨 **ZIP** = Plugin (interface Figma)
- 📦 **Ambos** = Solução completa!
