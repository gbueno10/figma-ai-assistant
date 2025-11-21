# Multi-Frame Selection Update for Resize Functions

## Overview

Updated the frame resize functions (`handleFrameStretch` and `handleFrameReflow`) to support **multiple frame selection**, significantly improving usability. Previously, these functions would throw an error if more than one frame was selected. Now they process all selected frames in batch.

## Changes Made

### 1. Selection Validation
**Before:**
```typescript
if (selection.length !== 1 || selection[0].type !== 'FRAME') {
  throw new Error('Please select a single frame to resize.');
}
```

**After:**
```typescript
const selection = figma.currentPage.selection.filter(node => node.type === 'FRAME') as FrameNode[];

if (selection.length === 0) {
  throw new Error('Please select at least one frame to resize.');
}
```

### 2. Iteration Logic
Wrapped the entire resize logic in a loop:
```typescript
const newFrames: FrameNode[] = [];
let successCount = 0;

for (const baseFrame of selection) {
  // Individual frame processing
  // ...
  newFrames.push(newFrame);
  successCount++;
}
```

### 3. Smart Skipping
Frames are skipped (not errored) if:
- Already at target height
- Target height is smaller than current (can't reflow/stretch downward)

### 4. Batch Selection
All newly created frames are selected together:
```typescript
if (newFrames.length > 0) {
  figma.currentPage.selection = newFrames;
  figma.viewport.scrollAndZoomIntoView(newFrames);
  
  const successMsg = `✅ Processed ${successCount} frame(s) [Reflow]`;
  figma.notify(successMsg);
}
```

### 5. Translation to English
All Portuguese comments and messages were translated:
- ❌ `"Esticando background"` → `"Stretching background"`
- ❌ `"Movendo elemento de rodapé"` → `"Moving footer element"`
- ❌ `"Falha ao esticar"` → `"Failed to stretch"`
- ❌ `"Novo frame criado"` → `"Processed N frame(s)"`

## Benefits

### ✅ Improved Workflow
Users can now:
1. Select multiple 1080x1080 frames
2. Click "Vertical (1080x1350)" once
3. Get all frames resized in a single operation

### ✅ Time Savings
- **Before**: Select frame → Resize → Repeat for each frame
- **After**: Select all frames → Resize once

### ✅ Better UX
- No more errors when accidentally selecting multiple frames
- Clear feedback on how many frames were processed
- Non-matching frames are skipped gracefully

### ✅ Maintains Individual Logic
Each frame is processed with:
- Its own dimensions calculated
- Its own naming convention applied
- Its own background detection
- Its own footer repositioning

## Technical Details

### Frame Positioning
New frames are positioned adjacent to their originals:
- **Reflow**: `newFrame.x = baseFrame.x + baseFrame.width + 50`
- **Stretch**: `newFrame.x = baseFrame.x + baseFrame.width + 100`

### Naming Convention
Each frame gets the Dogo naming convention applied individually:
- Extracts ticket number if present
- Updates dimension component
- Preserves variant, type, device, etc.
- Falls back to simple append if pattern doesn't match

### Error Handling
- Individual frame errors don't stop batch processing
- Success count reports actual frames processed
- Warning notifications for skipped frames

## Example Usage

### Single Frame (works as before)
1. Select 1 frame (1080x1080)
2. Click "Vertical (1080x1350)"
3. Result: 1 new frame created

### Multiple Frames (new capability)
1. Select 5 frames (all 1080x1080)
2. Click "Vertical (1080x1350)"
3. Result: 5 new frames created, all selected
4. Message: `✅ Processed 5 frame(s) [Reflow]`

### Mixed Selection (smart filtering)
1. Select 3 frames + 2 groups
2. Click resize
3. Result: Only 3 frames processed (groups ignored)

## Testing Recommendations

Test these scenarios:
1. **Single frame** - Verify backward compatibility
2. **Multiple identical frames** - Should all resize successfully
3. **Multiple frames with different sizes** - Each should resize from its original dimensions
4. **Frames already at target height** - Should be skipped with warning
5. **Mixed selection** (frames + other nodes) - Should filter and process only frames
6. **Empty selection** - Should show error message

## Performance

- **Time Complexity**: O(n) where n = number of selected frames
- **Memory**: Minimal - frames processed sequentially
- **UI Responsiveness**: Each frame operation is fast (<100ms typically)

## Future Enhancements

Possible improvements:
- Progress indicator for large batches (10+ frames)
- Option to resize in-place instead of duplicating
- Custom positioning patterns (grid layout)
- Batch naming with sequential numbers
