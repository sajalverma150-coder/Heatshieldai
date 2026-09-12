import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Download,
  Printer,
  Copy,
  Check,
  Building2,
  ShieldAlert,
  Clock,
  HardHat,
  Stethoscope,
  FileText,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { LanguageCode } from '../../types';

export interface PolicyDocument {
  id: string;
  title: string;
  agency: string;
  ministry: string;
  year: string;
  fileSize: string;
  category: 'hap' | 'workplace' | 'clinical' | 'meteorological';
  gazetteRef: string;
  executiveSummary: string;
  statutoryMandates: string[];
  keyCurfewProtocols?: {
    title: string;
    details: string;
    threshold: string;
    penalty: string;
  };
  clinicalAlgorithm?: {
    emergencyTriage: string;
    activeCooling: string;
    fluids: string;
    contraindications: string;
  };
  operationalChecklist: string[];
  fullTextContent: string;
}

interface PolicyDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PolicyDocument | null;
  language: LanguageCode;
}

export const PolicyDocumentViewerModal: React.FC<PolicyDocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  language,
}) => {
  const isHindi = language === 'hi';
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !document) return null;

  // Real browser file download via Blob
  const handleDownloadFile = () => {
    try {
      const fileName = `${document.id}_official_guideline_2026.txt`;
      const blob = new Blob([document.fullTextContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCitation = () => {
    const citation = `${document.title}. Issued by ${document.agency} (${document.ministry}), Govt of India. Order Ref: ${document.gazetteRef}. Accessible via National Heat Health Early Warning System (NHHEWS).`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-[#CBD5E1] flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Government Header */}
        <div className="bg-[#0B1F3A] text-white px-5 py-4 flex items-start justify-between border-b border-[#135A9C] shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#135A9C] flex items-center justify-center text-[#F4A62A] font-bold text-sm shrink-0 mt-0.5">
              ☸
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider uppercase bg-[#135A9C] px-2 py-0.5 rounded text-white font-semibold">
                  OFFICIAL GOVERNMENT FRAMEWORK
                </span>
                <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-[#D9E2EC]">
                  Ref: {document.gazetteRef}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-1 leading-snug">
                {document.title}
              </h2>
              <div className="text-xs text-[#A0AEC0] mt-0.5 flex flex-wrap items-center gap-2">
                <span>{document.agency}</span>
                <span>•</span>
                <span>{document.ministry}</span>
                <span>•</span>
                <span className="text-[#F4A62A] font-mono">{document.year}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="bg-[#F0F4F8] border-b border-[#CBD5E1] px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-[#526273]">
            <FileText className="w-4 h-4 text-[#135A9C]" />
            <span className="font-mono font-medium">Format: Official Policy Brief ({document.fileSize})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCitation}
              className="px-2.5 py-1.5 rounded bg-white hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0B1F3A] font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Copy official citation"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#16804A]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Citation Copied' : 'Copy Citation'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded bg-white hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0B1F3A] font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5 text-[#526273]" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadFile}
              className="px-3 py-1.5 rounded bg-[#135A9C] hover:bg-[#0B1F3A] text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Download offline copy"
            >
              {downloadSuccess ? <Check className="w-3.5 h-3.5 text-[#86EFAC]" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadSuccess ? 'Downloaded!' : 'Download Document'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Reader Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-[#1E293B] text-xs leading-relaxed flex-1">
          
          {/* Executive Summary Box */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#135A9C]" />
              <h3 className="font-bold text-sm text-[#0B1F3A]">1. Executive Summary & Statutory Authority</h3>
            </div>
            <p className="text-xs text-[#334155] leading-relaxed">
              {document.executiveSummary}
            </p>
          </div>

          {/* Special Feature 1: Workplace Curfew & Labor Protocol */}
          {document.keyCurfewProtocols && (
            <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] space-y-3">
              <div className="flex items-center gap-2 text-[#92400E]">
                <HardHat className="w-4 h-4" />
                <h3 className="font-bold text-sm">
                  {document.keyCurfewProtocols.title}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-[11px]">
                <div className="p-2.5 rounded bg-white border border-[#FDE68A]">
                  <span className="text-[#B45309] block font-sans text-[10px] uppercase font-bold">Mandatory Curfew Hours</span>
                  <strong className="text-sm text-[#92400E] font-bold">12:00 PM – 03:30 PM</strong>
                </div>
                <div className="p-2.5 rounded bg-white border border-[#FDE68A]">
                  <span className="text-[#B45309] block font-sans text-[10px] uppercase font-bold">Trigger Threshold</span>
                  <strong className="text-sm text-[#92400E] font-bold">{document.keyCurfewProtocols.threshold}</strong>
                </div>
                <div className="p-2.5 rounded bg-white border border-[#FDE68A]">
                  <span className="text-[#B45309] block font-sans text-[10px] uppercase font-bold">Statutory Penalty</span>
                  <strong className="text-sm text-[#DC2626] font-bold">{document.keyCurfewProtocols.penalty}</strong>
                </div>
              </div>

              <p className="text-xs text-[#78350F] leading-relaxed">
                {document.keyCurfewProtocols.details}
              </p>
            </div>
          )}

          {/* Special Feature 2: Emergency Clinical Triage Algorithm */}
          {document.clinicalAlgorithm && (
            <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] space-y-3">
              <div className="flex items-center gap-2 text-[#991B1B]">
                <Stethoscope className="w-4 h-4" />
                <h3 className="font-bold text-sm">
                  Emergency Department Heat-Stroke Clinical Triage (Code Red)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white border border-[#FCA5A5] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] font-mono">
                    Step 1: Rapid ER Triage Criteria
                  </span>
                  <p className="text-xs text-[#7F1D1D]">
                    {document.clinicalAlgorithm.emergencyTriage}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white border border-[#FCA5A5] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] font-mono">
                    Step 2: Golden-Hour Active Cooling
                  </span>
                  <p className="text-xs text-[#7F1D1D]">
                    {document.clinicalAlgorithm.activeCooling}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white border border-[#FCA5A5] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] font-mono">
                    Step 3: Hemodynamic Rehydration
                  </span>
                  <p className="text-xs text-[#7F1D1D]">
                    {document.clinicalAlgorithm.fluids}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white border border-[#FCA5A5] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] font-mono">
                    ⚠️ Strict Clinical Contraindications
                  </span>
                  <p className="text-xs text-[#991B1B] font-semibold">
                    {document.clinicalAlgorithm.contraindications}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Statutory Mandates List */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#135A9C]" />
              <h3 className="font-bold text-sm text-[#0B1F3A]">2. Mandatory Government Directives & Standards</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {document.statutoryMandates.map((mandate, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#135A9C] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-[#334155] leading-relaxed">
                    {mandate}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Implementation Checklist */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#16804A]" />
              <h3 className="font-bold text-sm text-[#0B1F3A]">3. Field Officer Operational Checklist</h3>
            </div>
            <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
              {document.operationalChecklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#166534]">
                  <Check className="w-3.5 h-3.5 text-[#16804A] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gazette Legal Clause */}
          <div className="p-3 bg-[#F1F5F9] rounded border border-[#CBD5E1] text-[11px] font-mono text-[#475569]">
            <strong>Enforcement Mandate:</strong> This document carries legal force under Section 30 and Section 38 of the Disaster Management Act, 2005. Failure of industrial or institutional stakeholders to comply constitutes an offence punishable under Section 51.
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#F8FAFC] border-t border-[#CBD5E1] px-5 py-3 flex items-center justify-between shrink-0 text-xs">
          <div className="text-[#64748B] text-[11px] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#135A9C]" />
            <span>Official Government of India Publication • Verified Digital Copy</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFile}
              className="px-3.5 py-1.5 rounded bg-[#135A9C] hover:bg-[#0B1F3A] text-white font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.txt)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0B1F3A] font-semibold cursor-pointer transition-colors"
            >
              {isHindi ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
