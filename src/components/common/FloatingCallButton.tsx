import React from 'react';
import { PhoneCall } from 'lucide-react';

export interface FloatingCallButtonProps {
  phoneNumber?: string;
  title?: string;
  className?: string;
}

export const FloatingCallButton: React.FC<FloatingCallButtonProps> = ({
  phoneNumber = '+919158886444',
  title = 'Direct Call Admin (+91 9158886444)',
  className = ''
}) => {
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');

  return (
    <a
      href={`tel:${cleanPhone}`}
      className={`fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-2xl shadow-blue-900/50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer border-2 border-white/20 ${className}`}
      title={title}
      aria-label={title}
    >
      {/* Gentle Pulsing Ring */}
      <span className="absolute -inset-1 rounded-full bg-blue-500/25 animate-ping pointer-events-none" />

      {/* Tooltip on hover for desktop screens */}
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-950/95 backdrop-blur-sm text-white text-xs font-bold rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap hidden sm:flex items-center gap-2 border border-blue-500/30">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>Direct Call Admin: +91 9158886444</span>
      </span>

      {/* Calling Phone Icon with Shake Animation on Hover */}
      <PhoneCall className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
    </a>
  );
};
