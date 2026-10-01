import React from 'react';
import { GovernmentHeader } from './GovernmentHeader';
import { WeatherTelemetry, LanguageCode, UserRole, NavigationTab } from '../types';
import { CityData } from '../data/indiaCities';

interface NavbarProps {
  currentTab: string | NavigationTab;
  onSelectTab: (tabId: any) => void;
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
  onRefreshTelemetry?: () => void;
  onTriggerSOS: (type?: any) => void;
  onOpenTriage: () => void;
  onOpenPushSettings?: () => void;
  onOpenHealthReport?: () => void;
  onOpenMobileMenu?: () => void;
  fontSizeLevel?: number;
  onChangeFontSize?: (level: number) => void;
  isHighContrast?: boolean;
  onToggleHighContrast?: () => void;
  onAnnounceAlert?: () => void;
  isDrillModeActive?: boolean;
  onToggleDrillMode?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenAiCall?: () => void;
  onOpenAiCallSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = (props) => {
  return (
    <GovernmentHeader
      currentTab={props.currentTab as NavigationTab}
      onSelectTab={props.onSelectTab}
      userRole={props.userRole}
      onChangeRole={props.onChangeRole}
      isAdminAuthenticated={props.isAdminAuthenticated}
      onOpenAdminAuthModal={props.onOpenAdminAuthModal}
      onLockAdminSession={props.onLockAdminSession}
      language={props.language}
      onChangeLanguage={props.onChangeLanguage}
      weather={props.weather}
      selectedCity={props.selectedCity}
      onOpenCitySelector={props.onOpenCitySelector}
      onCheckMyLocation={props.onOpenCitySelector}
      onTriggerSOS={props.onTriggerSOS}
      onOpenEmergencyContacts={props.onTriggerSOS}
      fontSizeLevel={props.fontSizeLevel ?? 0}
      onChangeFontSize={props.onChangeFontSize ?? (() => {})}
      isHighContrast={props.isHighContrast ?? false}
      onToggleHighContrast={props.onToggleHighContrast ?? (() => {})}
      onAnnounceAlert={props.onAnnounceAlert}
      onOpenMobileMenu={props.onOpenMobileMenu}
      isDrillModeActive={props.isDrillModeActive}
      onToggleDrillMode={props.onToggleDrillMode}
      isFullscreen={props.isFullscreen}
      onToggleFullscreen={props.onToggleFullscreen}
      onOpenAiCall={props.onOpenAiCall}
      onOpenAiCallSettings={props.onOpenAiCallSettings}
    />
  );
};
