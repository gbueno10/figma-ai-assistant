import { Router } from 'express';
import {
  analyzeImagePrompt,
  editImage,
  generateImage,
  regenerateImage,
} from '../services/imageService';

const router = Router();

router.post('/generate', async (req, res, next) => {
  try {
    const { prompt, size, transparent, apiKey } = req.body ?? {};

    console.log('[Images][generate] Incoming request', {
      promptLength: typeof prompt === 'string' ? prompt.length : 'invalid',
      size,
      transparent: Boolean(transparent),
      providedApiKey: Boolean(apiKey),
    });

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Field "prompt" is required and must be a string.' });
    }

    const result = await generateImage({
      prompt,
      size,
      transparent: Boolean(transparent),
      apiKey,
    });

    console.log('[Images][generate] Completed', {
      hasBase64: Boolean(result?.base64),
    });

    res.json(result);
  } catch (error) {
    console.error('[Images][generate] Failed', error);
    next(error);
  }
});

router.post('/analyze', async (req, res, next) => {
  try {
    const { imageBase64, apiKey } = req.body ?? {};

    console.log('[Images][analyze] Incoming request', {
      imageLength: typeof imageBase64 === 'string' ? imageBase64.length : 'invalid',
      providedApiKey: Boolean(apiKey),
    });

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Field "imageBase64" is required and must be a base64 string.' });
    }

    const prompt = await analyzeImagePrompt(imageBase64, apiKey);
    console.log('[Images][analyze] Completed', {
      promptLength: prompt.length,
    });
    res.json({ prompt });
  } catch (error) {
    console.error('[Images][analyze] Failed', error);
    next(error);
  }
});

router.post('/regenerate', async (req, res, next) => {
  try {
    const { imageBase64, prompt, size, apiKey } = req.body ?? {};

    console.log('[Images][regenerate] Incoming request', {
      imageLength: typeof imageBase64 === 'string' ? imageBase64.length : 'invalid',
      promptProvided: Boolean(prompt),
      size,
      providedApiKey: Boolean(apiKey),
    });

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Field "imageBase64" is required and must be a base64 string.' });
    }

    const result = await regenerateImage({
      imageBase64,
      prompt,
      size,
      apiKey,
    });

    console.log('[Images][regenerate] Completed', {
      hasBase64: Boolean(result?.base64),
      promptUsedLength: result?.promptUsed?.length,
    });

    res.json(result);
  } catch (error) {
    console.error('[Images][regenerate] Failed', error);
    next(error);
  }
});

router.post('/edit', async (req, res, next) => {
  try {
    const { imageBase64, prompt, size, apiKey, totalImages, imageIndex, nodeName } = req.body ?? {};

    console.log('[Images][edit] Incoming request', {
      imageLength: typeof imageBase64 === 'string' ? imageBase64.length : 'invalid',
      promptLength: typeof prompt === 'string' ? prompt.length : 'invalid',
      size,
      providedApiKey: Boolean(apiKey),
      totalImages,
      imageIndex,
      nodeName,
    });

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Field "imageBase64" is required and must be a base64 string.' });
    }

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Field "prompt" is required and must be a string.' });
    }

    const result = await editImage({
      imageBase64,
      prompt,
      size,
      apiKey,
      totalImages,
      imageIndex,
      nodeName,
    });

    console.log('[Images][edit] Completed', {
      hasBase64: Boolean(result?.base64),
      totalImages,
      imageIndex,
      nodeName,
    });

    res.json(result);
  } catch (error) {
    console.error('[Images][edit] Failed', error);
    next(error);
  }
});

export default router;
