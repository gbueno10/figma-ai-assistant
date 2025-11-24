# 🎨 Figma AI Assistant v1.3.0 - Image Bank Browser

## 🆕 Nova Feature Principal: Image Bank Browser

Esta release adiciona uma funcionalidade poderosa de gerenciamento de imagens com integração ao Google Drive!

### 🐶 Image Bank Browser

- **Navegador visual de imagens** do Google Drive com thumbnails
- **Filtros inteligentes** por idade, cor e ação (baseado na nomenclatura AI)
- **Substituição de imagens com 1 clique** em elementos selecionados
- **Nomenclatura AI** com padrão `AI_dog_{age}_{color}_{action}.ext`
- **Suporte a imagens não estruturadas** (filenames que não seguem o padrão)
- **Feedback visual** durante download e substituição
- **Token refresh automático** quando credenciais expiram

### Como Usar o Image Bank:

1. Configure o **Image Bank Folder ID** nas Settings
2. Conecte sua conta do **Google Drive**
3. Clique em **"📂 Load Image Bank"**
4. Use os **filtros** para encontrar imagens específicas
5. **Selecione um elemento** no Figma
6. **Clique na imagem** desejada para substituir

## 🔧 Melhorias Técnicas

### Backend
- Novos endpoints para listar e baixar imagens do Drive
- Suporte a arraybuffer para download de imagens
- Refresh automático de tokens expirados
- Filtros e ordenação de arquivos

### Frontend
- Grid responsivo de thumbnails
- Filtros dinâmicos por categoria
- Estado de loading e feedback visual
- Decoder base64 otimizado para plugin sandbox
- Preservação de propriedades de ImagePaint ao substituir

### Segurança
- Tokens do Drive preservados após logout parcial
- Folder IDs mantidos em storage local
- Permissões atualizadas no manifest.json

## 📦 Como Instalar

### 1. Iniciar Backend (Docker)
```bash
docker pull gbueno10/figma-ai-backend:latest
docker run -d -p 3000:3000 \
  -e OPENAI_API_KEY=sua-chave \
  -e GOOGLE_CLIENT_ID=seu-client-id \
  -e GOOGLE_CLIENT_SECRET=seu-client-secret \
  -e GOOGLE_REDIRECT_URI=http://localhost:3000/api/drive/callback \
  --name figma-ai-backend \
  gbueno10/figma-ai-backend:latest
```

### 2. Instalar Plugin
1. Baixe `figma-ai-assistant-plugin-v1.3.0.zip`
2. Extraia o arquivo
3. No Figma Desktop: **Plugins** → **Development** → **Import plugin from manifest**
4. Selecione o `manifest.json` da pasta extraída

## 🔐 Configuração do Google Drive

Para usar o Image Bank, você precisa:

1. **Criar projeto no Google Cloud Console**
   - Habilitar Google Drive API
   - Criar credenciais OAuth 2.0
   - Adicionar redirect URI: `http://localhost:3000/api/drive/callback`

2. **Configurar variáveis de ambiente** no Docker

3. **Criar pastas no Drive**
   - **Exports Folder**: para salvar frames exportados
   - **Image Bank Folder**: para armazenar banco de imagens

Veja [GOOGLE-DRIVE-SETUP.md](../../GOOGLE-DRIVE-SETUP.md) para detalhes.

## 📚 Documentação

- [Guia de Instalação Completo](./LEIA-ME-PRIMEIRO.md)
- [Quick Start](../../QUICK_START.md)
- [Configuração Google Drive](../../GOOGLE-DRIVE-SETUP.md)
- [Documentação Docker](../../DOCKER.md)

## 🐛 Correções

- Melhorada preservação de folder IDs ao limpar tokens
- Corrigido tratamento de tokens expirados
- Melhorado feedback de erros no Image Bank

## 🔗 Links Úteis

- **Docker Image**: https://hub.docker.com/r/gbueno10/figma-ai-backend
- **Repositório**: https://github.com/gbueno10/figma-ai-assistant
- **Issues**: https://github.com/gbueno10/figma-ai-assistant/issues

## 📝 Changelog Completo

Para ver todas as mudanças detalhadas, consulte [CHANGELOG.md](../../CHANGELOG.md)

---

**Versão anterior**: v1.2.0  
**Data de release**: Novembro 2025  
**Commit**: `f881938`
