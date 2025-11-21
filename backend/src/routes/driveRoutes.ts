import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GoogleDriveService } from '../services/googleDriveService';

const router = express.Router();
const driveService = new GoogleDriveService();

// Store pending OAuth requests with their tokens
interface PendingLogin {
  tokens?: any;
  status: 'pending' | 'success' | 'error';
  error?: string;
  timestamp: number;
}

const pendingLogins = new Map<string, PendingLogin>();

// Clean up old pending requests (older than 10 minutes)
setInterval(() => {
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  for (const [key, value] of pendingLogins.entries()) {
    if (value.timestamp < tenMinutesAgo) {
      pendingLogins.delete(key);
    }
  }
}, 60 * 1000); // Run every minute

/**
 * GET /api/drive/auth-url?requestId=XYZ
 * Returns the Google OAuth2 authorization URL
 */
router.get('/auth-url', (req: Request, res: Response) => {
  try {
    const requestId = (req.query.requestId as string) || uuidv4();
    
    // Initialize pending login
    pendingLogins.set(requestId, {
      status: 'pending',
      timestamp: Date.now()
    });
    
    const authUrl = driveService.getAuthUrl(requestId);
    res.json({ authUrl, requestId });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ 
      error: 'Failed to generate authorization URL',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/drive/callback?code=XYZ&state=requestId
 * OAuth2 callback endpoint
 * Stores tokens in pendingLogins and shows success page
 */
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const requestId = state as string;

    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing authorization code');
    }

    const tokens = await driveService.getTokens(code);

    // Store tokens in pendingLogins for polling
    if (requestId && pendingLogins.has(requestId)) {
      pendingLogins.set(requestId, {
        tokens,
        status: 'success',
        timestamp: Date.now()
      });
    }

    // Display success page to user
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful!</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            .success-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              color: #059669;
              margin-bottom: 16px;
              font-size: 28px;
            }
            p {
              color: #64748b;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 24px;
            }
            .close-message {
              background: #dcfce7;
              color: #166534;
              padding: 16px;
              border-radius: 8px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Authorization Successful!</h1>
            <p>Your Google Drive account has been successfully connected.</p>
            <div class="close-message">
              You can close this window and return to Figma.
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    
    // Update pending login with error
    const requestId = req.query.state as string;
    if (requestId && pendingLogins.has(requestId)) {
      pendingLogins.set(requestId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
    
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Error</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            .error-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              color: #dc2626;
              margin-bottom: 16px;
              font-size: 28px;
            }
            p {
              color: #64748b;
              font-size: 16px;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">❌</div>
            <h1>Authorization Error</h1>
            <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
            <p>Please try again or contact support.</p>
          </div>
        </body>
      </html>
    `);
  }
});

/**
 * GET /api/drive/check-status?requestId=XYZ
 * Check the status of a pending OAuth request (for polling)
 */
router.get('/check-status', (req: Request, res: Response) => {
  const requestId = req.query.requestId as string;
  
  if (!requestId) {
    return res.status(400).json({ error: 'Missing requestId' });
  }
  
  const loginData = pendingLogins.get(requestId);
  
  if (!loginData) {
    return res.json({ status: 'not_found' });
  }
  
  if (loginData.status === 'success') {
    // Remove from map after successful retrieval
    pendingLogins.delete(requestId);
    return res.json({ 
      status: 'success', 
      tokens: loginData.tokens 
    });
  }
  
  if (loginData.status === 'error') {
    pendingLogins.delete(requestId);
    return res.json({ 
      status: 'error', 
      error: loginData.error 
    });
  }
  
  // Still pending
  res.json({ status: 'pending' });
});

/**
 * POST /api/drive/upload
 * Upload an image to Google Drive
 * Body: { tokens, folderId, fileName, imageBase64, prompt?, apiKey? }
 * If prompt is provided, generates an AI-powered filename
 */
router.post('/upload', async (req: Request, res: Response) => {
  try {
    let { tokens, folderId, fileName, imageBase64, prompt, apiKey } = req.body;

    // Validation
    if (!tokens || !tokens.access_token) {
      return res.status(400).json({ error: 'Missing or invalid tokens' });
    }

    if (!folderId) {
      return res.status(400).json({ error: 'Missing folderId' });
    }

    if (!fileName) {
      return res.status(400).json({ error: 'Missing fileName' });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64' });
    }

    // If prompt is provided, generate AI-powered filename
    if (prompt && prompt.trim()) {
      console.log('🤖 Generating AI filename for prompt:', prompt);
      try {
        const { generateDogFilename } = await import('../services/namingService');
        const aiGeneratedName = await generateDogFilename(prompt, apiKey);
        fileName = `${aiGeneratedName}.png`;
        console.log('✅ AI generated filename:', fileName);
      } catch (namingError) {
        console.warn('⚠️ Failed to generate AI filename, using provided name:', namingError);
        // Continue with original fileName if AI naming fails
      }
    }

    // Convert base64 to Buffer
    const fileBuffer = Buffer.from(imageBase64, 'base64');

    let uploadResult;
    let refreshedTokens = null;

    try {
      // Try uploading with current access token
      uploadResult = await driveService.uploadFile(
        tokens.access_token,
        folderId,
        fileName,
        fileBuffer,
        'image/png'
      );
    } catch (error) {
      // If token expired, try refreshing it
      if (error instanceof Error && 
          (error.message.includes('invalid authentication') || 
           error.message.includes('Invalid Credentials') ||
           error.message.includes('Request had invalid authentication'))) {
        
        console.log('🔄 Access token expired, attempting refresh...');
        
        if (!tokens.refresh_token) {
          return res.status(401).json({
            error: 'Token expired and no refresh token available',
            message: 'Please reconnect your Google Drive account',
            needsReauth: true,
          });
        }

        // Refresh the token
        refreshedTokens = await driveService.refreshAccessToken(tokens.refresh_token);
        
        console.log('✅ Token refreshed successfully');

        // Retry upload with new token
        uploadResult = await driveService.uploadFile(
          refreshedTokens.access_token!,
          folderId,
          fileName,
          fileBuffer,
          'image/png'
        );
      } else {
        throw error;
      }
    }

    res.json({
      success: true,
      fileId: uploadResult.fileId,
      webViewLink: uploadResult.webViewLink,
      fileName: fileName, // Return the actual filename used (may be AI-generated)
      message: `File "${fileName}" uploaded successfully`,
      refreshedTokens: refreshedTokens, // Send new tokens if refreshed
    });
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    
    // Check if it's a token refresh error
    if (error instanceof Error && error.message.includes('invalid_grant')) {
      return res.status(401).json({
        error: 'Token expired or invalid',
        message: 'Please reconnect your Google Drive account',
        needsReauth: true,
      });
    }

    res.status(500).json({
      error: 'Failed to upload file',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/drive/refresh-token
 * Refresh access token using refresh token
 * Body: { refreshToken }
 */
router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Missing refreshToken' });
    }

    const newTokens = await driveService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      tokens: newTokens,
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      error: 'Failed to refresh token',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
