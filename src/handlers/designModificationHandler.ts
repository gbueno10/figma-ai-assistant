// Handlers para modificação de design baseada em IA

import { DesignAnalysis } from '../types';
import { ColorUtils } from '../utils/colorUtils';
import { AIService } from '../services/aiService';

export class DesignModificationHandler {
  
  // Handler principal para modificação de design
  static async handleDesignModification(prompt: string, types: string[], apiKey: string) {
    const startTime = Date.now();
    console.log(`🎨 [${new Date().toISOString()}] Starting design modification process...`);
    console.log(`🎯 Modification types selected:`, types);
    
    try {
      // Step 1: Validate selection
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 1: Validating selection...`);
      const selectedNodes = figma.currentPage.selection;
      
      if (selectedNodes.length === 0) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Por favor, selecione pelo menos um elemento para modificar.'
        });
        return;
      }

      console.log(`📊 ${selectedNodes.length} element(s) selected for modification`);

      // Progress update
      figma.ui.postMessage({
        type: 'modify-progress',
        message: `Analisando ${selectedNodes.length} elemento(s) selecionado(s)...`,
        step: 1,
        totalSteps: 4
      });

      // Step 2: Analyze current design state (passing types)
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 2: Analyzing design state...`);
      const designAnalysis = await this.analyzeDesignForModification(selectedNodes, types);
      
      // Progress update
      figma.ui.postMessage({
        type: 'modify-progress',
        message: `Enviando dados para IA para análise...`,
        step: 2,
        totalSteps: 4
      });

      // Step 3: Get AI modifications
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 3: Getting AI modifications...`);
      const aiResponse = await AIService.getAIModifications(designAnalysis, prompt, types, apiKey);
      const aiModifications = aiResponse.modifications || aiResponse; // Support both new and old format
      const tokenUsage = aiResponse.tokenUsage;
      
      // Send modifications to UI for debugging
      figma.ui.postMessage({
        type: 'ai-modifications-received',
        modifications: aiModifications
      });
      
      // Progress update
      figma.ui.postMessage({
        type: 'modify-progress',
        message: `Aplicando modificações sugeridas pela IA...`,
        step: 3,
        totalSteps: 4
      });

      // Step 4: Duplicate frames before modification
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 4: Duplicating frames...`);
      const { duplicatedNodes, idMapping } = await this.duplicateSelectedFrames(selectedNodes);
      
      // Progress update
      figma.ui.postMessage({
        type: 'modify-progress',
        message: `Atualizando referências para elementos duplicados...`,
        step: 4,
        totalSteps: 6
      });

      // Step 5: Update AI modifications with new IDs
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 5: Updating modification IDs...`);
      const updatedModifications = this.updateModificationIds(aiModifications, idMapping);
      
      // Progress update
      figma.ui.postMessage({
        type: 'modify-progress',
        message: `Aplicando modificações nos elementos duplicados...`,
        step: 5,
        totalSteps: 6
      });

      // Step 6: Apply modifications to duplicated frames
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 6: Applying modifications...`);
      await this.applyDesignModifications(duplicatedNodes, updatedModifications);

      // Progress update
      figma.ui.postMessage({
        type: 'modify-progress',
        message: `Finalizando processo...`,
        step: 6,
        totalSteps: 6
      });

      // Success notification
      figma.ui.postMessage({
        type: 'modification-complete'
      });

      // Print final token usage summary
      if (tokenUsage) {
        console.log(`📊 ===== RESUMO FINAL DE TOKENS =====`);
        console.log(`📥 Tokens de Input: ${tokenUsage.prompt_tokens?.toLocaleString() || 'N/A'}`);
        console.log(`📤 Tokens de Output: ${tokenUsage.completion_tokens?.toLocaleString() || 'N/A'}`);
        console.log(`📊 Total de Tokens: ${tokenUsage.total_tokens?.toLocaleString() || 'N/A'}`);
        
        if (tokenUsage.prompt_tokens_details?.cached_tokens) {
          console.log(`💾 Tokens Cached: ${tokenUsage.prompt_tokens_details.cached_tokens.toLocaleString()}`);
        }
        
        // Calculate and display cost
        const inputCost = (tokenUsage.prompt_tokens / 1000000) * 1.25;
        const outputCost = (tokenUsage.completion_tokens / 1000000) * 10.00;
        let cachedCost = 0;
        if (tokenUsage.prompt_tokens_details?.cached_tokens) {
          cachedCost = (tokenUsage.prompt_tokens_details.cached_tokens / 1000000) * 0.125;
        }
        const totalCost = inputCost + outputCost + cachedCost;
        
        console.log(`💰 Custo Total: $${totalCost.toFixed(6)} USD`);
        console.log(`📊 ================================`);
      }

      figma.notify(`✅ Modificações aplicadas com sucesso em ${selectedNodes.length} elemento(s)!`);
      console.log(`🎉 [${Date.now() - startTime}ms] Design modification completed successfully`);

    } catch (error) {
      console.log(`❌ [${Date.now() - startTime}ms] Design modification error:`, error);
      figma.ui.postMessage({
        type: 'error',
        message: `Erro na modificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  }

  // Analyze design for modification
  static async analyzeDesignForModification(nodes: readonly SceneNode[], types: string[]): Promise<DesignAnalysis> {
    const analysis: DesignAnalysis = {
      elements: [],
      totalElements: 0,
      textElements: 0,
      colorElements: 0,
      layoutElements: 0
    };

    for (const node of nodes) {
      const element = this.analyzeNodeForModification(node, types);
      analysis.elements.push(element);
    }

    analysis.totalElements = analysis.elements.length;
    analysis.textElements = analysis.elements.filter(e => e.type === 'TEXT').length;
    analysis.colorElements = analysis.elements.filter(e => e.hasColor).length;
    analysis.layoutElements = analysis.elements.filter(e => e.type === 'FRAME' || e.type === 'GROUP').length;

    console.log(`📊 Design analysis: ${analysis.totalElements} total, ${analysis.textElements} texts, ${analysis.colorElements} with colors`);
    
    return analysis;
  }

  // Duplicate selected frames before modification
  static async duplicateSelectedFrames(nodes: readonly SceneNode[]): Promise<{duplicatedNodes: SceneNode[], idMapping: Map<string, string>}> {
    console.log(`📋 Duplicating ${nodes.length} selected element(s)...`);
    const duplicatedNodes: SceneNode[] = [];
    const idMapping = new Map<string, string>();
    
    for (const node of nodes) {
      try {
        console.log(`📋 Duplicating element: ${node.name} (${node.type})`);
        
        // Clone the node
        const duplicatedNode = node.clone();
        
        // Create ID mapping for original and duplicated elements
        this.createIdMappingRecursive(node, duplicatedNode, idMapping);
        
        // Position the duplicate next to the original
        if (node.type === 'FRAME') {
          duplicatedNode.x = node.x + node.width + 50; // Add some spacing
          duplicatedNode.y = node.y;
        } else {
          duplicatedNode.x = node.x + 50;
          duplicatedNode.y = node.y + 50;
        }
        
        // Update the name to indicate it's modified
        duplicatedNode.name = `${node.name} (AI Modified)`;
        
        // Add to the same parent
        if (node.parent && 'appendChild' in node.parent) {
          node.parent.appendChild(duplicatedNode);
        } else {
          figma.currentPage.appendChild(duplicatedNode);
        }
        
        duplicatedNodes.push(duplicatedNode);
        console.log(`✅ Successfully duplicated: ${duplicatedNode.name} (ID: ${duplicatedNode.id})`);
        
      } catch (error) {
        console.log(`❌ Failed to duplicate element ${node.name}:`, error);
        // If duplication fails, use the original node (fallback)
        duplicatedNodes.push(node);
      }
    }
    
    // Select the duplicated nodes
    figma.currentPage.selection = duplicatedNodes;
    
    // Center view on duplicated elements
    if (duplicatedNodes.length > 0) {
      figma.viewport.scrollAndZoomIntoView(duplicatedNodes);
    }
    
    console.log(`✅ Successfully duplicated ${duplicatedNodes.length} element(s)`);
    console.log(`📋 Created ID mapping with ${idMapping.size} entries`);
    
    return { duplicatedNodes, idMapping };
  }

  // Create ID mapping between original and duplicated nodes recursively
  static createIdMappingRecursive(originalNode: SceneNode, duplicatedNode: SceneNode, idMapping: Map<string, string>) {
    // Map the main node
    idMapping.set(originalNode.id, duplicatedNode.id);
    console.log(`🔗 ID Mapping: ${originalNode.id} -> ${duplicatedNode.id} (${originalNode.name})`);
    
    // Recursively map children
    if ('children' in originalNode && 'children' in duplicatedNode) {
      const originalChildren = originalNode.children;
      const duplicatedChildren = duplicatedNode.children;
      
      if (originalChildren.length === duplicatedChildren.length) {
        for (let i = 0; i < originalChildren.length; i++) {
          this.createIdMappingRecursive(originalChildren[i], duplicatedChildren[i], idMapping);
        }
      } else {
        console.log(`⚠️ Children count mismatch for ${originalNode.name}: ${originalChildren.length} vs ${duplicatedChildren.length}`);
      }
    }
  }

  // Update AI modifications to use new IDs from duplicated elements
  static updateModificationIds(modifications: any, idMapping: Map<string, string>): any {
    console.log(`🔄 Updating ${modifications.modifications.length} modifications with new IDs...`);
    
    const updatedModifications = {
      ...modifications,
      modifications: modifications.modifications.map((mod: any) => {
        const newId = idMapping.get(mod.elementId);
        if (newId) {
          console.log(`🔄 Updated modification ID: ${mod.elementId} -> ${newId} (${mod.type})`);
          return {
            ...mod,
            elementId: newId
          };
        } else {
          console.log(`⚠️ No ID mapping found for element: ${mod.elementId}`);
          return mod;
        }
      })
    };
    
    console.log(`✅ Updated ${updatedModifications.modifications.length} modifications`);
    return updatedModifications;
  }

  // Analyze individual node for modification with conditional property inclusion
  static analyzeNodeForModification(node: SceneNode, types: string[]): any {
    // Propriedades base que são sempre necessárias
    const element: any = {
      id: node.id,
      name: node.name,
      type: node.type,
      children: []
    };

    // --- Início da Lógica Condicional ---

    // Adiciona dados de LAYOUT
    if (types.includes('layout')) {
      element.x = node.x;
      element.y = node.y;
      element.width = node.width;
      element.height = node.height;
    }

    // Adiciona dados de TEXTO
    if (types.includes('text') && node.type === 'TEXT') {
      const textNode = node as TextNode;
      element.text = textNode.characters;
      element.fontSize = textNode.fontSize;
      element.fontName = textNode.fontName;
    }

    // Adiciona dados de COR
    if (types.includes('color')) {
      element.hasColor = false; // Começa como falso
      element.colors = [];

      // Lógica para 'fills'
      if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
        const visibleFills = node.fills.filter(fill => fill.visible !== false && fill.type === 'SOLID');
        if (visibleFills.length > 0) {
          element.hasColor = true;
          for (const fill of visibleFills) {
            element.colors.push({
              type: 'fill',
              color: (fill as SolidPaint).color,
              opacity: (fill as SolidPaint).opacity || 1
            });
          }
        }
      }
      
      // Lógica para 'strokes'
      if ('strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
        const strokeWeight = 'strokeWeight' in node ? (node as any).strokeWeight : 0;
        if (strokeWeight > 0) {
          const visibleStrokes = node.strokes.filter(stroke => stroke.visible !== false && stroke.type === 'SOLID');
          if (visibleStrokes.length > 0) {
            element.hasColor = true;
            for (const stroke of visibleStrokes) {
              element.colors.push({
                type: 'stroke',
                color: (stroke as SolidPaint).color,
                opacity: (stroke as SolidPaint).opacity || 1,
                strokeWeight: strokeWeight
              });
            }
          }
        }
      }
    }

    // Adiciona dados de ESTILO
    if (types.includes('style')) {
      if ('cornerRadius' in node) {
        element.cornerRadius = (node as any).cornerRadius;
      }
      if ('effects' in node && (node as any).effects.length > 0) {
        element.effects = (node as any).effects;
      }
    }
    
    // --- Fim da Lógica Condicional ---

    // Analisa filhos recursivamente, passando 'types' adiante
    if ('children' in node) {
      for (const child of node.children) {
        element.children.push(this.analyzeNodeForModification(child, types));
      }
    }

    return element;
  }

  // Apply design modifications
  static async applyDesignModifications(nodes: readonly SceneNode[], aiModifications: any) {
    console.log(`🔧 Applying ${aiModifications.modifications.length} modifications...`);
    console.log(`🔍 [DEBUG] All selected nodes:`, nodes.map(n => ({ id: n.id, name: n.name, type: n.type })));
    
    // Load fonts for text modifications
    const fontsToLoad = new Set<FontName>();
    for (const mod of aiModifications.modifications) {
      console.log(`🔍 [DEBUG] Processing modification:`, mod);
      
      if (mod.type === 'text') {
        const element = this.findElementById(nodes, mod.elementId);
        console.log(`🔍 [DEBUG] Found element for ${mod.elementId}:`, element ? { id: element.id, name: element.name, type: element.type } : 'NOT FOUND');
        
        if (element && element.type === 'TEXT') {
          const textNode = element as TextNode;
          const fontName = textNode.fontName as FontName;
          if (fontName && fontName.family && fontName.style) {
            fontsToLoad.add(fontName);
          }
        }
      }
    }

    // Load all necessary fonts
    if (fontsToLoad.size > 0) {
      try {
        await Promise.all(Array.from(fontsToLoad).map(font => figma.loadFontAsync(font)));
        console.log(`✅ Loaded ${fontsToLoad.size} fonts for text modifications`);
      } catch (fontError) {
        console.log(`⚠️ Some fonts could not be loaded:`, fontError);
      }
    }

    // Apply each modification with statistics
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const mod of aiModifications.modifications) {
      try {
        console.log(`🔄 [DEBUG] Applying modification ${successCount + skippedCount + errorCount + 1}/${aiModifications.modifications.length}:`, {
          elementId: mod.elementId,
          type: mod.type,
          action: mod.action
        });
        
        await this.applySingleModification(nodes, mod);
        successCount++;
        console.log(`✅ Applied modification: ${mod.type} for element ${mod.elementId}`);
        
      } catch (error) {
        errorCount++;
        console.log(`❌ Failed to apply modification for element ${mod.elementId}:`, error);
      }
    }
    
    console.log(`📊 Modification results: ${successCount} successful, ${skippedCount} skipped, ${errorCount} errors`);
    
    // Notify user of results
    if (successCount > 0) {
      figma.notify(`✅ Aplicadas ${successCount} modificações com sucesso!`);
    }
    if (errorCount > 0) {
      figma.notify(`⚠️ ${errorCount} modificações falharam`, { error: true });
    }
    
    // Force UI refresh
    console.log(`🔄 [DEBUG] Forcing Figma viewport refresh...`);
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  // Apply a single modification
  static async applySingleModification(nodes: readonly SceneNode[], modification: any) {
    console.log(`🔧 [DEBUG] Attempting to apply modification:`, {
      elementId: modification.elementId,
      type: modification.type,
      action: modification.action,
      newValue: modification.newValue
    });
    
    // Skip modifications with fake IDs
    if (modification.elementId && modification.elementId.startsWith('new:')) {
      console.log(`⚠️ [DEBUG] Skipping modification with fake ID: ${modification.elementId}`);
      return;
    }
    
    // Validate modification has required fields
    if (!modification.elementId) {
      console.log(`⚠️ [DEBUG] Skipping modification - missing elementId`);
      return;
    }
    
    const element = this.findElementById(nodes, modification.elementId);
    if (!element) {
      console.log(`❌ [DEBUG] Element ${modification.elementId} not found - skipping modification`);
      console.log(`🔍 [DEBUG] Available root node IDs:`, nodes.map(n => `${n.id} (${n.name})`));
      return; // Don't throw error, just skip
    }

    console.log(`✅ [DEBUG] Found element for modification: ${element.id} (${element.name}) - type: ${element.type}`);

    switch (modification.type) {
      case 'text':
        await this.applyTextModification(element, modification);
        break;
      case 'color':
        await this.applyColorModification(element, modification);
        break;
      case 'layout':
        await this.applyLayoutModification(element, modification);
        break;
      case 'style':
        await this.applyStyleModification(element, modification);
        break;
      default:
        console.log(`⚠️ Unknown modification type: ${modification.type}`);
    }
  }

  // Apply text modification with auto font size adjustment
  static async applyTextModification(element: SceneNode, modification: any) {
    console.log(`🔤 [DEBUG] Applying text modification:`, modification);
    
    if (element.type !== 'TEXT') {
      console.log(`❌ [DEBUG] Element is not TEXT type: ${element.type}`);
      return;
    }
    
    const textNode = element as TextNode;
    console.log(`🔤 [DEBUG] Current text: "${textNode.characters}"`);
    
    if (modification.action === 'replace' && modification.newValue) {
      try {
        // 1. Armazenar as propriedades originais da caixa de texto
        const originalWidth = textNode.width;
        const originalHeight = textNode.height;
        const originalTextAutoResize = textNode.textAutoResize;

        // Extract text from newValue
        let newText = modification.newValue;
        if (typeof newText === 'object') {
          if (newText.text) {
            newText = newText.text;
          } else {
            newText = String(newText);
          }
        }

        console.log(`🔤 [DEBUG] Original dimensions: ${originalWidth}x${originalHeight}, autoResize: ${originalTextAutoResize}`);
        console.log(`🔤 [DEBUG] Changing text to: "${newText}"`);

        // Validar que fontSize é um número antes de prosseguir
        if (typeof textNode.fontSize !== 'number') {
          console.log(`⚠️ Font size is mixed or not a number, skipping auto-fit.`);
          // Aplica o texto sem ajuste
          const fontName = textNode.fontName as FontName;
          if (fontName && fontName.family && fontName.style) await figma.loadFontAsync(fontName);
          textNode.characters = newText;
          return;
        }

        let currentFontSize = textNode.fontSize;
        const MIN_FONT_SIZE = 8; // Define um tamanho mínimo para a fonte para evitar que fique ilegível
        console.log(`🔤 [DEBUG] Starting font size: ${currentFontSize}px, minimum: ${MIN_FONT_SIZE}px`);

        // 2. Carregar a fonte e aplicar o novo texto
        const fontName = textNode.fontName as FontName;
        if (fontName && fontName.family && fontName.style) {
          console.log(`🔤 [DEBUG] Loading font:`, fontName);
          await figma.loadFontAsync(fontName);
        }
        
        textNode.characters = newText;

        // 3. Mudar temporariamente o modo de redimensionamento para medir o overflow
        // Isso faz a caixa de texto crescer para acomodar todo o conteúdo.
        textNode.textAutoResize = 'WIDTH_AND_HEIGHT';
        console.log(`🔤 [DEBUG] Set textAutoResize to WIDTH_AND_HEIGHT for overflow detection`);

        // 4. Loop para reduzir o tamanho da fonte se o texto transbordar
        let iterations = 0;
        const maxIterations = 50; // Evita loops infinitos
        
        while (
          (textNode.width > originalWidth || textNode.height > originalHeight) &&
          currentFontSize > MIN_FONT_SIZE &&
          iterations < maxIterations
        ) {
          currentFontSize--;
          iterations++;
          console.log(`📏 [RESIZE] Text overflowed (${textNode.width.toFixed(1)}x${textNode.height.toFixed(1)} > ${originalWidth}x${originalHeight}). Reducing font size to ${currentFontSize}px (iteration ${iterations})`);
          textNode.fontSize = currentFontSize;
        }

        if (iterations >= maxIterations) {
          console.log(`⚠️ [RESIZE] Reached maximum iterations (${maxIterations}), stopping font size reduction`);
        }

        // 5. Restaurar as propriedades originais da caixa de texto
        textNode.textAutoResize = originalTextAutoResize;
        textNode.resize(originalWidth, originalHeight); // Garante que a caixa volte ao tamanho exato

        console.log(`✅ [DEBUG] Text successfully changed and fitted. Final font size: ${currentFontSize}px after ${iterations} adjustments`);
        console.log(`🔤 [DEBUG] Final dimensions: ${textNode.width}x${textNode.height}, autoResize restored to: ${textNode.textAutoResize}`);
        
        // Force selection update to make change visible
        figma.currentPage.selection = [textNode];

      } catch (error) {
        console.log(`❌ [DEBUG] Error applying text modification:`, error);
        throw error;
      }
    } else {
      console.log(`⚠️ [DEBUG] Invalid modification action or newValue:`, modification);
    }
  }

  // Apply color modification with opacity preservation and stroke support
  static async applyColorModification(element: SceneNode, modification: any) {
    console.log(`🎨 [DEBUG] Applying color modification:`, modification);
    
    // Validate that element supports colors (fills or strokes)
    if (!('fills' in element) && !('strokes' in element)) {
      console.log(`❌ [DEBUG] Element does not support fills or strokes: ${element.type}`);
      return;
    }

    // Parse the new color value
    if ((modification.action === 'replace' || modification.action === 'modify') && modification.newValue) {
      console.log(`🎨 [DEBUG] Parsing color: ${modification.newValue}`);
      
      let colorString = modification.newValue;
      if (typeof colorString === 'object') {
        colorString = String(colorString);
      }
      
      // Try to parse hex colors
      const hexMatch = colorString.match(/#([A-Fa-f0-9]{6})/);
      if (hexMatch) {
        colorString = hexMatch[0];
      }
      
      const newColor = ColorUtils.parseColor(colorString);
      
      if (!newColor) {
        console.log(`❌ [DEBUG] Failed to parse color: ${modification.newValue}`);
        return;
      }
      
      console.log(`🎨 [DEBUG] Parsed color:`, newColor);
      
      // TASK 1: Try to modify existing fills first (with opacity preservation)
      let colorApplied = await this.applyColorToFills(element, newColor);
      
      // TASK 2: If no fill was modified, try strokes (only if strokeWeight > 0)
      if (!colorApplied) {
        colorApplied = await this.applyColorToStrokes(element, newColor);
      }
      
      if (colorApplied) {
        console.log(`✅ [DEBUG] Color successfully applied to ${colorApplied}`);
        // Force selection update to make change visible
        figma.currentPage.selection = [element];
      } else {
        console.log(`⚠️ [DEBUG] No suitable fill or stroke found for color modification on element: ${element.name} (${element.id})`);
      }
      
    } else {
      console.log(`⚠️ [DEBUG] Invalid color modification:`, modification);
    }
  }

  // TASK 1 Implementation: Apply color to fills while preserving opacity
  static async applyColorToFills(element: SceneNode, newColor: RGB): Promise<string | null> {
    if (!('fills' in element)) {
      return null;
    }

    const currentFills = (element as any).fills as Paint[];
    
    // Validate that we have fills to work with
    if (!currentFills || !Array.isArray(currentFills) || currentFills.length === 0) {
      console.log(`🔍 [DEBUG] No fills found on element`);
      return null;
    }

    // Find the first visible SOLID fill
    const solidFillIndex = currentFills.findIndex(fill => 
      fill.visible !== false && fill.type === 'SOLID'
    );

    if (solidFillIndex === -1) {
      console.log(`🔍 [DEBUG] No visible solid fills found`);
      return null;
    }

    // CRITICAL: Clone the fills array and create new objects to avoid readonly issues
    const clonedFills = currentFills.map((fill, index) => {
      if (index === solidFillIndex && fill.type === 'SOLID') {
        const oldFill = fill as SolidPaint;
        // Preserve existing opacity or default to 1
        const existingOpacity = oldFill.opacity !== undefined ? oldFill.opacity : 1;
        
        console.log(`🎨 [DEBUG] Modifying fill at index ${solidFillIndex}, preserving opacity: ${existingOpacity}`);
        
        // Create a completely new SolidPaint object with preserved properties
        return {
          type: 'SOLID' as const,
          color: newColor,
          opacity: existingOpacity,
          visible: oldFill.visible !== false,
          blendMode: oldFill.blendMode || 'NORMAL'
        } as SolidPaint;
      }
      // For other fills, return a shallow copy
      return { ...fill };
    });
    
    // Apply the cloned and modified fills array back to the element
    (element as any).fills = clonedFills;
    
    const targetFill = currentFills[solidFillIndex] as SolidPaint;
    const preservedOpacity = targetFill.opacity !== undefined ? targetFill.opacity : 1;
    
    return `fill (opacity: ${Math.round(preservedOpacity * 100)}%)`;
  }

  // TASK 2 Implementation: Apply color to strokes while preserving opacity
  static async applyColorToStrokes(element: SceneNode, newColor: RGB): Promise<string | null> {
    if (!('strokes' in element) || !('strokeWeight' in element)) {
      return null;
    }

    // Check if stroke is visible (strokeWeight > 0)
    const strokeWeight = (element as any).strokeWeight;
    if (!strokeWeight || strokeWeight <= 0) {
      console.log(`🔍 [DEBUG] Stroke weight is 0 or undefined, skipping stroke modification`);
      return null;
    }

    const currentStrokes = (element as any).strokes as Paint[];
    
    // Validate that we have strokes to work with
    if (!currentStrokes || !Array.isArray(currentStrokes) || currentStrokes.length === 0) {
      console.log(`🔍 [DEBUG] No strokes found on element`);
      return null;
    }

    // Find the first visible SOLID stroke
    const solidStrokeIndex = currentStrokes.findIndex(stroke => 
      stroke.visible !== false && stroke.type === 'SOLID'
    );

    if (solidStrokeIndex === -1) {
      console.log(`🔍 [DEBUG] No visible solid strokes found`);
      return null;
    }

    // CRITICAL: Clone the strokes array and create new objects to avoid readonly issues
    const clonedStrokes = currentStrokes.map((stroke, index) => {
      if (index === solidStrokeIndex && stroke.type === 'SOLID') {
        const oldStroke = stroke as SolidPaint;
        // Preserve existing opacity or default to 1
        const existingOpacity = oldStroke.opacity !== undefined ? oldStroke.opacity : 1;
        
        console.log(`🎨 [DEBUG] Modifying stroke at index ${solidStrokeIndex}, preserving opacity: ${existingOpacity}, strokeWeight: ${strokeWeight}`);
        
        // Create a completely new SolidPaint object with preserved properties
        return {
          type: 'SOLID' as const,
          color: newColor,
          opacity: existingOpacity,
          visible: oldStroke.visible !== false,
          blendMode: oldStroke.blendMode || 'NORMAL'
        } as SolidPaint;
      }
      // For other strokes, return a shallow copy
      return { ...stroke };
    });
    
    // Apply the cloned and modified strokes array back to the element
    (element as any).strokes = clonedStrokes;
    
    const targetStroke = currentStrokes[solidStrokeIndex] as SolidPaint;
    const preservedOpacity = targetStroke.opacity !== undefined ? targetStroke.opacity : 1;
    
    return `stroke (opacity: ${Math.round(preservedOpacity * 100)}%, weight: ${strokeWeight}px)`;
  }

  // Apply layout modification
  static async applyLayoutModification(element: SceneNode, modification: any) {
    if (modification.action === 'modify') {
      if (modification.newValue.x !== undefined) element.x = modification.newValue.x;
      if (modification.newValue.y !== undefined) element.y = modification.newValue.y;
      
      if ('resize' in element) {
        if (modification.newValue.width !== undefined) {
          (element as any).resize(modification.newValue.width, element.height);
        }
        if (modification.newValue.height !== undefined) {
          (element as any).resize(element.width, modification.newValue.height);
        }
      }
    }
  }

  // Apply style modification
  static async applyStyleModification(element: SceneNode, modification: any) {
    if (modification.action === 'modify' && 'cornerRadius' in element) {
      if (modification.newValue.cornerRadius !== undefined) {
        (element as any).cornerRadius = modification.newValue.cornerRadius;
      }
    }
  }

  // Helper function to find element by ID with improved performance
  static findElementById(nodes: readonly SceneNode[], elementId: string): SceneNode | null {
    console.log(`🔍 [DEBUG] Searching for element ID: ${elementId} in ${nodes.length} root nodes`);
    
    // Create a flattened list of all elements for faster searching
    const allElements: SceneNode[] = [];
    
    function flattenNodes(nodeList: readonly SceneNode[]) {
      for (const node of nodeList) {
        allElements.push(node);
        if ('children' in node && node.children.length > 0) {
          flattenNodes(node.children);
        }
      }
    }
    
    flattenNodes(nodes);
    console.log(`🔍 [DEBUG] Flattened to ${allElements.length} total elements`);
    
    // Search through flattened list
    for (const element of allElements) {
      if (element.id === elementId) {
        console.log(`✅ [DEBUG] Found element: ${element.id} (${element.name}) - type: ${element.type}`);
        return element;
      }
    }
    
    console.log(`❌ [DEBUG] Element ${elementId} not found in any of the ${allElements.length} total elements`);
    
    // Debug: Show some available IDs for comparison
    if (allElements.length > 0) {
      const sampleIds = allElements.slice(0, 5).map(el => `${el.id} (${el.name})`);
      console.log(`🔍 [DEBUG] Sample available IDs: ${sampleIds.join(', ')}`);
    }
    
    return null;
  }
}
