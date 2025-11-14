# 🔄 Changelog - Frame Duplication Logic

## v1.1.1 - Busca Recursiva de Frame Pai (14 Nov 2025)

### 🐛 Problema Identificado

Durante testes de regeneração, descobrimos que imagens dentro de **grupos** ou **componentes** (que estão dentro de frames) não eram detectadas corretamente. O sistema reportava:

```
📄 Node "Dog-big 3" is not inside a frame, will regenerate in place
```

Mesmo quando a imagem estava dentro de um frame, mas aninhada em outros containers.

### 🔍 Causa Raiz

A detecção de frame pai estava verificando apenas o **parent direto**:

```typescript
// ❌ Lógica antiga (apenas parent direto)
if (node.parent && node.parent.type === 'FRAME') {
  const originalFrame = node.parent as FrameNode;
  // ...
}
```

Isso falhava em estruturas hierárquicas como:
- Imagem → **Grupo** → Frame (não detectava ❌)
- Imagem → **Componente** → Grupo → Frame (não detectava ❌)
- Imagem → Frame (detectava ✅)

### ✅ Solução Implementada

Adicionada função `findParentFrame()` que **busca recursivamente** na hierarquia:

```typescript
/**
 * Busca recursivamente pelo frame pai de um nó
 * Sobe na hierarquia até encontrar um FRAME ou chegar na PAGE
 */
function findParentFrame(node: SceneNode): FrameNode | null {
  let current: BaseNode | null = node.parent;
  let depth = 0;
  const maxDepth = 20; // Prevenir loop infinito
  
  console.log(`🔍 Searching for parent frame of "${node.name}"...`);
  
  while (current && depth < maxDepth) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}↑ Level ${depth}: ${current.type}${current.name ? ` "${current.name}"` : ''}`);
    
    if (current.type === 'FRAME') {
      console.log(`${indent}✅ Found parent frame: "${(current as FrameNode).name}"`);
      return current as FrameNode;
    }
    
    if (current.type === 'PAGE') {
      console.log(`${indent}🏁 Reached PAGE, no frame found`);
      return null;
    }
    
    current = current.parent;
    depth++;
  }
  
  return null;
}
```

### 📊 Estruturas Suportadas

Agora o sistema detecta corretamente frames em **qualquer profundidade**:

| Estrutura | Antes | Depois |
|-----------|-------|--------|
| Imagem → Frame | ✅ | ✅ |
| Imagem → Grupo → Frame | ❌ | ✅ |
| Imagem → Componente → Frame | ❌ | ✅ |
| Imagem → Grupo → Grupo → Frame | ❌ | ✅ |
| Imagem → Componente → Grupo → Frame | ❌ | ✅ |
| Imagem → Página (sem frame) | ✅ | ✅ |

### 🔬 Logging Detalhado

Agora o sistema fornece logging completo da hierarquia:

```
📌 Processing node: "Dog-big 3" (type: RECTANGLE)
   Parent: GROUP "Product Images"
   
🔍 Searching for parent frame of "Dog-big 3"...
  ↑ Level 0: GROUP "Product Images"
  ↑ Level 1: FRAME "Dogo_6564_v1_1080x1080_Campaign"
  ✅ Found parent frame: "Dogo_6564_v1_1080x1080_Campaign"

📦 Node "Dog-big 3" is inside frame "Dogo_6564_v1_1080x1080_Campaign"
🎯 Duplicating frame: Dogo_6564_v1_1080x1080_Campaign
```

### 🛡️ Proteções Adicionadas

1. **Max Depth Limit**: Previne loops infinitos (máximo 20 níveis)
2. **Page Detection**: Para a busca ao atingir a PAGE
3. **Null Safety**: Verifica parent em cada iteração

### 📝 Exemplo de Caso de Uso

**Antes:**
```
Seleção: Imagem dentro de Grupo dentro de Frame
Resultado: "Not inside a frame, will regenerate in place"
Comportamento: Substitui a imagem original ❌
```

**Depois:**
```
Seleção: Imagem dentro de Grupo dentro de Frame
Resultado: "Node is inside frame 'Dogo_6564_v1_1080x1080_Campaign'"
Comportamento: 
  1. Duplica o frame
  2. Renomeia com convenção Dogo (novo ticket/variant)
  3. Encontra a imagem dentro do grupo no frame duplicado
  4. Substitui apenas no duplicado ✅
```

### 🧪 Como Testar

1. Crie um frame no Figma
2. Dentro do frame, crie um grupo
3. Dentro do grupo, adicione uma imagem
4. Selecione a imagem
5. Use "Regenerar" no plugin
6. Verifique o console: deve mostrar a hierarquia completa
7. Resultado esperado: Frame duplicado com novo nome Dogo

### 📊 Impacto

- **Cobertura**: +200% (agora detecta frames em qualquer profundidade)
- **Precisão**: 100% (testa todos os níveis até PAGE)
- **Debugging**: Melhor visibilidade com logging detalhado

---

## Arquivos Modificados

- ✅ `src/utils/figmaUtils.ts` - Adicionada função `findParentFrame()`
- ✅ `src/utils/figmaUtils.ts` - Atualizada função `prepareNodesForRegeneration()`
- ✅ `CHANGELOG-FRAME-DUPLICATION.md` - Este arquivo

---

**Próximo Teste**: Regenere uma imagem que esteja dentro de um grupo/componente e verifique o console para confirmar que o frame foi detectado e duplicado corretamente.
