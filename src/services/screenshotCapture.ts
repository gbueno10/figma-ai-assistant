// Classe para captura de screenshots do Figma

export class ScreenshotCapture {
  
  // Captura screenshot do frame selecionado
  static async captureFrame(frame: FrameNode): Promise<string> {
    try {
      // Captura screenshot em formato base64
      const screenshot = await frame.exportAsync({
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

  // Valida se o frame é adequado para captura
  static validateFrame(frame: SceneNode): void {
    if (frame.type !== "FRAME") {
      throw new Error("Por favor, selecione um frame!");
    }
  }
}
