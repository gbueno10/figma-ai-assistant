# 🏗️ Arquitetura do Figma AI Assistant

## 🔑 Como Funciona a API Key

### ❌ Conceito ERRADO (não é assim):

```
Usuário → Backend (.env com OPENAI_API_KEY) → OpenAI
```

### ✅ Conceito CORRETO (assim que funciona):

```
Usuário → Plugin Figma (armazena key) → Backend → OpenAI
                ↓ envia key em cada request
```

---

## 🔐 Fluxo de Autenticação

### 1️⃣ Primeira Vez que Usa o Plugin

```typescript
// Frontend (Plugin Figma)
const apiKey = await figma.clientStorage.getAsync('openai_api_key');

if (!apiKey) {
  // Pede pro usuário inserir a chave
  const userKey = prompt('Insira sua OpenAI API Key:');
  await figma.clientStorage.setAsync('openai_api_key', userKey);
}
```

### 2️⃣ Cada Requisição ao Backend

```typescript
// Frontend (src/services/backendClient.ts)
const response = await fetch('http://localhost:3000/api/design/analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    screenshot: '...',
    structure: {...},
    apiKey: await figma.clientStorage.getAsync('openai_api_key') // ← Enviada aqui!
  })
});
```

### 3️⃣ Backend Resolve a Chave

```typescript
// Backend (src/utils/apiKey.ts)
export function resolveApiKey(providedKey?: string): string {
  const key = providedKey || process.env.OPENAI_API_KEY;
  //           ↑ Prioridade pro que vem do frontend!
  //                         ↑ Fallback opcional (geralmente não usado)
  
  if (!key) {
    throw new Error('OpenAI API key not provided...');
  }
  return key;
}
```

### 4️⃣ Backend Usa a Chave

```typescript
// Backend (src/services/openaiClient.ts)
export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey, // ← A chave que veio do frontend!
  });
}
```

---

## 📊 Diagrama Completo

```
┌──────────────────────────────────────────────────────────────┐
│                  COMPUTADOR DO USUÁRIO                        │
│                                                               │
│  ┌─────────────────┐                  ┌──────────────────┐   │
│  │  Figma Desktop  │                  │  Docker Backend  │   │
│  │                 │                  │                  │   │
│  │  ┌───────────┐  │    fetch()       │  ┌────────────┐ │   │
│  │  │  Plugin   │  │─────────────────→│  │  Express   │ │   │
│  │  │  (UI)     │  │                  │  │  Routes    │ │   │
│  │  └─────┬─────┘  │                  │  └──────┬─────┘ │   │
│  │        │        │                  │         │       │   │
│  │  ┌─────▼─────┐  │                  │  ┌──────▼─────┐ │   │
│  │  │clientSto- │  │   {              │  │ resolveApi │ │   │
│  │  │rage       │  │    apiKey,       │  │ Key()      │ │   │
│  │  │           │  │    screenshot,   │  │            │ │   │
│  │  │ API Key   │  │    ...           │  └──────┬─────┘ │   │
│  │  │ Stored    │  │   }              │         │       │   │
│  │  └───────────┘  │                  │  ┌──────▼─────┐ │   │
│  │                 │                  │  │createOpen- │ │   │
│  │                 │                  │  │AIClient()  │ │   │
│  └─────────────────┘                  │  └──────┬─────┘ │   │
│                                       │         │       │   │
└───────────────────────────────────────┴─────────┼───────┴───┘
                                                  │
                                        ┌─────────▼────────┐
                                        │  OpenAI API      │
                                        │  (Internet)      │
                                        └──────────────────┘
```

---

## 🎯 Por que essa arquitetura?

### ✅ Vantagens:

1. **Segurança do Usuário**
   - Cada usuário usa sua própria chave
   - Backend não precisa armazenar chaves
   - Não há risco de vazamento centralizado

2. **Simplicidade de Deploy**
   - Backend não precisa de configuração de secrets
   - `docker run` sem variáveis de ambiente
   - Fácil de distribuir

3. **Controle de Custos**
   - Cada usuário paga pelo seu próprio uso
   - Não há custo centralizado para quem distribui

4. **Multi-tenant Natural**
   - Backend pode servir múltiplos usuários
   - Cada um com sua própria chave
   - Sem conflitos ou mistura de contas

### 🤔 Quando usar `.env` no backend?

A variável `OPENAI_API_KEY` no backend é um **fallback opcional** útil para:

- **Desenvolvimento local**: Não precisar configurar no plugin toda vez
- **Testes automatizados**: CI/CD pode usar uma chave de teste
- **Demo público**: Se você quiser disponibilizar um backend compartilhado

Mas **em produção para usuários finais**, é melhor que cada um use sua própria chave via plugin!

---

## 🔄 Fluxo de uma Requisição Completa

### Exemplo: Análise de Design

```typescript
// 1. Usuário clica em "Analisar Design" no plugin
// ↓

// 2. Plugin coleta dados
const screenshot = await captureScreenshot(selectedNode);
const structure = await analyzeStructure(selectedNode);
const apiKey = await figma.clientStorage.getAsync('openai_api_key');

// 3. Plugin envia tudo pro backend
const response = await postToBackend('/api/design/analysis', {
  screenshot,
  structure,
  apiKey  // ← Aqui!
});

// 4. Backend recebe
app.post('/api/design/analysis', async (req, res) => {
  const { screenshot, structure, apiKey } = req.body;
  
  // 5. Backend resolve a chave (usa a que veio ou fallback)
  const key = resolveApiKey(apiKey);
  
  // 6. Backend cria cliente OpenAI
  const client = createOpenAIClient(key);
  
  // 7. Backend chama OpenAI
  const result = await client.chat.completions.create({...});
  
  // 8. Backend retorna pro plugin
  res.json(result);
});

// 9. Plugin recebe e mostra pro usuário
```

---

## 🛡️ Segurança

### ✅ Boas Práticas Implementadas:

1. **API Key nunca em logs**
   ```typescript
   console.log({ providedApiKey: Boolean(apiKey) }); // ← Não loga a chave real!
   ```

2. **Armazenamento seguro no Figma**
   ```typescript
   figma.clientStorage // ← API segura do Figma, não acessível por JS comum
   ```

3. **HTTPS em produção**
   - Backend deve rodar com HTTPS (nginx, Cloudflare, etc)
   - Evita interceptação da chave em trânsito

### 🚨 Melhorias Futuras:

1. **Criptografia da chave no clientStorage**
   ```typescript
   const encrypted = encrypt(apiKey, userPassword);
   await figma.clientStorage.setAsync('openai_api_key', encrypted);
   ```

2. **Tokens com expiração**
   - Backend gera token temporário
   - Plugin usa token em vez de API key direta

3. **Rate limiting por IP**
   - Prevenir abuso do backend público

---

## 📝 Resumo

| Componente | Responsabilidade | Armazena Key? |
|------------|------------------|---------------|
| **Plugin Figma** | UI, coleta dados, armazena key | ✅ Sim (clientStorage) |
| **Backend** | API proxy, validação, processamento | ❌ Não (apenas recebe) |
| **OpenAI** | Processamento de IA | ❌ Não (valida apenas) |

**Fluxo da chave:**
```
Usuário digita → Plugin armazena → Plugin envia em cada request → Backend usa → OpenAI valida
```

---

**Última atualização**: Novembro 2025
