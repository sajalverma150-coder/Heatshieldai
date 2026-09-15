import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Flame, 
  Droplet, 
  X, 
  Check, 
  ShieldCheck
} from 'lucide-react';
import { 
  PushNotificationPayload, 
  subscribeToPushNotifications,
  playNotificationChime
} from '../services/hydrationNotificationService';

interface PushNotificationBannerProps {
  onLogWater?: (amountMl: number) => void;
  onViewGuidance?: () => void;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({
  onLogWater,
  onViewGuidance,
}) => {
  const [activeNotification, setActiveNotification] = useState<PushNotificationPayload | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToPushNotifications((payload) => {
      setActiveNotification(payload);
      playNotificationChime();

      // Only auto-dismiss non-critical alerts after 12 seconds; critical heat alerts stay until actioned or dismissed
      if (payload.severity !== 'CRITICAL' && payload.type !== 'heatwave') {
        const timer = setTimeout(() => {
          setActiveNotification((current) => (current?.id && payload?.id && current.id === payload.id ? null : current));
        }, 12000);
        return () => clearTimeout(timer);
      }
    });

    return unsubscribe;
  }, []);

  if (!activeNotification) return null;

  const isCritical = activeNotification.severity === 'CRITICAL';
  const isSuccess = activeNotification.severity === 'SUCCESS';
  const isHeatwave = activeNotification.type === 'heatwave';

  const handleAction = () => {
    if (isHeatwave && onViewGuidance) {
      onViewGuidance();
      setActiveNotification(null);
    } else if (activeNotification.actionAmount && onLogWater) {
      onLogWater(activeNotification.actionAmount);
      setActiveNotification(null);
    } else if (onViewGuidance) {
      onViewGuidance();
      setActiveNotification(null);
    }
  };

  return (
    <div 
      id="in-app-push-notification-banner"
      role="alert"
      className="fixed top-4 right-3 sm:right-6 z-[9999] max-w-md w-[calc(100vw-1.5rem)] animate-in slide-in-from-top-6 duration-300 pointer-events-auto"
    >
      <div className={`p-4 sm:p-5 rounded-2xl shadow-2xl border backdrop-blur-2xl relative overflow-hidden transition-all ${
        isCritical 
          ? 'bg-[#180408]/98 border-red-500 text-white ring-4 ring-red-500/40 shadow-red-950/80 animate-pulse' 
          : isSuccess
          ? 'bg-[#04160f]/98 border-emerald-500 text-white ring-2 ring-emerald-500/30 shadow-emerald-950/70'
          : 'bg-[#140f06]/98 border-amber-500 text-white ring-2 ring-amber-500/30 shadow-amber-950/70'
      }`}>
        
        {/* Top Header Tag */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl border ${
              isCritical ? 'bg-red-500/30 border-red-400 text-red-300' :
              isSuccess ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300' :
              'bg-amber-500/30 border-amber-400 text-amber-300'
            }`}>
              {isCritical ? <Flame className="w-5 h-5 text-yellow-300" /> :
               isSuccess ? <ShieldCheck className="w-5 h-5" /> :
               <Bell className="w-5 h-5 text-yellow-300" />}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-black/60 border border-white/20 text-yellow-300 shadow-sm">
                  {isHeatwave ? '🚨 POP-UP EMERGENCY ALERT' : 'PUSH NOTIFICATION POPUP'}
                </span>
                <span className="text-[10px] font-mono text-slate-300">
                  Live System Alert
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-headline font-bold text-white tracking-wide mt-1 leading-snug">
                {activeNotification.title}
              </h4>
            </div>
          </div>

          <button
            id="close-push-banner-btn"
            onClick={() => setActiveNotification(null)}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Dismiss Notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div 
          onClick={isHeatwave ? handleAction : undefined}
          className={`text-xs text-slate-200 leading-relaxed font-sans mb-3 pl-8 whitespace-pre-line ${isHeatwave ? 'cursor-pointer hover:text-white' : ''}`}
        >
          {activeNotification.body}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 pl-8">
          {isHeatwave && onViewGuidance ? (
            <button
              id="push-banner-heatwave-action-btn"
              onClick={handleAction}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-yellow-300" />
              <span>{activeNotification.actionLabel || 'Open Safety Guidance'}</span>
            </button>
          ) : activeNotification.actionLabel && onLogWater ? (
            <button
              id="push-banner-action-btn"
              onClick={() => {
                onLogWater(activeNotification.actionAmount || 250);
                setActiveNotification(null);
              }}
              className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Droplet className="w-3 h-3 text-cyan-200" />
              <span>{activeNotification.actionLabel}</span>
            </button>
          ) : (
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Push alerts active</span>
            </span>
          )}

          <button
            onClick={() => setActiveNotification(null)}
            className="text-xs font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
