import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminConsoleMode } from './AdminLayout';
import {
  LayoutDashboard,
  ShoppingCart,
  FolderGit2,
  Wifi,
  Package,
  Layers,
  Wrench,
  Image,
  Inbox,
  MapPin,
  HelpCircle,
  Users,
  UserCheck,
  BarChart3,
  Globe,
  ScrollText,
  ShieldCheck,
  Shield,
  Building,
  ExternalLink,
  Sliders
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeConsole?: AdminConsoleMode;
  onConsoleChange?: (mode: AdminConsoleMode) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  activeConsole = 'master',
  onConsoleChange
}) => {
  const { isSuperAdmin, isAmAdmin, isInnovationsAdmin, currentUser } = useAuth();
  const location = useLocation();

  // Child admins with strict company credentials (not Super Admin)
  const isStrictAmOnly = isAmAdmin && !isSuperAdmin;
  const isStrictInnovationsOnly = isInnovationsAdmin && !isSuperAdmin;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white text-slate-700 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 lg:h-screen lg:shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-200 shadow-xs`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 shadow-blue-500/20 flex items-center justify-center text-white shadow-md shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black text-slate-900 tracking-tight leading-tight truncate">
                NEXALUS INNOVATIONS LLP
              </h2>
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase truncate">
                {isStrictAmOnly
                  ? 'A.M. Distributors Depot Panel'
                  : isStrictInnovationsOnly
                  ? 'Nexalus Innovations Panel'
                  : 'Corporate Administration'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md border tracking-wider bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1.5 w-full justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Firebase Online
            </span>
          </div>

          {/* Quick Console Indicator / Switcher for Super Admin */}
          {isSuperAdmin && activeConsole !== 'master' && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[9px] font-black text-amber-900 uppercase tracking-wider">
                  Active Filter Mode
                </p>
                <p className="text-xs font-bold text-amber-800 truncate">
                  {activeConsole === 'nexalus-innovations' ? 'Nexalus Tech' : 'A.M. Distributors'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onConsoleChange?.('master')}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                Reset to All
              </button>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* 1. Overview & Analytics */}
          <div>
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Overview &amp; Analytics
            </div>
            <div className="space-y-1">
              <NavLink
                to="/admin"
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard Overview
              </NavLink>

              <NavLink
                to="/admin/reports"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <BarChart3 className="w-4 h-4" />
                Enterprise Reports
              </NavLink>
            </div>
          </div>

          {/* 2. Catalog & Commercial Operations */}
          <div>
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Catalog &amp; Operations
            </div>
            <div className="space-y-1">
              <NavLink
                to="/admin/products"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Package className="w-4 h-4" />
                Products Catalog
              </NavLink>

              <NavLink
                to="/admin/categories"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Layers className="w-4 h-4" />
                Product Categories
              </NavLink>

              {!isStrictAmOnly && (
                <NavLink
                  to="/admin/plans"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Wifi className="w-4 h-4" />
                  Internet Plans &amp; Tariffs
                </NavLink>
              )}

              <NavLink
                to="/admin/orders"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <ShoppingCart className="w-4 h-4 text-orange-500" />
                <span>Orders &amp; Bookings</span>
              </NavLink>

              {!isStrictAmOnly && (
                <NavLink
                  to="/admin/projects"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>Case Studies &amp; Projects</span>
                </NavLink>
              )}

              <NavLink
                to="/admin/services"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive && !location.search.includes('tab=solutions')
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Wrench className="w-4 h-4" />
                Services Portfolio
              </NavLink>

              <NavLink
                to="/admin/services?tab=solutions"
                onClick={onClose}
                className={() =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    location.pathname === '/admin/services' && location.search.includes('tab=solutions')
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Sliders className="w-4 h-4" />
                Solution Requirements
              </NavLink>

              <NavLink
                to="/admin/service-areas"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <MapPin className="w-4 h-4" />
                Service Areas &amp; Coverage
              </NavLink>
            </div>
          </div>

          {/* 3. Communications & CRM */}
          <div>
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Communications &amp; CRM
            </div>
            <div className="space-y-1">
              <NavLink
                to="/admin/enquiries"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Inbox className="w-4 h-4" />
                Inquiries CRM
              </NavLink>

              <NavLink
                to="/admin/team"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Users className="w-4 h-4" />
                Leadership &amp; Staff Team
              </NavLink>

              <NavLink
                to="/admin/faqs"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <HelpCircle className="w-4 h-4" />
                FAQs Management
              </NavLink>

              {isSuperAdmin && (
                <NavLink
                  to="/admin/users?tab=customers"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>Customer Logins &amp; Accounts</span>
                </NavLink>
              )}
            </div>
          </div>

          {/* 4. Website Management */}
          <div>
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Website Management
            </div>
            <div className="space-y-1">
              <NavLink
                to="/admin/content"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Image className="w-4 h-4" />
                Website Content &amp; Slides
              </NavLink>
            </div>
          </div>

          {/* 5. System Administration (Super Admin) */}
          {isSuperAdmin && (
            <div>
              <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                System Governance
              </div>
              <div className="space-y-1">
                <NavLink
                  to="/admin/users"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Users className="w-4 h-4" />
                  Staff Roles &amp; Permissions
                </NavLink>

                <NavLink
                  to="/admin/seo"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Globe className="w-4 h-4" />
                  SEO &amp; Meta Settings
                </NavLink>

                <NavLink
                  to="/admin/audit-logs"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <ScrollText className="w-4 h-4" />
                  Audit Trails &amp; Logs
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* User Pill & Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 shrink-0 space-y-2">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 truncate">
                {currentUser?.displayName || 'Admin User'}
              </div>
              <div className="text-[10px] font-medium text-slate-500 truncate">
                {currentUser?.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Nexalus Admin Suite v3.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
