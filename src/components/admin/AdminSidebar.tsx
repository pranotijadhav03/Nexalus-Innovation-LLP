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
  activeConsole = 'master'
}) => {
  const { isSuperAdmin } = useAuth();

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 group cursor-pointer ${
      isActive
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 font-bold border-l-3 border-cyan-400'
        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white font-medium'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0b1329] text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-xl`}
      >
        {/* Brand Header - 2-Tone Dark Slate Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/90 space-y-3 bg-[#070d1e]/90">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
              activeConsole === 'nexalus-innovations'
                ? 'from-blue-600 via-indigo-600 to-cyan-500 shadow-blue-500/30 ring-1 ring-cyan-400/30'
                : activeConsole === 'am-distributors'
                ? 'from-teal-600 via-teal-700 to-emerald-500 shadow-teal-500/30 ring-1 ring-emerald-400/30'
                : 'from-blue-700 via-indigo-600 to-cyan-500 shadow-blue-500/30 ring-1 ring-blue-400/30'
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
              <h2 className="text-sm font-black text-white tracking-tight leading-tight truncate">
                {activeConsole === 'nexalus-innovations'
                  ? 'NEXALUS INNOVATIONS'
                  : activeConsole === 'am-distributors'
                  ? 'A.M. DISTRIBUTORS'
                  : 'NEXALUS INNOVATIONS LLP'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase truncate">
                {activeConsole === 'nexalus-innovations'
                  ? 'Tech & Fiber Console'
                  : activeConsole === 'am-distributors'
                  ? 'Chiplun Depot Console'
                  : 'Corporate Super Admin'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md border tracking-wider bg-slate-800/90 text-cyan-300 border-slate-700/80 flex items-center gap-1.5 w-full justify-center shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Firebase Online
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          {/* Main Group */}
          <div>
            <div className="px-3.5 text-[10px] font-black uppercase tracking-wider text-slate-400/80 mb-2">
              Overview &amp; Analytics
            </div>
            <div className="space-y-1">
              <NavLink to="/admin" end onClick={onClose} className={getNavLinkClass}>
                <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                <span>Dashboard Overview</span>
              </NavLink>

              <NavLink to="/admin/reports" onClick={onClose} className={getNavLinkClass}>
                <BarChart3 className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                <span>Reports &amp; Performance</span>
              </NavLink>
            </div>
          </div>

          {/* Operations & CRM */}
          <div>
            <div className="px-3.5 text-[10px] font-black uppercase tracking-wider text-slate-400/80 mb-2">
              Operations &amp; Leads
            </div>
            <div className="space-y-1">
              <NavLink to="/admin/orders" onClick={onClose} className={getNavLinkClass}>
                <ShoppingBag className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                <span>Customer Orders (Store)</span>
              </NavLink>

              <NavLink to="/admin/enquiries" onClick={onClose} className={getNavLinkClass}>
                <Inbox className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                <span>Enquiry &amp; Leads CRM</span>
              </NavLink>

              <NavLink to="/admin/service-areas" onClick={onClose} className={getNavLinkClass}>
                <MapPin className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                <span>Fiber Service Areas</span>
              </NavLink>
            </div>
          </div>

          {/* Catalog & Content */}
          <div>
            <div className="px-3.5 text-[10px] font-black uppercase tracking-wider text-slate-400/80 mb-2">
              Catalog &amp; Services
            </div>
            <div className="space-y-1">
              <NavLink to="/admin/products" onClick={onClose} className={getNavLinkClass}>
                <Package className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                <span>Products &amp; Categories</span>
              </NavLink>

              <NavLink to="/admin/plans" onClick={onClose} className={getNavLinkClass}>
                <Wifi className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                <span>Internet Plans</span>
              </NavLink>

              <NavLink to="/admin/services" onClick={onClose} className={getNavLinkClass}>
                <Wrench className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                <span>Services Management</span>
              </NavLink>
            </div>
          </div>

          {/* Website Content */}
          <div>
            <div className="px-3.5 text-[10px] font-black uppercase tracking-wider text-slate-400/80 mb-2">
              Website Content
            </div>
            <div className="space-y-1">
              <NavLink to="/admin/content" onClick={onClose} className={getNavLinkClass}>
                <Image className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                <span>Hero Banners &amp; Content</span>
              </NavLink>

              <NavLink to="/admin/faqs" onClick={onClose} className={getNavLinkClass}>
                <HelpCircle className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                <span>FAQs Management</span>
              </NavLink>

              <NavLink to="/admin/team" onClick={onClose} className={getNavLinkClass}>
                <Users className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                <span>Our Team Management</span>
              </NavLink>
            </div>
          </div>

          {/* System Administration */}
          {isSuperAdmin && (
            <div>
              <div className="px-3.5 text-[10px] font-black uppercase tracking-wider text-slate-400/80 mb-2">
                System Administration
              </div>
              <div className="space-y-1">
                <NavLink to="/admin/users" onClick={onClose} className={getNavLinkClass}>
                  <Users className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                  <span>Staff &amp; Role Permissions</span>
                </NavLink>

                <NavLink to="/admin/seo" onClick={onClose} className={getNavLinkClass}>
                  <Globe className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                  <span>SEO &amp; Meta Settings</span>
                </NavLink>

                <NavLink to="/admin/audit-logs" onClick={onClose} className={getNavLinkClass}>
                  <ScrollText className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-cyan-300" />
                  <span>Audit Trails &amp; Logs</span>
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Footer info - 2-Tone Dark Accent */}
        <div className="p-4 border-t border-slate-800/90 bg-[#070d1e]/90">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Nexalus Security Suite v2.6</span>
          </div>
        </div>
      </aside>
    </>
  );
};
