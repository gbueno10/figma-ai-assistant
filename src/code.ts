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
    
    } else if (msg.type === 'check-image-selection') {
      console.log('🖼️ Checking image selection...');
      
      const selection = figma.currentPage.selection;
      const imageNodes = selection.filter(node => {
        if ('fills' in node && node.fills && Array.isArray(node.fills)) {
          return node.fills.some(fill => fill.type === 'IMAGE');
        }
        return false;
      });
      
      figma.ui.postMessage({
        type: 'image-selection-checked',
        hasImages: imageNodes.length > 0,
        count: imageNodes.length
      });
      
    } else if (msg.type === 'generate-image') {
      console.log('✨ Starting new image generation...');
      await handleImageGeneration(msg, false);
      
    } else if (msg.type === 'regenerate-images') {
      console.log('🔄 Starting image regeneration...');
      await handleImageGeneration(msg, true);
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

// Handler para geração e regeneração de imagens
async function handleImageGeneration(msg: any, isRegeneration: boolean) {
  try {
    const { ImageGenerationService } = await import('./services/imageGenerationService');
    
    if (isRegeneration) {
      // Regeneração de imagens selecionadas
      const selection = figma.currentPage.selection;
      const imageNodes = selection.filter(node => {
        if ('fills' in node && node.fills && Array.isArray(node.fills)) {
          return node.fills.some(fill => fill.type === 'IMAGE');
        }
        return false;
      });
      
      if (imageNodes.length === 0) {
        figma.ui.postMessage({
          type: 'error',
          message: 'No images selected for regeneration',
          context: 'image'
        });
        return;
      }
      
      figma.ui.postMessage({
        type: 'image-progress',
        message: `Starting regeneration of ${imageNodes.length} image(s)...`,
        step: 1,
        totalSteps: imageNodes.length + 1
      });
      
      for (let i = 0; i < imageNodes.length; i++) {
        const node = imageNodes[i];
        
        figma.ui.postMessage({
          type: 'image-progress',
          message: `Processing image ${i + 1}/${imageNodes.length}: ${node.name}`,
          step: i + 2,
          totalSteps: imageNodes.length + 1
        });
        
        try {
          // Extrai a imagem atual
          const imageFill = (node as any).fills.find((fill: any) => fill.type === 'IMAGE');
          if (!imageFill) continue;
          
          const image = figma.getImageByHash(imageFill.imageHash);
          if (!image) continue;
          
          const imageBytes = await image.getBytesAsync();
          
          let newImageBytes: Uint8Array;
          
          if (msg.prompt && msg.prompt.trim()) {
            // Usa prompt customizado
            newImageBytes = await ImageGenerationService.generateImageAsBase64(msg.prompt, msg.apiKey, msg.size);
          } else {
            // Regenera baseado na análise da imagem atual
            newImageBytes = await ImageGenerationService.regenerateImage(imageBytes, msg.apiKey);
          }
          
          // Substitui a imagem
          await ImageGenerationService.replaceImageInFigma(node, newImageBytes);
          
        } catch (error) {
          console.log(`❌ Error regenerating image ${node.name}:`, error);
          figma.notify(`⚠️ Failed to regenerate ${node.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, { timeout: 5000 });
        }
      }
      
      figma.ui.postMessage({
        type: 'image-complete',
        message: `Successfully regenerated ${imageNodes.length} image(s)!`
      });
      
      figma.notify(`✅ Regenerated ${imageNodes.length} image(s)!`, { timeout: 3000 });
      
    } else {
      // Geração de nova imagem
      figma.ui.postMessage({
        type: 'image-progress',
        message: 'Generating new image...',
        step: 1,
        totalSteps: 2
      });
      
      const imageBytes = await ImageGenerationService.generateImageAsBase64(msg.prompt, msg.apiKey, msg.size);
      
      figma.ui.postMessage({
        type: 'image-progress',
        message: 'Creating image in Figma...',
        step: 2,
        totalSteps: 2
      });
      
      // Posição para nova imagem
      const x = figma.viewport.center.x - 256;
      const y = figma.viewport.center.y - 256;
      
      await ImageGenerationService.createImageInFigma(imageBytes, x, y, `AI Generated: ${msg.prompt.slice(0, 30)}...`);
      
      figma.ui.postMessage({
        type: 'image-complete',
        message: 'New image created successfully!'
      });
      
      figma.notify('✅ New AI image created!', { timeout: 3000 });
    }
    
  } catch (error) {
    console.log('❌ Image generation error:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error during image generation',
      context: 'image'
    });
    figma.notify(`❌ Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { timeout: 5000 });
  }
}


