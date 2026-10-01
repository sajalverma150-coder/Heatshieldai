import React, { useState } from 'react';
import { 
  Flame, 
  Bell, 
  ChevronRight, 
  X, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Volume2, 
  Radio, 
  Sliders,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { DRILL_SCENARIOS, DrillScenario, dispatchHeatwaveEmergencyPushNotification } from '../services/drillService';
import { CityData } from '../data/indiaCities';
import { LanguageCode, WeatherTelemetry } from '../types';
import { requestNotificationPermission, getNotificationPermission } from '../services/hydrationNotificationService';

interface HeatwaveDrillBannerProps {
  isDrillModeActive: boolean;
  activeScenario: DrillScenario;
  onSelectScenario: (scenario: DrillScenario) => void;
  onExitDrill: () => void;
  selectedCity: CityData;
  weather: WeatherTelemetry;
  language: LanguageCode;
  onNavigateToGuidance: () => void;
}

export const HeatwaveDrillBanner: React.FC<HeatwaveDrillBannerProps> = ({
  isDrillModeActive,
  activeScenario,
  onSelectScenario,
  onExitDrill,
  selectedCity,
  weather,
  language,
  onNavigateToGuidance,
}) => {
  const [notificationPromptSent, setNotificationPromptSent] = useState(false);
  const isHindi = language === 'hi';

  if (!isDrillModeActive) return null;

  const handleTestPushNotification = async () => {
    const perm = getNotificationPermission();
    if (perm === 'default') {
      await requestNotificationPermission();
    }
    dispatchHeatwaveEmergencyPushNotification({
      city: selectedCity,
      dryBulbTemp: weather.dryBulbTemp,
      wbgt: weather.wbgt,
      heatIndex: weather.heatIndex,
      isDrill: true,
      scenario: activeScenario,
      onNavigateToGuidance,
    });
    setNotificationPromptSent(true);
    setTimeout(() => setNotificationPromptSent(false), 4000);
  };

  return (
    <aside
      id="heatwave-drill-simulation-banner"
      role="region"
      aria-label="Heatwave Emergency Simulation Drill"
      className="w-full bg-gradient-to-r from-[#7F1D1D] via-[#991B1B] to-[#7F1D1D] text-white border-b-2 border-[#EF4444] shadow-lg sticky top-[57px] sm:top-[61px] z-30 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="w-full px-3 sm:px-6 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Simulation Indicator & Scenario Info */}
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 border border-red-400 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Flame className="w-5 h-5 text-yellow-300" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-yellow-400 text-black font-extrabold text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                  <Radio className="w-3 h-3 text-red-700 animate-spin" />
                  {isHindi ? 'लाइव हीटवेव सिमुलेशन ड्रिल सक्रिय' : 'LIVE HEATWAVE DRILL ACTIVE'}
                </span>
                <span className="text-red-200 text-xs font-mono">
                  [DEMO & JUDGE EVALUATION MODE]
                </span>
              </div>

              <div className="text-xs sm:text-sm font-semibold text-white mt-0.5 flex flex-wrap items-center gap-2">
                <span>{isHindi ? activeScenario.nameHi : activeScenario.name}</span>
                <span className="font-mono text-yellow-300 text-xs bg-black/30 px-1.5 py-0.2 rounded border border-white/20">
                  {weather.dryBulbTemp}°C • WBGT {weather.wbgt}°C • HI {weather.heatIndex}°C
                </span>
              </div>
            </div>
          </div>

          {/* Center: Scenario Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-mono text-red-200 font-bold uppercase hidden xl:inline">
              Scenarios:
            </span>
            {DRILL_SCENARIOS.map((scenario) => {
              const isSelected = activeScenario.id === scenario.id;
              return (
                <button
                  key={scenario.id}
                  onClick={() => onSelectScenario(scenario)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-yellow-400 text-black border-yellow-300 shadow-md scale-105'
                      : 'bg-black/30 text-white hover:bg-black/50 border-white/20'
                  }`}
                  title={scenario.description}
                >
                  {scenario.shortTag}
                </button>
              );
            })}
          </div>

          {/* Right: Actions (Push Notification, Guidance, Exit) */}
          <div className="flex items-center gap-2 shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-red-700/60 justify-between sm:justify-end">
            
            {/* Device Push Notification Trigger */}
            <button
              id="drill-send-push-btn"
              onClick={handleTestPushNotification}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold font-mono transition-all shadow-md active:scale-95 cursor-pointer"
              title="Trigger real-time emergency push alert on your active device (mobile, PC, or laptop)"
            >
              <Bell className="w-3.5 h-3.5 text-red-700" />
              <span>{notificationPromptSent ? '✓ Alert Sent!' : isHindi ? 'परीक्षण अलर्ट भेजें' : 'Send Test Alert'}</span>
            </button>

            {/* View Safety Guidance */}
            <button
              onClick={onNavigateToGuidance}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Open full safety protocol and triage steps"
            >
              <span>{isHindi ? 'दिशानिर्देश' : 'Guidance'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Exit Drill */}
            <button
              onClick={onExitDrill}
              className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/20 text-white hover:text-red-200 transition-colors cursor-pointer"
              title={isHindi ? 'ड्रिल मोड से बाहर निकलें' : 'Exit Heatwave Drill Mode'}
              aria-label="Exit Drill Mode"
            >
              <X className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </aside>
  );
};
