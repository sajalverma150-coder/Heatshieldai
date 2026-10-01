/**
 * AI Call Assistant Service
 * Manages automated outbound calling triggers, IVR dialogue parsing,
 * realistic synthesized Web Audio ringtones/DTMF tones, and emergency assistance tickets.
 */

import { LanguageCode } from '../types';
import { speakEmergencyAlert, stopEmergencyAlertSpeech } from './hindiSpeechService';

export type AssistanceType = 
  | 'hospital_bed' 
  | 'cooling_shelter' 
  | 'water_tanker' 
  | 'ambulance_108' 
  | 'doctor_consult'
  | 'marked_safe';

export interface AssistanceTicket {
  id: string;
  type: AssistanceType;
  titleEn: string;
  titleHi: string;
  facilityName: string;
  location: string;
  patientName: string;
  phoneNumber: string;
  timestamp: string;
  etaOrTimeSlot: string;
  tokenNumber: string;
  status: 'CONFIRMED' | 'DISPATCHED' | 'ACTIVE' | 'RESOLVED';
  details: {
    serviceCode: string;
    bedOrUnitId?: string;
    contactPhone?: string;
    instructionsEn: string;
    instructionsHi: string;
    qrPayload: string;
  };
}

export interface CallAssistantSettings {
  autoCallEnabled: boolean;
  phoneNumber: string;
  triggerTempThreshold: number; // °C
  triggerWbgtThreshold: number; // °C
  preferredLanguage: LanguageCode;
  autoTriggerOnSevereAlert: boolean;
  soundAlerts: boolean;
  lastAutoCallTimestamp?: number;
}

const SETTINGS_STORAGE_KEY = 'heatshield_call_settings';
const TICKETS_STORAGE_KEY = 'heatshield_assistance_tickets';
const CALL_HISTORY_STORAGE_KEY = 'heatshield_call_history';

export const DEFAULT_CALL_SETTINGS: CallAssistantSettings = {
  autoCallEnabled: true,
  phoneNumber: '+91 98200 44108',
  triggerTempThreshold: 40.0,
  triggerWbgtThreshold: 31.0,
  preferredLanguage: 'en',
  autoTriggerOnSevereAlert: true,
  soundAlerts: true,
};

export function loadCallAssistantSettings(): CallAssistantSettings {
  try {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (data) {
      return { ...DEFAULT_CALL_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.warn('Failed to load call settings from storage:', e);
  }
  return DEFAULT_CALL_SETTINGS;
}

export function saveCallAssistantSettings(settings: CallAssistantSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('heatshield_settings_changed', { detail: settings }));
  } catch (e) {
    console.warn('Failed to save call settings to storage:', e);
  }
}

export function loadAssistanceTickets(): AssistanceTicket[] {
  try {
    const data = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to load tickets from storage:', e);
  }
  return [];
}

export function saveAssistanceTicket(ticket: AssistanceTicket): void {
  try {
    const current = loadAssistanceTickets();
    const updated = [ticket, ...current.filter((t) => t.id !== ticket.id)];
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('heatshield_ticket_created', { detail: ticket }));
  } catch (e) {
    console.warn('Failed to save ticket:', e);
  }
}

export function deleteAssistanceTicket(ticketId: string): void {
  try {
    const current = loadAssistanceTickets();
    const filtered = current.filter((t) => t.id !== ticketId);
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('heatshield_ticket_deleted', { detail: ticketId }));
  } catch (e) {
    console.warn('Failed to delete ticket:', e);
  }
}

// -------------------------------------------------------------
// WEB AUDIO SYNTHESIZER: Ringtone, Call Connected, DTMF Beeps
// -------------------------------------------------------------
let audioCtx: AudioContext | null = null;
let ringInterval: any = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays Indian telephone double-ring cadence (400Hz + 450Hz tone pulse)
 */
export function startRingtoneSound(): () => void {
  stopRingtoneSound();
  const ctx = getAudioContext();
  if (!ctx) return () => {};

  const playSingleRingPulse = () => {
    try {
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      // Burst 1 (0.4s)
      playToneBurst(ctx, 400, 450, now, 0.35);
      // Burst 2 (0.4s after 0.2s pause)
      playToneBurst(ctx, 400, 450, now + 0.5, 0.35);
    } catch (e) {
      console.warn('Error playing ring pulse:', e);
    }
  };

  playSingleRingPulse();
  ringInterval = setInterval(playSingleRingPulse, 2800);

  return stopRingtoneSound;
}

function playToneBurst(ctx: AudioContext, freq1: number, freq2: number, startTime: number, duration: number) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc1.type = 'sine';
  osc2.type = 'sine';
  osc1.frequency.setValueAtTime(freq1, startTime);
  osc2.frequency.setValueAtTime(freq2, startTime);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
  gainNode.gain.setValueAtTime(0.12, startTime + duration - 0.05);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + duration);
  osc2.stop(startTime + duration);
}

export function stopRingtoneSound(): void {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
}

/**
 * Plays DTMF Keypad Touch Tone for dialpad keys 0-9, *, #
 */
export function playDtmfTone(key: string): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const dtmfFreqs: Record<string, [number, number]> = {
    '1': [697, 1209],
    '2': [697, 1336],
    '3': [697, 1477],
    '4': [770, 1209],
    '5': [770, 1336],
    '6': [770, 1477],
    '7': [852, 1209],
    '8': [852, 1336],
    '9': [852, 1477],
    '*': [941, 1209],
    '0': [941, 1336],
    '#': [941, 1477],
  };

  const freqs = dtmfFreqs[key] || [800, 1200];
  try {
    if (ctx.state === 'suspended') ctx.resume();
    playToneBurst(ctx, freqs[0], freqs[1], ctx.currentTime, 0.14);
  } catch (e) {
    console.warn('DTMF sound error:', e);
  }
}

/**
 * Plays emergency confirmation success chime
 */
export function playSuccessChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    playToneBurst(ctx, 523.25, 659.25, now, 0.15); // C5 + E5
    playToneBurst(ctx, 659.25, 783.99, now + 0.15, 0.25); // E5 + G5
  } catch (e) {
    console.warn('Success chime error:', e);
  }
}

// -------------------------------------------------------------
// TICKET FACTORY: Generates Verified Emergency Passes & Bookings
// -------------------------------------------------------------
export function createEmergencyTicket({
  type,
  cityName,
  patientName = 'Citizen',
  phoneNumber = '+91 98200 44108',
  ward = 'Central Sector',
}: {
  type: AssistanceType;
  cityName: string;
  patientName?: string;
  phoneNumber?: string;
  ward?: string;
}): AssistanceTicket {
  const randomToken = Math.floor(10000 + Math.random() * 90000);
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  switch (type) {
    case 'hospital_bed':
      return {
        id: `TKT-HOSP-${randomToken}`,
        type: 'hospital_bed',
        titleEn: 'Heat Stroke Emergency ICU Bed Reservation',
        titleHi: 'हीट स्ट्रोक आपातकालीन आईसीयू बेड आरक्षण',
        facilityName: `${cityName} Civil Trauma & Hyperthermia Center`,
        location: `Ward 4, Hospital Road, ${cityName}`,
        patientName,
        phoneNumber,
        timestamp: `${dateStr}, ${timeStr}`,
        etaOrTimeSlot: 'Admit Within 45 Mins (Bed Reserved)',
        tokenNumber: `ICU-BED-${randomToken}`,
        status: 'CONFIRMED',
        details: {
          serviceCode: 'NHHEWS-ICU-RES-01',
          bedOrUnitId: `Bed #H-${Math.floor(10 + Math.random() * 40)} (Cold Saline & Ice-Bath Equipped)`,
          contactPhone: '108 / 0515-2820108',
          instructionsEn: 'Proceed directly to the Emergency Casualty Gate. Present this token for zero-wait triage admission.',
          instructionsHi: 'सीधे आपातकालीन द्वार पर जाएं। बिना प्रतीक्षा के प्रवेश हेतु यह टोकन दिखाएं।',
          qrPayload: `NHHEWS:HOSP_BED:${cityName}:${randomToken}:${patientName}`,
        },
      };

    case 'cooling_shelter':
      return {
        id: `TKT-SHELTER-${randomToken}`,
        type: 'cooling_shelter',
        titleEn: 'Municipal AC Cooling Shelter Day Pass',
        titleHi: 'नगर पालिका वातानुकूलित शीतलन केंद्र डे-पास',
        facilityName: `${cityName} Municipal AC Community Refuge Center`,
        location: `Near Town Hall & Central Bus Terminal, ${cityName}`,
        patientName,
        phoneNumber,
        timestamp: `${dateStr}, ${timeStr}`,
        etaOrTimeSlot: 'Valid Today Until 8:00 PM IST',
        tokenNumber: `SHELTER-PASS-${randomToken}`,
        status: 'CONFIRMED',
        details: {
          serviceCode: 'NHHEWS-COOL-SHELTER-02',
          bedOrUnitId: `Rest Recliner #R-${Math.floor(1 + Math.random() * 30)} (Air Conditioned)`,
          contactPhone: '1078 / 0515-2820078',
          instructionsEn: 'Free air conditioning, cooled drinking water, ORS packets, and medical pulse check available upon entry.',
          instructionsHi: 'प्रवेश पर मुफ्त एसी, ठंडा पेयजल, ओआरएस पैकेट एवं स्वास्थ्य जांच उपलब्ध है।',
          qrPayload: `NHHEWS:SHELTER:${cityName}:${randomToken}:${patientName}`,
        },
      };

    case 'water_tanker':
      return {
        id: `TKT-TANKER-${randomToken}`,
        type: 'water_tanker',
        titleEn: 'Emergency Potable Water & ORS Tanker Bowser Dispatch',
        titleHi: 'आपातकालीन पेयजल एवं ओआरएस टैंकर प्रेषण',
        facilityName: `${cityName} Jal Nigam Rapid Bowser Fleet`,
        location: `Dispatched to: ${ward}, ${cityName}`,
        patientName,
        phoneNumber,
        timestamp: `${dateStr}, ${timeStr}`,
        etaOrTimeSlot: 'Arriving in ~15 - 20 Minutes',
        tokenNumber: `BOWSER-TRK-${randomToken}`,
        status: 'DISPATCHED',
        details: {
          serviceCode: 'NHHEWS-WATER-TANKER-03',
          bedOrUnitId: `Tanker Unit #UP-${Math.floor(10 + Math.random() * 80)}-T${randomToken.toString().substring(0, 3)} (5,000 Liters Chilled Potable Water)`,
          contactPhone: '112 / Jal Nigam Control',
          instructionsEn: 'Driver will contact your registered phone upon arrival at your ward intersection. Free clean water and ORS sachets.',
          instructionsHi: 'चालक आपके वार्ड में पहुंचने पर फोन करेगा। स्वच्छ पेयजल एवं ओआरएस नि:शुल्क प्राप्त करें।',
          qrPayload: `NHHEWS:TANKER:${cityName}:${randomToken}:${phoneNumber}`,
        },
      };

    case 'ambulance_108':
      return {
        id: `TKT-AMB-${randomToken}`,
        type: 'ambulance_108',
        titleEn: 'Code Red 108 Emergency Ambulance Dispatched',
        titleHi: 'कोड रेड १०८ आपातकालीन एम्बुलेंस रवाना',
        facilityName: `${cityName} 108 Advanced Life Support Unit`,
        location: `En Route to Caller GPS Coordinates (${cityName})`,
        patientName,
        phoneNumber,
        timestamp: `${dateStr}, ${timeStr}`,
        etaOrTimeSlot: 'Estimated Arrival: 6 - 8 Minutes',
        tokenNumber: `AMB-108-${randomToken}`,
        status: 'DISPATCHED',
        details: {
          serviceCode: 'NHHEWS-AMB-108-04',
          bedOrUnitId: `Ambulance #MH-01-4491 (Ice-Bath & Cardiac Monitor Onboard)`,
          contactPhone: '108 (Direct Paramedic Line)',
          instructionsEn: 'Keep patient in shade. Douse skin with cold water and fan vigorously until paramedics reach.',
          instructionsHi: 'मरीज को छांव में रखें। ठंडे पानी का छिड़काव करें और पंखा चलाएं जब तक एम्बुलेंस न पहुंचे।',
          qrPayload: `NHHEWS:AMB108:${cityName}:${randomToken}:${patientName}`,
        },
      };

    case 'doctor_consult':
      return {
        id: `TKT-DOC-${randomToken}`,
        type: 'doctor_consult',
        titleEn: '24x7 Government Heat Tele-Doctor Callback Line',
        titleHi: '२४x७ सरकारी हीट टेली-डॉक्टर परामर्श कॉल लाइन',
        facilityName: `National Health Mission Tele-Triage Desk`,
        location: `Virtual Clinical Hotline (Direct Callback)`,
        patientName,
        phoneNumber,
        timestamp: `${dateStr}, ${timeStr}`,
        etaOrTimeSlot: 'Priority Doctor Call Within 3 Minutes',
        tokenNumber: `DOC-CALL-${randomToken}`,
        status: 'ACTIVE',
        details: {
          serviceCode: 'NHHEWS-TELE-DOC-05',
          bedOrUnitId: `Duty Officer: Dr. V. Sharma (Hyperthermia Specialist)`,
          contactPhone: 'Toll Free: 1075 / 1078',
          instructionsEn: 'Keep phone line clear. Doctor will initiate priority clinical video/audio triage consultation.',
          instructionsHi: 'फोन लाइन खाली रखें। विशेषज्ञ डॉक्टर तुरंत परामर्श कॉल करेंगे।',
          qrPayload: `NHHEWS:DOC:${cityName}:${randomToken}:${phoneNumber}`,
        },
      };

    case 'marked_safe':
    default:
      return {
        id: `TKT-SAFE-${randomToken}`,
        type: 'marked_safe',
        titleEn: 'Citizen Safety & Hydration Check-in Logged',
        titleHi: 'नागरिक सुरक्षा एवं जलयोजन चेक-इन दर्ज',
        facilityName: `${cityName} Disaster Management Ops Desk`,
        location: `${cityName}`,
        patientName,
        phoneNumber,
        timestamp: `${dateStr}, ${timeStr}`,
        etaOrTimeSlot: 'Status Logged: Safe & Hydrated',
        tokenNumber: `SAFE-LOG-${randomToken}`,
        status: 'RESOLVED',
        details: {
          serviceCode: 'NHHEWS-SAFE-CHECK-06',
          bedOrUnitId: `Safe Check-in Confirmed`,
          instructionsEn: 'Continue drinking 500ml water every 45 minutes. Avoid direct sun between 12:00 PM and 4:00 PM.',
          instructionsHi: 'हर ४५ मिनट में पानी पीते रहें। दोपहर १२ से ४ बजे तक धूप से बचें।',
          qrPayload: `NHHEWS:SAFE:${cityName}:${randomToken}:${patientName}`,
        },
      };
  }
}
