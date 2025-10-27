// Utilidades para análise de elementos do Figma

export class ElementAnalyzer {
  
  // Categoriza elemento
  static categorizeElement(node: SceneNode): string {
    const name = node.name.toLowerCase();
    
    if (node.type === 'TEXT') return 'text';
    if (node.type === 'FRAME' || node.type === 'GROUP') return 'container';
    if (name.includes('button') || name.includes('btn')) return 'button';
    if (name.includes('icon') || name.includes('ico')) return 'icon';
    if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'POLYGON') return 'shape';
    if (name.includes('image') || name.includes('img') || name.includes('photo')) return 'image';
    
    return 'shape'; // default
  }

  // Extrai dados específicos de texto
  static extractTextData(textNode: TextNode): any {
    return {
      content: textNode.characters,
      fontSize: textNode.fontSize,
      fontFamily: typeof textNode.fontName === 'object' ? textNode.fontName.family : 'Unknown',
      fontWeight: typeof textNode.fontName === 'object' ? textNode.fontName.style : 'Unknown',
      textAlign: {
        horizontal: textNode.textAlignHorizontal,
        vertical: textNode.textAlignVertical
      },
      textDecoration: textNode.textDecoration,
      letterSpacing: textNode.letterSpacing,
      lineHeight: textNode.lineHeight
    };
  }

  // Extrai dados de cores
  static extractColorData(node: any): any {
    const colorData: any = {};
    
    // Extrai cores de preenchimento
    if (node.fills && Array.isArray(node.fills)) {
      colorData.fills = node.fills.map((fill: any) => {
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
    if (node.strokes && Array.isArray(node.strokes)) {
      colorData.strokes = node.strokes.map((stroke: any) => {
        if (stroke.type === 'SOLID' && stroke.color) {
          const { r, g, b } = stroke.color;
          return {
            type: 'solid',
            color: `rgb(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)})`,
            weight: node.strokeWeight || 0
          };
        }
        return { type: stroke.type };
      });
    }
    
    return colorData;
  }

  // Extrai dados de layout
  static extractLayoutData(containerNode: any): any {
    const layoutData: any = {};
    
    if ('layoutMode' in containerNode) {
      layoutData.layout = {
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
    
    return layoutData;
  }

  // Extrai dados base do elemento
  static extractBaseData(node: SceneNode, depth = 0): any {
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      category: this.categorizeElement(node),
      position: { x: node.x, y: node.y },
      dimensions: { width: node.width, height: node.height },
      visible: node.visible,
      locked: node.locked || false,
      depth: depth
    };
  }
}
