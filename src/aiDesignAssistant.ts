// Classe principal do AI Design Assistant - versão modular

import { AISuggestion } from './types';
import { DesignAnalyzer } from './analyzers/designAnalyzer';
import { ScreenshotCapture } from './services/screenshotCapture';
import { AIService } from './services/aiService';
import { StructureAnalyzer } from './analyzers/structureAnalyzer';

export class AIDesignAssistant {
  
  // Captura screenshot do frame selecionado
  async captureScreenshot(): Promise<string> {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      throw new Error("Selecione um frame para capturar!");
    }
    
    const frame = selection[0] as FrameNode;
    ScreenshotCapture.validateFrame(frame);
    
    return await ScreenshotCapture.captureFrame(frame);
  }
  
  // Analisa a estrutura do frame
  analyzeStructure(): any {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      throw new Error("Selecione um frame para analisar!");
    }
    
    const frame = selection[0] as FrameNode;
    return DesignAnalyzer.analyzeStructure(frame);
  }
  
  // Conta elementos totais
  countElements(node: SceneNode): number {
    return StructureAnalyzer.countElements(node);
  }
  
  // Conta elementos de texto
  countTextElements(node: SceneNode): number {
    return StructureAnalyzer.countTextElements(node);
  }
  
  // Gera JSON estruturado e otimizado para IA
  generateAIOptimizedJSON(): any {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      throw new Error("Selecione um frame para analisar!");
    }
    
    const frame = selection[0] as FrameNode;
    return DesignAnalyzer.generateAIOptimizedJSON(frame);
  }
  
  // Envia dados para a IA
  async sendToAI(screenshot: string, structure: any, apiKey?: string): Promise<any> {
    return await AIService.sendToAI(screenshot, structure, apiKey);
  }
  
  // Aplica uma sugestão específica
  async applySuggestion(suggestion: AISuggestion): Promise<void> {
    figma.notify(`Aplicando sugestão: ${suggestion.reasoning}`, { timeout: 2000 });
  }
}
