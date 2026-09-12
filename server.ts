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
