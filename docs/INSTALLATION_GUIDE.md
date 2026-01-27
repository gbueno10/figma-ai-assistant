# Figma AI Assistant - Complete Installation Guide

> **Version:** 1.4.0
> **Last Updated:** January 27, 2026
> **Author:** Dogo Projects Team

This guide provides step-by-step instructions to install, configure, and deploy the Figma AI Assistant plugin and its backend service.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start (Local Development)](#quick-start-local-development)
3. [Backend Setup](#backend-setup)
   - [Option A: Docker (Recommended)](#option-a-docker-recommended)
   - [Option B: Manual Installation](#option-b-manual-installation)
4. [Plugin Installation](#plugin-installation)
5. [Configuration](#configuration)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Support](#support)

---

## System Requirements

### Required Software

- **Figma Desktop App** (latest version)
- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Docker** (optional, recommended for backend)
- **Git** (for cloning the repository)

### API Keys Required

You will need the following API keys before installation:

- ✅ **OpenAI API Key** (required)
  - Get it from: https://platform.openai.com/api-keys
  - Used for AI features (design analysis, modifications, image generation)

- 🔑 **Runware API Key** (optional, for alternative image generation)
  - Get it from: https://runware.ai

- 🔐 **Google Cloud OAuth2 Credentials** (optional, for Google Drive integration)
  - Client ID
  - Client Secret
  - Get them from: https://console.cloud.google.com/apis/credentials

---

## Quick Start (Local Development)

For team members who want to get started quickly:

```bash
# 1. Clone the repository
git clone https://github.com/gbueno10/figma-ai-assistant.git
cd figma-ai-assistant

# 2. Install plugin dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 4. Start backend with Docker
docker-compose up -d

# 5. Build the plugin
npm run build

# 6. Import into Figma
# In Figma: Plugins → Development → Import plugin from manifest
# Select: /path/to/figma-ai-assistant/manifest.json
```

---

## Backend Setup

The backend is a Node.js/Express API that handles all AI processing. You can run it via Docker (recommended) or manually.

### Option A: Docker (Recommended)

#### Step 1: Install Docker

Download and install Docker Desktop:
- **Windows/Mac:** https://www.docker.com/products/docker-desktop
- **Linux:** https://docs.docker.com/engine/install/

#### Step 2: Configure Environment Variables

Create a `.env` file in the **project root** (not in backend/):

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and set your API keys:

```env
# REQUIRED: OpenAI API Key
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# REQUIRED: Backend port (default: 3000)
FIGMA_AI_BACKEND_PORT=3000

# OPTIONAL: CORS allowed origins (leave empty to allow all)
CORS_ORIGIN=

# OPTIONAL: Google Drive OAuth2 (for cloud storage integration)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/drive/callback
```

#### Step 3: Start the Backend Container

```bash
# Build and start the container
docker-compose up -d

# Check if it's running
docker-compose ps

# Expected output:
# NAME                 IMAGE                 STATUS
# figma-ai-backend     ...                   Up (healthy)
```

#### Step 4: Verify Backend is Running

Open your browser and go to:
```
http://localhost:3000/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-01-27T..."
}
```

#### Useful Docker Commands

```bash
# View logs
docker-compose logs -f backend

# Restart backend
docker-compose restart backend

# Stop backend
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

---

### Option B: Manual Installation

If you prefer not to use Docker:

#### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

#### Step 2: Configure Environment Variables

```bash
# Copy example
cp .env.example .env

# Edit .env with your API keys
nano .env  # or use your preferred editor
```

Set the same variables as in Docker option.

#### Step 3: Build and Start Backend

**For Development (with hot reload):**
```bash
npm run dev
```

**For Production:**
```bash
npm run build
npm start
```

Backend will start on http://localhost:3000

---

## Plugin Installation

### Step 1: Build the Plugin

From the project root:

```bash
npm install
npm run build
```

This generates the `dist/` folder with compiled plugin code.

### Step 2: Import into Figma

1. Open **Figma Desktop App** (not browser version)
2. Go to **Plugins → Development → Import plugin from manifest**
3. Navigate to your project folder and select `manifest.json`
4. Click **Open**

The plugin will appear in your development plugins list.

### Step 3: Verify Installation

1. Open any Figma file
2. Go to **Plugins → Development → AI Design Assistant**
3. The plugin UI should load
4. Click the **Settings (⚙️)** tab
5. Set **Backend URL** to: `http://localhost:3000`
6. Click **Save Settings**

---

## Configuration

### Plugin Settings

After installing the plugin, configure it via the Settings tab:

#### Required Settings

- **Backend URL**
  - Development: `http://localhost:3000`
  - Production: `https://your-backend-domain.com`

- **OpenAI API Key**
  - Optional (if not set in backend)
  - Can be set per-user for individual billing

#### Optional Settings

- **Runware API Key** (alternative image generation)
- **Image Model** (select AI model for image generation)
- **Google Drive Folder ID** (for auto-save to Drive)

### Google Drive Integration Setup

To enable auto-save to Google Drive:

#### 1. Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Create a new project: "Figma AI Assistant"
3. Enable **Google Drive API**:
   - APIs & Services → Enable APIs and Services
   - Search for "Google Drive API"
   - Click "Enable"

#### 2. Create OAuth2 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Configure consent screen if prompted:
   - User Type: Internal (if for organization) or External
   - App name: "Figma AI Assistant"
   - User support email: your email
   - Developer contact: your email
4. Application type: **Web application**
5. Name: "Figma AI Backend"
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/drive/callback
   https://your-production-domain.com/api/drive/callback
   ```
7. Click **Create**
8. Copy **Client ID** and **Client Secret**

#### 3. Update Environment Variables

Add to your `.env` file:

```env
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdef123456
GOOGLE_REDIRECT_URI=http://localhost:3000/api/drive/callback
```

Restart backend:
```bash
docker-compose restart backend
# or if running manually: npm start
```

#### 4. Connect Plugin to Drive

1. In Figma plugin, go to **Google Drive** tab
2. Click **Connect to Google Drive**
3. Follow OAuth flow in browser
4. Grant permissions
5. Select/create "Image Bank" folder
6. Enable **Auto-save**

---

## Production Deployment

### Backend Deployment

#### Option 1: Docker on VPS/Cloud

Deploy to any cloud provider (AWS, DigitalOcean, GCP, Azure):

```bash
# On your server
git clone https://github.com/gbueno10/figma-ai-assistant.git
cd figma-ai-assistant

# Configure production environment
cp .env.example .env
nano .env  # Set production API keys

# Use production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 2: Managed Container Services

- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **Heroku**

See `docker-compose.prod.yml` for production configuration.

### Plugin Publishing

#### Publish to Figma Plugin Hub

1. In Figma: **Plugins → Development → Manage plugins**
2. Find "AI Design Assistant"
3. Click **⋮ → Publish new release**
4. Fill in plugin details:
   - **Name:** AI Design Assistant
   - **Description:** AI-powered design analysis, modifications, and image generation
   - **Tags:** ai, productivity, design-tools
   - **Icon:** Upload 512x512 PNG
5. Set visibility:
   - **Private:** Only you can use it
   - **Organization:** Team members with access
   - **Public:** Anyone can install (requires review)
6. Submit for review (if public)

#### Organization-Wide Installation

For company deployment:

1. Publish to **Organization Only**
2. Share plugin link with team members
3. They can install from Figma Community → Your Organization

---

## Troubleshooting

### Plugin Issues

#### Plugin doesn't load
- ✅ Ensure Figma Desktop App is installed (not browser)
- ✅ Check that `manifest.json` and `dist/` folder exist
- ✅ Try reimporting: Plugins → Development → Remove → Reimport

#### "Backend not reachable" error
- ✅ Verify backend is running: `curl http://localhost:3000/health`
- ✅ Check backend URL in plugin settings matches actual URL
- ✅ If using Docker: `docker-compose ps` shows "healthy" status

#### "API Key invalid" error
- ✅ Verify OPENAI_API_KEY in `.env` file
- ✅ Check key has not expired or reached rate limit
- ✅ Test key directly: https://platform.openai.com/playground

### Backend Issues

#### Container won't start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Missing .env file → Create it from .env.example
# - Port 3000 in use → Change FIGMA_AI_BACKEND_PORT in .env
# - Invalid API key → Update OPENAI_API_KEY in .env
```

#### "MODULE_NOT_FOUND" error
```bash
# Rebuild the container
docker-compose down
docker-compose up -d --build
```

#### High memory usage
```bash
# Restart container
docker-compose restart backend

# If persists, increase Docker memory limit:
# Docker Desktop → Settings → Resources → Memory → 4GB+
```

### Google Drive Integration Issues

#### OAuth redirect fails
- ✅ Verify `GOOGLE_REDIRECT_URI` matches exactly in:
  - `.env` file
  - Google Cloud Console → Credentials
- ✅ Use exact URL (including http:// vs https://)

#### "Access denied" error
- ✅ Ensure Google Drive API is enabled
- ✅ Check OAuth consent screen is configured
- ✅ For internal apps, user must be in your organization

---

## Support

### Documentation

- **Full Changelog:** [CHANGELOG.md](../CHANGELOG.md)
- **Granular Image Editing:** [GRANULAR-IMAGE-EDITING.md](GRANULAR-IMAGE-EDITING.md)
- **API Documentation:** [backend/README.md](../backend/README.md)

### Getting Help

- **GitHub Issues:** https://github.com/gbueno10/figma-ai-assistant/issues
- **Internal Team:** Contact Dogo Projects DevOps team

### Version Information

- **Plugin Version:** 1.4.0
- **Backend API Version:** 1.0
- **Node.js:** 20.x
- **Figma API:** 1.0.0

---

## Quick Reference

### Essential Commands

```bash
# Plugin development
npm run build           # Build plugin
npm run watch           # Auto-rebuild on changes

# Backend (Docker)
docker-compose up -d    # Start backend
docker-compose down     # Stop backend
docker-compose logs -f  # View logs

# Backend (Manual)
cd backend
npm run dev            # Development mode
npm run build          # Production build
npm start              # Start production

# Testing
curl http://localhost:3000/health  # Check backend health
```

### Default Ports

- **Backend API:** 3000
- **Frontend Dev Server:** (not used, plugin runs in Figma)

### File Locations

- **Plugin Code:** `src/`
- **Backend Code:** `backend/src/`
- **Built Plugin:** `dist/`
- **Built Backend:** `backend/dist/`
- **Configuration:** `.env` (root), `backend/.env`

---

**Last Updated:** January 27, 2026
**Document Version:** 1.0.0
**Maintained by:** Dogo Projects Team
