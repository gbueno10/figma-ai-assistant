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
        🎨 AI Image Generation
      </div>
      <div class="card-description">
        Generate new images or regenerate selected images using AI. Select one or more images to regenerate, or create new ones.
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

export default function initUI(rootNode: HTMLElement): void {
  injectStyles();
  rootNode.innerHTML = template;

  console.log('🚀 Figma AI Assistant UI loaded');

  initSettingsToggle();
  initImageGeneration();
  initImageEditing();
  initAnalyze();
  initModify();
  initResize();
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

  postPluginMessage({
    type: 'save-settings',
    apiKey,
    backendUrl
  });

  console.log(`📤 Saving settings... Backend: ${backendUrl || 'default'}`);
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
}

function initImageGeneration(): void {
  const generateNewBtn = getElement<HTMLButtonElement>('generateNewBtn');
  const regenerateBtn = getElement<HTMLButtonElement>('regenerateBtn');
  const imageForm = getElement<HTMLFormElement>('imageForm');
  const cancelImageBtn = getElement<HTMLButtonElement>('cancelImageBtn');
  const generateBtn = getElement<HTMLButtonElement>('generateBtn');
  const imagePrompt = getElement<HTMLTextAreaElement>('imagePrompt');
  const imageSize = getElement<HTMLSelectElement>('imageSize');

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

    postPluginMessage({
      type: mode === 'new' ? 'generate-image' : 'regenerate-images',
      prompt,
      size,
      apiKey
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
      const apiKeyInput = getElement<HTMLInputElement>('apiKey');
      const backendUrlInput = getElement<HTMLInputElement>('backendUrl');
      apiKeyInput.value = (msg.apiKey as string) || '';
      backendUrlInput.value = (msg.backendUrl as string) || 'http://localhost:3000/api';

      console.log(
        apiKeyInput.value ? '✅ API key loaded' : 'ℹ️ API key not set (using backend configuration)'
      );
      console.log(`✅ Backend URL loaded: ${backendUrlInput.value}`);
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

    case 'image-complete': {
      getElement<HTMLDivElement>('loadingImage').style.display = 'none';
      getElement<HTMLButtonElement>('generateBtn').disabled = false;
      const resultDiv = getElement<HTMLDivElement>('resultImage');
      resultDiv.innerHTML = `
        <div class="result success">
          ✅ ${(msg.message as string) || 'Image generated successfully!'}
        </div>
      `;
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

    case 'resize-complete': {
      const message = typeof msg.message === 'string' ? msg.message : 'Frame resized successfully!';
      showResult(message, 'success', 'resultResize');
      // Re-enable buttons
      getElement<HTMLButtonElement>('resizeTo1350Btn').disabled = false;
      getElement<HTMLButtonElement>('resizeTo1920Btn').disabled = false;
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

    case 'error': {
      getElement<HTMLDivElement>('loadingModify').style.display = 'none';
      getElement<HTMLButtonElement>('modifyBtn').disabled = false;
      getElement<HTMLDivElement>('loadingImage').style.display = 'none';
      getElement<HTMLButtonElement>('generateBtn').disabled = false;
      getElement<HTMLDivElement>('loadingEditImages').style.display = 'none';
      getElement<HTMLButtonElement>('editImagesBtn').disabled = false;
      // Re-enable resize buttons on error
      if (msg.context === 'resize') {
        getElement<HTMLButtonElement>('resizeTo1350Btn').disabled = false;
        getElement<HTMLButtonElement>('resizeTo1920Btn').disabled = false;
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

    default:
      break;
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
