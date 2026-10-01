import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  Eye,
  Activity,
  Award,
  Users,
  Lock,
  Globe,
  Radio
} from 'lucide-react';
import { LanguageCode } from '../../types';

interface AboutSystemViewProps {
  language: LanguageCode;
}

export const AboutSystemView: React.FC<AboutSystemViewProps> = ({ language }) => {
  const isHindi = language === 'hi';

  return (
    <div className="space-y-6 pb-12">
      
      {/* Executive Command Header */}
      <div className="rounded-2xl p-6 sm:p-8 gov-hero-command border border-[#1E4373] text-white shadow-lg space-y-3 relative overflow-hidden">
        {/* Ashoka Chakra Watermark */}
        <div 
          className="absolute -right-10 -bottom-12 w-64 h-64 opacity-[0.06] pointer-events-none select-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="currentColor">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            <path d="M12 2 L12 22 M2 12 L22 12 M5 5 L19 19 M5 19 L19 5 M7.05 2.95 L16.95 21.05 M2.95 7.05 L21.05 16.95" stroke="currentColor" strokeWidth="0.8" />
          </svg>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <span className="text-[10px] font-mono uppercase bg-[#135A9C] text-white px-2.5 py-0.5 rounded-full font-bold tracking-wider shadow-xs">
            INSTITUTIONAL OVERVIEW
          </span>
          <span className="text-xs text-[#E5A93C] font-mono font-bold">
            · STATUTORY PUBLIC SAFETY MANDATE
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight relative z-10">
          {isHindi ? 'राष्ट्रीय ताप स्वास्थ्य पूर्व चेतावनी प्रणाली के बारे में' : 'About the National Heat Health Early Warning System'}
        </h1>
        <p className="text-xs sm:text-sm text-[#93C5FD] leading-relaxed font-normal max-w-3xl relative z-10">
          {isHindi 
            ? 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय, एनडीएमए एवं आईएमडी का राष्ट्रीय संयुक्त उपक्रम' 
            : 'A joint public-safety framework operated by the Ministry of Health & Family Welfare, NDMA, and IMD covering 800+ districts nationwide.'}
        </p>
      </div>

      {/* Mission & Purpose */}
      <div className="gov-card p-5 space-y-3">
        <h2 className="text-base font-bold text-[#0B1F3A]">
          Mission & Public Safety Mandate
        </h2>
        <p className="text-xs text-[#526273] leading-relaxed">
          The National Heat Health Early Warning System (NHHEWS) was established under the National Disaster Management Act to mitigate mortality and morbidity caused by severe heatwaves and humidity-induced thermal stress across India. By integrating biometeorological modeling with municipal heat action plans (HAP), the platform transitions disaster management from reactive response to proactive, life-saving early intervention.
        </p>
      </div>

      {/* Core Institutional Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        
        <div className="gov-card p-4 space-y-2">
          <div className="w-8 h-8 rounded bg-[#EAF6EE] text-[#16804A] flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#0B1F3A]">Scientific Credibility</h3>
          <p className="text-[#526273]">
            Telemetry is directly coupled with ISO 7243 WBGT and UTCI biometeorological models, calibrated across 850+ surface weather stations and INSAT-3D thermal radiometer observations.
          </p>
        </div>

        <div className="gov-card p-4 space-y-2">
          <div className="w-8 h-8 rounded bg-[#FFFBEA] text-[#8C6400] flex items-center justify-center font-bold">
            <Eye className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#0B1F3A]">Human-In-The-Loop AI</h3>
          <p className="text-[#526273]">
            Artificial intelligence functions strictly as an operational decision-support tool. All state and district emergency declarations are verified and authorized by certified IMD meteorologists.
          </p>
        </div>

        <div className="gov-card p-4 space-y-2">
          <div className="w-8 h-8 rounded bg-[#FDF0EE] text-[#C7352B] flex items-center justify-center font-bold">
            <Radio className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-[#0B1F3A]">Equitable Citizen Access</h3>
          <p className="text-[#526273]">
            Designed for universal accessibility across digital literacy levels with full bilingual English/Hindi support, high-contrast mode, text-to-speech audio, and low-bandwidth resilience.
          </p>
        </div>

      </div>

      {/* Multi-Agency Governance Hierarchy */}
      <div className="gov-card p-5 space-y-3">
        <h2 className="text-base font-bold text-[#0B1F3A]">
          Participating Government Bodies & Agencies
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC] space-y-1">
            <span className="font-bold text-[#0B1F3A] block">MoHFW</span>
            <p className="text-[11px] text-[#526273]">Ministry of Health & Family Welfare</p>
            <span className="text-[10px] text-[#135A9C] block font-mono">Epidemiological Policy & ICU Surge</span>
          </div>

          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC] space-y-1">
            <span className="font-bold text-[#0B1F3A] block">NDMA</span>
            <p className="text-[11px] text-[#526273]">National Disaster Management Authority</p>
            <span className="text-[10px] text-[#135A9C] block font-mono">Disaster Protocols & CAP Alerts</span>
          </div>

          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC] space-y-1">
            <span className="font-bold text-[#0B1F3A] block">IMD</span>
            <p className="text-[11px] text-[#526273]">India Meteorological Department</p>
            <span className="text-[10px] text-[#135A9C] block font-mono">AWS Telemetry & NWP Forecasts</span>
          </div>

          <div className="p-3 rounded bg-[#F5F8FB] border border-[#D9E2EC] space-y-1">
            <span className="font-bold text-[#0B1F3A] block">NIC</span>
            <p className="text-[11px] text-[#526273]">National Informatics Centre</p>
            <span className="text-[10px] text-[#135A9C] block font-mono">Cloud Hosting & Security Audit</span>
          </div>
        </div>
      </div>

    </div>
  );
};
