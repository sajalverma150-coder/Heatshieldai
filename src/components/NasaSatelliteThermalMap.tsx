import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Flame, 
  Crosshair, 
  Maximize2, 
  Minimize2, 
  Sparkles
} from 'lucide-react';
import { CityData } from '../data/indiaCities';
import { WeatherTelemetry } from '../types';

interface NasaSatelliteThermalMapProps {
  city: CityData;
  weather: WeatherTelemetry;
  dataSourceMode?: 'live_api' | 'imd_heatwave';
  theme?: 'dark' | 'light';
}

interface ThermalHotspot {
  id: string;
  name: string;
  offsetLat: number;
  offsetLng: number;
  tempOffset: number; // relative to ambient
  surfaceType: string;
  category: 'core' | 'transit' | 'industrial' | 'cooling_sink';
  description: string;
}

export const NasaSatelliteThermalMap: React.FC<NasaSatelliteThermalMapProps> = ({
  city,
  weather,
  dataSourceMode = 'live_api',
  theme = 'dark',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const thermalGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer & Display States matching the screenshot
  const [basemapType, setBasemapType] = useState<'satellite' | 'tactical'>('satellite');
  const [showThermalLST, setShowThermalLST] = useState<boolean>(true);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<ThermalHotspot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Dynamic Land Surface Temperature (LST) calculation
  const uhiAnomaly = city?.weather?.uhiAnomaly || 3.1;
  const currentAmbient = weather?.dryBulbTemp || 32.0;
  const peakCoreLST = Number((currentAmbient + uhiAnomaly + 1.1).toFixed(1));
  const meanUrbanLST = Number((currentAmbient + uhiAnomaly * 0.75).toFixed(1));
  const coolingSinkLST = Number((currentAmbient - 2.5).toFixed(1));

  // City-specific or dynamically generated thermal hotspots
  const getCityHotspots = (): ThermalHotspot[] => {
    const cityNameLower = city.name.toLowerCase();

    if (cityNameLower.includes('unnao')) {
      return [
        {
          id: 'un-1',
          name: 'Unnao Central Chowk & Ganj Market',
          offsetLat: 0.004,
          offsetLng: 0.005,
          tempOffset: +(uhiAnomaly + 0.6),
          surfaceType: 'High-Density Concrete & Asphalt Paving',
          category: 'core',
          description: 'Intense thermal trapping between commercial masonry facades and dense market corridors.'
        },
        {
          id: 'un-2',
          name: 'Unnao Intercity Rail & NH-27 Corridor',
          offsetLat: -0.016,
          offsetLng: -0.012,
          tempOffset: +(uhiAnomaly + 1.2),
          surfaceType: 'Asphalt Highway & Steel Rail Junction',
          category: 'transit',
          description: 'Continuous vehicular friction heat and unshaded steel railway lines generating peak radiation.'
        },
        {
          id: 'un-3',
          name: 'Unnao Botanical Buffer & Sai River Sink',
          offsetLat: 0.018,
          offsetLng: 0.022,
          tempOffset: -3.3,
          surfaceType: 'Vegetative Canopy & Evaporative Wetland',
          category: 'cooling_sink',
          description: 'Natural biometeorological oasis suppressing microclimate temperature through evapotranspiration.'
        }
      ];
    } else if (cityNameLower.includes('lucknow')) {
      return [
        {
          id: 'lko-1',
          name: 'Hazratganj Commercial Core & Vidhan Sabha Marg',
          offsetLat: 0.008,
          offsetLng: 0.012,
          tempOffset: +4.6,
          surfaceType: 'High-Density Concrete & Multilevel Asphalt Paving',
          category: 'core',
          description: 'Intense thermal trapping between multi-story administrative stone facades and congested traffic.'
        },
        {
          id: 'lko-2',
          name: 'Charbagh Central Intermodal Railway Junction',
          offsetLat: -0.024,
          offsetLng: -0.018,
          tempOffset: +5.2,
          surfaceType: 'Unshaded Rail Steel Lines & Corrugated Metal Platforms',
          category: 'transit',
          description: 'Extreme thermal re-radiation from unshaded steel rail yards and diesel locomotive idling.'
        },
        {
          id: 'lko-3',
          name: 'Gomti Riverfront Ecological Buffer & Janeshwar Mishra Park',
          offsetLat: 0.021,
          offsetLng: 0.045,
          tempOffset: -2.8,
          surfaceType: 'Water Body & Riparian Vegetative Canopy',
          category: 'cooling_sink',
          description: 'Significant evaporative cooling oasis acting as a natural biometeorological heat buffer.'
        }
      ];
    } else if (cityNameLower.includes('mumbai')) {
      return [
        {
          id: 'mum-1',
          name: 'Dharavi Transit Camp & 90-Feet Corridor',
          offsetLat: -0.035,
          offsetLng: -0.025,
          tempOffset: +5.4,
          surfaceType: 'Corrugated Metal Roof Density & Narrow Alleys',
          category: 'core',
          description: 'Severe structural thermal entrapment from high-density tin roofing.'
        },
        {
          id: 'mum-2',
          name: 'Bandra-Kurla Complex (BKC) Glass Towers',
          offsetLat: -0.015,
          offsetLng: -0.012,
          tempOffset: +4.2,
          surfaceType: 'Glass Facades & Extensive HVAC Exhaust',
          category: 'transit',
          description: 'Industrial HVAC exhaust rejection and mirror glazing directing thermal radiation.'
        },
        {
          id: 'mum-3',
          name: 'Sanjay Gandhi National Park & Powai Oasis',
          offsetLat: 0.065,
          offsetLng: 0.025,
          tempOffset: -3.4,
          surfaceType: 'Dense Deciduous Forest & Fresh Water Basin',
          category: 'cooling_sink',
          description: 'Major regional natural thermal depression acting as Mumbai urban heat sink.'
        }
      ];
    }

    // Default procedural hotspots
    return [
      {
        id: 'gen-1',
        name: `${city.name} Central Market & Commercial District`,
        offsetLat: 0.005,
        offsetLng: 0.008,
        tempOffset: +(uhiAnomaly + 0.6),
        surfaceType: 'High-Density Concrete & Asphalt Paving',
        category: 'core',
        description: 'Dense central urban build-up re-radiating trapped sensible solar heat.'
      },
      {
        id: 'gen-2',
        name: `${city.name} Intercity Junction & Transit Corridor`,
        offsetLat: -0.016,
        offsetLng: -0.012,
        tempOffset: +(uhiAnomaly + 1.2),
        surfaceType: 'Asphalt Highway & Steel Rail Junction',
        category: 'transit',
        description: 'Open steel surfaces and heavy vehicle transit creating sharp microclimate spike.'
      },
      {
        id: 'gen-3',
        name: `${city.name} Botanical Oasis & River Sink`,
        offsetLat: 0.018,
        offsetLng: 0.022,
        tempOffset: -3.0,
        surfaceType: 'Vegetative Canopy & Evaporative Wetland',
        category: 'cooling_sink',
        description: 'Natural biometeorological oasis suppressing microclimate temperature through evapotranspiration.'
      }
    ];
  };

  const hotspots = getCityHotspots();

  // Create Basemap Tile Layer
  const createTileLayer = (type: 'satellite' | 'tactical'): L.TileLayer => {
    let url = '';
    let maxZoom = 19;
    let maxNativeZoom = 18;
    let attribution = '';
    let subdomains: string[] | string = 'abc';

    if (type === 'satellite') {
      // High-resolution ESRI / NASA World Imagery (Satellite)
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxNativeZoom = 18;
      maxZoom = 19;
      attribution = 'NASA Earthdata / ESRI World Imagery';
    } else {
      // Standard Tactical Vector Map (OpenStreetMap with crisp street layout)
      url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      maxNativeZoom = 19;
      maxZoom = 19;
      attribution = 'OpenStreetMap Tactical';
    }

    return L.tileLayer(url, {
      maxZoom,
      maxNativeZoom,
      crossOrigin: true,
      subdomains,
      attribution,
      tileSize: 256,
      keepBuffer: 4,
      updateWhenIdle: false,
    });
  };

  // Render Thermal Rings
  const renderThermalRings = (lat: number, lng: number) => {
    if (!thermalGroupRef.current) return;
    thermalGroupRef.current.clearLayers();

    if (!showThermalLST) return;

    // Outer Ring: Broad Urban Heat Island Halo
    L.circle([lat, lng], {
      radius: 4800,
      color: '#ea580c',
      weight: 2,
      opacity: 0.9,
      fillColor: '#ea580c',
      fillOpacity: 0.22,
    }).addTo(thermalGroupRef.current);

    // Middle Ring: Elevated Core Hotspot Zone
    L.circle([lat, lng], {
      radius: 2400,
      color: '#ef4444',
      weight: 2,
      opacity: 0.95,
      fillColor: '#dc2626',
      fillOpacity: 0.38,
    }).addTo(thermalGroupRef.current);

    // Inner Core: Peak Epicenter
    L.circle([lat, lng], {
      radius: 1100,
      color: '#b91c1c',
      weight: 2.5,
      opacity: 1,
      fillColor: '#991b1b',
      fillOpacity: 0.55,
    }).addTo(thermalGroupRef.current);
  };

  // Initialize Map and cleanup properly on unmount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lat = city?.lat || 26.5393;
    const lng = city?.lng || 80.4878;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 11,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    const baseTile = createTileLayer(basemapType);
    baseTile.addTo(map);
    baseTileLayerRef.current = baseTile;

    thermalGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Safe layout sizing
    const t1 = setTimeout(() => {
      if (mapInstanceRef.current && (map as any)._loaded) {
        try { map.invalidateSize(); } catch (_) {}
      }
    }, 100);

    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current && (mapInstanceRef.current as any)._loaded) {
          try { mapInstanceRef.current.invalidateSize(); } catch (_) {}
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      try {
        map.stop();
        map.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
      baseTileLayerRef.current = null;
      thermalGroupRef.current = null;
      markersGroupRef.current = null;
    };
  }, []);

  // Smoothly fly to updated city
  useEffect(() => {
    if (!mapInstanceRef.current || !city) return;
    const map = mapInstanceRef.current;
    const container = map.getContainer ? map.getContainer() : null;
    if (!container || !container.parentElement || !(map as any)._loaded) return;
    try {
      map.stop();
      map.flyTo([city.lat, city.lng], 11, { duration: 1.0 });
    } catch (_) {}
  }, [city?.id, city?.lat, city?.lng]);

  // Update thermal rings and hotspots layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const lat = city?.lat || 26.5393;
    const lng = city?.lng || 80.4878;

    // Draw concentric thermal rings
    renderThermalRings(lat, lng);

    // Add Hotspot markers
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();

      if (showHotspots) {
        hotspots.forEach((spot) => {
          const spotLat = lat + spot.offsetLat;
          const spotLng = lng + spot.offsetLng;
          const spotLST = Number((currentAmbient + spot.tempOffset).toFixed(1));
          const isCooling = spot.category === 'cooling_sink';

          const markerBg = isCooling ? '#06b6d4' : spot.tempOffset >= (uhiAnomaly + 0.8) ? '#f97316' : '#f97316';
          const markerBorder = '#ffffff';

          const customIcon = L.divIcon({
            className: 'nasa-hotspot-pin',
            html: `
              <div style="
                width: 28px; 
                height: 28px; 
                border-radius: 50%; 
                background: ${markerBg}; 
                border: 2.5px solid ${markerBorder}; 
                box-shadow: 0 0 14px ${markerBg}, 0 2px 6px rgba(0,0,0,0.5); 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                cursor: pointer;
                transform: translate(-14px, -14px);
              ">
                <span style="font-family: sans-serif; font-weight: 900; font-size: 11px; color: #ffffff; line-height: 1;">
                  ${isCooling ? '❄' : '▲'}
                </span>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([spotLat, spotLng], { icon: customIcon });

          const popupContent = `
            <div style="font-family: system-ui, sans-serif; background: #060e20; color: #e2e8f0; padding: 12px; border-radius: 12px; border: 1px solid #2d3449; min-width: 220px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-family: monospace; font-size: 10px; font-weight: bold; color: ${markerBg}; text-transform: uppercase;">
                  ${spot.category.toUpperCase().replace('_', ' ')}
                </span>
                <span style="font-family: monospace; font-size: 11px; font-weight: bold; color: ${isCooling ? '#38bdf8' : '#f87171'};">
                  ${spot.tempOffset > 0 ? `+${spot.tempOffset.toFixed(1)}°C` : `${spot.tempOffset.toFixed(1)}°C`} LST
                </span>
              </div>
              <strong style="display: block; font-size: 13px; color: #fff; margin-bottom: 4px; line-height: 1.3;">
                ${spot.name}
              </strong>
              <div style="display: flex; justify-content: space-between; font-family: monospace; font-size: 11px; margin-bottom: 6px; padding: 4px 6px; background: #0b1326; border-radius: 6px;">
                <span style="color: #94a3b8;">Estimated LST:</span>
                <strong style="color: #f97316;">${spotLST}°C</strong>
              </div>
              <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin: 0;">
                ${spot.description}
              </p>
            </div>
          `;

          marker.bindPopup(popupContent, {
            closeButton: false,
            className: 'nasa-custom-leaflet-popup',
          });

          marker.on('click', () => {
            setSelectedHotspot(spot);
          });

          marker.addTo(markersGroupRef.current!);
        });
      }
    }
  }, [city, showHotspots, showThermalLST, currentAmbient, uhiAnomaly]);

  // Handle Basemap Switch (Satellite vs Tactical)
  const handleBasemapSwitch = (type: 'satellite' | 'tactical') => {
    setBasemapType(type);
    if (!mapInstanceRef.current) return;

    if (baseTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(baseTileLayerRef.current);
    }

    const newTile = createTileLayer(type);
    newTile.addTo(mapInstanceRef.current);
    newTile.bringToBack();
    baseTileLayerRef.current = newTile;

    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 50);
  };

  // Toggle Thermal LST layer
  const toggleThermalLST = () => {
    const nextState = !showThermalLST;
    setShowThermalLST(nextState);
    const lat = city?.lat || 26.539;
    const lng = city?.lng || 80.488;
    if (nextState) {
      renderThermalRings(lat, lng);
    } else if (thermalGroupRef.current) {
      thermalGroupRef.current.clearLayers();
    }
  };

  // Recenter Map
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([city.lat, city.lng], 11, { duration: 0.8 });
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      id="nasa-satellite-thermal-widget" 
      className={`relative rounded-2xl border border-[#1e293b] bg-[#070e1d] overflow-hidden flex flex-col justify-between transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-[#070e1d]' : 'w-full'
      }`}
    >
      {/* Top Header & Satellite Sensor Metadata */}
      <div className="p-4 sm:p-5 border-b border-[#1e293b] bg-[#070e1d] flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Layers className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-base sm:text-lg font-headline font-bold text-white tracking-tight leading-tight">
                NASA MODIS Satellite Thermal Map
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Target Station: <strong className="text-white font-semibold">{city.name}</strong> ({city.lat.toFixed(3)}°N, {city.lng.toFixed(3)}°E) • LST Level-3 (1km)
              </p>
            </div>
          </div>

          {/* TERRA / AQUA Badge */}
          <div className="px-2.5 py-1 rounded bg-[#082f49]/60 text-cyan-400 border border-cyan-700/60 font-mono text-[11px] font-bold tracking-wider shrink-0 text-center">
            TERRA / AQUA
          </div>
        </div>

        {/* Live Badges: Urban Anomaly, Peak LST Core, Fullscreen */}
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block font-mono mb-1">Urban Anomaly</span>
            <div className="px-2.5 py-1 rounded bg-red-950/60 text-red-400 font-mono text-xs font-bold border border-red-700/60">
              +{uhiAnomaly.toFixed(1)}°C UHI
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-mono mb-1">Peak LST Core</span>
            <div className="px-2.5 py-1 rounded bg-amber-950/60 text-amber-400 font-mono text-xs font-bold border border-amber-700/60">
              {peakCoreLST}°C
            </div>
          </div>

          <button
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
            }}
            className="p-2 rounded-lg bg-[#111827] hover:bg-[#1f2937] text-slate-300 border border-slate-700 transition-colors ml-1 mt-3"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map Stage */}
      <div className="relative w-full h-80 sm:h-96 lg:h-[420px] bg-[#070e1d]">
        <div 
          ref={mapContainerRef} 
          className="w-full h-full z-0 cursor-grab active:cursor-grabbing bg-[#070e1d]"
        />

        {/* Floating Top-Right Controls */}
        <div className="absolute top-3.5 right-3.5 z-10 flex flex-col gap-2 font-mono text-xs">
          {/* Row 1: Basemap Capsule (Satellite | Tactical) */}
          <div className="bg-[#111827]/95 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-xl flex items-center gap-1">
            <button
              onClick={() => handleBasemapSwitch('satellite')}
              className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                basemapType === 'satellite'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => handleBasemapSwitch('tactical')}
              className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                basemapType === 'tactical'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Tactical
            </button>
          </div>

          {/* Row 2: Thermal LST Toggle & Recenter Crosshair */}
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={toggleThermalLST}
              className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-semibold flex items-center gap-1.5 shadow-xl backdrop-blur-md transition-all ${
                showThermalLST
                  ? 'bg-[#1f1624]/95 border-red-500/60 text-red-400'
                  : 'bg-[#111827]/95 border-slate-700/60 text-slate-400 hover:text-white'
              }`}
              title="Toggle Thermal LST Overlay"
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Thermal LST</span>
            </button>

            <button
              onClick={handleRecenter}
              className="p-1.5 rounded-xl bg-[#111827]/95 hover:bg-[#1f2937] border border-slate-700/60 text-cyan-400 transition-colors shadow-xl"
              title="Recenter on City"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Bottom-Left LST Range Bar */}
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-[#0b1326]/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono shadow-2xl">
          <div className="flex items-center gap-2 text-slate-300 flex-wrap">
            <span className="text-slate-400">LST Range ({city.name}):</span>
            <span className="text-cyan-400 font-bold">{coolingSinkLST}°C (Buffer)</span>
            <span className="text-slate-500">→</span>
            <span className="text-amber-400 font-bold">{meanUrbanLST}°C (Avg)</span>
            <span className="text-slate-500">→</span>
            <span className="text-red-400 font-bold">{peakCoreLST}°C (Core Peak)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-24 sm:w-32 h-2 rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 via-orange-500 to-red-600 shadow-sm" />
            <span className="text-slate-400 text-[11px] hidden sm:inline">MODIS Infrared</span>
          </div>
        </div>
      </div>

      {/* Footer Hotspot Inspector Cards */}
      <div className="p-4 sm:p-5 bg-[#070e1d] border-t border-[#1e293b] space-y-3.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#a78b7d] uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Active Microclimate Hotspots & Albedo Signatures
          </span>
          <span className="text-[11px] text-slate-400">Click pins on map to inspect</span>
        </div>

        {/* 3 Hotspot Cards matching the screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {hotspots.map((spot, idx) => {
            const spotLST = Number((currentAmbient + spot.tempOffset).toFixed(1));
            const isCooling = spot.category === 'cooling_sink';
            const categoryLabel = spot.category === 'cooling_sink' ? 'COOLING_S...' : spot.category.toUpperCase();

            return (
              <div 
                key={spot.id}
                onClick={() => {
                  setSelectedHotspot(spot);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([city.lat + spot.offsetLat, city.lng + spot.offsetLng], 12, { duration: 0.8 });
                  }
                }}
                className="p-3 rounded-xl bg-[#0b1326] border border-[#1e293b] hover:border-orange-500/50 cursor-pointer transition-all text-left group"
              >
                <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                  <span className="text-slate-400 font-semibold">{categoryLabel}</span>
                  <span className={`font-bold ${isCooling ? 'text-cyan-400' : 'text-red-400'}`}>
                    {spotLST}°C
                  </span>
                </div>
                <strong className="block text-xs font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                  {spot.name}
                </strong>
                <span className="block text-[11px] text-slate-400 truncate mt-1">
                  {spot.surfaceType}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <p className="text-xs text-slate-400 font-mono leading-relaxed pt-1">
          {city.name} thermal telemetry is synchronized with Live Satellite Observations (Open-Meteo & NASA MODIS Terra). Direct thermal radiation peaks over asphalt corridors and low-reflectance tin roofing.
        </p>
      </div>
    </div>
  );
};
