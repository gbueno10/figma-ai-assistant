/// <reference types="@figma/plugin-typings" />

// Importações dos módulos
import { AIDesignAssistant } from './aiDesignAssistant';
import { DesignModificationHandler } from './handlers/designModificationHandler';

// Plugin principal do AI Design Assistant
figma.showUI(__html__, { width: 400, height: 500 });
  



// Instância global do assistente
const aiAssistant = new AIDesignAssistant();

// Escuta mensagens da UI
figma.ui.onmessage = async (msg) => {
  console.log('Mensagem recebida da UI:', msg);
  
  try {
    if (msg.type === 'capture-and-analyze') {
      console.log('Iniciando análise...');
      
      // Verifica se há frame selecionado
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.notify('❌ Selecione um frame primeiro!', { timeout: 3000 });
        figma.ui.postMessage({
          type: 'error',
          message: 'Nenhum frame selecionado'
        });
        return;
      }
      
      if (selection[0].type !== 'FRAME') {
        figma.notify('❌ Por favor, selecione um frame (não grupo ou outro elemento)!', { timeout: 3000 });
        figma.ui.postMessage({
          type: 'error', 
          message: 'Elemento selecionado não é um frame'
        });
        return;
      }
      
      console.log('Frame válido encontrado:', selection[0].name);
      
      // Captura screenshot
      const screenshot = await aiAssistant.captureScreenshot();
      console.log('Screenshot capturado');
      
      // Gera JSON estruturado para IA (somente dados do Figma)
      const structuredData = aiAssistant.generateAIOptimizedJSON();
      console.log('JSON estruturado gerado (apenas dados do Figma)');
      
      // Retorna resultado para UI (sem contexto extra da IA)
      figma.ui.postMessage({
        type: 'analysis-complete',
        screenshot,
        structuredData
      });
      
      figma.notify('✅ Análise concluída! JSON estruturado gerado.', { timeout: 3000 });
      
    } else if (msg.type === 'apply-suggestion') {
      await aiAssistant.applySuggestion(msg.suggestion);
      
    } else if (msg.type === 'export-json') {
      // Gera e exporta JSON estruturado
      const structuredData = aiAssistant.generateAIOptimizedJSON();
      
      figma.ui.postMessage({
        type: 'json-exported',
        data: structuredData
      });
      
      figma.notify('📄 JSON estruturado gerado! Copiado para a área de transferência.', { timeout: 3000 });
      
    } else if (msg.type === 'cancel') {
      figma.closePlugin();
    } else if (msg.type === 'modify-design') {
      await DesignModificationHandler.handleDesignModification(msg);
    
    } else if (msg.type === 'analyze-design-only') {
      console.log('📊 Starting design analysis only...');
      
      // Verifica se há elementos selecionados
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.notify('❌ Select at least one element first!', { timeout: 3000 });
        figma.ui.postMessage({
          type: 'error',
          message: 'No elements selected'
        });
        return;
      }
      
      console.log('📊 Analyzing selected elements:', selection.length);
      
      // Importa o handler para usar o método de análise
      const { DesignModificationHandler } = await import('./handlers/designModificationHandler');
      
      // Analisa os elementos selecionados (mesmo processo usado antes de enviar para AI)
      const designAnalysis = await DesignModificationHandler.analyzeDesignForModification(selection);
      
      // Retorna os dados de análise para a UI
      figma.ui.postMessage({
        type: 'design-analysis-complete',
        analysisData: designAnalysis
      });
      
      figma.notify('📊 Design analysis completed! Check the JSON output.', { timeout: 3000 });
      
    } else if (msg.type === 'load-settings') {
      try {
        const apiKey = await figma.clientStorage.getAsync('figma-ai-assistant-api-key') || '';
        
        figma.ui.postMessage({
          type: 'settings-loaded',
          apiKey
        });
        
        console.log('✅ Settings loaded from storage');
      } catch (error) {
        console.log('❌ Error loading settings:', error);
      }
    
    } else if (msg.type === 'save-settings') {
      try {
        await figma.clientStorage.setAsync('figma-ai-assistant-api-key', msg.apiKey);
        console.log('✅ Settings saved to storage');
      } catch (error) {
        console.log('❌ Error saving settings:', error);
      }
    }
  } catch (error: any) {
    figma.notify(`❌ Erro: ${error.message}`, { timeout: 5000 });
    console.error('Plugin error:', error);
  }
};

// Inicialização automática
const selection = figma.currentPage.selection;
if (selection.length > 0 && selection[0].type === "FRAME") {
  const frame = selection[0];
  figma.ui.postMessage({
    type: 'frame-selected',
    frameName: frame.name,
    elementCount: aiAssistant.countElements(frame)
  });
}


