/// <reference types="@figma/plugin-typings" />

// Importações dos módulos
import { showUI } from '@create-figma-plugin/utilities';
import { AIDesignAssistant } from './aiDesignAssistant';
import { DesignModificationHandler } from './handlers/designModificationHandler';
import { DEFAULT_BACKEND_BASE_URL } from './config';
import { setBackendBaseUrl, getBackendBaseUrl } from './services/backendClient';
import { NamingUtils } from './utils/namingConvention';

const API_KEY_STORAGE_KEY = 'figma-ai-assistant-api-key';
const BACKEND_URL_STORAGE_KEY = 'figma-ai-assistant-backend-url';

let aiAssistant: AIDesignAssistant;

export default function runPlugin() {
  showUI({ width: 400, height: 500 });
  void initializeBackendUrl();
  aiAssistant = new AIDesignAssistant();
  initializeUiMessageHandler();
  bootstrapSelectionState();
}

function initializeUiMessageHandler() {
  figma.ui.onmessage = async (msg) => {
  console.log('Message received from UI:', msg);
  
  try {
    if (msg.type === 'capture-and-analyze') {
      console.log('Starting analysis...');
      
      // Verifica se há frame selecionado
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.notify('❌ Select a frame first!', { timeout: 3000 });
        figma.ui.postMessage({
          type: 'error',
          message: 'No frame selected'
        });
        return;
      }
      
      if (selection[0].type !== 'FRAME') {
        figma.notify('❌ Please, select a frame (not a group or other element)!', { timeout: 3000 });
        figma.ui.postMessage({
          type: 'error', 
          message: 'Selected element is not a frame'
        });
        return;
      }
      
      console.log('Valid frame found:', selection[0].name);
      
      // Captura screenshot
      const screenshot = await aiAssistant.captureScreenshot();
      console.log('Screenshot captured');
      
      // Gera JSON estruturado para IA (somente dados do Figma)
      const structuredData = aiAssistant.generateAIOptimizedJSON();
      console.log('Structured JSON generated (Figma data only)');
      
      // Retorna resultado para UI (sem contexto extra da IA)
      figma.ui.postMessage({
        type: 'analysis-complete',
        screenshot,
        structuredData
      });
      
      figma.notify('✅ Analysis complete! Structured JSON generated.', { timeout: 3000 });
      
    } else if (msg.type === 'apply-suggestion') {
      await aiAssistant.applySuggestion(msg.suggestion);
      
    } else if (msg.type === 'export-json') {
      // Gera e exporta JSON estruturado
      const structuredData = aiAssistant.generateAIOptimizedJSON();
      
      figma.ui.postMessage({
        type: 'json-exported',
        data: structuredData
      });
      
      figma.notify('📄 Structured JSON generated! Copied to clipboard.', { timeout: 3000 });
      
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
      
    } else if (msg.type === 'resize-frame-stretch') {
      console.log(`📏 Starting frame stretch to height: ${msg.newHeight}`);
      await handleFrameStretch(Number(msg.newHeight));
      
    } else if (msg.type === 'resize-frame-reflow') {
      console.log(`📏 Starting frame reflow to height: ${msg.newHeight}`);
      await handleFrameReflow(Number(msg.newHeight));
      
    } else if (msg.type === 'edit-frame-images') {
      console.log('🖼️ Starting frame image editing directly...');
      await executeFrameImageEditing(msg);
      
    } else if (msg.type === 'check-drive-tokens') {
      // Check if tokens exist in clientStorage
      const tokens = await figma.clientStorage.getAsync('google_drive_tokens');
      const folderId = await figma.clientStorage.getAsync('google_drive_folder_id');
      
      figma.ui.postMessage({
        type: 'drive-tokens-status',
        hasTokens: !!tokens,
        folderId: folderId || ''
      });
      
    } else if (msg.type === 'get-drive-auth-url') {
      // Fetch auth URL from backend
      const requestId = msg.requestId;
      const backendUrl = getBackendBaseUrl();
      
      try {
        const response = await fetch(`${backendUrl}/drive/auth-url?requestId=${requestId}`);
        const data = await response.json();
        
        if (data.authUrl) {
          figma.ui.postMessage({
            type: 'auth-url-ready',
            url: data.authUrl,
            requestId: requestId
          });
        } else {
          throw new Error('No auth URL received');
        }
      } catch (error) {
        console.error('Error getting auth URL:', error);
        figma.ui.postMessage({
          type: 'auth-status-error',
          message: error instanceof Error ? error.message : 'Failed to get auth URL'
        });
      }
      
    } else if (msg.type === 'check-drive-auth-status') {
      // Poll backend for auth status
      const requestId = msg.requestId;
      const backendUrl = getBackendBaseUrl();
      
      try {
        const response = await fetch(`${backendUrl}/drive/check-status?requestId=${requestId}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.tokens) {
          figma.ui.postMessage({
            type: 'auth-status-success',
            tokens: data.tokens
          });
        } else if (data.status === 'error') {
          figma.ui.postMessage({
            type: 'auth-status-error',
            message: data.error || 'Authentication failed'
          });
        }
        // If pending, UI will continue polling
      } catch (error) {
        console.error('Error checking auth status:', error);
        figma.ui.postMessage({
          type: 'auth-status-error',
          message: error instanceof Error ? error.message : 'Failed to check auth status'
        });
      }
      
    } else if (msg.type === 'save-drive-tokens') {
      // Save tokens to clientStorage
      await figma.clientStorage.setAsync('google_drive_tokens', msg.tokens);
      console.log('✅ Tokens saved to clientStorage');
      
    } else if (msg.type === 'save-drive-folder-id') {
      // Save folder ID to clientStorage
      await figma.clientStorage.setAsync('google_drive_folder_id', msg.folderId);
      console.log('✅ Folder ID saved to clientStorage');
      
    } else if (msg.type === 'clear-drive-tokens') {
      // Clear tokens and folder ID from clientStorage
      await figma.clientStorage.deleteAsync('google_drive_tokens');
      await figma.clientStorage.deleteAsync('google_drive_folder_id');
      console.log('✅ Drive tokens cleared');
      
    } else if (msg.type === 'export-to-drive') {
      console.log('☁️ Starting bulk export to Google Drive...');
      await handleExportToDrive(msg);
    }
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    figma.notify(`❌ Erro: ${errorMessage}`, { timeout: 5000 });
    console.error('Plugin error:', error);

    const context =
      msg.type === 'resize-frame-stretch' || msg.type === 'resize-frame-reflow'
        ? 'resize'
        : msg.type === 'generate-image' || msg.type === 'regenerate-images'
          ? 'image'
          : msg.type === 'edit-frame-images' || msg.type === 'confirm-edit-frame-images'
            ? 'image-edit'
            : 'general';

    figma.ui.postMessage({
      type: 'error',
      message: errorMessage,
      context,
    });
  }
};

}

function bootstrapSelectionState() {
  const selection = figma.currentPage.selection;
  if (selection.length > 0 && selection[0].type === 'FRAME') {
    const frame = selection[0];
    figma.ui.postMessage({
      type: 'frame-selected',
      frameName: frame.name,
      elementCount: aiAssistant.countElements(frame)
    });
  }
}

async function initializeBackendUrl() {
  try {
    const storedUrl = await figma.clientStorage.getAsync(BACKEND_URL_STORAGE_KEY);
    if (storedUrl && typeof storedUrl === 'string') {
      const normalized = setBackendBaseUrl(storedUrl);
      console.log(`🔧 Backend URL loaded from storage: ${normalized}`);
    } else {
      setBackendBaseUrl(DEFAULT_BACKEND_BASE_URL);
      console.log(`ℹ️ Using default backend URL: ${DEFAULT_BACKEND_BASE_URL}`);
    }
  } catch (error) {
    console.log('⚠️ Failed to load backend URL from storage:', error);
    setBackendBaseUrl(DEFAULT_BACKEND_BASE_URL);
  }
}

// Handler para geração e regeneração de imagens
async function handleImageGeneration(msg: any, isRegeneration: boolean) {
  try {
    const { ImageGenerationService } = await import('./services/imageGenerationService');
    const { NamingUtils } = await import('./utils/namingConvention');
    const { prepareNodesForRegeneration } = await import('./utils/figmaUtils');
    
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
      
      // Passo 0: Duplicar frames se necessário (antes de gerar imagens)
      // Usa a função utilitária dedicada para preparação de regeneração
      figma.ui.postMessage({
        type: 'image-progress',
        message: 'Duplicating frames and preparing nodes...',
        step: 0,
        totalSteps: 2 + imageNodes.length
      });
      
      const { nodesToRegenerate, duplicatedFrames } = prepareNodesForRegeneration(imageNodes);
      
      // Selecionar frames duplicados para feedback visual
      if (duplicatedFrames.length > 0) {
        figma.currentPage.selection = duplicatedFrames;
        figma.notify(`✅ ${duplicatedFrames.length} frame(s) duplicated with Dogo naming convention`, {
          timeout: 3000
        });
      }
      
      // Passo 1: Disparar todas as requisições para a API em paralelo
      figma.ui.postMessage({
        type: 'image-progress',
        message: `Generating ${nodesToRegenerate.length} image(s) in parallel...`,
        step: 1,
        totalSteps: 2 + nodesToRegenerate.length
      });

      const regenerationPromises = nodesToRegenerate.map(async (node, index) => {
        try {
          console.log(`🔄 [PARALLEL] Starting regeneration ${index + 1}/${nodesToRegenerate.length}: ${node.name}`);
          
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
          const node = nodesToRegenerate[i];

          // Feedback de progresso mais detalhado para o usuário
          figma.ui.postMessage({
              type: 'image-progress',
              message: `Applying image ${i + 1} of ${nodesToRegenerate.length}...`,
              step: 2 + i,
              totalSteps: 2 + nodesToRegenerate.length
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
              figma.notify(`Failed to generate image for ${node.name}`, { error: true });
          }

          // **A MUDANÇA MAIS IMPORTANTE!**
          // Pausa de 50ms para permitir que a UI do Figma "respire"
          await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const message = errorCount > 0 
        ? `Regenerated ${successCount}/${nodesToRegenerate.length} images (${errorCount} failures)`
        : `All ${successCount} images were regenerated successfully!`;
      
      figma.ui.postMessage({
        type: 'image-complete',
        message: message
      });
      
      figma.notify(`✅ ${message}`, { timeout: 3000 });
      console.log(`🎉 [PARALLEL] Regeneration complete: ${successCount} successes, ${errorCount} errors`);
      
    } else {
      // New image generation (existing logic for one image is good)
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

// Handler para edição em lote de imagens dentro de um frame (execução direta)
async function executeFrameImageEditing(msg: any) {
  try {
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

    const imageNodes = findImageNodes(selectedNode);

    if (imageNodes.length === 0) {
      figma.ui.postMessage({
        type: 'error',
        message: 'No images found within the selected frame',
        context: 'image-edit'
      });
      return;
    }

    const sanitizedPrompt = typeof msg.prompt === 'string' ? msg.prompt.trim() : '';
    if (!sanitizedPrompt) {
      figma.ui.postMessage({
        type: 'error',
        message: 'Please provide an editing prompt to continue.',
        context: 'image-edit'
      });
      return;
    }

    console.log(`🖼️ Found ${imageNodes.length} image(s) in frame: ${selectedNode.name}. Starting editing...`);

    // Passo 0: Duplicar o frame com convenção Dogo antes de editar as imagens
    figma.ui.postMessage({
      type: 'image-edit-progress',
      message: 'Duplicating frame with Dogo naming...',
      step: 0,
      totalSteps: 3
    });

    const { duplicateFrameWithDogoNaming, findCorrespondingNode } = await import('./utils/figmaUtils');
    
    const duplicatedFrame = duplicateFrameWithDogoNaming(selectedNode as FrameNode);
    console.log(`✅ Frame duplicated: ${duplicatedFrame.name}`);
    
    // Encontrar os nós de imagem correspondentes no frame duplicado
    const nodesToEdit: SceneNode[] = [];
    for (const originalImageNode of imageNodes) {
      const correspondingNode = findCorrespondingNode(originalImageNode, duplicatedFrame);
      if (correspondingNode) {
        nodesToEdit.push(correspondingNode);
        console.log(`✅ Found corresponding node for ${originalImageNode.name}`);
      } else {
        console.log(`⚠️ Could not find corresponding node for ${originalImageNode.name}`);
      }
    }
    
    if (nodesToEdit.length === 0) {
      figma.ui.postMessage({
        type: 'error',
        message: 'Could not find corresponding images in duplicated frame',
        context: 'image-edit'
      });
      return;
    }
    
    // Selecionar o frame duplicado para feedback visual
    figma.currentPage.selection = [duplicatedFrame];
    figma.notify(`✅ Frame duplicated with Dogo naming convention. Editing ${nodesToEdit.length} image(s)...`, {
      timeout: 3000
    });

    const { ImageGenerationService } = await import('./services/imageGenerationService');

    figma.ui.postMessage({
      type: 'image-edit-progress',
      message: `Editing ${nodesToEdit.length} image(s) in parallel...`,
      step: 1,
      totalSteps: 3
    });

    const editingPromises = nodesToEdit.map(async (node, index) => {
      try {
        console.log(`🖼️ [PARALLEL] Editing ${index + 1}/${nodesToEdit.length}: ${node.name}`);
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

        const editedImageBytes = await ImageGenerationService.editImage(
          imageBytes,
          sanitizedPrompt,
          msg.apiKey,
          msg.size,
          {
            totalImages: nodesToEdit.length,
            imageIndex: index + 1,
            nodeName: node.name,
          }
        );

        return { success: true, node, editedImageBytes, error: null };
      } catch (error) {
        console.log(`❌ [PARALLEL] Error editing image for ${node.name}:`, error);
        return { success: false, node, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const results = await Promise.all(editingPromises);

    figma.ui.postMessage({
      type: 'image-edit-progress',
      message: `Applying edited images to Figma...`,
      step: 2,
      totalSteps: 3
    });

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

    figma.ui.postMessage({
      type: 'image-edit-progress',
      message: 'Finalizing edits...',
      step: 3,
      totalSteps: 3
    });

    const message = errorCount > 0
      ? `Edited ${successCount}/${nodesToEdit.length} image(s) (${errorCount} failed)`
      : `Successfully edited all ${successCount} image(s)!`;

    figma.ui.postMessage({
      type: 'image-edit-complete',
      message
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

async function handleFrameReflow(newHeight: number) {
  if (typeof newHeight !== 'number' || Number.isNaN(newHeight) || newHeight <= 0) {
    throw new Error('Invalid height provided for resizing.');
  }

  const selection = figma.currentPage.selection;

  if (selection.length !== 1 || selection[0].type !== 'FRAME') {
    throw new Error('Please select a single frame to resize.');
  }

  const baseFrame = selection[0] as FrameNode;
  const oldWidth = baseFrame.width;
  const oldHeight = baseFrame.height;

  if (Math.round(oldHeight) === Math.round(newHeight)) {
    throw new Error('The frame already has the desired height.');
  }

  if (newHeight < oldHeight) {
    throw new Error('This function only supports increasing the height of the selected frame.');
  }

  const newFrame = baseFrame.clone();
  newFrame.x = baseFrame.x + baseFrame.width + 100;
  newFrame.y = baseFrame.y;

  // Aplicar nomenclatura Dogo
  try {
    // Apenas atualizar a dimensão no nome, mantendo ticket e variant originais
    const originalName = baseFrame.name;
    const dateRegex = /_([A-Za-z]{3}\d{1,2})$/;
    const nameBase = originalName.replace(dateRegex, '');
    
    // Remove sufixos como " - Permuted" que o Figma adiciona
    const cleanNameBase = nameBase.replace(/(\s*-\s*Permuted)+$/gi, '').trim();
    
    // Remove prefixo Dogo_ se existir
    const withoutDogo = cleanNameBase.replace(/^Dogo_/, '');
    
    // Split por underscore para pegar os componentes
    const parts = withoutDogo.split('_');
    
    // Atualizar a dimensão (geralmente é o 3º componente após ticket e variant)
    // Formato: Ticket_Variant_Dimension_Type_Device_Concept_Tactic_Elements_Lang_Color_Launch
    const newDimension = `${Math.round(oldWidth)}x${Math.round(newHeight)}`;
    
    let newName = '';
    
    // Verifica se o primeiro componente é um ticket (Ticket123 ou 123)
    const ticketRegex = /^(Ticket\d+|\d+)$/;
    const hasTicket = parts.length > 0 && ticketRegex.test(parts[0]);
    
    if (hasTicket && parts.length >= 3) {
      // Caso 1: Tem ticket number no primeiro componente (convenção Dogo padrão)
      // Formato: Ticket_Variant_Dimension_Type_Device_Concept_Tactic_Elements_Lang_Color_Launch
      // Substituir apenas a Dimension (posição 2), manter ticket, variant e resto
      const restOfParts = parts.slice(3); // Pula ticket, variant e dimension antiga
      newName = `Dogo_${parts[0]}_${parts[1]}_${newDimension}_${restOfParts.join('_')}`;
      console.log(`✅ Updated dimension in Dogo convention: ${newDimension}`);
    } else {
      // Caso 2: NÃO tem ticket number no início - apenas adiciona dimensão
      newName = `Dogo_${withoutDogo}_${newDimension}`;
      console.log(`⚠️ No ticket found, appending dimension to: ${withoutDogo}`);
    }
    
    newFrame.name = newName;
    
    console.log(`🏷️ Frame resize renamed: ${newName}`);
  } catch (namingError) {
    console.log(`⚠️ Failed to apply Dogo naming convention on resize: ${namingError}`);
    newFrame.name = `${baseFrame.name} (${Math.round(oldWidth)}x${Math.round(newHeight)})`;
  }

  const frameWithResize = newFrame as FrameNode;
  if (typeof frameWithResize.resizeWithoutConstraints === 'function') {
    frameWithResize.resizeWithoutConstraints(oldWidth, newHeight);
  } else {
    frameWithResize.resize(oldWidth, newHeight);
  }

  const heightDifference = newHeight - oldHeight;
  const bottomThresholdOriginal = oldHeight * 0.6;
  let backgroundNode: (SceneNode & { resize: (width: number, height: number) => void }) | undefined;

  for (const child of newFrame.children) {
    const normalizedName = child.name.toLowerCase();
    const childWidth = typeof (child as any).width === 'number' ? ((child as any).width as number) : undefined;
    const childHeight = typeof (child as any).height === 'number' ? ((child as any).height as number) : undefined;
    const childTop = 'y' in child ? (child as SceneNode & { y: number }).y : 0;

    const coversFrame =
      typeof childWidth === 'number' &&
      typeof childHeight === 'number' &&
      childWidth >= oldWidth * 0.95 &&
      childHeight >= oldHeight * 0.95 &&
      childTop <= oldHeight * 0.1;

    const isPotentialBackground =
      normalizedName.includes('bg') ||
      normalizedName.includes('background') ||
      coversFrame;

    if (!backgroundNode && isPotentialBackground && 'resize' in child) {
      backgroundNode = child as SceneNode & { resize: (width: number, height: number) => void };
    }
  }

  if (backgroundNode) {
    const widthForResize =
      typeof (backgroundNode as any).width === 'number'
        ? ((backgroundNode as any).width as number)
        : oldWidth;
    console.log(`📏 Esticando background: ${backgroundNode.name}`);
    try {
      backgroundNode.resize(widthForResize, newHeight);
    } catch (error) {
      console.log('⚠️ Could not stretch the detected background:', error);
    }
  }

  for (const child of newFrame.children) {
    if (child === backgroundNode) {
      continue;
    }

    if (!('y' in child)) {
      continue;
    }

    const childNode = child as SceneNode & { y: number };
    const childHeight =
      typeof (child as any).height === 'number' ? ((child as any).height as number) : 0;
    const childCenterYOriginal = childNode.y + childHeight / 2;
    const constraints = (child as any).constraints as { vertical?: string } | undefined;
    const verticalConstraint = constraints?.vertical ?? 'MIN';
    const isFooterElement = childCenterYOriginal > bottomThresholdOriginal;

    if (isFooterElement && verticalConstraint === 'MIN') {
      console.log(`🚚 Movendo elemento de rodapé: ${child.name}`);
      childNode.y += heightDifference;
    }
  }

  figma.currentPage.selection = [newFrame];
  figma.viewport.scrollAndZoomIntoView([newFrame]);

  const successMsg = `✅ Novo frame criado: ${Math.round(oldWidth)}x${Math.round(newHeight)} [Reflow]`;
  figma.notify(successMsg, { timeout: 3000 });
  figma.ui.postMessage({ type: 'resize-complete', message: successMsg });
}

function findImageNodes(node: SceneNode): SceneNode[] {
  const imageNodes: SceneNode[] = [];

  if ('fills' in node && node.fills && Array.isArray(node.fills)) {
    const hasImage = node.fills.some((fill) => fill.type === 'IMAGE');
    if (hasImage) {
      imageNodes.push(node);
    }
  }

  if ('children' in node) {
    for (const child of node.children) {
      imageNodes.push(...findImageNodes(child));
    }
  }

  return imageNodes;
}

async function handleFrameStretch(newHeight: number) {
  if (typeof newHeight !== 'number' || Number.isNaN(newHeight) || newHeight <= 0) {
    throw new Error('Invalid height provided for resizing.');
  }

  const selection = figma.currentPage.selection;

  if (selection.length !== 1 || selection[0].type !== 'FRAME') {
    throw new Error('Please select a single frame to resize.');
  }

  const baseFrame = selection[0] as FrameNode;
  const oldWidth = baseFrame.width;
  const oldHeight = baseFrame.height;

  if (Math.round(oldHeight) === Math.round(newHeight)) {
    throw new Error('The frame already has the desired height.');
  }

  if (newHeight < oldHeight) {
    throw new Error('This function only supports increasing the height of the selected frame.');
  }

  const stretchRatio = newHeight / oldHeight;
  const newFrame = baseFrame.clone();
  newFrame.x = baseFrame.x + baseFrame.width + 100;
  newFrame.y = baseFrame.y;

  // Aplicar nomenclatura Dogo
  try {
    // Apenas atualizar a dimensão no nome, mantendo ticket e variant originais
    const originalName = baseFrame.name;
    const dateRegex = /_([A-Za-z]{3}\d{1,2})$/;
    const nameBase = originalName.replace(dateRegex, '');
    
    // Remove sufixos como " - Permuted" que o Figma adiciona
    const cleanNameBase = nameBase.replace(/(\s*-\s*Permuted)+$/gi, '').trim();
    
    // Remove prefixo Dogo_ se existir
    const withoutDogo = cleanNameBase.replace(/^Dogo_/, '');
    
    // Split por underscore para pegar os componentes
    const parts = withoutDogo.split('_');
    
    // Atualizar a dimensão (geralmente é o 3º componente após ticket e variant)
    // Formato: Ticket_Variant_Dimension_Type_Device_Concept_Tactic_Elements_Lang_Color_Launch
    const newDimension = `${Math.round(oldWidth)}x${Math.round(newHeight)}`;
    
    let newName = '';
    
    // Verifica se o primeiro componente é um ticket (Ticket123 ou 123)
    const ticketRegex = /^(Ticket\d+|\d+)$/;
    const hasTicket = parts.length > 0 && ticketRegex.test(parts[0]);
    
    if (hasTicket && parts.length >= 3) {
      // Caso 1: Tem ticket number no primeiro componente (convenção Dogo padrão)
      // Formato: Ticket_Variant_Dimension_Type_Device_Concept_Tactic_Elements_Lang_Color_Launch
      // Substituir apenas a Dimension (posição 2), manter ticket, variant e resto
      const restOfParts = parts.slice(3); // Pula ticket, variant e dimension antiga
      newName = `Dogo_${parts[0]}_${parts[1]}_${newDimension}_${restOfParts.join('_')}`;
      console.log(`✅ Updated dimension in Dogo convention: ${newDimension}`);
    } else {
      // Caso 2: NÃO tem ticket number no início - apenas adiciona dimensão
      newName = `Dogo_${withoutDogo}_${newDimension}`;
      console.log(`⚠️ No ticket found, appending dimension to: ${withoutDogo}`);
    }
    
    newFrame.name = newName;
    
    console.log(`🏷️ Frame resize renamed: ${newName}`);
  } catch (namingError) {
    console.log(`⚠️ Failed to apply Dogo naming convention on resize: ${namingError}`);
    newFrame.name = `${baseFrame.name} (${Math.round(oldWidth)}x${Math.round(newHeight)}) [Stretch]`;
  }

  const frameWithResize = newFrame as FrameNode;
  if (typeof frameWithResize.resizeWithoutConstraints === 'function') {
    frameWithResize.resizeWithoutConstraints(oldWidth, newHeight);
  } else {
    frameWithResize.resize(oldWidth, newHeight);
  }

  for (const child of newFrame.children) {
    if ('y' in child) {
      const childNode = child as SceneNode & { y: number };
      childNode.y *= stretchRatio;
    }

    if ('resize' in child && typeof (child as any).height === 'number') {
      const resizableChild = child as SceneNode & {
        resize: (width: number, height: number) => void;
      };
      const childWidth = typeof (child as any).width === 'number' ? ((child as any).width as number) : undefined;
      const childHeight = (child as any).height as number;

      if (typeof childWidth === 'number') {
        try {
          resizableChild.resize(childWidth, childHeight * stretchRatio);
        } catch (error) {
          console.log(`⚠️ Falha ao esticar ${child.name}:`, error);
        }
      }
    }
  }

  figma.currentPage.selection = [newFrame];
  figma.viewport.scrollAndZoomIntoView([newFrame]);

  const successMsg = `✅ Novo frame criado: ${Math.round(oldWidth)}x${Math.round(newHeight)} [Stretch]`;
  figma.notify(successMsg, { timeout: 3000 });
  figma.ui.postMessage({ type: 'resize-complete', message: successMsg });
}

/**
 * Handle bulk export of selected frames to Google Drive
 */
async function handleExportToDrive(msg: any) {
  try {
    // Get tokens and folderId from clientStorage
    const tokens = await figma.clientStorage.getAsync('google_drive_tokens');
    const folderId = msg.folderId;
    
    if (!tokens) {
      figma.notify('❌ Please connect your Google Drive first', { timeout: 3000 });
      figma.ui.postMessage({
        type: 'error',
        message: 'Google Drive not connected. Please connect first.',
        context: 'drive-export'
      });
      return;
    }
    
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.notify('❌ Please select at least one frame to export', { timeout: 3000 });
      figma.ui.postMessage({
        type: 'drive-export-complete',
        successCount: 0,
        errorCount: 0,
        totalFrames: 0
      });
      return;
    }
    
    const frames = selection.filter(node => node.type === 'FRAME') as FrameNode[];
    
    if (frames.length === 0) {
      figma.notify('❌ Please select frames', { timeout: 3000 });
      figma.ui.postMessage({
        type: 'drive-export-complete',
        successCount: 0,
        errorCount: 0,
        totalFrames: 0
      });
      return;
    }
    
    console.log(`☁️ Exporting ${frames.length} frame(s) to Google Drive...`);
    figma.notify(`📤 Exporting ${frames.length} frame(s)...`, { timeout: 2000 });
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const frameName = frame.name;
      
      try {
        const imageBytes = await frame.exportAsync({
          format: 'PNG',
          constraint: { type: 'SCALE', value: 1 }
        });
        
        const frameData = Array.from(imageBytes);
        
        figma.ui.postMessage({
          type: 'drive-export-frame',
          frameData,
          frameName,
          tokens,
          folderId,
          currentIndex: i + 1,
          totalFrames: frames.length
        });
        
        await new Promise<void>((resolve) => {
          const handler = (msg: any) => {
            if (msg.type === 'drive-export-frame-complete' && msg.frameName === frameName) {
              figma.ui.off('message', handler);
              
              if (msg.success) {
                successCount++;
                console.log(`✅ ${frameName} uploaded`);
              } else {
                errorCount++;
                console.error(`❌ ${frameName} failed`);
              }
              resolve();
            }
          };
          
          figma.ui.on('message', handler);
          
          setTimeout(() => {
            figma.ui.off('message', handler);
            errorCount++;
            resolve();
          }, 30000);
        });
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error exporting ${frameName}:`, error);
      }
    }
    
    figma.ui.postMessage({
      type: 'drive-export-complete',
      successCount,
      errorCount,
      totalFrames: frames.length
    });
    
    const message = errorCount === 0
      ? `✅ Exported ${successCount} frame(s)!`
      : `⚠️ Exported ${successCount}/${frames.length} (${errorCount} failed)`;
    
    figma.notify(message, { timeout: 3000 });
    
  } catch (error) {
    console.error('❌ Export error:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      context: 'drive-export'
    });
  }
}
