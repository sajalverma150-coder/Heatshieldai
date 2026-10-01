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

// AI Call Assistant Dialogue & Emergency Intent Triage Endpoint
app.post('/api/ai-call-agent', async (req, res) => {
  try {
    const { userInput, language = 'en', cityName = 'Unnao', temp = 42, history = [] } = req.body;

    const systemPrompt = `You are "HeatShield AI Safety Dispatcher", the official 24x7 automated emergency voice calling assistant for India's National Heat Health Early Warning System (NHHEWS).
A severe heatwave alert is currently triggered in ${cityName} with temperature at ${temp}°C.

Your job is to assist citizens over an automated voice call.
When they speak or press IVR options, evaluate their immediate emergency needs:
1. Hospital bed / Heat stroke emergency triage bed reservation
2. Nearest municipal cooling shelter / air-conditioned refuge & day pass
3. Emergency clean drinking water / ORS tanker bowser dispatch
4. 108 Emergency Ambulance & hyperthermia mobile rescue unit
5. Doctor tele-triage / heat illness medical advisory
6. Safe status / citizen does not require emergency help

Return ONLY a valid JSON object with the following schema:
{
  "textEn": "Concise, compassionate, crystal-clear spoken response in English (under 35 words)",
  "textHi": "Concise, compassionate, crystal-clear spoken response in Hindi Devanagari (under 35 words)",
  "intent": "RESERVE_HOSPITAL" | "RESERVE_SHELTER" | "WATER_TANKER" | "AMBULANCE_108" | "DOCTOR_CONSULT" | "MARK_SAFE" | "YES_HELP" | "GENERAL_QUERY",
  "action": "NONE" | "BOOK_HOSPITAL" | "BOOK_SHELTER" | "DISPATCH_TANKER" | "DISPATCH_AMBULANCE" | "CONNECT_DOCTOR" | "LOG_SAFE"
}

Ensure the responses are brief and suitable for rapid voice synthesis over telephone.`;

    try {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nCitizen said: "${userInput || 'Hello, I need assistance'}"` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        }
      });

      const responseText = response.text?.trim();
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      }
    } catch (aiErr) {
      console.warn('Gemini AI Call Agent fallback:', aiErr);
    }

    // High quality deterministic fallback if AI client unavailable
    const lowerInput = (userInput || '').toLowerCase();
    if (lowerInput.includes('hospital') || lowerInput.includes('bed') || lowerInput.includes('stroke') || lowerInput.includes('अस्पताल') || lowerInput.includes('इलाज') || lowerInput === '1') {
      return res.json({
        textEn: `I am reserving an emergency heat-stroke bed at the nearest Trauma Center in ${cityName}. Your reservation token is generated.`,
        textHi: `${cityName} के निकटतम ट्रॉमा सेंटर में आपका आपातकालीन हीट-स्ट्रोक बेड आरक्षित किया जा रहा है। टोकन जारी कर दिया गया है।`,
        intent: 'RESERVE_HOSPITAL',
        action: 'BOOK_HOSPITAL'
      });
    }

    if (lowerInput.includes('shelter') || lowerInput.includes('cooling') || lowerInput.includes('center') || lowerInput.includes('शरण') || lowerInput.includes('आश्रय') || lowerInput === '2') {
      return res.json({
        textEn: `Reserving your priority day pass for the nearest Municipal AC Cooling Shelter in ${cityName} with hydration and rest facilities.`,
        textHi: `${cityName} के निकटतम वातानुकूलित शीतलन केंद्र में आपका डे-पास आरक्षित किया जा रहा है।`,
        intent: 'RESERVE_SHELTER',
        action: 'BOOK_SHELTER'
      });
    }

    if (lowerInput.includes('water') || lowerInput.includes('tanker') || lowerInput.includes('ors') || lowerInput.includes('पानी') || lowerInput.includes('टैंकर') || lowerInput === '3') {
      return res.json({
        textEn: `Emergency drinking water and ORS tanker bowser has been routed to your registered ward in ${cityName}.`,
        textHi: `आपके वार्ड में आपातकालीन पेयजल और ओआरएस टैंकर रवाना कर दिया गया है।`,
        intent: 'WATER_TANKER',
        action: 'DISPATCH_TANKER'
      });
    }

    if (lowerInput.includes('ambulance') || lowerInput.includes('108') || lowerInput.includes('serious') || lowerInput.includes('एम्बुलेंस') || lowerInput.includes('गंभीर') || lowerInput === '4') {
      return res.json({
        textEn: `Emergency 108 Ice-Bath Ambulance unit dispatched to your location. Keep phone line clear.`,
        textHi: `१०८ आइस-बाथ एम्बुलेंस आपके स्थान के लिए रवाना कर दी गई है। कृपया फोन खुला रखें।`,
        intent: 'AMBULANCE_108',
        action: 'DISPATCH_AMBULANCE'
      });
    }

    if (lowerInput.includes('doctor') || lowerInput.includes('consult') || lowerInput.includes('सलाह') || lowerInput.includes('डॉक्टर') || lowerInput === '5') {
      return res.json({
        textEn: `Connecting you to the 24x7 Government Heat Emergency Tele-Doctor triage line.`,
        textHi: `आपको २४x७ सरकारी हीट इमरजेंसी टेली-डॉक्टर परामर्श से जोड़ा जा रहा है।`,
        intent: 'DOCTOR_CONSULT',
        action: 'CONNECT_DOCTOR'
      });
    }

    if (lowerInput.includes('safe') || lowerInput.includes('fine') || lowerInput.includes('no help') || lowerInput.includes('ठीक') || lowerInput.includes('सुरक्षित') || lowerInput.includes('नहीं') || lowerInput === '9') {
      return res.json({
        textEn: `Thank you for confirming your safety. Please stay hydrated and avoid midday sunlight. HeatShield AI is on standby.`,
        textHi: `आपकी सुरक्षा पुष्टि के लिए धन्यवाद। कृपया धूप से बचें और पानी पीते रहें। हीटशील्ड सदैव उपलब्ध है।`,
        intent: 'MARK_SAFE',
        action: 'LOG_SAFE'
      });
    }

    return res.json({
      textEn: `HeatShield Emergency Safety Line active for ${cityName}. Please press 1 for Hospital Bed, 2 for Cooling Shelter, 3 for Water Tanker, or speak your request.`,
      textHi: `${cityName} के लिए हीटशील्ड आपातकालीन लाइन सक्रिय है। अस्पताल बेड के लिए १, शीतलन केंद्र के लिए २, जल टैंकर के लिए ३ दबाएं।`,
      intent: 'YES_HELP',
      action: 'NONE'
    });
  } catch (agentErr: any) {
    console.error('Error in /api/ai-call-agent:', agentErr);
    return res.status(500).json({ error: agentErr.message || 'Call agent processing error' });
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
