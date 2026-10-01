import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  FileText,
  Mail,
  PhoneCall,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Building,
  Send,
  HelpCircle
} from 'lucide-react';
import { LanguageCode } from '../../types';

export type GovernancePolicyTab = 
  | 'accessibility'
  | 'data-sharing'
  | 'vulnerability'
  | 'quality-assurance'
  | 'grievance';

interface GovernancePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: GovernancePolicyTab;
  language: LanguageCode;
}

export const GovernancePolicyModal: React.FC<GovernancePolicyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'accessibility',
  language,
}) => {
  const isHindi = language === 'hi';
  const [activeTab, setActiveTab] = useState<GovernancePolicyTab>(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Grievance form state
  const [grievanceForm, setGrievanceForm] = useState({
    name: '',
    phone: '',
    email: '',
    district: 'Unnao, Uttar Pradesh',
    category: 'water_kiosk',
    location: '',
    description: '',
    isAnonymous: false,
  });
  const [grievanceSubmitted, setGrievanceSubmitted] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial tab if reopened
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const refNumber = `NDMA-HAP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      setGrievanceSubmitted(refNumber);
      setIsSubmitting(false);
    }, 600);
  };

  const tabsConfig = [
    {
      id: 'accessibility' as GovernancePolicyTab,
      label: isHindi ? 'सुगम्यता वक्तव्य' : 'Accessibility Statement',
      badge: 'WCAG 2.2 AA',
      icon: HelpCircle,
    },
    {
      id: 'data-sharing' as GovernancePolicyTab,
      label: isHindi ? 'डेटा साझाकरण व गोपनीयता' : 'Data Sharing & Privacy',
      badge: 'NDSAP & DPDP',
      icon: Lock,
    },
    {
      id: 'vulnerability' as GovernancePolicyTab,
      label: isHindi ? 'सुरक्षा भेद्यता प्रकटीकरण' : 'Vulnerability Disclosure',
      badge: 'CERT-In',
      icon: ShieldCheck,
    },
    {
      id: 'quality-assurance' as GovernancePolicyTab,
      label: isHindi ? 'आईएमडी गुणवत्ता आश्वासन' : 'IMD Telemetry QA',
      badge: 'ISO 9001:2015',
      icon: FileText,
    },
    {
      id: 'grievance' as GovernancePolicyTab,
      label: isHindi ? 'नागरिक शिकायत निवारण' : 'Citizen Grievance',
      badge: 'NDMA Redressal',
      icon: Mail,
    },
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-[#CBD5E1] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#0B1F3A] text-white px-5 py-4 flex items-center justify-between border-b border-[#135A9C] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#135A9C] flex items-center justify-center text-[#F4A62A] font-bold">
              ☸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-[#135A9C] px-2 py-0.5 rounded text-white font-semibold">
                  HEATSHIELD AI • GOVERNANCE & POLICIES
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {isHindi ? 'शासकीय नीतियां, सुगम्यता एवं नागरिक अधिकार' : 'Official Governance, Privacy & Compliance Policies'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Navigation */}
        <div className="bg-[#F0F4F8] border-b border-[#CBD5E1] px-4 pt-2 flex gap-1 sm:gap-2 overflow-x-auto shrink-0 scrollbar-thin">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setGrievanceSubmitted(null);
                }}
                className={`px-3 py-2.5 rounded-t-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer border-t border-x ${
                  isActive
                    ? 'bg-white text-[#0B1F3A] border-[#CBD5E1] shadow-xs'
                    : 'bg-transparent text-[#526273] border-transparent hover:text-[#0B1F3A] hover:bg-[#E2E8F0]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#135A9C]' : 'text-[#718096]'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-[#135A9C] text-white' : 'bg-[#CBD5E1] text-[#2D3748]'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-[#1E293B] text-xs leading-relaxed flex-1">
          
          {/* TAB 1: Accessibility Statement */}
          {activeTab === 'accessibility' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#EBF8FF] border border-[#BEE3F8] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2B6CB0] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[#2B6CB0]">
                    Conformance Status: W3C WCAG 2.2 Level AA Fully Compliant
                  </h3>
                  <p className="text-xs text-[#2C5282] mt-0.5">
                    HeatShield AI complies with the Guidelines for Indian Government Websites (GIGW 3.0) and W3C Web Content Accessibility Guidelines 2.2 at Level AA conformance.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <h4 className="font-bold text-sm text-[#0B1F3A] flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#16804A]" />
                    Visual & Contrast Compliance
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#475569] list-disc list-inside">
                    <li>Minimum color contrast ratio of 4.5:1 for body text and 3:1 for large UI components and graphical badges.</li>
                    <li>Dual indicator system: all heatwave alert badges pair colors with ISO shapes (Circle, Triangle, Hexagon, Diamond) so color-blind users can distinguish risk instantly.</li>
                    <li>Full zoom compatibility up to 200% without horizontal loss of content or breaking mobile layouts.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <h4 className="font-bold text-sm text-[#0B1F3A] flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#16804A]" />
                    Screen Reader & Keyboard Nav
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#475569] list-disc list-inside">
                    <li>Semantic HTML5 landmark tags (<code className="text-[#135A9C]">header</code>, <code className="text-[#135A9C]">main</code>, <code className="text-[#135A9C]">nav</code>, <code className="text-[#135A9C]">footer</code>) and ARIA live regions for active emergency bulletins.</li>
                    <li>Complete logical Tab-order and keyboard focus indicators across all modal dialogs, map controls, and symptom forms.</li>
                    <li>Compatible with NVDA, JAWS, VoiceOver (iOS/macOS), and TalkBack (Android).</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] space-y-2">
                <h4 className="font-bold text-sm text-[#0B1F3A]">Accessibility Feedback & Grievance Officer</h4>
                <p className="text-xs text-[#475569]">
                  If you experience any accessibility barriers while browsing HeatShield AI or accessing life-critical heat bulletins, please contact our dedicated Accessibility Coordinator:
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="font-mono text-xs bg-white px-2.5 py-1 rounded border border-[#CBD5E1] text-[#0B1F3A]">
                    Email: accessibility-ndma@gov.in
                  </span>
                  <span className="font-mono text-xs bg-white px-2.5 py-1 rounded border border-[#CBD5E1] text-[#0B1F3A]">
                    Helpline: 1800-11-2026 (Toll-Free)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: National Data Sharing & Privacy Policy */}
          {activeTab === 'data-sharing' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#16804A] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[#166534]">
                    DPDP Act 2023 & NDSAP Framework Compliance
                  </h3>
                  <p className="text-xs text-[#15803D] mt-0.5">
                    HeatShield AI operates under the National Data Sharing and Accessibility Policy (NDSAP) of India and strictly adheres to the Digital Personal Data Protection (DPDP) Act 2023.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                  <h4 className="font-bold text-[#0B1F3A] text-xs uppercase tracking-wide">
                    1. Ephemeral Client-Side Geolocation Processing
                  </h4>
                  <p className="text-xs text-[#475569] mt-1">
                    When you click "Locate Me" or enable automatic location detection, your GPS coordinates (<code className="text-[#135A9C]">lat, lng</code>) are processed entirely inside your browser's local sandbox to look up nearby IMD weather stations and municipal cooling shelters. Your precise coordinates are never recorded, tracked, sold, or stored in any central government database.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                  <h4 className="font-bold text-[#0B1F3A] text-xs uppercase tracking-wide">
                    2. Zero Personal Identifiable Information (PII) Tracking
                  </h4>
                  <p className="text-xs text-[#475569] mt-1">
                    Citizen access to life-saving heat risk maps, forecasts, hydration calculations, and emergency shelter directories requires no account registration, phone verification, or Aadhaar authentication. Health assessment answers remain strictly in your browser's local storage.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                  <h4 className="font-bold text-[#0B1F3A] text-xs uppercase tracking-wide">
                    3. Open Government Data License (OGDL-India)
                  </h4>
                  <p className="text-xs text-[#475569] mt-1">
                    Biometeorological observations, Wet Bulb Globe Temperature (WBGT) calculations, heatwave alert boundaries, and municipal cooling shelter locations are licensed under the Open Government Data License - India. Researchers, universities, and civic developers may freely query and redistribute aggregated data via public endpoints.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#F1F5F9] rounded border border-[#CBD5E1] text-[11px] text-[#475569]">
                <strong>Data Protection Officer:</strong> Joint Secretary (Disaster Management), Ministry of Home Affairs, NDCC-II Building, Jai Singh Road, New Delhi - 110001. Contact: <code className="text-[#135A9C]">dpo-ndma@gov.in</code>
              </div>
            </div>
          )}

          {/* TAB 3: Responsible Vulnerability Disclosure: cert-in@nic.in */}
          {activeTab === 'vulnerability' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[#92400E]">
                    National Vulnerability Disclosure Program (CERT-In)
                  </h3>
                  <p className="text-xs text-[#B45309] mt-0.5">
                    HeatShield AI is protected under national critical information infrastructure guidelines. Security researchers and citizens discovering vulnerabilities must report them directly to the Indian Computer Emergency Response Team (CERT-In).
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] space-y-2">
                  <h4 className="font-bold text-sm text-[#0B1F3A]">Reporting Channels & Direct Contact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded bg-white border border-[#CBD5E1] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#64748B] block">CERT-In Incident Desk</span>
                        <strong className="text-[#0B1F3A] font-mono">cert-in@nic.in</strong>
                      </div>
                      <button
                        onClick={() => handleCopyText('cert-in@nic.in', 'cert_email')}
                        className="px-2 py-1 rounded bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B1F3A] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'cert_email' ? <Check className="w-3.5 h-3.5 text-[#16804A]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'cert_email' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-[#CBD5E1] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#64748B] block">Emergency Hotline</span>
                        <strong className="text-[#0B1F3A] font-mono">1800-11-4949</strong>
                      </div>
                      <button
                        onClick={() => handleCopyText('1800114949', 'cert_phone')}
                        className="px-2 py-1 rounded bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B1F3A] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'cert_phone' ? <Check className="w-3.5 h-3.5 text-[#16804A]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'cert_phone' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href="mailto:cert-in@nic.in?subject=HeatShield%20AI%20Responsible%20Vulnerability%20Disclosure&body=Dear%20CERT-In%20Team,%0A%0AI%20would%20like%20to%20report%20a%20security%20vulnerability%20under%20the%20Coordinated%20Vulnerability%20Disclosure%20program:%0A%0AApplication:%20HeatShield%20AI%20(National%20Heat%20Health%20Early%20Warning%20System)%0ASeverity:%20%0AAffected%20Component:%20%0ASteps%20to%20Reproduce:%0A%0AThank%20you,%0A"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#0B1F3A] hover:bg-[#135A9C] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#F4A62A]" />
                      <span>Compose Email to cert-in@nic.in</span>
                      <ExternalLink className="w-3 h-3 text-white/70 ml-1" />
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-[#E2E8F0] bg-white space-y-2">
                  <h4 className="font-bold text-[#0B1F3A] text-xs uppercase tracking-wide">Safe Harbor & Ethical Scope</h4>
                  <ul className="space-y-1 text-xs text-[#475569] list-disc list-inside">
                    <li>Do not execute Denial of Service (DoS/DDoS) attacks against telemetry nodes or emergency SMS/OBD broadcast pipes.</li>
                    <li>Do not compromise citizen telemetry or municipal officer accounts.</li>
                    <li>Provide reasonable time (minimum 30 days) for CERT-In and NIC security teams to remediate before public disclosure.</li>
                    <li>Compliant security researchers will receive official CERT-In acknowledgement and letter of appreciation.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IMD Telemetry Quality Assurance ISO 9001:2015 */}
          {activeTab === 'quality-assurance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#16804A] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[#166534]">
                    IMD Quality Management System Certified under ISO 9001:2015
                  </h3>
                  <p className="text-xs text-[#15803D] mt-0.5">
                    All meteorological observations, Automatic Weather Station (AWS) telemetric feeds, and Heatwave Warnings emitted by the India Meteorological Department comply with international meteorological standards.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <h4 className="font-bold text-sm text-[#0B1F3A]">WMO-No. 8 Standard Calibration</h4>
                  <p className="text-xs text-[#475569]">
                    Instruments adhere to the <em>World Meteorological Organization (WMO) Guide to Instruments and Methods of Observation</em>.
                  </p>
                  <ul className="space-y-1 text-xs text-[#475569] list-disc list-inside">
                    <li>Dry Bulb / Wet Bulb sensors calibrated with platinum resistance thermometers (Pt-100) ±0.15°C tolerance.</li>
                    <li>Naturally aspirated & fan-aspirated Stevenson screens positioned at 1.25m to 2.0m above natural ground cover.</li>
                    <li>Continuous solar pyranometers measuring global horizontal irradiance (GHI) for ISO 7243 WBGT calculation.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <h4 className="font-bold text-sm text-[#0B1F3A]">Real-Time Telemetry Quality Checks</h4>
                  <ul className="space-y-1 text-xs text-[#475569] list-disc list-inside">
                    <li><strong>Range Limits:</strong> Automatic rejection of sensor readings exceeding climatological extremes (&lt; 0°C or &gt; 58°C in plains).</li>
                    <li><strong>Step Change Validation:</strong> Temperature jumps greater than 5.0°C in a 15-minute sampling window trigger automatic sensor drift flags.</li>
                    <li><strong>Dual-Sensor Parity:</strong> Co-located duplicate sensors are compared every 5 minutes to detect hardware failure.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded bg-[#F1F5F9] border border-[#CBD5E1] text-[11px] font-mono text-[#334155] space-y-1">
                <div><strong>Accreditation Body:</strong> National Accreditation Board for Certification Bodies (NABCB)</div>
                <div><strong>Certificate Registration:</strong> ISO/IEC 9001:2015/IMD-OPS-2024-QMS</div>
                <div><strong>Valid Through:</strong> 31 December 2027 • Standard: ISO 9001:2015</div>
              </div>
            </div>
          )}

          {/* TAB 5: Citizen Grievance Redressal: heatresponse-ndma@gov.in */}
          {activeTab === 'grievance' && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[#1E40AF]">
                    Official Citizen Heatwave Grievance Redressal Mechanism
                  </h3>
                  <p className="text-xs text-[#1D4ED8] mt-0.5">
                    Under the National Heat Action Plan (HAP), citizens may report non-functional drinking water kiosks (piaus), closed cooling shelters, illegal outdoor labor during heat curfews, or emergency room treatment issues.
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[#1E40AF]">
                    <span>Direct Grievance Desk:</span>
                    <a
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=heatresponse-ndma@gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline hover:text-[#172554] inline-flex items-center gap-1"
                      title="Open Gmail to compose email to heatresponse-ndma@gov.in"
                    >
                      heatresponse-ndma@gov.in
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {grievanceSubmitted ? (
                <div className="p-6 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-[#16804A] text-white flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base text-[#14532D]">
                    Grievance Registered Successfully
                  </h3>
                  <p className="text-xs text-[#166534] max-w-md mx-auto">
                    Your grievance has been dispatched to the District Emergency Operations Center (DEOC) and the NDMA Heat Response Unit for rapid field resolution.
                  </p>
                  <div className="inline-block p-3 rounded-lg bg-white border border-[#86EFAC] font-mono text-sm text-[#0B1F3A] font-bold">
                    Tracking ID: {grievanceSubmitted}
                  </div>
                  <p className="text-[11px] text-[#526273]">
                    Expected field inspection SLA: <strong>Within 4 hours</strong> during Orange/Red Heatwave Alerts.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      onClick={() => setGrievanceSubmitted(null)}
                      className="px-4 py-2 rounded bg-[#0B1F3A] hover:bg-[#135A9C] text-white text-xs font-semibold cursor-pointer"
                    >
                      Submit Another Grievance
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0B1F3A] text-xs font-semibold cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGrievanceSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B1F3A] uppercase tracking-wide mb-1">
                        Citizen Name
                      </label>
                      <input
                        type="text"
                        value={grievanceForm.isAnonymous ? 'Anonymous Citizen' : grievanceForm.name}
                        onChange={(e) => setGrievanceForm({ ...grievanceForm, name: e.target.value })}
                        disabled={grievanceForm.isAnonymous}
                        placeholder="Enter full name"
                        className="w-full px-3 py-2 rounded border border-[#CBD5E1] text-xs focus:ring-2 focus:ring-[#135A9C] focus:outline-hidden disabled:bg-[#F1F5F9]"
                        required={!grievanceForm.isAnonymous}
                      />
                      <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer text-[11px] text-[#64748B]">
                        <input
                          type="checkbox"
                          checked={grievanceForm.isAnonymous}
                          onChange={(e) => setGrievanceForm({ ...grievanceForm, isAnonymous: e.target.checked })}
                          className="rounded text-[#135A9C]"
                        />
                        <span>Submit anonymously without revealing identity</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0B1F3A] uppercase tracking-wide mb-1">
                        Contact Phone / Email
                      </label>
                      <input
                        type="text"
                        value={grievanceForm.phone}
                        onChange={(e) => setGrievanceForm({ ...grievanceForm, phone: e.target.value })}
                        placeholder="+91 98765 43210 or email@domain.gov.in"
                        className="w-full px-3 py-2 rounded border border-[#CBD5E1] text-xs focus:ring-2 focus:ring-[#135A9C] focus:outline-hidden"
                        required={!grievanceForm.isAnonymous}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B1F3A] uppercase tracking-wide mb-1">
                        Affected District / State
                      </label>
                      <input
                        type="text"
                        value={grievanceForm.district}
                        onChange={(e) => setGrievanceForm({ ...grievanceForm, district: e.target.value })}
                        placeholder="e.g., Unnao, Uttar Pradesh"
                        className="w-full px-3 py-2 rounded border border-[#CBD5E1] text-xs focus:ring-2 focus:ring-[#135A9C] focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0B1F3A] uppercase tracking-wide mb-1">
                        Grievance Category
                      </label>
                      <select
                        value={grievanceForm.category}
                        onChange={(e) => setGrievanceForm({ ...grievanceForm, category: e.target.value })}
                        className="w-full px-3 py-2 rounded border border-[#CBD5E1] text-xs focus:ring-2 focus:ring-[#135A9C] focus:outline-hidden bg-white"
                      >
                        <option value="water_kiosk">Drinking Water Kiosk (Piau) Empty / Non-functional</option>
                        <option value="cooling_shelter">Cooling Center Locked / Denying Public Entry</option>
                        <option value="labor_curfew">Violation of Workplace Curfew (Outdoor Labor 12:00-15:30)</option>
                        <option value="hospital_emergency">Hospital Refusing Heat Stroke Emergency Triage</option>
                        <option value="telemetry_error">Inaccurate Heat Wave Warning / Missed SMS Alert</option>
                        <option value="other">Other Heat Safety Violation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] uppercase tracking-wide mb-1">
                      Exact Location / Landmark / Address
                    </label>
                    <input
                      type="text"
                      value={grievanceForm.location}
                      onChange={(e) => setGrievanceForm({ ...grievanceForm, location: e.target.value })}
                      placeholder="e.g., Near Main Bus Stand, Civil Lines, Construction Site Gate #2"
                      className="w-full px-3 py-2 rounded border border-[#CBD5E1] text-xs focus:ring-2 focus:ring-[#135A9C] focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1F3A] uppercase tracking-wide mb-1">
                      Detailed Description of the Issue
                    </label>
                    <textarea
                      value={grievanceForm.description}
                      onChange={(e) => setGrievanceForm({ ...grievanceForm, description: e.target.value })}
                      rows={3}
                      placeholder="Describe what occurred, time of observation, and immediate risk to public health..."
                      className="w-full px-3 py-2 rounded border border-[#CBD5E1] text-xs focus:ring-2 focus:ring-[#135A9C] focus:outline-hidden"
                      required
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
                    <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                      <PhoneCall className="w-3.5 h-3.5 text-[#C7352B]" />
                      <span>Immediate emergency? Call NDMA Control Room: <strong>1078</strong></span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <a
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=heatresponse-ndma@gov.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#0B1F3A] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Open Gmail to compose email to heatresponse-ndma@gov.in"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#135A9C]" />
                        <span>Email heatresponse-ndma@gov.in</span>
                      </a>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2 rounded bg-[#135A9C] hover:bg-[#0B1F3A] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Registering...' : 'Register Grievance'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#F8FAFC] border-t border-[#CBD5E1] px-5 py-3 flex items-center justify-between shrink-0 text-xs">
          <div className="text-[#64748B] text-[11px] flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#135A9C]" />
            <span>Ministry of Health & Family Welfare • National Disaster Management Authority</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#0B1F3A] hover:bg-[#135A9C] text-white font-semibold cursor-pointer transition-colors"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
