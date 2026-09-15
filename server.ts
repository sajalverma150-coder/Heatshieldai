import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in the environment');
    }
    aiClient = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// In-memory weather cache (5-minute TTL)
const weatherCache = new Map<string, { data: any; expiresAt: number }>();

// Weather proxy endpoint to securely fetch from Open-Meteo without client CORS / sandbox restrictions
app.get('/api/weather-proxy', async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).json({ error: 'Missing url query parameter' });
    }

    const decodedUrl = decodeURIComponent(rawUrl);
    // Security check: only allow open-meteo endpoints
    if (!decodedUrl.startsWith('https://api.open-meteo.com/')) {
      return res.status(403).json({ error: 'Only open-meteo API requests are permitted' });
    }

    const cached = weatherCache.get(decodedUrl);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json(cached.data);
    }

    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'NHHEWS-India-National-Portal/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Upstream weather provider responded with ${response.status}`,
      });
    }

    const data = await response.json();
    weatherCache.set(decodedUrl, {
      data,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    return res.json(data);
  } catch (error: any) {
    console.error('Error in /api/weather-proxy:', error);
    return res.status(500).json({ error: error.message || 'Internal weather proxy error' });
  }
});

// High-Fidelity Text-To-Speech (TTS) Proxy Endpoint for Hindi & English Audio
app.get('/api/tts', async (req, res) => {
  try {
    const rawText = req.query.text as string;
    const lang = (req.query.lang as string) || 'hi';

    if (!rawText) {
      return res.status(400).json({ error: 'Missing text query parameter' });
    }

    const cleanText = rawText.trim();
    const targetLang = lang.toLowerCase().startsWith('hi') ? 'hi' : 'en';

    // Google Translate TTS limits single requests to ~200 characters.
    // Chunk long text into logical sentences/phrases under 170 characters.
    const chunks: string[] = [];
    let remaining = cleanText;

    while (remaining.length > 0) {
      if (remaining.length <= 170) {
        chunks.push(remaining);
        break;
      }

      // Find sentence or clause boundary near 170 characters
      let splitIdx = remaining.lastIndexOf('.', 170);
      if (splitIdx < 40) splitIdx = remaining.lastIndexOf('।', 170); // Hindi full stop (Purna Viram)
      if (splitIdx < 40) splitIdx = remaining.lastIndexOf('!', 170);
      if (splitIdx < 40) splitIdx = remaining.lastIndexOf('?', 170);
      if (splitIdx < 40) splitIdx = remaining.lastIndexOf(',', 170);
      if (splitIdx < 40) splitIdx = remaining.lastIndexOf(' ', 170);
      if (splitIdx < 40) splitIdx = 170;

      const chunk = remaining.substring(0, splitIdx + 1).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      remaining = remaining.substring(splitIdx + 1).trim();
    }

    // Limit to max 5 chunks (up to ~850 characters broadcast length)
    const activeChunks = chunks.slice(0, 5);
    const audioBuffers: Buffer[] = [];

    for (const chunk of activeChunks) {
      if (!chunk) continue;
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${targetLang}&client=tw-ob`;
      
      try {
        const audioRes = await fetch(ttsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://translate.google.com/',
          },
        });

        if (audioRes.ok) {
          const arrayBuffer = await audioRes.arrayBuffer();
          audioBuffers.push(Buffer.from(arrayBuffer));
        } else {
          console.warn(`TTS chunk fetch returned status ${audioRes.status} for chunk: "${chunk.substring(0, 30)}..."`);
        }
      } catch (chunkErr) {
        console.warn('Failed to fetch TTS chunk:', chunkErr);
      }
    }

    if (audioBuffers.length === 0) {
      return res.status(502).json({ error: 'Failed to synthesize audio from TTS engine' });
    }

    // Concatenate all MP3 audio buffers into one seamless audio stream
    const combinedBuffer = Buffer.concat(audioBuffers);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': combinedBuffer.length.toString(),
      'Cache-Control': 'public, max-age=86400',
    });

    return res.send(combinedBuffer);
  } catch (err: any) {
    console.error('Error in /api/tts endpoint:', err);
    return res.status(500).json({ error: err.message || 'TTS generation error' });
  }
});

// Explicit JSON 404 for any unregistered /api routes so they do not return HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint ${req.method} ${req.originalUrl} not found` });
});

// Vite integration / Static serving
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development')) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite dev middleware startup issue, checking dist fallback:', err);
      if (hasDist) {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HeatShield AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
