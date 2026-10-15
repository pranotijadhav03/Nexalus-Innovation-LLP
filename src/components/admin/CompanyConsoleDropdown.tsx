import React, { useState, useRef, useEffect } from 'react';
import { AdminConsoleMode } from './AdminLayout';
import {
  Shield,
  Building,
  Layers,
  ChevronDown,
  Check,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export interface CompanyConsoleDropdownProps {
  activeConsole: AdminConsoleMode;
  onConsoleChange: (mode: AdminConsoleMode) => void;
  variant?: 'navbar' | 'sidebar';
  className?: string;
  onItemSelect?: () => void;
}

interface ConsoleOption {
  id: AdminConsoleMode;
  name: string;
  shortName: string;
  tag: string;
  tagColor: string;
  desc: string;
  icon: React.ReactNode;
  iconGradient: string;
  liveUrl: string;
  liveLabel: string;
}

export const consoleOptions: ConsoleOption[] = [
  {
    id: 'master',
    name: 'Nexalus Innovations LLP',
    shortName: 'Master Console',
    tag: 'Group HQ',
    tagColor: 'bg-slate-900 text-white border-slate-700',
    desc: 'Central Corporate Dashboard (All Subsidiaries & Group Data)',
    icon: <Layers className="w-4 h-4 text-white" />,
    iconGradient: 'from-slate-900 via-indigo-900 to-blue-900',
    liveUrl: '/',
    liveLabel: 'Parent Portal'
  },
  {
    id: 'nexalus-innovations',
    name: 'Nexalus Innovations',
    shortName: 'Nexalus Innovations',
    tag: 'Tech & Fiber',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: 'CCTV, Optical Fiber Broadband & Network Infrastructure',
    icon: <Shield className="w-4 h-4 text-white" />,
    iconGradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    liveUrl: '/brands/nexalus-innovations',
    liveLabel: 'Tech Site'
  },
  {
    id: 'am-distributors',
    name: 'A.M. Distributors Chiplun',
    shortName: 'A.M. Distributors',
    tag: 'Water & Dairy',
    tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
    desc: 'Mineral Water Cans, Ice Cream & Refrigerated Dairy Fleet',
    icon: <Building className="w-4 h-4 text-white" />,
    iconGradient: 'from-teal-600 via-teal-700 to-emerald-500',
    liveUrl: '/brands/am-distributors',
    liveLabel: 'Depot Site'
  }
];

export const CompanyConsoleDropdown: React.FC<CompanyConsoleDropdownProps> = ({
  activeConsole,
  onConsoleChange,
  variant = 'navbar',
  className = '',
  onItemSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentOption = consoleOptions.find(opt => opt.id === activeConsole) || consoleOptions[0];

  const handleSelect = (mode: AdminConsoleMode) => {
    onConsoleChange(mode);
    setIsOpen(false);
    if (onItemSelect) {
      onItemSelect();
    }
  };

  if (variant === 'sidebar') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 px-0.5">
          <span>Active Operating Console</span>
          <span className="text-[9px] text-blue-600 font-bold">Switch ▾</span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer shadow-2xs ${
            isOpen
              ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/10'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${currentOption.iconGradient} flex items-center justify-center text-white shadow-2xs shrink-0`}
            >
              {currentOption.icon}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 leading-tight truncate">
                {currentOption.shortName}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 truncate">
                {currentOption.tag}
              </div>
            </div>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
              <span>Select Dashboard</span>
              <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                3 Portals
              </span>
            </div>

            {consoleOptions.map(option => {
              const isSelected = option.id === activeConsole;
              return (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 group ${
                    isSelected
                      ? 'bg-blue-50 border-blue-200 shadow-2xs'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${option.iconGradient} flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs`}
                    >
                      {option.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-extrabold leading-tight truncate ${
                            isSelected ? 'text-blue-900' : 'text-slate-900'
                          }`}
                        >
                          {option.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {option.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 mt-1">
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                        →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Variant: 'navbar' (Default top bar dropdown)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        title="Click to switch between Nexalus Innovations, A.M. Distributors, and Master Console"
        className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all text-xs font-bold shadow-2xs group cursor-pointer ${
          isOpen
            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
        }`}
      >
        <div
          className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${currentOption.iconGradient} flex items-center justify-center text-white shadow-2xs shrink-0`}
        >
          {currentOption.icon}
        </div>

        <div className="flex items-center gap-1.5 min-w-0 text-left">
          <span className="font-extrabold text-xs tracking-tight truncate max-w-[130px] sm:max-w-[190px]">
            {currentOption.name}
          </span>
          <span
            className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border hidden md:inline-block ${
              isOpen
                ? 'bg-white/20 text-white border-white/30'
                : currentOption.tagColor
            }`}
          >
            {currentOption.tag}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
            isOpen
              ? 'rotate-180 text-white'
              : 'text-slate-400 group-hover:text-slate-700'
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-84 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Select Active Company Dashboard</span>
            </div>
            <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
              Isolated Consoles
            </span>
          </div>

          <div className="space-y-1">
            {consoleOptions.map(option => {
              const isSelected = option.id === activeConsole;
              return (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-200 shadow-2xs'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${option.iconGradient} flex items-center justify-center text-white shrink-0 shadow-sm`}
                    >
                      {option.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-black truncate leading-tight ${
                            isSelected ? 'text-blue-950 font-black' : 'text-slate-900'
                          }`}
                        >
                          {option.name}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border shrink-0 ${option.tagColor}`}
                        >
                          {option.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5 max-w-[210px] sm:max-w-[240px]">
                        {option.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Direct link to public site in new tab */}
                    <a
                      href={option.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      title={`Open ${option.liveLabel} (Live Website)`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                        →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-3 py-1.5 bg-slate-50/90 rounded-xl text-[10px] text-slate-500 flex items-center justify-between border border-slate-100">
            <span>🔒 Strict data segregation per subsidiary</span>
            <span className="font-bold text-slate-700">Zero Cross-Leakage</span>
          </div>
        </div>
      )}
    </div>
  );
};
