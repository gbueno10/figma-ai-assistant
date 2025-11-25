import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

/**
 * Google Drive Service
 * Handles OAuth2 authentication and file uploads to Google Drive
 */
export class GoogleDriveService {
  private oauth2Client;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    // Initialize OAuth2 client even without credentials
    // Methods that require credentials will throw specific errors
    this.oauth2Client = new google.auth.OAuth2(
      clientId || 'dummy-client-id',
      clientSecret || 'dummy-secret',
      redirectUri || 'http://localhost:3000/oauth2callback'
    );
  }
  
  /**
   * Check if Google Drive is properly configured
   */
  private checkConfiguration() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Google Drive is not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI environment variables.');
    }
  }

  /**
   * Generate the authorization URL for OAuth2 flow
   * @param requestId Optional state parameter for the OAuth flow
   */
  getAuthUrl(requestId?: string): string {
    this.checkConfiguration();
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state: requestId, // Pass requestId as state parameter
    });
    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Upload a file to Google Drive
   * @param accessToken - OAuth2 access token
   * @param folderId - Google Drive folder ID where file will be uploaded
   * @param fileName - Name of the file
   * @param fileBuffer - Binary data of the file
   * @param mimeType - MIME type of the file (e.g., 'image/png')
   * @returns File ID and web view link
   */
  async uploadFile(
    accessToken: string,
    folderId: string,
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string = 'image/png'
  ) {
    try {
      // Set credentials
      this.oauth2Client.setCredentials({ access_token: accessToken });

      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

      // Convert Buffer to Readable stream
      const readable = new Readable();
      readable._read = () => {}; // Required but can be no-op
      readable.push(fileBuffer);
      readable.push(null);

      // Upload file
      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [folderId],
        },
        media: {
          mimeType: mimeType,
          body: readable,
        },
        fields: 'id, webViewLink',
      });

      return {
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
      };
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * List images from Image Bank folder
   * Returns lightweight metadata: id, name, thumbnailLink, webViewLink
   */
  async listImageBankFiles(accessToken: string, folderId: string) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

      let allFiles: any[] = [];
      let pageToken: string | null | undefined = null;

      // Loop through all pages to get ALL images
      do {
        const response: any = await drive.files.list({
          q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
          fields: 'nextPageToken, files(id, name, thumbnailLink, webViewLink, driveId)',
          pageSize: 1000, // Max per page
          pageToken: pageToken || undefined,
          orderBy: 'name', // Order alphabetically
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
          corpora: 'allDrives',
        });

        if (response.data.files) {
          allFiles.push(...response.data.files);
        }

        pageToken = response.data.nextPageToken;
        
        // Log progress for large folders
        if (pageToken) {
          console.log(`📄 Fetched ${allFiles.length} images so far, continuing...`);
        }
      } while (pageToken); // Continue while there are more pages

      console.log(`✅ Total images found in Image Bank: ${allFiles.length}`);
      return allFiles;
    } catch (error) {
      console.error('Error listing Image Bank files:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = (error as any)?.code || (error as any)?.response?.status;
      const wrappedError = new Error(`Failed to list files: ${message}`) as Error & { code?: number };
      if (status) {
        wrappedError.code = status;
      }
      throw wrappedError;
    }
  }

  /**
   * Download image binary data as ArrayBuffer
   * Returns raw binary data for the file
   */
  async getFileArrayBuffer(accessToken: string, fileId: string): Promise<ArrayBuffer> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );

      return response.data as ArrayBuffer;
    } catch (error) {
      console.error('Error downloading file:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = (error as any)?.code || (error as any)?.response?.status;
      const wrappedError = new Error(`Failed to download file: ${message}`) as Error & { code?: number };
      if (status) {
        wrappedError.code = status;
      }
      throw wrappedError;
    }
  }
}
