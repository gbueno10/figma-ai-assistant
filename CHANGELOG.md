# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [1.4.0] - 2026-01-27

### 🔒 Critical Production Fixes

- **Auto-Save Robustness**: Centralized auto-upload logic in `ImageGenerationHandler`
  - Upload now happens automatically after image generation, independent of UI state
  - No longer requires UI to be open or checkbox to be marked
  - Configuration read directly from `clientStorage`
  - Background execution prevents blocking user interaction
  - Guaranteed cloud backup even if UI crashes or closes

- **UUID-Based Node Mapping**: Robust frame duplication and node correspondence
  - Replaced position-based (x,y) search with UUID temporary IDs
  - 100% reliability even when Auto Layout changes positions
  - Works correctly when text changes size and shifts adjacent elements
  - Uses `setPluginData/getPluginData` for cross-clone preservation
  - Prevents "node not found" errors in responsive designs

- **Optimized Payload Strategy**: Context slicing for AI communications
  - Conditional property extraction based on modification type
  - 85% reduction for color-only operations (~47kb → ~7kb)
  - 80% reduction for text-only operations (~47kb → ~9kb)
  - 70% reduction for layout-only operations (~47kb → ~14kb)
  - Lower latency, reduced token costs, faster AI responses

### Added
- 🎯 **Granular Image Editing**: Edit multiple images in a frame with individual prompts
  - Analyze frame to extract all images with previews
  - Assign custom AI prompts to each image
  - Select/deselect specific images to edit
  - Parallel processing with Promise.all for speed
  - Frame duplication with Dogo naming convention
- 📖 New documentation: `docs/GRANULAR-IMAGE-EDITING.md`
- 🏷️ `tagNodesWithUUID()` utility function for pre-clone tagging
- 📦 Extraction strategies in `DesignAnalyzer` (color, text, layout, image, full)
- 🤖 Automatic strategy detection from user prompts

### Technical
- New message types: `analyze-frame-for-granular-edit`, `granular-image-edit`, `granular-frame-analyzed`, `granular-edit-progress`, `granular-edit-complete`, `granular-edit-error`
- New functions in `code.ts`: `analyzeFrameForGranularEdit()`, `handleGranularImageEditing()`
- New UI component `initGranularEditing()` with image card list
- TypeScript interfaces for granular editing in `types.ts`
- `uploadToDriveBackground()` private method in `ImageGenerationHandler`
- `analyzeStructureOptimized()` and `detectStrategyFromPrompt()` in `DesignAnalyzer`
- Payload size logging with estimated reduction percentage

### Fixed
- Auto-save silently failing when UI closes before upload completes
- Node mapping breaking when layouts change dynamically
- Excessive payload size causing unnecessary API costs and latency

---

## [1.3.1] - 2024-11-27

### Added
- 🐶 **Image Bank Browser**: Flexible naming convention parser supporting `{ai/stock}_{puppy/dog/adult}_{color}_{action}` format
- 🎯 Source filter dropdown (AI/STOCK) in Image Bank Browser UI
- 📝 Multi-word action support (e.g., "lying_down" → "lying down")
- ✅ Backward compatibility with legacy naming formats
- 🔄 Age mapping system: puppy→puppy, dog→adult, adult→adult
- 🎨 Four-column filter system: Source, Age, Color, Action

### Changed
- 📦 Updated Image Bank parser to validate file types: puppy, dog, adult
- 📦 Updated Image Bank parser to validate sources: ai, stock

### Technical
- Regex for n8n validation: `^(ai|stock)_(puppy|dog|adult)_[a-z]+(_[a-z]+)+\.(png|jpg|jpeg|gif|webp)$`
- ParsedImage interface extended with source field
- Filter population and application logic enhanced

---

## [1.3.0] - 2024-11-25

### Added
- 🎨 AI Design Modification with natural language
- 🔀 Frame Iterator with shuffle and spotlight variations
- 📏 Quick Resize for vertical formats (1080x1350)
- 🖼️ AI Image Editing for frame contents
- ☁️ Google Drive integration for exports
- 🐳 Fully dockerized backend
- 🤖 Binary search optimization for text modifications

### Changed
- Improved error handling and progress tracking
- Enhanced UI with modern gradient design
- Better TypeScript types and interfaces

---

## [1.2.0] - Previous Release

### Added
- Initial Google Drive OAuth2 flow
- Auto-save feature for generated images
- Frame duplication logic

---

## [1.1.0] - Previous Release

### Added
- Image generation with OpenAI DALL-E
- Backend API structure
- Basic plugin UI

---

## [1.0.0] - Initial Release

### Added
- Basic Figma plugin structure
- OpenAI integration
- Design analysis capabilities
