// Utilitários para manipulação de cores

export class ColorUtils {
  
  // Converte cor Figma para RGB string
  static figmaColorToRgb(color: RGB): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Parse string de cor para RGB Figma
  static parseColor(colorString: string): RGB | null {
    // Handle hex colors like #FF0000 or #F3E8FF
    if (colorString.includes('#')) {
      const hexMatch = colorString.match(/#([A-Fa-f0-9]{6})/);
      if (hexMatch) {
        const hex = hexMatch[1];
        return {
          r: parseInt(hex.slice(0, 2), 16) / 255,
          g: parseInt(hex.slice(2, 4), 16) / 255,
          b: parseInt(hex.slice(4, 6), 16) / 255
        };
      }
    }
    
    // Parse RGB decimal values like "rgb(0.9529, 0.9098, 1.0000)"
    const decimalMatch = colorString.match(/rgb\((\d*\.?\d+),\s*(\d*\.?\d+),\s*(\d*\.?\d+)\)/);
    if (decimalMatch) {
      const r = parseFloat(decimalMatch[1]);
      const g = parseFloat(decimalMatch[2]);
      const b = parseFloat(decimalMatch[3]);
      
      // If values are already between 0-1, use them directly
      if (r <= 1 && g <= 1 && b <= 1) {
        return { r, g, b };
      } else {
        // If values are 0-255, convert to 0-1
        return {
          r: r / 255,
          g: g / 255,
          b: b / 255
        };
      }
    }
    
    // Parse RGB integer values like "rgb(255, 255, 255)"
    const integerMatch = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (integerMatch) {
      return {
        r: parseInt(integerMatch[1]) / 255,
        g: parseInt(integerMatch[2]) / 255,
        b: parseInt(integerMatch[3]) / 255
      };
    }
    
    // Handle direct hex without # symbol
    if (/^[A-Fa-f0-9]{6}$/.test(colorString)) {
      return {
        r: parseInt(colorString.slice(0, 2), 16) / 255,
        g: parseInt(colorString.slice(2, 4), 16) / 255,
        b: parseInt(colorString.slice(4, 6), 16) / 255
      };
    }
    
    return null;
  }

  // Extrai paleta de cores de um nó
  static extractColorPalette(node: SceneNode): string[] {
    const colors = new Set<string>();
    
    function extractColors(n: SceneNode) {
      if ('fills' in n && n.fills) {
        const fills = n.fills as Paint[];
        fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            colors.add(ColorUtils.figmaColorToRgb(fill.color));
          }
        });
      }
      
      if ('children' in n && n.children) {
        n.children.forEach(extractColors);
      }
    }
    
    extractColors(node);
    return Array.from(colors);
  }
}
