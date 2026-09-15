import React, { useState } from 'react';
import { PhoneCall, Mail, ShieldAlert, ShieldCheck, ExternalLink, Globe, FileText, Lock, ChevronRight } from 'lucide-react';
import { LanguageCode } from '../types';
import { GovernancePolicyModal, GovernancePolicyTab } from './modals/GovernancePolicyModal';

interface GovernmentFooterProps {
  language: LanguageCode;
  onSelectTab: (tab: any) => void;
  onOpenSOS: (type?: '108' | '112' | '1078') => void;
}

export const GovernmentFooter: React.FC<GovernmentFooterProps> = ({
  language,
  onSelectTab,
  onOpenSOS,
}) => {
  const isHindi = language === 'hi';
  const [policyModalTab, setPolicyModalTab] = useState<GovernancePolicyTab | null>(null);

  return (
    <footer id="government-portal-footer" className="bg-[#0B1F3A] text-[#D9E2EC] border-t border-[#135A9C] mt-12 select-none text-xs">
      
      {/* Top Banner inside footer: 24x7 Helplines */}
      <div className="bg-[#071527] border-b border-[#135A9C]/50 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#C7352B] flex items-center justify-center text-white shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">
                {isHindi ? '24x7 राष्ट्रीय ताप आपातकालीन सहायता केंद्र' : '24x7 National Heatwave Emergency Response Center'}
              </span>
              <p className="text-[11px] text-[#A0AEC0]">
                {isHindi ? 'किसी भी ताप आघात, लू या बेहोशी की स्थिति में तुरंत संपर्क करें' : 'Toll-free immediate medical response for heat stroke, fainting & severe heat distress'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono flex-wrap justify-center sm:justify-end">
            <button 
              id="footer-emergency-108-btn"
              onClick={() => onOpenSOS('108')}
              className="px-3 py-1.5 rounded bg-[#C7352B] hover:bg-[#A82B23] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Call 108 Ambulance / Heat Stroke Emergency"
            >
              <span>108</span>
              <span className="text-[10px] font-normal uppercase">{isHindi ? 'एम्बुलेंस' : 'Ambulance'}</span>
            </button>
            <button 
              id="footer-emergency-112-btn"
              onClick={() => onOpenSOS('112')}
              className="px-3 py-1.5 rounded bg-[#135A9C] hover:bg-[#0F477D] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Call 112 National Unified Emergency"
            >
              <span>112</span>
              <span className="text-[10px] font-normal uppercase">{isHindi ? 'अखिल आपातकाल' : 'All-Emergency'}</span>
            </button>
            <button 
              id="footer-emergency-1078-btn"
              onClick={() => onOpenSOS('1078')}
              className="px-3 py-1.5 rounded bg-[#16804A] hover:bg-[#12663B] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Call 1078 NDMA Disaster & Heatwave Control Room"
            >
              <span>1078</span>
              <span className="text-[10px] font-normal uppercase">{isHindi ? 'एनडीएमए हेल्पलाइन' : 'NDMA Heat Helpline'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Column 1: Ministry Ownership */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#135A9C] flex items-center justify-center font-bold text-[#F4A62A] text-xs">
              ☸
            </div>
            <span className="font-bold text-white text-sm">
              {isHindi ? 'भारत सरकार' : 'Government of India'}
            </span>
          </div>
          <p className="text-xs text-[#A0AEC0] leading-relaxed">
            {isHindi
              ? 'राष्ट्रीय ताप स्वास्थ्य पूर्व चेतावनी प्रणाली (HeatShield AI) स्वास्थ्य एवं परिवार कल्याण मंत्रालय तथा राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA) का संयुक्त राष्ट्रीय लोक सुरक्षा उपक्रम है।'
              : 'The National Heat Health Early Warning System is an official public-safety initiative jointly operated by the Ministry of Health & Family Welfare, NDMA, and the India Meteorological Department (IMD).'}
          </p>
          <div className="text-[11px] font-mono text-[#718096]">
            System Core ID: NHHEWS-IN-PROD-2026<br />
            Last Verified Cycle: 12 Sep 2026, 10:30 IST
          </div>
        </div>

        {/* Column 2: Public Portals */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 border-b border-[#135A9C]/50 pb-1">
            {isHindi ? 'नागरिक सेवाएं' : 'Citizen Services'}
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button onClick={() => onSelectTab('live-risk')} className="hover:text-white transition-colors cursor-pointer text-left">
                {isHindi ? 'राष्ट्रीय ताप जोखिम मानचित्र (GIS)' : 'Interactive National Heat Risk Map'}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('forecasts')} className="hover:text-white transition-colors cursor-pointer text-left">
                {isHindi ? '7-दिवसीय जैव-मौसम विज्ञान पूर्वानुमान' : '7-Day Biometeorological Forecasts'}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('health-guidance')} className="hover:text-white transition-colors cursor-pointer text-left">
                {isHindi ? 'सुरक्षा प्रोटोकॉल एवं स्वास्थ्य दिशानिर्देश' : 'Protective Protocols & Symptom Triage'}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('alerts')} className="hover:text-white transition-colors cursor-pointer text-left">
                {isHindi ? 'सक्रिय आपातकालीन बुलेटिन एवं ओबीडी' : 'Active Heat Bulletins & Voice OBD'}
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Operational & Scientific */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 border-b border-[#135A9C]/50 pb-1">
            {isHindi ? 'शासकीय एवं वैज्ञानिक' : 'Operations & Science'}
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button onClick={() => onSelectTab('district-dashboard')} className="hover:text-white transition-colors cursor-pointer text-left">
                {isHindi ? 'जिला प्रशासन एवं अस्पताल डैशबोर्ड' : 'District Administration & Hospital Portal'}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('reports-data')} className="hover:text-white transition-colors cursor-pointer text-left">
                {isHindi ? 'जिला हीट एक्शन प्लान (HAP) रिपोर्ट' : 'District Heat Action Plan (HAP) Reports'}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('reports-data')} className="hover:text-white transition-colors cursor-pointer text-left">
                {isHindi ? 'ओपन डेटा एपीआई एवं पद्धति' : 'Open Data APIs & Model Methodology'}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('about')} className="hover:text-white transition-colors cursor-pointer text-left">
                {isHindi ? 'एआई पारदर्शिता एवं सत्यापन प्रोटोकॉल' : 'AI Transparency & Scientific Verification'}
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Compliance & Legal (Governance & Policies) */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 border-b border-[#135A9C]/50 pb-1">
            {isHindi ? 'कानूनी एवं संपर्क' : 'Governance & Policies'}
          </h4>
          <ul className="space-y-1.5 text-xs text-[#A0AEC0]">
            <li>
              <button
                onClick={() => setPolicyModalTab('accessibility')}
                className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5 group py-0.5"
                title="View Accessibility Statement (WCAG 2.2 AA Compliant)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#135A9C] group-hover:bg-[#F4A62A] shrink-0 transition-colors" />
                <span className="group-hover:underline">Accessibility Statement (WCAG 2.2 AA Compliant)</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setPolicyModalTab('data-sharing')}
                className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5 group py-0.5"
                title="View National Data Sharing & Privacy Policy"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#135A9C] group-hover:bg-[#F4A62A] shrink-0 transition-colors" />
                <span className="group-hover:underline">National Data Sharing & Privacy Policy</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setPolicyModalTab('vulnerability')}
                className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5 group py-0.5"
                title="View Responsible Vulnerability Disclosure policy and contact CERT-In"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#135A9C] group-hover:bg-[#F4A62A] shrink-0 transition-colors" />
                <span className="group-hover:underline">Responsible Vulnerability Disclosure: cert-in@nic.in</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setPolicyModalTab('quality-assurance')}
                className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5 group py-0.5"
                title="View IMD Telemetry Quality Assurance ISO 9001:2015 details"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#135A9C] group-hover:bg-[#F4A62A] shrink-0 transition-colors" />
                <span className="group-hover:underline">IMD Telemetry Quality Assurance ISO 9001:2015</span>
              </button>
            </li>
            <li className="flex flex-wrap items-center gap-1.5 py-0.5 group">
              <span className="w-1.5 h-1.5 rounded-full bg-[#135A9C] group-hover:bg-[#F4A62A] shrink-0 transition-colors" />
              <button
                onClick={() => setPolicyModalTab('grievance')}
                className="hover:text-white transition-colors cursor-pointer text-left group-hover:underline"
                title="Submit or view Citizen Grievance Redressal mechanism"
              >
                Citizen Grievance Redressal:
              </button>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=heatresponse-ndma@gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#90CDF4] hover:text-white hover:underline transition-colors inline-flex items-center gap-1 font-mono text-[11px]"
                title="Open Gmail to compose email to heatresponse-ndma@gov.in"
              >
                <span>heatresponse-ndma@gov.in</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-75" />
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar: Copyright and Disclaimer */}
      <div className="bg-[#050E1A] border-t border-[#135A9C]/30 px-4 sm:px-8 py-3 text-[11px] text-[#718096]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            © 2026 National Heat Health Early Warning System. Hosted on National Informatics Cloud Infrastructure.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#A0AEC0]">Content Owner: Ministry of Health & Family Welfare</span>
            <span className="text-[#A0AEC0]">Technical Partner: IMD & HeatShield AI</span>
          </div>
        </div>
      </div>

      {/* Institutional Governance, Accessibility & Policy Modal */}
      <GovernancePolicyModal
        isOpen={policyModalTab !== null}
        onClose={() => setPolicyModalTab(null)}
        initialTab={policyModalTab || 'accessibility'}
        language={language}
      />

    </footer>
  );
};
