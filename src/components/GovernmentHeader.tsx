import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  ChevronDown,
  PhoneCall,
  Menu,
  ShieldCheck,
  Lock,
  Compass,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
  HelpCircle,
  Eye,
  Volume2,
  X,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { WeatherTelemetry, LanguageCode, UserRole, NavigationTab } from '../types';
import { CityData } from '../data/indiaCities';

interface GovernmentHeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
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
  onOpenEmergencyContacts: () => void;
  fontSizeLevel?: number;
  onChangeFontSize?: (level: number) => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  onAnnounceAlert?: () => void;
  onOpenMobileMenu?: () => void;
  isDrillModeActive?: boolean;
  onToggleDrillMode?: () => void;
}

export const GovernmentHeader: React.FC<GovernmentHeaderProps> = ({
  currentTab,
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
  onOpenEmergencyContacts,
  isHighContrast,
  onToggleHighContrast,
  isDrillModeActive = false,
  onToggleDrillMode,
}) => {
  const [isEmergencyDropdownOpen, setIsEmergencyDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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

  const navItems: Array<{ id: NavigationTab; labelEn: string; labelHi: string; badge?: string }> = [
    { id: 'home', labelEn: 'Home', labelHi: 'होम' },
    { id: 'live-risk', labelEn: 'Live Heat Risk', labelHi: 'लाइव हीट रिस्क', badge: 'GIS' },
    { id: 'forecasts', labelEn: 'Forecasts', labelHi: 'पूर्वानुमान' },
    { id: 'health-guidance', labelEn: 'Health Guidance', labelHi: 'स्वास्थ्य दिशानिर्देश' },
    { id: 'district-dashboard', labelEn: 'District Dashboard', labelHi: 'जिला डैशबोर्ड', badge: 'Official' },
    { id: 'reports-data', labelEn: 'Resources & Data', labelHi: 'संसाधन एवं डेटा' },
    { id: 'about', labelEn: 'About System', labelHi: 'प्रणाली परिचय' },
  ];

  const normalizeActiveTab = (tab: NavigationTab): NavigationTab => {
    if (tab === 'overview') return 'home';
    if (tab === 'cooling-finder') return 'live-risk';
    if (tab === 'forecast') return 'forecasts';
    if (tab === 'protocols') return 'health-guidance';
    return tab;
  };

  const activeTabNormalized = normalizeActiveTab(currentTab);

  return (
    <header id="national-government-portal-header" className="w-full bg-[#0B1F3A] text-white select-none sticky top-0 z-40 shadow-sm border-b border-[#135A9C]">
      
      {/* 1. TOP GOVERNMENT BAR */}
      <div className="bg-[#071527] text-[#D9E2EC] border-b border-[#135A9C]/40 text-xs px-3 sm:px-6 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Department / Ministry Identity */}
          <div className="flex items-center gap-2 truncate">
            {/* National Emblem SVG representation */}
            <div className="w-4 h-4 rounded-full border border-[#D9E2EC]/50 flex items-center justify-center shrink-0" title="Government of India Emblem">
              <span className="text-[10px] font-bold text-[#F4A62A]">☸</span>
            </div>
            <span className="font-medium truncate text-[11px] sm:text-xs">
              {isHindi 
                ? 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय / राष्ट्रीय आपदा प्रबंधन प्राधिकरण • भारत सरकार' 
                : 'Ministry of Health & Family Welfare / National Disaster Management Authority • Government of India'}
            </span>
          </div>

          {/* Accessibility & Language Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs">
            
            {/* High Contrast Mode */}
            <button
              onClick={onToggleHighContrast}
              className={`hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] border cursor-pointer ${
                isHighContrast 
                  ? 'bg-[#F4A62A] text-[#0B1F3A] font-bold border-white' 
                  : 'bg-[#0B1F3A] text-[#D9E2EC] border-[#135A9C]/60 hover:text-white'
              }`}
              title={isHindi ? 'उच्च कंट्रास्ट मोड' : 'Toggle High Contrast'}
            >
              <Eye className="w-3 h-3" />
              <span>{isHindi ? 'कंट्रास्ट' : 'Contrast'}</span>
            </button>

            {/* Emergency Helpline Numbers Link */}
            <div className="relative" ref={emergencyRef}>
              <button
                onClick={() => setIsEmergencyDropdownOpen(!isEmergencyDropdownOpen)}
                className="flex items-center gap-1 text-[11px] sm:text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#C7352B] text-white hover:bg-[#A82B23] transition-colors cursor-pointer"
                title="National Emergency Numbers"
              >
                <PhoneCall className="w-3 h-3" />
                <span>108 / 112 / 1078</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>

              {/* Emergency Contacts Popup */}
              {isEmergencyDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white text-[#17202A] border border-[#D9E2EC] rounded shadow-lg p-3 z-50 text-xs">
                  <div className="font-bold text-[#0B1F3A] border-b border-[#D9E2EC] pb-1.5 mb-2 flex items-center justify-between">
                    <span>{isHindi ? 'राष्ट्रीय आपातकालीन हेल्पलाइन' : 'National Emergency Helplines'}</span>
                    <button 
                      onClick={() => setIsEmergencyDropdownOpen(false)}
                      className="text-[#526273] hover:text-black"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-1.5 rounded bg-[#F5F8FB]">
                      <div>
                        <span className="font-bold text-[#C7352B]">108</span>
                        <p className="text-[11px] text-[#526273]">{isHindi ? 'एम्बुलेंस / हीट स्ट्रोक' : 'Ambulance / Heat Stroke'}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsEmergencyDropdownOpen(false);
                          onTriggerSOS('108');
                        }}
                        className="px-2 py-0.5 rounded bg-[#C7352B] hover:bg-[#A82B23] text-white font-bold text-[11px] cursor-pointer"
                      >
                        Dial
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded bg-[#F5F8FB]">
                      <div>
                        <span className="font-bold text-[#135A9C]">112</span>
                        <p className="text-[11px] text-[#526273]">{isHindi ? 'अखिल भारतीय आपातकालीन' : 'All-India National Emergency'}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsEmergencyDropdownOpen(false);
                          onTriggerSOS('112');
                        }}
                        className="px-2 py-0.5 rounded bg-[#135A9C] hover:bg-[#0F477D] text-white font-bold text-[11px] cursor-pointer"
                      >
                        Dial
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded bg-[#F5F8FB]">
                      <div>
                        <span className="font-bold text-[#16804A]">1078</span>
                        <p className="text-[11px] text-[#526273]">{isHindi ? 'एनडीएमए राष्ट्रीय आपदा नियंत्रण' : 'NDMA Disaster & Heat Helpline'}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsEmergencyDropdownOpen(false);
                          onTriggerSOS('1078');
                        }}
                        className="px-2 py-0.5 rounded bg-[#16804A] hover:bg-[#12663B] text-white font-bold text-[11px] cursor-pointer"
                      >
                        Dial
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center border border-[#135A9C]/60 rounded overflow-hidden">
              <button
                onClick={() => onChangeLanguage('en')}
                className={`px-1.5 py-0.5 text-[11px] font-semibold cursor-pointer ${
                  language === 'en' ? 'bg-[#135A9C] text-white' : 'text-[#D9E2EC] hover:bg-[#0B1F3A]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onChangeLanguage('hi')}
                className={`px-1.5 py-0.5 text-[11px] font-semibold cursor-pointer ${
                  language === 'hi' ? 'bg-[#135A9C] text-white' : 'text-[#D9E2EC] hover:bg-[#0B1F3A]'
                }`}
              >
                हिन्दी
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 2. MAIN BRAND & IDENTITY BAR */}
      <div className="px-3 sm:px-6 py-2.5 max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Authority Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            {/* Institutional Seal Badge */}
            <div className="w-10 h-10 rounded bg-[#135A9C] border border-[#D9E2EC]/30 flex flex-col items-center justify-center text-white shrink-0 shadow-xs">
              <span className="text-xs font-bold font-mono tracking-tighter text-[#F4A62A]">IMD</span>
              <span className="text-[8px] tracking-widest text-[#D9E2EC] font-semibold uppercase">NDMA</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-base sm:text-lg tracking-tight text-white">
                  {isHindi ? 'राष्ट्रीय ताप स्वास्थ्य पूर्व चेतावनी प्रणाली' : 'National Heat Health Early Warning System'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#135A9C] text-white font-semibold hidden md:inline">
                  OFFICIAL
                </span>
              </div>
              <p className="text-xs text-[#D9E2EC] font-sans font-normal">
                {isHindi 
                  ? 'हीटशील्ड एआई बायोमेटियोरोलॉजिकल मॉडलिंग द्वारा संचालित' 
                  : 'Powered by HeatShield AI Biometeorological Modeling'}
              </p>
            </div>
          </button>
        </div>

        {/* Location Selector & Station Info & Drill Mode (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          
          {/* Location Selector */}
          <button
            onClick={onOpenCitySelector}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#071527] hover:bg-[#135A9C]/40 border border-[#135A9C] text-white text-xs transition-colors cursor-pointer"
            title="Select District or Weather Station"
          >
            <MapPin className="w-3.5 h-3.5 text-[#F4A62A] shrink-0" />
            <span className="font-semibold text-white">
              {selectedCity.name}, {selectedCity.state}
            </span>
            <span className="font-mono font-bold bg-[#135A9C] px-1.5 py-0.2 rounded text-white text-[11px]">
              {weather.dryBulbTemp}°C
            </span>
            <span className="text-[11px] text-[#D9E2EC] font-mono">
              WBGT {weather.wbgt}°C
            </span>
            <ChevronDown className="w-3 h-3 text-[#D9E2EC]" />
          </button>

          {/* GPS Auto-locate */}
          <button
            onClick={onCheckMyLocation}
            className="p-1.5 rounded bg-[#071527] hover:bg-[#135A9C]/40 border border-[#135A9C] text-[#D9E2EC] hover:text-white cursor-pointer"
            title="Locate nearest station via GPS"
          >
            <Compass className="w-4 h-4 text-[#F4A62A]" />
          </button>

          {/* Heatwave Drill Mode Toggle Button */}
          {onToggleDrillMode && (
            <button
              onClick={onToggleDrillMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold font-mono transition-all cursor-pointer border ${
                isDrillModeActive
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-400 shadow-md animate-pulse'
                  : 'bg-[#071527] hover:bg-red-950/60 text-[#F4A62A] hover:text-white border-[#135A9C]'
              }`}
              title="Toggle Heatwave Simulation Drill (Demonstration & Judge Mode)"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
              <span>{isDrillModeActive ? '🚨 DRILL ACTIVE' : '🚨 HEATWAVE DRILL'}</span>
            </button>
          )}

        </div>

        {/* Right Side Actions: Sign In / Officer Mode + Mobile Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Official Sign In Button */}
          {isAdminAuthenticated ? (
            <button
              onClick={onLockAdminSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#16804A] hover:bg-[#126b3e] text-white text-xs font-semibold cursor-pointer shadow-xs"
              title="Lock official session and return to public mode"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">{isHindi ? 'अधिकारी सक्रिय' : 'Officer Active'}</span>
              <Lock className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={onOpenAdminAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#135A9C] hover:bg-[#0f487d] text-white text-xs font-medium border border-[#D9E2EC]/30 cursor-pointer shadow-xs"
              title="Sign In for Authorized Government & Health Officials"
            >
              <Lock className="w-3.5 h-3.5 text-[#F4A62A]" />
              <span className="hidden sm:inline">{isHindi ? 'अधिकारी लॉगिन' : 'Official Sign In'}</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="lg:hidden p-2 rounded bg-[#071527] border border-[#135A9C] text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* 2.5. MOBILE FRONT LOCATION & DRILL BAR (Always Visible in Front on Mobile/Tablet) */}
      <div className="lg:hidden bg-[#071527] border-t border-[#135A9C]/50 px-3 py-1.5 flex items-center justify-between gap-2">
        
        {/* Front Mobile Location Selector Pill */}
        <button
          onClick={onOpenCitySelector}
          className="flex-1 flex items-center justify-between px-2.5 py-1.5 rounded bg-[#0B1F3A] hover:bg-[#135A9C]/40 border border-[#135A9C] text-white text-xs transition-colors cursor-pointer min-w-0"
          title="Tap to change city or district"
        >
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#F4A62A] shrink-0" />
            <span className="font-semibold text-white truncate text-[11px] sm:text-xs">
              {selectedCity.name}, {selectedCity.state}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            <span className="font-mono font-bold bg-[#135A9C] px-1.5 py-0.2 rounded text-white text-[10px] sm:text-[11px]">
              {weather.dryBulbTemp}°C
            </span>
            <ChevronDown className="w-3 h-3 text-[#D9E2EC]" />
          </div>
        </button>

        {/* GPS Quick Button */}
        <button
          onClick={onCheckMyLocation}
          className="p-1.5 rounded bg-[#0B1F3A] hover:bg-[#135A9C]/40 border border-[#135A9C] text-[#F4A62A] shrink-0 cursor-pointer"
          title="Locate via GPS"
          aria-label="Locate nearest station"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Mobile Heatwave Drill Toggle Button */}
        {onToggleDrillMode && (
          <button
            onClick={onToggleDrillMode}
            className={`px-2.5 py-1.5 rounded text-[11px] font-mono font-bold shrink-0 transition-all cursor-pointer border flex items-center gap-1 ${
              isDrillModeActive
                ? 'bg-red-600 text-white border-red-400 shadow-sm animate-pulse'
                : 'bg-[#0B1F3A] text-yellow-400 hover:text-white border-[#135A9C]'
            }`}
            title="Heatwave Emergency Drill Mode"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>{isDrillModeActive ? 'DRILL ON' : 'DRILL'}</span>
          </button>
        )}

      </div>

      {/* 3. MAIN HORIZONTAL NAVIGATION BAR */}
      <nav className="hidden lg:block border-t border-[#135A9C]/50 bg-[#071527] px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {navItems.map((item) => {
              const isActive = activeTabNormalized === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#135A9C] text-white font-bold shadow-xs'
                      : 'text-[#D9E2EC] hover:text-white hover:bg-[#0B1F3A]'
                  }`}
                >
                  <span>{isHindi ? item.labelHi : item.labelEn}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1 rounded font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#135A9C]/50 text-[#D9E2EC]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 py-1">
            <span className="text-[11px] font-mono text-[#D9E2EC] hidden xl:inline">
              Data: IMD & INSAT-3D • Updated: 10:30 AM IST
            </span>
          </div>

        </div>
      </nav>

      {/* 4. MOBILE ACCORDION NAVIGATION DRAWER */}
      {isMobileNavOpen && (
        <div className="lg:hidden border-t border-[#135A9C] bg-[#071527] p-3 space-y-2">
          
          {/* Mobile Location Selector */}
          <button
            onClick={() => {
              setIsMobileNavOpen(false);
              onOpenCitySelector();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded bg-[#0B1F3A] border border-[#135A9C] text-white text-xs"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#F4A62A]" />
              <span>{selectedCity.name}, {selectedCity.state}</span>
            </div>
            <span className="font-mono font-bold bg-[#135A9C] px-1.5 py-0.5 rounded">
              {weather.dryBulbTemp}°C
            </span>
          </button>

          {/* Nav Items */}
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const isActive = activeTabNormalized === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-medium flex items-center justify-between ${
                    isActive ? 'bg-[#135A9C] text-white font-bold' : 'text-[#D9E2EC] hover:bg-[#0B1F3A]'
                  }`}
                >
                  <span>{isHindi ? item.labelHi : item.labelEn}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1 rounded bg-white/10 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-[#135A9C] flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsMobileNavOpen(false);
                onTriggerSOS();
              }}
              className="flex-1 py-2 rounded bg-[#C7352B] text-white text-center font-bold text-xs"
            >
              108 SOS Medical Help
            </button>
            <button
              onClick={() => {
                setIsMobileNavOpen(false);
                onCheckMyLocation();
              }}
              className="px-3 py-2 rounded bg-[#135A9C] text-white text-center font-semibold text-xs"
            >
              Locate Me
            </button>
          </div>

        </div>
      )}

    </header>
  );
};
