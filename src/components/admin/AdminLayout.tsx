import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';
import { BrandId } from '../../types';

export type AdminConsoleMode = 'master' | 'nexalus-innovations' | 'am-distributors';

export interface AdminOutletContext {
  activeBrandFilter: BrandId | 'corporate' | 'all';
  activeConsole: AdminConsoleMode;
  setActiveConsole: (mode: AdminConsoleMode) => void;
  openChildConsole: (brand: 'nexalus-innovations' | 'am-distributors') => void;
  returnToMaster: () => void;
}

const CONSOLE_STORAGE_KEY = 'nexalus_admin_console_active';

export const AdminLayout: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading, brandScope, isSuperAdmin, isInnovationsAdmin, isAmAdmin, isCustomer, isAdmin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-recovery timeout: Never let AdminLayout hang indefinitely on loading
  const [forceTimeout, setForceTimeout] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setForceTimeout(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const location = useLocation();

  // Synchronously compute effective console on EVERY render directly from URL, role, or session
  const paramConsole = searchParams.get('console');
  const savedConsole = typeof window !== 'undefined'
    ? (sessionStorage.getItem(CONSOLE_STORAGE_KEY) as AdminConsoleMode)
    : null;

  const effectiveConsole: AdminConsoleMode = isInnovationsAdmin
    ? 'nexalus-innovations'
    : isAmAdmin
    ? 'am-distributors'
    : (paramConsole === 'nexalus-innovations' || paramConsole === 'am-distributors' || paramConsole === 'master')
    ? (paramConsole as AdminConsoleMode)
    : isSuperAdmin
    ? 'master'
    : (savedConsole === 'nexalus-innovations' || savedConsole === 'am-distributors' || savedConsole === 'master')
    ? savedConsole
    : 'master';

  // Synchronize sessionStorage whenever effective console changes
  useEffect(() => {
    sessionStorage.setItem(CONSOLE_STORAGE_KEY, effectiveConsole);
  }, [effectiveConsole]);

  const setActiveConsole = (mode: AdminConsoleMode) => {
    if (!isSuperAdmin) {
      if (isInnovationsAdmin && mode !== 'nexalus-innovations') return;
      if (isAmAdmin && mode !== 'am-distributors') return;
    }

    sessionStorage.setItem(CONSOLE_STORAGE_KEY, mode);

    const currentParams = new URLSearchParams(searchParams);
    if (mode === 'master') {
      currentParams.delete('console');
    } else {
      currentParams.set('console', mode);
    }
    setSearchParams(currentParams, { replace: true });
  };

  const openChildConsole = (brand: 'nexalus-innovations' | 'am-distributors') => {
    setActiveConsole(brand);
  };

  const returnToMaster = () => {
    if (isSuperAdmin) {
      setActiveConsole('master');
    }
  };

  // If currentUser is cached or loaded, render instantly! Only show loader if no user and still checking with timeout
  if (isLoading && !currentUser && !forceTimeout) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading console...</p>
        </div>
      </div>
    );
  }

  // Customers are never allowed in Admin Layout; redirect them to homepage
  if (isAuthenticated && (isCustomer || currentUser?.role === 'customer')) {
    return <Navigate to="/" replace />;
  }

  // Strictly restrict Admin Layout to verified administrators only
  if (!isAuthenticated || !isAdmin || !currentUser || currentUser.role === 'customer') {
    return <Navigate to="/admin/login" replace />;
  }

  // Active brand filter for products/services/enquiries: 'all' by default for corporate master view
  let activeBrandFilter: BrandId | 'corporate' | 'all' = 'all';
  if (effectiveConsole === 'nexalus-innovations') {
    activeBrandFilter = 'nexalus-innovations';
  } else if (effectiveConsole === 'am-distributors') {
    activeBrandFilter = 'am-distributors';
  } else {
    activeBrandFilter = isSuperAdmin ? 'all' : ((brandScope as BrandId) || 'corporate');
  }

  const outletContext: AdminOutletContext = {
    activeBrandFilter,
    activeConsole: effectiveConsole,
    setActiveConsole,
    openChildConsole,
    returnToMaster
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Dynamic Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeConsole={effectiveConsole}
        onConsoleChange={setActiveConsole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminNavbar
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activeConsole={effectiveConsole}
          onConsoleChange={setActiveConsole}
        />

        {/* Super Admin Child Workspace Banner */}
        {isSuperAdmin && effectiveConsole !== 'master' && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 sm:px-6 text-xs font-bold flex items-center justify-between border-b border-amber-600/30 shrink-0 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
              <span>
                Active Filter Mode: <strong className="font-extrabold uppercase tracking-wide">{effectiveConsole === 'nexalus-innovations' ? 'Nexalus Innovations' : 'A.M. Distributors Chiplun'}</strong>.
              </span>
            </div>
            <button
              onClick={returnToMaster}
              className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-400 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0"
              title="Return to Corporate Master Admin Panel"
            >
              <span>← View All Master Data</span>
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
};
