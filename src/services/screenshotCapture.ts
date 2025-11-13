// Class for capturing screenshots from Figma

export class ScreenshotCapture {
  
  // Capture screenshot of the selected frame
  static async captureFrame(frame: FrameNode): Promise<string> {
    try {
      // Capture screenshot in base64 format
      const screenshot = await frame.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 1 }
      });
      
      // Convert to base64 string
      const base64 = figma.base64Encode(screenshot);
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      throw new Error(`Error capturing screenshot: ${error}`);
    }
  }

  // Validate if the frame is suitable for capture
  static validateFrame(frame: SceneNode): void {
    if (frame.type !== "FRAME") {
      throw new Error("Please select a frame!");
    }
  }
}
