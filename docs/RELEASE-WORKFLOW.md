# 🚀 Release Workflow Guide

This document explains how to properly release a new version of the Figma AI Assistant.

## 📋 Before You Start

- [ ] All changes are committed and pushed
- [ ] Backend Docker image is tested and working
- [ ] Plugin is tested in Figma Desktop
- [ ] Documentation is up to date

## 🔄 Release Steps

### 1. Update Version Numbers

Update the version in both files:

```bash
# Edit these files:
- package.json (version field)
- manifest.json (version field)
```

### 2. Commit Version Bump

```bash
git add package.json manifest.json
git commit -m "chore: bump version to X.Y.Z"
git push
```

### 3. Create Git Tag

```bash
# Create tag
git tag vX.Y.Z

# Push tag to GitHub
git push origin vX.Y.Z
```

### 4. Build Release Package

```bash
# Use the automated script
make pack

# Or manually:
./scripts/pack-plugin.sh
```

This creates: `figma-ai-assistant-vX.Y.Z.zip`

### 5. Publish on GitHub

1. Go to: https://github.com/gbueno10/figma-ai-assistant/releases
2. Click **"Draft a new release"**
3. **Choose tag:** Select `vX.Y.Z`
4. **Release title:** `v.X.Y.Z - Brief Description`
5. **Description:** Write release notes (see template below)
6. **Attach file:** Upload the `.zip` created in step 4
7. Click **"Publish release"**

### 6. Update Docker Hub (Backend)

If backend changed:

```bash
cd backend
docker build -t gbueno10/figma-ai-backend:vX.Y.Z .
docker push gbueno10/figma-ai-backend:vX.Y.Z

# Also update latest tag
docker tag gbueno10/figma-ai-backend:vX.Y.Z gbueno10/figma-ai-backend:latest
docker push gbueno10/figma-ai-backend:latest
```

## 📝 Release Notes Template

```markdown
## 🎉 What's New

- Feature 1
- Feature 2
- Improvement 1

## 🐛 Bug Fixes

- Fix 1
- Fix 2

## 📦 Installation

Download `figma-ai-assistant-vX.Y.Z.zip` and follow the [Installation Guide](../README.md).

## 🐳 Backend

Docker image: `gbueno10/figma-ai-backend:vX.Y.Z`

## 📚 Full Changelog

See [CHANGELOG.md](../CHANGELOG.md) for details.
```

## ✅ Post-Release Checklist

- [ ] Release is visible on GitHub Releases page
- [ ] `.zip` file is downloadable
- [ ] Docker image is available on Docker Hub
- [ ] Documentation mentions the new version
- [ ] Community is notified (if applicable)

## 🔧 Quick Commands

```bash
# Complete release workflow
make pack                    # Build and package
git tag vX.Y.Z              # Create tag
git push origin vX.Y.Z      # Push tag
# Then manually upload to GitHub Releases

# Check current version
node -p "require('./package.json').version"

# List all tags
git tag -l

# Delete a tag (if needed)
git tag -d vX.Y.Z
git push origin :refs/tags/vX.Y.Z
```

## 🆘 Troubleshooting

### Package won't build
- Check `npm run build` works
- Verify `dist/` folder is created
- Check file permissions on `scripts/pack-plugin.sh`

### Tag already exists
```bash
# Delete local tag
git tag -d vX.Y.Z

# Delete remote tag
git push origin :refs/tags/vX.Y.Z

# Create tag again
git tag vX.Y.Z
git push origin vX.Y.Z
```

## 📚 References

- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Semantic Versioning](https://semver.org/)
- [Docker Hub Tags](https://hub.docker.com/r/gbueno10/figma-ai-backend/tags)
