import { Buffer } from 'node:buffer';
import { runwareService } from './runwareService';
import axios from 'axios';

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
  runwareApiKey?: string;
  model?: string;
}

interface ImageGenerationOutput {
  base64: string;
}

interface ImageRegenerationInput {
  imageBase64: string;
  prompt?: string;
  size?: SupportedImageSize | null;
  apiKey?: string;
  runwareApiKey?: string;
  model?: string;
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
  runwareApiKey?: string;
  totalImages?: number;
  imageIndex?: number;
  nodeName?: string;
  model?: string;
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
  runwareApiKey,
  model = 'runware:100@1',
}: ImageGenerationInput): Promise<ImageGenerationOutput> {
  const adjustedPrompt = transparent
    ? `${prompt}, isolated subject, transparent background`
    : prompt;

  try {
    // All image generation is now routed through Runware
    console.log(`🎨 Generating image via Runware. Model: ${model}, Prompt: ${adjustedPrompt.substring(0, 50)}...`);

    const images = await runwareService.generateImage(adjustedPrompt, size ?? '1024x1024', model, runwareApiKey);
    const image = Array.isArray(images) ? images[0] : undefined;

    if (!image || !image.imageURL) {
      throw new Error('Runware SDK did not return image data.');
    }

    // Convert URL to base64 to maintain compatibility with the frontend
    const response = await axios.get(image.imageURL, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data as any, 'binary').toString('base64');

    return { base64 };
  } catch (error) {
    console.error('Runware generation error:', error);
    throw new Error('Failed to generate image using Runware.');
  }
}

export async function analyzeImagePrompt(
  imageBase64: string,
  apiKey?: string
): Promise<string> {
  try {
    console.log('🔍 Analyzing image via Runware Vision...');
    const description = await runwareService.requestImageToText(imageBase64, apiKey);

    if (!description) {
      throw new Error('Runware did not return a description for the image.');
    }

    return description;
  } catch (error) {
    console.error('Runware analysis error:', error);
    throw new Error('Failed to analyze image using Runware.');
  }
}

export async function regenerateImage({
  imageBase64,
  prompt,
  size = '1024x1024',
  apiKey,
  runwareApiKey,
  model,
}: ImageRegenerationInput): Promise<ImageRegenerationOutput> {
  const promptToUse = prompt && prompt.trim().length > 0
    ? prompt
    : await analyzeImagePrompt(imageBase64, runwareApiKey);

  const { base64 } = await generateImage({
    prompt: promptToUse,
    size,
    transparent: false,
    apiKey,
    runwareApiKey,
    model,
  });

  return { base64, promptUsed: promptToUse };
}

export async function editImage({
  imageBase64,
  prompt,
  size = '1024x1024',
  apiKey,
  runwareApiKey,
  totalImages,
  imageIndex,
  nodeName,
  model,
}: ImageEditInput): Promise<ImageEditOutput> {
  try {
    console.log(`🖌️ Editing image via Runware Image-to-Image. Prompt: ${prompt.substring(0, 50)}...`);

    // Using generateImage with inputImage for Image-to-Image flow
    const images = await runwareService.generateImage(
      prompt,
      size ?? '1024x1024',
      model,
      runwareApiKey,
      imageBase64
    );

    const image = Array.isArray(images) ? images[0] : undefined;

    if (!image || !image.imageURL) {
      throw new Error('Runware SDK did not return image data for edit.');
    }

    const response = await axios.get(image.imageURL, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data as any, 'binary').toString('base64');

    return { base64 };
  } catch (error) {
    console.error('Runware edit error:', error);
    throw new Error('Failed to edit image using Runware.');
  }
}

export async function generateVideo({
  prompt,
  apiKey,
  runwareApiKey,
}: { prompt: string; apiKey?: string; runwareApiKey?: string }): Promise<{ videoURL: string }> {
  try {
    const response = await runwareService.generateVideo(prompt, runwareApiKey);
    const result = Array.isArray(response) ? response[0] : undefined;
    const videoURL = (result as any)?.videoURL;

    if (!videoURL) {
      throw new Error('Runware SDK did not return video URL.');
    }

    return { videoURL };
  } catch (error) {
    console.error('Runware video error:', error);
    throw new Error('Failed to generate video using Runware.');
  }
}

// detectMime and createImageFile removed as they were OpenAI specific
