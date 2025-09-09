# 🔍 Debug: Plugin Não Funciona - Como Identificar o Problema

## 🎯 **Checklist de Verificação:**

### 1. **Verificar se o Plugin Foi Carregado Corretamente**
```
✅ No Figma: Plugins → Development → "AI Design Assistant" aparece?
✅ Se não aparecer: Reimporte o manifest.json
```

### 2. **Verificar Frame Selecionado**
```
✅ Selecione um FRAME (não grupo, não shape, não texto)
✅ O frame deve estar visível na tela
✅ Deve aparecer uma mensagem sobre o frame selecionado
```

### 3. **Abrir Console de Debug**
No Figma:
```
1. Execute o plugin
2. Clique com botão direito na interface do plugin
3. Selecione "Inspect" ou "Inspecionar"
4. Vá na aba "Console"
```

### 4. **O Que Procurar no Console**
Quando clicar "Analisar Design", deve aparecer:
```
✅ "Botão Analisar Design clicado"
✅ "Enviando mensagem para o plugin..."
✅ "Mensagem recebida da UI: {type: 'capture-and-analyze'}"
✅ "Iniciando análise..."
✅ "Frame válido encontrado: [nome do frame]"
✅ "Screenshot capturado"
✅ "JSON estruturado gerado"
```

### 5. **Problemas Comuns e Soluções**

#### ❌ **"Nenhum frame selecionado"**
**Solução:** Selecione um frame antes de clicar no botão

#### ❌ **"Elemento selecionado não é um frame"**
**Solução:** Certifique-se de que selecionou um FRAME, não um grupo ou shape

#### ❌ **Erro de permissão**
**Solução:** Recarregue o plugin

#### ❌ **Console não mostra mensagens**
**Solução:** Problema na comunicação UI ↔ Plugin
- Feche e reabra o plugin
- Reimporte o manifest.json

### 6. **Teste Rápido**
```javascript
// Cole isso no console da UI para testar a comunicação:
parent.postMessage({
  pluginMessage: { type: 'capture-and-analyze' }
}, '*');
```

### 7. **Logs Detalhados**
O plugin agora tem logs detalhados. Procure por:
- ✅ Logs na UI (console da interface)
- ✅ Logs no plugin principal (console do Figma)
- ✅ Notificações do Figma

## 🚀 **Solução Definitiva:**

1. **Feche o plugin**
2. **Selecione um frame**
3. **Execute o plugin novamente**
4. **Abra o console de debug**
5. **Clique "Analisar Design"**
6. **Verifique os logs no console**

Se ainda não funcionar, me envie o que aparece no console!
