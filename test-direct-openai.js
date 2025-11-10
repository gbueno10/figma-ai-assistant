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

// Check for JSON file argument
let designAnalysis;
let prompt = 'Make this design more modern';
let types = ['text', 'color'];

const jsonFile = process.argv[2] || 'payload.json';

if (fs.existsSync(jsonFile)) {
  console.log(`Loading design analysis from ${jsonFile}`);
  designAnalysis = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  
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
  console.log('  node test-direct-openai.js [json-file] [prompt] [types]');
  console.log('  node test-direct-openai.js payload.json "Make it blue" "color,text"');
  console.log('');
  console.log(`File not found: ${jsonFile}`);
  process.exit(1);
}

async function makeDirectOpenAIRequest() {
  const systemPrompt = `You are an expert UI/UX designer and developer. You will receive design data from Figma and a user prompt for modifications.

Your task is to analyze the design elements and provide specific modification instructions that can be applied programmatically.

CRITICAL RULES FOR COLOR MODIFICATIONS:
- ONLY suggest color modifications for elements that already have colors applied (hasColor: true)
- NEVER add colors to elements that don't already have fills or strokes
- Look for the "hasColor" property and "colors" array in each element
- If an element has hasColor: false or empty colors array, DO NOT suggest color changes for it
- Only modify existing fills and strokes, never create new ones

CRITICAL RULES FOR TEXT FORMATTING PRESERVATION:
- ALWAYS preserve the original text formatting and structure
- If the original text has \\n (line breaks), maintain them in the new text
- If the original text has multiple paragraphs separated by \\n, keep that structure
- If the original text is a single line, keep the new text as a single line
- Match the formatting style: if original has numbered steps with \\n, maintain that pattern
- Preserve any intentional text structure like lists, steps, or multi-line instructions

IMPORTANT FORMATTING RULES:
- For text modifications: "newValue" must be a plain string (not an object)
- For text with line breaks: maintain \\n characters in the exact same structural pattern
- For color modifications: use "action": "replace" and provide hex colors like "#FF6B6B" 
- Only suggest modifications for element IDs that actually exist in the provided data
- Do not create fake element IDs like "new:001" - only modify existing elements

Return your response as JSON with this structure:
{
  "modifications": [
    {
      "elementId": "id do elemento no Figma",
      "elementName": "nome do elemento",
      "elementType": "TEXT|FRAME|RECTANGLE|ELLIPSE|VECTOR|COMPONENT|INSTANCE|GROUP|LINE|BOOLEAN_OPERATION",
      "type": "text|color|layout|style",
      "action": "replace|update|adjust|apply",
      "property": "characters|fills|strokes|layoutMode|padding|cornerRadius|opacity|shadow|other properties",
      "currentValue": "valor atual (string ou JSON)",
      "newValue": "novo valor proposto (string ou JSON)",
      "reasoning": "explicação detalhada da modificação",
      "confidence": 0.85,
      "priority": "high|medium|low"
    }
  ],
  "metadata": {
    "typesProcessed": ["text", "color"],
    "prompt": "prompt original do usuário",
    "analysisSummary": "resumo da análise do design"
  }
}

RULES FOR TYPES FILTER:
- Only return modifications matching the types array provided: ${JSON.stringify(types)}
- If types includes "text", include text modifications
- If types includes "color", include color modifications
- If types includes "layout", include layout modifications
- If types includes "style", include style modifications
- Ignore (do not include) any modifications that don't match the requested types`;

  const designDataString = JSON.stringify(designAnalysis);
  const userMessage = `User prompt: ${prompt}

Design data:
${designDataString}`;

  const messages = [
    {
      role: 'system',
      content: [
        {
          type: 'text',
          text: systemPrompt,
        },
      ],
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: userMessage,
        },
      ],
    },
  ];

  const payload = {
    model: 'gpt-5',
    messages,
    response_format: { type: 'json_object' },
  };

  const startTime = Date.now();

  try {
    console.log('\n🚀 Calling OpenAI API directly...');
    console.log('Model: gpt-5');
    console.log('Payload size:', JSON.stringify(payload).length, 'characters');
    console.log('Design elements:', designAnalysis.elements ? designAnalysis.elements.length : 0);
    console.log('Prompt:', prompt);
    console.log('Types:', types);
    console.log('---\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload)
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const result = await response.json();
    
    console.log('\n✅ SUCCESS!');
    console.log('---');
    
    // Token usage
    if (result.usage) {
      console.log('\n🎯 TOKEN USAGE:');
      console.log('  Prompt tokens:', result.usage.prompt_tokens);
      console.log('  Completion tokens:', result.usage.completion_tokens);
      console.log('  Total tokens:', result.usage.total_tokens);
      
      // Calculate cost for gpt-5
      // Note: Update pricing based on actual gpt-5 pricing when available
      // Using gpt-4o pricing as placeholder: $5.00 per 1M input tokens, $15.00 per 1M output tokens
      const inputCost = (result.usage.prompt_tokens / 1_000_000) * 5.00;
      const outputCost = (result.usage.completion_tokens / 1_000_000) * 15.00;
      const totalCost = inputCost + outputCost;
      console.log('  Estimated cost: $' + totalCost.toFixed(4));
    }
    
    // Parse modifications
    const content = result.choices?.[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        const modifications = parsed?.modifications ?? parsed;
        
        console.log('\n📝 MODIFICATIONS:');
        console.log('  Total modifications:', Array.isArray(modifications) ? modifications.length : 'N/A');
        
        if (Array.isArray(modifications) && modifications.length > 0) {
          console.log('  Sample modification:', JSON.stringify(modifications[0], null, 2));
        }
      } catch (e) {
        console.log('\n⚠️  Could not parse modifications from response');
      }
    }
    
    console.log('\n---');
    console.log(`⏱️  Total time: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    console.log('🔗 Method: Direct OpenAI API call (no backend)');

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

makeDirectOpenAIRequest();
