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
  Calendar
} from 'lucide-react';
import { WeatherTelemetry, LanguageCode, UserRole } from '../../types';
import { CityData, INDIAN_CITIES } from '../../data/indiaCities';
import { NationalHeatRiskMap } from '../NationalHeatRiskMap';
import { RISK_STANDARDS, getRiskStandard } from '../../utils/heatRiskStandards';

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

  return (
    <div className="space-y-8 pb-12">
      
      {/* =========================================================================
          SECTION 4B: MAIN HERO SECTION
          - "Know the heat risk before it becomes dangerous."
          - "Monitor current heat conditions, health risks, and local government alerts across the country."
          - Primary actions: Check Heat Risk Near Me, View National Map
          - Subtle topographic grid pattern
          ========================================================================= */}
      <section 
        id="portal-hero-section"
        className="topo-pattern border border-[#D9E2EC] rounded-lg p-6 sm:p-10 relative overflow-hidden shadow-xs"
      >
        <div className="max-w-4xl space-y-4">
          
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white border border-[#D9E2EC] text-[#0B1F3A] text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#16804A]" />
            <span>
              {isHindi ? 'राष्ट्रीय एकीकृत ताप सुरक्षा निगरानी' : 'National Heat Surveillance Network Active'}
            </span>
            <span className="text-[#526273] font-mono">| IMD-NDMA Verified</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight leading-tight">
            {isHindi ? 'गंभीर होने से पहले ताप जोखिम को जानें।' : 'Know the heat risk before it becomes dangerous.'}
          </h1>

          <p className="text-sm sm:text-base text-[#526273] max-w-2xl leading-relaxed">
            {isHindi 
              ? 'पूरे देश में वास्तविक समय ताप स्थिति, जैव-मौसम विज्ञान स्वास्थ्य जोखिम तथा स्थानीय जिला प्रशासन के आधिकारिक अलर्ट की सटीक निगरानी करें।'
              : 'Monitor current heat conditions, biometeorological health risks, and verified local government alerts across all states and districts.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onCheckMyLocation}
              className="px-5 py-2.5 rounded bg-[#135A9C] hover:bg-[#0B1F3A] text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Compass className="w-4 h-4 text-[#F4A62A]" />
              <span>{isHindi ? 'मेरे निकट ताप जोखिम देखें' : 'Check Heat Risk Near Me'}</span>
            </button>

            <button
              onClick={() => {
                const mapEl = document.getElementById('central-national-heat-risk-section');
                if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded bg-white hover:bg-[#F5F8FB] border border-[#135A9C] text-[#135A9C] text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span>{isHindi ? 'राष्ट्रीय मानचित्र देखें' : 'View National Map'}</span>
            </button>

            <button
              onClick={onViewGuidance}
              className="px-4 py-2.5 rounded bg-transparent hover:bg-black/5 text-[#526273] text-sm font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isHindi ? 'स्वास्थ्य दिशानिर्देश' : 'Citizen Safety Guidelines'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4C: NATIONAL STATUS SUMMARY (Immediately below hero)
          - Current national risk level
          - Districts under alert: 38 districts (+7 since yesterday)
          - Cities affected: 142 cities
          - Highest forecast temperature: 45.8°C (Phalodi / Churu)
          - Population potentially exposed: 12.4 million people
          - Last data update: 12 September 2026, 10:30 AM IST
          ========================================================================= */}
      <section 
        id="national-status-summary-strip"
        aria-label="National Status Summary"
        className="gov-card p-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#D9E2EC]">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#526273]">
              {isHindi ? 'राष्ट्रीय स्थिति सारांश' : 'National Status Summary'}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A]">
              {isHindi ? 'अखिल भारतीय ताप स्थिति एवं स्वास्थ्य भार' : 'All-India Heatwave Exposure & District Preparedness'}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#526273]">
            <Clock className="w-3.5 h-3.5 text-[#135A9C]" />
            <span>Updated: <strong>12 September 2026, 10:30 AM IST</strong></span>
          </div>
        </div>

        {/* The 5 Key National Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
          
          {/* Indicator 1: Current National Risk Level */}
          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC]">
            <span className="text-[11px] text-[#526273] font-medium block">National Risk Level</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-3 h-3 rounded-sm bg-[#C7352B]" />
              <span className="text-sm sm:text-base font-bold text-[#C7352B] font-mono">
                VERY HIGH
              </span>
            </div>
            <span className="text-[10px] text-[#526273] font-mono block mt-0.5">◆ Score: 8.8 / 10</span>
          </div>

          {/* Indicator 2: Districts under alert */}
          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC]">
            <span className="text-[11px] text-[#526273] font-medium block">Districts Under Alert</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#0B1F3A]">38</span>
              <span className="text-[11px] font-mono text-[#C7352B] font-semibold">+7 since yest.</span>
            </div>
            <span className="text-[10px] text-[#526273] block mt-0.5">Orange & Red Alerts</span>
          </div>

          {/* Indicator 3: Cities affected */}
          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC]">
            <span className="text-[11px] text-[#526273] font-medium block">Cities & Urban Wards</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#0B1F3A]">142</span>
              <span className="text-[11px] text-[#526273]">cities</span>
            </div>
            <span className="text-[10px] text-[#526273] block mt-0.5">UHI microclimates mapped</span>
          </div>

          {/* Indicator 4: Highest Forecast Temp */}
          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC]">
            <span className="text-[11px] text-[#526273] font-medium block">Highest Forecast Temp</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#7A1F2B]">{highestTempData.temp}°C</span>
            </div>
            <span className="text-[10px] text-[#526273] block mt-0.5">{highestTempData.name}</span>
          </div>

          {/* Indicator 5: Exposed Population */}
          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC] col-span-2 lg:col-span-1">
            <span className="text-[11px] text-[#526273] font-medium block">Exposed Population</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#0B1F3A]">12.4M</span>
              <span className="text-[11px] text-[#526273]">citizens</span>
            </div>
            <span className="text-[10px] text-[#526273] block mt-0.5">In high-risk thermal zones</span>
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
