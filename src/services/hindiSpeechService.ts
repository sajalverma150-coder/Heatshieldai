/**
 * Hindi & English Voice Speech Synthesis Service for Emergency Alerts
 * Handles browser Web Speech API voice matching, async voice loading, 
 * and explicit 'hi-IN' language parameter routing for Hindi TTS playback.
 */

let activeAudio: HTMLAudioElement | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

export function getBestHindiVoice(): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices || voices.length === 0) return null;

  const hiInExact = voices.find((v) => 
    v.lang.toLowerCase() === 'hi-in' || 
    v.lang.toLowerCase() === 'hi_in' ||
    v.lang.toLowerCase() === 'hi'
  );
  if (hiInExact) return hiInExact;

  const hiByName = voices.find((v) => 
    v.lang.toLowerCase().startsWith('hi') ||
    v.name.toLowerCase().includes('hindi') ||
    v.name.toLowerCase().includes('हिन्दी') ||
    v.name.toLowerCase().includes('kalpana') ||
    v.name.toLowerCase().includes('hemant') ||
    v.name.toLowerCase().includes('madhur') ||
    v.name.toLowerCase().includes('swara') ||
    v.name.toLowerCase().includes('lekha') ||
    v.name.toLowerCase().includes('neerja')
  );

  return hiByName || null;
}

export function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices || voices.length === 0) return null;

  const enIn = voices.find((v) => v.lang.toLowerCase() === 'en-in');
  if (enIn) return enIn;

  const enGen = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
  if (enGen) return enGen;

  return voices.find((v) => v.default) || voices[0] || null;
}

/**
 * Convert Devanagari script to Romanized Phonetic Hindi (Hinglish)
 * Enables any browser English/Indic voice engine to pronounce Hindi words naturally
 * when native OS Hindi voice packs are missing in standalone deployment mode.
 */
export function devanagariToRoman(str: string): string {
  if (!str) return '';

  const charMap: Record<string, string> = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'am', 'अः': 'ah',
    'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
    'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
    'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
    'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
    'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
    'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va', 'श': 'sha',
    'ष': 'sha', 'स': 'sa', 'ह': 'ha', 'ड़': 'ra', 'ढ़': 'rha',
    'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'm', 'ः': 'h',
    '्': '', '़': '', '।': '.', '॥': '.'
  };

  let res = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    res += charMap[ch] !== undefined ? charMap[ch] : ch;
  }
  return res;
}

export function stopEmergencyAlertSpeech() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch (e) {
      // ignore
    }
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Speak Emergency Announcement in Hindi or English.
 * Supports server endpoint (/api/tts), direct client cloud TTS fallback, 
 * native Hindi WebSpeech, and Romanized Hinglish phonetic fallback for standalone builds.
 * Guaranteed to play ONCE and stop when completed without repeating.
 */
export function speakEmergencyAlert({
  textHi,
  textEn,
  language = 'hi',
  onStart,
  onEnd,
  onError,
}: {
  textHi: string;
  textEn?: string;
  language?: 'hi' | 'en' | 'hi-IN' | string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}) {
  stopEmergencyAlertSpeech();

  const normalizedLang = (language || 'hi').toLowerCase();
  const isHindi = normalizedLang === 'hi' || normalizedLang.startsWith('hi');
  const textToSpeak = isHindi ? textHi : (textEn || textHi);
  const targetLang = isHindi ? 'hi' : 'en';

  let hasHandledTier1Error = false;
  let hasHandledTier2Error = false;

  // Helper for browser Web Speech API fallback
  const fallbackWebSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onError) onError('Speech synthesis unsupported');
      return;
    }

    try {
      // Clear any remaining queue before speaking single instance
      window.speechSynthesis.cancel();

      const nativeHindiVoice = isHindi ? getBestHindiVoice() : null;
      
      // If Hindi is selected but browser lacks native Hindi voice pack,
      // convert Devanagari text to Romanized Hinglish phonetics so any speech engine speaks Hindi words cleanly!
      let speechString = textToSpeak;
      if (isHindi && !nativeHindiVoice) {
        speechString = devanagariToRoman(textToSpeak);
      }

      const utterance = new SpeechSynthesisUtterance(speechString);

      if (isHindi) {
        if (nativeHindiVoice) {
          utterance.lang = 'hi-IN';
          utterance.voice = nativeHindiVoice;
        } else {
          // Use Indic English (en-IN) or best available voice with Romanized Hindi text
          utterance.lang = 'en-IN';
          const englishVoice = getBestEnglishVoice();
          if (englishVoice) utterance.voice = englishVoice;
        }
      } else {
        utterance.lang = 'en-IN';
        const englishVoice = getBestEnglishVoice();
        if (englishVoice) utterance.voice = englishVoice;
      }

      utterance.rate = isHindi ? 0.88 : 0.92;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        if (onStart) onStart();
      };
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = (e) => {
        console.warn('WebSpeech fallback error:', e);
        if (onError) onError(e);
      };

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    } catch (fallbackErr) {
      console.error('WebSpeech fallback invocation failed:', fallbackErr);
      if (onError) onError(fallbackErr);
    }
  };

  const triggerTier3WebSpeech = () => {
    if (hasHandledTier2Error) return;
    hasHandledTier2Error = true;
    fallbackWebSpeech();
  };

  // Tier 2: Direct Client Cloud TTS URL for Standalone / Static Deployments
  const playDirectClientAudio = () => {
    try {
      const chunk = textToSpeak.substring(0, 180);
      const clientTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${targetLang}&client=tw-ob`;
      const clientAudio = new Audio(clientTtsUrl);
      clientAudio.loop = false;
      activeAudio = clientAudio;

      clientAudio.onplay = () => {
        if (onStart) onStart();
      };

      clientAudio.onended = () => {
        activeAudio = null;
        if (onEnd) onEnd();
      };

      clientAudio.onerror = () => {
        activeAudio = null;
        triggerTier3WebSpeech();
      };

      const p = clientAudio.play();
      if (p !== undefined) {
        p.catch(() => {
          activeAudio = null;
          triggerTier3WebSpeech();
        });
      }
    } catch (e) {
      triggerTier3WebSpeech();
    }
  };

  const triggerTier2DirectClientAudio = () => {
    if (hasHandledTier1Error) return;
    hasHandledTier1Error = true;
    playDirectClientAudio();
  };

  // Tier 1: Try Primary Server Endpoint (/api/tts)
  try {
    const ttsAudioUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=${targetLang}`;
    const audio = new Audio(ttsAudioUrl);
    audio.loop = false;
    activeAudio = audio;

    audio.onplay = () => {
      if (onStart) onStart();
    };

    audio.onended = () => {
      activeAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      activeAudio = null;
      triggerTier2DirectClientAudio();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        activeAudio = null;
        triggerTier2DirectClientAudio();
      });
    }
    return true;
  } catch (err) {
    triggerTier2DirectClientAudio();
    return true;
  }
}
