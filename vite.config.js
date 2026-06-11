import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const defaultOllamaModel = 'llama3.2:latest';
const defaultGeminiModel = 'gemini-3.5-flash';

const modelMap = {
  quantum: defaultOllamaModel,
  vector: defaultOllamaModel,
  local: defaultOllamaModel,
};

const midnightSystemPrompt = "You are Midnight, Elexit Integrated Labs' JARVIS-style engineering co-pilot. Respond like a calm futuristic engineering aide: polished, precise, proactive, and lightly formal. When appropriate, open with a short acknowledgement such as 'Certainly, sir.' or 'Understood.' Format engineering replies with bold Markdown headings and bullet points. Do not use underline-style headings made of === or ---. For physical build requests, use exactly these bold headings and no extra top-level headings: **Final Build**, **Core Parts**, **How It Works**, **Why It Works**, **Build Steps**, **Safety Check**, and **Ways To Improve It**. The **Build Steps** section is the most important section. It must read like a beginner-friendly instruction book with at least 8 numbered steps. Each numbered step must include: exact dimensions or a starter measurement when useful, the tool to use, where the piece goes using left/right/front/back/top/bottom language, the action to take, and a short 'Check:' sentence so a brand-new builder can verify it. Use one main action per step. If exact dimensions depend on materials, give a sensible starter size and explain how to scale it. Avoid vague phrases like 'attach it' unless you say exactly where and how. Explain deeply but simply, using clear cause-and-effect. Keep answers concise but genuinely useful. Use code fences only for code. Do not mention that you are an AI language model.";

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function json(response, status, payload) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload));
}

async function getOllamaModel(ollamaHost, requestedModel) {
  const configuredModel = process.env.OLLAMA_MODEL || modelMap[requestedModel] || defaultOllamaModel;

  try {
    const tagsResponse = await fetch(`${ollamaHost}/api/tags`);
    const tags = await tagsResponse.json();
    const installed = tags.models?.map((item) => item.name || item.model).filter(Boolean) || [];

    if (installed.includes(configuredModel)) return configuredModel;
    if (installed.length > 0) return installed[0];

    throw new Error('Ollama is running, but no local models are installed. Run: ollama pull llama3.2');
  } catch (error) {
    if (error.message.includes('no local models')) throw error;
    return configuredModel;
  }
}

async function callGemini(message, env) {
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || env.GEMINI_MODEL || defaultGeminiModel;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from .env.');
  }

  const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: midnightSystemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        temperature: 0.65,
        topP: 0.9,
      },
    }),
  });

  const payload = await geminiResponse.json().catch(() => ({}));

  if (!geminiResponse.ok) {
    throw new Error(payload.error?.message || `Gemini rejected model ${geminiModel}.`);
  }

  const reply = payload.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join('\n') || '';

  return {
    metadata: 'MIDNIGHT AI // GEMINI_CASCADE_STREAM',
    reply: reply || '[NO SIGNAL] Gemini returned no message content.',
    model: geminiModel,
  };
}

async function callOllama(message, model) {
  const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const ollamaModel = await getOllamaModel(ollamaHost, model);
  const ollamaResponse = await fetch(`${ollamaHost}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ollamaModel,
      stream: false,
      messages: [
        { role: 'system', content: midnightSystemPrompt },
        { role: 'user', content: message },
      ],
    }),
  });
  const payload = await ollamaResponse.json().catch(() => ({}));

  if (!ollamaResponse.ok) {
    throw new Error(payload.error || `Ollama rejected model ${ollamaModel}.`);
  }

  return {
    metadata: `MIDNIGHT AI // ${model.toUpperCase()}_CASCADE_STREAM`,
    reply: payload.message?.content || payload.response || '[NO SIGNAL] Ollama returned no message content.',
    model: ollamaModel,
  };
}

function midnightDevApi(env) {
  return {
    name: 'midnight-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (request, response) => {
        if (request.method !== 'POST') {
          return json(response, 405, { error: 'Only POST requests are supported.' });
        }

        try {
          const body = JSON.parse(await readBody(request) || '{}');
          const { message, model = 'local' } = body;

          if (!message || typeof message !== 'string') {
            return json(response, 400, { error: 'Missing chat message.' });
          }

          const result = model === 'gemini'
            ? await callGemini(message, env)
            : await callOllama(message, model);

          return json(response, 200, result);
        } catch (error) {
          return json(response, 500, { error: error.message || 'Unknown Midnight dev server fault.' });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), midnightDevApi(env)],
    server: {
      host: '127.0.0.1',
      port: 5173,
    },
  };
});