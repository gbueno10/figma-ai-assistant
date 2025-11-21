// backend/src/services/namingService.ts
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { resolveApiKey } from '../utils/apiKey';
import { createOpenAIClient, handleOpenAIError } from './openaiClient';

export async function generateDogFilename(
  userPrompt: string, 
  apiKey?: string
): Promise<string> {
  const key = resolveApiKey(apiKey);
  const client = createOpenAIClient(key);

  const systemPrompt = `
    You are a strict file naming assistant. Convert the user's image prompt into a specific filename convention.
    
    Target Format: AI_dog_{age}_{color}_{action}
    
    Rules for parameters:
    1. {age}: Detect if it is 'puppy' or 'adult'. If not specified, default to 'adult'.
    2. {color}: Detect the main color (e.g., golden, black, white, brown, mixed). If not specified, use 'mixed'.
    3. {action}: Detect the position or action (e.g., sitting, running, sleeping, portrait). If not specified, use 'portrait'.
    
    Constraints:
    - Output ONLY the string. No markdown, no extension.
    - Lowercase only.
    - Use underscores (_) as separators.
    - Do not add extra words outside the format.
    
    Examples:
    Input: "A cute white husky puppy sleeping" -> Output: AI_dog_puppy_white_sleeping
    Input: "An angry black dog barking" -> Output: AI_dog_adult_black_barking
  `;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o', 
      messages,
      max_tokens: 50,
      temperature: 0.1,
    });

    let filename = response.choices[0]?.message?.content?.trim();
    
    // Fallback de segurança
    if (!filename) filename = 'AI_dog_adult_mixed_portrait';
    
    // Sanitização extra para garantir que é um nome de arquivo válido
    return filename.replace(/[^a-z0-9_]/gi, '_');

  } catch (error) {
    console.error('Naming generation failed:', error);
    return 'AI_dog_adult_mixed_generated';
  }
}
