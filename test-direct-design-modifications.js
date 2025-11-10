const fs = require('fs');
const path = require('path');

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

// Check for JSON file argument or stdin
let designAnalysis;
let prompt = 'Make this design more modern';
let types = ['text', 'color'];

const jsonFile = process.argv[2] || 'payload.json';

if (jsonFile === '--stdin') {
  // Read from stdin
  console.log('Reading payload from stdin...');
  let input = '';
  process.stdin.on('data', chunk => {
    input += chunk;
  });
  process.stdin.on('end', () => {
    try {
      designAnalysis = JSON.parse(input.trim());
      makeRequest();
    } catch (error) {
      console.error('Invalid JSON from stdin:', error.message);
      process.exit(1);
    }
  });
  process.stdin.setEncoding('utf8');
} else if (fs.existsSync(jsonFile)) {
  // Load from file
  console.log(`Loading design analysis from ${jsonFile}`);
  designAnalysis = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  
  // Allow customizing prompt and types via command line
  if (process.argv[3]) {
    prompt = process.argv[3];
    console.log(`Using custom prompt: "${prompt}"`);
  }
  if (process.argv[4]) {
    types = process.argv[4].split(',');
    console.log(`Using custom types: [${types.join(', ')}]`);
  }
} else {
  console.log('Usage:');
  console.log('  node test-direct-design-modifications.js [json-file] [prompt] [types]');
  console.log('  node test-direct-design-modifications.js payload.json "Make it blue" "color,text"');
  console.log('  echo \'{"elements": [...]}\' | node test-direct-design-modifications.js --stdin');
  console.log('');
  console.log(`File not found: ${jsonFile}`);
  process.exit(1);
}

async function makeRequest() {
  // Build the payload
  const payload = {
    designAnalysis: designAnalysis,
    prompt: prompt,
    types: types,
    apiKey: OPENAI_API_KEY
  };

  const startTime = Date.now();

  try {
    console.log('Sending request to http://localhost:3000/api/design/modifications');
    console.log('Payload size:', JSON.stringify(payload).length, 'characters');
    console.log('Design elements:', designAnalysis.elements ? designAnalysis.elements.length : 0);
    console.log('Prompt:', prompt);
    console.log('Types:', types);
    console.log('---');

    const response = await fetch('http://localhost:3000/api/design/modifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Request took ${duration}ms`);

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('---');
    console.log('Success! Response keys:', Object.keys(result));
    
    if (result.tokenUsage) {
      console.log('\n🎯 TOKEN USAGE:');
      console.log('  Prompt tokens:', result.tokenUsage.promptTokens || result.tokenUsage.prompt_tokens);
      console.log('  Completion tokens:', result.tokenUsage.completionTokens || result.tokenUsage.completion_tokens);
      console.log('  Total tokens:', result.tokenUsage.totalTokens || result.tokenUsage.total_tokens);
      if (result.tokenUsage.estimatedCost) {
        console.log('  Estimated cost: $' + result.tokenUsage.estimatedCost.toFixed(4));
      }
    }
    
    if (result.modifications) {
      console.log('\n📝 MODIFICATIONS:');
      console.log('  Total modifications:', result.modifications.length, 'items');
      console.log('  Sample modification:', JSON.stringify(result.modifications[0], null, 2));
    }
    console.log('\n---');
    console.log(`⏱️  Total time: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);

  } catch (error) {
    console.error('Request failed:', error);
  }
}

if (jsonFile !== '--stdin') {
  makeRequest();
}
