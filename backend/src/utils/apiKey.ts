export function resolveApiKey(providedKey?: string): string {
  const key = providedKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      'OpenAI API key not provided. Supply it in the request body as "apiKey" or set OPENAI_API_KEY in the environment.'
    );
  }
  return key;
}

export function validateKeys(): void {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('WARNING: OPENAI_API_KEY is not set.');
  }
  if (!process.env.RUNWARE_API_KEY) {
    console.warn('WARNING: RUNWARE_API_KEY is not set.');
  }

  if (!process.env.OPENAI_API_KEY && !process.env.RUNWARE_API_KEY) {
    throw new Error('Neither OPENAI_API_KEY nor RUNWARE_API_KEY are provided.');
  }
}
