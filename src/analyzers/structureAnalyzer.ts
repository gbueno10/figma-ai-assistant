// Classe para análise estrutural do design

import { ElementGroups, DesignStats } from '../types';
import { ElementAnalyzer } from '../utils/elementAnalyzer';
import { ColorUtils } from '../utils/colorUtils';

export class StructureAnalyzer {
  
  // Conta elementos totais
  static countElements(node: SceneNode): number {
    let count = 1;
    if ('children' in node && node.children) {
      count += node.children.reduce((sum, child) => sum + this.countElements(child), 0);
    }
    return count;
  }
  
  // Conta elementos de texto
  static countTextElements(node: SceneNode): number {
    let count = node.type === 'TEXT' ? 1 : 0;
    if ('children' in node && node.children) {
      count += node.children.reduce((sum, child) => sum + this.countTextElements(child), 0);
    }
    return count;
  }
  
  // Detecta tipo de layout
  static detectLayoutType(frame: FrameNode): string {
    if (frame.layoutMode === 'HORIZONTAL') return 'horizontal';
    if (frame.layoutMode === 'VERTICAL') return 'vertical';
    return 'absolute';
  }
  
  // Calcula a profundidade máxima da árvore de elementos
  static calculateMaxDepth(node: SceneNode, currentDepth = 0): number {
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
  static detectDesignPatterns(elementGroups: ElementGroups): any {
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
  static analyzeAccessibility(elementGroups: ElementGroups): any {
    const accessibility = {
      textContrast: 'unknown',
      fontSizes: [] as number[],
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
}
