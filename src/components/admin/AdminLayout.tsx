import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';
import { BrandId } from '../../types';
import { ArrowLeft, Shield, Building, Layers } from 'lucide-react';

export type AdminConsoleMode = 'master' | 'nexalus-innovations' | 'am-distributors';

export interface AdminOutletContext {
  activeBrandFilter: BrandId | 'all';
  activeConsole: AdminConsoleMode;
  setActiveConsole: (mode: AdminConsoleMode) => void;
  openChildConsole: (brand: 'nexalus-innovations' | 'am-distributors') => void;
  returnToMaster: () => void;
}

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, brandScope, isSuperAdmin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine initial console mode
  const urlConsole = searchParams.get('console') as AdminConsoleMode | null;
  const [activeConsole, setActiveConsoleState] = useState<AdminConsoleMode>(() => {
    if (!isSuperAdmin) {
      return (brandScope as AdminConsoleMode) || 'nexalus-innovations';
    }
    if (urlConsole === 'nexalus-innovations' || urlConsole === 'am-distributors' || urlConsole === 'master') {
      return urlConsole;
    }
    const saved = sessionStorage.getItem('nexalus_admin_console') as AdminConsoleMode | null;
    if (saved === 'nexalus-innovations' || saved === 'am-distributors' || saved === 'master') {
      return saved;
    }
    return 'master';
  });

  // Keep state in sync with URL parameter if present
  useEffect(() => {
    if (isSuperAdmin && urlConsole && (urlConsole === 'master' || urlConsole === 'nexalus-innovations' || urlConsole === 'am-distributors')) {
      if (urlConsole !== activeConsole) {
        setActiveConsoleState(urlConsole);
        sessionStorage.setItem('nexalus_admin_console', urlConsole);
      }
    }
  }, [urlConsole, isSuperAdmin, activeConsole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Verifying administrative credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Console mode switch handler for Super Admin
  const handleSetConsole = (mode: AdminConsoleMode) => {
    if (!isSuperAdmin) return;
    setActiveConsoleState(mode);
    sessionStorage.setItem('nexalus_admin_console', mode);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (mode === 'master') {
        next.delete('console');
      } else {
        next.set('console', mode);
      }
      return next;
    });
  };

  // Derive the active brand filter for data fetching (strictly isolating data)
  const activeBrandFilter: BrandId | 'all' = !isSuperAdmin
    ? (brandScope as BrandId)
    : activeConsole === 'master'
    ? 'all'
    : (activeConsole as BrandId);

  const outletContext: AdminOutletContext = {
    activeBrandFilter,
    activeConsole,
    setActiveConsole: handleSetConsole,
    openChildConsole: (brand: 'nexalus-innovations' | 'am-distributors') => handleSetConsole(brand),
    returnToMaster: () => handleSetConsole('master')
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Dynamic Sidebar based on current console mode */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeConsole={activeConsole}
        onConsoleChange={handleSetConsole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activeConsole={activeConsole}
          onConsoleChange={handleSetConsole}
        />

        {/* Super Admin Notice Bar when managing an isolated child console */}
        {isSuperAdmin && activeConsole !== 'master' && (
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-blue-600/30 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="text-xs font-semibold text-white truncate flex items-center gap-2">
                <span className="text-blue-100">Active Child Console:</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase ${
                  activeConsole === 'nexalus-innovations'
                    ? 'bg-blue-500/40 text-white border border-blue-400/40'
                    : 'bg-teal-500/40 text-white border border-teal-400/40'
                }`}>
                  {activeConsole === 'nexalus-innovations' ? (
                    <><Shield className="w-3 h-3" /> Nexalus Innovations (Tech &amp; Fiber)</>
                  ) : (
                    <><Building className="w-3 h-3" /> A.M. Distributors (Water &amp; Dairy)</>
                  )}
                </span>
                <span className="text-[11px] text-blue-200 hidden lg:inline">
                  • Other child company data is completely isolated &amp; hidden
                </span>
              </div>
            </div>

            <button
              onClick={() => handleSetConsole('master')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all border border-white/30 cursor-pointer shrink-0 shadow-2xs hover:scale-[1.02]"
              title="Return to Master Corporate Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Master Console</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Provide outletContext containing strict activeBrandFilter and console actions */}
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
};
