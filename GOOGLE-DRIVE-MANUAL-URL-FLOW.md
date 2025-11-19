# 🔗 Fluxo de Autenticação Manual com Polling

## ✅ Mudança Implementada

**Antes**: ❌ Tentava abrir browser automaticamente (não funciona de forma confiável)
**Agora**: ✅ **Mostra URL para o usuário copiar e colar manualmente**

---

## 🎨 Novo Visual do Estado "Conectando"

```
┌─────────────────────────────────────────────────────┐
│  🔄 Aguardando Autorização...                       │
│  Copie a URL abaixo e autorize no seu navegador.   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Spinner animado rotacionando]                    │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 📋 Copie e cole esta URL no seu navegador:   │ │
│  │                                               │ │
│  │  ┌──────────────────────────────┬──────────┐ │ │
│  │  │ https://accounts.google...   │ 📋 Copiar│ │ │
│  │  └──────────────────────────────┴──────────┘ │ │
│  │                                               │ │
│  │  💡 Após autorizar, esta janela detectará    │ │
│  │     automaticamente.                          │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Não feche esta janela do Figma enquanto autoriza. │
│                                                     │
│           [ ❌ Cancelar ]                           │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Novo Fluxo Passo a Passo

### 1. Usuário Clica "Conectar Google Drive"
```typescript
📤 UI: Gera requestId único
📤 UI → Plugin: { type: 'get-drive-auth-url', requestId }
```

### 2. Plugin Busca URL do Backend
```typescript
🔌 Plugin → Backend: GET /api/drive/auth-url?requestId=XYZ
📥 Backend → Plugin: { authUrl, requestId }
📤 Plugin → UI: { type: 'auth-url-ready', url, requestId }
```

### 3. UI Mostra URL para Copiar
```typescript
✅ UI muda para "Estado Conectando"
✅ Input mostra URL completa (readonly)
✅ Botão "Copiar" ao lado do input
✅ Inicia polling a cada 2 segundos
```

### 4. Usuário Copia e Cola URL no Navegador
```
👤 Clica no botão "📋 Copiar" OU seleciona texto manualmente
👤 Abre navegador de preferência
👤 Cola URL na barra de endereços
👤 Autoriza a aplicação no Google
```

### 5. Google Redireciona para Callback
```typescript
🌐 Browser: Redireciona para /api/drive/callback?code=ABC&state=XYZ
🔧 Backend: Troca code por tokens
💾 Backend: Salva em pendingLogins[requestId] = { status: 'success', tokens }
📄 Backend: Exibe página "✅ Pode fechar esta janela"
```

### 6. Polling Detecta Sucesso
```typescript
🔁 UI (a cada 2s): { type: 'check-drive-auth-status', requestId }
🔌 Plugin → Backend: GET /api/drive/check-status?requestId=XYZ
📥 Backend → Plugin: { status: 'success', tokens }
📤 Plugin → UI: { type: 'auth-status-success', tokens }
```

### 7. UI Salva e Muda Estado
```typescript
⏹️ UI: Para polling (clearInterval)
📤 UI → Plugin: { type: 'save-drive-tokens', tokens }
💾 Plugin: Salva em figma.clientStorage
✅ UI: Muda para "Estado Conectado"
```

---

## 🎯 Vantagens do Fluxo Manual

### ✅ Mais Confiável
- Não depende de `figma.openExternal()` funcionar
- Funciona em qualquer ambiente (Desktop, Web, etc.)
- Usuário tem controle total do processo

### ✅ Melhor UX
- URL sempre visível - pode copiar várias vezes se necessário
- Pode usar o navegador de preferência
- Pode fazer login em outra aba se já tiver navegador aberto

### ✅ Compatível
- Funciona em Figma Desktop
- Funciona em Figma Web (com limitações do clientStorage)
- Funciona em ambientes corporativos com restrições de pop-ups

### ✅ Debugging Mais Fácil
- Usuário pode ver a URL completa
- Pode verificar parâmetros da URL se houver erro
- Pode compartilhar URL com suporte técnico se necessário

---

## 💻 Código Atualizado

### UI: Botão de Copiar com Fallbacks
```typescript
copyAuthUrlBtn.addEventListener('click', () => {
  authUrlInput.select();
  
  // 1. Tenta Clipboard API moderna
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(authUrlInput.value)
      .then(() => {
        copyAuthUrlBtn.textContent = '✅ Copiado!';
        setTimeout(() => {
          copyAuthUrlBtn.textContent = '📋 Copiar';
        }, 2000);
      })
      .catch(() => {
        alert('URL selecionada. Pressione Cmd+C para copiar.');
      });
  } 
  // 2. Fallback: execCommand (antigo mas funciona)
  else {
    try {
      document.execCommand('copy');
      copyAuthUrlBtn.textContent = '✅ Copiado!';
    } catch (err) {
      alert('URL selecionada. Pressione Cmd+C para copiar.');
    }
  }
});
```

### Plugin: Envia requestId Junto com URL
```typescript
figma.ui.postMessage({
  type: 'auth-url-ready',
  url: data.authUrl,
  requestId: requestId  // ← Importante para iniciar polling
});
```

### Backend: Nenhuma Mudança Necessária
- Sistema de polling já está implementado
- `pendingLogins` Map já funciona
- Limpeza automática já está ativa

---

## 🧪 Como Testar

### 1. Iniciar Backend
```bash
cd backend
npm run dev
```

### 2. Recarregar Plugin
```
Cmd+Option+P → "Plugins: Reload Plugin"
```

### 3. Testar Fluxo Manual
1. ✅ Clicar "🔗 Conectar Google Drive"
2. ✅ Verificar que UI mostra campo de URL
3. ✅ Clicar botão "📋 Copiar"
4. ✅ Verificar feedback "✅ Copiado!"
5. ✅ Abrir navegador manualmente
6. ✅ Colar URL na barra de endereços
7. ✅ Autorizar no Google
8. ✅ Verificar que página mostra "✅ Pode fechar esta janela"
9. ✅ Voltar para Figma
10. ✅ Verificar que UI mudou automaticamente para "Conectado"

---

## 🎨 Estilo do Input de URL

```css
#authUrlInput {
  flex: 1;
  font-size: 11px;
  padding: 8px;
  background: white;
  cursor: text;
  font-family: monospace; /* ← Melhor para URLs */
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
```

---

## 📊 Comparação: Antes vs Agora

| Aspecto | Antes (Automático) | Agora (Manual) |
|---------|-------------------|----------------|
| **Abertura do browser** | ❌ Tentava `figma.openExternal()` | ✅ Usuário abre manualmente |
| **Visibilidade da URL** | ❌ Não mostrava | ✅ Sempre visível em input |
| **Botão copiar** | ❌ Não tinha | ✅ Com feedback visual |
| **Compatibilidade** | ⚠️ Dependente de ambiente | ✅ Funciona em qualquer lugar |
| **Controle do usuário** | ⚠️ Limitado | ✅ Total |
| **Debugging** | ❌ Difícil | ✅ Fácil (URL visível) |
| **Polling** | ✅ Já funcionava | ✅ Mantido |
| **UX** | ⚠️ Confuso se não abrir | ✅ Claro e intuitivo |

---

## ✅ Checklist de Implementação

- [x] Adicionar input readonly para URL no HTML
- [x] Adicionar botão "📋 Copiar"
- [x] Implementar lógica de copiar com fallbacks
- [x] Atualizar `showConnectingState()` para receber URL
- [x] Passar `requestId` junto com URL na mensagem
- [x] Expor `startPolling` no `window.driveUI`
- [x] Atualizar handler `auth-url-ready` para iniciar polling
- [x] Remover handler `open-url` (não usado mais)
- [x] Atualizar textos para português
- [x] Adicionar ícone 💡 com dica sobre detecção automática
- [x] Compilar e verificar sem erros

---

## 🎉 Resultado Final

O usuário agora tem uma experiência **confiável** e **transparente**:

1. Clica em "Conectar"
2. **VÊ** a URL completa
3. **COPIA** com um clique
4. **COLA** no navegador de escolha
5. Autoriza
6. Plugin **detecta automaticamente** via polling
7. Pronto para exportar! 🚀

---

Muito melhor que a abordagem anterior! 👍
