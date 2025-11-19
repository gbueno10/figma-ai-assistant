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

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Google OAuth2 credentials in environment variables');
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
  }

  /**
   * Generate the authorization URL for OAuth2 flow
   * @param requestId Optional state parameter for the OAuth flow
   */
  getAuthUrl(requestId?: string): string {
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
}
