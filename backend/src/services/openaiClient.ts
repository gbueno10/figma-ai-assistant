import OpenAI from 'openai';

const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;

export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    ...(OPENAI_BASE_URL ? { baseURL: OPENAI_BASE_URL } : {}),
  });
}

export function handleOpenAIError(error: unknown): never {
  if (error instanceof OpenAI.APIError) {
    const status = error.status;
    const detail = error.message ?? 'Unknown error returned by OpenAI.';

    if (status === 401) {
      throw new Error(`OpenAI authentication failed (401). ${detail}`);
    }

    if (status === 429) {
      throw new Error(`OpenAI rate limit exceeded (429). ${detail}`);
    }

    if (status === 400) {
      throw new Error(`OpenAI rejected the request (400). ${detail}`);
    }

    if (typeof status === 'number' && status >= 500) {
      throw new Error(`OpenAI server error (${status}). ${detail}`);
    }

    throw new Error(`OpenAI request failed${status ? ` (${status})` : ''}: ${detail}`);
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error('Unknown error while communicating with OpenAI');
}
