const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Load environment variables from backend/.env
const envPath = path.join(__dirname, 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const OPENAI_API_KEY = envVars.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY not found in backend/.env');
  process.exit(1);
}

// Check for JSON file argument
let designAnalysis;
let prompt = 'Make this design more modern';
let types = ['text', 'color'];

const jsonFile = process.argv[2] || 'payload.json';

if (fs.existsSync(jsonFile)) {
  console.log(`${colors.cyan}📂 Loading design analysis from ${jsonFile}${colors.reset}`);
  designAnalysis = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  
  if (process.argv[3]) {
    prompt = process.argv[3];
  }
  if (process.argv[4]) {
    types = process.argv[4].split(',');
  }
} else {
  console.log(`${colors.red}File not found: ${jsonFile}${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.bright}═══════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.bright}🧪 PERFORMANCE COMPARISON TEST${colors.reset}`);
console.log(`${colors.bright}═══════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.yellow}Prompt: ${prompt}${colors.reset}`);
console.log(`${colors.yellow}Types: [${types.join(', ')}]${colors.reset}`);
console.log(`${colors.yellow}Elements: ${designAnalysis.elements ? designAnalysis.elements.length : 0}${colors.reset}`);
console.log(`${colors.bright}═══════════════════════════════════════════════════════${colors.reset}\n`);

// Test 1: Direct OpenAI Call
async function testDirectOpenAI() {
  const systemPrompt = `You are an expert UI/UX designer and developer. You will receive design data from Figma and a user prompt for modifications.

Your task is to analyze the design elements and provide specific modification instructions that can be applied programmatically.

CRITICAL RULES FOR COLOR MODIFICATIONS:
- ONLY suggest color modifications for elements that already have colors applied (hasColor: true)
- NEVER add colors to elements that don't already have fills or strokes

CRITICAL RULES FOR TEXT FORMATTING PRESERVATION:
- ALWAYS preserve the original text formatting and structure
- If the original text has \\n (line breaks), maintain them in the new text

Return your response as JSON with this structure:
{
  "modifications": [
    {
      "elementId": "id",
      "elementName": "name",
      "elementType": "TYPE",
      "type": "text|color|layout|style",
      "action": "replace|update",
      "property": "property name",
      "currentValue": "current",
      "newValue": "new",
      "reasoning": "explanation",
      "confidence": 0.85,
      "priority": "high|medium|low"
    }
  ]
}

RULES FOR TYPES FILTER:
- Only return modifications matching the types array provided: ${JSON.stringify(types)}`;

  const designDataString = JSON.stringify(designAnalysis);
  const userMessage = `User prompt: ${prompt}

Design data:
${designDataString}`;

  const messages = [
    { role: 'system', content: [{ type: 'text', text: systemPrompt }] },
    { role: 'user', content: [{ type: 'text', text: userMessage }] },
  ];

  const payload = {
    model: 'gpt-5',
    messages,
    response_format: { type: 'json_object' },
  };

  const startTime = Date.now();

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload)
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    const modifications = parsed?.modifications ?? parsed;

    return {
      success: true,
      duration,
      tokenUsage: result.usage,
      modificationsCount: Array.isArray(modifications) ? modifications.length : 0,
      payloadSize: JSON.stringify(payload).length,
    };
  } catch (error) {
    return {
      success: false,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

// Test 2: Backend Call
async function testBackendCall() {
  const payload = {
    designAnalysis,
    prompt,
    types,
    apiKey: OPENAI_API_KEY,
  };

  const startTime = Date.now();

  try {
    const response = await fetch('http://localhost:3000/api/design/modifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: true,
      duration,
      tokenUsage: result.tokenUsage,
      modificationsCount: result.modifications ? result.modifications.length : 0,
      payloadSize: JSON.stringify(payload).length,
    };
  } catch (error) {
    return {
      success: false,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

// Run comparison
async function runComparison() {
  // Test 1: Direct OpenAI
  console.log(`${colors.blue}${colors.bright}▶ Test 1: Direct OpenAI API Call${colors.reset}`);
  console.log(`${colors.blue}───────────────────────────────────────────────────────${colors.reset}`);
  const directResult = await testDirectOpenAI();
  
  if (directResult.success) {
    console.log(`${colors.green}✓ Success${colors.reset}`);
    console.log(`  ⏱️  Time: ${directResult.duration}ms (${(directResult.duration / 1000).toFixed(2)}s)`);
    console.log(`  📦 Payload: ${directResult.payloadSize.toLocaleString()} characters`);
    console.log(`  🎯 Tokens: ${directResult.tokenUsage.total_tokens.toLocaleString()}`);
    console.log(`     - Prompt: ${directResult.tokenUsage.prompt_tokens.toLocaleString()}`);
    console.log(`     - Completion: ${directResult.tokenUsage.completion_tokens.toLocaleString()}`);
    const inputCost = (directResult.tokenUsage.prompt_tokens / 1_000_000) * 5.00;
    const outputCost = (directResult.tokenUsage.completion_tokens / 1_000_000) * 15.00;
    console.log(`  💰 Cost: $${(inputCost + outputCost).toFixed(4)}`);
    console.log(`  📝 Modifications: ${directResult.modificationsCount}`);
  } else {
    console.log(`${colors.red}✗ Failed: ${directResult.error}${colors.reset}`);
  }

  console.log('');

  // Test 2: Backend
  console.log(`${colors.magenta}${colors.bright}▶ Test 2: Via Backend (localhost:3000)${colors.reset}`);
  console.log(`${colors.magenta}───────────────────────────────────────────────────────${colors.reset}`);
  const backendResult = await testBackendCall();
  
  if (backendResult.success) {
    console.log(`${colors.green}✓ Success${colors.reset}`);
    console.log(`  ⏱️  Time: ${backendResult.duration}ms (${(backendResult.duration / 1000).toFixed(2)}s)`);
    console.log(`  📦 Payload: ${backendResult.payloadSize.toLocaleString()} characters`);
    if (backendResult.tokenUsage) {
      const totalTokens = backendResult.tokenUsage.totalTokens || backendResult.tokenUsage.total_tokens;
      const promptTokens = backendResult.tokenUsage.promptTokens || backendResult.tokenUsage.prompt_tokens;
      const completionTokens = backendResult.tokenUsage.completionTokens || backendResult.tokenUsage.completion_tokens;
      
      console.log(`  🎯 Tokens: ${totalTokens.toLocaleString()}`);
      console.log(`     - Prompt: ${promptTokens.toLocaleString()}`);
      console.log(`     - Completion: ${completionTokens.toLocaleString()}`);
      const inputCost = (promptTokens / 1_000_000) * 5.00;
      const outputCost = (completionTokens / 1_000_000) * 15.00;
      console.log(`  💰 Cost: $${(inputCost + outputCost).toFixed(4)}`);
    }
    console.log(`  📝 Modifications: ${backendResult.modificationsCount}`);
  } else {
    console.log(`${colors.red}✗ Failed: ${backendResult.error}${colors.reset}`);
  }

  // Comparison
  if (directResult.success && backendResult.success) {
    console.log('');
    console.log(`${colors.bright}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}📊 COMPARISON SUMMARY${colors.reset}`);
    console.log(`${colors.bright}═══════════════════════════════════════════════════════${colors.reset}`);
    
    const diff = backendResult.duration - directResult.duration;
    const diffPercent = ((diff / directResult.duration) * 100).toFixed(1);
    const overhead = backendResult.duration - directResult.duration;
    
    if (diff > 0) {
      console.log(`${colors.yellow}Backend is SLOWER by ${Math.abs(diff)}ms (${Math.abs(diffPercent)}%)${colors.reset}`);
      console.log(`${colors.yellow}Backend overhead: ${overhead}ms${colors.reset}`);
    } else {
      console.log(`${colors.green}Backend is FASTER by ${Math.abs(diff)}ms (${Math.abs(diffPercent)}%)${colors.reset}`);
    }
    
    console.log('');
    console.log(`Direct OpenAI:  ${directResult.duration}ms (${(directResult.duration / 1000).toFixed(2)}s)`);
    console.log(`Via Backend:    ${backendResult.duration}ms (${(backendResult.duration / 1000).toFixed(2)}s)`);
    console.log(`${colors.bright}═══════════════════════════════════════════════════════${colors.reset}`);
  }
}

runComparison();
