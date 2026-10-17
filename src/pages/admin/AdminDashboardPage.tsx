import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminOutletContext } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import {
  Package,
  Wifi,
  Wrench,
  Inbox,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Building,
  Layers,
  MapPin,
  Users,
  Image,
  Database,
  ExternalLink,
  Truck,
  Droplets,
  IceCream,
  Sparkles,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import {
  getProducts,
  getInternetPlans,
  getServices,
  getEnquiries,
  getAuditLogs
} from '../../firebase/services';
import { Product, InternetPlan, Service, Enquiry, AuditLog } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, isSuperAdmin } = useAuth();
  const outletCtx = useOutletContext<AdminOutletContext>();
  const activeConsole = outletCtx?.activeConsole || 'master';
  const setActiveConsole = outletCtx?.setActiveConsole || (() => {});
  const returnToMaster = outletCtx?.returnToMaster || (() => {});

  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<InternetPlan[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subsidiary metrics
  const [nexalusProductsCount, setNexalusProductsCount] = useState(0);
  const [amProductsCount, setAmProductsCount] = useState(0);
  const [nexalusLeadsCount, setNexalusLeadsCount] = useState(0);
  const [amLeadsCount, setAmLeadsCount] = useState(0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allProds, allPlans, allServs, allEnqs, allLogs] = await Promise.all([
        getProducts(undefined),
        getInternetPlans(),
        getServices(undefined),
        getEnquiries('all'),
        getAuditLogs()
      ]);
      setProducts(allProds);
      setPlans(allPlans);
      setServices(allServs);
      setEnquiries(allEnqs);
      setLogs(allLogs.slice(0, 6));

      setNexalusProductsCount(
        allProds.filter(
          p =>
            p.brandId === 'nexalus-innovations' ||
            p.brandId === 'cp-plus' ||
            p.brandId === 'one-broadband' ||
            p.brandId === 'itti-networking'
        ).length
      );
      setAmProductsCount(allProds.filter(p => p.brandId === 'am-distributors').length);
      setNexalusLeadsCount(
        allEnqs.filter(
          e =>
            e.brandId === 'nexalus-innovations' ||
            e.brandId === 'cp-plus' ||
            e.brandId === 'one-broadband' ||
            e.brandId === 'itti-networking'
        ).length
      );
      setAmLeadsCount(allEnqs.filter(e => e.brandId === 'am-distributors').length);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('nexalus_data_update', handleUpdate);
    return () => window.removeEventListener('nexalus_data_update', handleUpdate);
  }, []);

  // ----------------------------------------------------
  // 1. CORPORATE MASTER SUPER ADMIN DASHBOARD
  // ----------------------------------------------------
  const renderMasterDashboard = () => {
    const newEnquiriesCount = enquiries.filter(e => e.status === 'new').length;
    const inProgressEnquiriesCount = enquiries.filter(
      e => e.status === 'in_progress' || e.status === 'contacted'
    ).length;
    const publishedProductsCount = products.filter(p => p.published).length;
    const activePlansCount = plans.filter(p => p.published).length;
    const activeServicesCount = services.filter(s => s.published).length;

    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Corporate Master Admin Panel
              </h1>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Database className="w-2.5 h-2.5" /> Live Firestore
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Nexalus Innovations LLP • Unified Central Administration &amp; Multi-Entity Governance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/enquiries"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Inbox className="w-4 h-4" /> All Inquiries ({enquiries.length})
            </Link>
          </div>
        </div>


        {/* Group Consolidated Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Consolidated Catalog"
            value={publishedProductsCount}
            subtitle={`Total items across subsidiaries: ${products.length}`}
            icon={<Package className="w-6 h-6" />}
            colorScheme="blue"
          />

          <StatCard
            title="Internet Plans"
            value={activePlansCount}
            subtitle="One Broadband live tariffs"
            icon={<Wifi className="w-6 h-6" />}
            colorScheme="purple"
          />

          <StatCard
            title="Active Services"
            value={activeServicesCount}
            subtitle="Engineering & distribution solutions"
            icon={<Wrench className="w-6 h-6" />}
            colorScheme="teal"
          />

          <StatCard
            title="New Inquiries"
            value={newEnquiriesCount}
            subtitle={`${inProgressEnquiriesCount} in progress`}
            icon={<AlertCircle className="w-6 h-6" />}
            colorScheme="amber"
            trend={{ value: `${newEnquiriesCount} New Leads`, isPositive: newEnquiriesCount === 0 }}
          />
        </div>

        {/* Child Website Portals (Direct 1-Click Access for Super Admin) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Child Website Portals (Direct Switch)</span>
            </h2>
            <span className="text-[11px] font-bold text-slate-400">Click to open child dashboard</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Nexalus Innovations */}
            <div
              onClick={() => setActiveConsole('nexalus-innovations')}
              className="p-5 rounded-2xl bg-gradient-to-br from-white to-blue-50/40 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Child Portal 01
                    </span>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">
                      Nexalus Innovations
                    </h3>
                    <p className="text-xs text-slate-500">
                      CCTV Surveillance, Optical Fiber Internet &amp; Networking
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  {nexalusProductsCount} Products • {nexalusLeadsCount} Leads
                </span>
                <span className="font-black text-blue-600 group-hover:underline flex items-center gap-1">
                  Open Tech Dashboard &rarr;
                </span>
              </div>
            </div>

            {/* Card 2: A.M. Distributors Chiplun */}
            <div
              onClick={() => setActiveConsole('am-distributors')}
              className="p-5 rounded-2xl bg-gradient-to-br from-white to-teal-50/40 border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30 group-hover:scale-105 transition-transform shrink-0">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      Child Portal 02
                    </span>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors mt-0.5">
                      A.M. Distributors Chiplun
                    </h3>
                    <p className="text-xs text-slate-500">
                      Mineral Water, Ice Cream, Dairy &amp; Cold-Chain Depot
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all shrink-0" />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  {amProductsCount} Products • {amLeadsCount} Leads
                </span>
                <span className="font-black text-teal-700 group-hover:underline flex items-center gap-1">
                  Open Chiplun Dashboard &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Action Shortcuts */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Quick Operations
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              to="/admin/products"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Products</span>
            </Link>

            <Link
              to="/admin/plans"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wifi className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Internet Plans</span>
            </Link>

            <Link
              to="/admin/services"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Services</span>
            </Link>

            <Link
              to="/admin/categories"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Categories</span>
            </Link>

            <Link
              to="/admin/enquiries"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Inbox className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">CRM Leads</span>
            </Link>

            <Link
              to="/admin/service-areas"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Fiber Areas</span>
            </Link>
          </div>
        </div>

        {/* CRM Leads & Brand Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Latest Enquiries CRM Box */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Recent Inquiries Across All Businesses
                </h2>
                <p className="text-xs text-slate-500">Live submissions saved in Firestore collection</p>
              </div>
              <Link
                to="/admin/enquiries"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Open Full CRM <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {enquiries.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No active inquiries in Firestore</p>
                <p className="text-[11px] text-slate-400">Incoming inquiries from website forms will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {enquiries.slice(0, 5).map(enq => (
                  <div key={enq.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {enq.customerName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            enq.brandId === 'am-distributors'
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : enq.brandId === 'nexalus-innovations'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {enq.brandId === 'am-distributors'
                            ? 'A.M. Distributors'
                            : enq.brandId === 'nexalus-innovations'
                            ? 'Nexalus Innovations'
                            : 'Corporate'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {enq.phone} • {enq.productOrServiceName || enq.location || 'General Inquiry'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          enq.status === 'new'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : enq.status === 'contacted'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : enq.status === 'in_progress'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {enq.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <Link
                        to="/admin/enquiries"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subsidiary Breakdown & Audit Logs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Subsidiary Breakdown</h3>
              <div className="space-y-3">
                <div
                  onClick={() => setActiveConsole('nexalus-innovations')}
                  className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        Nexalus Innovations
                      </div>
                      <div className="text-[10px] text-blue-700">
                        {nexalusProductsCount} products • {nexalusLeadsCount} leads
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div
                  onClick={() => setActiveConsole('am-distributors')}
                  className="p-3.5 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-between cursor-pointer hover:border-teal-300 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-5 h-5 text-teal-600" />
                    <div>
                      <div className="text-xs font-bold text-teal-950 group-hover:text-teal-700 transition-colors">
                        A.M. Distributors Chiplun
                      </div>
                      <div className="text-[10px] text-teal-700">
                        {amProductsCount} products • {amLeadsCount} leads
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* Recent Database Audit Logs */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Live Database Logs</h3>
                <Link to="/admin/audit-logs" className="text-[11px] font-bold text-blue-600">
                  View All
                </Link>
              </div>
              <div className="space-y-2.5">
                {logs.map(log => (
                  <div key={log.id} className="text-xs p-2.5 rounded-xl bg-slate-50 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px]">{log.action}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 2. NEXALUS INNOVATIONS TECH ADMIN DASHBOARD
  // ----------------------------------------------------
  const renderInnovationsDashboard = () => {
    const techProducts = products.filter(
      p =>
        p.brandId === 'nexalus-innovations' ||
        p.brandId === 'cp-plus' ||
        p.brandId === 'one-broadband' ||
        p.brandId === 'itti-networking'
    );
    const cctvProducts = techProducts.filter(
      p => p.brandId === 'cp-plus' || p.categoryId === 'cat-cctv' || p.categoryId === 'cat-ip'
    );
    const techServices = services.filter(
      s =>
        s.brandId === 'nexalus' ||
        s.brandId === 'nexalus-innovations' ||
        s.brandId === 'one-broadband' ||
        s.brandId === 'itti-networking'
    );
    const techEnquiries = enquiries.filter(
      e =>
        e.brandId === 'nexalus-innovations' ||
        e.brandId === 'cp-plus' ||
        e.brandId === 'one-broadband' ||
        e.brandId === 'itti-networking'
    );
    const newTechLeads = techEnquiries.filter(e => e.status === 'new').length;

    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Child Console Context Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg border border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-cyan-400 border border-white/20 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                Child Admin Panel • Technology &amp; Security Division
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Nexalus Innovations Tech Console
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <button
                type="button"
                onClick={returnToMaster}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Super Admin</span>
              </button>
            )}
            <a
              href="/brands/nexalus-innovations"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              <span>Visit Tech Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 4 Tech Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="CCTV & Hardware"
            value={cctvProducts.length}
            subtitle={`${techProducts.length} total tech products`}
            icon={<Shield className="w-6 h-6" />}
            colorScheme="blue"
          />

          <StatCard
            title="Fiber Tariffs"
            value={plans.length}
            subtitle="One Broadband optical plans"
            icon={<Wifi className="w-6 h-6" />}
            colorScheme="purple"
          />

          <StatCard
            title="IT & Network Services"
            value={techServices.length}
            subtitle="CCTV, fiber & structured cabling"
            icon={<Wrench className="w-6 h-6" />}
            colorScheme="teal"
          />

          <StatCard
            title="Tech Inquiries"
            value={newTechLeads}
            subtitle={`${techEnquiries.length} total tech leads`}
            icon={<AlertCircle className="w-6 h-6" />}
            colorScheme="amber"
            trend={{ value: `${newTechLeads} New`, isPositive: newTechLeads === 0 }}
          />
        </div>

        {/* Tech Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Tech Console Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              to="/admin/products"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">CCTV Hardware</span>
            </Link>

            <Link
              to="/admin/plans"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wifi className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Fiber Plans</span>
            </Link>

            <Link
              to="/admin/services"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">IT Services</span>
            </Link>

            <Link
              to="/admin/service-areas"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Fiber Areas</span>
            </Link>

            <Link
              to="/admin/enquiries"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Inbox className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Tech Leads</span>
            </Link>

            <a
              href="/brands/nexalus-innovations"
              target="_blank"
              rel="noreferrer"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ExternalLink className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Live Website</span>
            </a>
          </div>
        </div>

        {/* Tech Inquiries CRM */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Nexalus Innovations Customer Inquiries
              </h2>
              <p className="text-xs text-slate-500">CCTV installation, fiber broadband &amp; networking requests</p>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Open Full Tech CRM <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {techEnquiries.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No tech inquiries found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {techEnquiries.slice(0, 6).map(enq => (
                <div key={enq.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {enq.customerName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {enq.productOrServiceName || 'Tech Request'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {enq.phone} • {enq.location || 'Location Not Specified'} • {enq.message}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        enq.status === 'new'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {enq.status.toUpperCase()}
                    </span>
                    <Link
                      to="/admin/enquiries"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 3. A.M. DISTRIBUTORS CHIPLUN FMCG ADMIN DASHBOARD
  // ----------------------------------------------------
  const renderAmDashboard = () => {
    const amProducts = products.filter(p => p.brandId === 'am-distributors');
    const waterProducts = amProducts.filter(
      p =>
        p.categoryId === 'cat-water' ||
        p.name.toLowerCase().includes('water') ||
        p.name.toLowerCase().includes('can')
    );
    const dairyProducts = amProducts.filter(
      p =>
        p.categoryId === 'cat-dairy' ||
        p.categoryId === 'cat-icecream' ||
        p.name.toLowerCase().includes('ice') ||
        p.name.toLowerCase().includes('milk')
    );
    const amServices = services.filter(s => s.brandId === 'am-distributors');
    const amEnquiries = enquiries.filter(e => e.brandId === 'am-distributors');
    const newAmLeads = amEnquiries.filter(e => e.status === 'new').length;

    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Child Console Context Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg border border-teal-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-400 border border-white/20 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-teal-300">
                Child Admin Panel • Regional Logistics &amp; Wholesale FMCG
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                A.M. Distributors Chiplun Depot Console
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <button
                type="button"
                onClick={returnToMaster}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Super Admin</span>
              </button>
            )}
            <a
              href="/brands/am-distributors"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              <span>Visit Chiplun Depot Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 4 FMCG Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Mineral Water Inventory"
            value={waterProducts.length}
            subtitle="20L Cans & Packaged Water"
            icon={<Droplets className="w-6 h-6" />}
            colorScheme="blue"
          />

          <StatCard
            title="Dairy & Ice Cream SKUs"
            value={dairyProducts.length}
            subtitle="Cold-chain preserved goods"
            icon={<IceCream className="w-6 h-6" />}
            colorScheme="purple"
          />

          <StatCard
            title="Logistics Fleet"
            value={amServices.length || 4}
            subtitle="Refrigerated route delivery"
            icon={<Truck className="w-6 h-6" />}
            colorScheme="teal"
          />

          <StatCard
            title="Depot Wholesale Orders"
            value={newAmLeads}
            subtitle={`${amEnquiries.length} total depot leads`}
            icon={<AlertCircle className="w-6 h-6" />}
            colorScheme="amber"
            trend={{ value: `${newAmLeads} New`, isPositive: newAmLeads === 0 }}
          />
        </div>

        {/* Depot Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Chiplun Depot Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              to="/admin/products"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Water &amp; Dairy SKUs</span>
            </Link>

            <Link
              to="/admin/categories"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Categories</span>
            </Link>

            <Link
              to="/admin/services"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Route Services</span>
            </Link>

            <Link
              to="/admin/enquiries"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Inbox className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Wholesale Orders</span>
            </Link>

            <Link
              to="/admin/reports"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Depot Reports</span>
            </Link>

            <a
              href="/brands/am-distributors"
              target="_blank"
              rel="noreferrer"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ExternalLink className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Live Website</span>
            </a>
          </div>
        </div>

        {/* Depot Inquiries CRM */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                A.M. Distributors Chiplun Inquiries &amp; Orders
              </h2>
              <p className="text-xs text-slate-500">Mineral water wholesale orders, dairy supplies &amp; fleet inquiries</p>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
            >
              Open Depot CRM <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {amEnquiries.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No depot orders found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {amEnquiries.slice(0, 6).map(enq => (
                <div key={enq.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {enq.customerName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        {enq.productOrServiceName || 'Wholesale Order'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {enq.phone} • {enq.location || 'Chiplun Region'} • {enq.message}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        enq.status === 'new'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-teal-50 text-teal-700 border-teal-200'
                      }`}
                    >
                      {enq.status.toUpperCase()}
                    </span>
                    <Link
                      to="/admin/enquiries"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render appropriate dashboard based on activeConsole mode
  if (activeConsole === 'nexalus-innovations') {
    return renderInnovationsDashboard();
  }
  if (activeConsole === 'am-distributors') {
    return renderAmDashboard();
  }
  return renderMasterDashboard();
};
