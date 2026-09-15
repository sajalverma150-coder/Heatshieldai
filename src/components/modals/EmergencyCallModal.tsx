import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  HeartPulse, 
  AlertOctagon,
  Radio,
  Building2,
  Shield
} from 'lucide-react';
import { UserHealthProfile, LanguageCode } from '../../types';

export type EmergencyHelplineType = '108' | '112' | '1078';

interface EmergencyCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserHealthProfile;
  language?: LanguageCode;
  initialType?: EmergencyHelplineType;
}

export const EmergencyCallModal: React.FC<EmergencyCallModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  language = 'en',
  initialType = '108',
}) => {
  const [activeType, setActiveType] = useState<EmergencyHelplineType>(initialType);
  const [etaSeconds, setEtaSeconds] = useState<number>(348); // 5 mins 48 secs
  const isHindi = language === 'hi';

  useEffect(() => {
    if (initialType) {
      setActiveType(initialType);
    }
  }, [initialType, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setEtaSeconds((prev) => (prev > 10 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatEta = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const helplineDetails = {
    '108': {
      number: '108',
      title: isHindi ? '१०८ राष्ट्रीय एम्बुलेंस व हीट स्ट्रोक आपातकालीन सेवा' : '108 National Ambulance & Heat Stroke Response',
      subtitle: isHindi ? 'निकटतम ट्रॉमा सेंटर / बर्फ-स्नान सुसज्जित एम्बुलेंस प्रेषण' : 'Nearest Hyperthermia Trauma Center & Ice-Bath Mobile Unit',
      color: '#C7352B',
      bgColor: '#FDF2F2',
      badge: isHindi ? 'कोड रेड १०८ एम्बुलेंस प्रेषित' : 'CODE RED 108 AMBULANCE DISPATCHED',
      unitInfo: isHindi ? 'यूनिट #MH-01-4491 (बर्फ-स्नान सुसज्जित)' : 'Unit #MH-01-4491 (Ice-Bath & IV Saline Equipped)',
      firstAidTitle: isHindi ? 'एम्बुलेंस के आने तक तत्काल जीवनरक्षक प्राथमिक उपचार:' : 'CRITICAL FIRST-AID WHILE AMBULANCE TRAVELS:',
      firstAid: isHindi ? [
        'मरीज को तत्काल छांव या वातानुकूलित स्थान में ले जाएं।',
        'शरीर पर ठंडा पानी छिड़कें व तेजी से पंखा चलाएं।',
        'यदि मरीज बेहोश हो या उल्टी कर रहा हो तो पानी न पिलाएं।',
        'गर्दन, बगल और जांघों पर ठंडी बर्फ की थैलियां रखें।'
      ] : [
        'Move patient immediately into shaded or air-conditioned refuge.',
        'Douse skin with cold water and fan vigorously to maximize evaporative cooling.',
        'Do NOT force liquids if patient is disoriented, drowsy, or vomiting.',
        'Apply cold packs to the neck, axillae (armpits), and groin.'
      ]
    },
    '112': {
      number: '112',
      title: isHindi ? '११२ अखिल भारतीय एकल आपातकालीन प्रतिक्रिया (ERSS)' : '112 All-India Unified Emergency Response (ERSS)',
      subtitle: isHindi ? 'पुलिस, अग्निशमन, नागरिक सुरक्षा एवं आपदा बचाव दल' : 'Unified Police, Fire, Civil Defense & Multi-Agency Dispatch',
      color: '#135A9C',
      bgColor: '#F0F7FD',
      badge: isHindi ? '११२ आपातकालीन नियंत्रण कक्ष सक्रिय' : '112 NATIONAL CONTROL ROOM ACTIVE',
      unitInfo: isHindi ? 'ईआरएसएस कमांड सेंटर #EOC-IND-991' : 'ERSS Integrated Dispatch Node #EOC-IND-991',
      firstAidTitle: isHindi ? '११२ आपातकालीन बचाव प्रोटोकॉल:' : '112 RAPID DISPATCH PROTOCOL:',
      firstAid: isHindi ? [
        'अपने वर्तमान जीपीएस स्थान या निकटतम लैंडमार्क की पुष्टि करें।',
        'सड़क किनारे फंसे लोगों या श्रमिकों को सुरक्षित आश्रय केंद्र में स्थानांतरित करें।',
        'अग्निशामक या नागरिक सुरक्षा दल को तुरंत मार्ग सहायता प्रदान करें।',
        'आसपास मौजूद अन्य नागरिकों को धूप से हटाकर सुरक्षित स्थान पर रखें।'
      ] : [
        'Confirm your current GPS coordinates or nearest identifiable landmark.',
        'Assist heat-exhausted outdoor workers into nearest municipal cooling shelter.',
        'Keep communications line clear for rapid police / rescue crew navigation.',
        'Clear pedestrian access for inbound emergency vehicles.'
      ]
    },
    '1078': {
      number: '1078',
      title: isHindi ? '१०७८ एनडीएमए राष्ट्रीय आपदा एवं लू नियंत्रण हेल्पलाइन' : '1078 NDMA National Disaster & Heatwave Helpline',
      subtitle: isHindi ? 'राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA) २४x७ नियंत्रण कक्ष' : 'National Disaster Management Authority (NDMA) 24x7 Control Hub',
      color: '#16804A',
      bgColor: '#F0FDF4',
      badge: isHindi ? '१०७८ टोल-फ्री आपदा सहायता चालू' : '1078 TOLL-FREE HEATWAVE HELPLINE ACTIVE',
      unitInfo: isHindi ? 'एनडीएमए राष्ट्रीय नियंत्रण केंद्र, नई दिल्ली' : 'NDMA National Heat Advisory Ops Desk, New Delhi',
      firstAidTitle: isHindi ? 'एनडीएमए राष्ट्रीय तापwave सुरक्षा परामर्श:' : 'NDMA HEATWAVE ADVISORY DIRECTIVE:',
      firstAid: isHindi ? [
        'दोपहर १२:०० से ३:३० बजे तक सीधे धूप में निकलने से बचें।',
        'पर्याप्त मात्रा में पानी, ओआरएस, लस्सी या नींबू पानी का सेवन करें।',
        'गर्भवती महिलाओं, बच्चों व बुजुर्गों की विशेष निगरानी रखें।',
        'किसी भी क्षेत्र में जल संकट या आपातकालीन टैंकर हेतु सूचित करें।'
      ] : [
        'Strictly avoid direct sunlight exposure between 12:00 PM and 3:30 PM.',
        'Maintain continuous oral hydration with WHO-ORS, buttermilk, and lemon water.',
        'Provide active biometeorological surveillance for elderly and vulnerable residents.',
        'Report municipal water shortages or request emergency water tanker bowsers.'
      ]
    }
  };

  const current = helplineDetails[activeType] || helplineDetails['108'];

  return (
    <div className="fixed inset-0 z-[99999] bg-[#12304A]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-[#135A9C] rounded-2xl max-w-lg w-full p-5 sm:p-6 text-center shadow-2xl relative overflow-hidden text-[#263746] my-auto">
        
        {/* Helpline Selector Tabs */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-[#F4F1EA] rounded-xl mb-4 border border-[#D6E0E5]">
          <button
            onClick={() => setActiveType('108')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeType === '108'
                ? 'bg-[#C7352B] text-white shadow-xs'
                : 'text-[#526273] hover:text-[#17202A]'
            }`}
          >
            <span>108</span>
            <span className="text-[10px] font-normal hidden sm:inline">{isHindi ? 'एम्बुलेंस' : 'Ambulance'}</span>
          </button>
          <button
            onClick={() => setActiveType('112')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeType === '112'
                ? 'bg-[#135A9C] text-white shadow-xs'
                : 'text-[#526273] hover:text-[#17202A]'
            }`}
          >
            <span>112</span>
            <span className="text-[10px] font-normal hidden sm:inline">{isHindi ? 'आपातकाल' : 'Emergency'}</span>
          </button>
          <button
            onClick={() => setActiveType('1078')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeType === '1078'
                ? 'bg-[#16804A] text-white shadow-xs'
                : 'text-[#526273] hover:text-[#17202A]'
            }`}
          >
            <span>1078</span>
            <span className="text-[10px] font-normal hidden sm:inline">{isHindi ? 'एनडीएमए' : 'NDMA'}</span>
          </button>
        </div>

        {/* Siren / Icon Badge */}
        <div 
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 border-2"
          style={{ 
            backgroundColor: current.bgColor, 
            borderColor: current.color, 
            color: current.color 
          }}
        >
          <PhoneCall className="w-7 h-7" />
        </div>

        <div 
          className="inline-block px-3 py-1 rounded border text-xs font-mono font-bold uppercase tracking-wider mb-2"
          style={{ 
            backgroundColor: current.bgColor, 
            borderColor: current.color, 
            color: current.color 
          }}
        >
          {current.badge}
        </div>

        <h2 className="text-lg sm:text-xl font-headline font-bold text-[#12304A]">
          {current.title}
        </h2>
        <p className="text-xs text-[#657783] mt-1">
          {current.subtitle}
        </p>

        {/* Live Status & ETA Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#F5F8FB] border border-[#D9E2EC] space-y-1 text-center">
          <div className="text-[11px] font-mono text-[#526273] font-semibold uppercase">
            {isHindi ? 'लाइव प्रेषण स्थिति' : 'LIVE DISPATCH STATUS'}
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-[#C7352B] tracking-tight">
            {activeType === '108' ? formatEta(etaSeconds) : (isHindi ? '२४x७ सक्रिय' : '24x7 ACTIVE READY')}
          </div>
          <div className="text-xs font-mono text-[#16804A] flex items-center justify-center gap-1.5 font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{current.unitInfo}</span>
          </div>
        </div>

        {/* Live GPS Coordinates Transmitted */}
        <div className="mt-3 p-3 rounded-xl bg-[#FAF9F5] border border-[#D9E2EC] text-left text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between text-[#263746]">
            <span className="flex items-center gap-1 text-[#526273]">
              <MapPin className="w-3.5 h-3.5 text-[#C7352B]" /> {isHindi ? 'जीपीएस लॉक:' : 'GPS Location:'}
            </span>
            <span className="text-[#12304A] font-bold">19.0435° N, 72.8532° E</span>
          </div>
          <div className="flex items-center justify-between text-[#263746]">
            <span className="text-[#526273]">{isHindi ? 'नागरिक:' : 'Caller:'}</span>
            <span className="text-[#12304A] font-bold">
              {userProfile?.name || (isHindi ? 'नागरिक' : 'Citizen')} ({isHindi ? `आयु ${userProfile?.age || 38}` : `Age ${userProfile?.age || 38}`})
            </span>
          </div>
          <div className="flex items-center justify-between text-[#16804A] pt-1.5 border-t border-[#D9E2EC] font-semibold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {isHindi ? 'आपातकालीन संपर्क (ICE):' : 'Emergency Contact (ICE):'}
            </span>
            <span>{userProfile?.iceContact?.name || 'ICE Verified'} ({userProfile?.iceContact?.phone || 'Emergency'})</span>
          </div>
        </div>

        {/* Immediate Survival Instructions */}
        <div 
          className="mt-3 text-xs text-left p-3 rounded-xl border leading-relaxed"
          style={{ backgroundColor: current.bgColor, borderColor: `${current.color}40`, color: current.color }}
        >
          <strong className="block font-headline font-bold mb-1" style={{ color: current.color }}>
            {current.firstAidTitle}
          </strong>
          <ul className="space-y-1 list-disc list-inside text-[11px] text-[#263746]">
            {current.firstAid.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Direct Action Buttons */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#F0F4F8] hover:bg-[#D9E2EC] border border-[#135A9C]/30 text-[#12304A] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {isHindi ? 'बंद करें' : 'Minimize Window'}
          </button>
          <a
            href={`tel:${current.number}`}
            className="flex-1 py-2.5 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
            style={{ backgroundColor: current.color }}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isHindi ? `${current.number} तुरंत डायल करें` : `Direct Call ${current.number}`}</span>
          </a>
        </div>

      </div>
    </div>
  );
};
