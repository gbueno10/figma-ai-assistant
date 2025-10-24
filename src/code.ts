
/// <reference types="@figma/plugin-typings" />

// Importações dos módulos
import { AIDesignAssistant } from './aiDesignAssistant';
import { DesignModificationHandler } from './handlers/designModificationHandler';
import { DEFAULT_BACKEND_BASE_URL } from './config';
import { setBackendBaseUrl } from './services/backendClient';

// Plugin principal do AI Design Assistant
figma.showUI(__html__, { width: 400, height: 500 });
  



const API_KEY_STORAGE_KEY = 'figma-ai-assistant-api-key';
const BACKEND_URL_STORAGE_KEY = 'figma-ai-assistant-backend-url';

// Inicializa a URL do backend a partir do storage (ou usa o padrão)
(async () => {
  try {
    const storedUrl = await figma.clientStorage.getAsync(BACKEND_URL_STORAGE_KEY);
    if (storedUrl && typeof storedUrl === 'string') {
      const normalized = setBackendBaseUrl(storedUrl);
      console.log(`🔧 Backend URL carregada do storage: ${normalized}`);
    } else {
      setBackendBaseUrl(DEFAULT_BACKEND_BASE_URL);
      console.log(`ℹ️ Usando backend URL padrão: ${DEFAULT_BACKEND_BASE_URL}`);
    }
  } catch (error) {
    console.log('⚠️ Falha ao carregar backend URL do storage:', error);
    setBackendBaseUrl(DEFAULT_BACKEND_BASE_URL);
  }
})();

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
      await DesignModificationHandler.handleDesignModification(msg.prompt, msg.types, msg.apiKey);
    
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
      
      // Analisa os elementos selecionados (usando todos os tipos para debug)
      const designAnalysis = await DesignModificationHandler.analyzeDesignForModification(selection, ['text', 'color', 'layout', 'style']);
      
      // Retorna os dados de análise para a UI
      figma.ui.postMessage({
        type: 'design-analysis-complete',
        analysisData: designAnalysis
      });
      
      figma.notify('📊 Design analysis completed! Check the JSON output.', { timeout: 3000 });
      
    } else if (msg.type === 'load-settings') {
      try {
        const apiKey = (await figma.clientStorage.getAsync(API_KEY_STORAGE_KEY)) || '';
        const storedBackendUrl =
          (await figma.clientStorage.getAsync(BACKEND_URL_STORAGE_KEY)) || DEFAULT_BACKEND_BASE_URL;
        const normalizedUrl = setBackendBaseUrl(storedBackendUrl);

        figma.ui.postMessage({
          type: 'settings-loaded',
          apiKey,
          backendUrl: normalizedUrl
        });
        
        console.log('✅ Settings loaded from storage');
      } catch (error) {
        console.log('❌ Error loading settings:', error);
      }
    
    } else if (msg.type === 'save-settings') {
      try {
        await figma.clientStorage.setAsync(API_KEY_STORAGE_KEY, msg.apiKey || '');
        
        const normalizedUrl = setBackendBaseUrl(msg.backendUrl);
        await figma.clientStorage.setAsync(BACKEND_URL_STORAGE_KEY, normalizedUrl);
        console.log(`✅ Backend URL saved: ${normalizedUrl}`);

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
      
    } else if (msg.type === 'edit-frame-images') {
      console.log('🖼️ Starting frame image editing...');
      await handleFrameImageEditing(msg);
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
      
      // Passo 1: Disparar todas as requisições para a API em paralelo (isto está correto!)
      figma.ui.postMessage({
        type: 'image-progress',
        message: `Gerando ${imageNodes.length} imagem(ns) em paralelo...`,
        step: 1,
        totalSteps: 2 + imageNodes.length // Total de passos agora é dinâmico
      });

      const regenerationPromises = imageNodes.map(async (node, index) => {
        try {
          console.log(`🔄 [PARALLEL] Starting regeneration ${index + 1}/${imageNodes.length}: ${node.name}`);
          
          // Extrai a imagem atual
          const imageFill = (node as any).fills.find((fill: any) => fill.type === 'IMAGE');
          if (!imageFill) {
            throw new Error('No image fill found');
          }
          
          const image = figma.getImageByHash(imageFill.imageHash);
          if (!image) {
            throw new Error('Image hash not found');
          }
          
          const imageBytes = await image.getBytesAsync();
          
          let newImageBytes: Uint8Array;
          
          if (msg.prompt && msg.prompt.trim()) {
            // Usa prompt customizado
            newImageBytes = await ImageGenerationService.generateImageAsBase64(msg.prompt, msg.apiKey, msg.size);
            console.log(`✅ [PARALLEL] Custom prompt generated for ${node.name}`);
          } else {
            // Regenera baseado na análise da imagem atual
            newImageBytes = await ImageGenerationService.regenerateImage(imageBytes, msg.apiKey);
            console.log(`✅ [PARALLEL] Auto-regenerated ${node.name}`);
          }
          
          return newImageBytes;
          
        } catch (error) {
          console.log(`❌ [PARALLEL] Error generating image for ${node.name}:`, error);
          throw error;
        }
      });
      
      const results = await Promise.allSettled(regenerationPromises);

      // Passo 2: Aplicar as imagens de volta no Figma de forma SEQUENCIAL
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const node = imageNodes[i];

          // Feedback de progresso mais detalhado para o usuário
          figma.ui.postMessage({
              type: 'image-progress',
              message: `Aplicando imagem ${i + 1} de ${imageNodes.length}...`,
              step: 2 + i,
              totalSteps: 2 + imageNodes.length
          });

          if (result.status === 'fulfilled') {
              try {
                  await ImageGenerationService.replaceImageInFigma(node, result.value);
                  successCount++;
                  console.log(`✅ [APPLY] Imagem aplicada com sucesso a ${node.name}`);
              } catch (applyError) {
                  errorCount++;
                  console.log(`❌ [APPLY] Erro ao aplicar imagem a ${node.name}:`, applyError);
              }
          } else {
              errorCount++;
              console.log(`❌ [GENERATE] Erro ao gerar imagem para ${node.name}:`, result.reason);
              figma.notify(`Falha ao gerar imagem para ${node.name}`, { error: true });
          }

          // **A MUDANÇA MAIS IMPORTANTE!**
          // Pausa de 50ms para permitir que a UI do Figma "respire"
          await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const message = errorCount > 0 
        ? `Regeneradas ${successCount}/${imageNodes.length} imagens (${errorCount} falhas)`
        : `Todas as ${successCount} imagens foram regeneradas com sucesso!`;
      
      figma.ui.postMessage({
        type: 'image-complete',
        message: message
      });
      
      figma.notify(`✅ ${message}`, { timeout: 3000 });
      console.log(`🎉 [PARALLEL] Regeneração completa: ${successCount} sucessos, ${errorCount} erros`);
      
    } else {
      // Geração de nova imagem (a lógica existente para uma imagem está boa)
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

// Handler para edição em lote de imagens dentro de um frame
async function handleFrameImageEditing(msg: any) {
  try {
    const { ImageGenerationService } = await import('./services/imageGenerationService');
    
    // Verifica se há um frame selecionado
    const selection = figma.currentPage.selection;
    if (selection.length !== 1) {
      figma.ui.postMessage({
        type: 'error',
        message: 'Please select exactly one frame for image editing',
        context: 'image-edit'
      });
      return;
    }
    
    const selectedNode = selection[0];
    if (selectedNode.type !== 'FRAME') {
      figma.ui.postMessage({
        type: 'error',
        message: 'Please select a Frame (not a group or other element)',
        context: 'image-edit'
      });
      return;
    }
    
    // Função recursiva para encontrar todos os nós com imagens
    function findImageNodes(node: SceneNode): SceneNode[] {
      const imageNodes: SceneNode[] = [];
      
      // Verifica se o nó atual tem uma imagem
      if ('fills' in node && node.fills && Array.isArray(node.fills)) {
        const hasImage = node.fills.some(fill => fill.type === 'IMAGE');
        if (hasImage) {
          imageNodes.push(node);
        }
      }
      
      // Busca recursivamente nos filhos
      if ('children' in node) {
        for (const child of node.children) {
          imageNodes.push(...findImageNodes(child));
        }
      }
      
      return imageNodes;
    }
    
    const imageNodes = findImageNodes(selectedNode);
    
    if (imageNodes.length === 0) {
      figma.ui.postMessage({
        type: 'error',
        message: 'No images found within the selected frame',
        context: 'image-edit'
      });
      return;
    }
    
    console.log(`🖼️ Found ${imageNodes.length} image(s) in frame: ${selectedNode.name}`);
    
    figma.ui.postMessage({
      type: 'image-edit-progress',
      message: `Found ${imageNodes.length} image(s) in frame. Starting editing...`,
      step: 1,
      totalSteps: 3
    });
    
    // PROCESSAMENTO EM PARALELO - Edição de todas as imagens simultaneamente
    const editingPromises = imageNodes.map(async (node, index) => {
      try {
        console.log(`🖼️ [PARALLEL] Starting editing ${index + 1}/${imageNodes.length}: ${node.name}`);
        
        // Extrai a imagem atual
        const imageFill = (node as any).fills.find((fill: any) => fill.type === 'IMAGE');
        if (!imageFill) {
          console.log(`⚠️ [PARALLEL] No image fill found for ${node.name}`);
          return { success: false, node, error: 'No image fill found' };
        }
        
        const image = figma.getImageByHash(imageFill.imageHash);
        if (!image) {
          console.log(`⚠️ [PARALLEL] Image hash not found for ${node.name}`);
          return { success: false, node, error: 'Image hash not found' };
        }
        
        const imageBytes = await image.getBytesAsync();
        
        // Edita a imagem usando o prompt fornecido
        const editedImageBytes = await ImageGenerationService.editImage(imageBytes, msg.prompt, msg.apiKey);
        console.log(`✅ [PARALLEL] Successfully edited ${node.name}`);
        
        return { success: true, node, editedImageBytes, error: null };
        
      } catch (error) {
        console.log(`❌ [PARALLEL] Error editing image for ${node.name}:`, error);
        return { success: false, node, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });
    
    figma.ui.postMessage({
      type: 'image-edit-progress',
      message: `Editing ${imageNodes.length} images in parallel...`,
      step: 2,
      totalSteps: 3
    });
    
    // Aguarda todas as edições terminarem
    const results = await Promise.all(editingPromises);
    
    figma.ui.postMessage({
      type: 'image-edit-progress',
      message: `Applying edited images to Figma...`,
      step: 3,
      totalSteps: 3
    });
    
    // Aplica as imagens editadas sequencialmente (interação com Figma deve ser sequencial)
    let successCount = 0;
    let errorCount = 0;
    
    for (const result of results) {
      if (result.success && result.editedImageBytes) {
        try {
          await ImageGenerationService.replaceImageInFigma(result.node, result.editedImageBytes);
          successCount++;
          console.log(`✅ [APPLY] Successfully applied edited image to ${result.node.name}`);
        } catch (error) {
          console.log(`❌ [APPLY] Error applying edited image to ${result.node.name}:`, error);
          figma.notify(`⚠️ Failed to apply ${result.node.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, { timeout: 3000 });
          errorCount++;
        }
      } else {
        console.log(`❌ [RESULT] Failed result for ${result.node.name}: ${result.error}`);
        figma.notify(`⚠️ Failed to edit ${result.node.name}: ${result.error}`, { timeout: 3000 });
        errorCount++;
      }
    }
    
    const message = errorCount > 0 
      ? `Edited ${successCount}/${imageNodes.length} image(s) (${errorCount} failed)`
      : `Successfully edited all ${successCount} image(s)!`;
    
    figma.ui.postMessage({
      type: 'image-edit-complete',
      message: message
    });
    
    figma.notify(`✅ ${message}`, { timeout: 3000 });
    console.log(`🎉 [PARALLEL] Image editing complete: ${successCount} success, ${errorCount} errors`);
    
  } catch (error) {
    console.log('❌ Frame image editing error:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error during frame image editing',
      context: 'image-edit'
    });
    figma.notify(`❌ Frame image editing failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { timeout: 5000 });
  }
}
