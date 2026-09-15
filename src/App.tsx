import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CitySearchSelector } from './components/CitySearchSelector';
import { LiveTelemetryView } from './components/views/LiveTelemetryView';
import { CoolingFinderView } from './components/views/CoolingFinderView';
import { ActionProtocolsView } from './components/views/ActionProtocolsView';
import { PredictiveForecastView } from './components/views/PredictiveForecastView';
import { EmergencyAlertsView } from './components/views/EmergencyAlertsView';
import { PersonalHealthProfileView } from './components/views/PersonalHealthProfileView';
import { HealthReportView } from './components/views/HealthReportView';
import { PublicSafetyHomeView } from './components/views/PublicSafetyHomeView';
import { DistrictOperationsView } from './components/views/DistrictOperationsView';
import { ResourcesDataView } from './components/views/ResourcesDataView';
import { AboutSystemView } from './components/views/AboutSystemView';
import { EmergencyAlertBanner } from './components/EmergencyAlertBanner';
import { GovernmentFooter } from './components/GovernmentFooter';
import { AuthProvider } from './context/AuthContext';
import { TriageModal } from './components/modals/TriageModal';
import { EmergencyCallModal, EmergencyHelplineType } from './components/modals/EmergencyCallModal';
import { HealthReportModal } from './components/modals/HealthReportModal';
import { PushNotificationSettingsModal } from './components/modals/PushNotificationSettingsModal';
import { AdminAuthModal } from './components/modals/AdminAuthModal';
import { AdminLogoutModal } from './components/modals/AdminLogoutModal';
import { HydrationAlertToast } from './components/HydrationAlertToast';
import { PushNotificationBanner } from './components/PushNotificationBanner';
import { HeatwaveDrillBanner } from './components/HeatwaveDrillBanner';
import { RollingHeadlinesTicker } from './components/RollingHeadlinesTicker';
import { getTodayDateString, checkAndResetDailyHydration } from './utils/dateUtils';
import { 
  DRILL_SCENARIOS, 
  DrillScenario, 
  generateDrillTelemetry, 
  generateDrillForecast, 
  dispatchHeatwaveEmergencyPushNotification 
} from './services/drillService';
import { 
  requestNotificationPermission, 
  getNotificationPermission 
} from './services/hydrationNotificationService';
import { 
  NavigationTab, 
  UserRole, 
  LanguageCode, 
  WeatherTelemetry, 
  UserHealthProfile, 
  CoolingFacility,
  ForecastDay 
} from './types';
import { 
  INITIAL_WEATHER_TELEMETRY, 
  INITIAL_USER_PROFILE, 
  COOLING_FACILITIES 
} from './data/mockData';
import { 
  INDIAN_CITIES, 
  CityData, 
  findNearestIndianCity 
} from './data/indiaCities';
import { 
  fetchLiveWeatherFromApi, 
  fetchLiveForecastFromApi, 
  fetchLiveBatchCitiesWeather,
  generateCalibratedCityForecast,
  CityLiveSummary 
} from './services/weatherApiService';
import { speakEmergencyAlert } from './services/hindiSpeechService';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [language, setLanguage] = useState<LanguageCode>('en');
  
  // Admin authentication state - always starts logged out on page reload
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isAdminLogoutOpen, setIsAdminLogoutOpen] = useState<boolean>(false);

  // Accessibility and text-to-speech announcement state
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

  const handleAnnounceAlert = () => {
    const textHi = `सावधान! ${selectedCity.name} के लिए अत्यधिक ताप चेतावनी सक्रिय है। वर्तमान परिवेश तापमान ${weather.dryBulbTemp} डिग्री सेल्सियस है। दोपहर के समय सीधे धूप में जाने से बचें, नियमित जल पिएं और आपातकाल में 108 पर संपर्क करें।`;
    const textEn = `National Weather Service Alert for ${selectedCity.name}: Severe heat conditions in effect. Dry bulb temperature is ${weather.dryBulbTemp} degrees Celsius. Refrain from outdoor activity during midday hours. For medical emergency, call 108.`;

    speakEmergencyAlert({
      textHi,
      textEn,
      language: language === 'hi' ? 'hi' : 'en',
    });
  };

  // Clear any persistent storage on page load/reload to guarantee auto logout on reload
  useEffect(() => {
    localStorage.removeItem('heatshield_admin_auth');
    localStorage.removeItem('heatshield_admin_role');
  }, []);

  const handleAdminSuccess = (role: UserRole) => {
    setIsAdminAuthenticated(true);
    setUserRole(role);
    setIsAdminAuthOpen(false);
  };

  // Called when user clicks "Admin Active" - opens confirmation dialog
  const handleRequestLockAdminSession = () => {
    if (isAdminAuthenticated) {
      setIsAdminLogoutOpen(true);
    } else {
      handleConfirmLogout();
    }
  };

  // Executed when user confirms logout in the modal dialog
  const handleConfirmLogout = () => {
    setIsAdminAuthenticated(false);
    setUserRole('citizen');
    localStorage.removeItem('heatshield_admin_auth');
    localStorage.removeItem('heatshield_admin_role');
    setIsAdminLogoutOpen(false);
  };

  const handleLockAdminSession = handleRequestLockAdminSession;

  const handleChangeRole = (newRole: UserRole) => {
    if (newRole !== 'citizen' && !isAdminAuthenticated) {
      setIsAdminAuthOpen(true);
    } else {
      setUserRole(newRole);
    }
  };
  
  // Active city & GPS selection state (defaults to Unnao)
  const defaultCity = INDIAN_CITIES.find(c => c.id === 'unnao') || INDIAN_CITIES[0];
  const [selectedCity, setSelectedCity] = useState<CityData>(defaultCity);
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState<boolean>(false);
  const [gpsStatusText, setGpsStatusText] = useState<string | null>(null);

  // App telemetry & facilities state
  const [weather, setWeather] = useState<WeatherTelemetry>(defaultCity.weather);
  const [forecastDays, setForecastDays] = useState<ForecastDay[]>(() => 
    (defaultCity as any).forecast || generateCalibratedCityForecast(defaultCity, 7)
  );
  const [batchCitiesWeather, setBatchCitiesWeather] = useState<Record<string, CityLiveSummary>>({});
  const [facilities, setFacilities] = useState<CoolingFacility[]>(defaultCity.coolingFacilities);
  const [dataSourceMode, setDataSourceMode] = useState<'live_api' | 'imd_heatwave'>('live_api');
  const [isLiveApiLoading, setIsLiveApiLoading] = useState<boolean>(false);

  // User profile with automatic new-day hydration reset
  const [userProfile, setUserProfile] = useState<UserHealthProfile>(() => {
    try {
      const saved = localStorage.getItem('heatshield_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        const resetProfile = checkAndResetDailyHydration(parsed);
        if (resetProfile !== parsed) {
          localStorage.setItem('heatshield_user_profile', JSON.stringify(resetProfile));
        }
        return resetProfile;
      }
    } catch (e) {
      // ignore
    }
    const defaultProfile = checkAndResetDailyHydration(INITIAL_USER_PROFILE);
    return defaultProfile;
  });

  // Listener to automatically reset hydration target as soon as a new day starts
  useEffect(() => {
    const checkMidnightReset = () => {
      setUserProfile((prevProfile) => {
        const checked = checkAndResetDailyHydration(prevProfile);
        if (checked !== prevProfile) {
          try {
            localStorage.setItem('heatshield_user_profile', JSON.stringify(checked));
          } catch (e) {
            // ignore
          }
          return checked;
        }
        return prevProfile;
      });
    };

    checkMidnightReset();
    const interval = setInterval(checkMidnightReset, 30000);

    const handleFocus = () => checkMidnightReset();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // Modals state
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [emergencyHelplineType, setEmergencyHelplineType] = useState<EmergencyHelplineType>('108');
  const [isTriageOpen, setIsTriageOpen] = useState<boolean>(false);
  const [isHealthReportOpen, setIsHealthReportOpen] = useState<boolean>(false);
  const [isPushSettingsOpen, setIsPushSettingsOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [userGpsCoords, setUserGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleTriggerSOS = (type: EmergencyHelplineType = '108') => {
    setEmergencyHelplineType(type);
    setIsSOSOpen(true);
  };

  // Function to load weather telemetry for any selected city
  const loadWeatherForCity = async (city: CityData, mode: 'live_api' | 'imd_heatwave' = dataSourceMode) => {
    if (mode === 'live_api') {
      setIsLiveApiLoading(true);
      try {
        const [liveWeather, liveForecast] = await Promise.all([
          fetchLiveWeatherFromApi(city.lat, city.lng, city.weather),
          fetchLiveForecastFromApi(city.lat, city.lng, city.name, city.climateZone),
        ]);
        setWeather(liveWeather);
        setForecastDays(liveForecast);
        setSelectedCity((prev) => ({
          ...prev,
          weather: liveWeather,
          forecast: liveForecast,
        }));
      } catch (err) {
        console.warn('Failed to fetch live API weather, falling back to calibrated IMD station model:', err);
        setWeather(city.weather);
        const calibrated = generateCalibratedCityForecast(city, 7);
        setForecastDays(calibrated);
      } finally {
        setIsLiveApiLoading(false);
      }
    } else {
      setWeather(city.weather);
      const drillForecast = generateCalibratedCityForecast(city, 7);
      setForecastDays(drillForecast);
      setSelectedCity((prev) => ({
        ...prev,
        weather: city.weather,
        forecast: drillForecast,
      }));
    }
  };

  // Initial load of live weather and batch cities on startup
  useEffect(() => {
    loadWeatherForCity(INDIAN_CITIES[0], 'live_api');
    fetchLiveBatchCitiesWeather(INDIAN_CITIES).then((batch) => {
      if (Object.keys(batch).length > 0) {
        setBatchCitiesWeather(batch);
      }
    });
  }, []);

  // Sync batch updates when user toggles to live mode
  useEffect(() => {
    if (dataSourceMode === 'live_api') {
      fetchLiveBatchCitiesWeather(INDIAN_CITIES).then((batch) => {
        if (Object.keys(batch).length > 0) {
          setBatchCitiesWeather(batch);
        }
      });
    }
  }, [dataSourceMode]);

  // Automatic GPS Geolocation Detection on Mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserGpsCoords({ lat: latitude, lng: longitude });
          const { city, distanceKm } = findNearestIndianCity(latitude, longitude);
          
          if (city) {
            setSelectedCity(city);
            setFacilities(city.coolingFacilities);
            setGpsStatusText(`GPS Locked: Nearest Station ${city.name} (${distanceKm} km away)`);
            loadWeatherForCity(city, dataSourceMode);
          }
        },
        (error) => {
          // Gracefully fallback to default city if location is not granted
          console.log('GPS geolocation prompt skipped or denied:', error.message);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
      );
    }
  }, [dataSourceMode]);

  // Sync profile changes to local storage
  const handleUpdateProfile = (updated: UserHealthProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem('heatshield_user_profile', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const [activeNavFacility, setActiveNavFacility] = useState<CoolingFacility | null>(null);

  const handleSelectCity = (city: CityData) => {
    setSelectedCity(city);
    setFacilities(city.coolingFacilities);
    setActiveNavFacility(null);
    loadWeatherForCity(city, dataSourceMode);
  };

  // Heatwave Drill Simulation State & Active Scenario
  const [isDrillModeActive, setIsDrillModeActive] = useState<boolean>(false);
  const [activeDrillScenario, setActiveDrillScenario] = useState<DrillScenario>(DRILL_SCENARIOS[0]);

  // Handle drill toggle
  const handleToggleDrillMode = async () => {
    if (!isDrillModeActive) {
      if (getNotificationPermission() === 'default') {
        await requestNotificationPermission();
      }
      setIsDrillModeActive(true);
      const drillTelemetry = generateDrillTelemetry(activeDrillScenario, selectedCity);
      const drillForecast = generateDrillForecast(activeDrillScenario);
      setWeather(drillTelemetry);
      setForecastDays(drillForecast);
      setSelectedCity((prev) => ({
        ...prev,
        weather: drillTelemetry,
        forecast: drillForecast,
      }));
      dispatchHeatwaveEmergencyPushNotification({
        city: selectedCity,
        dryBulbTemp: drillTelemetry.dryBulbTemp,
        wbgt: drillTelemetry.wbgt,
        heatIndex: drillTelemetry.heatIndex,
        isDrill: true,
        scenario: activeDrillScenario,
        onNavigateToGuidance: () => setCurrentTab('health-guidance'),
      });
    } else {
      setIsDrillModeActive(false);
      loadWeatherForCity(selectedCity, dataSourceMode);
    }
  };

  const handleSelectDrillScenario = (scenario: DrillScenario) => {
    setActiveDrillScenario(scenario);
    const drillTelemetry = generateDrillTelemetry(scenario, selectedCity);
    const drillForecast = generateDrillForecast(scenario);
    setWeather(drillTelemetry);
    setForecastDays(drillForecast);
    setSelectedCity((prev) => ({
      ...prev,
      weather: drillTelemetry,
      forecast: drillForecast,
    }));
    dispatchHeatwaveEmergencyPushNotification({
      city: selectedCity,
      dryBulbTemp: drillTelemetry.dryBulbTemp,
      wbgt: drillTelemetry.wbgt,
      heatIndex: drillTelemetry.heatIndex,
      isDrill: true,
      scenario,
      onNavigateToGuidance: () => setCurrentTab('health-guidance'),
    });
  };

  const handleExitDrill = () => {
    setIsDrillModeActive(false);
    loadWeatherForCity(selectedCity, dataSourceMode);
  };

  // Listen for click on native or in-app push notifications to open guidance
  useEffect(() => {
    const handleOpenGuidance = () => {
      setCurrentTab('health-guidance');
    };
    window.addEventListener('heatshield_open_safety_guidance', handleOpenGuidance);
    return () => {
      window.removeEventListener('heatshield_open_safety_guidance', handleOpenGuidance);
    };
  }, []);

  // Monitor unsafe readings (temp >= 40°C or WBGT >= 30°C) and trigger actionable push notification
  const lastAlertTimestampRef = React.useRef<number>(0);
  useEffect(() => {
    const now = Date.now();
    const isExceedingSafeLevel = weather.dryBulbTemp >= 40 || weather.wbgt >= 30 || weather.heatIndex >= 42;
    // 30-second cooldown between auto threshold dispatches
    if (isExceedingSafeLevel && now - lastAlertTimestampRef.current > 30000) {
      lastAlertTimestampRef.current = now;
      dispatchHeatwaveEmergencyPushNotification({
        city: selectedCity,
        dryBulbTemp: weather.dryBulbTemp,
        wbgt: weather.wbgt,
        heatIndex: weather.heatIndex,
        isDrill: isDrillModeActive,
        scenario: isDrillModeActive ? activeDrillScenario : undefined,
        onNavigateToGuidance: () => setCurrentTab('health-guidance'),
      });
    }
  }, [weather.dryBulbTemp, weather.wbgt, weather.heatIndex, selectedCity.name, isDrillModeActive]);

  const handleToggleDataSourceMode = (newMode: 'live_api' | 'imd_heatwave') => {
    setDataSourceMode(newMode);
    loadWeatherForCity(selectedCity, newMode);
  };

  const handleLogWater = (amountMl: number) => {
    const now = Date.now();
    const todayStr = getTodayDateString();
    const nowStr = new Date(now).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
    
    // Evaluate if day has changed prior to adding intake
    const activeProfile = checkAndResetDailyHydration(userProfile);
    const updated = {
      ...activeProfile,
      hydrationTodayMl: activeProfile.hydrationTodayMl + amountMl,
      lastHydrationDate: todayStr,
      lastWaterLogTime: nowStr,
      lastWaterLogTimestamp: now,
    };
    handleUpdateProfile(updated);
  };

  const handleSimulateHydrationDelay = () => {
    const twoHoursAgo = Date.now() - (2 * 60 + 20) * 60 * 1000;
    const timeStr = new Date(twoHoursAgo).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const updated = {
      ...userProfile,
      lastWaterLogTime: timeStr,
      lastWaterLogTimestamp: twoHoursAgo,
    };
    handleUpdateProfile(updated);
  };

  const handleRefreshTelemetry = async () => {
    await loadWeatherForCity(selectedCity, dataSourceMode);
  };

  const handleGpsLocate = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserGpsCoords({ lat: latitude, lng: longitude });
          const { city, distanceKm } = findNearestIndianCity(latitude, longitude);
          if (city) {
            handleSelectCity(city);
            setGpsStatusText(`GPS Locked: Nearest Station ${city.name} (${distanceKm} km away)`);
          }
        },
        () => {
          setIsCitySelectorOpen(true);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsCitySelectorOpen(true);
    }
  };

  const handleNavigateToFacility = (facility: CoolingFacility) => {
    setActiveNavFacility(facility);
    setCurrentTab('cooling-finder');
  };

  // Render active main content view
  const renderActiveView = () => {
    switch (currentTab) {
      case 'home':
      case 'overview':
        return (
          <PublicSafetyHomeView
            selectedCity={selectedCity}
            weather={weather}
            onSelectCity={handleSelectCity}
            onOpenCitySelector={() => setIsCitySelectorOpen(true)}
            onCheckMyLocation={handleGpsLocate}
            onViewGuidance={() => setCurrentTab('health-guidance')}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onTriggerSOS={() => handleTriggerSOS('108')}
            onOpenSOS={(type) => handleTriggerSOS((type as EmergencyHelplineType) || '108')}
            onOpenTriage={() => setIsTriageOpen(true)}
            isAdminAuthenticated={isAdminAuthenticated}
            onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
            batchCitiesWeather={batchCitiesWeather}
            language={language}
          />
        );
      case 'live-risk':
      case 'cooling-finder':
        return (
          <CoolingFinderView
            facilities={facilities}
            selectedCity={selectedCity}
            userCoords={userGpsCoords}
            onOpenCitySelector={() => setIsCitySelectorOpen(true)}
            onNavigateToFacility={handleNavigateToFacility}
            onTriggerSOS={() => setIsSOSOpen(true)}
            activeNavigationFacility={activeNavFacility}
            onClearNavigationFacility={() => setActiveNavFacility(null)}
            onSelectCity={handleSelectCity}
            language={language}
          />
        );
      case 'guidance':
      case 'health-guidance':
      case 'protocols':
        return (
          <ActionProtocolsView
            onTriggerSOS={() => setIsSOSOpen(true)}
            onOpenTriage={() => setIsTriageOpen(true)}
            cityName={selectedCity.name}
            language={language}
          />
        );
      case 'forecasts':
      case 'forecast':
        return (
          <PredictiveForecastView
            forecastDays={forecastDays && forecastDays.length > 0 ? forecastDays : (selectedCity as any).forecast || (selectedCity as any).forecastDays || []}
            selectedCity={selectedCity}
            weather={weather}
            dataSourceMode={dataSourceMode}
            onOpenCitySelector={() => setIsCitySelectorOpen(true)}
            isAdminAuthenticated={isAdminAuthenticated}
            onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
            language={language}
          />
        );
      case 'district-dashboard':
        return (
          <DistrictOperationsView
            selectedCity={selectedCity}
            weather={weather}
            language={language}
            isAdminAuthenticated={isAdminAuthenticated}
            onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
            onOpenAdminAuthModal={() => setIsAdminAuthOpen(true)}
            onTriggerSOS={() => setIsSOSOpen(true)}
            onLockAdminSession={handleRequestLockAdminSession}
          />
        );
      case 'reports-data':
        return <ResourcesDataView language={language} />;
      case 'about':
        return <AboutSystemView language={language} />;
      case 'alerts':
        return (
          <EmergencyAlertsView
            language={language}
            selectedCity={selectedCity}
            weather={weather}
            userRole={userRole}
            isAdminAuthenticated={isAdminAuthenticated}
            onOpenAdminAuthModal={() => setIsAdminAuthOpen(true)}
            onLockAdminSession={handleLockAdminSession}
            onOpenCitySelector={() => setIsCitySelectorOpen(true)}
            onTriggerSOS={() => setIsSOSOpen(true)}
          />
        );
      case 'profile':
        return (
          <PersonalHealthProfileView
            profile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onOpenTriage={() => setIsTriageOpen(true)}
            language={language}
          />
        );
      case 'health-report':
        return (
          <HealthReportView
            weather={weather}
            userProfile={userProfile}
            selectedCity={selectedCity}
            coolingFacilities={facilities}
            onLogWater={handleLogWater}
            onOpenTriage={() => setIsTriageOpen(true)}
            onTriggerSOS={() => setIsSOSOpen(true)}
            language={language}
          />
        );
      default:
        return (
          <PublicSafetyHomeView
            selectedCity={selectedCity}
            weather={weather}
            onOpenCitySelector={() => setIsCitySelectorOpen(true)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onTriggerSOS={() => setIsSOSOpen(true)}
            onOpenTriage={() => setIsTriageOpen(true)}
            language={language}
          />
        );
    }
  };

  return (
    <AuthProvider>
      <div className={`min-h-screen bg-[#F5F8FB] text-[#17202A] flex flex-col font-sans ${isHighContrast ? 'high-contrast' : ''} ${fontSizeLevel === 1 ? 'text-[105%]' : fontSizeLevel === 2 ? 'text-[115%]' : ''}`}>
        
        {/* Emergency Alert Banner */}
        <EmergencyAlertBanner
          nationalRiskLevel={weather.riskLevel}
          onViewSafetyGuidance={() => setCurrentTab('health-guidance')}
          language={language}
        />

        {/* Top Header */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          userRole={userRole}
          onChangeRole={handleChangeRole}
          isAdminAuthenticated={isAdminAuthenticated}
          onOpenAdminAuthModal={() => setIsAdminAuthOpen(true)}
          onLockAdminSession={handleLockAdminSession}
          language={language}
          onChangeLanguage={setLanguage}
          weather={weather}
          selectedCity={selectedCity}
          onOpenCitySelector={() => setIsCitySelectorOpen(true)}
          onRefreshTelemetry={handleRefreshTelemetry}
          onTriggerSOS={(type) => handleTriggerSOS((type as EmergencyHelplineType) || '108')}
          onOpenTriage={() => setIsTriageOpen(true)}
          onOpenPushSettings={() => setIsPushSettingsOpen(true)}
          onOpenHealthReport={() => setIsHealthReportOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          fontSizeLevel={fontSizeLevel}
          onChangeFontSize={setFontSizeLevel}
          isHighContrast={isHighContrast}
          onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
          onAnnounceAlert={handleAnnounceAlert}
          isDrillModeActive={isDrillModeActive}
          onToggleDrillMode={handleToggleDrillMode}
        />

        {/* Heatwave Emergency Drill Simulation Banner (Demonstration / Judge Mode) */}
        <HeatwaveDrillBanner
          isDrillModeActive={isDrillModeActive}
          activeScenario={activeDrillScenario}
          onSelectScenario={handleSelectDrillScenario}
          onExitDrill={handleExitDrill}
          selectedCity={selectedCity}
          weather={weather}
          language={language}
          onNavigateToGuidance={() => setCurrentTab('health-guidance')}
        />

        {/* Permanent Rolling Headlines Ticker for Critical Cities in India */}
        <RollingHeadlinesTicker
          selectedCity={selectedCity}
          cities={INDIAN_CITIES}
          onSelectCity={handleSelectCity}
          onOpenHealthReport={() => setIsHealthReportOpen(true)}
          onOpenPushSettings={() => setIsPushSettingsOpen(true)}
          weather={weather}
          dataSourceMode={dataSourceMode}
          citiesLiveWeather={batchCitiesWeather}
          language={language}
        />

        {/* Main Responsive Container Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar (Desktop / PC View) */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            language={language}
            selectedCity={selectedCity}
            onOpenCitySelector={() => setIsCitySelectorOpen(true)}
            unreadAlertCount={1}
          />

          {/* Dynamic Content Area: seamlessly fluid on Mobile, Tablet & PC */}
          <main className="flex-1 overflow-y-auto bg-[#F5F8FB] px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-8 flex flex-col justify-between">
            <div className="max-w-6xl mx-auto w-full">
              {renderActiveView()}
            </div>

            {/* Institutional Government Footer */}
            <div className="mt-8">
              <GovernmentFooter
                language={language}
                onSelectTab={(tab) => setCurrentTab(tab as NavigationTab)}
                onOpenSOS={(type) => handleTriggerSOS((type as EmergencyHelplineType) || '108')}
              />
            </div>
          </main>
        </div>

        {/* Mobile / Tablet Bottom Navigation Bar (Hidden on Desktop) */}
        <MobileBottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          language={language}
          isOpen={isMobileMenuOpen}
          onToggleOpen={setIsMobileMenuOpen}
          onOpenTriage={() => setIsTriageOpen(true)}
          onTriggerSOS={() => setIsSOSOpen(true)}
          onOpenPushSettings={() => setIsPushSettingsOpen(true)}
          onOpenCitySelector={() => setIsCitySelectorOpen(true)}
          onOpenHealthReport={() => setCurrentTab('health-report')}
          unreadAlertCount={1}
          selectedCity={selectedCity}
          onLogWater={handleLogWater}
          dataSourceMode={dataSourceMode}
          onToggleDataSourceMode={handleToggleDataSourceMode}
          onChangeLanguage={setLanguage}
          onRefreshTelemetry={handleRefreshTelemetry}
          isAdminAuthenticated={isAdminAuthenticated}
          onOpenAdminAuthModal={() => setIsAdminAuthOpen(true)}
          onLockAdminSession={handleLockAdminSession}
        />

      {/* Admin Authentication & Municipal ID/Password Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onAuthSuccess={handleAdminSuccess}
        onSuccessAuth={handleAdminSuccess}
        language={language}
      />

      {/* Admin Logout Confirmation Modal */}
      <AdminLogoutModal
        isOpen={isAdminLogoutOpen}
        onClose={() => setIsAdminLogoutOpen(false)}
        onConfirmLogout={handleConfirmLogout}
        language={language}
      />

      {/* Indian Cities Search & Automatic GPS Location Modal */}
      <CitySearchSelector
        isOpen={isCitySelectorOpen}
        onClose={() => setIsCitySelectorOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        dataSourceMode={dataSourceMode}
        citiesLiveWeather={batchCitiesWeather}
        activeWeather={weather}
        onGpsDetected={(coords) => setUserGpsCoords({ lat: coords.lat, lng: coords.lng })}
        language={language}
      />

      {/* AI Triage Diagnostic Tree Modal */}
      <TriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        onTriggerSOS={() => {
          setIsTriageOpen(false);
          setIsSOSOpen(true);
        }}
        onNavigateToShelter={() => {
          setIsTriageOpen(false);
          setCurrentTab('cooling-finder');
        }}
        language={language}
      />

      {/* Emergency 108 / 112 / 1078 SOS Dispatch Modal */}
      <EmergencyCallModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        userProfile={userProfile}
        language={language}
        initialType={emergencyHelplineType}
      />

      {/* Comprehensive Clinical Health Report Dossier Modal */}
      <HealthReportModal
        isOpen={isHealthReportOpen}
        onClose={() => setIsHealthReportOpen(false)}
        weather={weather}
        userProfile={userProfile}
        selectedCity={selectedCity}
        coolingFacilities={facilities}
        onLogWater={handleLogWater}
        language={language}
        onOpenTriage={() => {
          setIsHealthReportOpen(false);
          setIsTriageOpen(true);
        }}
        onTriggerSOS={() => {
          setIsHealthReportOpen(false);
          setIsSOSOpen(true);
        }}
      />

      {/* Push Notification Controls & Test Station Modal */}
      <PushNotificationSettingsModal
        isOpen={isPushSettingsOpen}
        onClose={() => setIsPushSettingsOpen(false)}
        onLogWater={handleLogWater}
      />

      {/* Subtle UI Toast Alert for Hydration Inactivity during High Heat */}
      <HydrationAlertToast
        weather={weather}
        userProfile={userProfile}
        onLogWater={handleLogWater}
        onSimulateInactivity={handleSimulateHydrationDelay}
        onOpenPushSettings={() => setIsPushSettingsOpen(true)}
      />

      {/* Global In-App Push Notification Slide-in Banner */}
      <PushNotificationBanner
        onLogWater={handleLogWater}
        onViewGuidance={() => setCurrentTab('health-guidance')}
      />

      </div>
    </AuthProvider>
  );
}

export default App;
