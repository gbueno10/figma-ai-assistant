import { Router } from 'express';
import {
  analyzeImagePrompt,
  editImage,
  generateImage,
  regenerateImage,
  generateVideo,
} from '../services/imageService';

const router = Router();

router.post('/generate', async (req, res, next) => {
  try {
    const { prompt, size, transparent, apiKey, runwareApiKey, model } = req.body ?? {};

    console.log('[Images][generate] Incoming request', {
      promptLength: typeof prompt === 'string' ? prompt.length : 'invalid',
      size,
      transparent: Boolean(transparent),
      providedApiKey: Boolean(apiKey),
      providedRunwareApiKey: Boolean(runwareApiKey),
    });

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Field "prompt" is required and must be a string.' });
    }

    const result = await generateImage({
      prompt,
      size,
      transparent: Boolean(transparent),
      apiKey,
      runwareApiKey,
      model,
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
    const { imageBase64, apiKey, model } = req.body ?? {};

    console.log('[Images][analyze] Incoming request', {
      imageLength: typeof imageBase64 === 'string' ? imageBase64.length : 'invalid',
      providedApiKey: Boolean(apiKey),
      model: model || 'default',
    });

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Field "imageBase64" is required and must be a base64 string.' });
    }

    const prompt = await analyzeImagePrompt(imageBase64, apiKey, model);
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
    const { imageBase64, prompt, size, apiKey, runwareApiKey, model } = req.body ?? {};

    console.log('[Images][regenerate] Incoming request', {
      imageLength: typeof imageBase64 === 'string' ? imageBase64.length : 'invalid',
      promptProvided: Boolean(prompt),
      size,
      providedApiKey: Boolean(apiKey),
      providedRunwareApiKey: Boolean(runwareApiKey),
    });

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Field "imageBase64" is required and must be a base64 string.' });
    }

    const result = await regenerateImage({
      imageBase64,
      prompt,
      size,
      apiKey,
      runwareApiKey,
      model,
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
    const { imageBase64, prompt, size, apiKey, runwareApiKey, totalImages, imageIndex, nodeName, model } = req.body ?? {};

    console.log('[Images][edit] Incoming request', {
      imageLength: typeof imageBase64 === 'string' ? imageBase64.length : 'invalid',
      promptLength: typeof prompt === 'string' ? prompt.length : 'invalid',
      size,
      providedApiKey: Boolean(apiKey),
      providedRunwareApiKey: Boolean(runwareApiKey),
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
      runwareApiKey,
      totalImages,
      imageIndex,
      nodeName,
      model,
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

router.post('/video', async (req, res, next) => {
  try {
    const { prompt, apiKey, runwareApiKey } = req.body ?? {};

    console.log('[Images][video] Incoming request', {
      promptLength: typeof prompt === 'string' ? prompt.length : 'invalid',
      providedApiKey: Boolean(apiKey),
      providedRunwareApiKey: Boolean(runwareApiKey),
    });

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Field "prompt" is required and must be a string.' });
    }

    const result = await generateVideo({
      prompt,
      apiKey,
      runwareApiKey,
    });

    console.log('[Images][video] Completed', {
      videoURL: result?.videoURL,
    });

    res.json(result);
  } catch (error) {
    console.error('[Images][video] Failed', error);
    next(error);
  }
});

export default router;
