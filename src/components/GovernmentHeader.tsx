import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  ChevronDown,
  PhoneCall,
  ShieldCheck,
  Lock,
  Compass,
  AlertTriangle,
  Eye,
  X,
  Maximize2,
  Minimize2,
  Radio,
  ExternalLink
} from 'lucide-react';
import { WeatherTelemetry, LanguageCode, UserRole, NavigationTab } from '../types';
import { CityData } from '../data/indiaCities';

export interface GovernmentHeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userRole?: UserRole;
  onChangeRole?: (role: UserRole) => void;
  isAdminAuthenticated?: boolean;
  onOpenAdminAuthModal?: () => void;
  onLockAdminSession?: () => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  weather: WeatherTelemetry;
  selectedCity: CityData;
  onOpenCitySelector: () => void;
  onCheckMyLocation: () => void;
  onTriggerSOS: (type?: '108' | '112' | '1078') => void;
  onOpenEmergencyContacts?: () => void;
  fontSizeLevel?: number;
  onChangeFontSize?: (level: number) => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  onAnnounceAlert?: () => void;
  onOpenMobileMenu?: () => void;
  isDrillModeActive?: boolean;
  onToggleDrillMode?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenAiCall?: () => void;
  onOpenAiCallSettings?: () => void;
}

export const GovernmentHeader: React.FC<GovernmentHeaderProps> = ({
  onSelectTab,
  isAdminAuthenticated = false,
  onOpenAdminAuthModal,
  onLockAdminSession,
  language,
  onChangeLanguage,
  weather,
  selectedCity,
  onOpenCitySelector,
  onCheckMyLocation,
  onTriggerSOS,
  isHighContrast,
  onToggleHighContrast,
  isDrillModeActive = false,
  onToggleDrillMode,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenAiCall,
  onOpenAiCallSettings,
}) => {
  const [isEmergencyDropdownOpen, setIsEmergencyDropdownOpen] = useState(false);
  const emergencyRef = useRef<HTMLDivElement>(null);
  const isHindi = language === 'hi';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emergencyRef.current && !emergencyRef.current.contains(e.target as Node)) {
        setIsEmergencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header id="national-government-portal-header" className="w-full bg-[#081B34] text-white select-none sticky top-0 z-40 shadow-md border-b border-[#1A3F6D]">

      {/* 1. TOP STATUTORY CITIZEN BAR (Fluid Full Width) */}
      <div className="bg-[#051122] text-[#CBD5E1] border-b border-[#143257] text-xs px-3 sm:px-6 py-1.5 w-full">
        <div className="w-full flex items-center justify-between gap-3">
          
          {/* Department / Ministry Identity */}
          <div className="flex items-center gap-2 truncate">
            <div 
              className="w-4 h-4 rounded-full border border-[#E5A93C]/70 flex items-center justify-center shrink-0 bg-[#0B2548] shadow-xs" 
              title="National Climate & Health Network"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#E5A93C]" fill="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                <path d="M12 2 L12 22 M2 12 L22 12 M5 5 L19 19 M5 19 L19 5" stroke="currentColor" strokeWidth="0.8" />
              </svg>
            </div>
            <span className="font-medium truncate text-[11px] sm:text-xs tracking-tight text-[#E2E8F0]">
              {isHindi 
                ? 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय • राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA) • भारत मौसम विज्ञान विभाग (IMD)' 
                : 'Ministry of Health & Family Welfare · NDMA · India Meteorological Department'}
            </span>
          </div>

          {/* Quick Tools: Fullscreen, High Contrast, Emergency, Language */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 text-xs">
            
            {/* Full Screen Mode Toggle Button */}
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border border-[#1E4373] bg-[#0A1D36] hover:bg-[#135A9C] text-[#CBD5E1] hover:text-white transition-colors cursor-pointer"
                title={isFullscreen ? (isHindi ? 'पूर्ण स्क्रीन बंद करें' : 'Exit Fullscreen') : (isHindi ? 'पूर्ण स्क्रीन मोड' : 'Enter Fullscreen')}
              >
                {isFullscreen ? <Minimize2 className="w-3 h-3 text-[#E5A93C]" /> : <Maximize2 className="w-3 h-3 text-[#E5A93C]" />}
                <span className="hidden md:inline">{isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
              </button>
            )}

            {/* High Contrast Mode Toggle */}
            <button
              onClick={onToggleHighContrast}
              className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                isHighContrast 
                  ? 'bg-[#E5A93C] text-[#081B34] font-bold border-white shadow-xs' 
                  : 'bg-[#0A1D36] text-[#CBD5E1] border-[#1E4373] hover:text-white hover:bg-[#135A9C]/50'
              }`}
              title={isHindi ? 'उच्च कंट्रास्ट मोड' : 'Toggle High Contrast (WCAG 2.1 AAA)'}
            >
              <Eye className="w-3 h-3" />
              <span>{isHindi ? 'कंट्रास्ट' : 'Contrast'}</span>
            </button>

            {/* AI Call Assistant Auto-Active Button */}
            {onOpenAiCall && (
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenAiCall}
                  className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold px-2 sm:px-2.5 py-0.5 rounded bg-gradient-to-r from-[#0284C7] to-[#2563EB] hover:from-[#0369A1] hover:to-[#1D4ED8] text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                  title={isHindi ? 'एआई आपातकालीन कॉल सहायक (अस्पताल/शीतलन केंद्र आरक्षण)' : 'AI Heatwave Safety Call Assistant (Hospital/Shelter/Tanker IVR)'}
                >
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                  <PhoneCall className="w-3 h-3 text-[#E0F2FE]" />
                  <span className="hidden md:inline">{isHindi ? 'एआई कॉल सहायक' : 'AI Call Assistant'}</span>
                  <span className="md:hidden">{isHindi ? 'कॉल' : 'AI Call'}</span>
                </button>
                {onOpenAiCallSettings && (
                  <button
                    onClick={onOpenAiCallSettings}
                    className="p-1 rounded text-[#94A3B8] hover:text-white bg-[#0A1D36] border border-[#1E4373] hover:bg-[#135A9C] cursor-pointer"
                    title={isHindi ? 'कॉल सेटिंग्स' : 'Call Settings'}
                  >
                    <Radio className="w-3 h-3 text-[#38BDF8]" />
                  </button>
                )}
              </div>
            )}

            {/* Emergency Helpline Numbers Link */}
            <div className="relative" ref={emergencyRef}>
              <button
                onClick={() => setIsEmergencyDropdownOpen(!isEmergencyDropdownOpen)}
                className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[#C7352B] hover:bg-[#A8251C] text-white shadow-xs transition-colors cursor-pointer"
                title="Immediate National Heatwave & Medical Helplines"
              >
                <PhoneCall className="w-3 h-3 animate-pulse" />
                <span>108 / 112 / 1078</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>

              {/* Emergency Contacts Popup */}
              {isEmergencyDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white text-[#0F172A] border border-[#CBD5E1] rounded-lg shadow-xl p-3.5 z-50 text-xs">
                  <div className="font-bold text-[#081B34] border-b border-[#E2E8F0] pb-2 mb-2.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-[#C7352B]" />
                      <span>{isHindi ? 'राष्ट्रीय आपातकालीन हेल्पलाइन' : 'Statutory Emergency Helplines'}</span>
                    </span>
                    <button 
                      onClick={() => setIsEmergencyDropdownOpen(false)}
                      className="text-[#64748B] hover:text-[#0F172A] p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div>
                        <span className="font-mono font-bold text-[#C7352B] text-sm">108</span>
                        <p className="text-[11px] text-[#475569] font-medium">{isHindi ? 'एम्बुलेंस / हीट स्ट्रोक आईसीयू' : 'Ambulance & Heat Stroke Emergency'}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsEmergencyDropdownOpen(false);
                          onTriggerSOS('108');
                        }}
                        className="px-2.5 py-1 rounded bg-[#C7352B] hover:bg-[#A8251C] text-white font-bold text-[11px] cursor-pointer shadow-xs"
                      >
                        Dial
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div>
                        <span className="font-mono font-bold text-[#135A9C] text-sm">112</span>
                        <p className="text-[11px] text-[#475569] font-medium">{isHindi ? 'अखिल भारतीय आपातकालीन केंद्र' : 'All-India Universal Emergency Response'}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsEmergencyDropdownOpen(false);
                          onTriggerSOS('112');
                        }}
                        className="px-2.5 py-1 rounded bg-[#135A9C] hover:bg-[#0D4578] text-white font-bold text-[11px] cursor-pointer shadow-xs"
                      >
                        Dial
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div>
                        <span className="font-mono font-bold text-[#16804A] text-sm">1078</span>
                        <p className="text-[11px] text-[#475569] font-medium">{isHindi ? 'एनडीएमए राष्ट्रीय आपदा नियंत्रण कक्ष' : 'NDMA National Heatwave Control Room'}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsEmergencyDropdownOpen(false);
                          onTriggerSOS('1078');
                        }}
                        className="px-2.5 py-1 rounded bg-[#16804A] hover:bg-[#11663A] text-white font-bold text-[11px] cursor-pointer shadow-xs"
                      >
                        Dial
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center border border-[#1E4373] rounded bg-[#0A1D36] p-0.5">
              <button
                onClick={() => onChangeLanguage('en')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                  language === 'en' ? 'bg-[#135A9C] text-white shadow-xs' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onChangeLanguage('hi')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                  language === 'hi' ? 'bg-[#135A9C] text-white shadow-xs' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 2. MAIN BRAND & EXECUTIVE COMMAND BAR */}
      <div className="px-3 sm:px-6 py-2.5 w-full flex items-center justify-between gap-4">
        
        {/* Left Side: Institutional Identity */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 text-left group cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectTab('home');
            }
          }}
          title="Return to National Surveillance Portal Home"
        >
          {/* Institutional Seal Badge */}
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#0F3563] to-[#0A2242] border border-[#2B5E9E] flex flex-col items-center justify-center text-white shrink-0 shadow-md group-hover:border-[#E5A93C] transition-all">
            <span className="text-xs font-extrabold font-mono tracking-tighter text-[#E5A93C]">IMD</span>
            <span className="text-[8px] tracking-widest text-[#93C5FD] font-bold uppercase">NDMA</span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline font-extrabold text-base sm:text-lg tracking-tight text-white leading-tight group-hover:text-[#E5A93C] transition-colors">
                {isHindi ? 'राष्ट्रीय ताप स्वास्थ्य पूर्व चेतावनी प्रणाली' : 'National Heat Health Early Warning System'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#135A9C]/80 border border-[#2A75BE] text-white font-bold hidden md:inline-flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                SURVEILLANCE NETWORK
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] font-sans font-normal leading-tight mt-0.5">
              {isHindi 
                ? 'स्वास्थ्य मंत्रालय, एनडीएमए एवं आईएमडी का आधिकारिक संयुक्त उपक्रम' 
                : 'Ministry of Health & Family Welfare · NDMA · IMD Joint Biometeorological Surveillance'}
            </p>
          </div>
        </div>

        {/* Location Selector & Station Info & Drill Mode (Desktop/Tablet) */}
        <div className="hidden sm:flex items-center gap-2.5">
          
          {/* Location Selector */}
          <button
            onClick={onOpenCitySelector}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#051427] hover:bg-[#0B2548] border border-[#1D4A7E] text-white text-xs transition-all cursor-pointer shadow-xs group"
            title="Click to switch district or weather station"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] live-radar-indicator" />
              <MapPin className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
            </div>
            <span className="font-semibold text-white tracking-tight">
              {selectedCity.name}, {selectedCity.state}
            </span>
            <span className="font-mono font-bold bg-[#135A9C] px-2 py-0.5 rounded text-white text-[11px] shadow-xs">
              {weather.dryBulbTemp}°C
            </span>
            <span className="text-[11px] text-[#93C5FD] font-mono hidden md:inline font-medium">
              WBGT {weather.wbgt}°C
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-white transition-colors" />
          </button>

          {/* GPS Auto-locate */}
          <button
            onClick={onCheckMyLocation}
            className="p-2 rounded-lg bg-[#051427] hover:bg-[#0B2548] border border-[#1D4A7E] text-[#94A3B8] hover:text-[#E5A93C] transition-colors cursor-pointer shadow-xs"
            title="Detect current GPS location"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Heatwave Drill Mode Toggle Button */}
          {onToggleDrillMode && (
            <button
              onClick={onToggleDrillMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer border shadow-xs ${
                isDrillModeActive
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-300 shadow-md animate-pulse'
                  : 'bg-[#051427] hover:bg-red-950/60 text-[#E5A93C] hover:text-white border-[#1D4A7E]'
              }`}
              title="Toggle Heatwave Simulation Drill Mode"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
              <span>{isDrillModeActive ? '🚨 DRILL ACTIVE' : '🚨 HEATWAVE DRILL'}</span>
            </button>
          )}

        </div>

        {/* Right Side: Sign In / Officer Mode */}
        <div className="flex items-center gap-2 shrink-0">
          {isAdminAuthenticated ? (
            <button
              onClick={onLockAdminSession}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#16804A] hover:bg-[#126b3e] text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors border border-green-400/40"
              title="Lock official session and return to citizen mode"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">{isHindi ? 'अधिकारी सत्र' : 'Officer Active'}</span>
              <Lock className="w-3 h-3 opacity-80" />
            </button>
          ) : (
            <button
              onClick={onOpenAdminAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#135A9C] hover:bg-[#0D4578] text-white text-xs font-medium border border-[#2B6CB0] cursor-pointer shadow-sm transition-all"
              title="Sign In for Authorized Government & District Health Officials"
            >
              <Lock className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span className="hidden sm:inline font-semibold">{isHindi ? 'अधिकारी लॉगिन' : 'Official Sign In'}</span>
              <span className="sm:hidden font-semibold">Sign In</span>
            </button>
          )}
        </div>

      </div>

    </header>
  );
};
