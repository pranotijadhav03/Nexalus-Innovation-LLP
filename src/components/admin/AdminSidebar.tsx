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
  ArrowRight,
  ArrowLeft,
  ChevronRight
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
  const { isSuperAdmin, isAmAdmin, isInnovationsAdmin } = useAuth();
  const isTechConsole = activeConsole === 'nexalus-innovations' || isInnovationsAdmin;
  const isAmConsole = !isTechConsole && (activeConsole === 'am-distributors' || isAmAdmin);
  const isMasterConsole = !isTechConsole && !isAmConsole && isSuperAdmin;

  const getNavPath = (path: string) => {
    if (isSuperAdmin && activeConsole && activeConsole !== 'master') {
      return `${path}?console=${activeConsole}`;
    }
    return path;
  };

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
        {/* Brand Header - Dynamic according to active console */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
              isTechConsole
                ? 'from-blue-600 via-indigo-600 to-cyan-500 shadow-blue-500/20'
                : isAmConsole
                ? 'from-teal-600 via-teal-700 to-emerald-500 shadow-teal-500/20'
                : 'from-blue-700 via-indigo-600 to-cyan-500 shadow-blue-500/20'
            } flex items-center justify-center text-white shadow-md shrink-0`}>
              {isTechConsole ? (
                <Shield className="w-5 h-5 text-white" />
              ) : isAmConsole ? (
                <Building className="w-5 h-5 text-white" />
              ) : (
                <Layers className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black text-slate-900 tracking-tight leading-tight truncate">
                {isTechConsole
                  ? 'NEXALUS INNOVATIONS'
                  : isAmConsole
                  ? 'A.M. DISTRIBUTORS'
                  : 'NEXALUS INNOVATIONS LLP'}
              </h2>
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase truncate">
                {isTechConsole
                  ? 'Tech & Fiber Console'
                  : isAmConsole
                  ? 'Chiplun Depot Console'
                  : 'Corporate Master Admin'}
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

        {/* Super Admin Managing Child Workspace Notification */}
        {isSuperAdmin && !isMasterConsole && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0">
              <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider">
                Child Workspace
              </p>
              <p className="text-[11px] text-amber-800 truncate font-semibold">
                Super Admin viewing
              </p>
            </div>
            <button
              type="button"
              onClick={() => onConsoleChange?.('master')}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
              title="Return to Corporate Master Panel"
            >
              ← Master
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">

          {/* ======================================================== */}
          {/* 1. CORPORATE MASTER ADMIN NAVIGATION */}
          {/* ======================================================== */}
          {isMasterConsole && (
            <>
              {/* Corporate Overview */}
              <div>
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Corporate Overview
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

              {/* Commercial Catalog & Services */}
              <div>
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Catalog &amp; Offerings
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
                    Plans &amp; Pricing
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
                    Services Portfolio
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
                    Areas Covered & Services
                  </NavLink>
                </div>
              </div>

              {/* Corporate Parent Operations */}
              <div>
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Parent Operations
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
                    Corporate Website Content
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
                    Corporate Inquiries CRM
                  </NavLink>

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
                    <span>Customer Registrations &amp; Logins</span>
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
                    Corporate Leadership Team
                  </NavLink>
                </div>
              </div>

              {/* Enterprise Governance */}
              <div>
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Enterprise Governance
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
                    Staff Roles & Permissions
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
            </>
          )}

          {/* ======================================================== */}
          {/* 2. NEXALUS INNOVATIONS TECH ADMIN NAVIGATION */}
          {/* ======================================================== */}
          {isTechConsole && !isMasterConsole && (
            <>
              {/* Tech Overview */}
              <div>
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Overview & Analytics
                </div>
                <div className="space-y-1">
                  <NavLink
                    to={getNavPath('/admin')}
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
                    Tech Dashboard
                  </NavLink>

                  <NavLink
                    to={getNavPath('/admin/reports')}
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
                    Tech Performance Reports
                  </NavLink>
                </div>
              </div>

              {/* Tech Operations & CRM */}
              <div>
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Operations & Inquiries
                </div>
                <div className="space-y-1">
                  <NavLink
                    to={getNavPath('/admin/enquiries')}
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
                    Tech Inquiries CRM
                  </NavLink>

                  <NavLink
                    to={getNavPath('/admin/team')}
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
                    Tech & Field Engineers
                  </NavLink>
                </div>
              </div>

              {/* Hardware & IT Services (CCTV, Categories, Services) */}
              <div>
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Hardware & IT Services
                </div>
                <div className="space-y-1">
                  <NavLink
                    to={getNavPath('/admin/products')}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Shield className="w-4 h-4" />
                    CCTV & Hardware Catalog
                  </NavLink>

                  <NavLink
                    to={getNavPath('/admin/categories')}
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
                    Hardware Categories
                  </NavLink>

                  <NavLink
                    to={getNavPath('/admin/services')}
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
                    IT & Network Services
                  </NavLink>

                  <NavLink
                    to={getNavPath('/admin/service-areas')}
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
                    Coverage & City Services
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
                    to={getNavPath('/admin/content')}
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
                    Tech Website Content
                  </NavLink>

                  <NavLink
                    to={getNavPath('/admin/faqs')}
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
                    Tech Customer FAQs
                  </NavLink>
                </div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* 3. A.M. DISTRIBUTORS CHIPLUN ADMIN NAVIGATION */}
          {/* ======================================================== */}
          {isAmConsole && !isMasterConsole && (
            <>
              {/* Depot Overview */}
              <div>
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Depot Overview
                </div>
                <div className="space-y-1">
                  <NavLink
                    to={getNavPath('/admin')}
                    end
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Depot Dashboard
                  </NavLink>

                  <NavLink
                    to={getNavPath('/admin/reports')}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <BarChart3 className="w-4 h-4" />
                    Logistics Reports
                  </NavLink>
                </div>
              </div>

              {/* Depot Operations & Orders */}
              <div>
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Depot Operations
                </div>
                <div className="space-y-1">
                  <NavLink
                    to={getNavPath('/admin/enquiries')}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Inbox className="w-4 h-4" />
                    Depot Inquiries & Orders
                  </NavLink>

                  <NavLink
                    to={getNavPath('/admin/team')}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Users className="w-4 h-4" />
                    Chiplun Logistics Team
                  </NavLink>
                </div>
              </div>

              {/* Water & Dairy Products */}
              <div>
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Products & Route Services
                </div>
                <div className="space-y-1">
                  <NavLink
                    to={getNavPath('/admin/products')}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Package className="w-4 h-4" />
                    Water & Dairy SKUs
                  </NavLink>

                  <NavLink
                    to={getNavPath('/admin/categories')}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Layers className="w-4 h-4" />
                    Depot Categories
                  </NavLink>

                  <NavLink
                    to={getNavPath('/admin/services')}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Wrench className="w-4 h-4" />
                    Cold-Chain Delivery Routes
                  </NavLink>

                  <NavLink
                    to={getNavPath('/admin/service-areas')}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <MapPin className="w-4 h-4" />
                    Delivery & Distribution Areas
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
                    to={getNavPath('/admin/content')}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Image className="w-4 h-4" />
                    Chiplun Website Content
                  </NavLink>

                  <NavLink
                    to={getNavPath('/admin/faqs')}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <HelpCircle className="w-4 h-4" />
                    Depot FAQs
                  </NavLink>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Nexalus Security Suite v2.6</span>
          </div>
        </div>
      </aside>
    </>
  );
};
