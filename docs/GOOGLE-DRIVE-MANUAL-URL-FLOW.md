# 🔗 Manual Authentication Flow with Polling

## ✅ Implemented Change

**Before**: ❌ Tried to open browser automatically (unreliable)
**Now**: ✅ **Shows URL for user to copy and paste manually**

---

## 🎨 New "Connecting" State Visual

```
┌─────────────────────────────────────────────────────┐
│  🔄 Waiting for Authorization...                    │
│  Copy the URL below and authorize in your browser.  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Animated rotating spinner]                       │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 📋 Copy and paste this URL in your browser:  │ │
│  │                                               │ │
│  │  ┌──────────────────────────────┬──────────┐ │ │
│  │  │ https://accounts.google...   │ 📋 Copy  │ │ │
│  │  └──────────────────────────────┴──────────┘ │ │
│  │                                               │ │
│  │  💡 After authorizing, this window will      │ │
│  │     detect it automatically.                  │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Don't close this Figma window while authorizing.  │
│                                                     │
│           [ ❌ Cancel ]                             │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 New Step-by-Step Flow

### 1. User Clicks "Connect Google Drive"
```typescript
📤 UI: Generates unique requestId
📤 UI → Plugin: { type: 'get-drive-auth-url', requestId }
```

### 2. Plugin Fetches URL from Backend
```typescript
🔌 Plugin → Backend: GET /api/drive/auth-url?requestId=XYZ
📥 Backend → Plugin: { authUrl, requestId }
📤 Plugin → UI: { type: 'auth-url-ready', url, requestId }
```

### 3. UI Shows URL to Copy
```typescript
✅ UI changes to "Connecting State"
✅ Input shows full URL (readonly)
✅ "Copy" button next to input
✅ Starts polling every 2 seconds
```

### 4. User Copies and Pastes URL in Browser
```
👤 Clicks "📋 Copy" button OR manually selects text
👤 Opens preferred browser
👤 Pastes URL in address bar
👤 Authorizes the application in Google
```

### 5. Google Redirects to Callback
```typescript
🌐 Browser: Redirects to /api/drive/callback?code=ABC&state=XYZ
🔧 Backend: Exchanges code for tokens
💾 Backend: Saves in pendingLogins[requestId] = { status: 'success', tokens }
📄 Backend: Displays "✅ You can close this window" page
```

### 6. Polling Detects Success
```typescript
🔁 UI (every 2s): { type: 'check-drive-auth-status', requestId }
🔌 Plugin → Backend: GET /api/drive/check-status?requestId=XYZ
📥 Backend → Plugin: { status: 'success', tokens }
📤 Plugin → UI: { type: 'auth-status-success', tokens }
```

### 7. UI Saves and Changes State
```typescript
⏹️ UI: Stops polling (clearInterval)
📤 UI → Plugin: { type: 'save-drive-tokens', tokens }
💾 Plugin: Saves in figma.clientStorage
✅ UI: Changes to "Connected State"
```

---

## 🎯 Advantages of Manual Flow

### ✅ More Reliable
- Doesn't depend on `figma.openExternal()` working
- Works in any environment (Desktop, Web, etc.)
- User has full control of the process

### ✅ Better UX
- URL always visible - can copy multiple times if needed
- Can use preferred browser
- Can log in on another tab if browser is already open

### ✅ Compatible
- Works on Figma Desktop
- Works on Figma Web (with clientStorage limitations)
- Works in corporate environments with pop-up restrictions

### ✅ Easier Debugging
- User can see full URL
- Can verify URL parameters if there's an error
- Can share URL with technical support if needed

---

## 💻 Updated Code

### UI: Copy Button with Fallbacks
```typescript
copyAuthUrlBtn.addEventListener('click', () => {
  authUrlInput.select();
  
  // 1. Try modern Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(authUrlInput.value)
      .then(() => {
        copyAuthUrlBtn.textContent = '✅ Copied!';
        setTimeout(() => {
          copyAuthUrlBtn.textContent = '📋 Copy';
        }, 2000);
      })
      .catch(() => {
        alert('URL selected. Press Cmd+C to copy.');
      });
  } 
  // 2. Fallback: execCommand (old but works)
  else {
    try {
      document.execCommand('copy');
      copyAuthUrlBtn.textContent = '✅ Copied!';
    } catch (err) {
      alert('URL selected. Press Cmd+C to copy.');
    }
  }
});
```

### Plugin: Sends requestId with URL
```typescript
figma.ui.postMessage({
  type: 'auth-url-ready',
  url: data.authUrl,
  requestId: requestId  // ← Important to start polling
});
```

### Backend: No Changes Needed
- Polling system already implemented
- `pendingLogins` Map already works
- Automatic cleanup already active

---

## 🧪 How to Test

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Reload Plugin
```
Cmd+Option+P → "Plugins: Reload Plugin"
```

### 3. Test Manual Flow
1. ✅ Click "🔗 Connect Google Drive"
2. ✅ Verify that UI shows URL field
3. ✅ Click "📋 Copy" button
4. ✅ Verify "✅ Copied!" feedback
5. ✅ Open browser manually
6. ✅ Paste URL in address bar
7. ✅ Authorize in Google
8. ✅ Verify page shows "✅ You can close this window"
9. ✅ Return to Figma
10. ✅ Verify that UI automatically changed to "Connected"

---

## 🎨 URL Input Styling

```css
#authUrlInput {
  flex: 1;
  font-size: 11px;
  padding: 8px;
  background: white;
  cursor: text;
  font-family: monospace; /* ← Better for URLs */
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
```

---

## 📊 Comparison: Before vs Now

| Aspect | Before (Automatic) | Now (Manual) |
|---------|-------------------|----------------|
| **Browser opening** | ❌ Tried `figma.openExternal()` | ✅ User opens manually |
| **URL visibility** | ❌ Didn't show | ✅ Always visible in input |
| **Copy button** | ❌ Didn't have | ✅ With visual feedback |
| **Compatibility** | ⚠️ Environment dependent | ✅ Works anywhere |
| **User control** | ⚠️ Limited | ✅ Total |
| **Debugging** | ❌ Difficult | ✅ Easy (URL visible) |
| **Polling** | ✅ Already worked | ✅ Maintained |
| **UX** | ⚠️ Confusing if doesn't open | ✅ Clear and intuitive |

---

## ✅ Implementation Checklist

- [x] Add readonly input for URL in HTML
- [x] Add "📋 Copy" button
- [x] Implement copy logic with fallbacks
- [x] Update `showConnectingState()` to receive URL
- [x] Pass `requestId` with URL in message
- [x] Expose `startPolling` in `window.driveUI`
- [x] Update `auth-url-ready` handler to start polling
- [x] Remove `open-url` handler (not used anymore)
- [x] Update texts to English
- [x] Add 💡 icon with auto-detection tip
- [x] Compile and verify without errors

---

## 🎉 Final Result

The user now has a **reliable** and **transparent** experience:

1. Clicks "Connect"
2. **SEES** the full URL
3. **COPIES** with one click
4. **PASTES** in browser of choice
5. Authorizes
6. Plugin **automatically detects** via polling
7. Ready to export! 🚀

---

Much better than the previous approach! 👍
