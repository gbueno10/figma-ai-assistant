/// <reference types="@figma/plugin-typings" />

// Plugin principal do AI Design Assistant
figma.showUI(__html__, { width: 400, height: 500 });

// Interfaces para as sugestões da IA
interface AISuggestion {
  type: 'text' | 'layout' | 'style' | 'structure';
  elementId?: string;
  elementName?: string;
  currentValue?: string;
  suggestedValue: string;
  confidence: number;
  reasoning: string;
}

interface AIResponse {
  suggestions: AISuggestion[];
  summary: string;
  improvements: string[];
}

// Classe principal do plugin
class AIDesignAssistant {
  
  // Captura screenshot do frame selecionado
  async captureScreenshot(): Promise<string> {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      throw new Error("Selecione um frame para capturar!");
    }
    
    const node = selection[0];
    if (node.type !== "FRAME") {
      throw new Error("Por favor, selecione um frame!");
    }
    
    try {
      // Captura screenshot em formato base64
      const screenshot = await node.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 1 }
      });
      
      // Converte para base64 string
      const base64 = figma.base64Encode(screenshot);
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      throw new Error(`Erro ao capturar screenshot: ${error}`);
    }
  }
  
  // Analisa a estrutura do frame de forma organizada para IA
  analyzeStructure(): any {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      throw new Error("Selecione um frame para analisar!");
    }
    
    const frame = selection[0] as FrameNode;
    
    // Contadores para organização
    const elementGroups = {
      textElements: [] as any[],
      imageElements: [] as any[],
      shapeElements: [] as any[],
      containerElements: [] as any[],
      buttonElements: [] as any[],
      iconElements: [] as any[]
    };
    
    function categorizeElement(node: SceneNode): string {
      const name = node.name.toLowerCase();
      
      if (node.type === 'TEXT') return 'text';
      if (node.type === 'FRAME' || node.type === 'GROUP') return 'container';
      if (name.includes('button') || name.includes('btn')) return 'button';
      if (name.includes('icon') || name.includes('ico')) return 'icon';
      if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'POLYGON') return 'shape';
      if (name.includes('image') || name.includes('img') || name.includes('photo')) return 'image';
      
      return 'shape'; // default
    }
    
    function extractElementData(node: SceneNode, depth = 0): any {
      const category = categorizeElement(node);
      
      const baseInfo = {
        id: node.id,
        name: node.name,
        type: node.type,
        category: category,
        position: { x: node.x, y: node.y },
        dimensions: { width: node.width, height: node.height },
        visible: node.visible,
        locked: node.locked || false,
        depth: depth
      };
      
      // Dados específicos por tipo
      const specificData: any = {};
      
      if (node.type === 'TEXT') {
        const textNode = node as TextNode;
        specificData.content = textNode.characters;
        specificData.fontSize = textNode.fontSize;
        specificData.fontFamily = typeof textNode.fontName === 'object' ? textNode.fontName.family : 'Unknown';
        specificData.fontWeight = typeof textNode.fontName === 'object' ? textNode.fontName.style : 'Unknown';
        specificData.textAlign = {
          horizontal: textNode.textAlignHorizontal,
          vertical: textNode.textAlignVertical
        };
        specificData.textDecoration = textNode.textDecoration;
        specificData.letterSpacing = textNode.letterSpacing;
        specificData.lineHeight = textNode.lineHeight;
        
        // Adiciona ao grupo de textos
        elementGroups.textElements.push({ ...baseInfo, ...specificData });
        
      } else if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'POLYGON') {
        const shapeNode = node as any;
        
        // Extrai cores de preenchimento
        if (shapeNode.fills && Array.isArray(shapeNode.fills)) {
          specificData.fills = shapeNode.fills.map((fill: any) => {
            if (fill.type === 'SOLID' && fill.color) {
              const { r, g, b } = fill.color;
              return {
                type: 'solid',
                color: `rgb(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)})`,
                opacity: fill.opacity || 1
              };
            }
            return { type: fill.type };
          });
        }
        
        // Extrai informações de borda
        if (shapeNode.strokes && Array.isArray(shapeNode.strokes)) {
          specificData.strokes = shapeNode.strokes.map((stroke: any) => {
            if (stroke.type === 'SOLID' && stroke.color) {
              const { r, g, b } = stroke.color;
              return {
                type: 'solid',
                color: `rgb(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)})`,
                weight: shapeNode.strokeWeight || 0
              };
            }
            return { type: stroke.type };
          });
        }
        
        // Raio de bordas para retângulos
        if (node.type === 'RECTANGLE' && 'cornerRadius' in shapeNode) {
          specificData.cornerRadius = shapeNode.cornerRadius;
        }
        
        // Adiciona ao grupo apropriado
        if (category === 'button') {
          elementGroups.buttonElements.push({ ...baseInfo, ...specificData });
        } else if (category === 'icon') {
          elementGroups.iconElements.push({ ...baseInfo, ...specificData });
        } else {
          elementGroups.shapeElements.push({ ...baseInfo, ...specificData });
        }
        
      } else if (node.type === 'FRAME' || node.type === 'GROUP') {
        const containerNode = node as any;
        
        // Informações de layout
        if ('layoutMode' in containerNode) {
          specificData.layout = {
            mode: containerNode.layoutMode,
            direction: containerNode.primaryAxisAlignItems,
            spacing: containerNode.itemSpacing,
            padding: {
              top: containerNode.paddingTop || 0,
              right: containerNode.paddingRight || 0,
              bottom: containerNode.paddingBottom || 0,
              left: containerNode.paddingLeft || 0
            }
          };
        }
        
        elementGroups.containerElements.push({ ...baseInfo, ...specificData });
      }
      
      // Processa filhos recursivamente
      let children: any[] = [];
      if ('children' in node && node.children) {
        children = node.children.map(child => extractElementData(child, depth + 1));
      }
      
      return {
        ...baseInfo,
        ...specificData,
        childrenCount: children.length,
        children: children
      };
    }
    
    // Processa o frame principal
    const frameData = extractElementData(frame);
    
    // Calcula estatísticas
    const stats = {
      totalElements: this.countElements(frame),
      textElements: elementGroups.textElements.length,
      imageElements: elementGroups.imageElements.length,
      shapeElements: elementGroups.shapeElements.length,
      containerElements: elementGroups.containerElements.length,
      buttonElements: elementGroups.buttonElements.length,
      iconElements: elementGroups.iconElements.length,
      maxDepth: this.calculateMaxDepth(frame),
      layoutType: this.detectLayoutType(frame),
      colorPalette: this.extractColorPalette(frame)
    };
    
    // Estrutura final otimizada para IA
    return {
      designInfo: {
        frameId: frame.id,
        frameName: frame.name,
        dimensions: {
          width: frame.width,
          height: frame.height
        },
        timestamp: new Date().toISOString()
      },
      hierarchy: frameData,
      elementsByCategory: elementGroups,
      statistics: stats,
      designPatterns: this.detectDesignPatterns(elementGroups),
      accessibility: this.analyzeAccessibility(elementGroups)
    };
  }
  
  // Conta elementos totais
  countElements(node: SceneNode): number {
    let count = 1;
    if ('children' in node && node.children) {
      count += node.children.reduce((sum, child) => sum + this.countElements(child), 0);
    }
    return count;
  }
  
  // Conta elementos de texto
  countTextElements(node: SceneNode): number {
    let count = node.type === 'TEXT' ? 1 : 0;
    if ('children' in node && node.children) {
      count += node.children.reduce((sum, child) => sum + this.countTextElements(child), 0);
    }
    return count;
  }
  
  // Detecta tipo de layout
  detectLayoutType(frame: FrameNode): string {
    if (frame.layoutMode === 'HORIZONTAL') return 'horizontal';
    if (frame.layoutMode === 'VERTICAL') return 'vertical';
    return 'absolute';
  }
  
  // Extrai paleta de cores
  extractColorPalette(node: SceneNode): string[] {
    const colors = new Set<string>();
    
    function extractColors(n: SceneNode) {
      if ('fill' in n && n.fill) {
        if (Array.isArray(n.fill)) {
          n.fill.forEach(fill => {
            if (fill.type === 'SOLID' && fill.color) {
              const { r, g, b } = fill.color;
              colors.add(`rgb(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)})`);
            }
          });
        }
      }
      
      if ('children' in n && n.children) {
        n.children.forEach(extractColors);
      }
    }
    
    extractColors(node);
    return Array.from(colors);
  }

  // Calcula a profundidade máxima da árvore de elementos
  calculateMaxDepth(node: SceneNode, currentDepth = 0): number {
    let maxDepth = currentDepth;
    
    if ('children' in node && node.children) {
      for (const child of node.children) {
        const childDepth = this.calculateMaxDepth(child, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }
    
    return maxDepth;
  }

  // Detecta padrões de design comuns
  detectDesignPatterns(elementGroups: any): any {
    const patterns = {
      hasHeader: false,
      hasFooter: false,
      hasNavigation: false,
      hasCTA: false,
      hasCards: false,
      hasForm: false,
      layoutPattern: 'unknown'
    };

    // Detecta header
    patterns.hasHeader = elementGroups.containerElements.some((el: any) => 
      el.name.toLowerCase().includes('header') || 
      (el.position.y < 100 && el.dimensions.width > 300)
    );

    // Detecta footer
    patterns.hasFooter = elementGroups.containerElements.some((el: any) => 
      el.name.toLowerCase().includes('footer')
    );

    // Detecta navegação
    patterns.hasNavigation = elementGroups.containerElements.some((el: any) => 
      el.name.toLowerCase().includes('nav') || 
      el.name.toLowerCase().includes('menu')
    );

    // Detecta call-to-action
    patterns.hasCTA = elementGroups.buttonElements.length > 0 || 
      elementGroups.textElements.some((el: any) => 
        el.name.toLowerCase().includes('cta') || 
        el.name.toLowerCase().includes('button')
      );

    // Detecta cards
    patterns.hasCards = elementGroups.containerElements.filter((el: any) => 
      el.name.toLowerCase().includes('card') || 
      (el.dimensions.width > 200 && el.dimensions.height > 150)
    ).length >= 2;

    // Detecta formulários
    patterns.hasForm = elementGroups.containerElements.some((el: any) => 
      el.name.toLowerCase().includes('form') || 
      el.name.toLowerCase().includes('input')
    );

    // Detecta padrão de layout
    if (patterns.hasHeader && patterns.hasFooter) {
      patterns.layoutPattern = 'header-content-footer';
    } else if (patterns.hasNavigation) {
      patterns.layoutPattern = 'navigation-based';
    } else if (patterns.hasCards) {
      patterns.layoutPattern = 'card-based';
    } else {
      patterns.layoutPattern = 'simple';
    }

    return patterns;
  }

  // Analisa aspectos de acessibilidade
  analyzeAccessibility(elementGroups: any): any {
    const accessibility = {
      textContrast: 'unknown',
      fontSizes: [],
      hasAltText: false,
      hasProperHierarchy: false,
      colorOnly: false,
      recommendations: [] as string[]
    };

    // Analisa tamanhos de fonte
    accessibility.fontSizes = elementGroups.textElements
      .map((el: any) => el.fontSize)
      .filter((size: any) => size && typeof size === 'number');

    const minFontSize = Math.min(...accessibility.fontSizes);
    if (minFontSize < 12) {
      accessibility.recommendations.push('Alguns textos podem estar muito pequenos (< 12px)');
    }

    // Verifica hierarquia de texto
    const uniqueFontSizes = [...new Set(accessibility.fontSizes)].sort((a, b) => b - a);
    accessibility.hasProperHierarchy = uniqueFontSizes.length >= 2;
    
    if (!accessibility.hasProperHierarchy) {
      accessibility.recommendations.push('Considere usar diferentes tamanhos de fonte para criar hierarquia visual');
    }

    // Verifica se há elementos apenas com diferenciação por cor
    const hasOnlyColorDifference = elementGroups.shapeElements.some((el: any) => 
      el.fills && el.fills.length === 1 && !el.strokes?.length
    );
    
    if (hasOnlyColorDifference) {
      accessibility.recommendations.push('Evite usar apenas cor para diferenciar elementos importantes');
    }

    return accessibility;
  }

  // Gera JSON estruturado e otimizado para IA
  generateAIOptimizedJSON(): any {
    const structureData = this.analyzeStructure();
    
    // JSON otimizado e limpo para IA
    const aiData = {
      // Informações básicas do design
      design: {
        id: structureData.designInfo.frameId,
        name: structureData.designInfo.frameName,
        dimensions: structureData.designInfo.dimensions,
        timestamp: structureData.designInfo.timestamp
      },
      
      // Estatísticas resumidas
      summary: {
        totalElements: structureData.statistics.totalElements,
        elementTypes: {
          text: structureData.statistics.textElements,
          buttons: structureData.statistics.buttonElements,
          images: structureData.statistics.imageElements,
          containers: structureData.statistics.containerElements,
          shapes: structureData.statistics.shapeElements,
          icons: structureData.statistics.iconElements
        },
        complexity: structureData.statistics.maxDepth > 5 ? 'high' : 
                   structureData.statistics.maxDepth > 3 ? 'medium' : 'low',
        layoutType: structureData.statistics.layoutType,
        colorPalette: structureData.statistics.colorPalette
      },
      
      // Elementos organizados por categoria (mais fácil para IA processar)
      elements: {
        texts: structureData.elementsByCategory.textElements.map(el => ({
          id: el.id,
          name: el.name,
          content: el.content,
          fontSize: el.fontSize,
          fontFamily: el.fontFamily,
          position: el.position,
          dimensions: el.dimensions
        })),
        
        buttons: structureData.elementsByCategory.buttonElements.map(el => ({
          id: el.id,
          name: el.name,
          position: el.position,
          dimensions: el.dimensions,
          style: {
            fills: el.fills,
            cornerRadius: el.cornerRadius
          }
        })),
        
        containers: structureData.elementsByCategory.containerElements.map(el => ({
          id: el.id,
          name: el.name,
          position: el.position,
          dimensions: el.dimensions,
          layout: el.layout,
          childrenCount: el.childrenCount
        }))
      },
      
      // Padrões detectados
      patterns: structureData.designPatterns,
      
      // Análise de acessibilidade
      accessibility: structureData.accessibility,
      
      // Contexto para IA
      context: {
        purpose: "Design analysis for AI suggestions",
        requestedImprovements: [
          "Visual hierarchy optimization",
          "UX/UI best practices compliance",
          "Accessibility improvements",
          "Design system consistency",
          "Content and copy suggestions"
        ]
      }
    };
    
    return aiData;
  }
  
  // Envia dados para a IA (simulado por enquanto)
  async sendToAI(screenshot: string, structure: any): Promise<AIResponse> {
    // Por enquanto, retorna sugestões simuladas
    // Aqui você integraria com a API do ChatGPT/OpenAI
    
    const suggestions: AISuggestion[] = [
      {
        type: 'text',
        elementName: 'Título principal',
        currentValue: 'Texto antigo',
        suggestedValue: 'Texto mais envolvente e moderno',
        confidence: 0.85,
        reasoning: 'O texto atual pode ser mais impactante com linguagem mais direta'
      },
      {
        type: 'layout',
        elementName: 'Botão CTA',
        suggestedValue: 'Centralizar e aumentar tamanho',
        confidence: 0.72,
        reasoning: 'Melhora a taxa de conversão baseada em melhores práticas de UX'
      },
      {
        type: 'style',
        elementName: 'Background',
        suggestedValue: 'Usar gradiente sutil em vez de cor sólida',
        confidence: 0.68,
        reasoning: 'Adiciona profundidade visual sem comprometer a legibilidade'
      }
    ];
    
    return {
      suggestions,
      summary: 'Análise completa do design realizada com sucesso',
      improvements: [
        'Melhorar hierarquia visual',
        'Otimizar espaçamento',
        'Reforçar call-to-action'
      ]
    };
  }
  
  // Aplica uma sugestão específica
  async applySuggestion(suggestion: AISuggestion): Promise<void> {
    // Implementação futura para aplicar mudanças automaticamente
    figma.notify(`Aplicando sugestão: ${suggestion.reasoning}`, { timeout: 2000 });
  }
}

// Instância global do assistente
const aiAssistant = new AIDesignAssistant();

// Escuta mensagens da UI
figma.ui.onmessage = async (msg) => {
  console.log('Mensagem recebida da UI:', msg);
  
  try {
    if (msg.type === 'capture-and-analyze') {
      console.log('Iniciando análise...');
      
      // Verifica se há frame selecionado
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.notify('❌ Selecione um frame primeiro!', { timeout: 3000 });
        figma.ui.postMessage({
          type: 'error',
          message: 'Nenhum frame selecionado'
        });
        return;
      }
      
      if (selection[0].type !== 'FRAME') {
        figma.notify('❌ Por favor, selecione um frame (não grupo ou outro elemento)!', { timeout: 3000 });
        figma.ui.postMessage({
          type: 'error', 
          message: 'Elemento selecionado não é um frame'
        });
        return;
      }
      
      console.log('Frame válido encontrado:', selection[0].name);
      
      // Captura screenshot
      const screenshot = await aiAssistant.captureScreenshot();
      console.log('Screenshot capturado');
      
      // Gera JSON estruturado para IA
      const structuredData = aiAssistant.generateAIOptimizedJSON();
      console.log('JSON estruturado gerado');
      
      // Envia para IA
      const aiResponse = await aiAssistant.sendToAI(screenshot, structuredData);
      console.log('Resposta da IA obtida');
      
      // Retorna resultado para UI
      figma.ui.postMessage({
        type: 'analysis-complete',
        screenshot,
        structuredData,
        aiResponse
      });
      
      figma.notify('✅ Análise concluída! JSON estruturado gerado.', { timeout: 3000 });
      
    } else if (msg.type === 'apply-suggestion') {
      await aiAssistant.applySuggestion(msg.suggestion);
      
    } else if (msg.type === 'export-json') {
      // Gera e exporta JSON estruturado
      const structuredData = aiAssistant.generateAIOptimizedJSON();
      
      figma.ui.postMessage({
        type: 'json-exported',
        data: structuredData
      });
      
      figma.notify('📄 JSON estruturado gerado! Copiado para a área de transferência.', { timeout: 3000 });
      
    } else if (msg.type === 'cancel') {
      figma.closePlugin();
    }
  } catch (error: any) {
    figma.notify(`❌ Erro: ${error.message}`, { timeout: 5000 });
    console.error('Plugin error:', error);
  }
};

// Inicialização automática
const selection = figma.currentPage.selection;
if (selection.length > 0 && selection[0].type === "FRAME") {
  const frame = selection[0];
  figma.ui.postMessage({
    type: 'frame-selected',
    frameName: frame.name,
    elementCount: aiAssistant.countElements(frame)
  });
}
