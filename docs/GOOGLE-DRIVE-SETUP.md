# 🔐 Google Drive OAuth2 Setup Guide

## Overview
This guide will help you set up Google Drive OAuth2 credentials for the Bulk Export feature.

## Prerequisites
- Google Cloud Console account
- Backend running on `http://localhost:3000`

## Step-by-Step Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown → "New Project"
3. Enter project name: `Figma AI Assistant`
4. Click "Create"

### 2. Enable Google Drive API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click on "Google Drive API"
4. Click "Enable"

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type → Click "Create"
3. Fill in the required fields:
   - **App name**: `Figma AI Assistant`
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click "Save and Continue"
5. **Scopes**: Click "Add or Remove Scopes"
   - Search for `drive`
   - Select: `https://www.googleapis.com/auth/drive` (See, edit, create, and delete all of your Google Drive files)
   - Click "Update" → "Save and Continue"
6. **Test users**: Add your Google account email
7. Click "Save and Continue" → "Back to Dashboard"

### 4. Create OAuth2 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "+ Create Credentials" → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Figma AI Assistant Web Client`
5. **Authorized redirect URIs**:
   - Click "+ Add URI"
   - Enter: `http://localhost:3000/api/drive/callback`
   - Click "Create"
6. **Copy your credentials**:
   - Client ID: `123456789-abcdefg.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxxxxxxx`

### 5. Update Backend .env File

Open `/backend/.env` and update:

```bash
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:3000/api/drive/callback
```

### 6. Restart Backend

```bash
cd backend
npm run dev
```

## Testing the Setup

### 1. Start the Plugin

1. Open Figma Desktop
2. Run the plugin: **Plugins** → **Figma AI Assistant**

### 2. Connect Google Drive

1. Scroll to **☁️ Export to Google Drive** card
2. Click "🔗 Connect Google Drive"
3. Browser will open with Google authorization page
4. Sign in and allow access
5. Copy the JSON tokens from the success page
6. Paste tokens into the **Google Drive Tokens** field in the plugin

### 3. Get Folder ID

1. Open Google Drive in browser
2. Navigate to the folder where you want to export frames
3. Copy the folder ID from URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
                                            ^^^^^^^^^^^^^^
   ```
4. Paste the Folder ID into the plugin

### 4. Export Frames

1. Select one or more frames in Figma
2. Click "📤 Export Selected Frames"
3. Wait for upload to complete
4. Check your Google Drive folder!

## Troubleshooting

### Error: "Invalid redirect_uri"
- Make sure `http://localhost:3000/api/drive/callback` is added in Google Cloud Console
- Restart the backend after updating `.env`

### Error: "Access blocked: This app's request is invalid"
- Make sure the Google Drive API is enabled
- Add your email to **Test users** in OAuth consent screen

### Error: "Token expired or invalid"
- Click "🔗 Connect Google Drive" again to get new tokens
- The tokens will auto-refresh if you have a `refresh_token`

### Error: "Failed to connect"
- Make sure backend is running: `http://localhost:3000/health`
- Check backend logs for errors

## Security Notes

⚠️ **Important:**
- Keep your `GOOGLE_CLIENT_SECRET` private
- Never commit `.env` file to git
- Tokens are stored in browser localStorage
- For production, use HTTPS and secure token storage

## API Endpoints

### Get Auth URL
```
GET http://localhost:3000/api/drive/auth-url
```

### OAuth Callback
```
GET http://localhost:3000/api/drive/callback?code=AUTHORIZATION_CODE
```

### Upload File
```
POST http://localhost:3000/api/drive/upload
Content-Type: application/json

{
  "tokens": { "access_token": "...", "refresh_token": "..." },
  "folderId": "FOLDER_ID",
  "fileName": "frame-name.png",
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### Refresh Token
```
POST http://localhost:3000/api/drive/refresh-token
Content-Type: application/json

{
  "refreshToken": "REFRESH_TOKEN_HERE"
}
```

## Done!

You're all set! You can now export multiple frames from Figma directly to your Google Drive. 🎉
