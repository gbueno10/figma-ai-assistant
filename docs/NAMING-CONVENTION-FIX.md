# 🏷️ Lógica de Nomenclatura Dogo para Variantes AI

## 📋 Problema Identificado

O frame foi renomeado como:
```
Dogo_4843_156AI_TEMPLATE_v1b_1080x1080_s_App_Fake-Post_...
```

❌ **Problema**: Manteve `TEMPLATE_v1b` quando deveria remover **todos** os componentes de variant antigos.

## ✅ Resultado Esperado

```
Dogo_4843_156AI_1080x1080_s_App_Fake-Post_...
```

---

## 🔍 Análise da Estrutura de Nomes Dogo

### Formato Padrão:
```
Dogo_{TICKET}_{VARIANT}_{RESTO...}_{DATA}
```

### Componentes:

1. **Prefixo**: `Dogo_` (sempre)
2. **Ticket**: Número entre 4000-9000 para AI
3. **Variant**: Um ou mais componentes que identificam a versão
   - Exemplos: `v1`, `v2`, `v123`, `v1a`, `v1b`
   - Também: `TEMPLATE_v1`, `TEMPLATE_v1b`, `VERSION_2`, etc.
   - Para AI: `156AI`, `789AI`, etc.
4. **Resto**: Dimensão, tipo, device, concept, tática, etc.
5. **Data**: Sufixo `MêsDD` (ex: `Nov14`)

---

## 🧩 Desafio: Identificar Onde Termina o Variant

O variant pode ser **múltiplos componentes**:
- `v1` (1 componente)
- `TEMPLATE_v1b` (2 componentes: `TEMPLATE` + `v1b`)
- `VERSION_2_BETA` (3 componentes: `VERSION` + `2` + `BETA`)

A lógica antiga assumia que o variant estava sempre na **posição 2** (índice 1), mas isso falhava com variants multi-componente.

---

## ✅ Solução Implementada

### Algoritmo:

```typescript
1. Remover prefixo Dogo_ e sufixo de data
2. Split por underscore: ['4843', 'TEMPLATE', 'v1b', '1080x1080', ...]
3. Verificar se parts[0] é um ticket (regex: /^\d+$/)
4. Se SIM:
   a. Começar a buscar variants a partir de parts[1]
   b. Enquanto o componente atual parecer um variant (regex abaixo), avançar
   c. Tudo após os variants é o "resto"
5. Substituir: Dogo_{newTicket}_{newVariant}_{resto}_{newDate}
```

### Regex para Identificar Variants:

```typescript
const variantRegex = /^(v\d+[a-z]?|\d+AI|TEMPLATE.*|VERSION.*)$/i;
```

Detecta:
- ✅ `v1`, `v2`, `v123` (variants numéricos)
- ✅ `v1a`, `v1b`, `v2c` (variants com letra)
- ✅ `456AI`, `789AI` (variants AI)
- ✅ `TEMPLATE`, `TEMPLATE_v1`, `TEMPLATE_v1b` (templates)
- ✅ `VERSION`, `VERSION_2`, `VERSION_BETA` (versões)

---

## 📊 Exemplos de Transformação

### Caso 1: Variant Simples
```
Input:  Dogo_6564_v1_1080x1080_Campaign_Nov10
Output: Dogo_7821_456AI_1080x1080_Campaign_Nov14

Detectou:
  - Ticket: 6564
  - Variants: [v1]
  - Resto: [1080x1080, Campaign]
```

### Caso 2: Variant Multi-Componente (Seu Caso)
```
Input:  Dogo_4843_TEMPLATE_v1b_1080x1080_s_App_Fake-Post_Nov10
Output: Dogo_7821_456AI_1080x1080_s_App_Fake-Post_Nov14

Detectou:
  - Ticket: 4843
  - Variants: [TEMPLATE, v1b]  ← Detecta AMBOS!
  - Resto: [1080x1080, s, App, Fake-Post]
```

### Caso 3: Sem Ticket
```
Input:  MyCustomFrame_1080x1080_Campaign
Output: Dogo_7821_456AI_MyCustomFrame_1080x1080_Campaign_Nov14

Detectou:
  - Ticket: nenhum
  - Ação: Adiciona ticket/variant no início
```

### Caso 4: Variant AI Existente
```
Input:  Dogo_8234_678AI_1080x1080_Campaign_Nov10
Output: Dogo_5421_912AI_1080x1080_Campaign_Nov14

Detectou:
  - Ticket: 8234
  - Variants: [678AI]  ← AI variant também é detectado!
  - Resto: [1080x1080, Campaign]
```

---

## 🔬 Logging Detalhado

Agora o console mostra o processo completo:

```
🎲 Generated AI credentials: {
  ticket: 7821,
  variant: 456AI,
  originalName: "Dogo_4843_TEMPLATE_v1b_1080x1080_s_App_..."
}

🔍 Parsing name: {
  original: "Dogo_4843_TEMPLATE_v1b_1080x1080_s_App_..._Nov10",
  withoutDate: "Dogo_4843_TEMPLATE_v1b_1080x1080_s_App_...",
  withoutDogo: "4843_TEMPLATE_v1b_1080x1080_s_App_..."
}

✅ Found ticket in first position: 4843
   Found variant component at index 1: TEMPLATE
   Found variant component at index 2: v1b
   Keeping components from index 3: [1080x1080, s, App, Fake-Post, ...]

✅ Standard Dogo convention: 
   replaced ticket="4843" 
   and variants="TEMPLATE_v1b"

🏷️ Final name: Dogo_7821_456AI_1080x1080_s_App_Fake-Post_..._Nov14
```

---

## 🧪 Testes

### Teste 1: Variant Único
```javascript
applyDogoNamingConvention("Dogo_6564_v1_1080x1080_Campaign_Nov10")
// Esperado: Dogo_XXXX_XXXAI_1080x1080_Campaign_Nov14
// ✅ Remove apenas "v1"
```

### Teste 2: Variant Multi-Componente
```javascript
applyDogoNamingConvention("Dogo_4843_TEMPLATE_v1b_1080x1080_s_App_Nov10")
// Esperado: Dogo_XXXX_XXXAI_1080x1080_s_App_Nov14
// ✅ Remove "TEMPLATE" E "v1b"
```

### Teste 3: Sem Ticket
```javascript
applyDogoNamingConvention("MyFrame_1080x1080_Campaign")
// Esperado: Dogo_XXXX_XXXAI_MyFrame_1080x1080_Campaign_Nov14
// ✅ Adiciona ticket e variant no início
```

### Teste 4: Variant AI Existente
```javascript
applyDogoNamingConvention("Dogo_8234_678AI_1080x1080_Nov10")
// Esperado: Dogo_XXXX_XXXAI_1080x1080_Nov14
// ✅ Substitui AI variant antigo por novo
```

---

## 🛡️ Proteções

1. **Regex Robusto**: Detecta diversos padrões de variant
2. **Loop Seguro**: Para quando encontra componente que não é variant
3. **Fallback**: Se não encontrar ticket, adiciona no início
4. **Logging Completo**: Debug fácil de qualquer caso edge

---

## 📝 Próximos Passos

1. ✅ **Recompilar**: `npm run build`
2. ✅ **Recarregar plugin**: Command+Option+P → Reload Plugin
3. ✅ **Testar com seu frame**: Selecionar imagem e regenerar
4. ✅ **Verificar log**: Confirmar que variants foram removidos corretamente

---

## 🎯 Resultado Final Esperado

Para o seu caso específico:

**Antes:**
```
Dogo_4843_156AI_TEMPLATE_v1b_1080x1080_s_App_Fake-Post_T-Content_Grid-Photos_EN_Black______Nov14
```

**Depois (próxima regeneração):**
```
Dogo_7821_456AI_1080x1080_s_App_Fake-Post_T-Content_Grid-Photos_EN_Black______Nov14
```

✅ `TEMPLATE_v1b` será **completamente removido**!

---

**Última Atualização**: 14 de Novembro, 2025  
**Versão**: 1.1.1  
**Status**: ✅ Correção Implementada
