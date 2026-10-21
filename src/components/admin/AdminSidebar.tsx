import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminConsoleMode } from './AdminLayout';
import {
  LayoutDashboard,
  Wifi,
  Package,
  Layers,
  Wrench,
  Image,
  Inbox,
  ShoppingBag,
  MapPin,
  HelpCircle,
  Users,
  BarChart3,
  Globe,
  ScrollText,
  ExternalLink,
  ShieldCheck,
  Shield,
  Building
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
  const { isSuperAdmin } = useAuth();

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
        {/* Brand Header - Dynamic according to active console */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
              activeConsole === 'nexalus-innovations'
                ? 'from-blue-600 via-indigo-600 to-cyan-500 shadow-blue-500/20'
                : activeConsole === 'am-distributors'
                ? 'from-teal-600 via-teal-700 to-emerald-500 shadow-teal-500/20'
                : 'from-blue-700 via-indigo-600 to-cyan-500 shadow-blue-500/20'
            } flex items-center justify-center text-white shadow-md shrink-0`}>
              {activeConsole === 'nexalus-innovations' ? (
                <Shield className="w-5 h-5 text-white" />
              ) : activeConsole === 'am-distributors' ? (
                <Building className="w-5 h-5 text-white" />
              ) : (
                <Layers className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black text-slate-900 tracking-tight leading-tight truncate">
                {activeConsole === 'nexalus-innovations'
                  ? 'NEXALUS INNOVATIONS'
                  : activeConsole === 'am-distributors'
                  ? 'A.M. DISTRIBUTORS'
                  : 'NEXALUS INNOVATIONS LLP'}
              </h2>
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase truncate">
                {activeConsole === 'nexalus-innovations'
                  ? 'Tech & Fiber Console'
                  : activeConsole === 'am-distributors'
                  ? 'Chiplun Depot Console'
                  : 'Corporate Super Admin'}
              </p>
            </div>
          </div>


          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md border tracking-wider bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1.5 w-full justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Firebase Online
            </span>
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
              Operations &amp; Leads
            </div>
            <div className="space-y-1">
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
                <ShoppingBag className="w-4 h-4" />
                Customer Orders (Store)
              </NavLink>

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
                Our Team Management
              </NavLink>
            </div>
          </div>

          {/* System Administration */}
          {isSuperAdmin && (
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

        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Nexalus Security Suite v2.6</span>
          </div>
        </div>
      </aside>
    </>
  );
};
