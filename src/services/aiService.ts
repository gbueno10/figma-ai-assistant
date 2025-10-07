// Serviço para comunicação com APIs de IA

export class AIService {
  
  // Envia dados para a IA (integração real com OpenAI)
  static async sendToAI(screenshot: string, structure: any, apiKey: string): Promise<any> {
    const apiStartTime = Date.now();
    console.log(`🤖 [API-${apiStartTime}] Starting design analysis with OpenAI...`);
    
    const systemPrompt = `You are an expert UI/UX designer and consultant. You will receive a screenshot and detailed structural analysis of a Figma design.

Your task is to provide actionable design suggestions and improvements based on modern UI/UX best practices.

Analyze the design for:
- Visual hierarchy and typography
- Color scheme and contrast
- Layout and spacing
- User experience flow
- Accessibility considerations
- Modern design trends compliance

Return your response as JSON with this structure:
{
  "suggestions": [
    {
      "type": "text|layout|style|structure",
      "elementName": "name of the element",
      "currentValue": "what it currently is",
      "suggestedValue": "what it should be",
      "confidence": 0.85,
      "reasoning": "detailed explanation of why this change would improve the design"
    }
  ],
  "summary": "Overall assessment of the design",
  "improvements": ["list", "of", "key", "improvement", "areas"]
}

Be specific, actionable, and focus on improvements that will have the most impact.`;

    const inputMessage = `${systemPrompt}

Design Structure Analysis:
${JSON.stringify(structure, null, 2)}

Please analyze this design and provide specific suggestions for improvement.`;

    const requestBody = {
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: inputMessage
            },
            {
              type: 'image_url',
              image_url: {
                url: screenshot
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      verbosity: "low",
      reasoning_effort: "minimal"
    };

    console.log(`📤 [API-${Date.now() - apiStartTime}ms] Sending request to OpenAI Chat Completions API...`);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`📥 [API-${Date.now() - apiStartTime}ms] Response status:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ [API-${Date.now() - apiStartTime}ms] Error response body:`, errorText);
        
        let userFriendlyError = `OpenAI API error (${response.status})`;
        if (response.status === 401) {
          userFriendlyError = 'Chave API inválida. Verifique suas credenciais.';
        } else if (response.status === 429) {
          userFriendlyError = 'Limite de taxa excedido. Tente novamente em alguns minutos.';
        } else if (response.status >= 500) {
          userFriendlyError = 'Erro do servidor OpenAI. Tente novamente mais tarde.';
        } else if (response.status === 400) {
          userFriendlyError = 'Requisição inválida. Verifique os dados enviados.';
        }
        
        throw new Error(`${userFriendlyError}: ${errorText}`);
      }

      const data = await response.json() as any;
      console.log(`✅ [API-${Date.now() - apiStartTime}ms] OpenAI returned data`);

      // Log token usage
      if (data.usage) {
        console.log(`📊 [TOKENS] Input: ${data.usage.prompt_tokens} | Output: ${data.usage.completion_tokens} | Total: ${data.usage.total_tokens}`);
        
        // Calculate cost estimation (GPT-5 pricing - real prices from OpenAI)
        const inputCost = (data.usage.prompt_tokens / 1000000) * 1.25; // $1.25 per 1M input tokens
        const outputCost = (data.usage.completion_tokens / 1000000) * 10.00; // $10.00 per 1M output tokens
        
        // Check for cached tokens
        let cachedCost = 0;
        if (data.usage.prompt_tokens_details?.cached_tokens) {
          cachedCost = (data.usage.prompt_tokens_details.cached_tokens / 1000000) * 0.125; // $0.125 per 1M cached tokens
          console.log(`💾 [CACHED] ${data.usage.prompt_tokens_details.cached_tokens} tokens cached`);
        }
        
        const totalCost = inputCost + outputCost + cachedCost;
        console.log(`💰 [COST] Input: $${inputCost.toFixed(6)} | Output: $${outputCost.toFixed(6)} | Cached: $${cachedCost.toFixed(6)} | Total: $${totalCost.toFixed(6)}`);
      }

      // Extract content from Chat Completions API
      const content = data.choices?.[0]?.message?.content;
      const finishReason = data.choices?.[0]?.finish_reason;
      
      console.log(`🔍 [DEBUG] Raw content from OpenAI:`, content);
      console.log(`🔍 [DEBUG] Content type:`, typeof content);
      console.log(`🔍 [DEBUG] Content length:`, content ? content.length : 'null/undefined');
      console.log(`🔍 [DEBUG] Finish reason:`, finishReason);
      
      if (finishReason === 'length') {
        throw new Error('GPT-5 atingiu o limite de tokens. Tente uma análise mais simples ou aumente o limite de tokens.');
      }
      
      if (!content || content.trim() === '') {
        console.log(`❌ [DEBUG] Content is empty or null. Full response data:`, JSON.stringify(data, null, 2));
        throw new Error('Resposta vazia da API OpenAI');
      }

      const analysisResult = JSON.parse(content);

      if (typeof analysisResult !== 'object' || analysisResult === null) {
        throw new Error('A resposta da API não é um JSON válido.');
      }

      console.log(`✅ [API-${Date.now() - apiStartTime}ms] Analysis completed. Total API time: ${Date.now() - apiStartTime}ms`);
      
      return analysisResult;

    } catch (error) {
      console.log(`❌ [API-${Date.now() - apiStartTime}ms] Network or parsing error:`, error);
      if (error instanceof SyntaxError) {
        throw new Error("Falha ao analisar a resposta da API. Não era um JSON válido.");
      }
      throw error;
    }
  }

  // Obtém modificações da IA usando OpenAI API GPT-5
  static async getAIModifications(designAnalysis: any, prompt: string, types: string[], apiKey: string) {
    const apiStartTime = Date.now();
    console.log(`🤖 [API-${apiStartTime}] Starting design modification with GPT-5...`);
    
    const systemPrompt = `You are an expert UI/UX designer and developer. You will receive design data from Figma and a user prompt for modifications.

Your task is to analyze the design elements and provide specific modification instructions that can be applied programmatically.

CRITICAL RULES FOR COLOR MODIFICATIONS:
- ONLY suggest color modifications for elements that already have colors applied (hasColor: true)
- NEVER add colors to elements that don't already have fills or strokes
- Look for the "hasColor" property and "colors" array in each element
- If an element has hasColor: false or empty colors array, DO NOT suggest color changes for it
- Only modify existing fills and strokes, never create new ones

CRITICAL RULES FOR TEXT FORMATTING PRESERVATION:
- ALWAYS preserve the original text formatting and structure
- If the original text has \\n (line breaks), maintain them in the new text
- If the original text has multiple paragraphs separated by \\n, keep that structure
- If the original text is a single line, keep the new text as a single line
- Match the formatting style: if original has numbered steps with \\n, maintain that pattern
- Preserve any intentional text structure like lists, steps, or multi-line instructions

IMPORTANT FORMATTING RULES:
- For text modifications: "newValue" must be a plain string (not an object)
- For text with line breaks: maintain \\n characters in the exact same structural pattern
- For color modifications: use "action": "replace" and provide hex colors like "#FF6B6B" 
- Only suggest modifications for element IDs that actually exist in the provided data
- Do not create fake element IDs like "new:001" - only modify existing elements

Return your response as JSON with this structure:
{
  "modifications": [
    {
      "elementId": "actual_element_id_from_data",
      "type": "text|color|layout|style",
      "action": "replace|modify",
      "currentValue": "current value description",
      "newValue": "new_text_preserving_original_\\n_structure_OR_#HEX_COLOR_for_colors"
    }
  ],
  "summary": "Overall description of changes"
}

Example valid modifications:
- Text (single line): {"elementId": "18:249", "type": "text", "action": "replace", "newValue": "Dar a pata"}
- Text (with line breaks): {"elementId": "18:250", "type": "text", "action": "replace", "newValue": "Step 1: Sit command\\nStep 2: Raise hand\\nStep 3: Give treat"}
- Color (ONLY if hasColor: true): {"elementId": "18:245", "type": "color", "action": "replace", "newValue": "#F3E8FF"}

Modification types you can suggest:
- text: Change text content ONLY (newValue must be plain string with preserved \\n structure)
- color: Change existing fill/stroke colors ONLY for elements with hasColor: true (newValue must be hex color like #FF6B6B)
- layout: Change position, size, spacing
- style: Change border radius, effects, etc.

Be specific and actionable. Only suggest modifications for elements that exist in the provided data and respect the hasColor constraint for color modifications.`;

    const inputMessage = `${systemPrompt}

Design Analysis:
${JSON.stringify(designAnalysis, null, 2)}

User Request: ${prompt}

Modification Types Requested: ${types.join(', ')}

Please provide specific modifications to achieve the user's request.`;

    const requestBody = {
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: inputMessage
        }
      ],
      response_format: { type: "json_object" },
      verbosity: "low",
      reasoning_effort: "minimal"
    };

    console.log(`📤 [API-${Date.now() - apiStartTime}ms] Sending request to OpenAI Chat Completions API...`);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`📥 [API-${Date.now() - apiStartTime}ms] Response status:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ [API-${Date.now() - apiStartTime}ms] Error response body:`, errorText);
        
        let userFriendlyError = `OpenAI API error (${response.status})`;
        if (response.status === 401) {
          userFriendlyError = 'Chave API inválida. Verifique suas credenciais.';
        } else if (response.status === 429) {
          userFriendlyError = 'Limite de taxa excedido. Tente novamente em alguns minutos.';
        } else if (response.status >= 500) {
          userFriendlyError = 'Erro do servidor OpenAI. Tente novamente mais tarde.';
        } else if (response.status === 400) {
          userFriendlyError = 'Requisição inválida. Verifique os dados enviados.';
        }
        
        throw new Error(`${userFriendlyError}: ${errorText}`);
      }

      const data = await response.json() as any;
      console.log(`✅ [API-${Date.now() - apiStartTime}ms] GPT-5 returned data`);

      // Log token usage for GPT-5
      if (data.usage) {
        console.log(`📊 [GPT-5 TOKENS] Input: ${data.usage.prompt_tokens} | Output: ${data.usage.completion_tokens} | Total: ${data.usage.total_tokens}`);
        
        // Calculate cost estimation (GPT-5 pricing - real prices from OpenAI)
        const inputCost = (data.usage.prompt_tokens / 1000000) * 1.25; // $1.25 per 1M input tokens
        const outputCost = (data.usage.completion_tokens / 1000000) * 10.00; // $10.00 per 1M output tokens
        
        // Check for cached tokens
        let cachedCost = 0;
        if (data.usage.prompt_tokens_details?.cached_tokens) {
          cachedCost = (data.usage.prompt_tokens_details.cached_tokens / 1000000) * 0.125; // $0.125 per 1M cached tokens
          console.log(`💾 [CACHED] ${data.usage.prompt_tokens_details.cached_tokens} tokens cached`);
        }
        
        const totalCost = inputCost + outputCost + cachedCost;
        console.log(`💰 [COST] Input: $${inputCost.toFixed(6)} | Output: $${outputCost.toFixed(6)} | Cached: $${cachedCost.toFixed(6)} | Total: $${totalCost.toFixed(6)}`);
      }

      // Extract content from Chat Completions API
      const content = data.choices?.[0]?.message?.content;
      const finishReason = data.choices?.[0]?.finish_reason;
      
      console.log(`🔍 [DEBUG] Raw content from GPT-5:`, content);
      console.log(`🔍 [DEBUG] Content type:`, typeof content);
      console.log(`🔍 [DEBUG] Content length:`, content ? content.length : 'null/undefined');
      console.log(`🔍 [DEBUG] Finish reason:`, finishReason);
      console.log(`🔍 [DEBUG] Choices array:`, data.choices);
      
      if (finishReason === 'length') {
        throw new Error('GPT-5 atingiu o limite de tokens. Tente uma análise mais simples ou aumente o limite de tokens.');
      }
      
      if (!content || content.trim() === '') {
        console.log(`❌ [DEBUG] Content is empty or null. Full response data:`, JSON.stringify(data, null, 2));
        throw new Error('Resposta vazia da API OpenAI');
      }

      const modificationsJson = JSON.parse(content);

      if (typeof modificationsJson !== 'object' || modificationsJson === null) {
        throw new Error('A resposta da API não é um JSON válido.');
      }

      console.log(`✅ [API-${Date.now() - apiStartTime}ms] Modifications completed. Total API time: ${Date.now() - apiStartTime}ms`);
      
      // Return both modifications and token usage
      return {
        modifications: modificationsJson,
        tokenUsage: data.usage || null
      };

    } catch (error) {
      console.log(`❌ [API-${Date.now() - apiStartTime}ms] Network or parsing error:`, error);
      if (error instanceof SyntaxError) {
        throw new Error("Falha ao analisar a resposta da API. Não era um JSON válido.");
      }
      throw error;
    }
  }
}
