# Granular Image Editing Feature

## Overview

The **Granular Image Editing** feature allows designers to edit multiple images within a single frame, each with its own custom AI prompt. This is an evolution from the batch processing approach (same prompt for all images) to a more granular, per-image control.

## Problem Solved

When you have a frame containing multiple images (e.g., a dog, a product, and a background), you can now apply different transformations to each:

- "Transform the dog into a Golden Retriever"
- "Make the product more shiny"
- "Change the background to a beach"

All in a single operation!

## How It Works

### 1. User Interface Flow

1. **Analyze Frame**: Click "🔍 Analyze Frame for Editing" button
2. **Image List**: The UI displays all images found in the frame with:
   - Thumbnail preview
   - Image name
   - Selection checkbox
   - Individual prompt textarea
3. **Configure Prompts**: Enter a specific prompt for each image you want to edit
4. **Execute**: Click "🚀 Execute Granular Edit" to process all selected images

### 2. Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        UI (ui.ts)                           │
├─────────────────────────────────────────────────────────────┤
│  1. User clicks "Analyze Frame for Editing"                 │
│  2. UI sends: { type: 'analyze-frame-for-granular-edit' }   │
│  3. UI receives images with base64 previews                 │
│  4. User fills individual prompts                           │
│  5. UI sends: { type: 'granular-image-edit', tasks: [...] } │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Plugin (code.ts)                        │
├─────────────────────────────────────────────────────────────┤
│  analyzeFrameForGranularEdit():                             │
│    - Finds all images in selected frame                     │
│    - Extracts base64 for UI preview                         │
│    - Sends image list to UI                                 │
│                                                             │
│  handleGranularImageEditing():                              │
│    1. Duplicates frame with Dogo naming convention          │
│    2. Creates parallel promises for each task               │
│    3. Each promise calls backend with its own prompt        │
│    4. Applies edited images to duplicated frame             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (via ImageGenerationService)      │
├─────────────────────────────────────────────────────────────┤
│  POST /images/edit                                          │
│    - Receives image + individual prompt                     │
│    - Processes with OpenAI DALL-E                           │
│    - Returns edited image                                   │
└─────────────────────────────────────────────────────────────┘
```

### 3. Message Types

```typescript
// Analyze request
{ type: 'analyze-frame-for-granular-edit' }

// Analyze response
{
  type: 'granular-frame-analyzed',
  images: [{
    nodeId: string,
    nodeName: string,
    imageBase64: string
  }]
}

// Edit request
{
  type: 'granular-image-edit',
  tasks: [{
    nodeId: string,
    nodeName: string,
    imageBase64: string,
    prompt: string  // Individual prompt!
  }],
  apiKey?: string,
  size: '1024x1024'
}

// Progress update
{
  type: 'granular-edit-progress',
  message: string,
  step: number,
  totalSteps: number
}

// Success response
{
  type: 'granular-edit-complete',
  message: string
}

// Error response
{
  type: 'granular-edit-error',
  message: string
}
```

## Key Benefits

1. **Context Consistency**: Maintain full control over each element without running the plugin multiple times

2. **Speed**: Uses `Promise.all` for parallel processing - editing 4 images runs simultaneously, saving minutes of wait time

3. **Versioning**: Leverages the existing Dogo naming convention for frame duplication, keeping "Before" (original) and "After" (with edits) side by side

## UI Components

### Granular Image Card

Each image in the list is displayed as a card containing:

```html
<div class="granular-image-card selected">
  <div class="granular-image-preview">
    <img src="data:image/png;base64,..." />
    <span class="image-index">#1</span>
  </div>
  <div class="granular-image-content">
    <div class="granular-image-header">
      <span class="granular-image-name">Product Image</span>
      <input type="checkbox" checked />
    </div>
    <textarea placeholder="Describe transformation..."></textarea>
  </div>
</div>
```

### Styles

New CSS classes added:
- `.granular-image-list` - Scrollable container for image cards
- `.granular-image-card` - Individual image card
- `.granular-image-preview` - Thumbnail preview container
- `.granular-image-content` - Name and prompt container
- `.granular-image-prompt` - Individual prompt textarea
- `.granular-select-all` - Select all checkbox header
- `.granular-actions` - Execute/Cancel buttons container

## Files Modified

- `src/ui.ts` - Added UI components and handlers
- `src/code.ts` - Added `analyzeFrameForGranularEdit()` and `handleGranularImageEditing()`
- `src/types.ts` - Added TypeScript interfaces

## Usage Example

1. Select a frame containing multiple images
2. Click "🔍 Analyze Frame for Editing"
3. Wait for images to load with previews
4. For each image you want to edit:
   - Ensure the checkbox is selected
   - Write a specific prompt (e.g., "Make this golden retriever", "Add sunset lighting")
5. Click "🚀 Execute Granular Edit"
6. The plugin will:
   - Duplicate the frame with Dogo naming
   - Edit all selected images in parallel
   - Apply results to the duplicated frame
7. You'll have the original frame + edited frame side by side!

## Comparison with Batch Editing

| Feature | Batch Editing | Granular Editing |
|---------|---------------|------------------|
| Same prompt for all | ✅ | ❌ |
| Individual prompts | ❌ | ✅ |
| Preview images | ❌ | ✅ |
| Select specific images | ❌ | ✅ |
| Parallel processing | ✅ | ✅ |
| Frame duplication | ✅ | ✅ |
