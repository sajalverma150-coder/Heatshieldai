import React from 'react';
import {
  Home,
  Compass,
  FileText,
  AlertTriangle,
  TrendingUp,
  MapPin,
  ChevronRight,
  PhoneCall,
  BellRing,
  Building2,
  Database,
  HelpCircle,
  HeartPulse,
  Radio,
  Layers
} from 'lucide-react';
import { LanguageCode, NavigationTab } from '../types';
import { CityData } from '../data/indiaCities';

export interface SidebarProps {
  currentTab: NavigationTab | string;
  onSelectTab: (tabId: NavigationTab) => void;
  language: LanguageCode;
  selectedCity: CityData;
  onOpenCitySelector: () => void;
  unreadAlertCount?: number;
  onTriggerSOS?: (type?: string) => void;
  isAdminAuthenticated?: boolean;
  onOpenAdminAuthModal?: () => void;
  onLockAdminSession?: () => void;
  isDrillModeActive?: boolean;
  onToggleDrillMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  language,
  selectedCity,
  onOpenCitySelector,
  unreadAlertCount = 1,
  onTriggerSOS,
  isDrillModeActive,
  onToggleDrillMode,
}) => {
  const isHindi = language === 'hi';

  const normalizeTab = (tab: string): string => {
    if (tab === 'overview') return 'home';
    if (tab === 'cooling-finder') return 'live-risk';
    if (tab === 'forecast') return 'forecasts';
    if (tab === 'protocols') return 'health-guidance';
    return tab;
  };

  const activeNorm = normalizeTab(currentTab);

  const navSections: Array<{
    groupTitleEn: string;
    groupTitleHi: string;
    items: Array<{
      id: NavigationTab;
      labelEn: string;
      labelHi: string;
      descriptionEn: string;
      descriptionHi: string;
      icon: React.ReactNode;
      badge?: string;
      badgeColor?: string;
    }>;
  }> = [
    {
      groupTitleEn: 'SURVEILLANCE & FORECAST',
      groupTitleHi: 'निगरानी एवं पूर्वानुमान',
      items: [
        {
          id: 'home',
          labelEn: 'National Overview',
          labelHi: 'राष्ट्रीय अवलोकन',
          descriptionEn: 'Telemetry & Risk Matrix',
          descriptionHi: 'टेलीमेट्री एवं जोखिम मैट्रिक्स',
          icon: <Home className="w-4 h-4" />,
        },
        {
          id: 'live-risk',
          labelEn: 'Live Heat Risk (GIS)',
          labelHi: 'लाइव हीट रिस्क (GIS)',
          descriptionEn: 'Satellite & Thermal Map',
          descriptionHi: 'सैटेलाइट एवं थर्मल मानचित्र',
          icon: <Compass className="w-4 h-4" />,
          badge: 'GIS LIVE',
          badgeColor: '#0284C7',
        },
        {
          id: 'forecasts',
          labelEn: '7-Day Forecasts',
          labelHi: '7-दिवसीय पूर्वानुमान',
          descriptionEn: 'IMD Station & Biomet Horizon',
          descriptionHi: 'आईएमडी स्टेशन एवं बायोमेट',
          icon: <TrendingUp className="w-4 h-4" />,
        },
      ],
    },
    {
      groupTitleEn: 'CLINICAL & DISTRICT OPS',
      groupTitleHi: 'चिकित्सीय एवं जिला संचालन',
      items: [
        {
          id: 'health-guidance',
          labelEn: 'Health Guidance',
          labelHi: 'स्वास्थ्य दिशानिर्देश',
          descriptionEn: 'Clinical Triage & Prevention',
          descriptionHi: 'चिकित्सीय ट्राइएज एवं रोकथाम',
          icon: <FileText className="w-4 h-4" />,
        },
        {
          id: 'district-dashboard',
          labelEn: 'District Operations',
          labelHi: 'जिला नियंत्रण केंद्र',
          descriptionEn: 'Shelters, Bowsers & Curfew',
          descriptionHi: 'आश्रय, टैंकर एवं कार्य प्रतिबंध',
          icon: <Building2 className="w-4 h-4" />,
          badge: 'DEOC',
          badgeColor: '#16804A',
        },
        {
          id: 'alerts',
          labelEn: 'Emergency Alerts',
          labelHi: 'आपातकालीन अलर्ट',
          descriptionEn: 'Active Heatwave Bulletins',
          descriptionHi: 'सक्रिय हीटवेव बुलेटिन',
          icon: <BellRing className="w-4 h-4" />,
          badge: unreadAlertCount > 0 ? 'ALERT' : undefined,
          badgeColor: '#C7352B',
        },
      ],
    },
    {
      groupTitleEn: 'HEALTH DOSSIER & ARCHIVE',
      groupTitleHi: 'स्वास्थ्य डॉसियर एवं डेटा संग्रह',
      items: [
        {
          id: 'health-report',
          labelEn: 'Personal Health Dossier',
          labelHi: 'व्यक्तिगत स्वास्थ्य डॉसियर',
          descriptionEn: 'Physiological Heat Vulnerability',
          descriptionHi: 'शारीरिक ताप संवेदनशीलता',
          icon: <HeartPulse className="w-4 h-4" />,
        },
        {
          id: 'reports-data',
          labelEn: 'Resources & Open Data',
          labelHi: 'संसाधन एवं ओपन डेटा',
          descriptionEn: 'IMD Data APIs & Policy Docs',
          descriptionHi: 'आईएमडी डेटा एपीआई एवं नीतियां',
          icon: <Database className="w-4 h-4" />,
        },
        {
          id: 'about',
          labelEn: 'Institutional Science',
          labelHi: 'प्रणाली परिचय व विज्ञान',
          descriptionEn: 'AI & Biometeorology Architecture',
          descriptionHi: 'एआई एवं जैव-मौसम विज्ञान',
          icon: <HelpCircle className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <aside
      id="desktop-portal-sidebar"
      aria-label="National Portal Navigation Sidebar"
      className="hidden lg:flex flex-col w-64 xl:w-72 bg-[#061528] border-r border-[#153459] shrink-0 select-none justify-between h-full min-h-full self-stretch sticky top-0 overflow-y-auto text-[#CBD5E1]"
    >
      {/* Top Body: Station Card & Navigation List */}
      <div className="p-3.5 space-y-3.5 flex-1">
        
        {/* Active Weather Station Card */}
        <div
          onClick={onOpenCitySelector}
          className="p-3 rounded-xl bg-gradient-to-br from-[#091F3A] to-[#061528] border border-[#1E4575] hover:border-[#E5A93C] cursor-pointer transition-all group shadow-sm"
          title={isHindi ? 'मौसम केंद्र अथवा जिला बदलें' : 'Click to select district or weather station'}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenCitySelector();
            }
          }}
        >
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-[11px] text-[#CBD5E1]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] live-radar-indicator" />
              <MapPin className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span className="font-semibold text-white">{isHindi ? 'सक्रिय मौसम केंद्र' : 'Active Station'}</span>
            </span>
            <span className="text-[11px] text-[#E5A93C] font-semibold group-hover:underline flex items-center gap-0.5">
              {isHindi ? 'बदलें' : 'Change'} <ChevronRight className="w-3 h-3 inline" />
            </span>
          </div>

          <div className="font-bold text-white text-sm truncate tracking-tight">
            {selectedCity.name}, {selectedCity.state}
          </div>

          <div className="text-[11px] text-[#94A3B8] font-mono mt-1.5 truncate flex items-center justify-between pt-1 border-t border-[#16365C]">
            <span className="truncate">{selectedCity.weather.stationId}</span>
            <span className="text-white font-bold bg-[#135A9C] px-2 py-0.5 rounded text-[10px] shadow-xs">
              {selectedCity.weather.dryBulbTemp}°C · WBGT {selectedCity.weather.wbgt}°C
            </span>
          </div>
        </div>

        {/* Drill Toggle (if available) */}
        {onToggleDrillMode && (
          <button
            onClick={onToggleDrillMode}
            className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold font-mono transition-all cursor-pointer shadow-xs ${
              isDrillModeActive
                ? 'bg-red-600 text-white border-red-300 shadow-md animate-pulse'
                : 'bg-[#091F3A] text-yellow-300 hover:text-white hover:bg-[#0E2C52] border-[#1E4575]'
            }`}
            title="Toggle Heatwave Simulation Drill"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isDrillModeActive ? '🚨 DRILL ACTIVE' : '🚨 HEATWAVE DRILL'}</span>
          </button>
        )}

        {/* Navigation Section Groups */}
        <div className="space-y-4 pt-1">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] px-2 font-bold">
                {isHindi ? section.groupTitleHi : section.groupTitleEn}
              </div>

              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeNorm === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-item-${item.id}`}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-left group ${
                        isActive
                          ? 'border-l-3 border-[#E5A93C] bg-gradient-to-r from-[#135A9C] to-[#0A2548] text-white font-bold shadow-md'
                          : 'text-[#CBD5E1] hover:bg-[#0B213D] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1 rounded ${isActive ? 'bg-[#061528] text-[#E5A93C]' : 'bg-[#091D34] text-[#94A3B8] group-hover:text-white'}`}>
                          {item.icon}
                        </div>
                        <div className="truncate">
                          <div className="truncate leading-tight">{isHindi ? item.labelHi : item.labelEn}</div>
                          <div className="text-[10px] text-[#64748B] truncate group-hover:text-[#94A3B8]">
                            {isHindi ? item.descriptionHi : item.descriptionEn}
                          </div>
                        </div>
                      </div>

                      {item.badge && (
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-white shrink-0 ml-1.5 shadow-xs"
                          style={{ backgroundColor: item.badgeColor || '#135A9C' }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Live System Synchronization & Gateway Node Status */}
        <div className="mt-4 p-2.5 rounded-xl bg-[#040E1B] border border-[#142C4C] space-y-1.5 text-[10px] font-mono">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>IMD AWS Network</span>
            </span>
            <span className="text-green-400 font-semibold">SYNCHRONIZED</span>
          </div>
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>NDMA CAP Gateway</span>
            </span>
            <span className="text-sky-300">ONLINE · v2.6</span>
          </div>
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>WBGT Compute Engine</span>
            </span>
            <span className="text-amber-300">0.4s LATENCY</span>
          </div>
        </div>

      </div>

      {/* Footer Strip: Helplines & Institutional Stamp */}
      <div className="p-3 border-t border-[#153459] bg-[#051122] shrink-0 space-y-2 mt-auto">
        <div className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider font-bold flex items-center justify-between px-0.5">
          <span>{isHindi ? 'राष्ट्रीय आपातकालीन नंबर' : 'STATUTORY HELPLINES'}</span>
          <PhoneCall className="w-3 h-3 text-[#C7352B]" />
        </div>

        <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
          <button
            onClick={() => onTriggerSOS && onTriggerSOS('108')}
            className="p-1.5 rounded-lg bg-[#091F3A] hover:bg-[#C7352B] border border-[#1E4575] hover:border-[#C7352B] text-center transition-all cursor-pointer group shadow-xs"
            title="Dial 108 Ambulance & Heat Stroke Emergency"
          >
            <div className="font-bold text-[#EF4444] group-hover:text-white text-[11px]">108</div>
            <div className="text-[8px] text-[#94A3B8] group-hover:text-white truncate font-sans">Ambulance</div>
          </button>

          <button
            onClick={() => onTriggerSOS && onTriggerSOS('112')}
            className="p-1.5 rounded-lg bg-[#091F3A] hover:bg-[#135A9C] border border-[#1E4575] hover:border-[#135A9C] text-center transition-all cursor-pointer group shadow-xs"
            title="Dial 112 Universal Emergency Response"
          >
            <div className="font-bold text-[#38BDF8] group-hover:text-white text-[11px]">112</div>
            <div className="text-[8px] text-[#94A3B8] group-hover:text-white truncate font-sans">Universal</div>
          </button>

          <button
            onClick={() => onTriggerSOS && onTriggerSOS('1078')}
            className="p-1.5 rounded-lg bg-[#091F3A] hover:bg-[#16804A] border border-[#1E4575] hover:border-[#16804A] text-center transition-all cursor-pointer group shadow-xs"
            title="Dial 1078 NDMA National Heatwave Helpline"
          >
            <div className="font-bold text-[#4ADE80] group-hover:text-white text-[11px]">1078</div>
            <div className="text-[8px] text-[#94A3B8] group-hover:text-white truncate font-sans">NDMA Heat</div>
          </button>
        </div>

        {/* Accreditation Seal */}
        <div className="pt-2 border-t border-[#122A47] text-[10px] text-[#64748B] text-center flex items-center justify-center gap-1.5">
          <span className="text-[#E5A93C]">⚡</span>
          <span>Biometeorological & Public Health Grid</span>
        </div>
      </div>
    </aside>
  );
};
