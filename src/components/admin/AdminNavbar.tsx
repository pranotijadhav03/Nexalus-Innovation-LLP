import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminConsoleMode } from './AdminLayout';
import {
  Menu,
  Layers,
  LogOut,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Database,
  Shield,
  Building,
  Check,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

interface AdminNavbarProps {
  onMenuToggle: () => void;
  activeConsole?: AdminConsoleMode;
  onConsoleChange?: (mode: AdminConsoleMode) => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  onMenuToggle,
  activeConsole = 'master',
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

  const handleConsoleSelect = (mode: AdminConsoleMode) => {
    if (onConsoleChange) {
      onConsoleChange(mode);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs h-16 flex items-center justify-between px-3 sm:px-6 gap-2">
      {/* Left Menu & Corporate Console Branding */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 shrink-0 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-xs shrink-0">
            {activeConsole === 'nexalus-innovations' ? (
              <Shield className="w-4 h-4 text-white" />
            ) : activeConsole === 'am-distributors' ? (
              <Building className="w-4 h-4 text-white" />
            ) : (
              <Layers className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight truncate">
              {activeConsole === 'nexalus-innovations'
                ? 'Nexalus Innovations'
                : activeConsole === 'am-distributors'
                ? 'A.M. Distributors Chiplun'
                : 'Nexalus Innovations LLP'}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                {activeConsole === 'nexalus-innovations'
                  ? 'Tech & Fiber Admin Panel'
                  : activeConsole === 'am-distributors'
                  ? 'Chiplun Depot Admin Panel'
                  : 'Corporate Master Admin'}
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-indigo-600 font-bold hidden sm:flex items-center gap-0.5">
                <Database className="w-2.5 h-2.5" /> Firestore Online
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Right Controls: User Profile Dropdown with Consoles & Live Websites */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            className={`flex items-center gap-2 sm:gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all text-left cursor-pointer shadow-2xs group ${
              isDropdownOpen
                ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/10'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
            title="Manage Admin Session & Portals"
          >
            {/* Admin Avatar */}
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20 shrink-0"
            >
              {currentUser?.displayName?.charAt(0) || 'N'}
            </div>

            {/* Admin Name & Email */}
            <div className="text-left hidden sm:block min-w-0">
              <div className="text-xs font-black text-slate-900 leading-tight truncate max-w-[180px]">
                {currentUser?.displayName || 'Nexalus Master Admin'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]">
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
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              {/* Account Identity Header */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                  {currentUser?.displayName?.charAt(0) || 'N'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-slate-900 truncate">
                    {currentUser?.displayName || 'Nexalus Master Admin'}
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

              {/* Operating Admin Panels Switcher */}
              <div className="p-2.5 bg-slate-50/80 rounded-xl space-y-1.5 border border-slate-100">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  <span>Switch Admin Dashboard</span>
                  <span className="text-[9px] text-blue-600 font-black">3 Consoles</span>
                </div>

                <div className="space-y-1">
                  {/* Super Admin Console */}
                  <button
                    type="button"
                    disabled={!isSuperAdmin}
                    onClick={() => {
                      handleConsoleSelect('master');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                      activeConsole === 'master'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isSuperAdmin
                        ? 'hover:bg-white text-slate-700 hover:text-blue-600'
                        : 'opacity-40 cursor-not-allowed text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Layers className="w-4 h-4 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">Super Admin Panel (Corporate)</div>
                        <div className={`text-[10px] truncate ${activeConsole === 'master' ? 'text-blue-100' : 'text-slate-400'}`}>
                          All brands & consolidated group data
                        </div>
                      </div>
                    </div>
                    {activeConsole === 'master' && <Check className="w-4 h-4 shrink-0 stroke-[3]" />}
                  </button>

                  {/* Nexalus Innovations Console */}
                  <button
                    type="button"
                    disabled={!isSuperAdmin && !isInnovationsAdmin}
                    onClick={() => {
                      handleConsoleSelect('nexalus-innovations');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                      activeConsole === 'nexalus-innovations'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isSuperAdmin || isInnovationsAdmin
                        ? 'hover:bg-white text-slate-700 hover:text-blue-600'
                        : 'opacity-40 cursor-not-allowed text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Shield className="w-4 h-4 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">Nexalus Innovations Admin</div>
                        <div className={`text-[10px] truncate ${activeConsole === 'nexalus-innovations' ? 'text-blue-100' : 'text-slate-400'}`}>
                          CCTV, Optical Fiber & Networking
                        </div>
                      </div>
                    </div>
                    {activeConsole === 'nexalus-innovations' && <Check className="w-4 h-4 shrink-0 stroke-[3]" />}
                  </button>

                  {/* A.M. Distributors Console */}
                  <button
                    type="button"
                    disabled={!isSuperAdmin && !isAmAdmin}
                    onClick={() => {
                      handleConsoleSelect('am-distributors');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                      activeConsole === 'am-distributors'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isSuperAdmin || isAmAdmin
                        ? 'hover:bg-white text-slate-700 hover:text-blue-600'
                        : 'opacity-40 cursor-not-allowed text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building className="w-4 h-4 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">A.M. Distributors Admin</div>
                        <div className={`text-[10px] truncate ${activeConsole === 'am-distributors' ? 'text-blue-100' : 'text-slate-400'}`}>
                          Mineral Water, Dairy & Cold-Chain
                        </div>
                      </div>
                    </div>
                    {activeConsole === 'am-distributors' && <Check className="w-4 h-4 shrink-0 stroke-[3]" />}
                  </button>
                </div>
              </div>

              {/* Quick Website Links (The 3 Live Portals) */}
              <div className="p-2.5 bg-slate-50/80 rounded-xl space-y-1.5 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Live Websites &amp; Portals
                </div>
                <div className="space-y-1">
                  {/* Main Corporate Portal */}
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <span className="truncate">Nexalus Innovations LLP (Corporate)</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </a>

                  {/* Child Portal 1: Nexalus Innovations */}
                  <a
                    href="/brands/nexalus-innovations"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="truncate">Nexalus Innovations (Tech Portal)</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </a>

                  {/* Child Portal 2: A.M. Distributors Chiplun */}
                  <a
                    href="/brands/am-distributors"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:text-teal-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <span className="truncate">A.M. Distributors Chiplun (Depot Portal)</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </a>
                </div>
              </div>

              {/* Sign Out Button */}
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
