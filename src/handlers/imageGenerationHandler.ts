// Handler para geração de imagens com IA

import { ImageGenerationService } from '../services/imageGenerationService';

export class ImageGenerationHandler {
  
  // Handler principal para geração de nova imagem
  static async handleGenerateNewImage(msg: any) {
    const startTime = Date.now();
    console.log(`🎨 [${new Date().toISOString()}] Starting new image generation...`);
    
    let imageUrl: string | null = null;
    
    try {
      // Validar dados recebidos
      if (!msg.prompt || !msg.apiKey) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Prompt e chave API são obrigatórios.'
        });
        return;
      }

      console.log(`📝 Prompt: "${msg.prompt}"`);
      console.log(`📐 Size: ${msg.size || '1024x1024'}`);

      // Progress update
      figma.ui.postMessage({
        type: 'image-progress',
        message: 'Gerando imagem com IA...',
        step: 1,
        totalSteps: 3
      });

      // Step 1: Generate image with AI (método híbrido)
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 1: Generating image with hybrid approach...`);
      
      // Progress update
      figma.ui.postMessage({
        type: 'image-progress',
        message: 'Gerando imagem (método base64 otimizado)...',
        step: 1,
        totalSteps: 2
      });

      // Step 2: Get image bytes using base64-only method (evita CORS)
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 2: Getting image bytes (base64 only)...`);
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
        message: 'Criando imagem no Figma...',
        step: 2,
        totalSteps: 2
      });

      // Step 3: Create image in Figma
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 3: Creating image in Figma...`);
      
      // Posição baseada na viewport atual ou seleção
      let x = figma.viewport.center.x - 256; // Centralizar imagem (assumindo 512x512)
      let y = figma.viewport.center.y - 256;
      
      if (figma.currentPage.selection.length > 0) {
        const selection = figma.currentPage.selection[0];
        x = selection.x + selection.width + 50; // Ao lado da seleção
        y = selection.y;
      }
      
      await ImageGenerationService.createImageInFigma(
        imageBytes, 
        x, 
        y, 
        `AI: ${msg.prompt.substring(0, 30)}...`
      );

      // Success notification
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
          message: 'Por favor, selecione um elemento para substituir a imagem.'
        });
        return;
      }

      if (selectedNodes.length > 1) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Por favor, selecione apenas um elemento por vez.'
        });
        return;
      }

      const targetNode = selectedNodes[0];
      
      // Verificar se o nó pode receber imagens
      if (!('fills' in targetNode)) {
        figma.ui.postMessage({
          type: 'error',
          message: 'O elemento selecionado não suporta imagens.'
        });
        return;
      }

      // Validar dados recebidos
      if (!msg.prompt || !msg.apiKey) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Prompt e chave API são obrigatórios.'
        });
        return;
      }

      console.log(`🎯 Target: ${targetNode.name} (${targetNode.type})`);
      console.log(`📝 Prompt: "${msg.prompt}"`);

      // Progress update
      figma.ui.postMessage({
        type: 'image-progress',
        message: 'Gerando nova imagem...',
        step: 1,
        totalSteps: 3
      });

      // Step 1: Generate image with AI (método híbrido)
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 1: Generating replacement image with hybrid approach...`);
      
      // Progress update
      figma.ui.postMessage({
        type: 'image-progress',
        message: 'Gerando nova imagem (método base64 otimizado)...',
        step: 1,
        totalSteps: 2
      });

      // Step 2: Get image bytes using base64-only method (evita CORS)
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 2: Getting image bytes (base64 only)...`);
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
        step: 2,
        totalSteps: 2
      });

      // Step 3: Replace image
      console.log(`⏱️ [${Date.now() - startTime}ms] Step 3: Replacing image...`);
      await ImageGenerationService.replaceImageInFigma(targetNode, imageBytes);

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
