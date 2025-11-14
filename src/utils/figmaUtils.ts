/**
 * Utilitários para manipulação de nós do Figma
 * Especialmente para duplicação de frames e busca de nós correspondentes
 */

import { NamingUtils } from './namingConvention';

/**
 * Encontra o nó correspondente em um frame duplicado
 * Compara tipo, nome e posição relativa para localizar o "gêmeo" do nó original
 */
export function findCorrespondingNode(
  originalNode: SceneNode,
  duplicatedFrame: FrameNode
): SceneNode | null {
  // Obter índice do nó original na lista de filhos do seu parent
  const originalParent = originalNode.parent;
  if (!originalParent || !('children' in originalParent)) {
    console.log('⚠️ Original node has no valid parent');
    return null;
  }

  const originalIndex = originalParent.children.indexOf(originalNode);
  const originalName = originalNode.name;
  const originalType = originalNode.type;
  const originalPosition = { x: originalNode.x, y: originalNode.y };

  console.log(`🔍 Searching for corresponding node:`, {
    name: originalName,
    type: originalType,
    index: originalIndex,
    position: originalPosition
  });

  /**
   * Busca recursiva em árvore de nós
   * Prioriza: mesmo nome + mesma posição + mesmo tipo
   */
  const searchInChildren = (
    parent: BaseNode & ChildrenMixin,
    depth: number = 0
  ): SceneNode | null => {
    const indent = '  '.repeat(depth);
    
    for (let i = 0; i < parent.children.length; i++) {
      const child = parent.children[i];
      
      // Critério 1: Mesmo nome
      if (child.name === originalName) {
        // Critério 2: Mesmo tipo
        if (child.type === originalType) {
          // Critério 3: Mesma posição (com tolerância de 1px para arredondamento)
          const childPos = { x: child.x, y: child.y };
          const posMatch = 
            Math.abs(originalPosition.x - childPos.x) < 1 && 
            Math.abs(originalPosition.y - childPos.y) < 1;
          
          if (posMatch) {
            console.log(`${indent}✅ Found exact match at depth ${depth}:`, {
              name: child.name,
              type: child.type,
              position: childPos
            });
            return child as SceneNode;
          } else {
            console.log(`${indent}⚠️ Name and type match but position differs:`, {
              expected: originalPosition,
              actual: childPos,
              diff: {
                x: Math.abs(originalPosition.x - childPos.x),
                y: Math.abs(originalPosition.y - childPos.y)
              }
            });
          }
        }
      }
      
      // Busca recursiva em filhos
      if ('children' in child) {
        const found = searchInChildren(child as BaseNode & ChildrenMixin, depth + 1);
        if (found) return found;
      }
    }
    
    return null;
  };

  const result = searchInChildren(duplicatedFrame);
  
  if (!result) {
    console.log('❌ Could not find corresponding node in duplicated frame');
  }
  
  return result;
}

/**
 * Duplica um frame e aplica a convenção de nomenclatura Dogo
 * Retorna o frame duplicado posicionado ao lado do original
 */
export function duplicateFrameWithDogoNaming(originalFrame: FrameNode): FrameNode {
  console.log(`🎯 Duplicating frame: ${originalFrame.name}`);
  
  // 1. Clonar o frame
  const duplicatedFrame = originalFrame.clone() as FrameNode;
  
  // 2. Posicionar ao lado do original (50px de distância)
  duplicatedFrame.x = originalFrame.x + originalFrame.width + 50;
  duplicatedFrame.y = originalFrame.y;
  
  // 3. Adicionar ao mesmo parent
  if (originalFrame.parent && 'appendChild' in originalFrame.parent) {
    originalFrame.parent.appendChild(duplicatedFrame);
  } else {
    figma.currentPage.appendChild(duplicatedFrame);
  }
  
  // 4. Aplicar convenção de nomenclatura Dogo
  try {
    const newName = applyDogoNamingConvention(originalFrame.name);
    duplicatedFrame.name = newName;
    console.log(`🏷️ Frame renamed to: ${newName}`);
  } catch (namingError) {
    console.log(`⚠️ Failed to apply naming convention:`, namingError);
    duplicatedFrame.name = `${originalFrame.name} (AI Regenerated)`;
  }
  
  return duplicatedFrame;
}

/**
 * Aplica a convenção de nomenclatura Dogo para variantes de IA
 * Gera novo ticket number (4000-9000) e variant (XXXAI)
 * 
 * Formatos suportados:
 * - Dogo_6564_v1_1080x1080_... → Dogo_7821_456AI_1080x1080_...
 * - Dogo_6564_TEMPLATE_v1b_1080x1080_... → Dogo_7821_456AI_1080x1080_...
 * - MyFrame_1080x1080_... → Dogo_7821_456AI_MyFrame_1080x1080_...
 */
export function applyDogoNamingConvention(originalName: string): string {
  // Gerar sufixo de data
  const getCurrentDateSuffix = (): string => {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[now.getMonth()];
    const day = now.getDate();
    return `${month}${day}`;
  };
  
  // Gerar novo ticket number e variant específicos para IA
  const aiTicketNumber = Math.floor(Math.random() * (9000 - 4000 + 1)) + 4000; // 4000-9000
  const aiVariantNumber = Math.floor(Math.random() * 900) + 100; // 100-999
  const newTicketNumber = aiTicketNumber.toString();
  const newVariant = `${aiVariantNumber}AI`; // ex: 124AI
  
  console.log(`🎲 Generated AI credentials:`, {
    ticket: newTicketNumber,
    variant: newVariant,
    originalName
  });
  
  // Remover sufixo de data existente (formato: _MêsDD)
  const dateRegex = /_([A-Za-z]{3}\d{1,2})$/;
  const nameBase = originalName.replace(dateRegex, '');
  
  // Remove sufixos como " - Permuted" que o Figma adiciona automaticamente
  const cleanNameBase = nameBase.replace(/(\s*-\s*Permuted)+$/gi, '').trim();
  
  // Remove prefixo Dogo_ se existir
  const withoutDogo = cleanNameBase.replace(/^Dogo_/, '');
  
  console.log(`🔍 Parsing name:`, {
    original: originalName,
    withoutDate: nameBase,
    withoutDogo
  });
  
  // Split por underscore para pegar os componentes
  const parts = withoutDogo.split('_');
  
  // Regex para identificar tickets (apenas números ou Ticket + números)
  const ticketRegex = /^(Ticket\d+|\d+)$/;
  
  // Regex para identificar variants (v1, v2, TEMPLATE_v1b, 156AI, etc.)
  // Variants podem ser: v1, v2, v123, v1a, v1b, TEMPLATE_v1, 456AI, etc.
  const variantRegex = /^(v\d+[a-z]?|\d+AI|TEMPLATE.*|VERSION.*)$/i;
  
  const hasTicket = parts.length > 0 && ticketRegex.test(parts[0]);
  
  let newName = '';
  
  if (hasTicket) {
    console.log(`✅ Found ticket in first position: ${parts[0]}`);
    
    // Encontrar onde termina o variant (pode ter múltiplos componentes de variant)
    let variantEndIndex = 1; // Começa depois do ticket
    
    // Procurar por componentes que parecem ser variants
    while (variantEndIndex < parts.length && variantRegex.test(parts[variantEndIndex])) {
      console.log(`   Found variant component at index ${variantEndIndex}: ${parts[variantEndIndex]}`);
      variantEndIndex++;
    }
    
    // Tudo após os variants é o resto do nome
    const restOfParts = parts.slice(variantEndIndex);
    
    console.log(`   Keeping components from index ${variantEndIndex}:`, restOfParts);
    
    if (restOfParts.length > 0) {
      newName = `Dogo_${newTicketNumber}_${newVariant}_${restOfParts.join('_')}_${getCurrentDateSuffix()}`;
      console.log(`✅ Standard Dogo convention: replaced ticket="${parts[0]}" and variants="${parts.slice(1, variantEndIndex).join('_')}"`);
    } else {
      // Caso especial: só tem ticket e variant, nada mais
      newName = `Dogo_${newTicketNumber}_${newVariant}_${getCurrentDateSuffix()}`;
      console.log(`⚠️ Only ticket and variant found, no other components`);
    }
  } else {
    // Caso 2: NÃO tem ticket number no início
    // Adiciona novo ticket/variant ANTES de todos os componentes existentes
    newName = `Dogo_${newTicketNumber}_${newVariant}_${withoutDogo}_${getCurrentDateSuffix()}`;
    console.log(`⚠️ No ticket found, prepending new ticket/variant to: ${withoutDogo}`);
  }
  
  console.log(`🏷️ Final name: ${newName}`);
  return newName;
}

/**
 * Prepara os nós para regeneração, duplicando frames quando necessário
 * Retorna array de nós alvo (dentro dos frames duplicados) e array de frames duplicados
 */
export interface RegenerationPreparation {
  nodesToRegenerate: SceneNode[];
  duplicatedFrames: FrameNode[];
}

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
  
  if (depth >= maxDepth) {
    console.log(`⚠️ Max depth reached while searching for frame`);
  }
  
  return null;
}

export function prepareNodesForRegeneration(selectedNodes: readonly SceneNode[]): RegenerationPreparation {
  const nodesToRegenerate: SceneNode[] = [];
  const duplicatedFrames: FrameNode[] = [];
  
  console.log(`🔧 Preparing ${selectedNodes.length} node(s) for regeneration...`);
  
  for (const node of selectedNodes) {
    let targetNode = node;
    
    // Log detalhado do nó e seu parent
    console.log(`\n📌 Processing node: "${node.name}" (type: ${node.type})`);
    if (node.parent) {
      console.log(`   Parent: ${node.parent.type}${node.parent.name ? ` "${node.parent.name}"` : ''}`);
    } else {
      console.log(`   Parent: null`);
    }
    
    // Buscar frame pai recursivamente (pode estar dentro de grupos, componentes, etc.)
    const originalFrame = findParentFrame(node);
    
    if (originalFrame) {
      console.log(`📦 Node "${node.name}" is inside frame "${originalFrame.name}"`);
      
      // Verificar se já duplicamos este frame (para evitar duplicatas desnecessárias)
      const alreadyDuplicated = duplicatedFrames.find(f => {
        return f.x === originalFrame.x + originalFrame.width + 50 &&
               f.y === originalFrame.y;
      });
      
      if (alreadyDuplicated) {
        console.log(`♻️ Frame already duplicated, reusing it`);
        const correspondingNode = findCorrespondingNode(node, alreadyDuplicated);
        if (correspondingNode) {
          targetNode = correspondingNode;
        }
      } else {
        // Duplicar o frame
        const duplicatedFrame = duplicateFrameWithDogoNaming(originalFrame);
        duplicatedFrames.push(duplicatedFrame);
        
        // Encontrar o nó correspondente no frame duplicado
        const correspondingNode = findCorrespondingNode(node, duplicatedFrame);
        
        if (correspondingNode) {
          targetNode = correspondingNode;
          console.log(`✅ Found corresponding node in duplicated frame: ${targetNode.name}`);
        } else {
          console.log(`⚠️ Could not find corresponding node, using original`);
          figma.notify(`⚠️ Could not map image "${node.name}" in duplicated frame`, { 
            timeout: 3000 
          });
        }
      }
    } else {
      // Nó está solto na página, sem frame pai
      console.log(`📄 Node "${node.name}" is not inside a frame, will regenerate in place`);
    }
    
    nodesToRegenerate.push(targetNode);
  }
  
  console.log(`\n✅ Preparation complete:`, {
    totalNodes: nodesToRegenerate.length,
    duplicatedFrames: duplicatedFrames.length
  });
  
  return {
    nodesToRegenerate,
    duplicatedFrames
  };
}
