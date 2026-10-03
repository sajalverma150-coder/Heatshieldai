import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  PhoneCall, 
  AlertTriangle, 
  Download, 
  Copy, 
  RotateCcw,
  Languages,
  Activity,
  UserCheck,
  Building2,
  Truck,
  HeartPulse,
  Stethoscope
} from 'lucide-react';
import { WeatherTelemetry, UserHealthProfile, LanguageCode } from '../../types';
import { CityData } from '../../data/indiaCities';
import { 
  AssistanceTicket, 
  AssistanceType, 
  createEmergencyTicket, 
  saveAssistanceTicket, 
  startRingtoneSound, 
  stopRingtoneSound, 
  playDtmfTone, 
  playSuccessChime 
} from '../../services/aiCallAssistantService';
import { speakEmergencyAlert, stopEmergencyAlertSpeech } from '../../services/hindiSpeechService';

interface AiCallAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherTelemetry;
  city: CityData;
  userProfile: UserHealthProfile;
  language?: LanguageCode;
  autoStartInCall?: boolean;
}

type CallStage = 'ringing' | 'connected' | 'ended';

export const AiCallAssistantModal: React.FC<AiCallAssistantModalProps> = ({
  isOpen,
  onClose,
  weather,
  city,
  userProfile,
  language: initialLanguage = 'en',
  autoStartInCall = false,
}) => {
  const [stage, setStage] = useState<CallStage>('ringing');
  const [currentLang, setCurrentLang] = useState<LanguageCode>(initialLanguage);
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [activeTicket, setActiveTicket] = useState<AssistanceTicket | null>(null);
  const [hasCopiedToken, setHasCopiedToken] = useState<boolean>(false);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const isHindi = currentLang === 'hi';

  // Handle Opening & Ringtone
  useEffect(() => {
    if (isOpen) {
      if (autoStartInCall) {
        setStage('connected');
        initializeCallDialogue();
      } else {
        setStage('ringing');
        const stopRingtone = startRingtoneSound();
        return () => {
          stopRingtone();
        };
      }
    } else {
      stopRingtoneSound();
      stopEmergencyAlertSpeech();
      setCallSeconds(0);
      setActiveTicket(null);
    }
  }, [isOpen, autoStartInCall]);

  // Call Duration Timer
  useEffect(() => {
    let timer: any = null;
    if (stage === 'connected') {
      timer = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [stage]);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, isAiSpeaking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Trigger speech synthesis
  const speakResponse = (textHi: string, textEn: string) => {
    if (!isSpeakerOn) return;
    setIsAiSpeaking(true);
    speakEmergencyAlert({
      textHi,
      textEn,
      language: currentLang,
      onStart: () => setIsAiSpeaking(true),
      onEnd: () => setIsAiSpeaking(false),
      onError: () => setIsAiSpeaking(false),
    });
  };

  const initializeCallDialogue = () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const greetingEn = `Hello ${userProfile.name || 'Citizen'}. This is HeatShield Emergency Automated Dispatcher. Extreme heatwave alert is triggered in ${city.name} at ${weather.dryBulbTemp}°C. Please press: 1 for Hospital Bed, 2 for Cooling Shelter, 3 for Water Tanker, 4 for 108 Ambulance, 5 for Tele-Doctor, or 9 if you are Safe.`;
    const greetingHi = `नमस्ते ${userProfile.name || 'नागरिक'}। यह हीटशील्ड स्वचालित आपातकालीन कॉल सेवा है। ${city.name} में ${weather.dryBulbTemp} डिग्री सेल्सियस पर अत्यधिक लू का अलर्ट जारी है। कृपया नंबर दबाएं: अस्पताल बेड के लिए १, शीतलन केंद्र के लिए २, जल टैंकर के लिए ३, एम्बुलेंस के लिए ४, टेली-डॉक्टर के लिए ५, या सुरक्षित होने पर ९ दबाएं।`;

    setTranscript([
      {
        sender: 'ai',
        text: isHindi ? greetingHi : greetingEn,
        time: nowTime,
      }
    ]);

    speakResponse(greetingHi, greetingEn);
  };

  const handleAcceptCall = () => {
    stopRingtoneSound();
    setStage('connected');
    initializeCallDialogue();
  };

  const handleDeclineCall = () => {
    stopRingtoneSound();
    stopEmergencyAlertSpeech();
    setStage('ended');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleEndCall = () => {
    stopEmergencyAlertSpeech();
    setStage('ended');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Replay greeting instructions
  const handleReplayPrompt = () => {
    stopEmergencyAlertSpeech();
    const promptEn = `Please select an emergency option: Press 1 for Hospital Bed, 2 for Cooling Shelter, 3 for Water Tanker, 4 for 108 Ambulance, 5 for Tele-Doctor, or 9 for Safe.`;
    const promptHi = `कृपया विकल्प चुनें: अस्पताल बेड के लिए १, शीतलन केंद्र के लिए २, जल टैंकर के लिए ३, एम्बुलेंस के लिए ४, डॉक्टर के लिए ५, या सुरक्षित हैं तो ९ दबाएं।`;
    speakResponse(promptHi, promptEn);
  };

  // Process IVR Key Option Selection
  const handleIvrAction = (key: string, type: AssistanceType) => {
    playDtmfTone(key);
    stopEmergencyAlertSpeech();
    
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let actionNameEn = '';
    let actionNameHi = '';

    if (type === 'hospital_bed') {
      actionNameEn = '1 - Hospital Bed & Heat Stroke Triage Reservation';
      actionNameHi = '1 - अस्पताल आईसीयू बेड व हीट स्ट्रोक आरक्षण';
    } else if (type === 'cooling_shelter') {
      actionNameEn = '2 - Municipal Cooling Shelter & Day Pass';
      actionNameHi = '2 - नगर पालिका शीतलन केंद्र डे-पास';
    } else if (type === 'water_tanker') {
      actionNameEn = '3 - Emergency Drinking Water / ORS Tanker';
      actionNameHi = '3 - आपातकालीन पेयजल व ओआरएस टैंकर';
    } else if (type === 'ambulance_108') {
      actionNameEn = '4 - Code Red 108 Ambulance Dispatch';
      actionNameHi = '4 - कोड रेड १०८ एम्बुलेंस प्रेषण';
    } else if (type === 'doctor_consult') {
      actionNameEn = '5 - Doctor Tele-Triage Consultation';
      actionNameHi = '5 - डॉक्टर टेली-परामर्श लाइन';
    } else if (type === 'marked_safe') {
      actionNameEn = '9 - Marked Safe & Hydrated';
      actionNameHi = '9 - सुरक्षित एवं जलयोजित';
    }

    setTranscript((prev) => [
      ...prev,
      { sender: 'user', text: isHindi ? actionNameHi : actionNameEn, time: nowTime },
    ]);

    const newTicket = createEmergencyTicket({
      type,
      cityName: city.name,
      patientName: userProfile.name || 'Citizen',
      phoneNumber: userProfile.phone || '+91 98200 44108',
      ward: userProfile.ward || 'Ward 4',
    });

    saveAssistanceTicket(newTicket);
    setActiveTicket(newTicket);
    playSuccessChime();

    let replyEn = '';
    let replyHi = '';

    if (type === 'hospital_bed') {
      replyEn = `Confirmed. Emergency heat-stroke ICU bed reserved at ${newTicket.facilityName}. Token number is ${newTicket.tokenNumber}. Zero-wait gate entry.`;
      replyHi = `पुष्टि हो गई। ${newTicket.facilityName} में आपका आपातकालीन आईसीयू बेड आरक्षित है। टोकन नंबर ${newTicket.tokenNumber} है।`;
    } else if (type === 'cooling_shelter') {
      replyEn = `Pass confirmed for ${newTicket.facilityName}. Recliner and cold hydration reserved for you until 8:00 PM.`;
      replyHi = `${newTicket.facilityName} के लिए आपका डे-पास आरक्षित है। शाम ८ बजे तक वातानुकूलित आराम और पेयजल उपलब्ध है।`;
    } else if (type === 'water_tanker') {
      replyEn = `Water tanker bowser dispatched to your ward in ${city.name}. Estimated arrival in 15 minutes. Driver will call your phone.`;
      replyHi = `आपके वार्ड के लिए जल टैंकर रवाना कर दिया गया है। लगभग १५ मिनट में पहुंचेगा।`;
    } else if (type === 'ambulance_108') {
      replyEn = `Ambulance unit dispatched. Sirens active. Paramedics reaching in 6 minutes. Please stay shaded.`;
      replyHi = `१०८ एम्बुलेंस रवाना कर दी गई है। ६ मिनट में पहुंचेगी। कृपया मरीज को छांव में रखें।`;
    } else if (type === 'doctor_consult') {
      replyEn = `Connecting to Emergency Tele-Doctor line. Priority callback scheduled within 3 minutes.`;
      replyHi = `इमरजेंसी टेली-डॉक्टर लाइन से जोड़ा जा रहा है। ३ मिनट के भीतर डॉक्टर कॉल करेंगे।`;
    } else {
      replyEn = `Thank you for confirming. Your safe status is logged with disaster operations. Drink plenty of water.`;
      replyHi = `पुष्टि हेतु धन्यवाद। आपकी सुरक्षा दर्ज कर ली गई है। नियमित जल पीते रहें।`;
    }

    setTranscript((prev) => [
      ...prev,
      { sender: 'ai', text: isHindi ? replyHi : replyEn, time: nowTime },
    ]);

    speakResponse(replyHi, replyEn);
  };

  const handleCopyToken = () => {
    if (!activeTicket) return;
    navigator.clipboard.writeText(activeTicket.tokenNumber);
    setHasCopiedToken(true);
    setTimeout(() => setHasCopiedToken(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-[#0A192F]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* Phone Hardware Mock Container */}
      <div className="w-full max-w-md bg-[#0F172A] border-4 border-[#1E293B] rounded-[36px] shadow-2xl overflow-hidden relative text-white flex flex-col my-auto max-h-[95vh] ring-1 ring-white/10">
        
        {/* Status Bar / Notch */}
        <div className="bg-[#090D16] px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono text-[#94A3B8] border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-bold text-white tracking-wider">NHHEWS DISPATCH</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#EF4444] text-white font-bold px-1.5 py-0.2 rounded font-sans uppercase">
              {weather.dryBulbTemp}°C ALERT
            </span>
            <span>HD VOICE</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 1. RINGING SCREEN */}
        {/* ------------------------------------------------------------------- */}
        {stage === 'ringing' && (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center justify-between min-h-[520px]">
            {/* Top Indicator */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#FCA5A5] text-xs font-mono font-bold uppercase tracking-wide animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                <span>{isHindi ? 'स्वचालित आपदा सुरक्षा कॉल' : 'AUTOMATED HEATWAVE SAFETY CALL'}</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] pt-1">
                {isHindi ? 'राष्ट्रीय ताप स्वास्थ्य पूर्व चेतावनी प्रणाली' : 'National Heat Health Early Warning Operations'}
              </p>
            </div>

            {/* Pulsing Caller Avatar & Waves */}
            <div className="my-8 relative flex items-center justify-center">
              <div className="absolute w-44 h-44 rounded-full bg-[#EF4444]/20 animate-ping" />
              <div className="absolute w-36 h-36 rounded-full bg-[#3B82F6]/30 animate-pulse" />
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#2563EB] flex items-center justify-center shadow-xl border-4 border-white/20 relative z-10">
                <PhoneCall className="w-12 h-12 text-white animate-bounce" />
              </div>
            </div>

            {/* Caller ID Info */}
            <div className="space-y-2 mb-6">
              <h2 className="text-xl sm:text-2xl font-headline font-bold text-white">
                {isHindi ? 'हीटशील्ड एआई सहायता केंद्र' : 'HeatShield AI Safety Dispatcher'}
              </h2>
              <p className="text-xs text-[#38BDF8] font-mono font-semibold">
                Toll Free: 1800-11-HEAT (24x7 Emergency Line)
              </p>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#CBD5E1] space-y-1">
                <div className="flex items-center justify-center gap-1 text-[#F87171] font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{city.name} — {weather.dryBulbTemp}°C ({weather.riskLevel} Risk)</span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  {isHindi 
                    ? 'अत्यधिक तापमान दर्ज होने पर स्वचालित सुरक्षा जांच एवं अस्पताल/शीतलन केंद्र आरक्षण हेतु कॉल।' 
                    : 'Automated outgoing welfare call triggered by severe biometeorological heat index breach.'}
                </p>
              </div>
            </div>

            {/* Call Action Swipe/Buttons */}
            <div className="w-full flex items-center justify-around gap-6 pt-2">
              {/* Decline Button */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleDeclineCall}
                  className="w-16 h-16 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title="Decline"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
                <span className="text-xs font-mono text-[#EF4444] font-semibold">{isHindi ? 'अस्वीकार' : 'Decline'}</span>
              </div>

              {/* Accept Button */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleAcceptCall}
                  className="w-16 h-16 rounded-full bg-[#16A34A] hover:bg-[#15803D] flex items-center justify-center shadow-lg shadow-[#16A34A]/40 transition-transform active:scale-95 animate-bounce cursor-pointer"
                  title="Accept Call"
                >
                  <Phone className="w-7 h-7 text-white" />
                </button>
                <span className="text-xs font-mono text-[#4ADE80] font-bold">{isHindi ? 'उत्तर दें (Accept)' : 'Answer Call'}</span>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* 2. CONNECTED CALL SCREEN */}
        {/* ------------------------------------------------------------------- */}
        {stage === 'connected' && (
          <div className="flex flex-col flex-1 min-h-[540px] max-h-[82vh] overflow-hidden">
            
            {/* Top In-Call Header */}
            <div className="p-3.5 bg-[#090D16]/90 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center border border-white/20 shadow-md">
                  <Sparkles className="w-5 h-5 text-[#38BDF8]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">HeatShield AI Dispatcher</h3>
                  <p className="text-[11px] font-mono text-[#38BDF8] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span>{formatTime(callSeconds)}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/70">{city.name}</span>
                  </p>
                </div>
              </div>

              {/* Language Switcher Button */}
              <button
                onClick={() => {
                  const next = currentLang === 'en' ? 'hi' : 'en';
                  setCurrentLang(next);
                  speakResponse(
                    next === 'hi' ? 'भाषा बदलकर हिन्दी कर दी गई है।' : 'Language set to Hindi.',
                    next === 'en' ? 'Language switched to English.' : 'Language set to English.'
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-[#38BDF8] flex items-center gap-1 transition-all cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{currentLang === 'en' ? 'EN | हिन्दी' : 'हिन्दी | EN'}</span>
              </button>
            </div>

            {/* Live Audio Visualizer Bar */}
            <div className="bg-[#0F172A] px-4 py-2 border-b border-white/5 flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-[#94A3B8]">
                {isAiSpeaking ? (
                  <span className="text-[#38BDF8] flex items-center gap-1.5 font-semibold">
                    <Volume2 className="w-4 h-4 animate-pulse text-[#38BDF8]" />
                    <span>{isHindi ? 'एआई सहायक बोल रहा है...' : 'AI Voice Assistant Speaking...'}</span>
                  </span>
                ) : (
                  <span className="text-[#94A3B8] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{isHindi ? 'तैयार • नीचे दिए गए आईवीआर नंबर दबाएं (1-5, 9)' : 'Ready • Press any IVR Key below (1-5, 9)'}</span>
                  </span>
                )}
              </div>

              {/* Audio Waveform Bars */}
              <div className="flex items-center gap-0.5 h-4">
                {[40, 70, 95, 60, 85, 30, 90, 50, 80].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-1 bg-[#38BDF8] rounded-full transition-all duration-150"
                    style={{
                      height: isAiSpeaking ? `${(h * (callSeconds % 3 + 1)) / 3}%` : '20%',
                      opacity: isAiSpeaking ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Scrollable Live Transcript & Generated Reservation Cards */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-[#0B1120]/70 text-xs">
              
              {transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#2563EB] text-white rounded-br-xs'
                        : 'bg-[#1E293B] text-[#F1F5F9] border border-white/10 rounded-bl-xs shadow-md'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-white/60 mb-0.5 flex items-center justify-between gap-3">
                      <span>{msg.sender === 'user' ? 'Citizen (Keypad Input)' : 'HeatShield AI Dispatcher'}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}

              {/* ------------------------------------------------------------- */}
              {/* LIVE GENERATED EMERGENCY PASS / RESERVATION TICKET */}
              {/* ------------------------------------------------------------- */}
              {activeTicket && (
                <div className="mt-2 p-3.5 rounded-2xl bg-[#064E3B]/80 border-2 border-[#10B981] text-white shadow-xl space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-[#10B981]/40 pb-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
                      <span className="font-bold text-xs text-white">
                        {isHindi ? 'आपातकालीन पास / टोकन जारी' : 'Emergency Pass / Token Active'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-[#10B981]/30 text-[#A7F3D0] px-2 py-0.5 rounded-md font-bold uppercase">
                      CONFIRMED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded-lg bg-black/30">
                      <span className="text-[#94A3B8] block text-[10px]">FACILITY / DESTINATION</span>
                      <span className="font-bold text-white">{activeTicket.facilityName}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/30">
                      <span className="text-[#94A3B8] block text-[10px]">RESERVATION TOKEN</span>
                      <span className="font-bold text-[#FCD34D] text-xs">{activeTicket.tokenNumber}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-black/30 text-[11px] font-mono space-y-1">
                    <div className="text-[#34D399] font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{activeTicket.etaOrTimeSlot}</span>
                    </div>
                    <p className="text-[10px] text-[#D1FAE5] font-sans">
                      {isHindi ? activeTicket.details.instructionsHi : activeTicket.details.instructionsEn}
                    </p>
                  </div>

                  {/* Token Copy & Share Buttons */}
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={handleCopyToken}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-mono font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3 text-[#38BDF8]" />
                      <span>{hasCopiedToken ? (isHindi ? 'कॉपी हो गया!' : 'Copied!') : (isHindi ? 'टोकन कॉपी करें' : 'Copy Token')}</span>
                    </button>
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="py-1.5 px-3 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#064E3B] font-mono font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>{isHindi ? 'पास डाउनलोड' : 'Save Pass'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* IVR INTERACTIVE KEYPAD & TOUCH ACTIONS */}
            {/* ----------------------------------------------------------------- */}
            <div className="p-3 bg-[#0F172A] border-t border-white/10 space-y-2">
              
              <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
                <span className="font-bold text-white flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{isHindi ? 'आईवीआर आपातकालीन सहायता मेन्यू' : 'TOUCH IVR EMERGENCY ASSISTANCE'}</span>
                </span>
                <span className="text-[10px] text-[#38BDF8]">
                  {isHindi ? 'नंबर बटन दबाएं' : 'Press key on dialpad'}
                </span>
              </div>

              {/* Full 1-Click IVR Emergency Number Options */}
              <div className="grid grid-cols-2 gap-1.5">
                
                {/* 1. Hospital Bed */}
                <button
                  onClick={() => handleIvrAction('1', 'hospital_bed')}
                  className="p-2 rounded-xl bg-[#C7352B]/20 hover:bg-[#C7352B]/40 border border-[#C7352B]/50 text-left transition-all active:scale-98 cursor-pointer group hover:border-[#EF4444]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#C7352B] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      1
                    </span>
                    <span className="text-[11px] font-bold text-[#FCA5A5] truncate">
                      {isHindi ? 'अस्पताल आईसीयू बेड' : 'Hospital ICU Bed'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5 truncate pl-6.5">
                    {isHindi ? 'हीट स्ट्रोक इमरजेंसी' : 'Zero-wait hyperthermia triage'}
                  </p>
                </button>

                {/* 2. Cooling Shelter */}
                <button
                  onClick={() => handleIvrAction('2', 'cooling_shelter')}
                  className="p-2 rounded-xl bg-[#0284C7]/20 hover:bg-[#0284C7]/40 border border-[#0284C7]/50 text-left transition-all active:scale-98 cursor-pointer group hover:border-[#38BDF8]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#0284C7] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      2
                    </span>
                    <span className="text-[11px] font-bold text-[#7DD3FC] truncate">
                      {isHindi ? 'शीतलन केंद्र डे-पास' : 'Cooling Center Pass'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5 truncate pl-6.5">
                    {isHindi ? 'एसी शेल्टर व पेयजल' : 'AC shelter & cold hydration'}
                  </p>
                </button>

                {/* 3. Water Tanker */}
                <button
                  onClick={() => handleIvrAction('3', 'water_tanker')}
                  className="p-2 rounded-xl bg-[#0D9488]/20 hover:bg-[#0D9488]/40 border border-[#0D9488]/50 text-left transition-all active:scale-98 cursor-pointer group hover:border-[#2DD4BF]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#0D9488] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      3
                    </span>
                    <span className="text-[11px] font-bold text-[#5EEAD4] truncate">
                      {isHindi ? 'जल/ओआरएस टैंकर' : 'Water/ORS Tanker'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5 truncate pl-6.5">
                    {isHindi ? 'वार्ड में टैंकर प्रेषण' : 'Bowser tanker dispatch'}
                  </p>
                </button>

                {/* 4. 108 Ambulance */}
                <button
                  onClick={() => handleIvrAction('4', 'ambulance_108')}
                  className="p-2 rounded-xl bg-[#D97706]/20 hover:bg-[#D97706]/40 border border-[#D97706]/50 text-left transition-all active:scale-98 cursor-pointer group hover:border-[#FBBF24]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#D97706] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      4
                    </span>
                    <span className="text-[11px] font-bold text-[#FDE68A] truncate">
                      {isHindi ? '१०८ एम्बुलेंस प्रेषण' : '108 Ambulance'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5 truncate pl-6.5">
                    {isHindi ? 'आइस-बाथ मोबाइल यूनिट' : 'Rapid ALS mobile dispatch'}
                  </p>
                </button>

                {/* 5. Doctor Teleconsultation */}
                <button
                  onClick={() => handleIvrAction('5', 'doctor_consult')}
                  className="p-2 rounded-xl bg-[#6366F1]/20 hover:bg-[#6366F1]/40 border border-[#6366F1]/50 text-left transition-all active:scale-98 cursor-pointer group hover:border-[#818CF8]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#6366F1] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      5
                    </span>
                    <span className="text-[11px] font-bold text-[#C7D2FE] truncate">
                      {isHindi ? 'टेली-डॉक्टर परामर्श' : 'Tele-Doctor Consult'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5 truncate pl-6.5">
                    {isHindi ? 'सरकारी डॉक्टर कॉल' : 'Clinical triage callback'}
                  </p>
                </button>

                {/* 9. I Am Safe */}
                <button
                  onClick={() => handleIvrAction('9', 'marked_safe')}
                  className="p-2 rounded-xl bg-[#16A34A]/20 hover:bg-[#16A34A]/40 border border-[#16A34A]/50 text-left transition-all active:scale-98 cursor-pointer group hover:border-[#4ADE80]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#16A34A] text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      9
                    </span>
                    <span className="text-[11px] font-bold text-[#86EFAC] truncate">
                      {isHindi ? 'मैं सुरक्षित हूँ (Safe)' : 'I Am Safe (No Help)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5 truncate pl-6.5">
                    {isHindi ? 'सुरक्षा चेक-इन दर्ज करें' : 'Log welfare & hydration'}
                  </p>
                </button>
              </div>

              {/* Bottom In-Call Controls: Replay Prompt, Speaker, End Call */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/10">
                
                {/* Replay Prompt Button */}
                <button
                  onClick={handleReplayPrompt}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="Replay Voice Instructions"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{isHindi ? 'निर्देश पुनः सुनें' : 'Replay Prompt'}</span>
                </button>

                {/* Speaker Toggle */}
                <button
                  onClick={() => {
                    if (isSpeakerOn) {
                      stopEmergencyAlertSpeech();
                    }
                    setIsSpeakerOn(!isSpeakerOn);
                  }}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    isSpeakerOn
                      ? 'bg-white/10 border-white/20 text-[#38BDF8]'
                      : 'bg-red-500/20 border-red-500/40 text-red-400'
                  }`}
                  title={isSpeakerOn ? 'Speaker On' : 'Speaker Muted'}
                >
                  {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* End Call Button */}
                <button
                  onClick={handleEndCall}
                  className="py-2 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#DC2626]/30 active:scale-95 transition-all cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>{isHindi ? 'कॉल समाप्त' : 'End Call'}</span>
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* 3. CALL ENDED SCREEN */}
        {/* ------------------------------------------------------------------- */}
        {stage === 'ended' && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[420px] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <PhoneOff className="w-8 h-8 text-[#94A3B8]" />
            </div>
            <div>
              <h3 className="text-lg font-headline font-bold text-white">
                {isHindi ? 'कॉल समाप्त' : 'Call Completed'}
              </h3>
              <p className="text-xs font-mono text-[#94A3B8] mt-1">
                Duration: {formatTime(callSeconds)} • {city.name}
              </p>
            </div>
            {activeTicket && (
              <div className="p-3 rounded-xl bg-[#064E3B] border border-[#10B981] text-xs text-[#A7F3D0]">
                <p className="font-bold text-white">{activeTicket.titleEn}</p>
                <p className="text-[11px] font-mono mt-0.5">Token: {activeTicket.tokenNumber} (Saved)</p>
              </div>
            )}
            <p className="text-[11px] text-[#64748B]">
              HeatShield AI Safety Desk will remain on standby. Stay hydrated!
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
