# 💾 Google Drive Auto-Save Feature

## Overview
Automatic upload of AI-generated images to Google Drive with intelligent AI-powered naming using GPT-4o-mini.

## How It Works

### Flow Diagram
```
User generates image
    ↓
Image is created in Figma
    ↓
[Checkbox enabled?]
    ↓ YES
AI analyzes prompt → Generates filename (AI_dog_puppy_golden_running)
    ↓
Uploads to Google Drive
    ↓
Shows success notification with Drive link
```

## Implementation Details

### 1. AI-Powered Naming Service
**File**: `backend/src/services/namingService.ts`

- Uses **GPT-4o-mini** for fast and cost-effective naming
- Follows strict convention: `AI_dog_{age}_{color}_{action}`
- Parameters:
  - **age**: `puppy` or `adult` (default: adult)
  - **color**: `golden`, `black`, `white`, `brown`, `mixed` (default: mixed)
  - **action**: `sitting`, `running`, `sleeping`, `portrait`, etc. (default: portrait)
- Fallback: `AI_dog_adult_mixed_generated` if AI fails
- Sanitization: Removes invalid filename characters

**Example Conversions**:
```
"A cute white husky puppy sleeping" → AI_dog_puppy_white_sleeping
"An angry black dog barking" → AI_dog_adult_black_barking
"Golden retriever running in the park" → AI_dog_adult_golden_running
```

### 2. Backend Route
**File**: `backend/src/routes/designRoutes.ts`

New endpoint: `POST /api/design/generate-filename`
- **Input**: `{ prompt: string, apiKey?: string }`
- **Output**: `{ filename: string }`
- Logs all requests for debugging

### 3. Frontend UI
**File**: `src/ui.ts`

#### UI Changes:
- Added checkbox: **💾 Auto-save to Google Drive (Image Bank)**
- Positioned at the top of the AI Image Generation card
- Checked by default
- Visual styling: Green background with border

#### Logic Flow:
1. User generates image
2. On `image-complete` event:
   - Check if auto-save is enabled
   - Extract prompt and base64 image
   - Call `triggerAutoSaveToDrive()`
3. `triggerAutoSaveToDrive()` function:
   - Shows "🤖 Generating AI filename..." message
   - Calls `/api/design/generate-filename`
   - Shows "☁️ Uploading {filename} to Drive..." message
   - Sends `auto-upload-to-drive` message to plugin

#### UI Feedback:
- **Success**: `✅ Saved to Drive: AI_dog_puppy_golden_running.png [Open in Drive]`
- **Error**: `❌ Failed to save to Drive: {error message}`

### 4. Plugin Handler
**File**: `src/code.ts`

New message handler: `auto-upload-to-drive`

**Process**:
1. Retrieves Google Drive tokens from secure storage (`figma.clientStorage`)
2. Retrieves folder ID from storage
3. Validates tokens exist (shows warning if not connected)
4. Calls backend `/api/drive/upload` endpoint
5. Handles token refresh if needed
6. Shows Figma notification:
   - Success: `✅ Saved to Drive: {filename}`
   - Error: `❌ Failed to save to Drive: {error}`
7. Sends result back to UI via `postMessage`

## User Experience

### Setup (One-time)
1. Follow `GOOGLE-DRIVE-SETUP.md` to configure OAuth2
2. Connect Google Drive in the plugin
3. Set target folder ID

### Usage (Every time)
1. ✅ Make sure "💾 Auto-save to Google Drive" is checked (default)
2. Enter image prompt: "A happy golden retriever puppy playing"
3. Click "🚀 Generate Image"
4. Wait for image generation
5. **Automatic**:
   - AI generates filename: `AI_dog_puppy_golden_playing`
   - Uploads to Drive
   - Shows success message with link

### Manual Override
- Uncheck "💾 Auto-save to Google Drive" to disable
- Image will be created in Figma only

## Error Handling

### Scenario 1: Drive Not Connected
```
⚠️ Google Drive not connected. Image generated but not saved to cloud.
```
**Solution**: Click "🔗 Connect Google Drive" in the plugin

### Scenario 2: AI Naming Fails
- Fallback to: `AI_dog_adult_mixed_generated.png`
- Upload continues normally

### Scenario 3: Upload Fails
```
❌ Failed to save to Drive: Network error
```
**Solution**: 
- Check backend is running
- Verify internet connection
- Try manual export

### Scenario 4: Token Expired
- Automatic token refresh happens
- New tokens saved to storage
- Upload retries automatically

## Technical Benefits

### 1. Smart Naming
- **Consistent**: All images follow same convention
- **Searchable**: Easy to find by age/color/action
- **Automated**: No manual naming needed
- **AI-powered**: Understands context from prompt

### 2. Seamless Integration
- **Non-intrusive**: Checkbox at top of card
- **Optional**: Can be disabled
- **Fast**: GPT-4o-mini responds in <1 second
- **Reliable**: Multiple fallbacks

### 3. Secure
- Tokens stored in Figma's secure storage
- Never exposed to UI
- Automatic refresh handling

### 4. User Feedback
- Progress messages at each step
- Success with clickable Drive link
- Clear error messages

## API Endpoints Used

### Generate Filename
```http
POST http://localhost:3000/api/design/generate-filename
Content-Type: application/json

{
  "prompt": "A cute white husky puppy sleeping",
  "apiKey": "sk-..." (optional)
}

Response:
{
  "filename": "AI_dog_puppy_white_sleeping"
}
```

### Upload to Drive
```http
POST http://localhost:3000/api/drive/upload
Content-Type: application/json

{
  "tokens": { "access_token": "...", "refresh_token": "..." },
  "folderId": "FOLDER_ID",
  "fileName": "AI_dog_puppy_white_sleeping.png",
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA..."
}

Response:
{
  "success": true,
  "fileUrl": "https://drive.google.com/file/d/...",
  "webViewLink": "https://drive.google.com/file/d/.../view",
  "refreshedTokens": { ... } (if token was refreshed)
}
```

## Performance

- **AI Naming**: ~500ms (GPT-4o-mini)
- **Upload**: ~1-3s (depends on image size)
- **Total Overhead**: ~2-4s
- **Cost**: ~$0.0001 per filename (GPT-4o-mini)

## Future Enhancements

### Possible Improvements
1. **Batch naming**: Generate names for multiple images at once
2. **Custom templates**: Allow user-defined naming conventions
3. **Metadata**: Store prompt and parameters in Drive file description
4. **Folder organization**: Auto-create subfolders by color/age
5. **Duplicate detection**: Check if similar image exists before upload
6. **Compression**: Optimize image size before upload
7. **Background upload**: Continue working while upload happens

### Settings Panel
Future addition to plugin settings:
```
☁️ Google Drive Auto-Save
├─ ✅ Enable auto-save
├─ 📝 Naming template: AI_dog_{age}_{color}_{action}
├─ 📁 Default folder: Image Bank
└─ 🔄 Auto-refresh tokens: Enabled
```

## Testing

### Test Cases

#### 1. Basic Auto-Save
```
1. Enable checkbox
2. Generate image: "A brown dog sitting"
3. Verify: AI_dog_adult_brown_sitting.png uploaded
```

#### 2. Naming Edge Cases
```
Prompt: "puppy" → AI_dog_puppy_mixed_portrait
Prompt: "golden" → AI_dog_adult_golden_portrait
Prompt: "running" → AI_dog_adult_mixed_running
Prompt: "" → AI_dog_adult_mixed_portrait (fallback)
```

#### 3. Disabled Auto-Save
```
1. Uncheck checkbox
2. Generate image
3. Verify: Image created locally only
```

#### 4. Drive Not Connected
```
1. Clear Drive tokens
2. Enable checkbox
3. Generate image
4. Verify: Warning shown, image still created
```

## Troubleshooting

### Issue: Checkbox not visible
- Clear browser cache
- Restart plugin
- Check `src/ui.ts` for CSS conflicts

### Issue: Filename not AI-generated
- Check backend logs for `/design/generate-filename` errors
- Verify OpenAI API key is set
- Check fallback: `AI_dog_adult_mixed_generated`

### Issue: Upload fails silently
- Check browser console for errors
- Verify `code.ts` has `auto-upload-to-drive` handler
- Check backend `/drive/upload` endpoint

## Security Considerations

### Sensitive Data
- ✅ Tokens stored in `figma.clientStorage` (encrypted)
- ✅ Tokens never logged or exposed to UI
- ✅ HTTPS recommended for production
- ⚠️ Image base64 transmitted in memory only

### Best Practices
1. Never commit `.env` with real credentials
2. Rotate OAuth tokens regularly
3. Use scoped Drive permissions
4. Monitor backend logs for suspicious activity

## Done!

You now have a fully automated image bank system that:
- 🤖 Uses AI to name files intelligently
- ☁️ Uploads to Google Drive automatically
- 📁 Organizes files with consistent naming
- 🔒 Keeps tokens secure
- 🎯 Provides clear user feedback

**Next**: Build your dog image library effortlessly! 🐕✨
