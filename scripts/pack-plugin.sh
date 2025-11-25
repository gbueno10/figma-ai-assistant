#!/bin/bash

# Figma AI Assistant - Plugin Release Packager
# Creates a clean zip file ready for distribution

set -e  # Exit on error

VERSION=$(node -p "require('./package.json').version")
OUTPUT_FILE="figma-ai-assistant-v${VERSION}.zip"

echo "📦 Figma AI Assistant - Release Packager"
echo "========================================"
echo ""
echo "Version: v${VERSION}"
echo ""

# 1. Clean old builds
echo "🧹 Cleaning old builds..."
rm -rf dist
rm -f figma-ai-assistant-*.zip

# 2. Build the plugin
echo "🏗️  Building plugin..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: dist/ folder not created. Build failed?"
    exit 1
fi

# 3. Create user-friendly README
echo "📝 Creating user README..."
cat > INSTALL.md << 'EOF'
# 🎨 Figma AI Assistant - Installation Guide

## Quick Start

### 1. Start the Backend (Docker)

```bash
# Copy and edit the environment file
cp backend/.env.example backend/.env
# Edit backend/.env and add your OpenAI API key

# Start backend
docker-compose up -d

# Check if it's running
curl http://localhost:3000/health
```

### 2. Install Plugin in Figma

1. Open Figma Desktop
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select the `manifest.json` file from this folder
4. Done! 🎉

### 3. Configure Plugin

1. Open the plugin in Figma
2. Configure backend URL: `http://localhost:3000/api`
3. (Optional) Add your OpenAI API key if not using backend's key

## Need Help?

- 📚 Full documentation: https://github.com/gbueno10/figma-ai-assistant
- 🐛 Issues: https://github.com/gbueno10/figma-ai-assistant/issues

## System Requirements

- Docker Desktop (for backend)
- Figma Desktop App
- OpenAI API Key
EOF

# 4. Create the zip with only what users need
echo "📦 Creating release package..."
zip -r "$OUTPUT_FILE" \
    manifest.json \
    dist/ \
    INSTALL.md \
    README.md \
    docker-compose.simple.yml \
    backend/.env.example \
    -x "*.DS_Store" "*.map"

# 5. Clean up temporary files
rm -f INSTALL.md

# 6. Success message
echo ""
echo "✅ Release package created successfully!"
echo ""
echo "📦 File: $OUTPUT_FILE"
echo "📊 Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
echo ""
echo "🚀 Next steps:"
echo "   1. Test the package locally"
echo "   2. Create a git tag: git tag v${VERSION}"
echo "   3. Push the tag: git push origin v${VERSION}"
echo "   4. Go to GitHub Releases and upload $OUTPUT_FILE"
echo ""
