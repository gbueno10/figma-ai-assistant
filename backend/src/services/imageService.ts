import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { Buffer } from 'node:buffer';
import { toFile, type FileLike } from 'openai/uploads';
import { resolveApiKey } from '../utils/apiKey';
import { createOpenAIClient, handleOpenAIError } from './openaiClient';

type SupportedImageSize =
  | 'auto'
  | '256x256'
  | '512x512'
  | '1024x1024'
  | '1536x1024'
  | '1024x1536';

interface ImageGenerationInput {
  prompt: string;
  size?: SupportedImageSize | null;
  transparent?: boolean;
  apiKey?: string;
}

interface ImageGenerationOutput {
  base64: string;
}

interface ImageRegenerationInput {
  imageBase64: string;
  prompt?: string;
  size?: SupportedImageSize | null;
  apiKey?: string;
}

interface ImageRegenerationOutput {
  base64: string;
  promptUsed: string;
}

interface ImageEditInput {
  imageBase64: string;
  prompt: string;
  size?: SupportedImageSize | null;
  apiKey?: string;
  totalImages?: number;
  imageIndex?: number;
  nodeName?: string;
}

interface ImageEditOutput {
  base64: string;
}

interface ImageGenerationResponse {
  data?: Array<{
    b64_json?: string;
    url?: string;
  }>;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export async function generateImage({
  prompt,
  size = '1024x1024',
  transparent = false,
  apiKey,
}: ImageGenerationInput): Promise<ImageGenerationOutput> {
  const key = resolveApiKey(apiKey);
  const adjustedPrompt = transparent
    ? `${prompt}, isolated subject, transparent background`
    : prompt;

  const client = createOpenAIClient(key);

  try {
    const sizeParam = size ?? undefined;
    const response = (await client.images.generate({
      model: 'gpt-image-1',
      prompt: adjustedPrompt,
      size: sizeParam,
      ...(transparent ? { background: 'transparent' as const } : {}),
    })) as ImageGenerationResponse;
    const base64 = response.data?.[0]?.b64_json;

    if (!base64) {
      throw new Error('OpenAI API did not return image base64 data.');
    }

    return { base64 };
  } catch (error) {
    handleOpenAIError(error);
  }

  throw new Error('Unhandled OpenAI error during image generation.');
}

export async function analyzeImagePrompt(
  imageBase64: string,
  apiKey?: string
): Promise<string> {
  const key = resolveApiKey(apiKey);
  const systemPrompt = `You are an expert image analyst. Analyze the provided image and create a detailed, creative prompt that could be used to regenerate a similar image using DALL-E.

Focus on:
- Main subject and composition
- Art style and visual aesthetic
- Colors and lighting
- Mood and atmosphere
- Important details and elements

Return a single, well-crafted prompt (not JSON) that captures the essence of the image for regeneration.`;

  const client = createOpenAIClient(key);

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
          text: 'Analyze this image and create a detailed prompt for regenerating a similar image:',
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/png;base64,${imageBase64}`,
          },
        },
      ],
    },
  ];

  try {
    const response = (await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
    })) as ChatCompletionResponse;
    const prompt = response.choices?.[0]?.message?.content?.trim();

    if (!prompt) {
      throw new Error('Falha ao gerar prompt da análise da imagem');
    }

    return prompt;
  } catch (error) {
    handleOpenAIError(error);
  }

  throw new Error('Unhandled OpenAI error during image analysis.');
}

export async function regenerateImage({
  imageBase64,
  prompt,
  size = '1024x1024',
  apiKey,
}: ImageRegenerationInput): Promise<ImageRegenerationOutput> {
  const key = resolveApiKey(apiKey);
  const promptToUse = prompt && prompt.trim().length > 0
    ? prompt
    : await analyzeImagePrompt(imageBase64, key);

  const { base64 } = await generateImage({
    prompt: promptToUse,
    size,
    transparent: false,
    apiKey: key,
  });

  return { base64, promptUsed: promptToUse };
}

export async function editImage({
  imageBase64,
  prompt,
  size = '1024x1024',
  apiKey,
  totalImages,
  imageIndex,
  nodeName,
}: ImageEditInput): Promise<ImageEditOutput> {
  const key = resolveApiKey(apiKey);

  const client = createOpenAIClient(key);

  const imageFile = await createImageFile(imageBase64);

  if (typeof totalImages === 'number' || typeof imageIndex === 'number') {
    const position = typeof totalImages === 'number' && typeof imageIndex === 'number'
      ? `${imageIndex}/${totalImages}`
      : imageIndex ?? totalImages;
    console.log('[Images][edit] Processing image', {
      position,
      nodeName,
    });
  }

  try {
    const sizeParam = size ?? undefined;
    const response = (await client.images.edit({
      model: 'gpt-image-1',
      image: imageFile,
      prompt,
      n: 1,
      size: sizeParam,
    })) as ImageGenerationResponse;
    const base64 = response.data?.[0]?.b64_json;

    if (!base64) {
      throw new Error('OpenAI API did not return edited image base64 data.');
    }

    return { base64 };
  } catch (error) {
    handleOpenAIError(error);
  }

  throw new Error('Unhandled OpenAI error during image edit.');
}

async function createImageFile(imageBase64: string): Promise<FileLike> {
  const base64Payload = imageBase64.includes(',')
    ? imageBase64.split(',')[1] ?? ''
    : imageBase64;
  const sanitizedBase64 = base64Payload.trim().replace(/\s+/g, '');
  const buffer = Buffer.from(sanitizedBase64, 'base64');

  if (buffer.length === 0) {
    throw new Error('Imagem vazia fornecida para edição.');
  }

  const mime = detectMime(buffer);
  if (!mime) {
    throw new Error('Formato de imagem não suportado. Envie PNG, JPEG ou WEBP.');
  }

  const extension = mime.split('/')[1];
  return toFile(buffer, `image.${extension}`, { type: mime });
}

function detectMime(buffer: Buffer): 'image/png' | 'image/jpeg' | 'image/webp' | null {
  const pngSignature = Buffer.from('89504e470d0a1a0a', 'hex');
  if (buffer.slice(0, 8).equals(pngSignature)) {
    return 'image/png';
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    buffer.length >= 12 &&
    buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
    buffer.slice(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }

  return null;
}
