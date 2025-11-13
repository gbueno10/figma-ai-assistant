// Classe principal do AI Design Assistant - versão modular

import { AISuggestion } from './types';
import { DesignAnalyzer } from './analyzers/designAnalyzer';
import { ScreenshotCapture } from './services/screenshotCapture';
import { AIService } from './services/aiService';
import { StructureAnalyzer } from './analyzers/structureAnalyzer';

export class AIDesignAssistant {
  
  // Capture screenshot of the selected frame
  async captureScreenshot(): Promise<string> {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      throw new Error("Please select a frame to capture!");
    }
    
    const frame = selection[0] as FrameNode;
    ScreenshotCapture.validateFrame(frame);
    
    return await ScreenshotCapture.captureFrame(frame);
  }
  
  // Analyze structure of the frame
  analyzeStructure(): any {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      throw new Error("Please select a frame to analyze!");
    }
    
    const frame = selection[0] as FrameNode;
    return DesignAnalyzer.analyzeStructure(frame);
  }
  
  // Count total elements
  countElements(node: SceneNode): number {
    return StructureAnalyzer.countElements(node);
  }
  
  // Count text elements
  countTextElements(node: SceneNode): number {
    return StructureAnalyzer.countTextElements(node);
  }
  
  // Generate structured JSON optimized for AI
  generateAIOptimizedJSON(): any {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      throw new Error("Please select a frame to analyze!");
    }
    
    const frame = selection[0] as FrameNode;
    return DesignAnalyzer.generateAIOptimizedJSON(frame);
  }
  
  // Send data to the AI
  async sendToAI(screenshot: string, structure: any, apiKey?: string): Promise<any> {
    return await AIService.sendToAI(screenshot, structure, apiKey);
  }
  
  // Apply a specific suggestion
  async applySuggestion(suggestion: AISuggestion): Promise<void> {
    figma.notify(`Applying suggestion: ${suggestion.reasoning}`, { timeout: 2000 });
  }
}
