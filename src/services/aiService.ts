import { postToBackend } from './backendClient';

interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details?: {
    cached_tokens?: number;
  };
}

interface AnalyzeDesignResponse {
  result: unknown;
  tokenUsage?: TokenUsage;
}

interface ModificationResponse {
  modifications: unknown;
  tokenUsage?: TokenUsage;
}

export class AIService {
  static async sendToAI(screenshot: string, structure: unknown, apiKey?: string): Promise<AnalyzeDesignResponse> {
    console.log('🤖 Forwarding design analysis request to backend service...');
    const response = await postToBackend<AnalyzeDesignResponse>('/design/analysis', {
      screenshot,
      structure,
      apiKey,
    });
    console.log('✅ Backend returned design analysis result');
    return response;
  }

  static async getAIModifications(
    designAnalysis: unknown,
    prompt: string,
    types: string[],
    apiKey?: string
  ): Promise<ModificationResponse> {
    console.log('🤖 Forwarding design modification request to backend service...');
    const response = await postToBackend<ModificationResponse>('/design/modifications', {
      designAnalysis,
      prompt,
      types,
      apiKey,
    });
    console.log('✅ Backend returned AI modifications');
    return response;
  }
}
