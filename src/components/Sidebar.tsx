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
  Users
} from 'lucide-react';
import { LanguageCode, NavigationTab } from '../types';
import { CityData } from '../data/indiaCities';

interface SidebarProps {
  currentTab: NavigationTab | string;
  onSelectTab: (tabId: NavigationTab) => void;
  language: LanguageCode;
  selectedCity: CityData;
  onOpenCitySelector: () => void;
  unreadAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  language,
  selectedCity,
  onOpenCitySelector,
  unreadAlertCount = 1,
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

  const navItems: Array<{
    id: NavigationTab;
    labelEn: string;
    labelHi: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }> = [
    {
      id: 'home',
      labelEn: 'Home',
      labelHi: 'होम पोर्टल',
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'live-risk',
      labelEn: 'Live Heat Risk',
      labelHi: 'लाइव हीट रिस्क (GIS)',
      icon: <Compass className="w-4 h-4" />,
      badge: 'GIS',
      badgeColor: '#135A9C',
    },
    {
      id: 'forecasts',
      labelEn: 'Forecasts',
      labelHi: '7-दिवसीय पूर्वानुमान',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'health-guidance',
      labelEn: 'Health Guidance',
      labelHi: 'स्वास्थ्य दिशानिर्देश',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'district-dashboard',
      labelEn: 'District Dashboard',
      labelHi: 'जिला संचालन केंद्र',
      icon: <Building2 className="w-4 h-4" />,
      badge: 'Official',
      badgeColor: '#16804A',
    },
    {
      id: 'alerts',
      labelEn: 'Emergency Alerts',
      labelHi: 'सक्रिय आपातकालीन अलर्ट',
      icon: <BellRing className="w-4 h-4" />,
      badge: unreadAlertCount > 0 ? 'ACTIVE' : undefined,
      badgeColor: '#C7352B',
    },
    {
      id: 'health-report',
      labelEn: 'Health Dossier',
      labelHi: 'व्यक्तिगत स्वास्थ्य डॉसियर',
      icon: <HeartPulse className="w-4 h-4" />,
    },
    {
      id: 'reports-data',
      labelEn: 'Resources & Data',
      labelHi: 'संसाधन एवं ओपन एपीआई',
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: 'about',
      labelEn: 'About System',
      labelHi: 'प्रणाली परिचय एवं एआई',
      icon: <HelpCircle className="w-4 h-4" />,
    },
  ];

  return (
    <aside id="government-sidebar-navigation" className="hidden lg:flex flex-col w-64 xl:w-72 bg-[#0B1F3A] border-r border-[#135A9C] p-4 shrink-0 select-none justify-between text-[#D9E2EC]">
      
      <div className="space-y-4">
        {/* Active Station Card */}
        <div 
          onClick={onOpenCitySelector}
          className="p-3 rounded bg-[#071527] border border-[#135A9C] hover:border-[#F4A62A] cursor-pointer transition-colors group shadow-xs"
          title={isHindi ? 'मौसम केंद्र बदलें' : 'Click to change monitoring station'}
        >
          <div className="flex items-center justify-between text-xs text-[#D9E2EC] mb-1">
            <span className="flex items-center gap-1.5 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#16804A]" />
              {isHindi ? 'सक्रिय निगरानी स्टेशन' : 'Active Weather Station'}
            </span>
            <span className="text-[11px] text-[#F4A62A] group-hover:underline flex items-center">
              {isHindi ? 'बदलें' : 'Change'} <ChevronRight className="w-3 h-3 inline" />
            </span>
          </div>
          <div className="font-bold text-white text-sm truncate">
            {selectedCity.name}, {selectedCity.state}
          </div>
          <div className="text-[11px] text-[#D9E2EC] font-mono mt-0.5 truncate flex items-center justify-between">
            <span>{selectedCity.weather.stationId}</span>
            <span className="text-white font-bold bg-[#135A9C] px-1 rounded">{selectedCity.weather.dryBulbTemp}°C</span>
          </div>
        </div>

        {/* Navigation Item Buttons */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeNorm === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs sm:text-sm font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#135A9C] text-white font-bold shadow-xs'
                    : 'text-[#D9E2EC] hover:bg-[#071527] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#F4A62A]' : 'text-[#D9E2EC]'}>
                    {item.icon}
                  </span>
                  <span>{isHindi ? item.labelHi : item.labelEn}</span>
                </div>

                {item.badge && (
                  <span
                    className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded text-white"
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

      {/* Emergency Hotline Strip in Sidebar */}
      <div className="pt-4 border-t border-[#135A9C]/50 space-y-2 text-xs">
        <div className="text-[11px] font-mono text-[#D9E2EC] uppercase tracking-wider">
          {isHindi ? 'राष्ट्रीय आपातकालीन नंबर' : 'National Helplines'}
        </div>

        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between p-1.5 rounded bg-[#071527] border border-[#135A9C]/60">
            <span className="font-bold text-[#C7352B]">108 Ambulance</span>
            <span className="text-[10px] text-[#D9E2EC]">Heat Stroke</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-[#071527] border border-[#135A9C]/60">
            <span className="font-bold text-[#135A9C]">112 Emergency</span>
            <span className="text-[10px] text-[#D9E2EC]">All-Hazards</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded bg-[#071527] border border-[#135A9C]/60">
            <span className="font-bold text-[#16804A]">1078 NDMA</span>
            <span className="text-[10px] text-[#D9E2EC]">Toll-Free</span>
          </div>
        </div>
      </div>

    </aside>
  );
};
