export function resolveApiKey(providedKey?: string): string {
  const key = providedKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      'OpenAI API key not provided. Supply it in the request body as "apiKey" or set OPENAI_API_KEY in the environment.'
    );
  }
  return key;
}
