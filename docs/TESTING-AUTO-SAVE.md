# 🧪 Quick Testing Guide - Auto-Save Feature

## Prerequisites
- ✅ Backend running on `http://localhost:3000`
- ✅ Google Drive OAuth2 configured
- ✅ Figma plugin loaded

---

## Test 1: Basic Auto-Save ✨

### Steps
1. Open Figma Desktop
2. Run plugin: **Plugins → Figma AI Assistant**
3. Scroll to **🎨 AI Image Generation** card
4. Verify checkbox is visible: `☑️ 💾 Auto-save to Google Drive (Image Bank)`
5. Ensure checkbox is **checked** ✅
6. Click **🔗 Connect Google Drive** (if not connected)
7. Complete OAuth flow and paste tokens
8. Enter Folder ID
9. In **Image description**, enter:
   ```
   A cute white husky puppy sleeping
   ```
10. Click **🚀 Generate Image**

### Expected Result
```
⏳ Generating image...
✅ Image generated successfully!
🤖 Generating AI filename...
☁️ Uploading AI_dog_puppy_white_sleeping.png to Drive...
✅ Saved to Drive: AI_dog_puppy_white_sleeping.png [Open in Drive]
```

### Verify
- ✅ Image appears in Figma
- ✅ File in Google Drive with correct name
- ✅ Success message with clickable link

---

## Test 2: Different Naming Scenarios 🏷️

### Test 2.1: Adult Dog
**Prompt**: `An angry black dog barking`  
**Expected**: `AI_dog_adult_black_barking.png`

### Test 2.2: Golden Retriever
**Prompt**: `Golden retriever running in the park`  
**Expected**: `AI_dog_adult_golden_running.png`

### Test 2.3: Puppy
**Prompt**: `A playful brown puppy jumping`  
**Expected**: `AI_dog_puppy_brown_jumping.png`

### Test 2.4: Minimal Info
**Prompt**: `A dog`  
**Expected**: `AI_dog_adult_mixed_portrait.png` (fallback)

---

## Test 3: Auto-Save Disabled 🚫

### Steps
1. **Uncheck** the auto-save checkbox
2. Generate image: `A happy golden dog`
3. Wait for generation to complete

### Expected Result
```
✅ Image generated successfully!
(No auto-save messages)
```

### Verify
- ✅ Image appears in Figma
- ❌ No upload to Drive
- ❌ No naming messages

---

## Test 4: Drive Not Connected ⚠️

### Steps
1. Clear Drive tokens:
   - Scroll to **☁️ Export to Google Drive** card
   - Click **🗑️ Clear Tokens**
2. Return to **🎨 AI Image Generation** card
3. Ensure auto-save checkbox is **checked**
4. Generate image: `A brown dog sitting`

### Expected Result
```
✅ Image generated successfully!
🤖 Generating AI filename...
☁️ Uploading AI_dog_adult_brown_sitting.png to Drive...
⚠️ Google Drive not connected. Image generated but not saved to cloud.
```

### Verify
- ✅ Image appears in Figma
- ⚠️ Warning notification shown
- ❌ No upload to Drive

---

## Test 5: Network Error 🌐

### Steps
1. Stop backend: `Ctrl+C` in terminal
2. Ensure auto-save is enabled
3. Generate image: `A white dog`

### Expected Result
```
✅ Image generated successfully!
🤖 Generating AI filename...
❌ Auto-save failed: Failed to fetch
```

### Verify
- ✅ Image appears in Figma
- ❌ Error message shown
- ⚠️ Image not uploaded (backend down)

---

## Test 6: Token Refresh 🔄

### Prerequisites
- Use expired or near-expired tokens

### Steps
1. Connect with old tokens
2. Generate image with auto-save enabled
3. Wait for upload

### Expected Result
```
✅ Image generated successfully!
🤖 Generating AI filename...
☁️ Uploading AI_dog_adult_mixed_portrait.png to Drive...
✅ Saved to Drive: AI_dog_adult_mixed_portrait.png [Open in Drive]
```

### Verify
- ✅ Upload successful
- ✅ Tokens automatically refreshed
- ✅ No error shown

---

## Test 7: Multiple Images in Sequence 🔁

### Steps
1. Generate image: `A black puppy sleeping`
2. Wait for completion
3. Generate image: `A white dog running`
4. Wait for completion
5. Generate image: `A golden retriever sitting`

### Expected Result
All three images uploaded with correct names:
- `AI_dog_puppy_black_sleeping.png`
- `AI_dog_adult_white_running.png`
- `AI_dog_adult_golden_sitting.png`

### Verify
- ✅ All images in Figma
- ✅ All images in Drive
- ✅ Correct naming for each

---

## Test 8: Edge Cases 🎭

### Test 8.1: Empty Prompt
**Prompt**: `` (empty)  
**Expected**: Form validation error OR fallback `AI_dog_adult_mixed_portrait.png`

### Test 8.2: Non-Dog Prompt
**Prompt**: `A cat sleeping`  
**Expected**: AI tries to adapt OR fallback `AI_dog_adult_mixed_portrait.png`

### Test 8.3: Very Long Prompt
**Prompt**: `A very cute adorable friendly playful energetic happy golden retriever puppy with fluffy fur running and jumping in a beautiful green park on a sunny day`  
**Expected**: AI extracts key info → `AI_dog_puppy_golden_running.png`

---

## Test 9: Backend Logs 📝

### Check Backend Console
After each generation, verify logs:

```
[Design][generate-filename] Incoming request { promptLength: 35, providedApiKey: true }
[Design][generate-filename] Generated filename: AI_dog_puppy_white_sleeping
```

### Verify
- ✅ Request logged
- ✅ Prompt length shown
- ✅ Filename logged

---

## Test 10: Browser Console 🖥️

### Open Browser DevTools
1. Right-click plugin UI
2. Select "Inspect"
3. Go to "Console" tab
4. Generate image with auto-save

### Verify Logs
```
📨 Message received from UI: { type: 'auto-upload-to-drive', filename: '...', imageBase64: '...' }
☁️ Starting auto-upload to Google Drive...
✅ Saved to Drive: AI_dog_puppy_white_sleeping.png
```

---

## Test 11: Figma Notifications 🔔

### Check Figma UI
After each generation with auto-save:

1. **During Upload**:
   ```
   ☁️ Uploading to Drive: AI_dog_puppy_white_sleeping.png...
   ```

2. **On Success**:
   ```
   ✅ Saved to Drive: AI_dog_puppy_white_sleeping.png
   ```

3. **On Error**:
   ```
   ❌ Failed to save to Drive
   ```

---

## Test 12: Google Drive Verification 🗂️

### Manual Check
1. Open Google Drive in browser
2. Navigate to configured folder
3. Check uploaded files

### Verify
- ✅ Files exist
- ✅ Correct filenames
- ✅ PNG format
- ✅ Correct file size (~100KB - 2MB)
- ✅ Images are viewable

---

## Automated Test Script 🤖

### Quick Test Command
```bash
# Test naming service directly
curl -X POST http://localhost:3000/api/design/generate-filename \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cute white husky puppy sleeping"}'

# Expected: {"filename":"AI_dog_puppy_white_sleeping"}
```

### Test Multiple Prompts
```bash
# Test 1
curl -X POST http://localhost:3000/api/design/generate-filename \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A brown dog sitting"}' | jq

# Test 2
curl -X POST http://localhost:3000/api/design/generate-filename \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Golden retriever running"}' | jq

# Test 3
curl -X POST http://localhost:3000/api/design/generate-filename \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Black puppy jumping"}' | jq
```

---

## Performance Testing ⚡

### Measure Timing
1. Start timer before generation
2. Generate image with auto-save
3. Stop timer after success message

### Expected Timing
- **Image Generation**: 5-10s (OpenAI API)
- **Filename Generation**: ~500ms (GPT-4o-mini)
- **Upload**: 1-3s (network dependent)
- **Total**: ~7-14s

### Acceptance Criteria
- ✅ Naming adds <1s overhead
- ✅ Upload doesn't block UI
- ✅ Progress messages appear promptly

---

## Error Scenarios to Test ❌

### 1. Invalid API Key
- **Setup**: Use wrong OpenAI key
- **Expected**: Fallback filename used

### 2. Backend Down
- **Setup**: Stop backend
- **Expected**: Error message shown, image still created

### 3. Drive Quota Exceeded
- **Setup**: Use full Drive account
- **Expected**: Error from Drive API, clear message

### 4. Network Timeout
- **Setup**: Slow/unstable connection
- **Expected**: Timeout error, retry suggestion

---

## Success Criteria ✅

### Must Pass
- ✅ Auto-save checkbox visible
- ✅ Naming works for various prompts
- ✅ Upload succeeds to Drive
- ✅ Filenames follow convention
- ✅ Error handling works
- ✅ Drive not connected warning shown
- ✅ Disabled checkbox skips upload

### Nice to Have
- ✅ Fast naming (<1s)
- ✅ Fast upload (<3s)
- ✅ Clear progress messages
- ✅ Clickable Drive links
- ✅ Token refresh works

---

## Regression Testing 🔄

### Verify Existing Features Still Work
1. ✅ Manual Drive export (bulk)
2. ✅ Image generation without auto-save
3. ✅ Design analysis
4. ✅ Design modifications
5. ✅ Frame resizing
6. ✅ Image editing

---

## Debugging Tips 🐛

### If Naming Fails
1. Check backend logs
2. Verify OpenAI API key
3. Test direct API call (curl command above)
4. Check fallback is used

### If Upload Fails
1. Verify Drive tokens valid
2. Check folder ID correct
3. Test manual export works
4. Check backend `/drive/upload` endpoint

### If Checkbox Not Visible
1. Clear browser cache
2. Restart plugin
3. Check `src/ui.ts` changes applied
4. Rebuild plugin with webpack

---

## Final Checklist ✅

Before marking as complete:
- [ ] All 12 tests passed
- [ ] Edge cases handled
- [ ] Error messages clear
- [ ] Performance acceptable
- [ ] No regressions found
- [ ] Documentation accurate
- [ ] Backend logs clean
- [ ] Browser console clean
- [ ] Drive files correct
- [ ] User experience smooth

---

## Test Results Template 📋

```
Date: ___________
Tester: ___________

Test 1 (Basic Auto-Save):       [ ] Pass  [ ] Fail
Test 2 (Naming Scenarios):       [ ] Pass  [ ] Fail
Test 3 (Auto-Save Disabled):     [ ] Pass  [ ] Fail
Test 4 (Drive Not Connected):    [ ] Pass  [ ] Fail
Test 5 (Network Error):          [ ] Pass  [ ] Fail
Test 6 (Token Refresh):          [ ] Pass  [ ] Fail
Test 7 (Multiple Images):        [ ] Pass  [ ] Fail
Test 8 (Edge Cases):             [ ] Pass  [ ] Fail
Test 9 (Backend Logs):           [ ] Pass  [ ] Fail
Test 10 (Browser Console):       [ ] Pass  [ ] Fail
Test 11 (Figma Notifications):   [ ] Pass  [ ] Fail
Test 12 (Drive Verification):    [ ] Pass  [ ] Fail

Overall Status: [ ] All Passed  [ ] Issues Found

Issues/Notes:
_________________________________
_________________________________
_________________________________
```

---

**Happy Testing! 🚀**
