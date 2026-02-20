const styles = `
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 0;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.container {
  max-width: 420px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px 20px;
  text-align: center;
  position: relative;
}

.header::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background: #667eea;
  border-radius: 2px;
}

.main-content {
  flex: 1;
  padding: 24px 20px;
  overflow-y: auto;
  background: #ffffff;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
  font-weight: 400;
}

.ai-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.ai-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-description {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #374151;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: #ffffff;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea {
  resize: vertical;
  min-height: 60px;
  max-height: 120px;
}

button {
  width: 100%;
  padding: 14px 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 12px;
  box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.4);
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(102, 126, 234, 0.5);
}

button:active {
  transform: translateY(0);
}

button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.preview-list {
  display: none;
  margin-top: 12px;
  padding: 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  border: 1px solid #e2e8f0;
  color: #1f2937;
  font-size: 13px;
}

.preview-list ul {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
}

.preview-list li {
  padding: 6px 0;
  border-bottom: 1px solid #e5e7eb;
}

.preview-list li:last-child {
  border-bottom: none;
}

.preview-list .preview-index {
  font-weight: 600;
  color: #4f46e5;
  margin-right: 8px;
}

.preview-list .preview-meta {
  color: #475569;
  font-size: 12px;
  margin-left: 6px;
}

.preview-actions {
  display: none;
  margin-top: 12px;
  flex-direction: column;
  gap: 8px;
}

.preview-actions button {
  margin-bottom: 0;
}

.preview-actions button + button {
  margin-top: 8px;
}

button.secondary {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  box-shadow: 0 4px 6px -1px rgba(100, 116, 139, 0.4);
}

button.secondary:hover {
  box-shadow: 0 6px 8px -1px rgba(100, 116, 139, 0.5);
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.quick-actions button {
  margin-bottom: 0;
  font-size: 13px;
  padding: 12px 8px;
}

.result {
  margin-top: 16px;
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  border: none;
}

.result.success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #166534;
  border-left: 4px solid #22c55e;
}

.result.error {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  color: #dc2626;
  border-left: 4px solid #ef4444;
}

.loading {
  display: none;
  margin-top: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #f3f4f6;
  text-align: center;
  font-size: 14px;
  color: #1f2937;
}

.progress-container {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
  margin: 10px 0;
  overflow: hidden;
}

.progress-bar {
  width: 0;
  height: 100%;
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  border-radius: 999px;
  transition: width 0.2s ease;
}

.checkbox-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  transition: all 0.2s ease;
  cursor: pointer;
}

.checkbox-option.selected {
  border-color: #6366f1;
  background: #eef2ff;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
}

.checkbox-option input {
  width: 16px;
  height: 16px;
  margin: 0;
}

.json-output {
  background: #0f172a;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 10px;
  margin-top: 12px;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Fira Code', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  line-height: 1.4;
  border: 1px solid rgba(148, 163, 184, 0.4);
  position: relative;
}

.json-output.minimized {
  max-height: 80px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.json-output.minimized::after {
  content: '▼ Click to expand';
  position: absolute;
  bottom: 8px;
  right: 12px;
  background: rgba(15, 23, 42, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #94a3b8;
}

.json-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.json-actions button {
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
  margin-bottom: 0;
}

.api-key-info {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.settings-section {
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  border-radius: 16px;
  padding: 0;
  margin-bottom: 20px;
  border: 1px solid #e0e7ff;
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.1), 0 4px 6px -2px rgba(129, 140, 248, 0.05);
  overflow: hidden;
}

.settings-header {
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s ease;
  user-select: none;
}

.settings-header:hover {
  background: rgba(79, 70, 229, 0.05);
}

.settings-title {
  font-size: 15px;
  font-weight: 600;
  color: #4338ca;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.settings-toggle {
  font-size: 18px;
  color: #4338ca;
  transition: transform 0.2s ease;
}

.settings-toggle.expanded {
  transform: rotate(180deg);
}

.settings-content {
  padding: 0 20px 20px 20px;
  display: none;
}

.settings-content.expanded {
  display: block;
}

.progress-text {
  font-size: 12px;
  color: #475569;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.4);
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.6);
}

.image-bank-item {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  background: #f1f5f9;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid transparent;
}

.image-bank-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.image-bank-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-bank-item-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
  font-size: 10px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Granular Image Editing Styles */
.granular-image-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

.granular-image-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
}

.granular-image-card:hover {
  border-color: #c7d2fe;
  background: #fafbff;
}

.granular-image-card.selected {
  border-color: #667eea;
  background: #eef2ff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.granular-image-preview {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #e2e8f0;
  position: relative;
}

.granular-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.granular-image-preview .image-index {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.granular-image-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.granular-image-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.granular-image-name {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.granular-image-checkbox {
  flex-shrink: 0;
}

.granular-image-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.granular-image-prompt {
  width: 100%;
  min-height: 50px;
  max-height: 80px;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  font-family: inherit;
  resize: vertical;
  background: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.granular-image-prompt:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.granular-image-prompt::placeholder {
  color: #94a3b8;
  font-style: italic;
}

.granular-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.granular-actions button {
  flex: 1;
  margin-bottom: 0;
}

.granular-select-all {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f1f5f9;
  border-radius: 8px;
  margin-bottom: 12px;
}

.granular-select-all label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  margin: 0;
  cursor: pointer;
}

/* Image Bank Browser Styles */
.image-bank-filters {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 16px 0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-group select {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  background-color: #f8fafc;
  transition: all 0.2s ease;
}

.filter-group select:focus {
  border-color: #667eea;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.image-bank-grid-container {
  margin-top: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.image-bank-header {
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-bank-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: #e2e8f0;
  max-height: 420px;
  overflow-y: auto;
}

.image-bank-item {
  aspect-ratio: 1;
  background: white;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
}

.image-bank-item:hover {
  z-index: 10;
  transform: scale(1.05);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.image-bank-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-bank-item-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  font-size: 9px;
  padding: 12px 6px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-bank-item:hover .image-bank-item-name {
  opacity: 1;
}

.image-bank-downloading {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.granular-select-all input {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.granular-image-count {
  font-size: 12px;
  color: #64748b;
}

.granular-empty-state {
  text-align: center;
  padding: 24px;
  color: #64748b;
  font-size: 13px;
}

.granular-empty-state .icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.image-bank-downloading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}
`;

const template = `
<div class="container">
  <div class="header">
    <h1>🤖 Figma AI Assistant</h1>
  </div>
  <div class="main-content">
    <div class="settings-section">
      <div class="settings-header" id="settingsHeader">
        <div class="settings-title">⚙️ Settings and Setup</div>
        <div class="settings-toggle">▼</div>
      </div>
      <div class="settings-content" id="settingsContent">
        <div class="form-group">
          <label for="apiKey">OpenAI API Key:</label>
          <input type="password" id="apiKey" placeholder="sk-...">
        </div>
        <div class="form-group">
          <label for="runwareApiKey">Runware API Key:</label>
          <input type="password" id="runwareApiKey" placeholder="Runware API Key">
          <div class="api-key-info">
            🔒 Stored locally and securely
          </div>
        </div>
        <div class="form-group">
          <label for="backendUrl">Backend URL:</label>
          <input type="text" id="backendUrl" placeholder="http://localhost:3000/api">
          <div class="api-key-info">
            🌐 Defaults to the local Docker container
          </div>
        </div>

        <!-- Google Drive Configuration -->
        <div class="form-group" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <label style="font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span id="driveStatusIcon">⚠️</span>
            <span>Google Drive Configuration</span>
          </label>
          <div id="driveStatusMessage" style="font-size: 12px; color: #64748b; margin-bottom: 12px; padding: 8px; background: #f8fafc; border-radius: 6px;">
            ⚠️ Not connected. <a href="#" id="scrollToDriveSetup" style="color: #667eea; text-decoration: underline;">Connect below</a>
          </div>
          
          <!-- Connect/Disconnect buttons in Settings -->
          <div style="margin-bottom: 16px;">
            <button id="settingsConnectDriveBtn" type="button" class="secondary" style="display: none;">
              🔗 Connect Google Drive
            </button>
            <button id="settingsDisconnectDriveBtn" type="button" class="secondary" style="display: none;">
              🔌 Disconnect Drive
            </button>
          </div>
          
          <div class="form-group">
            <label for="exportsFolder">📤 Exports Folder ID:</label>
            <input type="text" id="exportsFolder" placeholder="Google Drive folder ID for frame exports" />
            <div class="api-key-info">
              📁 Paste the folder ID from your Google Drive URL
            </div>
          </div>

          <div class="form-group">
            <label for="imageBankFolder">🖼️ Image Bank Folder ID:</label>
            <input type="text" id="imageBankFolder" placeholder="Google Drive folder ID for AI-generated images" />
            <div class="api-key-info">
              🎨 Auto-save generated images to this folder
            </div>
          </div>
        </div>
        
        <button id="analyzeBtn" class="secondary" style="margin-top: 12px;">
          📊 Analyze Design (Show JSON)
        </button>
        <div id="jsonOutput" class="json-output" style="display: none;"></div>
        <div id="jsonActions" class="json-actions" style="display: none;">
          <button id="copyJsonBtn" class="secondary">
            📋 Copy JSON
          </button>
          <button id="closeJsonBtn" class="secondary">
            ✕ Close
          </button>
        </div>
      </div>
    </div>

    <div class="ai-card">
      <div class="card-title">
        🎨 AI Design Modification
      </div>
      <div class="card-description">
        Describe your desired changes in natural language and let AI transform your design intelligently.
      </div>
      <form id="modifyForm">
        <div class="form-group">
          <label for="modifyPrompt">Describe modifications:</label>
          <textarea id="modifyPrompt" placeholder="Make the design more modern, change colors to a dark theme, improve typography hierarchy..." required></textarea>
        </div>
        <div class="form-group">
          <label>Modification Types:</label>
          <div class="checkbox-group">
            <label class="checkbox-option">
              <input type="checkbox" name="modifyTypes" value="text" checked> Text
            </label>
            <label class="checkbox-option">
              <input type="checkbox" name="modifyTypes" value="color" checked> Colors
            </label>
          </div>
        </div>
        <button type="submit" id="modifyBtn">
          🚀 Transform with AI
        </button>
      </form>
      <div class="loading" id="loadingModify">
        ⏳ Transforming design...
        <div class="progress-container">
          <div class="progress-bar" id="progressBarModify"></div>
        </div>
        <div class="progress-text" id="progressTextModify"></div>
      </div>
      <div id="resultModify"></div>
    </div>

    <div class="ai-card">
      <div class="card-title">
        🔀 Frame Iterator
      </div>
      <div class="card-description">
        Automatically generate layout variations by shuffling elements or creating spotlight versions.
      </div>
      <div class="quick-actions">
        <button id="shuffleElementsBtn" type="button">
          🔀 Shuffle Position
        </button>
        <button id="spotlightBtn" type="button">
          👑 Spotlight Variations
        </button>
      </div>
      <div id="resultIterator"></div>
    </div>

    <div class="ai-card">
      <div class="card-title">
        🎨 AI Image Generation
      </div>
      <div class="card-description">
        Generate new images or regenerate selected images using AI. Select one or more images to regenerate, or create new ones.
      </div>
      <div class="form-group" style="margin-top: 12px; background: #f0fdf4; padding: 12px; border-radius: 6px; border: 1px solid #bbf7d0;">
        <label class="checkbox-option" style="margin-bottom: 8px;">
          <input type="checkbox" id="autoSaveDrive" checked> 
          💾 Auto-save to Google Drive (Image Bank)
        </label>
        <div id="driveStatusIndicator" style="font-size: 11px; color: #64748b; margin-top: 8px; padding-top: 8px; border-top: 1px solid #bbf7d0;">
          <div id="driveConnectionStatus">⚠️ Drive not configured. <a href="#" id="scrollToDriveConfig" style="color: #059669; text-decoration: underline; cursor: pointer;">Configure now</a></div>
        </div>
      </div>
      <div class="quick-actions">
        <button id="generateNewBtn" type="button">
          ✨ New Image
        </button>
        <button id="regenerateBtn" type="button">
          🔄 Regenerate Selected
        </button>
      </div>
      <form id="imageForm" style="display: none;">
        <div class="form-group">
          <label for="imagePrompt">Image description:</label>
          <textarea id="imagePrompt" placeholder="A children's book drawing of a veterinarian using a stethoscope to listen to the heartbeat of a baby otter..." required></textarea>
        </div>
        <div class="form-group">
          <label for="imageSize">Size:</label>
          <select id="imageSize">
            <option value="1024x1024">Square (1024x1024)</option>
            <option value="1024x1792">Portrait (1024x1792)</option>
            <option value="1792x1024">Landscape (1792x1024)</option>
          </select>
        </div>
        <div class="form-group">
          <label for="imageModel">Model:</label>
          <select id="imageModel">
            <option value="runware:100@1">Runware Fast</option>
            <option value="google:4@2">Nano Banana 2 (Best Quality)</option>
            <option value="openai:4@1">GPT Image 1.5</option>
          </select>
        </div>
        <button type="submit" id="generateBtn">
          🚀 Generate Image
        </button>
        <button type="button" id="cancelImageBtn" class="secondary">
          ❌ Cancel
        </button>
      </form>
      <div class="loading" id="loadingImage">
        ⏳ Generating image...
        <div class="progress-container">
          <div class="progress-bar" id="progressBarImage"></div>
        </div>
        <div class="progress-text" id="progressTextImage"></div>
      </div>
      <div id="resultImage"></div>
    </div>

    <div class="ai-card">
      <div class="card-title">
        🖼️ AI Image Editing
      </div>
      <div class="card-description">
        Edit all images within a selected frame using AI. Select a frame and describe the transformation you want to apply to all images inside it.
      </div>
      <form id="editImagesForm">
        <div class="form-group">
          <label for="editPrompt">Image editing prompt:</label>
          <textarea id="editPrompt" placeholder="Transform into a charcoal drawing, make it black and white, add a vintage filter..." required></textarea>
        </div>
        <button type="submit" id="editImagesBtn">
          🚀 Edit Frame Images
        </button>
      </form>
      <div class="loading" id="loadingEditImages">
        ⏳ Processing images...
        <div class="progress-container">
          <div class="progress-bar" id="progressBarEditImages"></div>
        </div>
        <div class="progress-text" id="progressTextEditImages"></div>
      </div>
      <div id="resultEditImages"></div>
    </div>

    <div class="ai-card">
      <div class="card-title">
        🎯 Granular Image Generation
      </div>
      <div class="card-description">
        Generate new images for each placeholder in a frame with individual prompts. Perfect for replacing multiple images with AI-generated content in one go.
      </div>
      <button type="button" id="analyzeFrameForGranularBtn">
        🔍 Analyze Frame Images
      </button>
      
      <div id="granularImageListContainer" style="display: none;">
        <div class="granular-select-all">
          <label>
            <input type="checkbox" id="granularSelectAll" checked />
            Select All Images
          </label>
          <span class="granular-image-count" id="granularImageCount">0 images</span>
        </div>
        
        <div class="granular-image-list" id="granularImageList">
          <!-- Image cards will be dynamically inserted here -->
        </div>

        <div class="form-group" style="margin-top: 16px;">
          <label for="granularImageModel">Model:</label>
          <select id="granularImageModel">
            <option value="runware:100@1">Runware Fast</option>
            <option value="google:4@2">Nano Banana 2 (Best Quality)</option>
            <option value="openai:4@1">GPT Image 1.5</option>
          </select>
        </div>

        <div class="granular-actions">
          <button type="button" id="executeGranularEditBtn" disabled>
            🚀 Generate All Images
          </button>
          <button type="button" id="cancelGranularEditBtn" class="secondary">
            ✕ Cancel
          </button>
        </div>
      </div>
      
      <div class="loading" id="loadingGranularEdit">
        ⏳ Generating images with individual prompts...
        <div class="progress-container">
          <div class="progress-bar" id="progressBarGranularEdit"></div>
        </div>
        <div class="progress-text" id="progressTextGranularEdit"></div>
      </div>
      <div id="resultGranularEdit"></div>
    </div>

  <div class="ai-card">
    <div class="card-title">
      📏 Quick Resize
    </div>
    <div class="card-description">
      Duplicates and resizes the selected 1080x1080 frame to new vertical formats.
    </div>
    <div class="quick-actions">
      <button id="resizeTo1350Btn" type="button">
        Vertical (1080x1350)
      </button>
      <button id="resizeTo1920Btn" type="button" disabled>
        Story (1080x1920)
      </button>
    </div>
    <div id="resultResize"></div>
  </div>

  <div class="ai-card">
    <div class="card-title" id="driveCardTitle">
      ☁️ Connect Google Drive
    </div>
    <div class="card-description" id="driveCardDescription">
      Connect your account to export frames directly to Drive.
    </div>
    
    <!-- State 1: Disconnected -->
    <div id="driveStateDisconnected" style="display: none;">
      <button id="connectDriveBtn" type="button">
        🔗 Connect Google Drive
      </button>
    </div>

    <!-- State 2: Connecting (Active Polling) -->
    <div id="driveStateConnecting" style="display: none;">
      <div class="loading" style="display: block;">
        <div style="margin-bottom: 12px;">🔄 Waiting for authorization...</div>
        <div class="spinner"></div>
        
        <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">
            📋 Copy and paste this URL in your browser:
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="text" id="authUrlInput" readonly 
                   style="flex: 1; font-size: 11px; padding: 8px; background: white; cursor: text; font-family: monospace;" />
            <button id="copyAuthUrlBtn" type="button" class="secondary" 
                    style="padding: 8px 12px; margin: 0; width: auto; font-size: 12px;">
              📋 Copy
            </button>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
            💡 After authorizing, this window will detect it automatically.
          </div>
        </div>
        
        <p style="margin-top: 12px; font-size: 13px; color: #64748b; text-align: center;">
          Don't close this Figma window while authorizing.
        </p>
      </div>
      <button id="cancelConnectBtn" type="button" class="secondary" style="margin-top: 12px;">
        ❌ Cancel
      </button>
    </div>

    <!-- State 3: Connected -->
    <div id="driveStateConnected" style="display: none;">
      <div style="font-size: 13px; color: #059669; background: #f0fdf4; padding: 12px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #bbf7d0;">
        ✅ <strong>Connected!</strong> Folders configured in Settings will be used automatically.
      </div>

      <button id="exportToDriveBtn" type="button">
        📤 Export Selected Frames
      </button>
      
      <button id="manualUploadBtn" type="button" class="secondary" style="margin-top: 8px;">
        🎨 Manual Upload Selection (Rename AI)
      </button>
      
      <button id="disconnectDriveBtn" type="button" class="secondary" style="margin-top: 8px;">
        🔌 Disconnect
      </button>
    </div>

    <!-- State 4: Error -->
    <div id="driveStateError" style="display: none;">
      <div class="result error" id="driveErrorMessage">
        ❌ Connection error. Please try again.
      </div>
      <button id="retryConnectBtn" type="button" style="margin-top: 12px;">
        🔄 Try Again
      </button>
    </div>

    <!-- Export Status -->
    <div id="driveExportStatus" style="display: none; margin-top: 12px; padding: 12px; border-radius: 8px; font-size: 13px;"></div>
  </div>

  <!-- 🐶 Image Bank Browser -->
  <div class="ai-card">
    <div class="card-title">🐶 Image Bank Browser</div>
    <div class="card-description">
      Browse and swap images from your Google Drive Image Bank. Select an element and click an image to replace it.
    </div>

    <!-- Filters -->
    <div class="image-bank-filters">
      <div class="filter-group">
        <label for="filterSource">Source</label>
        <select id="filterSource">
          <option value="">All</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filterAge">Age</label>
        <select id="filterAge">
          <option value="">All</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filterColor">Color</label>
        <select id="filterColor">
          <option value="">All</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filterAction">Action</label>
        <select id="filterAction">
          <option value="">All</option>
        </select>
      </div>
    </div>

    <!-- Load Button -->
    <button id="loadImageBankBtn" type="button">
      📂 Load Image Bank
    </button>

    <!-- Loading State -->
    <div id="imageBankLoading" class="loading" style="display: none;">
      <div class="spinner"></div>
      <div style="margin-top: 12px;">Loading Image Bank...</div>
    </div>

    <!-- Image Grid Container -->
    <div id="imageBankGrid" class="image-bank-grid-container" style="display: none;">
      <div class="image-bank-header">
        <div id="imageBankCount" style="font-size: 12px; font-weight: 600; color: #1e293b;"></div>
      </div>
      <div id="imageBankImages" class="image-bank-images"></div>
    </div>

    <!-- Empty State -->
    <div id="imageBankEmpty" class="empty-state" style="display: none;">
      <div class="empty-icon">📁</div>
      <div class="empty-text">No images found in Image Bank</div>
      <div class="empty-subtext">Check your folder configuration in Settings</div>
    </div>

    <!-- Status Message -->
    <div id="imageBankStatus" class="result" style="display: none;"></div>
  </div>

    <button id="closeBtn" class="secondary">❌ Close Assistant</button>
  </div>
</div>
`;

type PluginToUiMessage = {
  type: string;
  [key: string]: unknown;
};

let stylesInjected = false;
let messageListenerRegistered = false;
let suppressSettingsRender = false;

// Upload Queue Manager (Global scope for message handlers)
class UploadQueueManager {
  private MAX_CONCURRENT_UPLOADS = 3;
  private uploadQueue: Array<() => Promise<void>> = [];
  private activeUploads = 0;
  private completedUploads = 0;
  private totalUploadsExpected = 0;
  private failedUploads = 0;

  reset(): void {
    this.uploadQueue = [];
    this.activeUploads = 0;
    this.completedUploads = 0;
    this.totalUploadsExpected = 0;
    this.failedUploads = 0;
  }

  setTotalExpected(total: number): void {
    this.totalUploadsExpected = total;
    this.completedUploads = 0;
    this.failedUploads = 0;
  }

  addToQueue(uploadTask: () => Promise<void>): void {
    this.uploadQueue.push(uploadTask);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.activeUploads >= this.MAX_CONCURRENT_UPLOADS || this.uploadQueue.length === 0) {
      return;
    }

    this.activeUploads++;
    const uploadTask = this.uploadQueue.shift();

    if (uploadTask) {
      try {
        await uploadTask();
      } catch (error) {
        console.error('Upload task error:', error);
        this.failedUploads++;
      } finally {
        this.activeUploads--;
        this.completedUploads++;

        // Update progress
        this.updateProgress();

        // Process next in queue
        this.processQueue();

        // Check if all uploads are complete
        if (this.completedUploads === this.totalUploadsExpected && this.activeUploads === 0) {
          this.finalizeExport();
        }
      }
    }
  }

  private updateProgress(): void {
    const driveExportStatus = document.getElementById('driveExportStatus') as HTMLDivElement;
    if (driveExportStatus && this.totalUploadsExpected > 0) {
      driveExportStatus.style.display = 'block';
      driveExportStatus.style.background = '#dbeafe';
      driveExportStatus.style.color = '#1e40af';
      driveExportStatus.innerHTML = `⏳ Uploading: ${this.completedUploads}/${this.totalUploadsExpected} (${this.activeUploads} active)`;
    }
  }

  private finalizeExport(): void {
    const driveExportStatus = document.getElementById('driveExportStatus') as HTMLDivElement;
    const exportToDriveBtn = document.getElementById('exportToDriveBtn') as HTMLButtonElement;

    if (exportToDriveBtn) {
      exportToDriveBtn.disabled = false;
    }

    if (driveExportStatus) {
      const successCount = this.completedUploads - this.failedUploads;

      if (this.failedUploads === 0) {
        driveExportStatus.style.background = '#f0fdf4';
        driveExportStatus.style.color = '#059669';
        driveExportStatus.innerHTML = `✅ ${successCount} frame(s) successfully exported to Google Drive!`;
      } else {
        driveExportStatus.style.background = '#fee2e2';
        driveExportStatus.style.color = '#991b1b';
        driveExportStatus.innerHTML = `⚠️ Exported ${successCount}/${this.totalUploadsExpected} frames. ${this.failedUploads} failed.`;
      }
    }

    console.log(`✅ Export complete: ${this.completedUploads - this.failedUploads} success, ${this.failedUploads} failed`);

    // Reset for next export
    setTimeout(() => this.reset(), 3000);
  }

  recordFailure(): void {
    this.failedUploads++;
  }
}

const uploadQueueManager = new UploadQueueManager();

export default function initUI(rootNode: HTMLElement): void {
  injectStyles();
  rootNode.innerHTML = template;

  console.log('🚀 Figma AI Assistant UI loaded');

  initSettingsToggle();
  initImageGeneration();
  initImageEditing();
  initGranularEditing();
  initAnalyze();
  initModify();
  initFrameIterator();
  initResize();
  initExportToDrive();
  initImageBankBrowser();
  initClose();
  registerMessageListener();
  loadSettings();

  console.log('✅ Figma AI Assistant initialized');
}

function injectStyles(): void {
  if (stylesInjected) {
    return;
  }
  const style = document.createElement('style');
  style.id = 'figma-ai-assistant-styles';
  style.textContent = styles;
  document.head.appendChild(style);
  stylesInjected = true;
}

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return element as T;
}

function postPluginMessage(message: PluginToUiMessage): void {
  parent.postMessage({ pluginMessage: message }, '*');
}

function saveSettings(): void {
  const apiKey = getElement<HTMLInputElement>('apiKey').value.trim();
  const backendUrl = getElement<HTMLInputElement>('backendUrl').value.trim();
  const exportsFolder = getElement<HTMLInputElement>('exportsFolder').value.trim();
  const imageBankFolder = getElement<HTMLInputElement>('imageBankFolder').value.trim();

  const runwareApiKey = getElement<HTMLInputElement>('runwareApiKey').value.trim();
  const imageModel = getElement<HTMLSelectElement>('imageModel').value;

  postPluginMessage({
    type: 'save-settings',
    apiKey,
    runwareApiKey,
    imageModel,
    backendUrl,
    exportsFolder,
    imageBankFolder
  });

  console.log(`📤 Saving settings... Backend: ${backendUrl || 'default'}, Exports: ${exportsFolder || 'none'}, Image Bank: ${imageBankFolder || 'none'}`);
}

function loadSettings(): void {
  postPluginMessage({ type: 'load-settings' });
  console.log('📥 Loading settings...');
}

function initSettingsToggle(): void {
  const settingsHeader = getElement<HTMLDivElement>('settingsHeader');
  const settingsContent = getElement<HTMLDivElement>('settingsContent');
  const settingsToggle = settingsHeader.querySelector('.settings-toggle') as HTMLDivElement;

  settingsHeader.addEventListener('click', () => {
    const isExpanded = settingsContent.classList.contains('expanded');

    if (isExpanded) {
      settingsContent.classList.remove('expanded');
      settingsToggle.classList.remove('expanded');
    } else {
      settingsContent.classList.add('expanded');
      settingsToggle.classList.add('expanded');
    }
  });

  // Connect/Disconnect buttons in Settings
  const settingsConnectBtn = getElement<HTMLButtonElement>('settingsConnectDriveBtn');
  const settingsDisconnectBtn = getElement<HTMLButtonElement>('settingsDisconnectDriveBtn');

  settingsConnectBtn.addEventListener('click', () => {
    // Scroll to Drive card and trigger connection
    scrollToDriveCard();
    // Trigger the connect button click
    setTimeout(() => {
      const connectBtn = document.getElementById('connectDriveBtn') as HTMLButtonElement;
      if (connectBtn) connectBtn.click();
    }, 300);
  });

  settingsDisconnectBtn.addEventListener('click', () => {
    if (confirm('Disconnect from Google Drive? Your folder settings will be preserved.')) {
      postPluginMessage({ type: 'clear-drive-tokens' });
      // Update UI immediately
      updateDriveStatusIndicator(false);
    }
  });
}

function initImageGeneration(): void {
  const generateNewBtn = getElement<HTMLButtonElement>('generateNewBtn');
  const regenerateBtn = getElement<HTMLButtonElement>('regenerateBtn');
  const imageForm = getElement<HTMLFormElement>('imageForm');
  const cancelImageBtn = getElement<HTMLButtonElement>('cancelImageBtn');
  const generateBtn = getElement<HTMLButtonElement>('generateBtn');
  const imagePrompt = getElement<HTMLTextAreaElement>('imagePrompt');
  const imageSize = getElement<HTMLSelectElement>('imageSize');

  // Scroll to Drive config
  const scrollToDriveLink = document.getElementById('scrollToDriveConfig');
  if (scrollToDriveLink) {
    scrollToDriveLink.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToDriveCard();
    });
  }

  generateNewBtn.addEventListener('click', () => {
    console.log('✨ Starting new image generation...');
    imageForm.style.display = 'block';
    imagePrompt.value = '';
    imagePrompt.placeholder =
      "A children's book drawing of a veterinarian using a stethoscope to listen to the heartbeat of a baby otter...";
    generateBtn.textContent = '✨ Generate New Image';
    generateBtn.dataset.mode = 'new';
  });

  regenerateBtn.addEventListener('click', () => {
    console.log('🔄 Starting image regeneration...');

    const apiKey = getElement<HTMLInputElement>('apiKey').value.trim();
    if (!apiKey) {
      console.log('⚠️ No API key provided. Backend credentials will be used if configured.');
    }

    postPluginMessage({ type: 'check-image-selection' });
  });

  cancelImageBtn.addEventListener('click', () => {
    imageForm.style.display = 'none';
    getElement<HTMLDivElement>('resultImage').innerHTML = '';
  });

  imageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const apiKey = getElement<HTMLInputElement>('apiKey').value.trim();
    const prompt = imagePrompt.value;
    const size = imageSize.value;
    const mode = generateBtn.dataset.mode ?? 'new';

    if (!prompt) {
      showResult('Please provide an image description.', 'error', 'resultImage');
      return;
    }

    saveSettings();

    getElement<HTMLDivElement>('loadingImage').style.display = 'block';
    generateBtn.disabled = true;
    getElement<HTMLDivElement>('resultImage').innerHTML = '';

    resetProgress('progressBarImage', 'progressTextImage', 'Starting image generation...');

    const runwareApiKey = getElement<HTMLInputElement>('runwareApiKey').value.trim();
    const model = getElement<HTMLSelectElement>('imageModel').value;

    postPluginMessage({
      type: mode === 'new' ? 'generate-image' : 'regenerate-images',
      prompt,
      size,
      apiKey,
      runwareApiKey,
      model
    });
  });
}

function initAnalyze(): void {
  const analyzeBtn = getElement<HTMLButtonElement>('analyzeBtn');
  const copyJsonBtn = getElement<HTMLButtonElement>('copyJsonBtn');
  const closeJsonBtn = getElement<HTMLButtonElement>('closeJsonBtn');

  analyzeBtn.addEventListener('click', () => {
    console.log('📊 Starting design analysis...');

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ Analyzing...';
    getElement<HTMLDivElement>('jsonOutput').style.display = 'none';
    getElement<HTMLDivElement>('jsonActions').style.display = 'none';

    postPluginMessage({ type: 'analyze-design-only' });
  });

  copyJsonBtn.addEventListener('click', () => {
    const jsonOutput = getElement<HTMLDivElement>('jsonOutput');
    const preElement = jsonOutput.querySelector('pre');

    if (preElement) {
      const textToCopy = preElement.textContent || '';

      // Copy to clipboard using the Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            const originalText = copyJsonBtn.textContent;
            copyJsonBtn.textContent = '✅ Copied!';
            setTimeout(() => {
              copyJsonBtn.textContent = originalText;
            }, 2000);
          })
          .catch((err) => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
          });
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
          document.execCommand('copy');
          const originalText = copyJsonBtn.textContent;
          copyJsonBtn.textContent = '✅ Copied!';
          setTimeout(() => {
            copyJsonBtn.textContent = originalText;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
          alert('Failed to copy to clipboard');
        }

        document.body.removeChild(textarea);
      }
    }
  });

  closeJsonBtn.addEventListener('click', () => {
    getElement<HTMLDivElement>('jsonOutput').style.display = 'none';
    getElement<HTMLDivElement>('jsonActions').style.display = 'none';
  });
}

function initImageEditing(): void {
  const editImagesForm = getElement<HTMLFormElement>('editImagesForm');
  const editImagesBtn = getElement<HTMLButtonElement>('editImagesBtn');
  const editPrompt = getElement<HTMLTextAreaElement>('editPrompt');

  editImagesForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const apiKey = getElement<HTMLInputElement>('apiKey').value.trim();
    const prompt = editPrompt.value.trim();

    if (!prompt) {
      showResult('Please provide an editing prompt.', 'error', 'resultEditImages');
      return;
    }

    if (!apiKey) {
      console.log('⚠️ No API key provided for image editing; relying on backend configuration.');
    }

    saveSettings();

    getElement<HTMLDivElement>('loadingEditImages').style.display = 'block';
    editImagesBtn.disabled = true;
    getElement<HTMLDivElement>('resultEditImages').innerHTML = '';

    resetProgress(
      'progressBarEditImages',
      'progressTextEditImages',
      'Starting image editing...'
    );

    postPluginMessage({
      type: 'edit-frame-images',
      prompt,
      apiKey
    });
  });
}

// Store granular edit data
interface GranularImageData {
  nodeId: string;
  nodeName: string;
  imageBase64: string;
  customPrompt: string;
  selected: boolean;
}

let granularImagesData: GranularImageData[] = [];

function initGranularEditing(): void {
  const analyzeBtn = getElement<HTMLButtonElement>('analyzeFrameForGranularBtn');
  const listContainer = getElement<HTMLDivElement>('granularImageListContainer');
  const imageList = getElement<HTMLDivElement>('granularImageList');
  const selectAllCheckbox = getElement<HTMLInputElement>('granularSelectAll');
  const imageCount = getElement<HTMLSpanElement>('granularImageCount');
  const executeBtn = getElement<HTMLButtonElement>('executeGranularEditBtn');
  const cancelBtn = getElement<HTMLButtonElement>('cancelGranularEditBtn');

  // Analyze frame for granular editing
  analyzeBtn.addEventListener('click', () => {
    console.log('🔍 Analyzing frame for granular editing...');
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ Analyzing...';

    postPluginMessage({ type: 'analyze-frame-for-granular-edit' });
  });

  // Select all checkbox handler
  selectAllCheckbox.addEventListener('change', () => {
    const isChecked = selectAllCheckbox.checked;
    granularImagesData.forEach((img, idx) => {
      img.selected = isChecked;
      const checkbox = document.getElementById(`granular-checkbox-${idx}`) as HTMLInputElement;
      const card = document.getElementById(`granular-card-${idx}`);
      if (checkbox) checkbox.checked = isChecked;
      if (card) {
        if (isChecked) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      }
    });
    updateExecuteButton();
  });

  // Execute granular edit
  executeBtn.addEventListener('click', () => {
    const selectedImages = granularImagesData.filter(img => img.selected && img.customPrompt.trim());

    if (selectedImages.length === 0) {
      showResult('Please select at least one image and provide a prompt.', 'error', 'resultGranularEdit');
      return;
    }

    const apiKey = getElement<HTMLInputElement>('apiKey').value.trim();
    const model = getElement<HTMLSelectElement>('granularImageModel').value;

    if (!apiKey) {
      console.log('⚠️ No API key provided; relying on backend configuration.');
    }

    saveSettings();

    // Prepare tasks
    const tasks = selectedImages.map(img => ({
      nodeId: img.nodeId,
      nodeName: img.nodeName,
      imageBase64: img.imageBase64,
      prompt: img.customPrompt.trim()
    }));

    console.log(`🎯 Executing granular edit with ${tasks.length} task(s) using model: ${model}`);

    // Show loading state
    listContainer.style.display = 'none';
    getElement<HTMLDivElement>('loadingGranularEdit').style.display = 'block';
    getElement<HTMLDivElement>('resultGranularEdit').innerHTML = '';

    resetProgress(
      'progressBarGranularEdit',
      'progressTextGranularEdit',
      `Processing ${tasks.length} image(s)...`
    );

    postPluginMessage({
      type: 'granular-image-edit',
      tasks,
      apiKey,
      size: '1024x1024',
      model
    });
  });

  // Cancel granular edit
  cancelBtn.addEventListener('click', () => {
    listContainer.style.display = 'none';
    analyzeBtn.style.display = 'block';
    granularImagesData = [];
  });

  function updateExecuteButton(): void {
    const hasSelectedWithPrompt = granularImagesData.some(img => img.selected && img.customPrompt.trim());
    executeBtn.disabled = !hasSelectedWithPrompt;
  }

  function renderGranularImageList(images: GranularImageData[]): void {
    granularImagesData = images;
    imageList.innerHTML = '';

    if (images.length === 0) {
      imageList.innerHTML = `
        <div class="granular-empty-state">
          <div class="icon">🖼️</div>
          <p>No images found in the selected frame.</p>
        </div>
      `;
      executeBtn.disabled = true;
      return;
    }

    images.forEach((img, index) => {
      const card = document.createElement('div');
      card.className = 'granular-image-card selected';
      card.id = `granular-card-${index}`;

      card.innerHTML = `
        <div class="granular-image-preview">
          <img src="data:image/png;base64,${img.imageBase64}" alt="${img.nodeName}" />
          <span class="image-index">#${index + 1}</span>
        </div>
        <div class="granular-image-content">
          <div class="granular-image-header">
            <span class="granular-image-name" title="${img.nodeName}">${img.nodeName}</span>
            <div class="granular-image-checkbox">
              <input type="checkbox" id="granular-checkbox-${index}" checked />
            </div>
          </div>
          <textarea 
            class="granular-image-prompt" 
            id="granular-prompt-${index}"
            placeholder="Describe the new image to generate (e.g., 'A golden retriever playing in the park')..."
          ></textarea>
        </div>
      `;

      imageList.appendChild(card);

      // Add event listeners
      const checkbox = document.getElementById(`granular-checkbox-${index}`) as HTMLInputElement;
      const textarea = document.getElementById(`granular-prompt-${index}`) as HTMLTextAreaElement;

      checkbox.addEventListener('change', () => {
        granularImagesData[index].selected = checkbox.checked;
        if (checkbox.checked) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }

        // Update select all checkbox
        const allSelected = granularImagesData.every(i => i.selected);
        const noneSelected = granularImagesData.every(i => !i.selected);
        selectAllCheckbox.checked = allSelected;
        selectAllCheckbox.indeterminate = !allSelected && !noneSelected;

        updateExecuteButton();
      });

      textarea.addEventListener('input', () => {
        granularImagesData[index].customPrompt = textarea.value;
        updateExecuteButton();
      });
    });

    imageCount.textContent = `${images.length} image${images.length !== 1 ? 's' : ''}`;
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
    updateExecuteButton();
  }

  // Expose render function globally for message handler
  (window as any).renderGranularImageList = renderGranularImageList;
  (window as any).resetGranularEditUI = () => {
    listContainer.style.display = 'none';
    analyzeBtn.style.display = 'block';
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = '🔍 Analyze Frame for Editing';
    granularImagesData = [];
  };
  (window as any).showGranularImageList = () => {
    analyzeBtn.style.display = 'none';
    listContainer.style.display = 'block';
  };
}

function initResize(): void {
  const resizeTo1350Btn = getElement<HTMLButtonElement>('resizeTo1350Btn');
  const resizeTo1920Btn = getElement<HTMLButtonElement>('resizeTo1920Btn');
  const resultResize = getElement<HTMLDivElement>('resultResize');

  resizeTo1350Btn.addEventListener('click', () => {
    console.log('📏 Stretching frame to 1080x1350...');
    resultResize.innerHTML = '⏳ Duplicating and resizing frame...';
    resultResize.className = 'result';
    resizeTo1350Btn.disabled = true;
    resizeTo1920Btn.disabled = true;
    postPluginMessage({ type: 'resize-frame-stretch', newHeight: 1350 });
  });

  resizeTo1920Btn.addEventListener('click', () => {
    console.log('📏 Reflowing frame to 1080x1920...');
    resultResize.innerHTML = '⏳ Duplicating and resizing frame...';
    resultResize.className = 'result';
    resizeTo1350Btn.disabled = true;
    resizeTo1920Btn.disabled = true;
    postPluginMessage({ type: 'resize-frame-reflow', newHeight: 1920 });
  });
}

function initExportToDrive(): void {
  // Elements
  const driveCardTitle = getElement<HTMLDivElement>('driveCardTitle');
  const driveCardDescription = getElement<HTMLDivElement>('driveCardDescription');
  const stateDisconnected = getElement<HTMLDivElement>('driveStateDisconnected');
  const stateConnecting = getElement<HTMLDivElement>('driveStateConnecting');
  const stateConnected = getElement<HTMLDivElement>('driveStateConnected');
  const stateError = getElement<HTMLDivElement>('driveStateError');

  const connectDriveBtn = getElement<HTMLButtonElement>('connectDriveBtn');
  const cancelConnectBtn = getElement<HTMLButtonElement>('cancelConnectBtn');
  const disconnectDriveBtn = getElement<HTMLButtonElement>('disconnectDriveBtn');
  const retryConnectBtn = getElement<HTMLButtonElement>('retryConnectBtn');
  const exportToDriveBtn = getElement<HTMLButtonElement>('exportToDriveBtn');
  const manualUploadBtn = getElement<HTMLButtonElement>('manualUploadBtn');
  const driveExportStatus = getElement<HTMLDivElement>('driveExportStatus');
  const driveErrorMessage = getElement<HTMLDivElement>('driveErrorMessage');
  const authUrlInput = getElement<HTMLInputElement>('authUrlInput');
  const copyAuthUrlBtn = getElement<HTMLButtonElement>('copyAuthUrlBtn');

  let pollingInterval: number | null = null;
  let currentRequestId: string | null = null;

  // Show initial state based on stored tokens
  function checkInitialState(): void {
    postPluginMessage({ type: 'check-drive-tokens' });
  }

  // Show State 1: Disconnected
  function showDisconnectedState(): void {
    driveCardTitle.textContent = '☁️ Connect Google Drive';
    driveCardDescription.textContent = 'Connect your account to export frames directly to Drive.';
    stateDisconnected.style.display = 'block';
    stateConnecting.style.display = 'none';
    stateConnected.style.display = 'none';
    stateError.style.display = 'none';
    driveExportStatus.style.display = 'none';
  }

  // Show State 2: Connecting (Active Polling)
  function showConnectingState(authUrl: string): void {
    driveCardTitle.textContent = '🔄 Waiting for Authorization...';
    driveCardDescription.textContent = 'Copy the URL below and authorize in your browser.';
    authUrlInput.value = authUrl;
    stateDisconnected.style.display = 'none';
    stateConnecting.style.display = 'block';
    stateConnected.style.display = 'none';
    stateError.style.display = 'none';
  }

  // Show State 3: Connected
  function showConnectedState(userEmail?: string): void {
    driveCardTitle.textContent = '✅ Google Drive Connected';
    driveCardDescription.textContent = userEmail
      ? `Authenticated as ${userEmail}. Configure folders in Settings.`
      : 'Successfully authenticated. Configure folders in Settings.';
    stateDisconnected.style.display = 'none';
    stateConnecting.style.display = 'none';
    stateConnected.style.display = 'block';
    stateError.style.display = 'none';

    // Export button is always enabled when connected
    exportToDriveBtn.disabled = false;
  }

  // Show State 4: Error
  function showErrorState(errorMsg: string): void {
    driveCardTitle.textContent = '❌ Connection Error';
    driveCardDescription.textContent = 'An error occurred during authentication.';
    driveErrorMessage.innerHTML = `❌ ${errorMsg}`;
    stateDisconnected.style.display = 'none';
    stateConnecting.style.display = 'none';
    stateConnected.style.display = 'none';
    stateError.style.display = 'block';
  }

  // Stop polling
  function stopPolling(): void {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    currentRequestId = null;
  }

  // Start polling for auth status
  function startPolling(requestId: string): void {
    stopPolling(); // Clear any existing polling
    currentRequestId = requestId;

    pollingInterval = window.setInterval(() => {
      postPluginMessage({
        type: 'check-drive-auth-status',
        requestId
      });
    }, 2000); // Poll every 2 seconds

    // Timeout after 5 minutes
    setTimeout(() => {
      if (currentRequestId === requestId) {
        stopPolling();
        showErrorState('Timeout. Please try again.');
      }
    }, 5 * 60 * 1000);
  }

  // Copy auth URL button
  copyAuthUrlBtn.addEventListener('click', () => {
    authUrlInput.select();

    // Try modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(authUrlInput.value)
        .then(() => {
          const originalText = copyAuthUrlBtn.textContent;
          copyAuthUrlBtn.textContent = '✅ Copied!';
          setTimeout(() => {
            copyAuthUrlBtn.textContent = originalText;
          }, 2000);
        })
        .catch(() => {
          // Fallback: user needs to copy manually
          alert('URL selected. Press Cmd+C (Mac) or Ctrl+C (Windows) to copy.');
        });
    } else {
      // Fallback for older environments
      try {
        document.execCommand('copy');
        const originalText = copyAuthUrlBtn.textContent;
        copyAuthUrlBtn.textContent = '✅ Copied!';
        setTimeout(() => {
          copyAuthUrlBtn.textContent = originalText;
        }, 2000);
      } catch (err) {
        alert('URL selected. Press Cmd+C (Mac) or Ctrl+C (Windows) to copy.');
      }
    }
  });

  // Connect Drive button
  connectDriveBtn.addEventListener('click', () => {
    console.log('🔗 Connecting to Google Drive...');

    // Generate request ID
    const requestId = Date.now().toString() + Math.random().toString(36).substring(2);

    // Request auth URL from plugin
    postPluginMessage({
      type: 'get-drive-auth-url',
      requestId
    });

    // Will show connecting state when URL arrives
  });

  // Cancel button
  cancelConnectBtn.addEventListener('click', () => {
    console.log('❌ Cancelled connection');
    stopPolling();
    showDisconnectedState();
  });

  // Retry button
  retryConnectBtn.addEventListener('click', () => {
    console.log('🔄 Retrying connection...');
    showDisconnectedState();
  });

  // Disconnect button
  disconnectDriveBtn.addEventListener('click', () => {
    console.log('🔌 Disconnecting from Google Drive...');
    postPluginMessage({ type: 'clear-drive-tokens' });
    showDisconnectedState();
    // Update status indicator in Settings section
    updateDriveStatusIndicator(false);
  });

  manualUploadBtn.addEventListener('click', () => {
    parent.postMessage({ pluginMessage: { type: 'manual-drive-upload' } }, '*');
  });

  exportToDriveBtn.addEventListener('click', () => {
    // Get exports folder from settings
    const exportsFolderSetting = getElement<HTMLInputElement>('exportsFolder').value.trim();

    if (!exportsFolderSetting) {
      driveExportStatus.style.display = 'block';
      driveExportStatus.style.background = '#fee2e2';
      driveExportStatus.style.color = '#991b1b';
      driveExportStatus.innerHTML = '❌ Please configure Exports Folder in Settings first';
      return;
    }

    // Disable button during export
    exportToDriveBtn.disabled = true;
    driveExportStatus.style.display = 'block';
    driveExportStatus.style.background = '#dbeafe';
    driveExportStatus.style.color = '#1e40af';
    driveExportStatus.innerHTML = '⏳ Exporting to configured Exports folder...';

    // Request frame exports from plugin
    postPluginMessage({
      type: 'export-to-drive',
      folderId: exportsFolderSetting
    });
  });

  // Initialize
  checkInitialState();

  // Expose functions for message handlers
  (window as any).driveUI = {
    showDisconnectedState,
    showConnectedState: (userEmail?: string) => showConnectedState(userEmail),
    showConnectingState: (authUrl: string) => showConnectingState(authUrl),
    showErrorState,
    stopPolling,
    startPolling,
    enableExportButton: () => {
      exportToDriveBtn.disabled = false;
    },
    showExportStatus: (html: string, type: 'info' | 'success' | 'error') => {
      driveExportStatus.style.display = 'block';
      if (type === 'info') {
        driveExportStatus.style.background = '#dbeafe';
        driveExportStatus.style.color = '#1e40af';
      } else if (type === 'success') {
        driveExportStatus.style.background = '#dcfce7';
        driveExportStatus.style.color = '#166534';
      } else {
        driveExportStatus.style.background = '#fee2e2';
        driveExportStatus.style.color = '#991b1b';
      }
      driveExportStatus.innerHTML = html;
    }
  };
}

function initFrameIterator(): void {
  const shuffleBtn = getElement<HTMLButtonElement>('shuffleElementsBtn');
  const spotlightBtn = getElement<HTMLButtonElement>('spotlightBtn');

  shuffleBtn.addEventListener('click', () => {
    console.log('🔀 Shuffling elements...');
    postPluginMessage({ type: 'shuffle-elements' });
  });

  spotlightBtn.addEventListener('click', () => {
    console.log('👑 Generating spotlight variations...');
    postPluginMessage({ type: 'generate-spotlight' });
  });
}

function initClose(): void {
  const closeBtn = getElement<HTMLButtonElement>('closeBtn');

  closeBtn.addEventListener('click', () => {
    console.log('❌ Closing plugin...');

    postPluginMessage({ type: 'cancel' });
  });
}

function initModify(): void {
  const modifyForm = getElement<HTMLFormElement>('modifyForm');
  const modifyBtn = getElement<HTMLButtonElement>('modifyBtn');
  const modifyPrompt = getElement<HTMLTextAreaElement>('modifyPrompt');

  document.addEventListener('change', (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.name === 'modifyTypes') {
      if (target.checked) {
        target.parentElement?.classList.add('selected');
      } else {
        target.parentElement?.classList.remove('selected');
      }
    }
  });

  document.querySelectorAll<HTMLInputElement>('input[name="modifyTypes"]:checked').forEach((checkbox) => {
    checkbox.parentElement?.classList.add('selected');
  });

  modifyForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const apiKey = getElement<HTMLInputElement>('apiKey').value.trim();
    const prompt = modifyPrompt.value;
    const types = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[name="modifyTypes"]:checked')
    ).map((checkbox) => checkbox.value);

    if (!prompt || types.length === 0) {
      showResult(
        'Please provide the modification description and select at least one type.',
        'error',
        'resultModify'
      );
      return;
    }

    if (!apiKey) {
      console.log('⚠️ No API key provided for design modifications; relying on backend configuration.');
    }

    saveSettings();

    getElement<HTMLDivElement>('loadingModify').style.display = 'block';
    modifyBtn.disabled = true;
    getElement<HTMLDivElement>('resultModify').innerHTML = '';

    resetProgress('progressBarModify', 'progressTextModify', 'Starting transformation...');

    postPluginMessage({
      type: 'modify-design',
      prompt,
      types,
      apiKey
    });
  });
}

function registerMessageListener(): void {
  if (messageListenerRegistered) {
    return;
  }

  window.addEventListener('message', (event) => {
    const data = event.data as { pluginMessage?: PluginToUiMessage };
    const msg = data?.pluginMessage;
    if (!msg || typeof msg.type !== 'string') {
      return;
    }
    handlePluginMessage(msg);
  });

  messageListenerRegistered = true;
}

function handlePluginMessage(msg: PluginToUiMessage): void {
  console.log('📨 Message received from UI:', msg);

  switch (msg.type) {
    case 'settings-loaded': {
      if (suppressSettingsRender) {
        console.log('ℹ️ Settings loaded (UI update skipped due to active flow)');
        break;
      }
      const apiKeyInput = getElement<HTMLInputElement>('apiKey');
      const runwareApiKeyInput = getElement<HTMLInputElement>('runwareApiKey');
      const backendUrlInput = getElement<HTMLInputElement>('backendUrl');
      const exportsFolderInput = getElement<HTMLInputElement>('exportsFolder');
      const imageBankFolderInput = getElement<HTMLInputElement>('imageBankFolder');
      const imageModelSelect = getElement<HTMLSelectElement>('imageModel');

      apiKeyInput.value = (msg.apiKey as string) || '';
      runwareApiKeyInput.value = (msg.runwareApiKey as string) || '';
      backendUrlInput.value = (msg.backendUrl as string) || 'http://localhost:3000/api';
      exportsFolderInput.value = (msg.exportsFolder as string) || '';
      imageBankFolderInput.value = (msg.imageBankFolder as string) || '';
      if (imageModelSelect && msg.imageModel) {
        imageModelSelect.value = msg.imageModel as string;
      }

      console.log(
        apiKeyInput.value ? '✅ API key loaded' : 'ℹ️ API key not set (using backend configuration)'
      );
      console.log(
        runwareApiKeyInput.value ? '✅ Runware API key loaded' : 'ℹ️ Runware API key not set'
      );
      console.log(`✅ Backend URL loaded: ${backendUrlInput.value}`);
      console.log(`✅ Exports Folder: ${exportsFolderInput.value || 'not set'}`);
      console.log(`✅ Image Bank Folder: ${imageBankFolderInput.value || 'not set'}`);
      break;
    }

    case 'design-analysis-complete': {
      const analyzeBtn = getElement<HTMLButtonElement>('analyzeBtn');
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '📊 Analyze Design (Show JSON)';
      const jsonOutput = getElement<HTMLDivElement>('jsonOutput');
      jsonOutput.innerHTML = `
        <strong>📊 Design Analysis JSON:</strong><br>
        <pre style="white-space: pre-wrap; word-break: break-all; margin-top: 8px;">${JSON.stringify(
        msg.analysisData,
        null,
        2
      )}</pre>
      `;
      jsonOutput.style.display = 'block';
      getElement<HTMLDivElement>('jsonActions').style.display = 'flex';
      break;
    }

    case 'modify-progress': {
      updateProgress('progressBarModify', 'progressTextModify', msg);
      break;
    }

    case 'analysis-complete': {
      const resultDiv = getElement<HTMLDivElement>('resultModify');
      const jsonDiv = document.createElement('div');
      jsonDiv.className = 'json-output minimized';
      jsonDiv.innerHTML = `
        <strong>🧠 Design Analysis (JSON):</strong><br>
        <pre style="white-space: pre-wrap; word-break: break-all; margin-top: 8px;">${JSON.stringify(msg.structuredData, null, 2)}</pre>
      `;

      // Click to expand
      jsonDiv.addEventListener('click', function expandJson() {
        this.classList.remove('minimized');
        this.style.cursor = 'default';
        this.removeEventListener('click', expandJson);
      });

      resultDiv.innerHTML = `
        <div class="result success">
          <strong>🧠 Design Analysis</strong>
        </div>
      `;
      resultDiv.appendChild(jsonDiv);
      break;
    }

    case 'ai-modifications-received': {
      const resultDiv = getElement<HTMLDivElement>('resultModify');
      const jsonDiv = document.createElement('div');
      jsonDiv.className = 'json-output minimized';
      jsonDiv.style.marginTop = '16px';
      jsonDiv.innerHTML = `
        <strong>🤖 AI Modifications:</strong><br>
        <pre style="white-space: pre-wrap; word-break: break-all; margin-top: 8px;">${JSON.stringify(msg.modifications, null, 2)}</pre>
      `;

      // Click to expand
      jsonDiv.addEventListener('click', function expandJson() {
        this.classList.remove('minimized');
        this.style.cursor = 'default';
        this.removeEventListener('click', expandJson);
      });

      resultDiv.innerHTML += `
        <div class="result success" style="margin-top: 16px;">
          <strong>🤖 AI Modifications Received</strong>
        </div>
      `;
      resultDiv.appendChild(jsonDiv);
      break;
    }

    case 'image-selection-checked': {
      const imageForm = getElement<HTMLFormElement>('imageForm');
      const generateBtn = getElement<HTMLButtonElement>('generateBtn');
      const hasImages = Boolean(msg.hasImages);
      const count = Number(msg.count ?? 0);

      if (hasImages && count > 0) {
        imageForm.style.display = 'block';
        getElement<HTMLTextAreaElement>('imagePrompt').value = '';
        getElement<HTMLTextAreaElement>(
          'imagePrompt'
        ).placeholder = `Regenerate ${count} selected image(s). Leave empty to auto-analyze, or describe custom changes...`;
        generateBtn.textContent = `🔄 Regenerate ${count} Image(s)`;
        generateBtn.dataset.mode = 'regenerate';

        showResult(
          `✅ Found ${count} image(s) selected. You can regenerate them or provide a custom prompt.`,
          'success',
          'resultImage'
        );
      } else {
        showResult(
          '❌ No images selected. Please select one or more images in Figma to regenerate them.',
          'error',
          'resultImage'
        );
      }
      break;
    }

    case 'image-progress': {
      updateProgress('progressBarImage', 'progressTextImage', msg);
      break;
    }

    case 'image-generation-complete': {
      // Handler para a mensagem do imageGenerationHandler
      getElement<HTMLDivElement>('loadingImage').style.display = 'none';
      getElement<HTMLButtonElement>('generateBtn').disabled = false;
      const resultDiv = getElement<HTMLDivElement>('resultImage');
      resultDiv.innerHTML = `
        <div class="result success">
          ✅ New image created successfully!
        </div>
      `;

      // Auto-save to Drive logic
      const autoSaveCheckbox = document.getElementById('autoSaveDrive') as HTMLInputElement;
      const shouldAutoSave = autoSaveCheckbox && autoSaveCheckbox.checked;

      console.log('🔍 Auto-save check:', {
        shouldAutoSave,
        hasImageUrl: !!msg.imageUrl,
        imageUrlType: typeof msg.imageUrl
      });

      if (shouldAutoSave && msg.imageUrl) {
        const promptUsed = (document.getElementById('imagePrompt') as HTMLTextAreaElement).value;
        const imageBase64 = (msg.imageUrl as string).split(',')[1]; // Remove o header data:image...

        console.log('📤 Triggering auto-save:', {
          promptLength: promptUsed?.length,
          hasBase64: !!imageBase64,
          base64Length: imageBase64?.length
        });

        if (promptUsed && imageBase64) {
          triggerAutoSaveToDrive(promptUsed, imageBase64);
        } else {
          console.warn('⚠️ Auto-save skipped: missing prompt or base64');
        }
      } else {
        console.log('ℹ️ Auto-save not triggered:', shouldAutoSave ? 'No imageUrl' : 'Checkbox not checked');
      }

      getElement<HTMLFormElement>('imageForm').style.display = 'none';
      console.log('✅ Image generation completed');
      break;
    }

    case 'image-complete': {
      getElement<HTMLDivElement>('loadingImage').style.display = 'none';
      getElement<HTMLButtonElement>('generateBtn').disabled = false;
      const resultDiv = getElement<HTMLDivElement>('resultImage');
      resultDiv.innerHTML = `
        <div class="result success">
          ✅ ${(msg.message as string) || 'Image generated successfully!'}
        </div>
      `;

      // Auto-save to Drive logic
      const autoSaveCheckbox = document.getElementById('autoSaveDrive') as HTMLInputElement;
      const shouldAutoSave = autoSaveCheckbox && autoSaveCheckbox.checked;

      console.log('🔍 [image-complete] Auto-save check:', {
        shouldAutoSave,
        hasPrompt: !!msg.prompt,
        hasImageBase64: !!msg.imageBase64,
        messageKeys: Object.keys(msg)
      });

      if (shouldAutoSave && msg.prompt && msg.imageBase64) {
        const promptUsed = msg.prompt as string;
        const imageBase64 = msg.imageBase64 as string;

        console.log('📤 [image-complete] Triggering auto-save with existing image');

        // Enviar MESMA imagem (já gerada) para o Drive com AI naming
        triggerAutoSaveToDrive(promptUsed, imageBase64);
      } else {
        console.log('ℹ️ [image-complete] Auto-save not triggered:',
          !shouldAutoSave ? 'Checkbox not checked' :
            !msg.prompt ? 'No prompt' : 'No imageBase64');
      }

      getElement<HTMLFormElement>('imageForm').style.display = 'none';
      console.log('✅ Image generation completed');
      break;
    }

    case 'image-edit-progress': {
      updateProgress('progressBarEditImages', 'progressTextEditImages', msg);
      break;
    }

    case 'image-edit-complete': {
      getElement<HTMLDivElement>('loadingEditImages').style.display = 'none';
      getElement<HTMLButtonElement>('editImagesBtn').disabled = false;
      const resultDiv = getElement<HTMLDivElement>('resultEditImages');
      resultDiv.innerHTML = `
        <div class="result success">
          ✅ ${(msg.message as string) || 'Images edited successfully!'}
        </div>
      `;
      console.log('✅ Image editing completed');
      break;
    }

    case 'granular-frame-analyzed': {
      // Frame was analyzed, show the image list
      const images = msg.images as Array<{
        nodeId: string;
        nodeName: string;
        imageBase64: string;
      }>;

      console.log(`🎯 Received ${images.length} images for granular editing`);

      // Reset analyze button
      const analyzeBtn = getElement<HTMLButtonElement>('analyzeFrameForGranularBtn');
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '🔍 Analyze Frame for Editing';

      if (images.length === 0) {
        showResult('No images found in the selected frame.', 'error', 'resultGranularEdit');
        return;
      }

      // Transform and render images
      const granularImages = images.map(img => ({
        ...img,
        customPrompt: '',
        selected: true
      }));

      (window as any).showGranularImageList();
      (window as any).renderGranularImageList(granularImages);
      break;
    }

    case 'granular-edit-progress': {
      updateProgress('progressBarGranularEdit', 'progressTextGranularEdit', msg);
      break;
    }

    case 'granular-edit-complete': {
      getElement<HTMLDivElement>('loadingGranularEdit').style.display = 'none';
      const resultDiv = getElement<HTMLDivElement>('resultGranularEdit');
      resultDiv.innerHTML = `
        <div class="result success">
          ✅ ${(msg.message as string) || 'Granular editing completed successfully!'}
        </div>
      `;
      (window as any).resetGranularEditUI();
      console.log('✅ Granular editing completed');
      break;
    }

    case 'granular-edit-error': {
      getElement<HTMLDivElement>('loadingGranularEdit').style.display = 'none';
      const resultDiv = getElement<HTMLDivElement>('resultGranularEdit');
      resultDiv.innerHTML = `
        <div class="result error">
          ❌ ${(msg.message as string) || 'Granular editing failed.'}
        </div>
      `;
      (window as any).resetGranularEditUI();
      console.log('❌ Granular editing failed');
      break;
    }

    case 'resize-complete': {
      const message = typeof msg.message === 'string' ? msg.message : 'Frame resized successfully!';
      showResult(message, 'success', 'resultResize');
      // Re-enable buttons (keep 1920 disabled)
      getElement<HTMLButtonElement>('resizeTo1350Btn').disabled = false;
      // getElement<HTMLButtonElement>('resizeTo1920Btn').disabled = false; // Keep disabled
      console.log('✅ Resize completed');
      break;
    }

    case 'modification-complete': {
      getElement<HTMLDivElement>('loadingModify').style.display = 'none';
      getElement<HTMLButtonElement>('modifyBtn').disabled = false;
      const resultDiv = getElement<HTMLDivElement>('resultModify');
      resultDiv.innerHTML += `
        <div class="result success" style="margin-top: 16px;">
          ✅ Modifications applied successfully!
        </div>
      `;
      console.log('✅ Modifications completed');
      break;
    }

    case 'drive-tokens-status': {
      // Check if tokens exist on plugin side
      const hasTokens = Boolean(msg.hasTokens);
      const folderId = msg.folderId as string;
      const driveUI = (window as any).driveUI;

      // Update Drive status indicator in Image Generation card
      updateDriveStatusIndicator(hasTokens, folderId);

      if (hasTokens) {
        driveUI.showConnectedState();
        if (folderId) {
          driveUI.setFolderId(folderId);
        }
      } else {
        driveUI.showDisconnectedState();
      }
      break;
    }

    case 'auth-url-ready': {
      // Received auth URL, show it to user for manual copy/paste
      const authUrl = msg.url as string;
      const requestId = msg.requestId as string;
      const driveUI = (window as any).driveUI;

      console.log('🔗 Auth URL ready:', authUrl);

      // Show connecting state with URL
      driveUI.showConnectingState(authUrl);

      // Start polling
      driveUI.startPolling(requestId);
      break;
    }

    case 'auth-status-success': {
      // Successfully authenticated via polling
      const tokens = msg.tokens;
      const driveUI = (window as any).driveUI;

      console.log('✅ Authentication successful!');
      driveUI.stopPolling();

      // Save tokens via plugin
      postPluginMessage({
        type: 'save-drive-tokens',
        tokens
      });

      driveUI.showConnectedState();
      // Update status indicator in Settings section
      updateDriveStatusIndicator(true);
      break;
    }

    case 'auth-status-error': {
      // Error during authentication
      const errorMsg = (msg.message as string) || 'Unknown error during authentication';
      const driveUI = (window as any).driveUI;

      console.error('❌ Authentication error:', errorMsg);
      driveUI.stopPolling();
      driveUI.showErrorState(errorMsg);
      break;
    }

    case 'drive-export-frame': {
      // Received frame data from plugin, upload to Google Drive
      const { frameData, frameName, tokens, folderId, currentIndex, totalFrames } = msg as unknown as {
        frameData: number[];
        frameName: string;
        tokens: any;
        folderId: string;
        currentIndex: number;
        totalFrames: number;
      };

      // Set total expected uploads on first frame
      if (currentIndex === 1) {
        uploadQueueManager.setTotalExpected(totalFrames);
      }

      // Convert Uint8Array to base64 (process in chunks to avoid stack overflow)
      let binaryString = '';
      const chunkSize = 8192; // Process 8KB at a time
      for (let i = 0; i < frameData.length; i += chunkSize) {
        const chunk = frameData.slice(i, i + chunkSize);
        binaryString += String.fromCharCode.apply(null, chunk as any);
      }
      const imageBase64 = btoa(binaryString);

      // Create upload task (closure)
      const uploadTask = async (): Promise<void> => {
        const backendUrl = getElement<HTMLInputElement>('backendUrl').value || 'http://localhost:3000/api';

        try {
          const res = await fetch(`${backendUrl}/drive/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tokens,
              folderId,
              fileName: `${frameName}.png`,
              imageBase64
            })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({ message: res.statusText }));
            throw new Error(errData.message || `HTTP ${res.status}: ${res.statusText}`);
          }

          const data = await res.json();

          if (data.success) {
            console.log(`✅ Uploaded: ${frameName}`);

            // If tokens were refreshed, save them
            if (data.refreshedTokens) {
              console.log('🔄 Saving refreshed tokens...');
              postPluginMessage({
                type: 'save-drive-tokens',
                tokens: data.refreshedTokens
              });
            }

            // Notify plugin that this frame is done (optional, not blocking)
            postPluginMessage({
              type: 'drive-export-frame-complete',
              success: true,
              frameName,
              webViewLink: data.webViewLink
            });
          } else {
            throw new Error(data.message || 'Upload failed');
          }
        } catch (error: any) {
          console.error(`❌ Error uploading ${frameName}:`, error);
          uploadQueueManager.recordFailure();

          // Notify plugin of failure (optional)
          postPluginMessage({
            type: 'drive-export-frame-complete',
            success: false,
            frameName,
            error: error.message
          });

          throw error; // Re-throw to be caught by queue manager
        }
      };

      // Add to queue and start processing
      uploadQueueManager.addToQueue(uploadTask);
      break;
    }

    // DEPRECATED: No longer used with queue-based upload system
    // The queue manager handles completion automatically
    case 'drive-export-complete': {
      // Legacy handler - keeping for backward compatibility
      // The upload queue manager now handles completion automatically
      console.log('⚠️ Received legacy drive-export-complete message');
      break;
    }

    case 'error': {
      getElement<HTMLDivElement>('loadingModify').style.display = 'none';
      getElement<HTMLButtonElement>('modifyBtn').disabled = false;
      getElement<HTMLDivElement>('loadingImage').style.display = 'none';
      getElement<HTMLButtonElement>('generateBtn').disabled = false;
      getElement<HTMLDivElement>('loadingEditImages').style.display = 'none';
      getElement<HTMLButtonElement>('editImagesBtn').disabled = false;
      // Re-enable resize buttons on error (keep 1920 disabled)
      if (msg.context === 'resize') {
        getElement<HTMLButtonElement>('resizeTo1350Btn').disabled = false;
        // getElement<HTMLButtonElement>('resizeTo1920Btn').disabled = false; // Keep disabled
      }

      const message = typeof msg.message === 'string' ? msg.message : 'Unknown error';
      if (msg.context === 'image') {
        showResult(`❌ ${message}`, 'error', 'resultImage');
      } else if (msg.context === 'image-edit') {
        showResult(`❌ ${message}`, 'error', 'resultEditImages');
      } else if (msg.context === 'resize') {
        showResult(`❌ ${message}`, 'error', 'resultResize');
      } else {
        showResult(`❌ ${message}`, 'error', 'resultModify');
      }
      console.log('❌ Error:', message);
      break;
    }

    case 'auto-upload-success': {
      const resultDiv = getElement<HTMLDivElement>('resultImage');
      const filename = typeof msg.filename === 'string' ? msg.filename : 'image';
      const fileUrl = typeof msg.fileUrl === 'string' ? msg.fileUrl : '';

      const linkHtml = fileUrl
        ? `<a href="${fileUrl}" target="_blank" style="color: #1e40af; text-decoration: underline;">Open in Drive</a>`
        : '';

      resultDiv.innerHTML += `
        <div class="result success" style="margin-top:8px;">
          ✅ Saved to Drive: <b>${filename}</b> ${linkHtml}
        </div>
      `;
      break;
    }

    case 'auto-upload-error': {
      const resultDiv = getElement<HTMLDivElement>('resultImage');
      const errorMessage = typeof msg.message === 'string' ? msg.message : 'Unknown error';
      resultDiv.innerHTML += `
        <div class="result error" style="margin-top:8px;">
          ❌ Failed to save to Drive: ${errorMessage}
        </div>
      `;
      break;
    }

    default:
      break;
  }
}

function updateDriveStatusIndicator(hasTokens: boolean, folderId?: string): void {
  // Update status in Image Generation card
  const statusDiv = document.getElementById('driveConnectionStatus');
  if (statusDiv) {
    if (hasTokens && folderId) {
      statusDiv.innerHTML = '✅ Drive connected. Folder configured.';
      statusDiv.style.color = '#059669';
    } else if (hasTokens && !folderId) {
      statusDiv.innerHTML = '⚠️ Drive connected but no folder set. <a href="#" id="scrollToDriveConfig" style="color: #059669; text-decoration: underline; cursor: pointer;">Set folder</a>';
      statusDiv.style.color = '#d97706';
      // Re-attach scroll listener
      const scrollLink = document.getElementById('scrollToDriveConfig');
      if (scrollLink) {
        scrollLink.addEventListener('click', (e) => {
          e.preventDefault();
          scrollToDriveCard();
        });
      }
    } else {
      statusDiv.innerHTML = '⚠️ Drive not configured. <a href="#" id="scrollToDriveConfig" style="color: #059669; text-decoration: underline; cursor: pointer;">Configure now</a>';
      statusDiv.style.color = '#64748b';
      // Re-attach scroll listener
      const scrollLink = document.getElementById('scrollToDriveConfig');
      if (scrollLink) {
        scrollLink.addEventListener('click', (e) => {
          e.preventDefault();
          scrollToDriveCard();
        });
      }
    }
  }

  // Update status in Settings section
  const statusIcon = document.getElementById('driveStatusIcon');
  const statusMessage = document.getElementById('driveStatusMessage');
  const settingsConnectBtn = document.getElementById('settingsConnectDriveBtn') as HTMLButtonElement;
  const settingsDisconnectBtn = document.getElementById('settingsDisconnectDriveBtn') as HTMLButtonElement;

  if (statusIcon && statusMessage) {
    if (hasTokens) {
      // Connected state
      statusIcon.textContent = '✅';
      statusMessage.innerHTML = '✅ Connected and ready';
      statusMessage.style.color = '#059669';
      statusMessage.style.background = '#f0fdf4';
      statusMessage.style.borderColor = '#bbf7d0';

      // Show disconnect, hide connect
      if (settingsConnectBtn) settingsConnectBtn.style.display = 'none';
      if (settingsDisconnectBtn) settingsDisconnectBtn.style.display = 'inline-block';
    } else {
      // Disconnected state
      statusIcon.textContent = '⚠️';
      statusMessage.innerHTML = '⚠️ Not connected. <a href="#" id="scrollToDriveSetup" style="color: #667eea; text-decoration: underline;">Connect below</a>';
      statusMessage.style.color = '#64748b';
      statusMessage.style.background = '#f8fafc';
      statusMessage.style.borderColor = '#e2e8f0';

      const scrollLink = document.getElementById('scrollToDriveSetup');
      if (scrollLink) {
        scrollLink.addEventListener('click', (e) => {
          e.preventDefault();
          scrollToDriveCard();
        });
      }

      // Show connect, hide disconnect
      if (settingsConnectBtn) settingsConnectBtn.style.display = 'inline-block';
      if (settingsDisconnectBtn) settingsDisconnectBtn.style.display = 'none';
    }
  }
}

function scrollToDriveCard(): void {
  // Find the Drive card by looking for the unique ID
  const driveCard = document.querySelector('#driveStateDisconnected')?.closest('.ai-card') as HTMLElement;
  if (driveCard) {
    driveCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Flash effect
    const originalBoxShadow = driveCard.style.boxShadow;
    driveCard.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.5)';
    driveCard.style.transition = 'box-shadow 0.3s ease';
    setTimeout(() => {
      driveCard.style.boxShadow = originalBoxShadow;
    }, 2000);
  }
}

function updateProgress(barId: string, textId: string, msg: PluginToUiMessage): void {
  const progressBar = getElement<HTMLDivElement>(barId);
  const progressText = getElement<HTMLDivElement>(textId);

  if (typeof msg.step === 'number' && typeof msg.totalSteps === 'number' && msg.totalSteps > 0) {
    const percentage = (msg.step / msg.totalSteps) * 100;
    progressBar.style.width = `${percentage}%`;
  }

  if (typeof msg.message === 'string') {
    progressText.textContent = msg.message;
  }
}

function resetProgress(barId: string, textId: string, initialMessage: string): void {
  const progressBar = getElement<HTMLDivElement>(barId);
  const progressText = getElement<HTMLDivElement>(textId);
  progressBar.style.width = '0%';
  progressText.textContent = initialMessage;
}

function showResult(message: string, type: 'success' | 'error', containerId: string): void {
  const resultDiv = getElement<HTMLDivElement>(containerId);
  resultDiv.innerHTML = message.replace(/\n/g, '<br>');
  resultDiv.className = `result ${type}`;
}

async function triggerAutoSaveToDrive(prompt: string, imageBase64: string): Promise<void> {
  try {
    // Atualizar UI
    const resultDiv = document.getElementById('resultImage') as HTMLDivElement;
    resultDiv.innerHTML += `<div class="result" style="margin-top:8px; background:#eff6ff; color:#1e40af; border: 1px solid #bfdbfe;">☁️ Saving to Drive with AI naming...</div>`;

    // Enviar para o Plugin que vai chamar o backend
    // O backend faz: AI naming + upload tudo junto!
    postPluginMessage({
      type: 'auto-upload-to-drive',
      prompt,
      imageBase64
    });

  } catch (error) {
    console.error('Auto-save failed:', error);
    const resultDiv = document.getElementById('resultImage') as HTMLDivElement;
    resultDiv.innerHTML += `<div class="result error" style="margin-top:8px;">❌ Auto-save failed: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
  }
}

function escapeHtml(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initImageBankBrowser(): void {
  const loadBtn = getElement<HTMLButtonElement>('loadImageBankBtn');
  const loadingDiv = getElement<HTMLDivElement>('imageBankLoading');
  const gridDiv = getElement<HTMLDivElement>('imageBankGrid');
  const countDiv = getElement<HTMLDivElement>('imageBankCount');
  const imagesDiv = getElement<HTMLDivElement>('imageBankImages');
  const emptyDiv = getElement<HTMLDivElement>('imageBankEmpty');
  const statusDiv = getElement<HTMLDivElement>('imageBankStatus');
  const imageBankFolderInput = getElement<HTMLInputElement>('imageBankFolder');
  const filterSource = getElement<HTMLSelectElement>('filterSource');
  const filterAge = getElement<HTMLSelectElement>('filterAge');
  const filterColor = getElement<HTMLSelectElement>('filterColor');
  const filterAction = getElement<HTMLSelectElement>('filterAction');

  interface ParsedImage {
    id: string;
    name: string;
    thumbnailLink?: string;
    webViewLink?: string;
    source: string;
    age: string;
    color: string;
    action: string;
    displayLabel: string;
    isStructured: boolean;
  }

  let allImages: ParsedImage[] = [];
  let filteredImages: ParsedImage[] = [];
  let cachedDriveTokens: any = null;
  let backendBaseUrl = '';
  let imageBankFolderId = '';
  let activeBlobUrls: Set<string> = new Set();

  function waitForPluginMessageOnce(expectedType: string, timeoutMs = 6000): Promise<PluginToUiMessage> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handler);
        reject(new Error(`Timeout waiting for ${expectedType}`));
      }, timeoutMs);

      const handler = (event: MessageEvent) => {
        const msg = event.data.pluginMessage;
        if (msg?.type === expectedType) {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          resolve(msg);
        }
      };

      window.addEventListener('message', handler);
    });
  }

  // Parse filename according to convention: {ai/stock}_{puppy/dog}_{color}_{action}.ext
  // Robust parsing that handles multi-word actions and edge cases
  function parseFilename(filename: string): { source: string; age: string; color: string; action: string; displayLabel: string; isStructured: boolean } {
    try {
      console.log(`🔍 Parsing filename: "${filename}"`);

      // Remove extension
      const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
      console.log(`  📝 Without extension: "${nameWithoutExt}"`);

      // Split by underscore
      const parts = nameWithoutExt.split('_');
      console.log(`  🔢 Parts:`, parts);
      console.log(`  📊 Parts length: ${parts.length}, parts[0]: "${parts[0]}", parts[1]: "${parts[1]}"`);

      // Validate format: {ai/stock}_{puppy/dog/adult}_{color}_{action}
      // Must have at least 4 parts: prefix_type_color_action
      if (parts.length >= 4) {
        const prefix = parts[0].toLowerCase();
        const type = parts[1].toLowerCase();

        // Check if it matches the new convention
        const validPrefixes = ['ai', 'stock'];
        const validTypes = ['puppy', 'dog', 'adult'];

        if (validPrefixes.includes(prefix) && validTypes.includes(type)) {
          // New format: {ai/stock}_{puppy/dog/adult}_{color}_{action}
          const color = parts[2]?.trim() || 'unknown';

          // Action can be multi-word: join everything after index 3
          // Example: ai_puppy_black_laying_down → "laying down"
          const actionParts = parts.slice(3).filter(p => p.trim().length > 0);
          const action = actionParts.length > 0
            ? actionParts.join(' ').trim()
            : 'unknown';

          // Map type to age-friendly label
          // puppy → puppy, dog → adult, adult → adult
          const age = type === 'puppy' ? 'puppy' : 'adult';

          const result = {
            source: prefix.toLowerCase(),
            age: age.toLowerCase(),
            color: color.toLowerCase(),
            action: action.toLowerCase(),
            displayLabel: `${prefix.toUpperCase()} ${age} ${color} ${action}`,
            isStructured: true
          };

          console.log(`  ✅ Parsed successfully (new format):`, result);
          return result;
        }

        // Legacy format check: {age}_{color}_{action}
        // This handles old files like "adult_black_sitting" or "puppy_brown_sitting"
        const legacyType = parts[0].toLowerCase();
        if (validTypes.includes(legacyType)) {
          const age = legacyType === 'puppy' ? 'puppy' : 'adult';
          const color = parts[1]?.trim() || 'unknown';

          // Action is everything after color
          const actionParts = parts.slice(2).filter(p => p.trim().length > 0);
          const action = actionParts.length > 0
            ? actionParts.join(' ').trim()
            : 'unknown';

          const result = {
            source: 'unknown',
            age: age.toLowerCase(),
            color: color.toLowerCase(),
            action: action.toLowerCase(),
            displayLabel: `${age} ${color} ${action}`,
            isStructured: true
          };

          console.log(`  ✅ Parsed successfully (legacy format):`, result);
          return result;
        }

        // Another legacy check: starts with "adult" (e.g., "adult_black_sitting")
        if (legacyType === 'adult') {
          const color = parts[1]?.trim() || 'unknown';
          const actionParts = parts.slice(2).filter(p => p.trim().length > 0);
          const action = actionParts.length > 0
            ? actionParts.join(' ').trim()
            : 'unknown';

          const result = {
            source: 'unknown',
            age: 'adult',
            color: color.toLowerCase(),
            action: action.toLowerCase(),
            displayLabel: `adult ${color} ${action}`,
            isStructured: true
          };

          console.log(`  ✅ Parsed successfully (adult legacy format):`, result);
          return result;
        }
      }

      // Fallback: include the file even if it doesn't match the convention
      // This prevents losing files with non-standard names
      console.log(`  ⚠️ Does not match convention, using fallback`);
      return {
        source: 'unknown',
        age: 'unknown',
        color: 'unknown',
        action: 'unknown',
        displayLabel: nameWithoutExt,
        isStructured: false
      };
    } catch (error) {
      // Safety fallback for any parsing errors
      console.warn(`❌ Failed to parse filename: ${filename}`, error);
      return {
        source: 'unknown',
        age: 'unknown',
        color: 'unknown',
        action: 'unknown',
        displayLabel: filename,
        isStructured: false
      };
    }
  }

  // Populate filter options dynamically
  // Only includes valid values, excludes "unknown"
  function populateFilters(images: ParsedImage[]): void {
    console.log(`📊 Populating filters for ${images.length} images`);

    const sources = new Set<string>();
    const ages = new Set<string>();
    const colors = new Set<string>();
    const actions = new Set<string>();

    images.forEach(img => {
      console.log(`  Image: ${img.name} → source:"${img.source}" age:"${img.age}" color:"${img.color}" action:"${img.action}"`);

      // Only add non-unknown values
      if (img.source && img.source !== 'unknown') {
        sources.add(img.source);
        console.log(`    ✅ Added source: "${img.source}"`);
      }
      if (img.age && img.age !== 'unknown') {
        ages.add(img.age);
        console.log(`    ✅ Added age: "${img.age}"`);
      }
      if (img.color && img.color !== 'unknown') {
        colors.add(img.color);
        console.log(`    ✅ Added color: "${img.color}"`);
      }
      if (img.action && img.action !== 'unknown') {
        actions.add(img.action);
        console.log(`    ✅ Added action: "${img.action}"`);
      }
    });

    console.log(`📋 Final sets:`, {
      sources: Array.from(sources),
      ages: Array.from(ages),
      colors: Array.from(colors),
      actions: Array.from(actions)
    });

    // Helper to capitalize first letter
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    // Clear and populate Source filter
    filterSource.innerHTML = '<option value="">All</option>';
    if (sources.size > 0) {
      Array.from(sources).sort().forEach(source => {
        const option = document.createElement('option');
        option.value = source;
        option.textContent = source.toUpperCase();
        filterSource.appendChild(option);
      });
    }

    // Clear and populate Age filter
    filterAge.innerHTML = '<option value="">All</option>';
    if (ages.size > 0) {
      Array.from(ages).sort().forEach(age => {
        const option = document.createElement('option');
        option.value = age;
        option.textContent = capitalize(age);
        filterAge.appendChild(option);
      });
    }

    // Clear and populate Color filter
    filterColor.innerHTML = '<option value="">All</option>';
    if (colors.size > 0) {
      Array.from(colors).sort().forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = capitalize(color);
        filterColor.appendChild(option);
      });
    }

    // Clear and populate Action filter
    filterAction.innerHTML = '<option value="">All</option>';
    if (actions.size > 0) {
      Array.from(actions).sort().forEach(action => {
        const option = document.createElement('option');
        option.value = action;
        option.textContent = capitalize(action);
        filterAction.appendChild(option);
      });
    }

    console.log(`✅ Filters populated: ${sources.size} sources, ${ages.size} ages, ${colors.size} colors, ${actions.size} actions`);
  }

  // Apply filters
  function applyFilters(): void {
    const sourceFilter = filterSource.value;
    const ageFilter = filterAge.value;
    const colorFilter = filterColor.value;
    const actionFilter = filterAction.value;

    filteredImages = allImages.filter(img => {
      if (sourceFilter && img.source !== sourceFilter) return false;
      if (ageFilter && img.age !== ageFilter) return false;
      if (colorFilter && img.color !== colorFilter) return false;
      if (actionFilter && img.action !== actionFilter) return false;
      return true;
    });

    renderImageGrid();
  }

  // Render image grid
  function renderImageGrid(): void {
    // Clean up old blob URLs before clearing the container
    revokeBlobUrls();
    imagesDiv.innerHTML = '';

    if (filteredImages.length === 0) {
      gridDiv.style.display = 'none';
      emptyDiv.style.display = 'block';
      return;
    }

    emptyDiv.style.display = 'none';
    gridDiv.style.display = 'block';
    countDiv.textContent = `${filteredImages.length} image(s) found`;

    filteredImages.forEach(async (img) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'image-bank-item';
      itemDiv.dataset.fileId = img.id;
      itemDiv.dataset.fileName = img.name;

      // Use thumbnail or placeholder
      const imgElement = document.createElement('img');
      imgElement.alt = img.name;
      imgElement.loading = 'lazy';

      // Load image through backend proxy to avoid CORS/Auth issues with Google Drive
      if (img.id) {
        const thumbSrc = `${backendBaseUrl}/drive/thumbnail/${img.id}?tokens=${encodeURIComponent(JSON.stringify(cachedDriveTokens))}`;
        const blobUrl = await loadImageAsBlob(thumbSrc);
        imgElement.src = blobUrl;
      } else {
        imgElement.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
      }

      const nameDiv = document.createElement('div');
      nameDiv.className = 'image-bank-item-name';
      nameDiv.textContent = img.displayLabel || `${img.age} ${img.color} ${img.action}`;

      itemDiv.appendChild(imgElement);
      itemDiv.appendChild(nameDiv);

      // Click handler
      itemDiv.addEventListener('click', () => handleImageClick(img));

      imagesDiv.appendChild(itemDiv);
    });
  }

  // Handle image click - download and replace
  async function handleImageClick(img: ParsedImage): Promise<void> {
    const itemDiv = document.querySelector(`[data-file-id="${img.id}"]`) as HTMLElement;
    if (!itemDiv) return;

    if (!cachedDriveTokens) {
      statusDiv.style.display = 'block';
      statusDiv.className = 'result error';
      statusDiv.textContent = '❌ Connect to Google Drive and click "Load Image Bank" again.';
      return;
    }

    if (!backendBaseUrl) {
      statusDiv.style.display = 'block';
      statusDiv.className = 'result error';
      statusDiv.textContent = '❌ Backend URL not configured. Please load settings first.';
      return;
    }

    // Show downloading state
    const downloadingDiv = document.createElement('div');
    downloadingDiv.className = 'image-bank-downloading';
    downloadingDiv.innerHTML = '⏳';
    itemDiv.appendChild(downloadingDiv);

    statusDiv.style.display = 'block';
    statusDiv.className = 'result';
    statusDiv.style.background = '#eff6ff';
    statusDiv.style.color = '#1e40af';
    statusDiv.textContent = `📥 Downloading ${img.name}...`;

    try {
      // Download image from backend
      const response = await fetch(
        `${backendBaseUrl}/drive/image/${img.id}?tokens=${encodeURIComponent(JSON.stringify(cachedDriveTokens))}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success || !data.base64) {
        throw new Error('Invalid response from server');
      }

      // Send to plugin to replace image
      postPluginMessage({
        type: 'replace-current-image',
        imageBase64: data.base64,
        fileName: img.name
      });

      statusDiv.style.background = '#dcfce7';
      statusDiv.style.color = '#166534';
      statusDiv.textContent = `✅ Image replaced: ${img.name}`;

      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);

    } catch (error) {
      console.error('Image replacement error:', error);
      statusDiv.style.background = '#fef2f2';
      statusDiv.style.color = '#dc2626';
      statusDiv.textContent = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    } finally {
      // Remove downloading indicator
      if (downloadingDiv.parentNode) {
        downloadingDiv.parentNode.removeChild(downloadingDiv);
      }
    }
  }

  // Load images from Drive
  loadBtn.addEventListener('click', async () => {
    // Persist what user typed before we fetch anything
    try {
      saveSettings();
    } catch (err) {
      console.log('Could not autosave settings before loading Image Bank:', err);
    }

    suppressSettingsRender = true;

    loadingDiv.style.display = 'block';
    gridDiv.style.display = 'none';
    emptyDiv.style.display = 'none';
    statusDiv.style.display = 'none';
    loadBtn.disabled = true;

    // Show loading state in filters
    filterSource.innerHTML = '<option value="">Loading...</option>';
    filterSource.disabled = true;
    filterAge.innerHTML = '<option value="">Loading...</option>';
    filterAge.disabled = true;
    filterColor.innerHTML = '<option value="">Loading...</option>';
    filterColor.disabled = true;
    filterAction.innerHTML = '<option value="">Loading...</option>';
    filterAction.disabled = true;

    try {
      const typedImageBankFolder = imageBankFolderInput.value.trim();

      postPluginMessage({ type: 'load-settings' });
      const settingsMsg = await waitForPluginMessageOnce('settings-loaded');
      const imageBankFolder = typedImageBankFolder || (settingsMsg.imageBankFolder as string) || '';
      backendBaseUrl = ((settingsMsg.backendUrl as string) || 'http://localhost:3000/api').trim() || 'http://localhost:3000/api';

      if (!imageBankFolder.trim()) {
        throw new Error('Image Bank folder not configured. Please set it in Settings.');
      }

      imageBankFolderId = imageBankFolder.trim();

      postPluginMessage({ type: 'check-drive-tokens' });
      const tokenMsg = await waitForPluginMessageOnce('drive-tokens-status');
      const hasTokens = Boolean(tokenMsg.hasTokens);
      const tokens = tokenMsg.tokens as any;

      if (!hasTokens || !tokens) {
        throw new Error('Google Drive not connected. Connect in Settings.');
      }

      cachedDriveTokens = tokens;

      const response = await fetch(
        `${backendBaseUrl}/drive/list-images?folderId=${encodeURIComponent(imageBankFolderId)}&tokens=${encodeURIComponent(JSON.stringify(cachedDriveTokens))}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Failed to load images: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success || !data.files) {
        throw new Error(data.error || 'Invalid response from server');
      }

      if (data.refreshedTokens) {
        cachedDriveTokens = data.refreshedTokens;
        postPluginMessage({ type: 'save-drive-tokens', tokens: data.refreshedTokens });
      }

      // Parse filenames
      allImages = data.files.map((file: any) => {
        const parsed = parseFilename(file.name);
        return {
          id: file.id,
          name: file.name,
          thumbnailLink: file.thumbnailLink,
          webViewLink: file.webViewLink,
          ...parsed
        };
      }) as ParsedImage[];

      if (allImages.length === 0) {
        emptyDiv.style.display = 'block';
        gridDiv.style.display = 'none';
        statusDiv.style.display = 'block';
        statusDiv.className = 'result';
        statusDiv.textContent = 'ℹ️ No images found in Image Bank folder.';
        return;
      }

      // Populate filters and render
      populateFilters(allImages);
      filteredImages = allImages;
      renderImageGrid();

      // Re-enable filters
      filterSource.disabled = false;
      filterAge.disabled = false;
      filterColor.disabled = false;
      filterAction.disabled = false;

      statusDiv.style.display = 'block';
      statusDiv.className = 'result success';
      statusDiv.textContent = `✅ Loaded ${filteredImages.length} image(s) from Image Bank`;

    } catch (error) {
      console.error('Load images error:', error);

      // Reset filters on error
      filterSource.innerHTML = '<option value="">All</option>';
      filterSource.disabled = false;
      filterAge.innerHTML = '<option value="">All</option>';
      filterAge.disabled = false;
      filterColor.innerHTML = '<option value="">All</option>';
      filterColor.disabled = false;
      filterAction.innerHTML = '<option value="">All</option>';
      filterAction.disabled = false;

      statusDiv.style.display = 'block';
      statusDiv.className = 'result error';
      statusDiv.textContent = `❌ ${error instanceof Error ? error.message : 'Unknown error'}`;
      emptyDiv.style.display = allImages.length === 0 ? 'block' : 'none';
    } finally {
      loadingDiv.style.display = 'none';
      loadBtn.disabled = false;
      suppressSettingsRender = false;
    }
  });

  function appendAccessToken(url: string, accessToken?: string): string {
    if (!accessToken) return url;
    try {
      const parsed = new URL(url);
      if (!parsed.searchParams.has('access_token')) {
        parsed.searchParams.set('access_token', accessToken);
      }
      return parsed.toString();
    } catch {
      return url;
    }
  }

  // Clean up blob URLs to prevent memory leaks
  function revokeBlobUrls(): void {
    activeBlobUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    activeBlobUrls.clear();
  }

  // Load image from Google Drive using fetch and convert to blob URL
  // This avoids CSP issues with direct img.src assignment
  async function loadImageAsBlob(url: string): Promise<string> {
    try {
      console.log(`Loading the image '${url}'`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      activeBlobUrls.add(blobUrl);
      return blobUrl;
    } catch (error) {
      console.error(`Failed to load resource from ${url}`, error);
      // Return a placeholder on error
      return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
    }
  }

  // Filter change listeners
  filterSource.addEventListener('change', applyFilters);
  filterAge.addEventListener('change', applyFilters);
  filterColor.addEventListener('change', applyFilters);
  filterAction.addEventListener('change', applyFilters);
}
