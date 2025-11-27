# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
