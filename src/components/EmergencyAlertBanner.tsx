import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, X, Volume2, Square, ShieldAlert } from 'lucide-react';
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
}

export const EmergencyAlertBanner: React.FC<EmergencyAlertBannerProps> = ({
  language,
  nationalRiskLevel = 'VERY_HIGH',
  affectedDistrictsCount = 12,
  startDate = '12 September',
  endDate = '15 September 2026',
  onViewSafetyGuidance,
  onAnnounceAlert,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isHindi = language === 'hi';
  const risk = RISK_STANDARDS[nationalRiskLevel] || RISK_STANDARDS.VERY_HIGH;

  if (isDismissed) return null;

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

    const textHi = `सावधान! राष्ट्रीय आपदा प्रबंधन प्राधिकरण द्वारा चेतावनी: ${startDate} से ${endDate} तक ${affectedDistrictsCount} जिलों में भीषण लू और अत्यधिक ताप का रेड अलर्ट जारी है। दोपहर में धूप से बचें, पर्याप्त जल पिएं और आपातकाल में 108 पर संपर्क करें।`;
    const textEn = `National Heat Emergency Alert: Severe heat conditions expected across ${affectedDistrictsCount} districts from ${startDate} to ${endDate}. Stay hydrated, avoid midday sun exposure, and call 108 for medical emergency.`;

    speakEmergencyAlert({
      textHi,
      textEn,
      language: isHindi ? 'hi' : 'en',
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
        
        {/* Left: Shape + Alert Text */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div 
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm flex items-center justify-center shrink-0 font-mono text-xs font-bold text-white shadow-xs"
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
                {isHindi ? 'राष्ट्रीय लू चेतावनी' : 'NATIONAL HEAT ALERT'}
              </span>
              <span className="text-[11px] font-mono font-semibold" style={{ color: risk.textColor }}>
                [{risk.shapeLabel} • Score: {risk.numericScore}/10]
              </span>
            </div>

            <p className="font-medium text-[#17202A] mt-0.5 text-xs sm:text-sm leading-tight truncate sm:whitespace-normal">
              {isHindi ? (
                <>
                  {startDate} से {endDate} तक <strong>{affectedDistrictsCount} जिलों</strong> में अत्यंत उच्च लू (Very High Heat Risk) की चेतावनी जारी है।
                </>
              ) : (
                <>
                  Very high heat risk is expected across <strong>{affectedDistrictsCount} districts</strong> from {startDate} to {endDate}.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right Actions: Voice Announcement + View Guidance + Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Audio Voice Announcement Button */}
          <button
            onClick={handleSpeak}
            className={`flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded text-xs font-bold cursor-pointer transition-all border ${
              isSpeaking
                ? 'bg-red-700 text-white border-red-500 animate-pulse'
                : 'bg-white text-[#17202A] hover:bg-slate-100 border-slate-300'
            }`}
            title={isHindi ? 'हिन्दी वॉइस बुलेटिन सुनें' : 'Listen to Hindi / English Audio Alert'}
          >
            {isSpeaking ? <Square className="w-3.5 h-3.5 fill-current text-white" /> : <Volume2 className="w-3.5 h-3.5 text-red-600" />}
            <span className="hidden xs:inline">
              {isSpeaking ? (isHindi ? 'रोके' : 'Stop') : (isHindi ? 'वॉइस बुलेटिन' : 'Audio Bulletin')}
            </span>
          </button>

          <button
            onClick={onViewSafetyGuidance}
            className="flex items-center gap-1 px-3 py-1 sm:py-1.5 rounded text-white text-xs font-semibold cursor-pointer shadow-xs hover:opacity-95 transition-opacity whitespace-nowrap"
            style={{ backgroundColor: risk.color }}
          >
            <span>{isHindi ? 'सुरक्षा दिशानिर्देश देखें' : 'View safety guidance'}</span>
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
