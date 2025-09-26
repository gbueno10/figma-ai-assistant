// Serviço para comunicação com APIs de IA
import OpenAI from "openai";

export class AIService {
  
  // Envia dados para a IA (integração real com OpenAI)
  static async sendToAI(screenshot: string, structure: any, apiKey: string): Promise<any> {
    const apiStartTime = Date.now();
    console.log(`🤖 [API-${apiStartTime}] Starting design analysis with OpenAI...`);
    
    const client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Necessário para ambiente Figma
    });
    
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

    console.log(`📤 [API-${Date.now() - apiStartTime}ms] Sending request to OpenAI Responses API...`);

    try {
      const response = await client.responses.create({
        model: "gpt-5",
        input: inputMessage,
        text: {
          format: { type: "json_object" }
        }
      });

      console.log(`✅ [API-${Date.now() - apiStartTime}ms] GPT-5 returned data`);

      // Extract content from Responses API
      const contentRaw = response.output_text;

      if (!contentRaw || contentRaw.trim() === '') {
        throw new Error('Resposta vazia da API OpenAI');
      }

      const analysisResult = JSON.parse(contentRaw);

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

  // Obtém modificações da IA usando OpenAI API
  static async getAIModifications(designAnalysis: any, prompt: string, types: string[], apiKey: string) {
    const apiStartTime = Date.now();
    console.log(`🤖 [API-${apiStartTime}] Starting design modification with GPT-5...`);
    
    const client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Necessário para ambiente Figma
    });
    
    const systemPrompt = `You are an expert UI/UX designer and developer. You will receive design data from Figma and a user prompt for modifications.

Your task is to analyze the design elements and provide specific modification instructions that can be applied programmatically.

CRITICAL RULES FOR COLOR MODIFICATIONS:
- ONLY suggest color modifications for elements that already have colors applied (hasColor: true)
- NEVER add colors to elements that don't already have fills or strokes
- Look for the "hasColor" property and "colors" array in each element
- If an element has hasColor: false or empty colors array, DO NOT suggest color changes for it
- Only modify existing fills and strokes, never create new ones

IMPORTANT FORMATTING RULES:
- For text modifications: "newValue" must be a plain string (not an object)
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
      "newValue": "new_text_as_string_for_text_OR_#HEX_COLOR_for_colors",
      "reasoning": "why this change"
    }
  ],
  "summary": "Overall description of changes"
}

Example valid modifications:
- Text: {"elementId": "18:249", "type": "text", "action": "replace", "newValue": "Dar a pata"}
- Color (ONLY if hasColor: true): {"elementId": "18:245", "type": "color", "action": "replace", "newValue": "#F3E8FF"}

Modification types you can suggest:
- text: Change text content ONLY (newValue must be plain string)
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

    console.log(`📤 [API-${Date.now() - apiStartTime}ms] Sending request to OpenAI Responses API...`);

    try {
      const response = await client.responses.create({
        model: "gpt-5",
        input: inputMessage,
        text: {
          format: { type: "json_object" }
        }
      });

      console.log(`✅ [API-${Date.now() - apiStartTime}ms] GPT-5 returned data`);

      // Extract modification content from Responses API
      const modificationContentRaw = response.output_text;

      if (!modificationContentRaw || modificationContentRaw.trim() === '') {
        throw new Error('Resposta vazia da API OpenAI');
      }

      const modificationsJson = JSON.parse(modificationContentRaw);

      if (typeof modificationsJson !== 'object' || modificationsJson === null) {
        throw new Error('A resposta da API não é um JSON válido.');
      }

      console.log(`✅ [API-${Date.now() - apiStartTime}ms] Modifications completed. Total API time: ${Date.now() - apiStartTime}ms`);
      
      return modificationsJson;

    } catch (error) {
      console.log(`❌ [API-${Date.now() - apiStartTime}ms] Network or parsing error:`, error);
      if (error instanceof SyntaxError) {
        throw new Error("Falha ao analisar a resposta da API. Não era um JSON válido.");
      }
      throw error;
    }
  }
}
