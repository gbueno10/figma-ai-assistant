// Classe principal para análise de design do Figma

import { ElementGroups, DesignStats, AIOptimizedData } from '../types';
import { ElementAnalyzer } from '../utils/elementAnalyzer';
import { ColorUtils } from '../utils/colorUtils';
import { StructureAnalyzer } from './structureAnalyzer';

/**
 * 🔒 CORREÇÃO CRÍTICA: Estratégias de Extração para reduzir payload
 *
 * Define quais propriedades devem ser extraídas baseado no tipo de modificação
 * Reduz payload de ~47kb para ~5kb em operações simples
 */
export interface ExtractionStrategy {
  includeColors: boolean;      // fills, strokes, effects
  includeText: boolean;         // characters, fontSize, fontFamily
  includeLayout: boolean;       // x, y, width, height, padding, spacing
  includeImages: boolean;       // imageHash, imageUrl
  includeHierarchy: boolean;    // children completos
}

/**
 * Estratégias pré-definidas baseadas em tipos de modificação comuns
 */
export const EXTRACTION_STRATEGIES: Record<string, ExtractionStrategy> = {
  // Para mudanças de cor (ex: "mude as cores para azul")
  color: {
    includeColors: true,
    includeText: false,
    includeLayout: false,
    includeImages: false,
    includeHierarchy: false
  },

  // Para mudanças de texto (ex: "reescreva os textos")
  text: {
    includeColors: false,
    includeText: true,
    includeLayout: false,
    includeImages: false,
    includeHierarchy: false
  },

  // Para mudanças de layout (ex: "reorganize os elementos")
  layout: {
    includeColors: false,
    includeText: false,
    includeLayout: true,
    includeImages: false,
    includeHierarchy: true
  },

  // Para mudanças de imagens (ex: "substitua a imagem")
  image: {
    includeColors: false,
    includeText: false,
    includeLayout: true,
    includeImages: true,
    includeHierarchy: false
  },

  // Padrão: Extrai tudo (compatibilidade com código antigo)
  full: {
    includeColors: true,
    includeText: true,
    includeLayout: true,
    includeImages: true,
    includeHierarchy: true
  }
};

export class DesignAnalyzer {

  /**
   * 🆕 Detecta automaticamente a melhor estratégia baseada no prompt do usuário
   */
  static detectStrategyFromPrompt(prompt: string): ExtractionStrategy {
    const lowerPrompt = prompt.toLowerCase();

    // Keywords para cada tipo de modificação
    const colorKeywords = ['cor', 'color', 'paleta', 'palette', 'azul', 'blue', 'red', 'vermelho', 'verde', 'green', 'hex', 'rgb'];
    const textKeywords = ['texto', 'text', 'reescrever', 'rewrite', 'fonte', 'font', 'copy', 'título', 'title'];
    const layoutKeywords = ['layout', 'posição', 'position', 'reorganiz', 'reorganize', 'espaçamento', 'spacing', 'align', 'alinhar'];
    const imageKeywords = ['imagem', 'image', 'foto', 'photo', 'picture', 'substituir imagem', 'replace image'];

    const hasColorKeywords = colorKeywords.some(kw => lowerPrompt.includes(kw));
    const hasTextKeywords = textKeywords.some(kw => lowerPrompt.includes(kw));
    const hasLayoutKeywords = layoutKeywords.some(kw => lowerPrompt.includes(kw));
    const hasImageKeywords = imageKeywords.some(kw => lowerPrompt.includes(kw));

    // Retorna estratégia específica se detectar palavras-chave
    if (hasColorKeywords && !hasTextKeywords && !hasLayoutKeywords) {
      console.log('🎨 Detected COLOR modification strategy');
      return EXTRACTION_STRATEGIES.color;
    }

    if (hasTextKeywords && !hasColorKeywords && !hasLayoutKeywords) {
      console.log('📝 Detected TEXT modification strategy');
      return EXTRACTION_STRATEGIES.text;
    }

    if (hasLayoutKeywords) {
      console.log('📐 Detected LAYOUT modification strategy');
      return EXTRACTION_STRATEGIES.layout;
    }

    if (hasImageKeywords) {
      console.log('🖼️ Detected IMAGE modification strategy');
      return EXTRACTION_STRATEGIES.image;
    }

    // Default: extrai tudo
    console.log('🌐 Using FULL extraction strategy (no specific keywords detected)');
    return EXTRACTION_STRATEGIES.full;
  }

  /**
   * 🆕 Analisa estrutura com estratégia de extração otimizada
   */
  static analyzeStructureOptimized(
    frame: FrameNode,
    strategy: ExtractionStrategy = EXTRACTION_STRATEGIES.full
  ): any {
    console.log(`🔍 Analyzing with strategy:`, {
      colors: strategy.includeColors,
      text: strategy.includeText,
      layout: strategy.includeLayout,
      images: strategy.includeImages,
      hierarchy: strategy.includeHierarchy
    });

    const elementGroups: ElementGroups = {
      textElements: [],
      imageElements: [],
      shapeElements: [],
      containerElements: [],
      buttonElements: [],
      iconElements: []
    };

    function extractElementData(node: SceneNode, depth = 0): any {
      // Base mínima sempre incluída (id, name, type)
      const baseInfo = {
        id: node.id,
        name: node.name,
        type: node.type
      };

      let specificData: any = {};

      // Extrair dados específicos baseado na estratégia
      if (node.type === 'TEXT' && strategy.includeText) {
        const textNode = node as TextNode;
        specificData = ElementAnalyzer.extractTextData(textNode);
        elementGroups.textElements.push({ ...baseInfo, ...specificData });

      } else if ((node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'POLYGON') && strategy.includeColors) {
        const shapeNode = node as any;
        specificData = ElementAnalyzer.extractColorData(shapeNode);

        if (node.type === 'RECTANGLE' && 'cornerRadius' in shapeNode) {
          specificData.cornerRadius = shapeNode.cornerRadius;
        }

        const category = ElementAnalyzer.extractBaseData(node, depth).category;
        if (category === 'button') {
          elementGroups.buttonElements.push({ ...baseInfo, ...specificData });
        } else if (category === 'icon') {
          elementGroups.iconElements.push({ ...baseInfo, ...specificData });
        } else {
          elementGroups.shapeElements.push({ ...baseInfo, ...specificData });
        }

      } else if ((node.type === 'FRAME' || node.type === 'GROUP') && strategy.includeLayout) {
        const containerNode = node as any;
        specificData = ElementAnalyzer.extractLayoutData(containerNode);
        elementGroups.containerElements.push({ ...baseInfo, ...specificData });
      }

      // Layout info (posição, dimensões) - apenas se a estratégia incluir
      if (strategy.includeLayout) {
        specificData.position = { x: node.x, y: node.y };
        specificData.dimensions = { width: node.width, height: node.height };
      }

      // Processar filhos apenas se estratégia incluir hierarquia
      let children: any[] = [];
      if (strategy.includeHierarchy && 'children' in node && node.children) {
        children = node.children.map(child => extractElementData(child, depth + 1));
      }

      return {
        ...baseInfo,
        ...specificData,
        childrenCount: 'children' in node ? node.children.length : 0,
        ...(strategy.includeHierarchy && children.length > 0 ? { children } : {})
      };
    }

    const frameData = extractElementData(frame);

    // Estatísticas básicas
    const stats: DesignStats = {
      totalElements: StructureAnalyzer.countElements(frame),
      textElements: elementGroups.textElements.length,
      imageElements: elementGroups.imageElements.length,
      shapeElements: elementGroups.shapeElements.length,
      containerElements: elementGroups.containerElements.length,
      buttonElements: elementGroups.buttonElements.length,
      iconElements: elementGroups.iconElements.length,
      maxDepth: strategy.includeHierarchy ? StructureAnalyzer.calculateMaxDepth(frame) : 0,
      layoutType: strategy.includeLayout ? StructureAnalyzer.detectLayoutType(frame) : 'unknown',
      colorPalette: strategy.includeColors ? ColorUtils.extractColorPalette(frame) : []
    };

    return {
      designInfo: {
        frameId: frame.id,
        frameName: frame.name,
        dimensions: {
          width: frame.width,
          height: frame.height
        },
        timestamp: new Date().toISOString(),
        extractionStrategy: {
          colors: strategy.includeColors,
          text: strategy.includeText,
          layout: strategy.includeLayout,
          images: strategy.includeImages,
          hierarchy: strategy.includeHierarchy
        }
      },
      hierarchy: frameData,
      elementsByCategory: elementGroups,
      statistics: stats
    };
  }

  // Analisa a estrutura do frame de forma organizada para IA
  // ⚠️ Mantido para compatibilidade retroativa - usa estratégia 'full'
  static analyzeStructure(frame: FrameNode): any {
    return this.analyzeStructureOptimized(frame, EXTRACTION_STRATEGIES.full);
    // Contadores para organização
    const elementGroups: ElementGroups = {
      textElements: [],
      imageElements: [],
      shapeElements: [],
      containerElements: [],
      buttonElements: [],
      iconElements: []
    };
    
    function extractElementData(node: SceneNode, depth = 0): any {
      const baseInfo = ElementAnalyzer.extractBaseData(node, depth);
      let specificData: any = {};
      
      // Dados específicos por tipo
      if (node.type === 'TEXT') {
        const textNode = node as TextNode;
        specificData = ElementAnalyzer.extractTextData(textNode);
        elementGroups.textElements.push({ ...baseInfo, ...specificData });
        
      } else if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'POLYGON') {
        const shapeNode = node as any;
        specificData = ElementAnalyzer.extractColorData(shapeNode);
        
        // Raio de bordas para retângulos
        if (node.type === 'RECTANGLE' && 'cornerRadius' in shapeNode) {
          specificData.cornerRadius = shapeNode.cornerRadius;
        }
        
        // Adiciona ao grupo apropriado
        if (baseInfo.category === 'button') {
          elementGroups.buttonElements.push({ ...baseInfo, ...specificData });
        } else if (baseInfo.category === 'icon') {
          elementGroups.iconElements.push({ ...baseInfo, ...specificData });
        } else {
          elementGroups.shapeElements.push({ ...baseInfo, ...specificData });
        }
        
      } else if (node.type === 'FRAME' || node.type === 'GROUP') {
        const containerNode = node as any;
        specificData = ElementAnalyzer.extractLayoutData(containerNode);
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
    const stats: DesignStats = {
      totalElements: StructureAnalyzer.countElements(frame),
      textElements: elementGroups.textElements.length,
      imageElements: elementGroups.imageElements.length,
      shapeElements: elementGroups.shapeElements.length,
      containerElements: elementGroups.containerElements.length,
      buttonElements: elementGroups.buttonElements.length,
      iconElements: elementGroups.iconElements.length,
      maxDepth: StructureAnalyzer.calculateMaxDepth(frame),
      layoutType: StructureAnalyzer.detectLayoutType(frame),
      colorPalette: ColorUtils.extractColorPalette(frame)
    };
    
    // Detecta padrões e acessibilidade
    const designPatterns = StructureAnalyzer.detectDesignPatterns(elementGroups);
    const accessibility = StructureAnalyzer.analyzeAccessibility(elementGroups);
    
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
      designPatterns,
      accessibility
    };
  }

  // Gera JSON estruturado e otimizado para IA
  static generateAIOptimizedJSON(frame: FrameNode): AIOptimizedData {
    const structureData = this.analyzeStructure(frame);
    
    // JSON otimizado e limpo para IA
    return {
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
        texts: structureData.elementsByCategory.textElements.map((el: any) => ({
          id: el.id,
          name: el.name,
          content: el.content,
          fontSize: el.fontSize,
          fontFamily: el.fontFamily,
          position: el.position,
          dimensions: el.dimensions
        })),
        
        buttons: structureData.elementsByCategory.buttonElements.map((el: any) => ({
          id: el.id,
          name: el.name,
          position: el.position,
          dimensions: el.dimensions,
          style: {
            fills: el.fills,
            cornerRadius: el.cornerRadius
          }
        })),
        
        containers: structureData.elementsByCategory.containerElements.map((el: any) => ({
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
  }
}
