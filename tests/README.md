# 🧪 Test Scripts

Test scripts to validate backend APIs directly (without going through the Figma plugin).

## 📋 Files

### `test-comparison.js`
Compares different design processing approaches.

### `test-direct-design-modifications.js`
Tests the `/api/design/modifications` endpoint directly.

**Usage:**
```bash
node tests/test-direct-design-modifications.js [file.json]
```

### `test-direct-openai.js`
Tests direct OpenAI API calls through the backend.

**Usage:**
```bash
node tests/test-direct-openai.js [payload.json]
```

### `payload.json`
Sample file with design data to use in tests.

## 🔧 Configuration

These scripts automatically read the `OPENAI_API_KEY` from the `backend/.env` file.

## ⚠️ Note

These are manual/exploratory test scripts. For automated testing, consider using Jest or Mocha.
