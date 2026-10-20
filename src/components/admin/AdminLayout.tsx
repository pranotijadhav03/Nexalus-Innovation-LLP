import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';
import { BrandId } from '../../types';

export type AdminConsoleMode = 'master' | 'nexalus-innovations' | 'am-distributors';

export interface AdminOutletContext {
  activeBrandFilter: BrandId | 'all';
  activeConsole: AdminConsoleMode;
  setActiveConsole: (mode: AdminConsoleMode) => void;
  openChildConsole: (brand: 'nexalus-innovations' | 'am-distributors') => void;
  returnToMaster: () => void;
}

const CONSOLE_STORAGE_KEY = 'nexalus_admin_console_active';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, brandScope, isSuperAdmin, isInnovationsAdmin, isAmAdmin } = useAuth();
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

  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setLoadingTimedOut(true), 1800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading && !loadingTimedOut) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Connecting to Firebase Firestore...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Active brand filter for products/services/enquiries
  let activeBrandFilter: BrandId | 'all' = 'all';
  if (activeConsole === 'nexalus-innovations') {
    activeBrandFilter = 'nexalus-innovations';
  } else if (activeConsole === 'am-distributors') {
    activeBrandFilter = 'am-distributors';
  } else {
    activeBrandFilter = isSuperAdmin ? 'all' : ((brandScope as BrandId) || 'all');
  }

  const outletContext: AdminOutletContext = {
    activeBrandFilter,
    activeConsole,
    setActiveConsole,
    openChildConsole,
    returnToMaster
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Dynamic Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeConsole={activeConsole}
        onConsoleChange={setActiveConsole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activeConsole={activeConsole}
          onConsoleChange={setActiveConsole}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
};
