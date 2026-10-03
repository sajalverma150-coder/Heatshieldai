import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Building2, 
  Clock, 
  PhoneCall, 
  MapPin, 
  ExternalLink, 
  QrCode, 
  X,
  Copy,
  Sparkles,
  Truck,
  HeartPulse
} from 'lucide-react';
import { AssistanceTicket, loadAssistanceTickets, deleteAssistanceTicket } from '../services/aiCallAssistantService';
import { LanguageCode } from '../types';

interface ActiveAssistanceTicketsBannerProps {
  language?: LanguageCode;
  onOpenCallModal?: () => void;
}

export const ActiveAssistanceTicketsBanner: React.FC<ActiveAssistanceTicketsBannerProps> = ({
  language = 'en',
  onOpenCallModal,
}) => {
  const [tickets, setTickets] = useState<AssistanceTicket[]>([]);
  const isHindi = language === 'hi';

  const updateTickets = () => {
    setTickets(loadAssistanceTickets());
  };

  useEffect(() => {
    updateTickets();
    const handleTicketCreated = () => updateTickets();
    const handleTicketDeleted = () => updateTickets();

    window.addEventListener('heatshield_ticket_created', handleTicketCreated);
    window.addEventListener('heatshield_ticket_deleted', handleTicketDeleted);

    return () => {
      window.removeEventListener('heatshield_ticket_created', handleTicketCreated);
      window.removeEventListener('heatshield_ticket_deleted', handleTicketDeleted);
    };
  }, []);

  if (tickets.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#065F46] border-2 border-[#10B981] text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center shrink-0 text-[#34D399] mt-0.5">
              {ticket.type === 'hospital_bed' ? (
                <HeartPulse className="w-5 h-5 text-[#F87171]" />
              ) : ticket.type === 'water_tanker' ? (
                <Truck className="w-5 h-5 text-[#38BDF8]" />
              ) : (
                <Building2 className="w-5 h-5 text-[#34D399]" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981] text-[#064E3B] font-bold">
                  {ticket.status}
                </span>
                <span className="text-[11px] font-mono text-[#A7F3D0] uppercase">
                  {ticket.details.serviceCode}
                </span>
              </div>
              <h4 className="text-sm font-headline font-bold text-white">
                {isHindi ? ticket.titleHi : ticket.titleEn} — <span className="text-[#FDE047] font-mono">{ticket.tokenNumber}</span>
              </h4>
              <p className="text-xs text-[#D1FAE5] flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold">{ticket.facilityName}</span>
                <span className="flex items-center gap-1 text-[#A7F3D0]">
                  <Clock className="w-3.5 h-3.5" /> {ticket.etaOrTimeSlot}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-1 sm:pt-0">
            <button
              onClick={() => deleteAssistanceTicket(ticket.id)}
              className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Dismiss Ticket"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
