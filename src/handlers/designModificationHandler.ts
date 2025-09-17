// Handlers para modificação de design baseada em IA

import { DesignAnalysis } from '../types';
import { ColorUtils } from '../utils/colorUtils';
import { AIService } from '../services/aiService';

export class DesignModificationHandler {
  
  // Handler principal para modificação de design
  static async handleDesignModification(msg: any) {
    const startTime = Date.now();
    console.log(`🎨 [${new Date().toISOString()}] Starting design modification process...`);
    
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

      // Step 2: Analyze current design state
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 2: Analyzing design state...`);
      const designAnalysis = await this.analyzeDesignForModification(selectedNodes);
      
      // Progress update
      figma.ui.postMessage({
        type: 'modify-progress',
        message: `Enviando dados para IA para análise...`,
        step: 2,
        totalSteps: 4
      });

      // Step 3: Get AI modifications
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 3: Getting AI modifications...`);
      const aiModifications = await AIService.getAIModifications(designAnalysis, msg.prompt, msg.types, msg.apiKey);
      
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
  static async analyzeDesignForModification(nodes: readonly SceneNode[]): Promise<DesignAnalysis> {
    const analysis: DesignAnalysis = {
      elements: [],
      totalElements: 0,
      textElements: 0,
      colorElements: 0,
      layoutElements: 0
    };

    for (const node of nodes) {
      const element = this.analyzeNodeForModification(node);
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

  // Analyze individual node for modification
  static analyzeNodeForModification(node: SceneNode): any {
    const element: any = {
      id: node.id,
      name: node.name,
      type: node.type,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      hasColor: false,
      colors: [],
      text: null,
      children: []
    };

    // Analyze text
    if (node.type === 'TEXT') {
      const textNode = node as TextNode;
      element.text = textNode.characters;
      element.fontSize = textNode.fontSize;
      element.fontName = textNode.fontName;
    }

    // Analyze colors - only mark as hasColor if element actually has visible fills
    if ('fills' in node && node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
      const fills = node.fills as Paint[];
      const visibleFills = fills.filter(fill => fill.visible !== false);
      
      for (const fill of visibleFills) {
        if (fill.type === 'SOLID') {
          element.hasColor = true;
          element.colors.push({
            type: 'fill',
            color: fill.color,
            opacity: fill.opacity || 1
          });
        }
      }
    }

    // Analyze strokes - only consider visible strokes with actual width
    if ('strokes' in node && node.strokes && Array.isArray(node.strokes) && node.strokes.length > 0) {
      const strokeWeight = 'strokeWeight' in node ? (typeof node.strokeWeight === 'number' ? node.strokeWeight : 0) : 0;
      
      if (strokeWeight > 0) {
        const strokes = node.strokes as Paint[];
        const visibleStrokes = strokes.filter(stroke => stroke.visible !== false);
        
        for (const stroke of visibleStrokes) {
          if (stroke.type === 'SOLID') {
            element.hasColor = true;
            element.colors.push({
              type: 'stroke',
              color: stroke.color,
              opacity: stroke.opacity || 1,
              strokeWeight: strokeWeight
            });
          }
        }
      }
    }

    // Analyze children recursively
    if ('children' in node) {
      for (const child of node.children) {
        element.children.push(this.analyzeNodeForModification(child));
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

  // Apply text modification
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
        // Load current font
        const fontName = textNode.fontName as FontName;
        console.log(`🔤 [DEBUG] Loading font:`, fontName);
        
        if (fontName && fontName.family && fontName.style) {
          await figma.loadFontAsync(fontName);
        }
        
        // Extract text from newValue
        let newText = modification.newValue;
        if (typeof newText === 'object') {
          if (newText.text) {
            newText = newText.text;
          } else {
            newText = String(newText);
          }
        }
        
        console.log(`🔤 [DEBUG] Changing text to: "${newText}"`);
        textNode.characters = newText;
        console.log(`✅ [DEBUG] Text successfully changed`);
        
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

  // Apply color modification
  static async applyColorModification(element: SceneNode, modification: any) {
    console.log(`🎨 [DEBUG] Applying color modification:`, modification);
    
    if (!('fills' in element)) {
      console.log(`❌ [DEBUG] Element does not support fills: ${element.type}`);
      return;
    }

    // Check if element already has colors before applying modification
    const currentFills = (element as any).fills as Paint[];
    const hasExistingColors = currentFills && Array.isArray(currentFills) && 
                              currentFills.length > 0 && 
                              currentFills.some(fill => fill.visible !== false && fill.type === 'SOLID');
    
    if (!hasExistingColors) {
      console.log(`⚠️ [DEBUG] Skipping color modification - element has no existing colors: ${element.name} (${element.id})`);
      return;
    }
    
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
      
      if (newColor) {
        const newFill: SolidPaint = {
          type: 'SOLID',
          color: newColor
        };
        
        console.log(`🎨 [DEBUG] Applying new color:`, newColor);
        element.fills = [newFill];
        console.log(`✅ [DEBUG] Color successfully applied`);
        
        // Force selection update to make change visible
        figma.currentPage.selection = [element];
        
      } else {
        console.log(`❌ [DEBUG] Failed to parse color: ${modification.newValue}`);
      }
    } else {
      console.log(`⚠️ [DEBUG] Invalid color modification:`, modification);
    }
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
