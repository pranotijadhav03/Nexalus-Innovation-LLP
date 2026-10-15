import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminConsoleMode } from './AdminLayout';
import { CompanyConsoleDropdown } from './CompanyConsoleDropdown';
import {
  LayoutDashboard,
  Shield,
  Wifi,
  Package,
  Layers,
  Wrench,
  Image,
  Inbox,
  MapPin,
  HelpCircle,
  Users,
  BarChart3,
  Globe,
  ScrollText,
  ArrowLeft,
  Server
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
  const { currentUser, isSuperAdmin, isInnovationsAdmin, isAmAdmin } = useAuth();

  const getHeaderBranding = () => {
    if (activeConsole === 'nexalus-innovations') {
      return {
        title: 'NEXALUS TECH',
        subtitle: 'INNOVATIONS ADMIN',
        badge: 'TECH & FIBER CONSOLE',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <Shield className="w-5 h-5 text-white" />,
        gradient: 'from-blue-700 via-blue-600 to-cyan-500 shadow-blue-500/25'
      };
    }
    if (activeConsole === 'am-distributors') {
      return {
        title: 'A.M. DISTRIBUTORS',
        subtitle: 'DEPOT & LOGISTICS ADMIN',
        badge: 'DEPOT CONSOLE',
        badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        icon: <Server className="w-5 h-5 text-white" />,
        gradient: 'from-teal-700 via-teal-600 to-emerald-500 shadow-teal-500/25'
      };
    }
    return {
      title: 'NEXALUS',
      subtitle: 'INNOVATIONS LLP',
      badge: 'MASTER SUPER ADMIN',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <Layers className="w-5 h-5 text-white" />,
      gradient: 'from-blue-700 via-indigo-600 to-cyan-500 shadow-blue-500/25'
    };
  };

  const branding = getHeaderBranding();

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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white text-slate-700 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-200 shadow-xs`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 space-y-3 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${branding.gradient} flex items-center justify-center text-white shadow-md`}>
              {branding.icon}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-slate-900 tracking-tight leading-tight truncate">
                {branding.title}
              </h2>
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase truncate">
                {branding.subtitle}
              </p>
            </div>
          </div>

          {/* Console Mode Switcher Dropdown in Sidebar */}
          {isSuperAdmin && onConsoleChange ? (
            <CompanyConsoleDropdown
              activeConsole={activeConsole}
              onConsoleChange={onConsoleChange}
              variant="sidebar"
              onItemSelect={onClose}
            />
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider ${branding.badgeColor}`}>
                {branding.badge}
              </span>
            </div>
          )}

          {/* Current User Role Pill */}
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
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Main Group */}
          <div>
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Overview & Analytics
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
                Reports & Performance
              </NavLink>
            </div>
          </div>

          {/* Operations & CRM */}
          <div>
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Operations & Leads
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
                Enquiry & Leads CRM
              </NavLink>

              {/* Fiber Service Areas (Only relevant for Nexalus Innovations Tech) */}
              {(isSuperAdmin || isInnovationsAdmin) && activeConsole !== 'am-distributors' && (
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
                  Fiber Service Areas
                </NavLink>
              )}
            </div>
          </div>

          {/* Catalog & Content */}
          <div>
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Catalog & Services
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
                {activeConsole === 'am-distributors'
                  ? 'Depot Products Catalog'
                  : activeConsole === 'nexalus-innovations'
                  ? 'Tech Products Catalog'
                  : 'Products Catalog'}
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

              {/* Internet Plans (Only relevant for Nexalus Innovations Tech) */}
              {(isSuperAdmin || isInnovationsAdmin) && activeConsole !== 'am-distributors' && (
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
                  Internet Plans
                </NavLink>
              )}

              <NavLink
                to="/admin/services"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Wrench className="w-4 h-4" />
                Services Management
              </NavLink>
            </div>
          </div>

          {/* Website Content */}
          <div>
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Website Content
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
                Hero Banners & Content
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
            </div>
          </div>

          {/* Parent Admin Only Settings */}
          {isSuperAdmin && activeConsole === 'master' && (
            <div>
              <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                System Administration
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
                  Staff & Role Permissions
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
                  SEO & Meta Settings
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
                  Audit Trails & Logs
                </NavLink>
              </div>
            </div>
          )}

          {/* Quick Access to Live Websites */}
          <div>
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Live Operating Portals
            </div>
            <div className="space-y-1">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 transition-colors"
                title="Open Nexalus Innovations LLP Corporate Main Website"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  Nexalus Main Website
                </span>
                <span className="text-[10px] text-slate-400">↗</span>
              </a>
              {(activeConsole === 'master' || activeConsole === 'nexalus-innovations') && (
                <a
                  href="/brands/nexalus-innovations"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-blue-700 hover:text-blue-800 hover:bg-blue-50/70 transition-colors"
                >
                  <span>⚡ Nexalus Innovations Site</span>
                  <span className="text-[10px] text-blue-400">↗</span>
                </a>
              )}
              {(activeConsole === 'master' || activeConsole === 'am-distributors') && (
                <a
                  href="/brands/am-distributors"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-teal-700 hover:text-teal-800 hover:bg-teal-50/70 transition-colors"
                >
                  <span>🚚 A.M. Distributors Site</span>
                  <span className="text-[10px] text-teal-400">↗</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Note */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 text-center text-[10px] text-slate-400 font-medium">
          Nexalus Innovations LLP © 2026
        </div>
      </aside>
    </>
  );
};
