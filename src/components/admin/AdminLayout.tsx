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
  const { isAuthenticated, isLoading, brandScope, isSuperAdmin, isInnovationsAdmin, isAmAdmin, isCustomer } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine initial console based on role & search params
  const getInitialConsole = (): AdminConsoleMode => {
    if (isInnovationsAdmin) return 'nexalus-innovations';
    if (isAmAdmin) return 'am-distributors';

    const paramConsole = searchParams.get('console');
    if (paramConsole === 'nexalus-innovations' || paramConsole === 'am-distributors' || paramConsole === 'master') {
      return paramConsole as AdminConsoleMode;
    }
    const saved = sessionStorage.getItem(CONSOLE_STORAGE_KEY) as AdminConsoleMode;
    if (saved && (saved === 'master' || saved === 'nexalus-innovations' || saved === 'am-distributors')) {
      return saved;
    }
    return 'master';
  };

  const [activeConsole, setActiveConsoleState] = useState<AdminConsoleMode>(getInitialConsole);
  const location = useLocation();

  // Guarantee child admins always stay strictly locked to their company workspace
  useEffect(() => {
    if (isInnovationsAdmin && activeConsole !== 'nexalus-innovations') {
      setActiveConsoleState('nexalus-innovations');
      sessionStorage.setItem(CONSOLE_STORAGE_KEY, 'nexalus-innovations');
    } else if (isAmAdmin && activeConsole !== 'am-distributors') {
      setActiveConsoleState('am-distributors');
      sessionStorage.setItem(CONSOLE_STORAGE_KEY, 'am-distributors');
    }
  }, [isInnovationsAdmin, isAmAdmin, activeConsole]);

  // Sync state if searchParams change
  useEffect(() => {
    const paramConsole = searchParams.get('console');
    if (paramConsole && (paramConsole === 'master' || paramConsole === 'nexalus-innovations' || paramConsole === 'am-distributors')) {
      if (paramConsole !== activeConsole) {
        if (isSuperAdmin || (paramConsole === 'nexalus-innovations' && isInnovationsAdmin) || (paramConsole === 'am-distributors' && isAmAdmin)) {
          setActiveConsoleState(paramConsole as AdminConsoleMode);
          sessionStorage.setItem(CONSOLE_STORAGE_KEY, paramConsole);
        }
      }
    }
  }, [searchParams, isSuperAdmin, isInnovationsAdmin, isAmAdmin, activeConsole]);

  const setActiveConsole = (mode: AdminConsoleMode) => {
    if (!isSuperAdmin) {
      if (isInnovationsAdmin && mode !== 'nexalus-innovations') return;
      if (isAmAdmin && mode !== 'am-distributors') return;
    }

    setActiveConsoleState(mode);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Connecting to Firebase Firestore...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || isCustomer) {
    return <Navigate to="/admin/login" replace />;
  }

  // Active brand filter for products/services/enquiries
  let activeBrandFilter: BrandId | 'corporate' | 'all' = 'corporate';
  if (activeConsole === 'nexalus-innovations') {
    activeBrandFilter = 'nexalus-innovations';
  } else if (activeConsole === 'am-distributors') {
    activeBrandFilter = 'am-distributors';
  } else {
    activeBrandFilter = isSuperAdmin ? 'corporate' : ((brandScope as BrandId) || 'corporate');
  }

  const outletContext: AdminOutletContext = {
    activeBrandFilter,
    activeConsole,
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
        activeConsole={activeConsole}
        onConsoleChange={setActiveConsole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminNavbar
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activeConsole={activeConsole}
          onConsoleChange={setActiveConsole}
        />

        {/* Prominent Super Admin Child Workspace Banner */}
        {isSuperAdmin && activeConsole !== 'master' && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 sm:px-6 text-xs font-bold flex items-center justify-between border-b border-amber-600/30 shrink-0 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
              <span>
                Active Workspace: <strong className="font-extrabold uppercase tracking-wide">{activeConsole === 'nexalus-innovations' ? 'Nexalus Innovations' : 'A.M. Distributors Chiplun'}</strong>. All operations and forms are scoped strictly to this entity.
              </span>
            </div>
            <button
              onClick={returnToMaster}
              className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-400 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0"
              title="Return to Corporate Master Admin Panel"
            >
              <span>← Return to Corporate Master</span>
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet key={location.pathname} context={outletContext} />
        </main>
      </div>
    </div>
  );
};
