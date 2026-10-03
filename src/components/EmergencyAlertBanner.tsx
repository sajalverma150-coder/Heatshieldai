import React, { useState, useMemo } from 'react';
import { AlertTriangle, ChevronRight, X, Volume2, Square } from 'lucide-react';
import { LanguageCode, HeatRiskLevel } from '../types';
import { RISK_STANDARDS } from '../utils/heatRiskStandards';
import { speakEmergencyAlert, stopEmergencyAlertSpeech } from '../services/hindiSpeechService';

interface EmergencyAlertBannerProps {
  language: LanguageCode;
  nationalRiskLevel?: HeatRiskLevel;
  affectedDistrictsCount?: number;
  startDate?: string;
  endDate?: string;
  onViewSafetyGuidance: () => void;
  onAnnounceAlert?: () => void;
  dryBulbTemp?: number;
  wbgt?: number;
  humidity?: number;
}

export const EmergencyAlertBanner: React.FC<EmergencyAlertBannerProps> = ({
  language,
  nationalRiskLevel = 'MODERATE',
  affectedDistrictsCount = 14,
  startDate,
  endDate,
  onViewSafetyGuidance,
  onAnnounceAlert,
  dryBulbTemp,
  wbgt,
  humidity,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isHindi = language === 'hi';

  // Determine whether an active heat alert is warranted
  // Strictly suppress alerts if temperature is normal; only show if live temp goes up (>= 40°C or WBGT >= 32°C with elevated temp)
  const isElevatedAlert = useMemo(() => {
    if (dryBulbTemp !== undefined && dryBulbTemp < 40 && (wbgt === undefined || wbgt < 32)) {
      return false;
    }
    return (
      (dryBulbTemp !== undefined && dryBulbTemp >= 40) ||
      (wbgt !== undefined && wbgt >= 32 && (dryBulbTemp === undefined || dryBulbTemp >= 37)) ||
      (nationalRiskLevel === 'EXTREME' && (dryBulbTemp === undefined || dryBulbTemp >= 39))
    );
  }, [nationalRiskLevel, dryBulbTemp, wbgt]);

  // Compute dynamic truthful dates for current and upcoming forecast window (next 72 hours)
  const { dynamicStart, dynamicEnd, peakHoursText } = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3-day forward forecast window

    const locale = isHindi ? 'hi-IN' : 'en-IN';
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const fullDateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

    const startFormatted = startDate || (isHindi ? `आज (${now.toLocaleDateString(locale, dateOptions)})` : `Today (${now.toLocaleDateString(locale, dateOptions)})`);
    const endFormatted = endDate || end.toLocaleDateString(locale, fullDateOptions);

    const peak = isHindi ? 'दोपहर 12:00 से शाम 4:00 बजे (IST)' : '12:00 PM – 4:00 PM IST peak solar hours';

    return { dynamicStart: startFormatted, dynamicEnd: endFormatted, peakHoursText: peak };
  }, [startDate, endDate, isHindi]);

  // If dismissed or there is no elevated risk, do not show any alarmist banner
  if (isDismissed || !isElevatedAlert) {
    return null;
  }

  const effectiveRiskLevel: HeatRiskLevel =
    nationalRiskLevel === 'EXTREME' || nationalRiskLevel === 'VERY_HIGH' || nationalRiskLevel === 'HIGH'
      ? nationalRiskLevel
      : 'HIGH';

  const risk = RISK_STANDARDS[effectiveRiskLevel] || RISK_STANDARDS.HIGH;

  const handleSpeak = () => {
    if (isSpeaking) {
      stopEmergencyAlertSpeech();
      setIsSpeaking(false);
      return;
    }

    if (onAnnounceAlert) {
      onAnnounceAlert();
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 8000);
      return;
    }

    const textHi = `सावधान! अग्रिम मौसम पूर्वानुमान: ${dynamicStart} से ${dynamicEnd} तक ${affectedDistrictsCount} संवेदनशील जिलों में तीव्र ताप लहर का पूर्वानुमान है। विशेष रूप से ${peakHoursText} के दौरान सीधी धूप से बचें, पर्याप्त जल पिएं और आपातकाल में 108 पर संपर्क करें।`;
    const textEn = `National Heat Warning: Elevated heat conditions forecast across ${affectedDistrictsCount} districts from ${dynamicStart} through ${dynamicEnd}. Avoid direct sun exposure during ${peakHoursText}. Stay hydrated and call 108 for emergency medical support.`;

    speakEmergencyAlert({
      textHi,
      textEn,
      language: isHindi ? 'hi' : 'en',
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const getAlertHeadline = () => {
    if (effectiveRiskLevel === 'EXTREME') {
      return isHindi
        ? `${dynamicStart} से ${dynamicEnd} तक ${affectedDistrictsCount} जिलों में अत्यधिक तीव्र लू (Extreme Heatwave) की संभावना है।`
        : `Extreme heatwave emergency is forecasted across ${affectedDistrictsCount} districts from ${dynamicStart} to ${dynamicEnd}.`;
    }
    if (effectiveRiskLevel === 'VERY_HIGH') {
      return isHindi
        ? `${dynamicStart} से ${dynamicEnd} तक ${affectedDistrictsCount} जिलों में गंभीर ताप तनाव (Very High Heat Risk) का पूर्वानुमान है।`
        : `Very high heat risk is forecasted across ${affectedDistrictsCount} districts from ${dynamicStart} to ${dynamicEnd}.`;
    }
    return isHindi
      ? `${dynamicStart} से ${dynamicEnd} तक ${affectedDistrictsCount} जिलों में उच्च ताप तनाव (High Heat Risk) की चेतावनी सक्रिय है।`
      : `Elevated heat risk is forecasted across ${affectedDistrictsCount} districts from ${dynamicStart} to ${dynamicEnd}.`;
  };

  return (
    <aside
      id="national-heat-emergency-banner"
      aria-label="National Heat Emergency Alert Banner"
      className="w-full transition-all border-b shadow-xs relative z-30"
      style={{
        backgroundColor: risk.bgColor,
        borderColor: risk.borderColor,
      }}
    >
      <div className="w-full px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left: Shape + Alert Text */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm flex items-center justify-center shrink-0 font-mono text-xs font-bold text-white shadow-xs animate-pulse"
            style={{ backgroundColor: risk.color }}
            title={`Risk Symbol: ${risk.shapeLabel}`}
          >
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-bold tracking-wider uppercase text-[11px] sm:text-xs px-2 py-0.5 rounded font-mono"
                style={{ backgroundColor: risk.color, color: '#FFFFFF' }}
              >
                {isHindi ? 'सक्रिय ताप चेतावनी पूर्वानुमान' : 'ACTIVE HEAT FORECAST ADVISORY'}
              </span>
              <span className="text-[11px] font-mono font-semibold" style={{ color: risk.textColor }}>
                [{risk.shapeLabel} • Score: {risk.numericScore}/10{humidity !== undefined ? ` • RH: ${Math.round(humidity)}%` : ''} • Next 72h Window]
              </span>
            </div>

            <p className="font-medium text-[#17202A] mt-0.5 text-xs sm:text-sm leading-tight truncate sm:whitespace-normal">
              {getAlertHeadline()}{' '}
              <span className="text-[#334155] font-normal">
                {isHindi ? `(अधिकतम प्रभाव: ${peakHoursText})` : `(Peak vulnerability: ${peakHoursText})`}
              </span>
            </p>
          </div>
        </div>

        {/* Right Actions: Voice Announcement + View Guidance + Dismiss */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Audio Voice Announcement Button */}
          <button
            onClick={handleSpeak}
            className={`flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded text-xs font-bold cursor-pointer transition-all border ${
              isSpeaking
                ? 'bg-red-700 text-white border-red-500 animate-pulse'
                : 'bg-white text-[#17202A] hover:bg-slate-100 border-slate-300 shadow-xs'
            }`}
            title={isHindi ? 'हिन्दी / अंग्रेज़ी वॉइस बुलेटिन सुनें' : 'Listen to Audio Alert Bulletin'}
          >
            {isSpeaking ? (
              <Square className="w-3.5 h-3.5 fill-current text-white" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-red-600" />
            )}
            <span className="hidden xs:inline">
              {isSpeaking ? (isHindi ? 'रोकें' : 'Stop') : (isHindi ? 'वॉइस अलर्ट' : 'Audio Alert')}
            </span>
          </button>

          <button
            onClick={onViewSafetyGuidance}
            className="flex items-center gap-1 px-3 py-1 sm:py-1.5 rounded text-white text-xs font-semibold cursor-pointer shadow-xs hover:opacity-95 transition-opacity whitespace-nowrap"
            style={{ backgroundColor: risk.color }}
          >
            <span>{isHindi ? 'सुरक्षा दिशानिर्देश' : 'Safety Guidance'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded text-[#526273] hover:text-[#17202A] hover:bg-black/5 cursor-pointer ml-1"
            title={isHindi ? 'सूचना बंद करें' : 'Dismiss alert'}
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
