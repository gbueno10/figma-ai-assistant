import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { resolveApiKey } from '../utils/apiKey';
import { createOpenAIClient, handleOpenAIError } from './openaiClient';

interface ChatCompletionMessage {
  role: string;
  content?: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface ChatCompletionChoice {
  message?: ChatCompletionMessage;
  finish_reason?: string;
}

interface UsageDetails {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details?: {
    cached_tokens?: number;
  };
}

interface ChatCompletionResponse {
  choices?: ChatCompletionChoice[];
  usage?: UsageDetails;
}

interface AnalyzeDesignInput {
  screenshot: string;
  structure: unknown;
  apiKey?: string;
}

interface AnalyzeDesignOutput {
  result: unknown;
  tokenUsage?: UsageDetails;
}

interface DesignModificationInput {
  designAnalysis: unknown;
  prompt: string;
  types: string[];
  apiKey?: string;
}

interface DesignModificationOutput {
  modifications: unknown;
  tokenUsage?: UsageDetails;
}

export async function analyzeDesign({
  screenshot,
  structure,
  apiKey,
}: AnalyzeDesignInput): Promise<AnalyzeDesignOutput> {
  const key = resolveApiKey(apiKey);

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

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: [
        {
          type: 'text',
          text: systemPrompt,
        },
      ],
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: inputMessage,
        },
        {
          type: 'image_url',
          image_url: {
            url: screenshot,
          },
        },
      ],
    },
  ];

  const payload = {
    model: 'gpt-5',
    messages,
    response_format: { type: 'json_object' as const },
  };

  const client = createOpenAIClient(key);

  try {
    const response = (await client.chat.completions.create(payload)) as ChatCompletionResponse;
    const content = response.choices?.[0]?.message?.content;
    const finishReason = response.choices?.[0]?.finish_reason;

    if (finishReason === 'length') {
      throw new Error('GPT-5 atingiu o limite de tokens. Tente uma análise mais simples ou aumente o limite de tokens.');
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Resposta vazia da API OpenAI');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      throw new Error('Falha ao analisar a resposta da API. Não era um JSON válido.');
    }

    return { result: parsed, tokenUsage: response.usage };
  } catch (error) {
    handleOpenAIError(error);
  }

  throw new Error('Unhandled OpenAI error during design analysis.');
}

export async function requestDesignModifications({
  designAnalysis,
  prompt,
  types,
  apiKey,
}: DesignModificationInput): Promise<DesignModificationOutput> {
  const key = resolveApiKey(apiKey);

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
      "elementId": "id do elemento no Figma",
      "elementName": "nome do elemento",
      "elementType": "TEXT|FRAME|RECTANGLE|ELLIPSE|VECTOR|COMPONENT|INSTANCE|GROUP|LINE|BOOLEAN_OPERATION",
      "type": "text|color|layout|style",
      "action": "replace|update|adjust|apply",
      "property": "characters|fills|strokes|layoutMode|padding|cornerRadius|opacity|shadow|other properties",
      "currentValue": "valor atual (string ou JSON)",
      "newValue": "novo valor proposto (string ou JSON)",
      "reasoning": "explicação detalhada da modificação",
      "confidence": 0.85,
      "priority": "high|medium|low"
    }
  ],
  "metadata": {
    "typesProcessed": ["text", "color"],
    "prompt": "prompt original do usuário",
    "analysisSummary": "resumo da análise do design"
  }
}

RULES FOR TYPES FILTER:
- Only return modifications matching the types array provided: ${JSON.stringify(types)}
- If types includes "text", include text modifications
- If types includes "color", include color modifications
- If types includes "layout", include layout modifications
- If types includes "style", include style modifications
- Ignore (do not include) any modifications that don't match the requested types`;

  const userMessage = `User prompt: ${prompt}

Design data:
${JSON.stringify(designAnalysis, null, 2)}`;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: [
        {
          type: 'text',
          text: systemPrompt,
        },
      ],
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: userMessage,
        },
      ],
    },
  ];

  const payload = {
    model: 'gpt-5',
    messages,
    response_format: { type: 'json_object' as const },
  };

  const client = createOpenAIClient(key);

  try {
    const response = (await client.chat.completions.create(payload)) as ChatCompletionResponse;
    const content = response.choices?.[0]?.message?.content;
    const finishReason = response.choices?.[0]?.finish_reason;

    if (finishReason === 'length') {
      throw new Error('GPT-5 atingiu o limite de tokens. Tente uma análise mais simples ou aumente o limite de tokens.');
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Resposta vazia da API OpenAI');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      throw new Error('Falha ao analisar a resposta da API. Não era um JSON válido.');
    }

    const modifications = parsed?.modifications ?? parsed;

    return {
      modifications,
      tokenUsage: response.usage,
    };
  } catch (error) {
    handleOpenAIError(error);
  }

  throw new Error('Unhandled OpenAI error during design modification.');
}
