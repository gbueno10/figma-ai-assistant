import { Router } from 'express';
import { analyzeDesign, requestDesignModifications } from '../services/designService';

const router = Router();

router.post('/analysis', async (req, res, next) => {
  try {
    const { screenshot, structure, apiKey } = req.body ?? {};

    console.log('[Design][analysis] Incoming request', {
      screenshotLength: typeof screenshot === 'string' ? screenshot.length : 'invalid',
      hasStructure: typeof structure !== 'undefined',
      providedApiKey: Boolean(apiKey),
    });

    if (!screenshot || typeof screenshot !== 'string') {
      return res.status(400).json({ error: 'Field "screenshot" (base64 image string) is required.' });
    }

    if (typeof structure === 'undefined') {
      return res.status(400).json({ error: 'Field "structure" (JSON object) is required.' });
    }

    const result = await analyzeDesign({ screenshot, structure, apiKey });
    console.log('[Design][analysis] Completed', {
      hasResult: typeof result.result !== 'undefined',
      tokenUsage: result.tokenUsage,
    });
    res.json(result);
  } catch (error) {
    console.error('[Design][analysis] Failed', error);
    next(error);
  }
});

router.post('/modifications', async (req, res, next) => {
  try {
    const { designAnalysis, prompt, types, apiKey } = req.body ?? {};

    console.log('[Design][modifications] Incoming request', {
      hasDesignAnalysis: Boolean(designAnalysis),
      promptLength: typeof prompt === 'string' ? prompt.length : 'invalid',
      types,
      providedApiKey: Boolean(apiKey),
    });

    if (!designAnalysis) {
      return res.status(400).json({ error: 'Field "designAnalysis" is required.' });
    }

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Field "prompt" is required and must be a string.' });
    }

    if (!Array.isArray(types)) {
      return res.status(400).json({ error: 'Field "types" is required and must be an array of strings.' });
    }

    const result = await requestDesignModifications({ designAnalysis, prompt, types, apiKey });
    const modificationCount = Array.isArray((result as any)?.modifications)
      ? (result as any).modifications.length
      : 'unknown';
    console.log('[Design][modifications] Completed', {
      modificationCount,
      tokenUsage: result.tokenUsage,
    });
    res.json(result);
  } catch (error) {
    console.error('[Design][modifications] Failed', error);
    next(error);
  }
});

export default router;
