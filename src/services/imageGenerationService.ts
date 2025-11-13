import { postToBackend } from './backendClient';

interface GenerateImageResponse {
  base64: string;
}

interface RegenerateImageResponse {
  base64: string;
  promptUsed: string;
}

interface AnalyzeImageResponse {
  prompt: string;
}

interface EditImageResponse {
  base64: string;
}

interface EditImageMetadata {
  totalImages?: number;
  imageIndex?: number;
  nodeName?: string;
}

export class ImageGenerationService {
  private static readonly base64Chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  private static base64ToUint8Array(base64: string): Uint8Array {
    if (!base64) {
      throw new Error('Base64 string is empty.');
    }

    if (typeof figma.base64Decode === 'function') {
      return figma.base64Decode(base64);
    }

    const cleanBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');
    const outputLength = Math.floor((cleanBase64.length * 3) / 4);
    const bytes = new Uint8Array(outputLength);
    let byteIndex = 0;

    for (let i = 0; i < cleanBase64.length; i += 4) {
      const enc1 = this.base64Chars.indexOf(cleanBase64[i]);
      const enc2 = this.base64Chars.indexOf(cleanBase64[i + 1]);
      const enc3 = this.base64Chars.indexOf(cleanBase64[i + 2]);
      const enc4 = this.base64Chars.indexOf(cleanBase64[i + 3]);

      const chr1 = (enc1 << 2) | (enc2 >> 4);
      bytes[byteIndex++] = chr1 & 255;

      if (enc3 !== 64 && cleanBase64[i + 2] !== '=') {
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        bytes[byteIndex++] = chr2 & 255;
      }

      if (enc4 !== 64 && cleanBase64[i + 3] !== '=') {
        const chr3 = ((enc3 & 3) << 6) | enc4;
        bytes[byteIndex++] = chr3 & 255;
      }
    }

    return bytes.slice(0, byteIndex);
  }

  private static uint8ArrayToBase64(uint8Array: Uint8Array): string {
    if (typeof figma.base64Encode === 'function') {
      return figma.base64Encode(uint8Array);
    }

    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }

    let base64 = '';
    let i = 0;

    while (i < binaryString.length) {
      const byte1 = binaryString.charCodeAt(i++);
      const byte2 = binaryString.charCodeAt(i++);
      const byte3 = binaryString.charCodeAt(i++);

      const enc1 = byte1 >> 2;
      const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
      const enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
      const enc4 = byte3 & 63;

      if (isNaN(byte2)) {
        base64 += ImageGenerationService.base64Chars.charAt(enc1);
        base64 += ImageGenerationService.base64Chars.charAt(enc2);
        base64 += '==';
      } else if (isNaN(byte3)) {
        base64 += ImageGenerationService.base64Chars.charAt(enc1);
        base64 += ImageGenerationService.base64Chars.charAt(enc2);
        base64 += ImageGenerationService.base64Chars.charAt(enc3);
        base64 += '=';
      } else {
        base64 += ImageGenerationService.base64Chars.charAt(enc1);
        base64 += ImageGenerationService.base64Chars.charAt(enc2);
        base64 += ImageGenerationService.base64Chars.charAt(enc3);
        base64 += ImageGenerationService.base64Chars.charAt(enc4);
      }
    }

    return base64;
  }

  static async analyzeImageForRegeneration(imageBytes: Uint8Array, apiKey?: string): Promise<string> {
    console.log('🔍 Forwarding image analysis to backend...');
    const base64 = this.uint8ArrayToBase64(imageBytes);
    const response = await postToBackend<AnalyzeImageResponse>('/images/analyze', {
      imageBase64: base64,
      apiKey,
    });
    console.log('✅ Backend returned regeneration prompt');
    return response.prompt;
  }

  static async generateImageAsBase64(
    prompt: string,
    apiKey?: string,
    size = '1024x1024',
    transparent = false
  ): Promise<Uint8Array> {
    console.log('🎨 Requesting image generation from backend...');
    const response = await postToBackend<GenerateImageResponse>('/images/generate', {
      prompt,
      size,
      transparent,
      apiKey,
    });
    console.log('✅ Backend returned generated image');
    return this.base64ToUint8Array(response.base64);
  }

  static async generateImageBase64Only(
    prompt: string,
    apiKey?: string,
    size = '1024x1024',
    transparent = false
  ): Promise<Uint8Array> {
    return this.generateImageAsBase64(prompt, apiKey, size, transparent);
  }

  static async generateImageWithFallback(
    prompt: string,
    apiKey?: string,
    size = '1024x1024',
    transparent = false
  ): Promise<Uint8Array> {
    return this.generateImageAsBase64(prompt, apiKey, size, transparent);
  }

  static async regenerateImage(
    imageBytes: Uint8Array,
    apiKey?: string,
    customPrompt?: string,
    size = '1024x1024'
  ): Promise<Uint8Array> {
    console.log('🔄 Requesting image regeneration from backend...');
    const base64 = this.uint8ArrayToBase64(imageBytes);
    const response = await postToBackend<RegenerateImageResponse>('/images/regenerate', {
      imageBase64: base64,
      prompt: customPrompt,
      size,
      apiKey,
    });
    console.log('✅ Backend returned regenerated image');
    return this.base64ToUint8Array(response.base64);
  }

  static async generateImage(
    prompt: string,
    apiKey?: string,
    size = '1024x1024',
    transparent = false
  ): Promise<string> {
    const bytes = await this.generateImageAsBase64(prompt, apiKey, size, transparent);
    return `data:image/png;base64,${this.uint8ArrayToBase64(bytes)}`;
  }

  static async editImage(
    imageBytes: Uint8Array,
    prompt: string,
    apiKey?: string,
    size = '1024x1024',
    metadata?: EditImageMetadata
  ): Promise<Uint8Array> {
    console.log('🖌️ Forwarding image edit request to backend...');
    const base64 = this.uint8ArrayToBase64(imageBytes);
    const response = await postToBackend<EditImageResponse>('/images/edit', {
      imageBase64: base64,
      prompt,
      size,
      apiKey,
      totalImages: metadata?.totalImages,
      imageIndex: metadata?.imageIndex,
      nodeName: metadata?.nodeName,
    });
    console.log('✅ Backend returned edited image');
    return this.base64ToUint8Array(response.base64);
  }

  static async createImageInFigma(
    imageBytes: Uint8Array,
    x = 0,
    y = 0,
    name = 'AI Generated Image',
    targetFrame: FrameNode | null = null
  ): Promise<void> {
    console.log(`🎨 [FIGMA-CREATE] Creating image in Figma at position (${x}, ${y})`);

    try {
      const rect = figma.createRectangle();
      rect.name = name;
      rect.x = x;
      rect.y = y;
      rect.resize(512, 512);

      const image = figma.createImage(imageBytes);
      rect.fills = [
        {
          type: 'IMAGE',
          scaleMode: 'FILL',
          imageHash: image.hash,
        },
      ];

      // Se foi especificado um targetFrame, adicionar dentro dele
      if (targetFrame) {
        targetFrame.appendChild(rect);
        console.log(`✅ [FIGMA-CREATE] Image added inside frame: ${targetFrame.name}`);
      } else if (figma.currentPage.selection.length > 0) {
        const parent = figma.currentPage.selection[0].parent;
        if (parent && 'appendChild' in parent) {
          parent.appendChild(rect);
        } else {
          figma.currentPage.appendChild(rect);
        }
      } else {
        figma.currentPage.appendChild(rect);
      }

      figma.currentPage.selection = [rect];
      figma.viewport.scrollAndZoomIntoView([rect]);

      console.log(`✅ [FIGMA-CREATE] Image created successfully: ${rect.id}`);
    } catch (error) {
      console.log(`❌ [FIGMA-CREATE] Creation error:`, error);
      throw new Error(
        `Failed to create image in Figma: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  static async replaceImageInFigma(targetNode: SceneNode, imageBytes: Uint8Array): Promise<void> {
    console.log(`🔄 [FIGMA-REPLACE] Replacing image in node: ${targetNode.name} (${targetNode.id})`);

    try {
      if (!('fills' in targetNode)) {
        throw new Error('The selected element does not support images');
      }

      const image = figma.createImage(imageBytes);
      (targetNode as any).fills = [
        {
          type: 'IMAGE',
          scaleMode: 'FILL',
          imageHash: image.hash,
        },
      ];

      figma.currentPage.selection = [targetNode];
      figma.viewport.scrollAndZoomIntoView([targetNode]);

      console.log(`✅ [FIGMA-REPLACE] Image replaced successfully in: ${targetNode.id}`);
    } catch (error) {
      console.log(`❌ [FIGMA-REPLACE] Replace error:`, error);
      throw new Error(
        `Falha ao substituir imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }
}
