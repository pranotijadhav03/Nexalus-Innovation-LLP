import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminConsoleMode } from './AdminLayout';
import { consoleOptions } from './CompanyConsoleDropdown';
import {
  Menu,
  ExternalLink,
  Shield,
  Layers,
  Building,
  LogOut,
  ChevronDown,
  Check,
  Sparkles
} from 'lucide-react';

interface AdminNavbarProps {
  onMenuToggle: () => void;
  activeConsole: AdminConsoleMode;
  onConsoleChange: (mode: AdminConsoleMode) => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  onMenuToggle,
  activeConsole,
  onConsoleChange
}) => {
  const { isSuperAdmin, isInnovationsAdmin, isAmAdmin, currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const currentOption = consoleOptions.find(opt => opt.id === activeConsole) || consoleOptions[0];

  const handleConsoleSelect = (mode: AdminConsoleMode) => {
    onConsoleChange(mode);
    setIsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left Menu & Current Operating Console Status */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 shrink-0 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Active Scope:
          </span>
          <span
            className={`text-xs font-extrabold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
              activeConsole === 'am-distributors'
                ? 'bg-teal-50 text-teal-800 border-teal-200'
                : activeConsole === 'nexalus-innovations'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-indigo-50 text-indigo-900 border-indigo-200'
            }`}
          >
            {activeConsole === 'am-distributors' ? (
              <Building className="w-3.5 h-3.5 text-teal-600" />
            ) : activeConsole === 'nexalus-innovations' ? (
              <Shield className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>
              {activeConsole === 'am-distributors'
                ? 'A.M. Distributors Chiplun'
                : activeConsole === 'nexalus-innovations'
                ? 'Nexalus Innovations'
                : 'Nexalus Innovations LLP (Master)'}
            </span>
          </span>
          {!isSuperAdmin && (
            <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">(Locked)</span>
          )}
        </div>
      </div>

      {/* Right Controls: Public Site Link & Dashboard/User Profile Dropdown with Sign Out */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
          title="Open Nexalus Corporate Main Website"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
          <span>Main Website</span>
        </Link>

        {/* Dashboard Switcher & Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all text-left cursor-pointer shadow-2xs group ${
              isDropdownOpen
                ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/10'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
            title="Switch Dashboard or Manage Session"
          >
            {/* Admin Avatar */}
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20 shrink-0"
            >
              {currentUser?.displayName?.charAt(0) || 'N'}
            </div>

            {/* Admin Name & Email */}
            <div className="text-left hidden sm:block min-w-0">
              <div className="text-xs font-black text-slate-900 leading-tight truncate max-w-[200px]">
                {currentUser?.displayName || 'Nexalus Corporate Master Admin'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                {currentUser?.email}
              </div>
            </div>

            {/* Dropdown Chevron Indicator */}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 shrink-0 ${
                isDropdownOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu Modal / Popover */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              {/* Account Identity Header */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                  {currentUser?.displayName?.charAt(0) || 'N'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-slate-900 truncate">
                    {currentUser?.displayName || 'Nexalus Corporate Master Admin'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">
                    {currentUser?.email}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {isSuperAdmin
                        ? 'Corporate Super Admin'
                        : isInnovationsAdmin
                        ? 'Nexalus Innovations Admin'
                        : isAmAdmin
                        ? 'A.M. Distributors Admin'
                        : 'Staff Admin'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dashboard Switcher Section */}
              <div className="space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Select Dashboard</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                    3 Portals
                  </span>
                </div>

                {consoleOptions.map(option => {
                  const isSelected = option.id === activeConsole;
                  const isDisabled = !isSuperAdmin && option.id !== activeConsole;

                  return (
                    <div
                      key={option.id}
                      onClick={() => {
                        if (!isDisabled) {
                          handleConsoleSelect(option.id);
                        }
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                        isDisabled
                          ? 'opacity-40 cursor-not-allowed border-transparent'
                          : isSelected
                          ? 'bg-blue-50/90 border-blue-200 shadow-2xs cursor-pointer'
                          : 'border-transparent hover:border-slate-200 hover:bg-slate-50 cursor-pointer group'
                      }`}
                      title={
                        isDisabled
                          ? 'Not assigned to your role'
                          : `Switch to ${option.name}`
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${option.iconGradient} flex items-center justify-center text-white shrink-0 shadow-xs`}
                        >
                          {option.icon}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
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
                          <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5 max-w-[210px]">
                            {option.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : !isDisabled ? (
                          <span className="text-xs font-bold text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                            →
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Direct Live Website Links */}
              <div className="pt-1 border-t border-slate-100 space-y-0.5">
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    Open Corporate Main Website
                  </span>
                  <span className="text-[10px] text-slate-400">↗</span>
                </a>
                {currentOption.id !== 'master' && (
                  <a
                    href={currentOption.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                      Open {currentOption.shortName} Portal
                    </span>
                    <span className="text-[10px] text-slate-400">↗</span>
                  </a>
                )}
              </div>

              {/* Sign Out Button INSIDE the Dropdown */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/80 hover:bg-rose-100 hover:text-rose-700 border border-rose-200 transition-all cursor-pointer shadow-2xs"
                  title="Sign Out of Admin Console"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
