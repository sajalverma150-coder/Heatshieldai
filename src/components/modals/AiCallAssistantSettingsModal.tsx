import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  X, 
  Check, 
  ShieldCheck, 
  AlertOctagon, 
  Sparkles, 
  Settings, 
  Clock, 
  MapPin, 
  Trash2, 
  Download, 
  QrCode, 
  Building2, 
  CheckCircle2, 
  Volume2, 
  Flame, 
  Truck,
  PhoneForwarded
} from 'lucide-react';
import { LanguageCode, UserHealthProfile, WeatherTelemetry } from '../../types';
import { CityData } from '../../data/indiaCities';
import { 
  CallAssistantSettings, 
  DEFAULT_CALL_SETTINGS, 
  loadCallAssistantSettings, 
  saveCallAssistantSettings,
  AssistanceTicket,
  loadAssistanceTickets,
  deleteAssistanceTicket
} from '../../services/aiCallAssistantService';

interface AiCallAssistantSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: CityData;
  weather: WeatherTelemetry;
  userProfile: UserHealthProfile;
  language?: LanguageCode;
  onTriggerTestCall: () => void;
}

export const AiCallAssistantSettingsModal: React.FC<AiCallAssistantSettingsModalProps> = ({
  isOpen,
  onClose,
  city,
  weather,
  userProfile,
  language = 'en',
  onTriggerTestCall,
}) => {
  const [settings, setSettings] = useState<CallAssistantSettings>(loadCallAssistantSettings());
  const [tickets, setTickets] = useState<AssistanceTicket[]>([]);
  const [activeTab, setActiveTab] = useState<'config' | 'tickets'>('config');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const isHindi = language === 'hi';

  useEffect(() => {
    if (isOpen) {
      setSettings(loadCallAssistantSettings());
      setTickets(loadAssistanceTickets());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveCallAssistantSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleDeleteTicket = (id: string) => {
    deleteAssistanceTicket(id);
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#12304A]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-[#135A9C] rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden text-[#263746] my-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#D6E0E5] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#135A9C]/10 border border-[#135A9C]/30 flex items-center justify-center text-[#135A9C]">
              <PhoneCall className="w-5 h-5 text-[#135A9C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-headline font-bold text-[#12304A]">
                  {isHindi ? 'एआई कॉल सहायक एवं आपातकालीन हॉटलाइन' : 'AI Call Assistant & Emergency Dispatch Hub'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#16804A]/10 text-[#16804A] font-bold border border-[#16804A]/30">
                  AUTO-ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#526273]">
                {isHindi 
                  ? 'अत्यधिक ताप अलर्ट पर स्वचालित सहायता कॉल एवं अस्पताल/शीतलन केंद्र बुकिंग' 
                  : 'Automated outgoing welfare voice call & IVR reservation on severe heatwave triggers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#526273] hover:text-[#12304A] p-1.5 rounded-lg hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F1EA] rounded-xl mb-4 border border-[#D6E0E5]">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'config'
                ? 'bg-[#135A9C] text-white shadow-xs'
                : 'text-[#526273] hover:text-[#12304A]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isHindi ? 'स्वचालित कॉल सेटिंग्स' : 'Auto-Call Configuration'}</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-[#135A9C] text-white shadow-xs'
                : 'text-[#526273] hover:text-[#12304A]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isHindi ? `सक्रिय आरक्षण पास (${tickets.length})` : `Active Passes & Bookings (${tickets.length})`}</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: CONFIGURATION & SIMULATION */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            
            {/* Main Toggle: Auto-Call */}
            <div className="p-3.5 rounded-xl bg-[#F0F7FD] border border-[#B8D5ED] flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#12304A] flex items-center gap-1.5">
                  <PhoneForwarded className="w-4 h-4 text-[#135A9C]" />
                  <span>{isHindi ? 'अत्यधिक ताप अलर्ट पर स्वचालित कॉल' : 'Automatic Outbound Call on Heatwaves'}</span>
                </div>
                <p className="text-[11px] text-[#526273]">
                  {isHindi 
                    ? 'तापमान या वेट-बल्ब सीमा पार होने पर एआई कॉल सहायक तुरंत सुरक्षा जांच करेगा' 
                    : 'AI calls automatically to verify citizen safety and offer immediate hospital beds or cooling shelters.'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoCallEnabled}
                  onChange={(e) => setSettings({ ...settings, autoCallEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#135A9C]"></div>
              </label>
            </div>

            {/* Threshold Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#D6E0E5] space-y-1.5">
                <label className="text-[11px] font-mono text-[#526273] font-semibold block">
                  {isHindi ? 'तापमान ट्रिगर सीमा (°C)' : 'TEMPERATURE TRIGGER (°C)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="35"
                    max="50"
                    value={settings.triggerTempThreshold}
                    onChange={(e) => setSettings({ ...settings, triggerTempThreshold: parseFloat(e.target.value) || 40 })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-[#D6E0E5] rounded-lg focus:outline-none focus:border-[#135A9C]"
                  />
                  <span className="text-xs text-[#526273] font-mono">°C</span>
                </div>
                <span className="text-[10px] text-[#8695A0]">Current: {weather.dryBulbTemp}°C ({city.name})</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#D6E0E5] space-y-1.5">
                <label className="text-[11px] font-mono text-[#526273] font-semibold block">
                  {isHindi ? 'वेट-बल्ब ग्लोब (WBGT) सीमा (°C)' : 'WBGT TRIGGER THRESHOLD (°C)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="28"
                    max="38"
                    value={settings.triggerWbgtThreshold}
                    onChange={(e) => setSettings({ ...settings, triggerWbgtThreshold: parseFloat(e.target.value) || 31 })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-[#D6E0E5] rounded-lg focus:outline-none focus:border-[#135A9C]"
                  />
                  <span className="text-xs text-[#526273] font-mono">°C</span>
                </div>
                <span className="text-[10px] text-[#8695A0]">Current: {weather.wbgt}°C</span>
              </div>
            </div>

            {/* Contact Phone & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#D6E0E5] space-y-1.5">
                <label className="text-[11px] font-mono text-[#526273] font-semibold block">
                  {isHindi ? 'नागरिक मोबाइल नंबर (कॉल हेतु)' : 'CITIZEN PHONE NUMBER'}
                </label>
                <input
                  type="text"
                  value={settings.phoneNumber}
                  onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-[#D6E0E5] rounded-lg focus:outline-none focus:border-[#135A9C]"
                  placeholder="+91 98200 44108"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#D6E0E5] space-y-1.5">
                <label className="text-[11px] font-mono text-[#526273] font-semibold block">
                  {isHindi ? 'कॉल सहायक पसंदीदा भाषा' : 'AI VOICE CALL LANGUAGE'}
                </label>
                <select
                  value={settings.preferredLanguage}
                  onChange={(e) => setSettings({ ...settings, preferredLanguage: e.target.value as LanguageCode })}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-[#D6E0E5] rounded-lg focus:outline-none focus:border-[#135A9C]"
                >
                  <option value="en">English (Voice & IVR)</option>
                  <option value="hi">हिन्दी (Hindi Voice & IVR)</option>
                </select>
              </div>
            </div>

            {/* LIVE TEST CALL SIMULATOR BUTTON */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#12304A] to-[#1E3A8A] text-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                  <span className="text-xs font-headline font-bold">
                    {isHindi ? 'लाइव एआई कॉल सिम्युलेटर' : 'Live Heatwave Call Simulation'}
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-[#38BDF8]/20 text-[#7DD3FC] px-2 py-0.5 rounded">
                  24x7 REAL-TIME
                </span>
              </div>
              <p className="text-[11px] text-[#CBD5E1]">
                {isHindi 
                  ? 'तुरंत परीक्षण करें कि लू के समय एआई कॉल कैसे अस्पताल बेड, शीतलन केंद्र और जल टैंकर की बुकिंग करती है।' 
                  : 'Test the automated outgoing voice call immediately to experience the IVR triage dialogue and reservation workflow.'}
              </p>
              <button
                onClick={() => {
                  onClose();
                  onTriggerTestCall();
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-[#38BDF8] hover:bg-[#0284C7] text-[#0A192F] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-md cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{isHindi ? 'अभी स्वचालित कॉल प्राप्त करें (Test Call Now)' : 'Initiate AI Emergency Test Call Now'}</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-[#F0F4F8] hover:bg-[#D9E2EC] text-[#12304A] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-[#135A9C] hover:bg-[#0E4375] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                {saveSuccess ? <Check className="w-4 h-4" /> : null}
                <span>{saveSuccess ? (isHindi ? 'सेव हो गया!' : 'Settings Saved!') : (isHindi ? 'सेटिंग्स सेव करें' : 'Save Configuration')}</span>
              </button>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: ACTIVE RESERVATION PASSES & BOOKINGS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'tickets' && (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#657783] bg-[#FAF9F5] rounded-xl border border-dashed border-[#D6E0E5] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <p className="font-bold text-[#12304A]">
                  {isHindi ? 'कोई सक्रिय आरक्षण नहीं' : 'No Active Assistance Passes'}
                </p>
                <p className="text-[11px]">
                  {isHindi 
                    ? 'जब आप एआई कॉल सहायक से अस्पताल बेड या शीतलन केंद्र आरक्षित करेंगे, वे यहाँ दिखाई देंगे।' 
                    : 'When you reserve hospital beds, cooling shelters, or water tankers via the AI call assistant, verified passes will appear here.'}
                </p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#16804A] font-bold uppercase">
                        {ticket.details.serviceCode}
                      </span>
                      <h4 className="font-headline font-bold text-[#12304A] text-xs">
                        {isHindi ? ticket.titleHi : ticket.titleEn}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#16804A] text-white">
                        {ticket.status}
                      </span>
                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="text-[#94A3B8] hover:text-[#DC2626] p-1 rounded transition-colors cursor-pointer"
                        title="Delete Pass"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2 rounded-lg border border-[#D6E0E5]">
                    <div>
                      <span className="text-[#657783] block text-[10px]">FACILITY</span>
                      <span className="font-bold text-[#12304A] truncate block">{ticket.facilityName}</span>
                    </div>
                    <div>
                      <span className="text-[#657783] block text-[10px]">TOKEN #</span>
                      <span className="font-bold text-[#135A9C]">{ticket.tokenNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#526273]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#16804A]" /> {ticket.etaOrTimeSlot}
                    </span>
                    <span>{ticket.timestamp}</span>
                  </div>

                  <p className="text-[10px] text-[#263746]">
                    {isHindi ? ticket.details.instructionsHi : ticket.details.instructionsEn}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};
