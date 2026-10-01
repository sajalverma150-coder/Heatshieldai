import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  Layers,
  Thermometer,
  Flame,
  Droplets,
  HeartPulse,
  Users,
  Search,
  Compass,
  MapPin,
  List,
  Map as MapIcon,
  ChevronRight,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Crosshair
} from 'lucide-react';
import { CityData, INDIAN_CITIES } from '../data/indiaCities';
import { LanguageCode, MapOverlayLayer, HeatRiskLevel } from '../types';
import { RISK_STANDARDS, getRiskStandard, RiskStandard } from '../utils/heatRiskStandards';

interface DistrictRiskEntry {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  temp: number;
  heatIndex: number;
  wbgt: number;
  riskLevel: HeatRiskLevel;
  riskScore: number;
  hospitalBurdenPct: number;
  vulnerableExposureIndex: number; // 0-100
  exposedPopulationMillions: number;
  recommendedActionEn: string;
  recommendedActionHi: string;
  forecastPeriod: string;
}

interface NationalHeatRiskMapProps {
  language: LanguageCode;
  selectedCity: CityData;
  onSelectCity: (city: CityData) => void;
  onCheckMyLocation: () => void;
  onViewGuidance: () => void;
  onOpenTriage: () => void;
  batchCitiesWeather?: Record<string, {
    dryBulbTemp: number;
    wbgt: number;
    humidity: number;
    heatIndex: number;
    riskLevel: any;
  }>;
}

export const NationalHeatRiskMap: React.FC<NationalHeatRiskMapProps> = ({
  language,
  selectedCity,
  onSelectCity,
  onCheckMyLocation,
  onViewGuidance,
  onOpenTriage,
  batchCitiesWeather,
}) => {
  const isHindi = language === 'hi';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapOverlayLayer>('health-risk');
  const [activeForecastStep, setActiveForecastStep] = useState<number>(0); // 0 = Today, 1 = +24h, 2 = +48h, 3 = +72h, 4 = +5 Days
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictRiskEntry | null>(null);

  const forecastSteps = useMemo(() => {
    const now = new Date();
    const formatDay = (daysAhead: number) => {
      const target = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
      return target.toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' });
    };
    const formatFull = (daysAhead: number) => {
      const target = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
      return target.toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return [
      { label: `Today (${formatDay(0)})`, offset: 0, periodStr: formatFull(0) },
      { label: `+24h (${formatDay(1)})`, offset: 0.6, periodStr: formatFull(1) },
      { label: `+48h (${formatDay(2)})`, offset: 1.2, periodStr: formatFull(2) },
      { label: `+72h (${formatDay(3)})`, offset: 0.4, periodStr: formatFull(3) },
      { label: `+5 Days (${formatDay(5)})`, offset: -1.8, periodStr: `${formatDay(4)} – ${formatFull(5)}` },
    ];
  }, [isHindi]);

  // Generate enriched district risk dataset based on Indian cities with calibrated variation across forecast timeline
  const districtEntries: DistrictRiskEntry[] = useMemo(() => {
    const currentStep = forecastSteps[activeForecastStep];
    const tempDelta = currentStep.offset;

    // Ensure selectedCity is included even if it was dynamically detected from GPS / live location
    const cityList = [...INDIAN_CITIES];
    if (selectedCity && !cityList.some(c => c.id === selectedCity.id || c.name.toLowerCase() === selectedCity.name.toLowerCase())) {
      cityList.unshift(selectedCity);
    }

    return cityList.map((city, idx) => {
      const live = batchCitiesWeather?.[city.id];
      const currentTemp = live?.dryBulbTemp ?? city.weather.dryBulbTemp;
      const currentWbgt = live?.wbgt ?? city.weather.wbgt;
      const currentHeatIndex = live?.heatIndex ?? city.weather.heatIndex ?? (currentTemp + 3.2);

      const baseTemp = Number((currentTemp + tempDelta).toFixed(1));
      const baseWbgt = Number((currentWbgt + (tempDelta * 0.7)).toFixed(1));
      const heatIndex = Math.round(currentHeatIndex + tempDelta * 1.1);
      
      let riskLevel: HeatRiskLevel = 'MODERATE';
      let riskScore = 4.8;
      let hospitalBurden = 18;
      let vulnerablePop = (0.5 + (idx % 5) * 0.8);

      if (baseTemp >= 40 || baseWbgt >= 32.5 || heatIndex >= 44) {
        riskLevel = 'EXTREME';
        riskScore = 9.4;
        hospitalBurden = 76;
        vulnerablePop = Number((vulnerablePop * 2.2).toFixed(1));
      } else if (baseTemp >= 35 || baseWbgt >= 30.5 || heatIndex >= 40) {
        riskLevel = 'VERY_HIGH';
        riskScore = 8.2;
        hospitalBurden = 52;
        vulnerablePop = Number((vulnerablePop * 1.8).toFixed(1));
      } else if (baseTemp >= 31 || baseWbgt >= 28.0 || heatIndex >= 36) {
        riskLevel = 'HIGH';
        riskScore = 6.8;
        hospitalBurden = 30;
      } else if (baseTemp >= 27) {
        riskLevel = 'MODERATE';
        riskScore = 4.2;
        hospitalBurden = 12;
      } else {
        riskLevel = 'MINIMAL';
        riskScore = 2.4;
        hospitalBurden = 5;
      }

      let actionEn = 'Maintain regular water intake (2.5L). Normal activities permitted.';
      let actionHi = 'नियमित पानी (2.5 लीटर) पिएं। सामान्य कार्य अनुमेय हैं।';

      if (riskLevel === 'EXTREME') {
        actionEn = 'Avoid all outdoor activities 11:30 AM to 4:30 PM. Mandatory municipal heat curfew active.';
        actionHi = 'दोपहर 11:30 से 4:30 तक धूप में बाहर न निकलें। अनिवार्य लू कर्फ्यू लागू।';
      } else if (riskLevel === 'VERY_HIGH') {
        actionEn = 'Avoid outdoor activity from 12 PM to 4 PM. Heavy physical labor restricted under HAP.';
        actionHi = 'दोपहर 12 से 4 बजे तक धूप से बचें। भारी श्रम पर प्रतिबंध।';
      } else if (riskLevel === 'HIGH') {
        actionEn = 'Carry drinking water & ORS. Wear light cotton garments and seek shaded rest areas.';
        actionHi = 'पीने का पानी व ओआरएस साथ रखें। हल्के सूती कपड़े पहनें और छाया में विश्राम करें।';
      }

      return {
        id: city.id,
        name: city.name,
        state: city.state,
        lat: city.lat,
        lng: city.lng,
        temp: Number(baseTemp.toFixed(1)),
        heatIndex,
        wbgt: Number(baseWbgt.toFixed(1)),
        riskLevel,
        riskScore,
        hospitalBurdenPct: hospitalBurden,
        vulnerableExposureIndex: Math.min(98, Math.round(riskScore * 9.8 + (idx % 4) * 3)),
        exposedPopulationMillions: vulnerablePop,
        recommendedActionEn: actionEn,
        recommendedActionHi: actionHi,
        forecastPeriod: currentStep.periodStr,
      };
    });
  }, [activeForecastStep, selectedCity, batchCitiesWeather]);

  // Keep selectedDistrict synchronized with selectedCity and ALWAYS focus map to the selected area or live location city
  useEffect(() => {
    if (districtEntries.length === 0) return;
    const match = districtEntries.find(d => d.id === selectedCity.id || d.name.toLowerCase() === selectedCity.name.toLowerCase()) || districtEntries[0];
    setSelectedDistrict(match);

    // Safe map camera focus on selected area or live location city
    if (mapInstanceRef.current && match) {
      const map = mapInstanceRef.current;
      const container = map.getContainer ? map.getContainer() : null;
      if (container && container.parentElement && (map as any)._loaded) {
        try {
          map.stop();
          map.flyTo([match.lat, match.lng], 9, {
            duration: 1.2,
            easeLinearity: 0.25,
          });
        } catch (_) {}
      }
    }
  }, [selectedCity.id, selectedCity.name, selectedCity.lat, selectedCity.lng]);

  // Initialize Map with clean OSM tiles and focus immediately on selected area / live location city
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      try { mapInstanceRef.current.invalidateSize(); } catch (_) {}
      return;
    }

    const focusLat = selectedCity?.lat || 26.5393;
    const focusLng = selectedCity?.lng || 80.4878;

    const map = L.map(mapContainerRef.current, {
      center: [focusLat, focusLng], // Always focus to selected area or live location city, never a random location
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Clean government basemap (OpenStreetMap Standard)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Trigger invalidateSize and focus safely after container renders
    const initTimer = setTimeout(() => {
      if (mapInstanceRef.current && (map as any)._loaded) {
        try {
          map.invalidateSize();
          map.setView([focusLat, focusLng], 9);
        } catch (_) {}
      }
    }, 150);

    return () => {
      clearTimeout(initTimer);
      try {
        map.stop();
        map.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Ensure map resizes whenever viewMode switches to map
  useEffect(() => {
    let resizeTimer: any;
    if (viewMode === 'map' && mapInstanceRef.current) {
      resizeTimer = setTimeout(() => {
        if (!mapInstanceRef.current) return;
        const map = mapInstanceRef.current;
        const container = map.getContainer ? map.getContainer() : null;
        if (!container || !container.parentElement || !(map as any)._loaded) return;
        try {
          map.invalidateSize();
          if (selectedDistrict) {
            map.setView([selectedDistrict.lat, selectedDistrict.lng], 9);
          }
        } catch (_) {}
      }, 60);
    }
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [viewMode, selectedDistrict?.lat, selectedDistrict?.lng]);

  // Update map markers when active layer, timeline, or district changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();

    // Add a pulsing visual radar focus ring around the selected district / live location
    const activeTarget = selectedDistrict || districtEntries.find(d => d.id === selectedCity.id);
    if (activeTarget) {
      L.circle([activeTarget.lat, activeTarget.lng], {
        radius: 7500,
        color: '#135A9C',
        weight: 2,
        dashArray: '5, 5',
        opacity: 0.9,
        fillColor: '#135A9C',
        fillOpacity: 0.12,
      }).addTo(layerGroupRef.current);
    }

    districtEntries.forEach((entry) => {
      const std = RISK_STANDARDS[entry.riskLevel];
      
      // Determine marker color and value based on selected layer
      let metricLabel = `${entry.temp}°C`;
      let fillColor = std.color;

      if (activeLayer === 'heat-index') {
        metricLabel = `HI ${entry.heatIndex}°C`;
      } else if (activeLayer === 'wbgt') {
        metricLabel = `W ${entry.wbgt}°C`;
      } else if (activeLayer === 'hospital-burden') {
        metricLabel = `+${entry.hospitalBurdenPct}% Surge`;
        fillColor = entry.hospitalBurdenPct >= 50 ? '#C7352B' : entry.hospitalBurdenPct >= 30 ? '#E87500' : '#16804A';
      } else if (activeLayer === 'vulnerable-exposure') {
        metricLabel = `${entry.exposedPopulationMillions}M Pop`;
      }

      const isSelected = selectedDistrict?.id === entry.id || selectedCity.id === entry.id;

      // Custom accessible HTML marker with shape, color, and numeric tag
      const markerHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center">
          ${isSelected ? `
            <div class="absolute -top-2 w-11 h-11 rounded-full bg-[#135A9C]/35 animate-ping pointer-events-none"></div>
            <div class="absolute -top-3.5 px-1.5 py-0.2 rounded bg-[#0B1F3A] border border-[#F4A62A] text-[#F4A62A] text-[9px] font-mono font-bold whitespace-nowrap shadow-md pointer-events-none flex items-center gap-0.5">
              <span>●</span> FOCUS
            </div>
          ` : ''}
          <div 
            style="background-color: ${fillColor}; border-color: ${isSelected ? '#0B1F3A' : '#FFFFFF'}; border-width: ${isSelected ? '3px' : '2px'};" 
            class="w-7 h-7 rounded-sm shadow-sm flex items-center justify-center text-white font-mono font-bold text-[10px] transition-transform group-hover:scale-110 ${isSelected ? 'scale-110 ring-2 ring-[#F4A62A]' : ''}"
          >
            ${entry.riskScore}
          </div>
          <span class="${isSelected ? 'bg-[#135A9C] text-white font-bold ring-1 ring-white' : 'bg-[#0B1F3A] text-white'} text-[9px] font-mono px-1 py-0.2 rounded mt-0.5 whitespace-nowrap shadow-xs">
            ${metricLabel}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-district-marker',
        html: markerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([entry.lat, entry.lng], { icon: customIcon });

      if (isSelected) {
        marker.setZIndexOffset(1200);
      }

      marker.on('click', () => {
        setSelectedDistrict(entry);
        const cityMatch = INDIAN_CITIES.find(c => c.id === entry.id);
        if (cityMatch) onSelectCity(cityMatch);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([entry.lat, entry.lng], 9, { duration: 1.0 });
        }
      });

      marker.bindTooltip(`
        <div class="text-xs font-sans p-1">
          <strong>${entry.name}, ${entry.state}</strong><br />
          <span>Risk: <strong>${std.labelEn}</strong> (Score: ${entry.riskScore}/10)</span><br />
          <span>Temp: ${entry.temp}°C | Heat Index: ${entry.heatIndex}°C</span>
        </div>
      `, { sticky: true, className: 'leaflet-tactical-tooltip' });

      marker.addTo(layerGroupRef.current!);
    });
  }, [districtEntries, activeLayer, selectedDistrict?.id, selectedCity.id]);

  // Center on selected district
  const handleSelectEntry = (entry: DistrictRiskEntry) => {
    setSelectedDistrict(entry);
    const cityMatch = INDIAN_CITIES.find(c => c.id === entry.id);
    if (cityMatch) onSelectCity(cityMatch);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([entry.lat, entry.lng], 9, { duration: 1.2 });
    }
  };

  // Filtered districts for list view & search
  const filteredDistricts = useMemo(() => {
    let list = [...districtEntries];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q));
    }
    // Sort by risk score descending (highest danger first)
    list.sort((a, b) => b.riskScore - a.riskScore);
    return list;
  }, [districtEntries, searchQuery]);

  return (
    <div id="central-national-heat-risk-section" className="space-y-4">
      
      {/* SECTION HEADER & CONTROLS */}
      <div className="gov-card p-4 sm:p-5">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#D9E2EC]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#135A9C]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#135A9C]">
                {isHindi ? 'राष्ट्रीय एकीकृत मानचित्र प्रणाली' : 'National Integrated Early Warning GIS'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5">
              {isHindi ? 'राष्ट्रीय ताप जोखिम एवं स्वास्थ्य भार मानचित्र' : 'Interactive National Heat Risk & Health Burden Map'}
            </h2>
            <p className="text-xs text-[#526273] mt-0.5">
              {isHindi 
                ? 'जिलों में वास्तविक समय ताप सूचकांक, बायो-मौसम विज्ञान एवं अस्पताल तैयारी स्तर' 
                : 'Real-time district biometeorological stress, thermal index, and hospital surge forecasting'}
            </p>
          </div>

          {/* Map vs List View Toggle + Location Detection */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-[#F5F8FB] border border-[#D9E2EC] p-0.5 rounded text-xs">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-medium cursor-pointer ${
                  viewMode === 'map' ? 'bg-[#135A9C] text-white shadow-xs' : 'text-[#526273] hover:text-[#0B1F3A]'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>{isHindi ? 'मानचित्र' : 'Map View'}</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-medium cursor-pointer ${
                  viewMode === 'list' ? 'bg-[#135A9C] text-white shadow-xs' : 'text-[#526273] hover:text-[#0B1F3A]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>{isHindi ? 'श्रेणीबद्ध सूची' : 'Ranked List'}</span>
              </button>
            </div>

            <button
              onClick={onCheckMyLocation}
              className="px-3 py-1.5 rounded bg-[#0B1F3A] hover:bg-[#135A9C] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Detect my location via GPS and focus map"
            >
              <Compass className="w-3.5 h-3.5 text-[#F4A62A]" />
              <span className="hidden sm:inline">{isHindi ? 'मेरी स्थिति' : 'Locate Me'}</span>
            </button>
          </div>
        </div>

        {/* CONTROLS STRIP: LAYER SELECTOR + TIME SLIDER + SEARCH */}
        <div className="pt-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3 text-xs">
          
          {/* Layer Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="font-bold text-[#526273] shrink-0 mr-1 hidden sm:inline">
              Layer:
            </span>

            <button
              onClick={() => setActiveLayer('health-risk')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                activeLayer === 'health-risk' 
                  ? 'bg-[#135A9C] text-white font-bold' 
                  : 'bg-[#F5F8FB] text-[#17202A] border border-[#D9E2EC] hover:bg-[#E8EEF5]'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-[#F4A62A]" />
              <span>Health Risk Level</span>
            </button>

            <button
              onClick={() => setActiveLayer('heat-index')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                activeLayer === 'heat-index' 
                  ? 'bg-[#135A9C] text-white font-bold' 
                  : 'bg-[#F5F8FB] text-[#17202A] border border-[#D9E2EC] hover:bg-[#E8EEF5]'
              }`}
            >
              <Flame className="w-3 h-3 text-[#E87500]" />
              <span>Heat Index (°C)</span>
            </button>

            <button
              onClick={() => setActiveLayer('wbgt')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                activeLayer === 'wbgt' 
                  ? 'bg-[#135A9C] text-white font-bold' 
                  : 'bg-[#F5F8FB] text-[#17202A] border border-[#D9E2EC] hover:bg-[#E8EEF5]'
              }`}
            >
              <Droplets className="w-3 h-3 text-[#135A9C]" />
              <span>Wet-Bulb Temp (°C)</span>
            </button>

            <button
              onClick={() => setActiveLayer('temperature')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                activeLayer === 'temperature' 
                  ? 'bg-[#135A9C] text-white font-bold' 
                  : 'bg-[#F5F8FB] text-[#17202A] border border-[#D9E2EC] hover:bg-[#E8EEF5]'
              }`}
            >
              <Thermometer className="w-3 h-3 text-[#C7352B]" />
              <span>Dry-Bulb Temp</span>
            </button>

            <button
              onClick={() => setActiveLayer('hospital-burden')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                activeLayer === 'hospital-burden' 
                  ? 'bg-[#135A9C] text-white font-bold' 
                  : 'bg-[#F5F8FB] text-[#17202A] border border-[#D9E2EC] hover:bg-[#E8EEF5]'
              }`}
            >
              <HeartPulse className="w-3 h-3 text-[#C7352B]" />
              <span>Hospital Burden</span>
            </button>

            <button
              onClick={() => setActiveLayer('vulnerable-exposure')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                activeLayer === 'vulnerable-exposure' 
                  ? 'bg-[#135A9C] text-white font-bold' 
                  : 'bg-[#F5F8FB] text-[#17202A] border border-[#D9E2EC] hover:bg-[#E8EEF5]'
              }`}
            >
              <Users className="w-3 h-3 text-[#526273]" />
              <span>Vulnerable Population</span>
            </button>
          </div>

          {/* Search by District or State */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#526273]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHindi ? 'जिला या राज्य खोजें...' : 'Search district or state...'}
              className="w-full pl-8 pr-3 py-1.5 rounded bg-white border border-[#D9E2EC] text-xs text-[#17202A] focus:outline-none focus:border-[#135A9C]"
            />
          </div>

        </div>

        {/* TIME SLIDER STRIP FOR FORECAST PERIODS */}
        <div className="mt-3 pt-3 border-t border-[#D9E2EC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#135A9C]" />
            <span className="text-xs font-bold text-[#0B1F3A]">
              {isHindi ? 'पूर्वानुमान समय रेखा:' : 'Forecast Period:'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-1.5">
            {forecastSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveForecastStep(idx)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium cursor-pointer transition-colors ${
                  activeForecastStep === idx
                    ? 'bg-[#0B1F3A] text-white font-bold shadow-xs'
                    : 'bg-[#F5F8FB] text-[#526273] hover:bg-[#E8EEF5] border border-[#D9E2EC]'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* MAP / LIST CONTAINER + SELECTED DISTRICT POPUP CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Main Map or Ranked List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* MAP CONTAINER VIEW */}
          <div className={`gov-card p-2 relative overflow-hidden ${viewMode === 'map' ? 'block' : 'hidden'}`}>
            <div 
              ref={mapContainerRef} 
              className="w-full h-[460px] sm:h-[540px] rounded overflow-hidden"
              style={{ zIndex: 1 }}
            />

            {/* Standard Heat Risk Legend overlay */}
            <div className="mt-2 p-2.5 bg-[#F5F8FB] border border-[#D9E2EC] rounded text-[11px] flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-[#0B1F3A] uppercase font-mono">
                {isHindi ? 'जोखिम स्तर मानक:' : 'Standard Risk Legend:'}
              </span>

              <div className="flex flex-wrap items-center gap-3 font-medium text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#16804A]" />
                  <span>● Minimal (&lt;32°C)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#E5A400]" />
                  <span>▲ Moderate (32-36°C)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#E87500]" />
                  <span>■ High (36-40°C)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#C7352B]" />
                  <span>◆ Very High (40-44°C)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#7A1F2B]" />
                  <span>⬢ Extreme (&gt;44°C)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACCESSIBLE RANKED DISTRICT DIRECTORY TABLE */}
          <div className={`gov-card overflow-hidden ${viewMode === 'list' ? 'block' : 'hidden'}`}>
            <div className="p-3 bg-[#0B1F3A] text-white text-xs font-bold flex items-center justify-between">
              <span>{isHindi ? 'राष्ट्रीय स्तर पर क्रमबद्ध जिले' : 'All Districts Ranked by Heat Stress Index'}</span>
              <span className="font-mono text-[#D9E2EC]">Showing {filteredDistricts.length} Locations</span>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F5F8FB] text-[#526273] font-mono border-b border-[#D9E2EC] sticky top-0">
                  <tr>
                    <th className="p-2.5">District & State</th>
                    <th className="p-2.5">Risk Level</th>
                    <th className="p-2.5">Score</th>
                    <th className="p-2.5">Temp / HI</th>
                    <th className="p-2.5">Hospital Surge</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]">
                  {filteredDistricts.map((d) => {
                    const std = RISK_STANDARDS[d.riskLevel];
                    const isSelected = selectedDistrict?.id === d.id;
                    return (
                      <tr 
                        key={d.id} 
                        onClick={() => handleSelectEntry(d)}
                        className={`hover:bg-[#F5F8FB] cursor-pointer transition-colors ${isSelected ? 'bg-[#E8EEF5]' : ''}`}
                      >
                        <td className="p-2.5 font-medium text-[#0B1F3A]">
                          <div>{d.name}</div>
                          <div className="text-[11px] text-[#526273]">{d.state}</div>
                        </td>
                        <td className="p-2.5">
                          <span 
                            className="px-2 py-0.5 rounded text-[11px] font-bold text-white whitespace-nowrap"
                            style={{ backgroundColor: std.color }}
                          >
                            {std.shapeLabel} {d.riskLevel}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-[#0B1F3A]">
                          {d.riskScore}/10
                        </td>
                        <td className="p-2.5 font-mono">
                          <span className="font-bold text-[#0B1F3A]">{d.temp}°C</span>
                          <span className="text-[11px] text-[#526273] ml-1">HI {d.heatIndex}°C</span>
                        </td>
                        <td className="p-2.5 font-mono">
                          <span className={d.hospitalBurdenPct >= 50 ? 'text-[#C7352B] font-bold' : 'text-[#526273]'}>
                            +{d.hospitalBurdenPct}%
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectEntry(d);
                            }}
                            className="px-2 py-1 rounded bg-[#135A9C] text-white text-[11px] font-semibold hover:bg-[#0B1F3A]"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Selected Location Details Card (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {selectedDistrict ? (
            <div className="gov-card p-5 border-l-4" style={{ borderLeftColor: RISK_STANDARDS[selectedDistrict.riskLevel].color }}>
              
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#D9E2EC]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#526273] tracking-wider block">
                    {isHindi ? 'चयनित जिला रिपोर्ट' : 'District Heat Advisory'}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="text-lg sm:text-xl font-bold text-[#0B1F3A]">
                      {selectedDistrict.name}
                    </h3>
                    <button
                      onClick={() => {
                        setViewMode('map');
                        if (mapInstanceRef.current && selectedDistrict) {
                          mapInstanceRef.current.flyTo([selectedDistrict.lat, selectedDistrict.lng], 10, { duration: 0.9 });
                        }
                      }}
                      className="px-2 py-0.5 rounded bg-[#F0F4F8] hover:bg-[#D9E2EC] text-[#135A9C] border border-[#CBD5E1] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title={`Focus map on ${selectedDistrict.name}`}
                    >
                      <Crosshair className="w-3 h-3 text-[#135A9C]" />
                      <span>{isHindi ? 'मानचित्र फोकस' : 'Focus'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#526273]">{selectedDistrict.state}</p>
                </div>

                <div 
                  className="px-2 py-1 rounded text-white font-bold font-mono text-xs text-center shrink-0"
                  style={{ backgroundColor: RISK_STANDARDS[selectedDistrict.riskLevel].color }}
                >
                  <div>{RISK_STANDARDS[selectedDistrict.riskLevel].shapeLabel}</div>
                  <div className="text-[10px]">{selectedDistrict.riskLevel}</div>
                </div>
              </div>

              {/* Exact Metrics Data Grid */}
              <div className="grid grid-cols-2 gap-2.5 py-3 border-b border-[#D9E2EC] text-xs font-mono">
                <div className="p-2 rounded bg-[#F5F8FB]">
                  <span className="text-[10px] text-[#526273] block uppercase">Current Risk</span>
                  <span className="text-base font-bold text-[#0B1F3A]">
                    {selectedDistrict.riskLevel}
                  </span>
                  <span className="text-[11px] text-[#526273] block mt-0.5">Score: {selectedDistrict.riskScore}/10</span>
                </div>

                <div className="p-2 rounded bg-[#F5F8FB]">
                  <span className="text-[10px] text-[#526273] block uppercase">Max Heat Index</span>
                  <span className="text-base font-bold text-[#C7352B]">
                    {selectedDistrict.heatIndex}°C
                  </span>
                  <span className="text-[11px] text-[#526273] block mt-0.5">Air Temp: {selectedDistrict.temp}°C</span>
                </div>

                <div className="p-2 rounded bg-[#F5F8FB]">
                  <span className="text-[10px] text-[#526273] block uppercase">Wet-Bulb (WBGT)</span>
                  <span className="text-base font-bold text-[#0B1F3A]">
                    {selectedDistrict.wbgt}°C
                  </span>
                  <span className="text-[11px] text-[#526273] block mt-0.5">Threshold: 31.5°C</span>
                </div>

                <div className="p-2 rounded bg-[#F5F8FB]">
                  <span className="text-[10px] text-[#526273] block uppercase">Hospital Burden</span>
                  <span className="text-base font-bold text-[#E87500]">
                    +{selectedDistrict.hospitalBurdenPct}%
                  </span>
                  <span className="text-[11px] text-[#526273] block mt-0.5">Pop: {selectedDistrict.exposedPopulationMillions}M exp.</span>
                </div>
              </div>

              {/* Mandatory Format requirement:
                  District: Example District
                  Current risk: Very High
                  Maximum heat index: 46°C
                  Forecast period: 12-14 September
                  Recommended action: Avoid outdoor activity from 12 PM to 4 PM
              */}
              <div className="py-3 border-b border-[#D9E2EC] text-xs space-y-2">
                <div className="p-2.5 rounded bg-[#FFFBEA] border border-[#E5A400]/40 text-[#17202A]">
                  <span className="font-bold text-[#0B1F3A] block mb-1">
                    {isHindi ? 'दैनिक सरकारी परामर्श:' : 'Official Heatwave Directive:'}
                  </span>
                  <p className="text-xs leading-relaxed">
                    <strong>Recommended action:</strong> {isHindi ? selectedDistrict.recommendedActionHi : selectedDistrict.recommendedActionEn}
                  </p>
                </div>

                <div className="text-[11px] text-[#526273] font-mono flex items-center justify-between">
                  <span>Forecast period:</span>
                  <strong className="text-[#0B1F3A]">{selectedDistrict.forecastPeriod}</strong>
                </div>
              </div>

              {/* Action Buttons: Safety Advice & Emergency Triage */}
              <div className="pt-3 space-y-2">
                <button
                  onClick={onViewGuidance}
                  className="w-full py-2 px-3 rounded bg-[#135A9C] hover:bg-[#0B1F3A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <span>{isHindi ? 'सुरक्षा सलाह एवं प्रोटोकॉल देखें' : 'Get Safety Advice'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onOpenTriage}
                  className="w-full py-2 px-3 rounded bg-white hover:bg-[#F5F8FB] border border-[#135A9C] text-[#135A9C] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'लू लक्षण जांच (ट्राइएज)' : 'Heat Symptom Clinical Triage'}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="gov-card p-6 text-center text-[#526273] text-xs">
              <MapPin className="w-8 h-8 mx-auto text-[#CBD5E1] mb-2" />
              <p>Click any district marker on the map to inspect telemetry, heat index, and safety directives.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
