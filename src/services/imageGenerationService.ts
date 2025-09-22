// Serviço para geração de imagens com IA usando OpenAI

export class ImageGenerationService {
  
  // Gera uma nova imagem usando OpenAI API (retorna URL)
  static async generateImage(prompt: string, apiKey: string, size: string = "1024x1024"): Promise<string> {
    console.log(`🎨 [IMAGE-GEN] Starting image generation with prompt: "${prompt}"`);
    
    const apiStartTime = Date.now();
    
    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1", // Modelo mais recente da OpenAI (atualizado)
          prompt: prompt,
          size: size, // "1024x1024", "1024x1792", "1792x1024"
          quality: "standard", // "standard" ou "hd"
          n: 1, // quantidade de imagens
        }),
      });

      console.log(`📥 [IMAGE-GEN-${Date.now() - apiStartTime}ms] Response status:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ [IMAGE-GEN-${Date.now() - apiStartTime}ms] Error response:`, errorText);
        
        let userFriendlyError = `OpenAI API error (${response.status})`;
        if (response.status === 401) {
          userFriendlyError = 'Chave API inválida. Verifique suas credenciais.';
        } else if (response.status === 429) {
          userFriendlyError = 'Limite de taxa excedido. Tente novamente em alguns minutos.';
        } else if (response.status >= 500) {
          userFriendlyError = 'Erro do servidor OpenAI. Tente novamente mais tarde.';
        } else if (response.status === 400) {
          userFriendlyError = 'Prompt inválido ou muito longo. Tente um prompt mais simples.';
        }
        
        throw new Error(`${userFriendlyError}: ${errorText}`);
      }

      const data = await response.json() as any;
      console.log(`✅ [IMAGE-GEN-${Date.now() - apiStartTime}ms] Image generated successfully`);
      console.log(`📊 [IMAGE-GEN-${Date.now() - apiStartTime}ms] API Response structure:`, JSON.stringify(data, null, 2));

      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.log(`❌ [IMAGE-GEN-${Date.now() - apiStartTime}ms] Invalid response structure - missing data array`);
        throw new Error('Resposta inválida da API - dados da imagem não encontrados');
      }

      const imageData = data.data[0];
      if (!imageData || !imageData.url) {
        console.log(`❌ [IMAGE-GEN-${Date.now() - apiStartTime}ms] Invalid image data structure:`, imageData);
        throw new Error('Resposta inválida da API - URL da imagem não encontrada');
      }

      const imageUrl = imageData.url;
      console.log(`🖼️ [IMAGE-GEN-${Date.now() - apiStartTime}ms] Image URL:`, imageUrl);
      
      // Validar se a URL parece válida
      if (!imageUrl.startsWith('https://')) {
        console.log(`❌ [IMAGE-GEN-${Date.now() - apiStartTime}ms] Invalid URL format:`, imageUrl);
        throw new Error('URL da imagem inválida recebida da API');
      }
      
      return imageUrl;

    } catch (error) {
      console.log(`❌ [IMAGE-GEN-${Date.now() - apiStartTime}ms] Generation error:`, error);
      throw error;
    }
  }

  // Gera uma nova imagem usando OpenAI API (retorna base64 diretamente)
  static async generateImageAsBase64(prompt: string, apiKey: string, size: string = "1024x1024", transparent: boolean = false): Promise<Uint8Array> {
    console.log(`🎨 [IMAGE-GEN-B64] Starting image generation with prompt: "${prompt}"`);
    
    const apiStartTime = Date.now();
    
    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1", // Modelo correto baseado no teu exemplo
          prompt: transparent ? `${prompt}, isolated subject, transparent background` : prompt,
          // Removido parâmetros não suportados pelo gpt-image-1
        }),
      });

      console.log(`📥 [IMAGE-GEN-B64-${Date.now() - apiStartTime}ms] Response status:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ [IMAGE-GEN-B64-${Date.now() - apiStartTime}ms] Error response:`, errorText);
        
        let userFriendlyError = `OpenAI API error (${response.status})`;
        if (response.status === 401) {
          userFriendlyError = 'Chave API inválida. Verifique suas credenciais.';
        } else if (response.status === 429) {
          userFriendlyError = 'Limite de taxa excedido. Tente novamente em alguns minutos.';
        } else if (response.status >= 500) {
          userFriendlyError = 'Erro do servidor OpenAI. Tente novamente mais tarde.';
        } else if (response.status === 400) {
          userFriendlyError = 'Prompt inválido ou muito longo. Tente um prompt mais simples.';
        }
        
        throw new Error(`${userFriendlyError}: ${errorText}`);
      }

      const data = await response.json() as any;
      console.log(`✅ [IMAGE-GEN-B64-${Date.now() - apiStartTime}ms] Image generated successfully`);

      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.log(`❌ [IMAGE-GEN-B64-${Date.now() - apiStartTime}ms] Invalid response structure - missing data array`);
        throw new Error('Resposta inválida da API - dados da imagem não encontrados');
      }

      const imageData = data.data[0];
      // Tenta primeiro b64_json, depois url como fallback
      let base64Data: string;
      
      if (imageData.b64_json) {
        base64Data = imageData.b64_json;
        console.log(`📊 [IMAGE-GEN-B64-${Date.now() - apiStartTime}ms] Using b64_json from response`);
      } else if (imageData.url) {
        console.log(`📊 [IMAGE-GEN-B64-${Date.now() - apiStartTime}ms] No b64_json, converting from URL...`);
        // Se não tem base64, baixa da URL e converte
        const urlResponse = await fetch(imageData.url);
        if (!urlResponse.ok) {
          throw new Error(`Falha ao baixar imagem da URL: ${urlResponse.status}`);
        }
        const arrayBuffer = await urlResponse.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Converte para base64 usando nossa função customizada
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let result = '';
        
        for (let i = 0; i < bytes.length; i += 3) {
          const bitmap = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
          result += chars[(bitmap >> 18) & 63];
          result += chars[(bitmap >> 12) & 63];
          result += i + 1 < bytes.length ? chars[(bitmap >> 6) & 63] : '=';
          result += i + 2 < bytes.length ? chars[bitmap & 63] : '=';
        }
        
        base64Data = result;
      } else {
        console.log(`❌ [IMAGE-GEN-B64-${Date.now() - apiStartTime}ms] Invalid image data structure:`, imageData);
        throw new Error('Resposta inválida da API - nem b64_json nem url encontrados');
      }
      console.log(`🔄 [IMAGE-GEN-B64-${Date.now() - apiStartTime}ms] Converting base64 to Uint8Array...`);
      
      // Converte base64 para Uint8Array (implementação compatível com Figma)
      console.log(`🔄 [IMAGE-GEN-B64-${Date.now() - apiStartTime}ms] Converting base64 data (${base64Data.length} chars)...`);
      
      try {
        // Implementação customizada de base64 decode para Figma plugin
        const base64ToBytes = (base64: string): Uint8Array => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          let result = '';
          
          // Remove padding e caracteres inválidos
          const cleanBase64 = base64.replace(/[^A-Za-z0-9+/]/g, '');
          
          for (let i = 0; i < cleanBase64.length; i += 4) {
            const encoded1 = chars.indexOf(cleanBase64[i]);
            const encoded2 = chars.indexOf(cleanBase64[i + 1]);
            const encoded3 = chars.indexOf(cleanBase64[i + 2]);
            const encoded4 = chars.indexOf(cleanBase64[i + 3]);
            
            const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
            
            result += String.fromCharCode((bitmap >> 16) & 255);
            if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
            if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
          }
          
          const bytes = new Uint8Array(result.length);
          for (let i = 0; i < result.length; i++) {
            bytes[i] = result.charCodeAt(i);
          }
          
          return bytes;
        };
        
        const bytes = base64ToBytes(base64Data);
        
        console.log(`✅ [IMAGE-GEN-B64-${Date.now() - apiStartTime}ms] Converted ${bytes.length} bytes from base64`);
        
        if (bytes.length === 0) {
          throw new Error('Base64 conversion resulted in empty data');
        }
        
        return bytes;
        
      } catch (conversionError) {
        console.log(`❌ [IMAGE-GEN-B64-${Date.now() - apiStartTime}ms] Base64 conversion error:`, conversionError);
        throw new Error(`Falha na conversão base64: ${conversionError instanceof Error ? conversionError.message : 'Erro desconhecido'}`);
      }

    } catch (error) {
      console.log(`❌ [IMAGE-GEN-B64-${Date.now() - apiStartTime}ms] Generation error:`, error);
      throw error;
    }
  }

  // Converte URL da imagem para Uint8Array para uso no Figma
  static async downloadImageAsBytes(imageUrl: string, maxRetries: number = 3): Promise<Uint8Array> {
    console.log(`📥 [IMAGE-DOWNLOAD] Downloading image from URL:`, imageUrl);
    
    // Validação básica da URL
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('URL da imagem inválida ou vazia');
    }
    
    if (!imageUrl.startsWith('https://')) {
      throw new Error(`URL da imagem deve usar HTTPS: ${imageUrl}`);
    }
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [IMAGE-DOWNLOAD] Attempt ${attempt}/${maxRetries}`);
        
        // Fetch simples compatível com Figma plugin
        const response = await fetch(imageUrl, {
          method: 'GET'
        });
        
        console.log(`📊 [IMAGE-DOWNLOAD] Response status: ${response.status}, content-type: ${response.headers.get('content-type')}`);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unable to read error response');
          console.log(`❌ [IMAGE-DOWNLOAD] HTTP Error ${response.status}:`, errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Verifica o content-type
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.startsWith('image/')) {
          console.log(`⚠️ [IMAGE-DOWNLOAD] Unexpected content-type: ${contentType}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        console.log(`✅ [IMAGE-DOWNLOAD] Downloaded ${uint8Array.length} bytes, content-type: ${contentType}`);
        
        if (uint8Array.length === 0) {
          throw new Error('Imagem baixada está vazia');
        }
        
        return uint8Array;
        
      } catch (error) {
        console.log(`❌ [IMAGE-DOWNLOAD] Attempt ${attempt} failed:`, error);
        
        // Se não é a última tentativa, aguarda um pouco antes de tentar novamente
        if (attempt < maxRetries) {
          const delay = attempt * 1000; // 1s, 2s, 3s...
          console.log(`⏳ [IMAGE-DOWNLOAD] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Mensagens de erro mais específicas na última tentativa
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          throw new Error('❌ Restrição do ambiente Figma: Não é possível acessar URLs externas diretamente. \n\n💡 Solução alternativa:\n1. Abra a URL da imagem em um navegador\n2. Salve a imagem localmente\n3. Arraste a imagem para o Figma manualmente\n\n🔗 URL da imagem foi copiada para o console (F12)');
        } else if (error instanceof Error && error.message.includes('CORS')) {
          throw new Error('Erro de CORS. A URL da imagem pode ter expirado.');
        } else {
          throw new Error(`Falha ao baixar imagem após ${maxRetries} tentativas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }
    }
    
    // Esta linha nunca deve ser alcançada, mas TypeScript precisa dela
    throw new Error('Falha inesperada no download da imagem');
  }

  // Método apenas base64 (sem fallback) - para debugging
  static async generateImageBase64Only(prompt: string, apiKey: string, size: string = "1024x1024"): Promise<Uint8Array> {
    console.log(`🎯 [IMAGE-B64-ONLY] Forcing base64-only approach...`);
    return await this.generateImageAsBase64(prompt, apiKey, size);
  }

  // Método híbrido: tenta base64 primeiro, depois URL como fallback
  static async generateImageWithFallback(prompt: string, apiKey: string, size: string = "1024x1024"): Promise<Uint8Array> {
    console.log(`🔄 [IMAGE-HYBRID] Starting hybrid image generation...`);
    
    try {
      // Primeira tentativa: base64 (evita problemas de rede)
      console.log(`🎯 [IMAGE-HYBRID] Trying base64 approach first...`);
      const result = await this.generateImageAsBase64(prompt, apiKey, size);
      console.log(`✅ [IMAGE-HYBRID] Base64 approach succeeded!`);
      return result;
      
    } catch (base64Error) {
      console.log(`⚠️ [IMAGE-HYBRID] Base64 failed, ERROR DETAILS:`, base64Error);
      console.log(`⚠️ [IMAGE-HYBRID] Base64 error type:`, typeof base64Error);
      console.log(`⚠️ [IMAGE-HYBRID] Base64 error message:`, base64Error instanceof Error ? base64Error.message : 'No message');
      
      // Se o erro base64 foi por chave API ou outros problemas críticos, não tentar URL
      if (base64Error instanceof Error && (
        base64Error.message.includes('401') || 
        base64Error.message.includes('Chave API inválida') || 
        base64Error.message.includes('429') ||
        base64Error.message.includes('Limite de taxa')
      )) {
        console.log(`❌ [IMAGE-HYBRID] Base64 failed with critical error, not trying URL fallback`);
        throw base64Error;
      }
      
      console.log(`🔄 [IMAGE-HYBRID] Trying URL approach as fallback...`);
      
      try {
        // Segunda tentativa: URL tradicional
        const imageUrl = await this.generateImage(prompt, apiKey, size);
        const result = await this.downloadImageAsBytes(imageUrl);
        console.log(`✅ [IMAGE-HYBRID] URL approach succeeded as fallback!`);
        return result;
        
      } catch (urlError) {
        console.log(`❌ [IMAGE-HYBRID] Both approaches failed:`, { base64Error, urlError });
        
        // Se ambos falharam, dar prioridade ao erro base64 se for mais informativo
        if (base64Error instanceof Error && base64Error.message.length > 10) {
          throw new Error(`Método preferido (Base64) falhou: ${base64Error.message}`);
        } else {
          throw new Error(`Ambos métodos falharam. Base64: ${base64Error instanceof Error ? base64Error.message : 'Erro desconhecido'}. URL: ${urlError instanceof Error ? urlError.message : 'Erro desconhecido'}`);
        }
      }
    }
  }

  // Cria uma nova imagem no Figma na posição especificada
  static async createImageInFigma(imageBytes: Uint8Array, x: number = 0, y: number = 0, name: string = "AI Generated Image"): Promise<void> {
    console.log(`🎨 [FIGMA-CREATE] Creating image in Figma at position (${x}, ${y})`);
    
    try {
      // Cria um retângulo para conter a imagem
      const rect = figma.createRectangle();
      rect.name = name;
      rect.x = x;
      rect.y = y;
      rect.resize(512, 512); // Tamanho padrão, será ajustado automaticamente
      
      // Cria a imagem a partir dos bytes
      const image = figma.createImage(imageBytes);
      
      // Aplica a imagem como fill do retângulo
      rect.fills = [{
        type: 'IMAGE',
        scaleMode: 'FILL',
        imageHash: image.hash
      }];
      
      // Adiciona ao frame atual ou à página
      if (figma.currentPage.selection.length > 0) {
        const parent = figma.currentPage.selection[0].parent;
        if (parent && 'appendChild' in parent) {
          parent.appendChild(rect);
        } else {
          figma.currentPage.appendChild(rect);
        }
      } else {
        figma.currentPage.appendChild(rect);
      }
      
      // Seleciona a nova imagem
      figma.currentPage.selection = [rect];
      figma.viewport.scrollAndZoomIntoView([rect]);
      
      console.log(`✅ [FIGMA-CREATE] Image created successfully: ${rect.id}`);
      
    } catch (error) {
      console.log(`❌ [FIGMA-CREATE] Creation error:`, error);
      throw new Error(`Falha ao criar imagem no Figma: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // Substitui uma imagem existente por uma nova
  static async replaceImageInFigma(targetNode: SceneNode, imageBytes: Uint8Array): Promise<void> {
    console.log(`🔄 [FIGMA-REPLACE] Replacing image in node: ${targetNode.name} (${targetNode.id})`);
    
    try {
      // Verifica se o nó pode ter fills
      if (!('fills' in targetNode)) {
        throw new Error('O elemento selecionado não suporta imagens');
      }
      
      // Cria a nova imagem
      const image = figma.createImage(imageBytes);
      
      // Substitui o fill
      (targetNode as any).fills = [{
        type: 'IMAGE',
        scaleMode: 'FILL',
        imageHash: image.hash
      }];
      
      // Seleciona o nó atualizado
      figma.currentPage.selection = [targetNode];
      figma.viewport.scrollAndZoomIntoView([targetNode]);
      
      console.log(`✅ [FIGMA-REPLACE] Image replaced successfully in: ${targetNode.id}`);
      
    } catch (error) {
      console.log(`❌ [FIGMA-REPLACE] Replace error:`, error);
      throw new Error(`Falha ao substituir imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}
