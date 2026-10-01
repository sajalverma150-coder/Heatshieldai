import React, { useState } from 'react';
import {
  Building2,
  AlertTriangle,
  HeartPulse,
  Droplets,
  HardHat,
  ShieldAlert,
  Send,
  CheckCircle2,
  Clock,
  Users,
  Radio,
  FileText,
  Truck,
  Flame,
  Activity,
  Lock,
  Download
} from 'lucide-react';
import { WeatherTelemetry, LanguageCode, UserRole } from '../../types';
import { CityData } from '../../data/indiaCities';

interface DistrictOperationsViewProps {
  weather: WeatherTelemetry;
  selectedCity: CityData;
  language: LanguageCode;
  isAdminAuthenticated: boolean;
  onOpenAdminAuth?: () => void;
  onOpenAdminAuthModal?: () => void;
  onTriggerSOS?: () => void;
  onLockAdminSession?: () => void;
}

export const DistrictOperationsView: React.FC<DistrictOperationsViewProps> = ({
  weather,
  selectedCity,
  language,
  isAdminAuthenticated,
  onOpenAdminAuth,
  onOpenAdminAuthModal,
  onTriggerSOS,
  onLockAdminSession,
}) => {
  const isHindi = language === 'hi';
  const handleOpenAuth = onOpenAdminAuth || onOpenAdminAuthModal;
  const [activeTab, setActiveTab] = useState<'hospitals' | 'water' | 'labor' | 'alerts'>('hospitals');
  const [curfewEnforced, setCurfewEnforced] = useState(true);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [alertMessage, setAlertMessage] = useState(
    `MUNICIPAL HEAT ADVISORY: Outdoor work suspended during peak solar hours (12:00 - 15:30 IST) for ${selectedCity.name}. Chilled ORS stations operational at all municipal transit nodes.`
  );

  const [hospitalsList, setHospitalsList] = useState([
    { name: 'District Civil Hospital Trauma & Heat Unit', totalBeds: 120, occupied: 78, iceImmersionBaths: 6, ivFluidsUnits: 1400, status: 'NORMAL' },
    { name: 'Municipal Community Health Centre (Central)', totalBeds: 60, occupied: 42, iceImmersionBaths: 4, ivFluidsUnits: 650, status: 'NORMAL' },
    { name: 'Sub-Divisional Hospital Heat Stroke Ward', totalBeds: 35, occupied: 24, iceImmersionBaths: 2, ivFluidsUnits: 320, status: 'NORMAL' },
    { name: 'Red Cross Mobile Triage Outpost #1', totalBeds: 20, occupied: 8, iceImmersionBaths: 3, ivFluidsUnits: 500, status: 'READY' },
  ]);

  const [waterTankersList, setWaterTankersList] = useState([
    { id: 'WT-01', location: `${selectedCity.name} Central Market Chowk`, capacity: '12,000L', dispensed: '9,400L', status: 'DISPENSING', driver: 'R. Sharma (+91-9871XXXXXX)' },
    { id: 'WT-02', location: `${selectedCity.name} Railway Station Gate 2`, capacity: '10,000L', dispensed: '10,000L', status: 'REFILLING', driver: 'K. Meena (+91-9810XXXXXX)' },
    { id: 'WT-03', location: 'Labor Mandi Transit Shed', capacity: '15,000L', dispensed: '11,200L', status: 'DISPENSING', driver: 'M. Singh (+91-9829XXXXXX)' },
    { id: 'WT-04', location: 'Urban Slum Cluster Sector 18', capacity: '10,000L', dispensed: '4,500L', status: 'EN ROUTE', driver: 'V. Yadav (+91-9833XXXXXX)' },
  ]);

  const handleCurfewToggle = () => {
    if (!isAdminAuthenticated && handleOpenAuth) {
      handleOpenAuth();
      return;
    }
    setCurfewEnforced(!curfewEnforced);
  };

  const handleSendBroadcast = () => {
    if (!isAdminAuthenticated && handleOpenAuth) {
      handleOpenAuth();
      return;
    }
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner - Executive DEOC Command Center */}
      <div className="rounded-2xl p-5 sm:p-6 gov-hero-command border border-[#1E4373] text-white shadow-lg relative overflow-hidden">
        {/* Subtle Watermark */}
        <div 
          className="absolute -right-8 -bottom-10 w-64 h-64 opacity-[0.05] pointer-events-none select-none"
          aria-hidden="true"
        >
          <Building2 className="w-full h-full text-white" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase bg-[#135A9C] px-2.5 py-0.5 rounded-full font-bold text-white shadow-xs">
                DISTRICT OPERATIONS LAYER
              </span>
              <span className="text-xs text-[#E5A93C] font-mono flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-3.5 h-3.5" />
                NDMA Heat Action Plan (HAP) Level 3 Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 tracking-tight">
              {selectedCity.name} {isHindi ? 'जिला आपातकालीन संचालन केंद्र' : 'District Emergency Operations Center (DEOC)'}
            </h1>
            <p className="text-xs sm:text-sm text-[#93C5FD] mt-1 font-normal">
              {selectedCity.state} · Control Node: DEOC-{selectedCity.id.toUpperCase()}-01 · Duty Incident Commander: District Magistrate
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isAdminAuthenticated ? (
              <button
                id="district-sign-in-officer-btn"
                onClick={handleOpenAuth}
                className="px-4 py-2 rounded-lg bg-[#E5A93C] hover:bg-[#D99B26] text-[#07162C] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-[1.02]"
              >
                <Lock className="w-3.5 h-3.5 text-[#07162C]" />
                <span>{isHindi ? 'अधिकारी लॉगिन करें' : 'Sign In as Officer'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-[#16804A] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs border border-green-400/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorized Officer Mode</span>
                </span>
                {onLockAdminSession && (
                  <button
                    onClick={onLockAdminSession}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-colors cursor-pointer"
                  >
                    Lock Session
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 Quick Status Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="gov-card p-3.5">
          <span className="text-[11px] text-[#526273] block">Dedicated Heat Beds</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-[#0B1F3A]">175 / 235</span>
            <span className="text-xs font-mono text-[#E87500] font-bold">74% Occ.</span>
          </div>
          <span className="text-[10px] text-[#526273] block mt-0.5">60 surge beds ready in reserve</span>
        </div>

        <div className="gov-card p-3.5">
          <span className="text-[11px] text-[#526273] block">Active Water Tankers</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-[#0B1F3A]">14 Bowsers</span>
          </div>
          <span className="text-[10px] text-[#16804A] font-semibold block mt-0.5">35,100L dispensed today</span>
        </div>

        <div className="gov-card p-3.5">
          <span className="text-[11px] text-[#526273] block">Outdoor Labor Curfew</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono text-white ${curfewEnforced ? 'bg-[#C7352B]' : 'bg-[#526273]'}`}>
              {curfewEnforced ? 'ENFORCED 12-16 IST' : 'SUSPENDED'}
            </span>
          </div>
          <span className="text-[10px] text-[#526273] block mt-0.5">94 sites inspected today</span>
        </div>

        <div className="gov-card p-3.5">
          <span className="text-[11px] text-[#526273] block">CAP Broadcast Reach</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-[#0B1F3A]">482,000</span>
            <span className="text-xs text-[#526273]">subscribers</span>
          </div>
          <span className="text-[10px] text-[#526273] block mt-0.5">Via Telecom Cell Broadcast</span>
        </div>
      </div>

      {/* Main Operations Tabs */}
      <div className="gov-card">
        <div className="border-b border-[#D9E2EC] p-2 flex items-center gap-2 overflow-x-auto no-scrollbar bg-[#F5F8FB]">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hospitals' ? 'bg-[#135A9C] text-white' : 'text-[#526273] hover:text-[#0B1F3A]'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Hospital Surge & ICU Readiness</span>
          </button>

          <button
            onClick={() => setActiveTab('water')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'water' ? 'bg-[#135A9C] text-white' : 'text-[#526273] hover:text-[#0B1F3A]'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Municipal Water Tanker Logistics</span>
          </button>

          <button
            onClick={() => setActiveTab('labor')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'labor' ? 'bg-[#135A9C] text-white' : 'text-[#526273] hover:text-[#0B1F3A]'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Workplace Safety & Curfew Enforcement</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'alerts' ? 'bg-[#135A9C] text-white' : 'text-[#526273] hover:text-[#0B1F3A]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Emergency Broadcasts (CAP)</span>
          </button>
        </div>

        {/* Tab 1: Hospitals */}
        {activeTab === 'hospitals' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0B1F3A]">
                District Heat Illness Bed Capacity & Ice Immersion Facilities
              </h3>
              <span className="text-xs text-[#526273] font-mono">Real-time EHR sync</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#F5F8FB] text-[#526273] font-mono border-b border-[#D9E2EC]">
                  <tr>
                    <th className="p-2.5">Hospital Name</th>
                    <th className="p-2.5">Heat Ward Beds</th>
                    <th className="p-2.5">Occupancy</th>
                    <th className="p-2.5">Ice Immersion Tubs</th>
                    <th className="p-2.5">Normal Saline (IV)</th>
                    <th className="p-2.5 text-right">Triage Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]">
                  {hospitalsList.map((h, i) => (
                    <tr key={i} className="hover:bg-[#F5F8FB]">
                      <td className="p-2.5 font-bold text-[#0B1F3A]">{h.name}</td>
                      <td className="p-2.5 font-mono">{h.occupied} / {h.totalBeds}</td>
                      <td className="p-2.5 font-mono">
                        <div className="w-24 bg-[#D9E2EC] h-2 rounded overflow-hidden">
                          <div 
                            className="bg-[#135A9C] h-full" 
                            style={{ width: `${Math.round((h.occupied / h.totalBeds) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#526273]">{Math.round((h.occupied / h.totalBeds) * 100)}%</span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-[#16804A]">{h.iceImmersionBaths} operational</td>
                      <td className="p-2.5 font-mono">{h.ivFluidsUnits} units</td>
                      <td className="p-2.5 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.status === 'HIGH LOAD' ? 'bg-[#FDF0EE] text-[#C7352B]' : 'bg-[#EAF6EE] text-[#16804A]'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Water Tankers */}
        {activeTab === 'water' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0B1F3A]">
                Jal Sansthan Mobile Chilled Water Tankers Fleet Tracking
              </h3>
              <span className="text-xs text-[#16804A] font-semibold">GPS Feeds Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {waterTankersList.map((wt) => (
                <div key={wt.id} className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#135A9C]">{wt.id} • {wt.location}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      wt.status === 'DISPENSING' ? 'bg-[#EAF6EE] text-[#16804A]' : 'bg-[#FFFBEA] text-[#8C6400]'
                    }`}>
                      {wt.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#526273] pt-1">
                    <span>Capacity: {wt.capacity}</span>
                    <span>Dispensed: <strong className="text-[#0B1F3A]">{wt.dispensed}</strong></span>
                  </div>
                  <div className="text-[11px] text-[#526273] font-mono">
                    Driver: {wt.driver}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Workplace Safety */}
        {activeTab === 'labor' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-[#0B1F3A]">
                  Section 34 Disaster Management Mandatory Labor Restrictions
                </h3>
                <p className="text-[#526273]">
                  Requires work stoppage from 12:00 to 16:00 IST for open-sky sites during Red/Orange Alerts.
                </p>
              </div>

              <button
                onClick={handleCurfewToggle}
                className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-colors ${
                  curfewEnforced ? 'bg-[#C7352B] text-white' : 'bg-[#16804A] text-white'
                }`}
              >
                {curfewEnforced ? 'Revoke Curfew' : 'Issue Mandatory Curfew'}
              </button>
            </div>

            <div className="p-3 bg-[#F5F8FB] rounded border border-[#D9E2EC] space-y-2">
              <div className="font-bold text-[#0B1F3A]">Inspection Summary (Last 24 Hours):</div>
              <ul className="space-y-1 text-[#526273] list-disc list-inside">
                <li>108 Construction and infrastructure sites inspected by Labor Welfare Officers</li>
                <li>102 Sites found compliant with mandatory shade structures and cold ORS stations</li>
                <li>6 Stop-work violation notices served with penalties issued to contractors</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: Broadcasts */}
        {activeTab === 'alerts' && (
          <div className="p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#0B1F3A]">
              Issue Official Common Alerting Protocol (CAP) Broadcast
            </h3>
            <p className="text-[#526273]">
              Sends high-priority geo-targeted push alerts and multilingual automated voice OBD calls to citizens in {selectedCity.name}.
            </p>

            <div className="space-y-2">
              <label className="font-semibold text-[#0B1F3A] block">Alert Text (English & Hindi):</label>
              <textarea
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded border border-[#D9E2EC] text-xs font-mono bg-white focus:outline-none focus:border-[#135A9C]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-[#526273]">
                Target Area: <strong>{selectedCity.name} Municipal Limits + Rural Periphery</strong>
              </div>

              <button
                onClick={handleSendBroadcast}
                className="px-4 py-2 rounded bg-[#C7352B] hover:bg-[#A82B23] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{broadcastSent ? 'Broadcast Dispatched!' : 'Transmit CAP Alert'}</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
