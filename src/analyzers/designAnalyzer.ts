// Classe principal para análise de design do Figma

import { ElementGroups, DesignStats, AIOptimizedData } from '../types';
import { ElementAnalyzer } from '../utils/elementAnalyzer';
import { ColorUtils } from '../utils/colorUtils';
import { StructureAnalyzer } from './structureAnalyzer';

export class DesignAnalyzer {
  
  // Analisa a estrutura do frame de forma organizada para IA
  static analyzeStructure(frame: FrameNode): any {
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
