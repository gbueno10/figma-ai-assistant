# Frame Iterator Feature

## Overview

The **Frame Iterator** is a new algorithmic layout variation tool added to the Figma AI Assistant plugin. Unlike AI-powered features, this operates instantly without API calls, making it perfect for rapid iteration and creative exploration.

## Features

### 🔀 Shuffle Position
Randomly redistributes elements within a frame while maintaining their sizes and properties.

**How it works:**
1. Select a frame with multiple unlocked elements
2. Click "🔀 Shuffle Position"
3. Creates a duplicate frame with elements shuffled to different positions
4. Text styles are automatically adjusted to fit new dimensions

**Use cases:**
- Breaking creative blocks with random layouts
- Testing alternative compositions quickly
- Finding unexpected design solutions

### 👑 Spotlight Variations
Generates multiple variations of a frame, each "spotlighting" a different element as the main focus.

**How it works:**
1. Select a frame with multiple elements
2. Click "👑 Spotlight Variations"
3. Detects the current "main" element (largest or most central)
4. Creates N variations where each element takes a turn as the main focus
5. Swaps positions and sizes intelligently

**Use cases:**
- A/B testing different focal points
- Creating carousel variants for ads
- Exploring which element should be the hero

## Architecture

The feature follows the plugin's modular structure:

### Files Created

1. **`src/utils/frameIteratorUtils.ts`**
   - `shuffleArray()`: Fisher-Yates shuffle algorithm
   - `detectMainGroup()`: Smart detection of the primary element
   - `loadFontsForNode()`: Ensures all fonts are loaded before text manipulation
   - `adjustTextStyles()`: Proportionally scales text, padding, spacing, and corners
   - `incrementFrameVersion()`: Intelligent frame naming with version numbers

2. **`src/handlers/frameIteratorHandler.ts`**
   - `handleShuffleElements()`: Main logic for position shuffling
   - `handleGenerateSpotlight()`: Main logic for spotlight variations

3. **Updates to existing files:**
   - `src/code.ts`: Added message handlers for `shuffle-elements` and `generate-spotlight`
   - `src/ui.ts`: Added Frame Iterator card with two action buttons

## Technical Highlights

### Smart Text Adjustment
When elements are resized, the system:
- Calculates scale factors (X and Y)
- Adjusts font size proportionally
- Updates line height, paragraph spacing
- Adjusts Auto Layout padding and spacing
- Scales corner radius

### Font Loading
- Recursively collects all fonts used in a node tree
- Handles mixed fonts (different fonts in the same text node)
- Loads fonts asynchronously before applying changes
- Gracefully handles missing fonts

### Element Detection
The `detectMainGroup()` function uses two strategies:
1. **Area-based**: Finds the largest element
2. **Position-based**: Finds the most central element
- Returns the element that scores high on both criteria

### Frame Naming
Intelligently increments version numbers:
- `Frame_v1` → `Frame_v2`, `Frame_v3`...
- `Banner_v2a` → `Banner_v3a`, `Banner_v4a`...
- If no version exists, adds `_v2`, `_v3`...

## Benefits

✅ **Instant**: No API calls, no waiting  
✅ **Free**: No token costs  
✅ **Creative**: Breaks mental blocks with randomization  
✅ **Professional**: Maintains text scaling and proportions  
✅ **Non-destructive**: Always creates duplicates, never modifies originals  

## Usage Tips

1. **Lock elements** you don't want to shuffle (backgrounds, logos, etc.)
2. **Use consistent naming** like `_v1` for better version tracking
3. **Combine with AI features**: Use Frame Iterator for layout, then AI for content
4. **Spotlight works best** with 3-7 elements (not too few, not too many)

## Future Enhancements

Possible additions:
- Grid-based shuffling (maintain alignment)
- Weighted shuffling (prefer certain positions)
- Animation timeline generation
- Color scheme rotation
- Export to video/GIF

## Integration with Existing Features

The Frame Iterator complements the plugin's AI features:
- **AI Design Modification**: Use for content changes
- **Frame Iterator**: Use for layout exploration
- **AI Image Generation**: Generate assets
- **Quick Resize**: Export to different formats

Together, they create a complete design iteration workflow.
