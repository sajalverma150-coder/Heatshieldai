import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  X, 
  Radio, 
  Pause, 
  Play,
  FileText
} from 'lucide-react';
import { CityData, INDIAN_CITIES } from '../data/indiaCities';
import { WeatherTelemetry, LanguageCode } from '../types';
import { CityLiveSummary } from '../services/weatherApiService';

export interface CityHeadline {
  cityId: string;
  cityName: string;
  state: string;
  temp: number;
  heatIndex: number;
  wbgt?: number;
  severity: 'EXTREME' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  grapStage: string;
  headline: string;
  updateTime: string;
}

interface RollingHeadlinesTickerProps {
  selectedCity?: CityData;
  cities?: CityData[];
  onSelectCity: (city: CityData) => void;
  onOpenReport?: () => void;
  onOpenHealthReport?: () => void;
  onOpenPushSettings?: () => void;
  weather?: WeatherTelemetry;
  dataSourceMode?: 'live_api' | 'imd_heatwave';
  citiesLiveWeather?: Record<string, CityLiveSummary>;
  language?: LanguageCode;
}

export const RollingHeadlinesTicker: React.FC<RollingHeadlinesTickerProps> = ({
  selectedCity,
  cities = INDIAN_CITIES,
  onSelectCity,
  onOpenHealthReport,
  weather,
  dataSourceMode = 'live_api',
  citiesLiveWeather,
  language = 'en',
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const isHindi = language === 'hi';

  // Dynamic headlines list: truthful live telemetry + upcoming forecast advisories
  const activeHeadlines = useMemo(() => {
    const list: CityHeadline[] = [];
    const activeCurrentWeather = weather || selectedCity?.weather;
    const now = new Date();
    const timeStr = now.toLocaleTimeString(isHindi ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' });

    // Item 1: Selected / Current Station live condition & prospective forecast
    if (selectedCity && activeCurrentWeather) {
      const isHigh = activeCurrentWeather.dryBulbTemp >= 40 || activeCurrentWeather.wbgt >= 31;
      list.push({
        cityId: selectedCity.id,
        cityName: isHindi ? `${selectedCity.name} (सक्रिय केंद्र)` : `${selectedCity.name} (Active Station)`,
        state: selectedCity.state,
        temp: activeCurrentWeather.dryBulbTemp,
        heatIndex: activeCurrentWeather.heatIndex,
        wbgt: activeCurrentWeather.wbgt,
        severity: (activeCurrentWeather.riskLevel as any) || 'MODERATE',
        grapStage: activeCurrentWeather.grapStage,
        headline: isHigh
          ? (isHindi 
              ? `लाइव टेलीमेट्री: ${activeCurrentWeather.dryBulbTemp}°C • WBGT: ${activeCurrentWeather.wbgt}°C • अग्रिम चेतावनी: आगामी 12:00-16:00 IST में अत्यधिक सौर ताप की संभावना।`
              : `Live Telemetry: ${activeCurrentWeather.dryBulbTemp}°C • WBGT: ${activeCurrentWeather.wbgt}°C • Forecast Advisory: Peak solar vulnerability expected 12:00–16:00 IST.`)
          : (isHindi 
              ? `लाइव टेलीमेट्री: ${activeCurrentWeather.dryBulbTemp}°C • WBGT: ${activeCurrentWeather.wbgt}°C • आर्द्रता: ${activeCurrentWeather.humidity}% • सामान्य सुरक्षा दिशानिर्देश सक्रिय।`
              : `Live Telemetry: ${activeCurrentWeather.dryBulbTemp}°C • WBGT: ${activeCurrentWeather.wbgt}°C • Humidity: ${activeCurrentWeather.humidity}% • Standard biometeorological watch active.`),
        updateTime: `Live • ${timeStr} IST`,
      });
    }

    // Inspect cities and generate forward-looking truthful entries
    const sampleCities = ['delhi', 'nagpur', 'ahmedabad', 'phalodi', 'patna', 'chennai', 'hyderabad'];
    
    sampleCities.forEach((cityKey) => {
      if (selectedCity && selectedCity.id === cityKey) return;

      const matchedCity = cities.find(c => c.id === cityKey);
      if (!matchedCity) return;

      const live = citiesLiveWeather?.[cityKey];
      const temp = live ? live.dryBulbTemp : matchedCity.weather.dryBulbTemp;
      const wbgt = live ? live.wbgt : matchedCity.weather.wbgt;
      const heatIndex = live ? live.heatIndex : (matchedCity.weather.heatIndex ?? temp + 3);
      const riskLevel = live ? live.riskLevel : matchedCity.weather.riskLevel;

      let forecastText = '';
      if (temp >= 42 || wbgt >= 32) {
        forecastText = isHindi 
          ? `चेतावनी: तापमान ${temp}°C (WBGT ${wbgt}°C) • आगामी 24 घंटे में तीव्र ताप लहर की संभावना।`
          : `Forecast Alert: ${matchedCity.name} at ${temp}°C (WBGT ${wbgt}°C) • Elevated heat stress forecast for the next 24-48h window.`;
      } else if (temp >= 38 || wbgt >= 29) {
        forecastText = isHindi 
          ? `मौसम अवलोकन: तापमान ${temp}°C • दोपहर में सौर ताप वृद्धि का पूर्वानुमान • हाइड्रेशन अलर्ट सक्रिय।`
          : `Thermal Outlook: ${matchedCity.name} at ${temp}°C • Afternoon heat index surge expected • Hydration watch active.`;
      } else {
        forecastText = isHindi 
          ? `मौसम स्थिति: ${matchedCity.name} पर तापमान ${temp}°C • सामान्य बायो-क्लाइमेट स्थितियां प्रचलित।`
          : `Station Status: ${matchedCity.name} at ${temp}°C (WBGT ${wbgt}°C) • Normal biometeorological conditions prevailing.`;
      }

      list.push({
        cityId: matchedCity.id,
        cityName: matchedCity.name,
        state: matchedCity.state,
        temp,
        heatIndex,
        wbgt,
        severity: (riskLevel as any) || 'MODERATE',
        grapStage: matchedCity.weather.grapStage || 'STAGE I ADVISORY',
        headline: forecastText,
        updateTime: `Telemetry • ${timeStr} IST`,
      });
    });

    return list;
  }, [selectedCity, weather, citiesLiveWeather, cities, isHindi]);

  // Auto-advance through alerts gently every 8 seconds
  useEffect(() => {
    if (!isAutoPlay || isDismissed) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeHeadlines.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlay, isDismissed, activeHeadlines.length]);

  if (isDismissed || activeHeadlines.length === 0) return null;

  const currentItem = activeHeadlines[currentIndex] || activeHeadlines[0];

  const handleCityClick = () => {
    const found = (cities || INDIAN_CITIES).find(
      (c) => c.id.toLowerCase() === currentItem.cityId.toLowerCase() || 
             c.name.toLowerCase().includes(currentItem.cityName.toLowerCase().split(' ')[0])
    );
    if (found) {
      onSelectCity(found);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeHeadlines.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeHeadlines.length) % activeHeadlines.length);
  };

  const isCurrentActiveCity = selectedCity && currentItem.cityId === selectedCity.id;

  return (
    <aside 
      id="permanent-rolling-headlines-ticker"
      aria-label="National Heatwave Alerts Banner"
      className="bg-[#061427] border-b border-[#153457] px-3 sm:px-6 py-2 text-xs select-none text-[#CBD5E1] shadow-xs"
    >
      <div className="w-full flex items-center justify-between gap-3">
        
        {/* Left: Indicator Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border shadow-xs ${
            currentItem.severity === 'severe'
              ? 'bg-[#450A0A] border-[#EF4444] text-[#FCA5A5]'
              : currentItem.severity === 'high'
              ? 'bg-[#451A03] border-[#F97316] text-[#FDBA74]'
              : 'bg-[#052E16] border-[#22C55E] text-[#86EFAC]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
            <span>
              {currentItem.severity === 'severe' 
                ? (isHindi ? '🚨 आपातकाल' : '🚨 RED ALERT') 
                : currentItem.severity === 'high' 
                ? (isHindi ? '⚠️ चेतावनी' : '⚠️ ORANGE ALERT') 
                : (isHindi ? '📢 बुलेटिन' : '📢 IMD BULLETIN')}
            </span>
          </div>
          <span className="text-[#64748B] hidden sm:inline text-[10px] font-mono">
            {currentIndex + 1}/{activeHeadlines.length}
          </span>
        </div>

        {/* Center: Current Headline (Clickable) */}
        <div 
          onClick={handleCityClick}
          className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer group justify-start text-left overflow-hidden"
          title={isHindi ? `${currentItem.cityName} पर स्विच करने हेतु क्लिक करें` : `Click to switch to ${currentItem.cityName}`}
        >
          <span className="text-white font-semibold text-xs group-hover:text-[#E5A93C] transition-colors shrink-0">
            <span className="sm:hidden">{currentItem.cityName.split(' ')[0]}</span>
            <span className="hidden sm:inline">{currentItem.cityName}</span>
            <span className="ml-1 text-[#F59E0B] font-mono font-bold">({currentItem.temp}°C)</span>
          </span>
          <span className="text-[#94A3B8] text-xs truncate max-w-2xl group-hover:text-white transition-colors">
            — {currentItem.headline}
          </span>
        </div>

        {/* Right: Controls & Dismiss */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handlePrev}
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#0E2A4F] transition-colors cursor-pointer"
            title={isHindi ? 'पिछली चेतावनी' : 'Previous alert'}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#0E2A4F] transition-colors cursor-pointer"
            title={isAutoPlay ? (isHindi ? 'रोकें' : 'Pause') : (isHindi ? 'चलाएं' : 'Play')}
          >
            {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-[#E5A93C]" />}
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#0E2A4F] transition-colors cursor-pointer"
            title={isHindi ? 'अगली चेतावनी' : 'Next alert'}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#0E2A4F] transition-colors ml-0.5 cursor-pointer"
            title={isHindi ? 'बैनर बंद करें' : 'Dismiss banner'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
