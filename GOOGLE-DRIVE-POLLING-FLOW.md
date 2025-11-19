# 🔄 Fluxo de Autenticação via Polling - Google Drive

## 📋 Visão Geral

O plugin agora implementa um fluxo de autenticação OAuth2 com **polling automático** e uma **UI reativa de 4 estados**. O usuário não precisa mais copiar e colar tokens manualmente - tudo acontece automaticamente!

## 🎨 Estados da UI

### Estado 1: 🔌 Não Conectado
- **Título**: "☁️ Conectar Google Drive"
- **Descrição**: "Conecte sua conta para exportar frames diretamente para o Drive."
- **Ação**: Botão "🔗 Conectar Google Drive"

### Estado 2: 🔄 Conectando (Polling Ativo)
- **Título**: "🔄 Aguardando Autorização..."
- **Descrição**: "Uma nova janela do navegador foi aberta. Autorize o acesso lá."
- **Visual**: Spinner animado rotacionando
- **Mensagem**: "Por favor, autorize o acesso. Não feche esta janela do Figma."
- **Ação**: Botão "❌ Cancelar" para interromper o processo

### Estado 3: ✅ Conectado
- **Título**: "✅ Google Drive Conectado"
- **Descrição**: "Autenticado com sucesso. Tokens salvos localmente."
- **Campos**:
  - Input: "ID da Pasta de Exportação"
  - Botão primário: "📤 Exportar Frames Selecionados"
  - Botão secundário: "🔌 Desconectar"

### Estado 4: ❌ Erro
- **Título**: "❌ Erro na Conexão"
- **Descrição**: "Ocorreu um erro durante a autenticação."
- **Mensagem**: Exibe o erro específico que ocorreu
- **Ação**: Botão "🔄 Tentar Novamente"

---

## 🔐 Fluxo de Autenticação Completo

### 1️⃣ Usuário Clica em "Conectar Google Drive"

**Frontend (ui.ts)**:
```typescript
1. Gera requestId único: Date.now() + random()
2. Envia mensagem para plugin: { type: 'get-drive-auth-url', requestId }
3. Muda UI para "Estado 2: Conectando"
4. Inicia polling a cada 2 segundos
5. Define timeout de 5 minutos
```

### 2️⃣ Plugin Busca URL de Autorização

**Plugin (code.ts)**:
```typescript
1. Recebe mensagem 'get-drive-auth-url'
2. Faz fetch para backend: GET /api/drive/auth-url?requestId=XYZ
3. Backend retorna: { authUrl, requestId }
4. Envia para UI: { type: 'auth-url-ready', url }
```

### 3️⃣ UI Abre Browser e Continua Polling

**Frontend (ui.ts)**:
```typescript
1. Recebe 'auth-url-ready'
2. Envia para plugin: { type: 'open-url', url }
3. Plugin abre browser: figma.openExternal(url)
4. setInterval continua enviando: { type: 'check-drive-auth-status', requestId }
```

### 4️⃣ Backend Registra Request Pendente

**Backend (driveRoutes.ts)**:
```typescript
// Estrutura do pendingLogins Map
{
  [requestId]: {
    status: 'pending' | 'success' | 'error',
    tokens?: { access_token, refresh_token },
    error?: string,
    timestamp: Date.now()
  }
}

// GET /api/drive/auth-url?requestId=XYZ
pendingLogins.set(requestId, { status: 'pending', timestamp: Date.now() });
authUrl = driveService.getAuthUrl(requestId); // Passa requestId como 'state'
```

### 5️⃣ Usuário Autoriza no Browser

**Browser**:
```
1. Google OAuth page abre
2. Usuário faz login e autoriza
3. Google redireciona para: /api/drive/callback?code=ABC&state=requestId
```

### 6️⃣ Backend Processa Callback

**Backend (driveRoutes.ts)**:
```typescript
// GET /api/drive/callback?code=ABC&state=requestId
1. Extrai code e state (requestId)
2. Troca code por tokens: driveService.getTokens(code)
3. Atualiza pendingLogins:
   pendingLogins.set(requestId, {
     status: 'success',
     tokens: { access_token, refresh_token },
     timestamp: Date.now()
   })
4. Exibe página HTML: "✅ Autorização Bem-Sucedida! Pode fechar esta janela."
```

### 7️⃣ Polling Detecta Sucesso

**Plugin (code.ts)** - Polling ativo:
```typescript
// A cada 2 segundos, UI envia: { type: 'check-drive-auth-status', requestId }

1. Plugin faz fetch: GET /api/drive/check-status?requestId=XYZ
2. Backend responde:
   - Se pending: { status: 'pending' } → continua polling
   - Se success: { status: 'success', tokens: {...} } → para polling
   - Se error: { status: 'error', error: '...' } → para polling
3. Plugin envia para UI: { type: 'auth-status-success', tokens }
```

### 8️⃣ UI Salva Tokens e Atualiza Estado

**Frontend (ui.ts)**:
```typescript
1. Recebe 'auth-status-success'
2. Para o setInterval (stopPolling)
3. Envia para plugin: { type: 'save-drive-tokens', tokens }
4. Plugin salva: figma.clientStorage.setAsync('google_drive_tokens', tokens)
5. Muda UI para "Estado 3: Conectado"
```

---

## 📤 Fluxo de Exportação

### 1️⃣ Usuário Clica em "Exportar Frames Selecionados"

**Frontend (ui.ts)**:
```typescript
1. Valida folderId
2. Envia: { type: 'export-to-drive', folderId }
```

### 2️⃣ Plugin Exporta Frames

**Plugin (code.ts)**:
```typescript
1. Busca tokens do clientStorage
2. Valida seleção (apenas frames)
3. Para cada frame:
   a. Exporta como PNG: frame.exportAsync({ format: 'PNG' })
   b. Converte Uint8Array → Array: Array.from(imageBytes)
   c. Envia para UI: { type: 'drive-export-frame', frameData, frameName, tokens, folderId }
   d. Aguarda confirmação: Promise + message handler
```

### 3️⃣ UI Faz Upload para Backend

**Frontend (ui.ts)**:
```typescript
1. Recebe 'drive-export-frame'
2. Converte Array → Base64: btoa(String.fromCharCode(...))
3. POST para backend:
   fetch('/api/drive/upload', {
     body: { tokens, folderId, fileName, imageBase64 }
   })
4. Backend faz upload para Google Drive
5. Envia confirmação: { type: 'drive-export-frame-complete', success, frameName }
```

### 4️⃣ Plugin Continua com Próximo Frame

**Plugin (code.ts)**:
```typescript
1. Recebe 'drive-export-frame-complete'
2. Incrementa successCount ou errorCount
3. Continua loop para próximo frame
4. Ao final: { type: 'drive-export-complete', successCount, errorCount, totalFrames }
```

---

## 🗂️ Estrutura de Dados

### ClientStorage (Figma Plugin)
```typescript
{
  'google_drive_tokens': {
    access_token: 'ya29.a0...',
    refresh_token: '1//0...',
    scope: 'https://www.googleapis.com/auth/drive',
    token_type: 'Bearer',
    expiry_date: 1637012345678
  },
  'google_drive_folder_id': '1a2b3c4d5e6f7g8h9i'
}
```

### Backend pendingLogins Map
```typescript
Map<string, PendingLogin> = {
  '1637012345678xyz': {
    status: 'pending',
    timestamp: 1637012345678
  },
  '1637012346789abc': {
    status: 'success',
    tokens: { ... },
    timestamp: 1637012346789
  }
}
```

---

## 🔒 Segurança

### Limpeza Automática
```typescript
// Backend executa a cada 1 minuto
setInterval(() => {
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  for (const [key, value] of pendingLogins.entries()) {
    if (value.timestamp < tenMinutesAgo) {
      pendingLogins.delete(key);
    }
  }
}, 60 * 1000);
```

### Timeout de Polling
```typescript
// Frontend para polling após 5 minutos
setTimeout(() => {
  if (currentRequestId === requestId) {
    stopPolling();
    showErrorState('Tempo esgotado. Por favor, tente novamente.');
  }
}, 5 * 60 * 1000);
```

### State Parameter
```typescript
// Google OAuth valida que o 'state' retornado é o mesmo enviado
authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
  state: requestId // ← Previne CSRF attacks
});
```

---

## 🧪 Testando o Fluxo

### 1. Iniciar Backend
```bash
cd backend
npm run dev
```

### 2. Recarregar Plugin no Figma
```
Cmd+Option+P → "Plugins: Reload Plugin"
```

### 3. Teste Completo
1. Abrir plugin
2. Rolar até "☁️ Conectar Google Drive"
3. Clicar em "🔗 Conectar Google Drive"
4. **Verificar**: Browser deve abrir automaticamente
5. **Verificar**: UI mostra spinner e "Aguardando Autorização..."
6. Autorizar no browser
7. **Verificar**: Browser mostra "✅ Pode fechar esta janela"
8. **Verificar**: Plugin muda para "✅ Google Drive Conectado" (automático!)
9. Inserir folder ID
10. Selecionar frames
11. Clicar em "📤 Exportar Frames Selecionados"
12. **Verificar**: Frames aparecem na pasta do Drive

---

## 🐛 Troubleshooting

### Polling não detecta sucesso
- **Problema**: Backend não está rodando
- **Solução**: `cd backend && npm run dev`

### Browser não abre
- **Problema**: figma.openExternal() não funciona
- **Solução**: Verificar que está usando Figma Desktop (não browser)

### Tokens não são salvos
- **Problema**: clientStorage não está disponível
- **Solução**: Plugin precisa estar publicado ou em desenvolvimento

### Erro 404 no callback
- **Problema**: Redirect URI não configurado no Google Cloud Console
- **Solução**: Adicionar `http://localhost:3000/api/drive/callback` nas URIs autorizadas

---

## ✅ Melhorias Implementadas

✅ **Sem cópia manual de tokens** - Tudo automático via polling
✅ **UI reativa com 4 estados** - Usuário sempre sabe o que está acontecendo
✅ **Spinner animado** - Feedback visual durante polling
✅ **Limpeza automática** - Backend remove requests antigos
✅ **Timeout de 5 minutos** - Evita polling infinito
✅ **Mensagens em português** - UI mais acessível
✅ **Persistência local** - Tokens salvos no clientStorage
✅ **Botão Desconectar** - Usuário pode remover tokens
✅ **Validação de estado** - Verifica tokens antes de exportar
✅ **Progresso de upload** - Mostra "Uploading 1 of 3..."

---

## 📚 Referências Técnicas

### Mensagens Plugin ↔ UI

**Plugin → UI**:
- `drive-tokens-status`: Informa se há tokens salvos
- `auth-url-ready`: Envia URL para abrir no browser
- `auth-status-success`: Autenticação bem-sucedida com tokens
- `auth-status-error`: Erro durante autenticação
- `drive-export-frame`: Frame pronto para upload
- `drive-export-complete`: Exportação finalizada

**UI → Plugin**:
- `check-drive-tokens`: Verifica se há tokens salvos
- `get-drive-auth-url`: Solicita URL de autorização
- `check-drive-auth-status`: Polling para verificar status
- `save-drive-tokens`: Salva tokens no clientStorage
- `save-drive-folder-id`: Salva ID da pasta
- `clear-drive-tokens`: Remove tokens
- `export-to-drive`: Inicia exportação de frames
- `open-url`: Solicita abertura de URL no browser

### Endpoints Backend

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/drive/auth-url?requestId=XYZ` | GET | Gera URL de autorização e registra request |
| `/api/drive/callback?code=ABC&state=XYZ` | GET | Processa callback OAuth2 e salva tokens |
| `/api/drive/check-status?requestId=XYZ` | GET | Retorna status do request (polling) |
| `/api/drive/upload` | POST | Faz upload de PNG para Google Drive |
| `/api/drive/refresh-token` | POST | Atualiza access token expirado |

---

🎉 **O fluxo está completo e funcionando!** O usuário agora tem uma experiência suave e automática para conectar o Google Drive e exportar frames.
