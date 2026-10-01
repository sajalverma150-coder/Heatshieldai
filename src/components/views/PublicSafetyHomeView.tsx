import React from 'react';
import {
  Compass,
  MapPin,
  Flame,
  AlertTriangle,
  Building2,
  Users,
  Thermometer,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HeartPulse,
  Activity,
  ArrowRight,
  ExternalLink,
  Droplets,
  Search,
  FileCheck,
  Layers,
  HelpCircle,
  PhoneCall,
  Calendar,
  Gauge,
  Wind,
  Sun,
  ThermometerSun
} from 'lucide-react';
import { WeatherTelemetry, LanguageCode, UserRole } from '../../types';
import { CityData, INDIAN_CITIES } from '../../data/indiaCities';
import { NationalHeatRiskMap } from '../NationalHeatRiskMap';
import { RISK_STANDARDS, getRiskStandard } from '../../utils/heatRiskStandards';
import { calculateWBGT } from '../../services/weatherApiService';

interface PublicSafetyHomeViewProps {
  weather: WeatherTelemetry;
  selectedCity: CityData;
  language: LanguageCode;
  onSelectCity?: (city: CityData) => void;
  onOpenCitySelector?: () => void;
  onCheckMyLocation?: () => void;
  onViewGuidance?: () => void;
  onOpenTriage?: () => void;
  onOpenSOS?: () => void;
  onTriggerSOS?: () => void;
  onNavigateTab?: (tab: any) => void;
  isAdminAuthenticated?: boolean;
  onOpenAdminAuth?: () => void;
  batchCitiesWeather?: Record<string, {
    dryBulbTemp: number;
    wbgt: number;
    humidity: number;
    heatIndex: number;
    riskLevel: any;
  }>;
}

export const PublicSafetyHomeView: React.FC<PublicSafetyHomeViewProps> = ({
  weather,
  selectedCity,
  language,
  onSelectCity = () => {},
  onOpenCitySelector = () => {},
  onCheckMyLocation = () => {},
  onViewGuidance = () => {},
  onOpenTriage = () => {},
  onOpenSOS,
  onTriggerSOS,
  onNavigateTab = (_tab?: any) => {},
  isAdminAuthenticated = false,
  onOpenAdminAuth = () => {},
  batchCitiesWeather,
}) => {
  const isHindi = language === 'hi';
  const cityRisk = getRiskStandard(weather.dryBulbTemp);
  const handleSOS = onOpenSOS || onTriggerSOS || (() => {});

  // Calculate dynamic highest recorded/forecast temperature across cities
  const highestTempData = React.useMemo(() => {
    let max = { name: 'Ahmedabad, GJ', temp: 34.9 };
    INDIAN_CITIES.forEach((c) => {
      const live = batchCitiesWeather?.[c.id];
      const t = live?.dryBulbTemp ?? c.weather.dryBulbTemp;
      if (t > max.temp) {
        max = { name: `${c.name}, ${c.state}`, temp: Number(t.toFixed(1)) };
      }
    });
    return max;
  }, [batchCitiesWeather]);

  // Dynamic Live Microclimate Telemetry for Live Readings Strip (WBGT, Heat Index/RH, Solar & UV, Wind Velocity)
  const wbgtVal = React.useMemo(() => {
    if (weather.wbgt && weather.wbgt > 0) return weather.wbgt;
    return calculateWBGT(weather.dryBulbTemp, weather.humidity, weather.windSpeed, weather.solarRadiation);
  }, [weather]);

  const wbgtStatus = React.useMemo(() => {
    if (wbgtVal < 29.0) {
      return {
        badge: isHindi ? 'सुरक्षित क्षेत्र (< 29°C)' : 'Safe Zone (< 29°C)',
        badgeClass: 'bg-[#064E3B]/70 text-[#34D399] border-[#059669]/40',
        desc: isHindi ? 'निगरानी में बाहरी श्रम के लिए सुरक्षित' : 'Safe for monitored outdoor labor',
      };
    } else if (wbgtVal < 31.0) {
      return {
        badge: isHindi ? 'सतर्कता क्षेत्र (29-31°C)' : 'Caution Zone (29-31°C)',
        badgeClass: 'bg-[#78350F]/70 text-[#FBBF24] border-[#D97706]/40',
        desc: isHindi ? 'नियमित 15 मिनट जल ब्रेक अनिवार्य' : 'Mandatory 15-min hydration breaks',
      };
    } else if (wbgtVal < 32.2) {
      return {
        badge: isHindi ? 'खतरा क्षेत्र (31-32°C)' : 'Danger Zone (31-32°C)',
        badgeClass: 'bg-[#9A3412]/70 text-[#FB923C] border-[#EA580C]/40',
        desc: isHindi ? 'कड़ा बाहरी शारीरिक श्रम सीमित करें' : 'Curtail strenuous outdoor labor',
      };
    } else {
      return {
        badge: isHindi ? 'अत्यधिक खतरा (> 32°C)' : 'Extreme Danger (> 32°C)',
        badgeClass: 'bg-[#7F1D1D]/80 text-[#F87171] border-[#DC2626]/50',
        desc: isHindi ? 'गंभीर हीटस्ट्रोक का अत्यधिक जोखिम' : 'Severe heatstroke & collapse risk',
      };
    }
  }, [wbgtVal, isHindi]);

  const rhStatus = React.useMemo(() => {
    const rh = Math.round(weather.humidity);
    let desc = isHindi ? 'वाष्पीकरणीय शीतलन अवरुद्ध होता है' : 'Suppresses evaporative cooling';
    if (rh < 50) {
      desc = isHindi ? 'शुष्क वायुमंडलीय वाष्पीकरण' : 'Enables efficient sweat evaporation';
    } else if (rh < 70) {
      desc = isHindi ? 'मध्यम सापेक्षिक आर्द्रता स्तर' : 'Elevates physiological heat index';
    }
    return {
      badge: `${rh}% ${isHindi ? 'सापेक्षिक आर्द्रता' : 'Relative Humidity'}`,
      desc,
    };
  }, [weather.humidity, isHindi]);

  const solarUvStatus = React.useMemo(() => {
    const uv = weather.uvIndex !== undefined 
      ? weather.uvIndex 
      : Math.min(12, Math.max(0, Number(((weather.solarRadiation || 148) / 100).toFixed(1))));
    
    if (uv < 3) {
      return {
        badge: `UV ${uv.toFixed(1)} (${isHindi ? 'कम' : 'Low'})`,
        badgeClass: 'bg-[#064E3B]/70 text-[#34D399] border-[#059669]/40',
        desc: isHindi ? 'न्यूनतम धूप सुरक्षा आवश्यक' : 'Minimal sun protection required',
      };
    } else if (uv < 6) {
      return {
        badge: `UV 3-5 (${isHindi ? 'मध्यम' : 'Moderate'})`,
        badgeClass: 'bg-[#78350F]/70 text-[#FBBF24] border-[#D97706]/40',
        desc: isHindi ? 'मानक धूप सुरक्षा' : 'Standard sun protection',
      };
    } else if (uv < 8) {
      return {
        badge: `UV 6-7 (${isHindi ? 'उच्च' : 'High'})`,
        badgeClass: 'bg-[#9A3412]/70 text-[#FB923C] border-[#EA580C]/40',
        desc: isHindi ? 'दोपहर में छाया में रहें' : 'Seek shade during peak hours',
      };
    } else {
      return {
        badge: `UV 8+ (${isHindi ? 'अति उच्च' : 'Very High'})`,
        badgeClass: 'bg-[#7F1D1D]/80 text-[#F87171] border-[#DC2626]/50',
        desc: isHindi ? 'सीधे सूर्य प्रकाश से बचें' : 'Avoid direct solar exposure',
      };
    }
  }, [weather.uvIndex, weather.solarRadiation, isHindi]);

  const windStatus = React.useMemo(() => {
    const ws = weather.windSpeed;
    if (ws < 5) {
      return {
        badge: isHindi ? 'स्थिर वायु (< 5 km/h)' : 'Stagnant Air (< 5 km/h)',
        badgeClass: 'bg-[#78350F]/70 text-[#FBBF24] border-[#D97706]/40',
        desc: isHindi ? 'स्थिर वायु में ऊष्मा संचय' : 'Stagnant air traps heat',
      };
    } else if (ws < 20) {
      return {
        badge: isHindi ? 'सामान्य वायु प्रवाह' : 'Normal Air Movement',
        badgeClass: 'bg-[#064E3B]/70 text-[#34D399] border-[#059669]/40',
        desc: isHindi ? 'संवातन में सहायक' : 'Assists ventilation',
      };
    } else if (ws < 35) {
      return {
        badge: isHindi ? 'मध्यम हवा' : 'Moderate Breeze',
        badgeClass: 'bg-[#0C4A6E]/70 text-[#38BDF8] border-[#0284C7]/40',
        desc: isHindi ? 'संवहनीय शीतलन में वृद्धि' : 'Enhances convective cooling',
      };
    } else {
      return {
        badge: isHindi ? 'तीव्र हवा झोंके' : 'Strong Air Currents',
        badgeClass: 'bg-[#9A3412]/70 text-[#FB923C] border-[#EA580C]/40',
        desc: isHindi ? 'गर्म हवा का तीव्र प्रवाह' : 'Active turbulent convective mixing',
      };
    }
  }, [weather.windSpeed, isHindi]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* =========================================================================
          SECTION 4B: MAIN EXECUTIVE COMMAND HERO BANNER
          - Official Government & IMD-NDMA Statutory Presence
          - High-contrast, prestigious styling
          - Quick action triggers
          ========================================================================= */}
      <section 
        id="portal-hero-section"
        className="gov-hero-command rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden border border-[#1E4373]"
      >
        {/* Ashoka Chakra Background Watermark */}
        <div 
          className="absolute -right-12 -bottom-16 w-80 h-80 opacity-[0.06] pointer-events-none select-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="currentColor">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            <path d="M12 2 L12 22 M2 12 L22 12 M5 5 L19 19 M5 19 L19 5 M7.05 2.95 L16.95 21.05 M2.95 7.05 L21.05 16.95" stroke="currentColor" strokeWidth="0.8" />
          </svg>
        </div>

        <div className="w-full space-y-4 relative z-10">
          
          {/* Statutory Verification Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#051427]/80 border border-[#2B5E9E] text-white text-xs font-semibold shadow-xs backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] live-radar-indicator" />
            <span className="text-[#E5A93C] font-mono tracking-wider font-bold">HEATSHIELD AI</span>
            <span className="text-[#94A3B8]">|</span>
            <span className="text-[#CBD5E1]">
              {isHindi ? 'राष्ट्रीय एकीकृत ताप सुरक्षा निगरानी' : 'National Heat Surveillance Network Active'}
            </span>
            <span className="hidden sm:inline text-[#60A5FA] font-mono font-medium">· IMD & NDMA Verified</span>
          </div>

          <div className="space-y-2 max-w-4xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              {isHindi 
                ? 'राष्ट्रीय ताप स्वास्थ्य एवं जैव-मौसम विज्ञान पूर्व चेतावनी प्रणाली' 
                : 'National Heat Stress & Biometeorological Early Warning System'}
            </h1>

            <p className="text-sm sm:text-base text-[#93C5FD] max-w-3xl leading-relaxed font-normal">
              {isHindi 
                ? 'पूरे देश में 800+ जिलों के लिए वास्तविक समय ताप स्थिति, वेट-बल्ब ग्लोब तापमान (WBGT), जैव-मौसम विज्ञान स्वास्थ्य जोखिम तथा स्थानीय जिला प्रशासन के आधिकारिक अलर्ट की सटीक निगरानी।'
                : 'Automated Wet-Bulb Globe Temperature (WBGT) calculations, physiological stress indices, and official district-level heat action protocols across 800+ districts nationwide.'}
            </p>
          </div>

          {/* Active Station Quick Telemetry Summary Pill */}
          <div className="inline-flex flex-wrap items-center gap-3 p-2.5 rounded-xl bg-[#061528]/80 border border-[#1A3F6D] text-xs font-mono text-[#CBD5E1] backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span>{selectedCity.name}, {selectedCity.state}</span>
            </div>
            <span className="text-[#64748B]">·</span>
            <div className="text-[#E5A93C] font-bold">
              Air: {weather.dryBulbTemp}°C
            </div>
            <span className="text-[#64748B]">·</span>
            <div className="text-white">
              WBGT: <strong className="text-[#38BDF8]">{weather.wbgt}°C</strong>
            </div>
            <span className="text-[#64748B]">·</span>
            <div className="text-[#94A3B8]">
              Humidity: {weather.relativeHumidity}%
            </div>
            <button
              onClick={onOpenCitySelector}
              className="ml-auto text-[11px] text-[#38BDF8] hover:text-white underline cursor-pointer"
            >
              {isHindi ? 'स्टेशन बदलें' : 'Switch Station'}
            </button>
          </div>

          {/* Action Triggers */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onCheckMyLocation}
              className="px-5 py-2.5 rounded-lg bg-[#E5A93C] hover:bg-[#D99B26] text-[#07162C] text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4 text-[#07162C]" />
              <span>{isHindi ? 'मेरे निकट ताप जोखिम देखें' : 'Check Heat Risk Near Me'}</span>
            </button>

            <button
              onClick={() => {
                const mapEl = document.getElementById('central-national-heat-risk-section');
                if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-lg bg-[#0E2C52] hover:bg-[#133A6B] border border-[#2B5E9E] text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Layers className="w-4 h-4 text-[#38BDF8]" />
              <span>{isHindi ? 'राष्ट्रीय GIS मानचित्र' : 'Interactive GIS Map'}</span>
            </button>

            <button
              onClick={onOpenTriage}
              className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors backdrop-blur-xs"
            >
              <HeartPulse className="w-4 h-4 text-[#F43F5E]" />
              <span>{isHindi ? 'स्वास्थ्य डॉसियर' : 'Clinical Health Dossier'}</span>
            </button>

            <button
              onClick={onViewGuidance}
              className="px-4 py-2.5 rounded-lg text-[#CBD5E1] hover:text-white text-sm font-medium flex items-center gap-1.5 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span>{isHindi ? 'स्वास्थ्य दिशानिर्देश' : 'Statutory Health Protocols'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4C: LIVE MICROCLIMATE TELEMETRY READINGS
          Real-time sensor & satellite readings: WBGT Heat Stress, Heat Index / RH,
          Solar & UV Load, Wind Velocity
          ========================================================================= */}
      <section 
        id="live-telemetry-readings-strip"
        aria-label="Live Meteorological Telemetry"
        className="space-y-2.5"
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0284C7]"></span>
            </span>
            <span className="text-xs font-mono font-semibold tracking-wide uppercase text-[#526273]">
              {isHindi ? 'लाइव मौसम टेलीमेट्री' : 'Live Microclimate Telemetry'} • <strong className="text-[#0B1F3A]">{selectedCity.name}, {selectedCity.state}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#627D98]">
            <Clock className="w-3.5 h-3.5 text-[#135A9C]" />
            <span>{weather.lastUpdated || 'Live IMD / Satellite Telemetry'}</span>
          </div>
        </div>

        {/* 4 Telemetry Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: WBGT Heat Stress */}
          <div className="bg-[#081325] border border-[#0284C7] ring-1 ring-[#0284C7]/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(2,132,199,0.12)] transition-all hover:shadow-[0_6px_24px_rgba(2,132,199,0.2)]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] font-medium text-[#8BAAC9] tracking-wide">
                {isHindi ? 'डब्ल्यूबीजीटी ताप तनाव' : 'WBGT Heat Stress'}
              </span>
              <div className="w-6 h-6 rounded-full bg-[#0284C7]/20 border border-[#0284C7]/30 flex items-center justify-center text-[#38BDF8]">
                <Gauge className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-3 flex items-baseline">
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                {wbgtVal.toFixed(1)}
              </span>
              <span className="text-sm sm:text-base font-normal text-[#8BAAC9] ml-1 font-mono">
                °C
              </span>
            </div>

            <div className="flex items-end justify-between gap-2 pt-1 border-t border-[#172D4D]/60 mt-auto">
              <div className="min-w-0 flex-1">
                <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md inline-flex items-center border ${wbgtStatus.badgeClass}`}>
                  {wbgtStatus.badge}
                </span>
                <p className="text-[11px] text-[#7F9EB8] mt-1.5 leading-snug line-clamp-2">
                  {wbgtStatus.desc}
                </p>
              </div>
              <div className="shrink-0 pl-1">
                <svg viewBox="0 0 100 40" className="w-20 sm:w-24 h-9 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="wbgt-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284C7" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 35 Q 25 35, 45 14 Q 55 6, 65 14 Q 85 32, 100 35 L 100 40 L 0 40 Z" fill="url(#wbgt-grad)" />
                  <path d="M 0 35 Q 25 35, 45 14 Q 55 6, 65 14 Q 85 32, 100 35" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="55" cy="8" r="2.5" fill="#38BDF8" className="animate-pulse" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Heat Index / RH */}
          <div className="bg-[#081325] border border-[#172D4D] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all hover:border-[#1E3E6B]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] font-medium text-[#8BAAC9] tracking-wide">
                {isHindi ? 'हीट इंडेक्स / आर्द्रता' : 'Heat Index / RH'}
              </span>
              <div className="w-6 h-6 rounded-full bg-[#0284C7]/20 border border-[#0284C7]/30 flex items-center justify-center text-[#38BDF8]">
                <Droplets className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-3 flex items-baseline">
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                {weather.heatIndex.toFixed(1)}
              </span>
              <span className="text-sm sm:text-base font-normal text-[#8BAAC9] ml-1 font-mono">
                °C
              </span>
            </div>

            <div className="flex items-end justify-between gap-2 pt-1 border-t border-[#172D4D]/60 mt-auto">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md inline-flex items-center border bg-[#0C4A6E]/70 text-[#38BDF8] border-[#0284C7]/40">
                  {rhStatus.badge}
                </span>
                <p className="text-[11px] text-[#7F9EB8] mt-1.5 leading-snug line-clamp-2">
                  {rhStatus.desc}
                </p>
              </div>
              <div className="shrink-0 pl-1">
                <svg viewBox="0 0 100 40" className="w-20 sm:w-24 h-9 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="rh-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 36 Q 20 36, 40 28 Q 60 10, 75 16 Q 90 28, 100 34 L 100 40 L 0 40 Z" fill="url(#rh-grad)" />
                  <path d="M 0 36 Q 20 36, 40 28 Q 60 10, 75 16 Q 90 28, 100 34" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="68" cy="12" r="2.5" fill="#38BDF8" className="animate-pulse" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Solar & UV Load */}
          <div className="bg-[#081325] border border-[#172D4D] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all hover:border-[#1E3E6B]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] font-medium text-[#8BAAC9] tracking-wide">
                {isHindi ? 'सौर एवं यूवी लोड' : 'Solar & UV Load'}
              </span>
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sun className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-3 flex items-baseline">
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                {Math.round(weather.solarRadiation || 148)}
              </span>
              <span className="text-sm sm:text-base font-normal text-[#8BAAC9] ml-1 font-mono">
                W/m²
              </span>
            </div>

            <div className="flex items-end justify-between gap-2 pt-1 border-t border-[#172D4D]/60 mt-auto">
              <div className="min-w-0 flex-1">
                <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md inline-flex items-center border ${solarUvStatus.badgeClass}`}>
                  {solarUvStatus.badge}
                </span>
                <p className="text-[11px] text-[#7F9EB8] mt-1.5 leading-snug line-clamp-2">
                  {solarUvStatus.desc}
                </p>
              </div>
              <div className="shrink-0 pl-1">
                <svg viewBox="0 0 100 40" className="w-20 sm:w-24 h-9 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="solar-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 38 Q 30 38, 50 24 Q 65 12, 100 12 L 100 40 L 0 40 Z" fill="url(#solar-grad)" />
                  <path d="M 0 38 Q 30 38, 50 24 Q 65 12, 100 12" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="95" cy="12" r="2.5" fill="#FBBF24" className="animate-pulse" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 4: Wind Velocity */}
          <div className="bg-[#081325] border border-[#172D4D] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all hover:border-[#1E3E6B]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-[13px] font-medium text-[#8BAAC9] tracking-wide">
                {isHindi ? 'वायु वेग' : 'Wind Velocity'}
              </span>
              <div className="w-6 h-6 rounded-full bg-[#0284C7]/20 border border-[#0284C7]/30 flex items-center justify-center text-[#38BDF8]">
                <Wind className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-3 flex items-baseline">
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                {weather.windSpeed.toFixed(1)}
              </span>
              <span className="text-sm sm:text-base font-normal text-[#8BAAC9] ml-1 font-mono">
                km/h
              </span>
            </div>

            <div className="flex items-end justify-between gap-2 pt-1 border-t border-[#172D4D]/60 mt-auto">
              <div className="min-w-0 flex-1">
                <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md inline-flex items-center border ${windStatus.badgeClass}`}>
                  {windStatus.badge}
                </span>
                <p className="text-[11px] text-[#7F9EB8] mt-1.5 leading-snug line-clamp-2">
                  {windStatus.desc}
                </p>
              </div>
              <div className="shrink-0 pl-1">
                <svg viewBox="0 0 100 40" className="w-20 sm:w-24 h-9 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="wind-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284C7" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 26 Q 20 18, 40 26 Q 60 34, 80 22 Q 90 18, 100 24 L 100 40 L 0 40 Z" fill="url(#wind-grad)" />
                  <path d="M 0 26 Q 20 18, 40 26 Q 60 34, 80 22 Q 90 18, 100 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="80" cy="22" r="2.5" fill="#38BDF8" className="animate-pulse" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4D: CENTRAL INTERACTIVE HEAT RISK MAP & RANKED LIST
          ========================================================================= */}
      <NationalHeatRiskMap
        language={language}
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
        onCheckMyLocation={onCheckMyLocation}
        onViewGuidance={onViewGuidance}
        onOpenTriage={onOpenTriage}
        batchCitiesWeather={batchCitiesWeather}
      />

      {/* =========================================================================
          SECTION 4F: ACTIONABLE HEALTH GUIDANCE SUMMARY
          - "If the risk is high"
          - "Seek urgent medical help if there is:"
          - High risk groups
          - Fast Hydration Action
          ========================================================================= */}
      <section 
        id="health-guidance-summary-card"
        className="gov-card p-6 border-l-4 border-l-[#E87500]"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#D9E2EC]">
          <div>
            <span className="text-[11px] font-mono uppercase text-[#E87500] font-bold tracking-wider">
              {isHindi ? 'राष्ट्रीय स्वास्थ्य प्रोटोकॉल' : 'Official Health Directives'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#0B1F3A]">
              {isHindi ? 'यदि ताप जोखिम उच्च अथवा बहुत उच्च है तो क्या करें' : 'Actions Required: When Heat Risk is High or Very High'}
            </h2>
          </div>

          <button
            onClick={onViewGuidance}
            className="text-xs font-semibold text-[#135A9C] hover:underline flex items-center gap-1 self-start md:self-auto cursor-pointer"
          >
            <span>{isHindi ? 'विस्तृत राष्ट्रीय स्वास्थ्य दिशानिर्देश' : 'View Complete Clinical Guidelines'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 text-xs">
          
          {/* Card 1: Preventive Measures */}
          <div className="space-y-2 p-3.5 rounded bg-[#F5F8FB] border border-[#D9E2EC]">
            <div className="flex items-center gap-2 text-[#0B1F3A] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#16804A]" />
              <span>{isHindi ? 'अनिवार्य सुरक्षा उपाय' : 'Mandatory Protective Steps'}</span>
            </div>
            <ul className="space-y-1.5 text-[#526273] list-disc list-inside">
              <li>{isHindi ? 'दोपहर 12:00 से 4:00 बजे तक सीधी धूप में न जाएं' : 'Cease non-essential outdoor travel from 12:00 to 16:00 IST'}</li>
              <li>{isHindi ? 'प्रत्येक 20-30 मिनट में पानी या ओआरएस अवश्य पिएं' : 'Hydrate every 20-30 minutes with drinking water or ORS'}</li>
              <li>{isHindi ? 'हल्के, ढीले एवं सूती कपड़े पहनें; सिर को ढक कर रखें' : 'Wear loose, light-colored cotton clothing and cover head'}</li>
              <li>{isHindi ? 'शारीरिक श्रम करने वाले श्रमिक अनिवार्य विराम लें' : 'Outdoor workers must take mandatory shaded breaks every 45 mins'}</li>
            </ul>
          </div>

          {/* Card 2: Danger Signs & Emergency Symptoms */}
          <div className="space-y-2 p-3.5 rounded bg-[#FFF4E6] border border-[#E87500]/40">
            <div className="flex items-center gap-2 text-[#9C4E00] font-bold">
              <AlertTriangle className="w-4 h-4 text-[#C7352B]" />
              <span>{isHindi ? 'तत्काल चिकित्सा सहायता लें यदि:' : 'Seek Urgent Medical Help If:'}</span>
            </div>
            <ul className="space-y-1.5 text-[#9C4E00] list-disc list-inside font-medium">
              <li>{isHindi ? 'शरीर का तापमान 104°F (40°C) से अधिक हो' : 'Body temperature rises above 104°F (40°C)'}</li>
              <li>{isHindi ? 'पसीना आना बंद हो जाए और त्वचा गर्म व सूखी हो' : 'Absence of sweating with hot, dry, flushed skin'}</li>
              <li>{isHindi ? 'चक्कर आना, भ्रम, बोलने में असमर्थता या बेहोशी' : 'Confusion, slurred speech, delirium, or fainting'}</li>
              <li>{isHindi ? 'लगातार उल्टी या अत्यधिक कमजोरी' : 'Persistent nausea, vomiting, or muscle seizures'}</li>
            </ul>
          </div>

          {/* Card 3: Vulnerable Groups & Direct Emergency Contact */}
          <div className="space-y-2 p-3.5 rounded bg-[#F5F8FB] border border-[#D9E2EC]">
            <div className="flex items-center gap-2 text-[#0B1F3A] font-bold">
              <Users className="w-4 h-4 text-[#135A9C]" />
              <span>{isHindi ? 'संवेदनशील समूह सुरक्षा' : 'Vulnerable Demographics'}</span>
            </div>
            <p className="text-[#526273] leading-relaxed">
              {isHindi 
                ? 'वरिष्ठ नागरिक (65+ वर्ष), 5 वर्ष से कम आयु के बच्चे, गर्भवती महिलाएं, तथा हृदय/गुर्दे के रोगी विशेष निगरानी में रहें।' 
                : 'Priority surveillance for elders (65+), infants, outdoor laborers, and citizens with hypertension, cardiovascular, or renal conditions.'}
            </p>
            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={handleSOS}
                className="px-3 py-1.5 rounded bg-[#C7352B] hover:bg-[#A82B23] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Dial 108 Ambulance</span>
              </button>
              <button
                onClick={onOpenTriage}
                className="px-2.5 py-1.5 rounded border border-[#135A9C] text-[#135A9C] font-semibold text-xs hover:bg-[#F5F8FB] cursor-pointer"
              >
                Check Symptoms
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4E: AI TRANSPARENCY & SCIENTIFIC INTELLIGENCE
          - "How the system works" (Step 1 to 6)
          - Clear distinction:
            - Automated model output
            - Officially verified warnings
            - Forecast confidence: 87%
            - Historical data & Real-time observations
            - Human review timestamp
          ========================================================================= */}
      <section 
        id="ai-transparency-section"
        className="gov-card p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#D9E2EC]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#135A9C] text-white font-bold">
                SCIENTIFIC AUDIT
              </span>
              <span className="text-xs text-[#16804A] font-semibold flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified IMD Telemetry
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0B1F3A] mt-1">
              {isHindi ? 'प्रणाली कार्यप्रणाली एवं एआई पारदर्शिता' : 'How the System Works: AI Pipeline & Scientific Verification'}
            </h2>
            <p className="text-xs text-[#526273] mt-0.5">
              {isHindi 
                ? 'कृत्रिम बुद्धिमत्ता (AI) निर्णय-समर्थन प्रणाली है, यह आधिकारिक मौसम विज्ञानियों के सत्यापन के साथ कार्य करती है।' 
                : 'HeatShield AI serves as an operational decision-support tool, operating with strict biometeorological modeling and human meteorologist oversight.'}
            </p>
          </div>

          <div className="bg-[#F5F8FB] p-2 rounded border border-[#D9E2EC] text-xs font-mono shrink-0">
            <div>Confidence Index: <strong className="text-[#16804A]">87.4% (High Ensemble Agreement)</strong></div>
            <div className="text-[#526273]">Human Review: <strong>12 Sep 2026, 09:45 IST by NWFC Duty Officer</strong></div>
          </div>
        </div>

        {/* 6 Step Institutional Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 text-xs">
          
          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#135A9C]">STEP 01</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-[#526273] border">Real-time</span>
            </div>
            <h4 className="font-bold text-[#0B1F3A]">Multi-Source Telemetry Ingestion</h4>
            <p className="text-[#526273]">
              Continuous ingestion from 850+ IMD Automatic Weather Stations (AWS), INSAT-3D thermal infrared bands, and ERA5 atmospheric reanalysis.
            </p>
          </div>

          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#135A9C]">STEP 02</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-[#526273] border">Biometeorology</span>
            </div>
            <h4 className="font-bold text-[#0B1F3A]">Biometeorological Physics Engine</h4>
            <p className="text-[#526273]">
              Calculates Wet Bulb Globe Temperature (WBGT ISO 7243), Universal Thermal Climate Index (UTCI), and human evaporative sweat loss rate.
            </p>
          </div>

          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#135A9C]">STEP 03</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-[#526273] border">AI Downscaling</span>
            </div>
            <h4 className="font-bold text-[#0B1F3A]">Urban Heat Island (UHI) AI Downscaling</h4>
            <p className="text-[#526273]">
              Machine learning algorithms downscale regional predictions to 100-meter urban grids using built surface albedo, NDVI vegetation, and street canyon geometry.
            </p>
          </div>

          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#135A9C]">STEP 04</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-[#526273] border">Epidemiology</span>
            </div>
            <h4 className="font-bold text-[#0B1F3A]">Health Vulnerability & Hospital Surge</h4>
            <p className="text-[#526273]">
              Combines thermal stress with district demographic vulnerability indices (elderly population, informal housing, outdoor labor density) to predict ICU bed demand.
            </p>
          </div>

          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#16804A]">STEP 05</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EAF6EE] text-[#16804A] font-bold border border-[#16804A]/40">Human-In-The-Loop</span>
            </div>
            <h4 className="font-bold text-[#0B1F3A]">Meteorological Duty Officer Verification</h4>
            <p className="text-[#526273]">
              Automated AI alerts above Level 3 (Severe Warning) undergo mandatory review by IMD National Weather Forecasting Centre meteorologists before state gazetting.
            </p>
          </div>

          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#135A9C]">STEP 06</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-[#526273] border">Dissemination</span>
            </div>
            <h4 className="font-bold text-[#0B1F3A]">Multi-Channel Public Safety Broadcast</h4>
            <p className="text-[#526273]">
              Disseminates warnings across NDMA Common Alerting Protocol (CAP), automated multilingual voice OBD calls to outdoor workers, and municipal digital signages.
            </p>
          </div>

        </div>

        {/* Data Provenance & Distinction Footer */}
        <div className="mt-4 p-3 bg-[#F5F8FB] rounded border border-[#D9E2EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-[#526273]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-[#0B1F3A]">Data Layers Distinction:</span>
            <span>🟢 Real-time Observations (IMD AWS)</span>
            <span>🟡 Verified Forecasts (Ensemble WRF)</span>
            <span>🔵 AI Microclimate Estimates</span>
          </div>

          <button
            onClick={() => onNavigateTab('reports-data')}
            className="text-[#135A9C] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Download Methodology Whitepaper</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

      </section>

      {/* =========================================================================
          SECTION 5: OFFICIALS & DISTRICT AUTHORITIES CALLOUT
          ========================================================================= */}
      <section 
        id="district-official-callout"
        className="bg-[#0B1F3A] text-white rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-[#135A9C] px-2 py-0.5 rounded text-white font-bold">
              GOVERNMENT OPERATIONAL LAYER
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            {isHindi ? 'जिला प्रशासन एवं अस्पताल प्रबंधन पोर्टल' : 'District Heat Action Plan (HAP) & Hospital Operations'}
          </h3>
          <p className="text-xs text-[#D9E2EC] max-w-2xl">
            {isHindi 
              ? 'अधिकृत जिला कलेक्टर, स्वास्थ्य अधिकारी एवं नगर निगम अभियंता वार्ड-स्तरीय जल टैंकर, अस्पताल बिस्तर क्षमता तथा कार्यस्थल अनुपालन का प्रबंधन करें।' 
              : 'Authorized District Magistrates, Chief Medical Officers, and Municipal Engineers can access real-time hospital bed surge, water tanker GPS routing, and worker protection compliance.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('district-dashboard')}
            className="px-4 py-2 rounded bg-[#135A9C] hover:bg-[#0f487d] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5 text-[#F4A62A]" />
            <span>{isHindi ? 'जिला डैशबोर्ड खोलें' : 'District Operations Dashboard'}</span>
          </button>

          {!isAdminAuthenticated && (
            <button
              onClick={onOpenAdminAuth}
              className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 border border-[#D9E2EC]/30 text-white text-xs font-semibold cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </section>

    </div>
  );
};
