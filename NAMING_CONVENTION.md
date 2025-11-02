# Convenção de Nomenclatura IA para Figma

## Visão Geral

Este documento descreve a implementação da convenção de nomenclatura para frames duplicados pelo plugin Assistente IA para Figma. A nomenclatura segue a convenção Dogo existente, mas com regras específicas para modificações de IA.

## Formato de Nomenclatura

O formato padrão segue o padrão:
```
Ticket[number]_V[variant]_[dimension]_[language]_[petTactic]
```

Exemplos:
- `Ticket5234_V123AI_50x50_PT_Escassez`
- `Ticket7891_V456AI_100x100_EN_Urgência`

## Regras de Nomenclatura

### Regra 1: Iteração/Cor (Color Only Changes)

**Condição**: Apenas modificações de cor (`types = ['color']`)

**Comportamento**:
- ✅ **Mantém** o número do ticket original
- 🔄 **Gera** nova variante aleatória com sufixo AI (ex: `V123AI`)

**Exemplo**:
```
Original:  Ticket5234_V1_50x50_PT_Escassez
Duplicado: Ticket5234_V789AI_50x50_PT_Escassez
```

### Regra 2: Novo Conceito (Outras Modificações)

**Condição**: Qualquer outra combinação de modificações (`types = ['text']`, `['layout']`, `['color', 'text']`, etc.)

**Comportamento**:
- 🆕 **Gera** novo número de ticket aleatório (entre 4000-9000)
- 🔄 **Gera** nova variante aleatória com sufixo AI

**Exemplo**:
```
Original:  Ticket2025_V1_50x50_PT_Escassez
Duplicado: Ticket7234_V456AI_50x50_PT_Escassez
```

## Implementação Técnica

### Arquivos Envolvidos

1. **`src/utils/namingConvention.ts`** - Utilitários de nomenclatura
2. **`src/handlers/designModificationHandler.ts`** - Handler de modificação

### Funções Principais

#### NamingUtils.readFrameMetadata()
```typescript
readFrameMetadata(frame: FrameNode): MetadataReadResult
```
- Lê metadados do frame (via `pluginData` ou parsing do nome)
- Retorna objeto com dados existentes e fonte da informação

#### NamingUtils.generateCreativeName()
```typescript
generateCreativeName(frame: FrameNode, data: FrameMetadata): string
```
- Gera o nome do frame baseado nos metadados
- Segue o formato: `Ticket[number]_V[variant]_[dimension]_[language]_[petTactic]`

#### NamingUtils.generateRandomVariant()
```typescript
generateRandomVariant(): string
```
- Gera variante aleatória: número entre 1-999 + sufixo "AI"
- Exemplo: `123AI`, `456AI`, `789AI`

#### NamingUtils.generateNewTicketNumber()
```typescript
generateNewTicketNumber(): string
```
- Gera número de ticket aleatório entre 4000-9000
- Exemplo: `5234`, `7891`, `6543`

#### NamingUtils.saveFrameMetadata()
```typescript
saveFrameMetadata(frame: FrameNode, data: FrameMetadata): void
```
- Salva metadados no `pluginData` do frame
- Namespace: `dogo-ai-assistant`

### Fluxo de Execução

```
1. Usuário seleciona frames e solicita modificação
   ↓
2. handleDesignModification() recebe tipos de modificação
   ↓
3. duplicateSelectedFrames(nodes, types) é chamado
   ↓
4. Para cada frame:
   a. Clone do frame original
   b. Leitura dos metadados originais
   c. Determinação da regra (cor apenas vs. outras)
   d. Geração de novo ticket/variante
   e. Construção de novos metadados
   f. Aplicação do novo nome
   g. Salvamento dos metadados
   ↓
5. Frames duplicados são modificados pela IA
```

## Plano de Contingência (Fallback)

Se ocorrer qualquer erro durante o processo de nomenclatura:
- ⚠️ O erro é capturado no `try...catch`
- 🔄 Aplica-se o nome padrão: `[Nome Original] (AI Modified)`
- ✅ O plugin continua funcionando normalmente

**Cenários de Fallback**:
- Frame não segue convenção Dogo
- Erro ao ler `pluginData`
- Erro ao fazer parsing do nome
- Qualquer outra exceção na nomenclatura

## Estrutura de Metadados

```typescript
interface FrameMetadata {
  ticketNumber?: string;    // Ex: "5234"
  variant?: string;         // Ex: "123AI"
  petTactic?: string;       // Ex: "Escassez"
  dimension?: string;       // Ex: "50x50"
  language?: string;        // Ex: "PT"
  [key: string]: any;       // Outros campos customizados
}
```

## Armazenamento de Dados

Os metadados são armazenados usando a API `pluginData` do Figma:
- **Namespace**: `dogo-ai-assistant`
- **Key**: `frameMetadata`
- **Formato**: JSON stringificado

Vantagens:
- ✅ Persiste entre sessões do Figma
- ✅ Não depende do parsing do nome
- ✅ Suporta metadados complexos
- ✅ Compatível com a estrutura existente

## Exemplos de Uso

### Exemplo 1: Mudança de Cor Apenas
```typescript
// Entrada
Original Frame: "Ticket2025_V1_50x50_PT_Escassez"
Types: ['color']

// Saída
Duplicated Frame: "Ticket2025_V789AI_50x50_PT_Escassez"
// Mesmo ticket, nova variante AI
```

### Exemplo 2: Mudança de Texto
```typescript
// Entrada
Original Frame: "Ticket2025_V1_50x50_PT_Escassez"
Types: ['text']

// Saída
Duplicated Frame: "Ticket6543_V234AI_50x50_PT_Escassez"
// Novo ticket, nova variante AI
```

### Exemplo 3: Mudança Múltipla
```typescript
// Entrada
Original Frame: "Ticket2025_V1_50x50_PT_Escassez"
Types: ['color', 'text', 'layout']

// Saída
Duplicated Frame: "Ticket7891_V456AI_50x50_PT_Escassez"
// Novo ticket, nova variante AI
```

### Exemplo 4: Frame Sem Convenção (Fallback)
```typescript
// Entrada
Original Frame: "My Custom Frame"
Types: ['color']

// Saída
Duplicated Frame: "My Custom Frame (AI Modified)"
// Nome padrão aplicado
```

## Logs e Debug

O sistema implementa logging extensivo para debug:

```
🎯 Modification types for naming: color
📖 Metadados lidos do pluginData para frame "Ticket2025_V1_50x50_PT_Escassez"
🎲 Variante aleatória gerada: 789AI
🏷️ Regra 1 (Iteração): Mesmo Ticket (2025), Novo Variant (789AI)
🏷️ Nome gerado: "Ticket2025_V789AI_50x50_PT_Escassez"
💾 Metadados salvos no pluginData
🏷️ Frame AI versionado e renomeado para: Ticket2025_V789AI_50x50_PT_Escassez
```

## Manutenção e Extensão

Para adicionar novos campos aos metadados:
1. Adicionar propriedade à interface `FrameMetadata`
2. Atualizar `generateCreativeName()` se necessário
3. Metadados são preservados automaticamente via spread operator

Para adicionar novas regras de nomenclatura:
1. Modificar a lógica de decisão em `duplicateSelectedFrames()`
2. Adicionar novos casos baseados em `types`
3. Implementar geração de valores se necessário
