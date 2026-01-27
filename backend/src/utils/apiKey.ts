export function resolveApiKey(providedKey?: string, envVar: string = 'OPENAI_API_KEY'): string {
  const key = providedKey || process.env[envVar];
  if (!key) {
    throw new Error(
      `${envVar} not provided. Supply it in the request body as "apiKey" or set it in the environment.`
    );
  }
  return key;
}

export function validateKeys(): void {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasRunware = Boolean(process.env.RUNWARE_API_KEY);

  if (!hasOpenAI) {
    console.warn('⚠️ WARNING: OPENAI_API_KEY is not set. OpenAI-dependent features will fail.');
  }
  if (!hasRunware) {
    console.warn('⚠️ WARNING: RUNWARE_API_KEY is not set. Image generation features will fail.');
  }

  if (!hasOpenAI && !hasRunware) {
    throw new Error('Neither OPENAI_API_KEY nor RUNWARE_API_KEY are provided.');
  }

  console.log('✅ API key validation passed.');
}
