// Handler para geração de imagens com IA

import { ImageGenerationService } from '../services/imageGenerationService';
import { NamingUtils } from '../utils/namingConvention';
import { getBackendBaseUrl } from '../services/backendClient';
import { tagNodesWithUUID } from '../utils/figmaUtils';

// Storage keys
const API_KEY_STORAGE_KEY = 'figma-ai-assistant-api-key';
const IMAGE_BANK_FOLDER_STORAGE_KEY = 'figma-ai-assistant-image-bank-folder';

/**
 * Retorna a data atual no formato MmmDD (ex: Nov10)
 */
function getCurrentDateSuffix(): string {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[now.getMonth()];
  const day = now.getDate();
  return `${month}${day}`; // ex: Nov10
}

/**
 * Gera um ticket number para imagens geradas por IA (4000-9000)
 */
function generateAITicketNumber(): string {
  const min = 4000;
  const max = 9000;
  const ticketNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return ticketNumber.toString();
}

/**
 * Gera uma variant para imagens geradas por IA (ex: 124AI, 857AI)
 */
function generateAIVariant(): string {
  const randomNumber = Math.floor(Math.random() * 900) + 100; // 100-999 (3 dígitos)
  return `${randomNumber}AI`;
}

export class ImageGenerationHandler {

  /**
   * 🔒 CORREÇÃO CRÍTICA: Auto-Save centralizado no Handler
   * Esta função faz upload automático para o Google Drive após gerar a imagem
   * NÃO depende da UI estar aberta ou do usuário ter checkbox marcado
   * A configuração é lida diretamente do clientStorage
   */
  private static async uploadToDriveBackground(
    prompt: string,
    imageBytes: Uint8Array
  ): Promise<void> {
    try {
      // 1. Verificar configurações do Drive
      const tokens = await figma.clientStorage.getAsync('google_drive_tokens');
      const imageBankFolder = await figma.clientStorage.getAsync(IMAGE_BANK_FOLDER_STORAGE_KEY);
      const apiKey = await figma.clientStorage.getAsync(API_KEY_STORAGE_KEY);
      const autoSaveEnabled = await figma.clientStorage.getAsync('auto_save_drive_enabled');

      // Se auto-save não estiver habilitado ou não houver tokens, sair silenciosamente
      if (!autoSaveEnabled || !tokens || !imageBankFolder) {
        console.log('⏭️ Auto-save skipped: not configured or disabled');
        return;
      }

      console.log('☁️ Starting background auto-upload to Google Drive...');

      const backendUrl = getBackendBaseUrl();
      const imageBase64 = figma.base64Encode(imageBytes);

      // 2. Chamar backend para gerar nome AI + upload
      const response = await fetch(`${backendUrl}/drive/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokens,
          folderId: imageBankFolder,
          fileName: 'temp.png', // Será substituído pelo nome AI
          prompt: prompt, // Backend gera nome AI baseado nisso
          imageBase64: imageBase64,
          apiKey: apiKey || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Auto-upload successful: ${data.aiGeneratedName || data.fileName}`);
        figma.notify(`☁️ Saved to Drive: ${data.aiGeneratedName || data.fileName}`, { timeout: 3000 });

        // Notificar UI (se estiver aberta) com sucesso
        figma.ui.postMessage({
          type: 'auto-upload-success',
          fileName: data.aiGeneratedName || data.fileName,
          fileUrl: data.webViewLink
        });
      } else {
        throw new Error(data.error || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ Auto-upload error:', error);

      // Notificar erro, mas NÃO bloquear o fluxo principal
      figma.notify('⚠️ Failed to auto-save to Drive. Image created in Figma.', {
        error: true,
        timeout: 3000
      });

      figma.ui.postMessage({
        type: 'auto-upload-error',
        message: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  }

  // Handler principal para geração de nova imagem
  static async handleGenerateNewImage(msg: any) {
    const startTime = Date.now();
    console.log(`🎨 [${new Date().toISOString()}] Starting new image generation...`);
    
    let imageUrl: string | null = null;
    
    try {
      // Validar dados recebidos
      if (!msg.prompt) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Prompt é obrigatório.'
        });
        return;
      }
      
      if (!msg.apiKey) {
        console.log('⚠️ Nenhuma chave da API fornecida. Usando credenciais configuradas no backend.');
      }

      console.log(`📝 Prompt: "${msg.prompt}"`);
      console.log(`📐 Size: ${msg.size || '1024x1024'}`);

      // Parse image size
      const imageSize = msg.size || '1024x1024';
      const [imageWidth, imageHeight] = imageSize.split('x').map(Number);

      // Progress update
      figma.ui.postMessage({
        type: 'image-progress',
        message: 'Preparando geração de imagem...',
        step: 1,
        totalSteps: 3
      });

      // Step 1: Duplicate frame if selected
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 1: Preparing frame for new image...`);

      let targetFrame: FrameNode | null = null;
      let x = 0;
      let y = 0;
      
      if (figma.currentPage.selection.length > 0) {
        const selection = figma.currentPage.selection[0];
        
        // Se selecionou um frame, DUPLICAR PRIMEIRO
        if (selection.type === 'FRAME') {
          const originalFrame = selection as FrameNode;
          
          // Progress update
          figma.ui.postMessage({
            type: 'image-progress',
            message: 'Duplicando frame para nova versão...',
            step: 1,
            totalSteps: 4
          });
          
          console.log(`🎯 Duplicating frame: ${originalFrame.name}`);

          // 🆕 CORREÇÃO CRÍTICA: Tag com UUID antes de clonar
          console.log(`🏷️ Tagging frame nodes with UUID...`);
          tagNodesWithUUID(originalFrame);

          // Duplicar o frame
          targetFrame = originalFrame.clone() as FrameNode;
          
          // Posicionar ao lado do original
          targetFrame.x = originalFrame.x + originalFrame.width + 50;
          targetFrame.y = originalFrame.y;
          
          // Adicionar ao mesmo parent
          if (originalFrame.parent && 'appendChild' in originalFrame.parent) {
            originalFrame.parent.appendChild(targetFrame);
          } else {
            figma.currentPage.appendChild(targetFrame);
          }
          
          // Aplicar convenção de nomes Dogo com novo ticket
          try {
            // Gerar novo ticket number e variant específicos para IA
            const newTicketNumber = generateAITicketNumber(); // 4000-9000
            const newVariant = generateAIVariant(); // ex: 124AI
            
            // Aplicar lógica de nomeação baseada no NOME do frame (não em metadados vazios)
            const originalName = originalFrame.name;
            const dateRegex = /_([A-Za-z]{3}\d{1,2})$/;
            const nameBase = originalName.replace(dateRegex, '');
            
            // Remove sufixos como " - Permuted" que o Figma adiciona
            const cleanNameBase = nameBase.replace(/(\s*-\s*Permuted)+$/gi, '').trim();
            
            // Remove prefixo Dogo_ se existir
            const withoutDogo = cleanNameBase.replace(/^Dogo_/, '');
            
            // Split por underscore para pegar os componentes
            const parts = withoutDogo.split('_');
            
            let newName = '';
            
            // Verifica se o primeiro componente é um ticket (Ticket123 ou 123)
            const ticketRegex = /^(Ticket\d+|\d+)$/;
            const hasTicket = parts.length > 0 && ticketRegex.test(parts[0]);
            
            if (hasTicket && parts.length >= 2) {
              // Caso 1: Tem ticket number no primeiro componente (convenção Dogo padrão)
              // Formato: Ticket_Variant_Dimension_Type_Device_Concept_Tactic_Elements_Lang_Color_Launch
              // Substituir apenas Ticket e Variant, manter o resto
              const restOfParts = parts.slice(2); // Pula ticket e variant
              newName = `Dogo_${newTicketNumber}_${newVariant}_${restOfParts.join('_')}_${getCurrentDateSuffix()}`;
              console.log(`✅ Standard Dogo convention: replaced ticket and variant`);
            } else {
              // Caso 2: NÃO tem ticket number no início
              // Adiciona novo ticket/variant ANTES de todos os componentes existentes
              newName = `Dogo_${newTicketNumber}_${newVariant}_${withoutDogo}_${getCurrentDateSuffix()}`;
              console.log(`⚠️ No ticket found, prepending new ticket/variant to: ${withoutDogo}`);
            }
            
            targetFrame.name = newName;
            
            console.log(`🏷️ Frame duplicated and renamed: ${newName}`);
          } catch (namingError) {
            console.log(`⚠️ Failed to apply naming convention:`, namingError);
            targetFrame.name = `${originalFrame.name} (AI Image)`;
          }
          
          // Posicionar imagem no centro do frame duplicado
          x = (targetFrame.width - imageWidth) / 2;
          y = (targetFrame.height - imageHeight) / 2;

          // Selecionar o frame duplicado
          figma.currentPage.selection = [targetFrame];

          console.log(`✅ Frame duplicated. Image (${imageWidth}x${imageHeight}) will be created at (${x}, ${y})`);
        } else {
          // Se não é frame, posicionar ao lado
          x = selection.x + selection.width + 50;
          y = selection.y;
          console.log(`📍 Creating image next to selection: ${selection.name}`);
        }
      } else {
        // Sem seleção, usar centro da viewport
        x = figma.viewport.center.x - (imageWidth / 2);
        y = figma.viewport.center.y - (imageHeight / 2);
        console.log(`📍 Creating image at viewport center`);
      }

      // Step 2: Generate image with AI
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 2: Generating image with AI...`);
      
      // Progress update
      figma.ui.postMessage({
        type: 'image-progress',
        message: 'Gerando imagem (método base64 otimizado)...',
        step: 2,
        totalSteps: 4
      });

      // Get image bytes using base64-only method (evita CORS)
      console.log(`⏱️ [${Date.now() - startTime}ms] Getting image bytes...`);
      const imageBytes = await ImageGenerationService.generateImageBase64Only(msg.prompt, msg.apiKey, msg.size);
      
      // Para compatibilidade, geramos a URL para exibição usando conversão compatível
      try {
        // Implementação customizada de btoa para Figma plugin
        const bytesToBase64 = (bytes: Uint8Array): string => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          let result = '';
          
          for (let i = 0; i < bytes.length; i += 3) {
            const bitmap = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
            result += chars[(bitmap >> 18) & 63];
            result += chars[(bitmap >> 12) & 63];
            result += i + 1 < bytes.length ? chars[(bitmap >> 6) & 63] : '=';
            result += i + 2 < bytes.length ? chars[bitmap & 63] : '=';
          }
          
          return result;
        };
        
        imageUrl = "data:image/png;base64," + bytesToBase64(imageBytes);
        console.log(`📎 [${Date.now() - startTime}ms] Generated data URL for preview`);
      } catch (urlError) {
        console.log(`⚠️ [${Date.now() - startTime}ms] Failed to create preview URL:`, urlError);
        imageUrl = null; // Preview não é crítico
      }
      
      // Progress update
      figma.ui.postMessage({
        type: 'image-progress',
        message: 'Criando imagem...',
        step: 3,
        totalSteps: 3
      });
      
      // Step 3: Create image in Figma
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 3: Creating image in Figma...`);

      await ImageGenerationService.createImageInFigma(
        imageBytes,
        x,
        y,
        `AI: ${msg.prompt.substring(0, 30)}...`,
        targetFrame,
        imageWidth,
        imageHeight
      );

      // 🔒 CORREÇÃO CRÍTICA: Auto-Save ROBUSTO (não depende da UI)
      // Dispara em background - NÃO bloqueia a resposta ao usuário
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 4: Triggering background auto-save...`);
      this.uploadToDriveBackground(msg.prompt, imageBytes)
        .catch(err => console.error('Background upload failed (non-blocking):', err));

      // Success notification
      console.log(`📨 Sending image-generation-complete with imageUrl:`, imageUrl ? `${imageUrl.substring(0, 50)}...` : 'null');
      figma.ui.postMessage({
        type: 'image-generation-complete',
        imageUrl: imageUrl
      });

      figma.notify(`✅ Imagem gerada e adicionada com sucesso!`);
      console.log(`🎉 [${Date.now() - startTime}ms] Image generation completed successfully`);

    } catch (error) {
      console.log(`❌ [${Date.now() - startTime}ms] Image generation error:`, error);
      
      // Se o erro contém uma URL, tentamos fornecer uma solução alternativa
      if (error instanceof Error && error.message.includes('Restrição do ambiente Figma')) {
        figma.ui.postMessage({
          type: 'image-fetch-restricted',
          message: error.message,
          imageUrl: imageUrl
        });
      } else {
        figma.ui.postMessage({
          type: 'error',
          message: `Erro na geração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        });
      }
    }
  }

  // Handler para substituir imagem existente
  static async handleReplaceImage(msg: any) {
    const startTime = Date.now();
    console.log(`🔄 [${new Date().toISOString()}] Starting image replacement...`);
    
    let imageUrl: string | null = null;
    
    try {
      // Validar seleção
      const selectedNodes = figma.currentPage.selection;
      
      if (selectedNodes.length === 0) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Please select an element to replace the image.'
        });
        return;
      }

      if (selectedNodes.length > 1) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Please select only one element at a time.'
        });
        return;
      }

      const targetNode = selectedNodes[0];
      
      // Verificar se o nó pode receber imagens
      if (!('fills' in targetNode)) {
        figma.ui.postMessage({
          type: 'error',
          message: 'The selected element does not support images.'
        });
        return;
      }

      // Verificar se está dentro de um frame e duplicá-lo
      let parentFrame = targetNode.parent;
      let duplicatedFrame: FrameNode | null = null;
      let nodeToReplace: SceneNode = targetNode;
      
      // Encontrar o frame pai mais próximo
      while (parentFrame && parentFrame.type !== 'PAGE') {
        if (parentFrame.type === 'FRAME') {
          duplicatedFrame = parentFrame as FrameNode;
          break;
        }
        parentFrame = parentFrame.parent;
      }
      
      // Se encontrou um frame pai, duplicar e renomear
      if (duplicatedFrame) {
        console.log(`🎯 Found parent frame: ${duplicatedFrame.name}`);
        
        // Progress update
        figma.ui.postMessage({
          type: 'image-progress',
          message: 'Duplicando frame...',
          step: 1,
          totalSteps: 4
        });
        
        // 🆕 CORREÇÃO CRÍTICA: Tag com UUID antes de clonar
        const originalFrame = duplicatedFrame;
        console.log(`🏷️ Tagging frame nodes with UUID...`);
        tagNodesWithUUID(originalFrame);

        // Duplicar o frame
        duplicatedFrame = originalFrame.clone() as FrameNode;
        
        // Posicionar ao lado do original
        duplicatedFrame.x = originalFrame.x + originalFrame.width + 50;
        duplicatedFrame.y = originalFrame.y;
        
        // Adicionar ao mesmo parent
        if (originalFrame.parent && 'appendChild' in originalFrame.parent) {
          originalFrame.parent.appendChild(duplicatedFrame);
        } else {
          figma.currentPage.appendChild(duplicatedFrame);
        }
        
        // Aplicar convenção de nomes Dogo
        try {
          // Gerar novo ticket number e variant específicos para IA
          const newTicketNumber = generateAITicketNumber(); // 4000-9000
          const newVariant = generateAIVariant(); // ex: 124AI
          
          // Aplicar lógica de nomeação baseada no NOME do frame (não em metadados vazios)
          const originalName = originalFrame.name;
          const dateRegex = /_([A-Za-z]{3}\d{1,2})$/;
          const nameBase = originalName.replace(dateRegex, '');
          
          // Remove sufixos como " - Permuted" que o Figma adiciona
          const cleanNameBase = nameBase.replace(/(\s*-\s*Permuted)+$/gi, '').trim();
          
          // Remove prefixo Dogo_ se existir
          const withoutDogo = cleanNameBase.replace(/^Dogo_/, '');
          
          // Split por underscore para pegar os componentes
          const parts = withoutDogo.split('_');
          
          let newName = '';
          
          // Verifica se o primeiro componente é um ticket (Ticket123 ou 123)
          const ticketRegex = /^(Ticket\d+|\d+)$/;
          const hasTicket = parts.length > 0 && ticketRegex.test(parts[0]);
          
          if (hasTicket && parts.length >= 2) {
            // Caso 1: Tem ticket number no primeiro componente (convenção Dogo padrão)
            // Formato: Ticket_Variant_Dimension_Type_Device_Concept_Tactic_Elements_Lang_Color_Launch
            // Substituir apenas Ticket e Variant, manter o resto
            const restOfParts = parts.slice(2); // Pula ticket e variant
            newName = `Dogo_${newTicketNumber}_${newVariant}_${restOfParts.join('_')}_${getCurrentDateSuffix()}`;
            console.log(`✅ Standard Dogo convention: replaced ticket and variant`);
          } else {
            // Caso 2: NÃO tem ticket number no início
            // Adiciona novo ticket/variant ANTES de todos os componentes existentes
            newName = `Dogo_${newTicketNumber}_${newVariant}_${withoutDogo}_${getCurrentDateSuffix()}`;
            console.log(`⚠️ No ticket found, prepending new ticket/variant to: ${withoutDogo}`);
          }
          
          duplicatedFrame.name = newName;
          
          console.log(`🏷️ Frame duplicated and renamed: ${newName}`);
        } catch (namingError) {
          console.log(`⚠️ Failed to apply naming convention:`, namingError);
          duplicatedFrame.name = `${originalFrame.name} (AI Image)`;
        }
        
        // Encontrar o nó correspondente no frame duplicado
        const findCorrespondingNode = (original: SceneNode, duplicated: FrameNode): SceneNode | null => {
          // Se o targetNode é o próprio frame
          if (original.id === targetNode.id) {
            return duplicated;
          }
          
          // Buscar recursivamente nos filhos
          const searchInChildren = (parent: BaseNode & ChildrenMixin): SceneNode | null => {
            for (let i = 0; i < parent.children.length; i++) {
              if (parent.children[i].name === targetNode.name) {
                // Verificar se é o nó correto comparando a posição relativa
                const originalPos = { x: targetNode.x, y: targetNode.y };
                const candidatePos = { x: parent.children[i].x, y: parent.children[i].y };
                
                if (Math.abs(originalPos.x - candidatePos.x) < 1 && 
                    Math.abs(originalPos.y - candidatePos.y) < 1) {
                  return parent.children[i] as SceneNode;
                }
              }
              
              if ('children' in parent.children[i]) {
                const found = searchInChildren(parent.children[i] as BaseNode & ChildrenMixin);
                if (found) return found;
              }
            }
            return null;
          };
          
          return searchInChildren(duplicated);
        };
        
        const correspondingNode = findCorrespondingNode(targetNode, duplicatedFrame);
        if (correspondingNode) {
          nodeToReplace = correspondingNode;
          console.log(`✅ Found corresponding node in duplicated frame: ${nodeToReplace.name}`);
        } else {
          console.log(`⚠️ Could not find corresponding node, using original`);
        }
        
        // Selecionar o frame duplicado
        figma.currentPage.selection = [duplicatedFrame];
      }

      // Validar dados recebidos
      if (!msg.prompt) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Prompt é obrigatório.'
        });
        return;
      }
      
      if (!msg.apiKey) {
        console.log('⚠️ Nenhuma chave da API fornecida para substituição de imagem; usando backend.');
      }

      console.log(`🎯 Target: ${nodeToReplace.name} (${nodeToReplace.type})`);
      console.log(`📝 Prompt: "${msg.prompt}"`);

      // Progress update
      const totalSteps = duplicatedFrame ? 4 : 3;
      const currentStep = duplicatedFrame ? 2 : 1;
      
      figma.ui.postMessage({
        type: 'image-progress',
        message: 'Gerando nova imagem...',
        step: currentStep,
        totalSteps: totalSteps
      });

      // Step 1: Generate image with AI (método híbrido)
      console.log(`⏱️ [${Date.now() - startTime}ms] Step ${currentStep}: Generating replacement image with hybrid approach...`);
      
      // Progress update
      figma.ui.postMessage({
        type: 'image-progress',
        message: 'Gerando nova imagem (método base64 otimizado)...',
        step: currentStep,
        totalSteps: totalSteps
      });

      // Step 2: Get image bytes using base64-only method (evita CORS)
      console.log(`⏱️ [${Date.now() - startTime}ms] Step ${currentStep + 1}: Getting image bytes (base64 only)...`);
      const imageBytes = await ImageGenerationService.generateImageBase64Only(msg.prompt, msg.apiKey, msg.size);
      
      // Para compatibilidade, geramos a URL para exibição usando conversão compatível
      try {
        // Implementação customizada de btoa para Figma plugin
        const bytesToBase64 = (bytes: Uint8Array): string => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          let result = '';
          
          for (let i = 0; i < bytes.length; i += 3) {
            const bitmap = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
            result += chars[(bitmap >> 18) & 63];
            result += chars[(bitmap >> 12) & 63];
            result += i + 1 < bytes.length ? chars[(bitmap >> 6) & 63] : '=';
            result += i + 2 < bytes.length ? chars[bitmap & 63] : '=';
          }
          
          return result;
        };
        
        imageUrl = "data:image/png;base64," + bytesToBase64(imageBytes);
        console.log(`📎 [${Date.now() - startTime}ms] Generated data URL for preview`);
      } catch (urlError) {
        console.log(`⚠️ [${Date.now() - startTime}ms] Failed to create preview URL:`, urlError);
        imageUrl = null; // Preview não é crítico
      }
      
      // Progress update
      figma.ui.postMessage({
        type: 'image-progress',
        message: 'Substituindo imagem...',
        step: totalSteps,
        totalSteps: totalSteps
      });

      // Step 3: Replace image
      console.log(`⏱️ [${Date.now() - startTime}ms] Step ${totalSteps}: Replacing image...`);
      await ImageGenerationService.replaceImageInFigma(nodeToReplace, imageBytes);

      // 🔒 CORREÇÃO CRÍTICA: Auto-Save ROBUSTO para substituição
      console.log(`⏱️ [${Date.now() - startTime}ms] Triggering background auto-save for replacement...`);
      this.uploadToDriveBackground(msg.prompt, imageBytes)
        .catch(err => console.error('Background upload failed (non-blocking):', err));

      // Success notification
      figma.ui.postMessage({
        type: 'image-replacement-complete',
        imageUrl: imageUrl
      });

      figma.notify(`✅ Imagem substituída com sucesso!`);
      console.log(`🎉 [${Date.now() - startTime}ms] Image replacement completed successfully`);

    } catch (error) {
      console.log(`❌ [${Date.now() - startTime}ms] Image replacement error:`, error);
      
      // Se o erro contém uma URL, tentamos fornecer uma solução alternativa
      if (error instanceof Error && error.message.includes('Restrição do ambiente Figma')) {
        figma.ui.postMessage({
          type: 'image-fetch-restricted',
          message: error.message,
          imageUrl: imageUrl
        });
      } else {
        figma.ui.postMessage({
          type: 'error',
          message: `Erro na substituição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        });
      }
    }
  }
}
