// src/utils/frameIteratorUtils.ts

export class FrameIteratorUtils {
  // Fisher-Yates shuffle algorithm
  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Detect the main element (largest area or most central)
  static detectMainGroup(children: readonly SceneNode[]): SceneNode | null {
    if (children.length === 0) return null;

    // Strategy 1: Largest area
    const byArea = [...children].sort((a, b) => (b.width * b.height) - (a.width * a.height));

    // Strategy 2: Most central
    const frameCenter = {
      x: Math.min(...children.map(c => c.x)) + (Math.max(...children.map(c => c.x + c.width)) - Math.min(...children.map(c => c.x))) / 2,
      y: Math.min(...children.map(c => c.y)) + (Math.max(...children.map(c => c.y + c.height)) - Math.min(...children.map(c => c.y))) / 2
    };

    const byPosition = [...children].sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a.x + a.width/2 - frameCenter.x, 2) + Math.pow(a.y + a.height/2 - frameCenter.y, 2));
      const distB = Math.sqrt(Math.pow(b.x + b.width/2 - frameCenter.x, 2) + Math.pow(b.y + b.height/2 - frameCenter.y, 2));
      return distA - distB;
    });

    const topByArea = byArea[0];
    const topTwoCentral = byPosition.slice(0, 2);

    if (topTwoCentral.includes(topByArea)) {
      return topByArea;
    }

    return byPosition[0];
  }

  // Load necessary fonts for a node
  static async loadFontsForNode(node: SceneNode) {
    const fonts = new Set<string>();
    
    function collectFromNode(n: SceneNode) {
      if (n.type === "TEXT") {
        if (typeof n.fontName === 'object' && 'family' in n.fontName) {
          fonts.add(`${n.fontName.family}|${n.fontName.style}`);
        } else if (n.fontName === figma.mixed) {
          const len = n.characters.length;
          for (let i = 0; i < len; i++) {
            const charFont = n.getRangeFontName(i, i + 1) as FontName;
            fonts.add(`${charFont.family}|${charFont.style}`);
          }
        }
      }
      if ('children' in n) {
        n.children.forEach(child => collectFromNode(child));
      }
    }

    collectFromNode(node);

    const promises = Array.from(fonts).map(f => {
      const [family, style] = f.split('|');
      return figma.loadFontAsync({ family, style }).catch(err => console.warn('Font missing:', f));
    });

    await Promise.all(promises);
  }

  // Adjust text styles proportionally to resizing
  static async adjustTextStyles(element: SceneNode, originalSize: {width: number, height: number}, newSize: {width: number, height: number}) {
    const scaleX = newSize.width / originalSize.width;
    const scaleY = newSize.height / originalSize.height;
    const averageScale = (scaleX + scaleY) / 2;

    await this.loadFontsForNode(element);

    function adjustRecursive(node: SceneNode) {
      if (node.type === "TEXT") {
        const currentFontSize = node.fontSize as number;
        const newFontSize = Math.round(currentFontSize * averageScale);
        const clampedFontSize = Math.max(6, Math.min(800, newFontSize)); // Safety limits
        
        node.fontSize = clampedFontSize;

        // Fine-tune layout
        if (node.lineHeight && typeof node.lineHeight === 'object' && node.lineHeight.unit === 'PIXELS') {
          node.lineHeight = { unit: 'PIXELS', value: Math.round(node.lineHeight.value * averageScale) };
        }
        if (node.paragraphSpacing) node.paragraphSpacing = Math.round(node.paragraphSpacing * averageScale);
      }

      // Auto Layout adjustments
      if (node.type === "FRAME" || node.type === "GROUP") {
        if ('paddingTop' in node) {
           node.paddingTop = Math.round(node.paddingTop * averageScale);
           node.paddingBottom = Math.round(node.paddingBottom * averageScale);
           node.paddingLeft = Math.round(node.paddingLeft * averageScale);
           node.paddingRight = Math.round(node.paddingRight * averageScale);
           node.itemSpacing = Math.round(node.itemSpacing * averageScale);
        }
      }
      
      // Corner Radius adjustment (check if it's not mixed)
      if ('cornerRadius' in node && typeof node.cornerRadius === 'number' && node.type === 'RECTANGLE') {
        (node as RectangleNode).cornerRadius = Math.round(node.cornerRadius * averageScale);
      }

      if ('children' in node) {
        node.children.forEach(child => adjustRecursive(child));
      }
    }

    adjustRecursive(element);
  }

  // Increment version in frame name
  static incrementFrameVersion(frameName: string, iteration: number): string {
    const versionRegex = /(_v)(\d+)([a-z]?)/i;
    const match = frameName.match(versionRegex);
    
    if (match) {
      const currentVersion = parseInt(match[2]);
      const newVersion = currentVersion + iteration;
      const letter = match[3]; 
      return frameName.replace(versionRegex, `${match[1]}${newVersion}${letter}`);
    } else {
      return `${frameName}_v${iteration + 1}`;
    }
  }
}
