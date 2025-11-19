# 🎨 Figma AI Assistant v1.2.0

## ✨ Novidades e Melhorias

### 🎯 Interface Simplificada
- **Settings and Setup**: Menu de configurações renomeado e reorganizado para melhor clareza
- **UI Collapsível**: Seção de configurações agora pode ser expandida/colapsada, economizando espaço na tela
- **JSON Minimizado**: Respostas da IA aparecem minimizadas (80px) com opção de expandir ao clicar
- **Botão Copy JSON**: Copia facilmente análises de design para a área de transferência

### 🏗️ Arquitetura Melhorada
- **CSS Limpo**: Removidas classes CSS desnecessárias (~30 linhas)
- **HTML Simplificado**: Estrutura de cards mais direta e manutenível (~20 divs removidos)
- **Prioridade Visual**: AI Design Modification movido para o topo como card principal

### 🖼️ Melhorias em Image Editing
- **Frame Duplication**: Frames são duplicados automaticamente com convenção Dogo antes de editar imagens
- **Processamento Paralelo**: Geração de múltiplas imagens otimizada com 50ms de pausa entre aplicações
- **Naming Convention**: Dimensões atualizadas automaticamente nos nomes dos frames (ex: 1080x1350, 1080x1920)

### 🔧 Ajustes de UX
- **Quick Resize**: Botão "Story (1080x1920)" temporariamente desabilitado
- **Feedback Visual**: Mensagens de progresso mais detalhadas durante operações em lote
- **Error Handling**: Tratamento de erros aprimorado com contexto específico

## 📋 Configuração

### Requisitos
- Figma Desktop
- Docker instalado
- Chave OpenAI API

### Instalação Rápida

1. **Backend (Docker)**:
```bash
docker pull gbueno10/figma-ai-backend:v1.2.0
docker run -d -p 3000:3000 \
  -e OPENAI_API_KEY=sua-chave-aqui \
  --name figma-ai-backend \
  gbueno10/figma-ai-backend:v1.2.0
```

2. **Plugin (Figma)**:
   - Baixe `figma-ai-assistant-plugin-v1.2.0.zip`
   - Extraia e abra o Figma Desktop
   - **Plugins** → **Development** → **Import plugin from manifest...**
   - Selecione `manifest.json` da pasta `plugin/`

3. **Configure**:
   - Abra o plugin no Figma
   - Expanda "⚙️ Settings and Setup"
   - Cole sua OpenAI API Key
   - Backend URL: `http://localhost:3000`

## 🐛 Correções

- CSS estava "buhado" após reorganização da UI → Limpeza completa realizada
- Estrutura de cards simplificada para melhor manutenibilidade
- Remoção de wrapper classes desnecessárias (.ai-card-content, .card-title-text)

## 📚 Documentação

Incluída na release:
- `LEIA-ME-PRIMEIRO.md` - Guia de instalação completo
- `SETUP_FACIL.md` - Setup rápido em português
- `QUICK_START.md` - Início rápido
- `DOCKER.md` - Documentação do backend Docker

## 🔗 Links Úteis

- **Repositório**: https://github.com/gbueno10/figma-ai-assistant
- **Docker Hub**: https://hub.docker.com/r/gbueno10/figma-ai-backend
- **Issues**: https://github.com/gbueno10/figma-ai-assistant/issues
- **OpenAI API Keys**: https://platform.openai.com/api-keys

## 🆙 Upgrade da v1.1.0

Se você já usa a v1.1.0:

1. **Atualize o backend**:
```bash
docker stop figma-ai-backend
docker rm figma-ai-backend
docker pull gbueno10/figma-ai-backend:v1.2.0
docker run -d -p 3000:3000 -e OPENAI_API_KEY=sua-chave --name figma-ai-backend gbueno10/figma-ai-backend:v1.2.0
```

2. **Atualize o plugin**:
   - Remova a versão antiga no Figma
   - Importe o novo `manifest.json` da v1.2.0

3. **Suas configurações serão mantidas** (API Key e Backend URL)

## 🙏 Contribuições

Desenvolvido com ❤️ para a comunidade Dogo

---

**Full Changelog**: https://github.com/gbueno10/figma-ai-assistant/compare/v1.1.0...v1.2.0
