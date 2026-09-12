import { WeatherTelemetry, ForecastDay, HeatRiskLevel } from '../types';
import { CityData } from '../data/indiaCities';
import { 
  broadcastPushNotification, 
  playNotificationChime, 
  triggerHapticVibrate,
  isNotificationSupported,
  getNotificationPermission
} from './hydrationNotificationService';

export interface DrillScenario {
  id: string;
  name: string;
  nameHi: string;
  shortTag: string;
  description: string;
  temp: number;
  wbgt: number;
  humidity: number;
  heatIndex: number;
  solarRadiation: number;
  windSpeed: number;
  riskLevel: HeatRiskLevel;
  curfewActive: boolean;
  issueText: string;
  actionText: string;
}

export const DRILL_SCENARIOS: DrillScenario[] = [
  {
    id: 'code-red-extreme',
    name: 'Code Red: Severe Heatwave (46.8°C / WBGT 34.2°C)',
    nameHi: 'कोड रेड: गंभीर लू आपातकाल (46.8°C / WBGT 34.2°C)',
    shortTag: 'CODE RED 46.8°C',
    description: 'Catastrophic thermal stress with extreme heat stroke hazard. Immediate statutory curfew and cooling triage active.',
    temp: 46.8,
    wbgt: 34.2,
    humidity: 38,
    heatIndex: 54.2,
    solarRadiation: 980,
    windSpeed: 14,
    riskLevel: 'EXTREME',
    curfewActive: true,
    issueText: 'Extreme biometeorological heat index (46.8°C / WBGT 34.2°C exceeds 30°C safe limit). Critical risk of exertional heat stroke, cardiovascular collapse, and rapid dehydration.',
    actionText: 'Cease outdoor activities immediately. Move to nearest air-cooled shelter. Drink 300ml WHO-ORS/water. Apply cold water to neck and wrists. If dizzy or confused, dial 108 immediately.',
  },
  {
    id: 'humid-heat-spike',
    name: 'Humid Thermal Spike: 42.5°C & 78% RH (WBGT 33.8°C)',
    nameHi: 'आर्द्र ऊष्मा स्पाइक: 42.5°C एवं 78% आर्द्रता (WBGT 33.8°C)',
    shortTag: 'HUMID SPIKE 42.5°C',
    description: 'Severe vapor-pressure threshold breach where sweat evaporation fails. High risk of hyperthermia in coastal & river plains.',
    temp: 42.5,
    wbgt: 33.8,
    humidity: 78,
    heatIndex: 58.4,
    solarRadiation: 840,
    windSpeed: 8,
    riskLevel: 'VERY_HIGH',
    curfewActive: true,
    issueText: 'Dangerous wet-bulb globe temperature (WBGT 33.8°C, Heat Index 58.4°C). The human body cannot cool itself via perspiration. High hyperthermia hazard.',
    actionText: 'Seek active fan/AC cooling immediately. Rest in shade, avoid heavy digestion, hydrate with electrolyte fluids. Monitor elderly family members and infants closely.',
  },
  {
    id: 'midday-labor-curfew',
    name: 'Midday Solar Peak & NDMA Labor Curfew (44.5°C)',
    nameHi: 'दोपहर सौर पीक एवं श्रम कर्फ्यू ड्रिल (44.5°C)',
    shortTag: 'LABOR CURFEW 44.5°C',
    description: 'Statutory 12:00–15:30 work suspension simulation under intense solar insolation (>1000 W/m²).',
    temp: 44.5,
    wbgt: 32.9,
    humidity: 32,
    heatIndex: 49.5,
    solarRadiation: 1020,
    windSpeed: 16,
    riskLevel: 'VERY_HIGH',
    curfewActive: true,
    issueText: 'Solar insolation exceeds 1000 W/m² with ambient temperature 44.5°C. Direct sunlight exposure causes second-degree thermal stress in under 20 minutes.',
    actionText: 'Enforce statutory 12:00–15:30 labor curfew. Provide shaded hydration stations and electrolyte water. Workers must rest in cool, well-ventilated areas.',
  },
];

/**
 * Generate simulated WeatherTelemetry for drill mode
 */
export function generateDrillTelemetry(
  scenario: DrillScenario,
  baseCity: CityData
): WeatherTelemetry {
  return {
    stationId: `IMD-${baseCity.id.toUpperCase()}-DRILL`,
    stationName: `IMD ${baseCity.name} Automated Drill Station`,
    ward: `${baseCity.name} Central Drill Sector`,
    pinCode: '209801',
    lastUpdated: 'Just now (LIVE DRILL)',
    dryBulbTemp: scenario.temp,
    wetBulbTemp: scenario.wbgt - 2.5,
    wbgt: scenario.wbgt,
    heatIndex: scenario.heatIndex,
    utci: scenario.heatIndex + 3.2,
    humidity: scenario.humidity,
    solarRadiation: scenario.solarRadiation,
    windSpeed: scenario.windSpeed,
    uhiAnomaly: 2.8,
    sweatLossRate: 1250,
    solarRadiativeLoad: 1.45,
    peakWindowStart: '11:30 AM',
    peakWindowEnd: '04:30 PM',
    grapStage: 'STAGE-IV (SEVERE EMERGENCY)',
    riskLevel: scenario.riskLevel === 'MINIMAL' ? 'MODERATE' : (scenario.riskLevel as 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'EXTREME'),
  };
}

/**
 * Generate 7-day severe forecast for drill mode
 */
export function generateDrillForecast(scenario: DrillScenario): ForecastDay[] {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayLabel = i === 0 ? 'Today (Drill)' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()];
    
    // Vary temp slightly across days
    const delta = Math.sin(i * 1.2) * 1.5;
    const maxT = Number((scenario.temp + delta).toFixed(1));
    const minT = Number((maxT - 12.0).toFixed(1));
    const wbgtDay = Number((scenario.wbgt + delta * 0.6).toFixed(1));
    const heatIndexDay = Number((scenario.heatIndex + delta * 1.1).toFixed(1));

    let risk: 'MODERATE' | 'HIGH' | 'EXTREME' | 'CRITICAL' = 'EXTREME';
    if (maxT >= 45 || wbgtDay >= 33) risk = 'CRITICAL';
    else if (maxT >= 40 || wbgtDay >= 30) risk = 'EXTREME';
    else if (maxT >= 36) risk = 'HIGH';
    else risk = 'MODERATE';

    return {
      dayName: dayLabel,
      dateStr: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      maxTemp: maxT,
      minTemp: minT,
      maxWBGT: wbgtDay,
      maxHeatIndex: heatIndexDay,
      riskScore: Math.min(99, Math.round(75 + delta * 5)),
      grapStage: 'GRAP STAGE IV (Emergency Heat Curfew)',
      riskLevel: risk,
      projectedSurgeAdmissions: Math.round(120 + i * 15),
      shapFactors: [
        { factor: 'Solar Flux Insolation', impact: 0.38, description: 'Direct unshaded radiative load' },
        { factor: 'Dew Point Vapor Saturation', impact: 0.32, description: 'Evaporative cooling impedance' },
        { factor: 'Urban Concrete Mass Re-radiation', impact: 0.18, description: 'High night-time thermal retention' },
      ],
      hourlyStress: [
        { hour: '08:00', temp: minT + 4, wbgt: wbgtDay - 4, stressLevel: 35 },
        { hour: '11:00', temp: maxT - 2, wbgt: wbgtDay - 1, stressLevel: 75 },
        { hour: '14:00', temp: maxT, wbgt: wbgtDay, stressLevel: 98 },
        { hour: '17:00', temp: maxT - 3, wbgt: wbgtDay - 2, stressLevel: 65 },
        { hour: '20:00', temp: minT + 8, wbgt: wbgtDay - 5, stressLevel: 45 },
      ],
    };
  });
}

/**
 * Send an actionable push notification for Heatwave Emergency / Drill Mode to any active device (mobile, PC, laptop)
 */
export function dispatchHeatwaveEmergencyPushNotification({
  city,
  dryBulbTemp,
  wbgt,
  heatIndex,
  isDrill = false,
  scenario,
  onNavigateToGuidance,
}: {
  city: CityData;
  dryBulbTemp: number;
  wbgt: number;
  heatIndex: number;
  isDrill?: boolean;
  scenario?: DrillScenario;
  onNavigateToGuidance?: () => void;
}) {
  const now = Date.now();
  playNotificationChime();
  triggerHapticVibrate([150, 80, 200, 100, 250]);

  const activeScenario = scenario || DRILL_SCENARIOS[0];
  const prefix = isDrill ? '🚨 [HEATWAVE DRILL]' : '🚨 [IMD/NDMA RED ALERT]';
  const title = `${prefix} Extreme Heat Danger in ${city.name} (${dryBulbTemp}°C | WBGT ${wbgt}°C)`;
  
  const bodyText = isDrill
    ? `ISSUE: ${activeScenario.issueText}\n\nACTION REQUIRED: ${activeScenario.actionText}`
    : `ISSUE: Ambient temperature is ${dryBulbTemp}°C and Wet Bulb Globe Temp is ${wbgt}°C (Safe limit: 30°C). Severe risk of heat stroke & organ strain.\n\nACTION REQUIRED: Move to air-cooled facility immediately, hydrate with ORS/water, cease physical labor.`;

  // 1. Broadcast to In-App Push Notification Banner
  broadcastPushNotification({
    id: `heatwave-push-${now}`,
    title,
    body: bodyText,
    timestamp: now,
    severity: 'CRITICAL',
    type: 'heatwave',
    actionLabel: '📖 Open Safety Guidance',
  });

  // 2. Dispatch native OS system notification (ServiceWorker or Window Notification)
  const dispatchNative = async () => {
    if (!isNotificationSupported()) return;

    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        // sandbox restriction
      }
    }

    if (Notification.permission !== 'granted') return;

    const notificationOptions: NotificationOptions = {
      body: bodyText,
      icon: 'https://cdn-icons-png.flaticon.com/512/1684/1684375.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/1684/1684375.png',
      tag: 'heatshield-heatwave-emergency',
      requireInteraction: true,
      silent: false,
    };

    // Try service worker first for mobile and desktop support
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, notificationOptions);
          return;
        }
      } catch (swErr) {
        console.log('Service worker notification fallback to standard Notification:', swErr);
      }
    }

    try {
      const notification = new Notification(title, notificationOptions);
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (onNavigateToGuidance) {
          onNavigateToGuidance();
        }
        window.dispatchEvent(new CustomEvent('heatshield_open_safety_guidance'));
      };
    } catch (err) {
      console.warn('Native notification encountered sandbox policy, handled by in-app push banner:', err);
    }
  };

  dispatchNative();

  // 3. Dispatch window event for internal subscribers
  window.dispatchEvent(
    new CustomEvent('heatshield_heatwave_alert_triggered', {
      detail: {
        city: city.name,
        temp: dryBulbTemp,
        wbgt,
        isDrill,
      },
    })
  );
}
