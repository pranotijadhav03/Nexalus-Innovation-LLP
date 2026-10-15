import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/admin/StatCard';
import { AdminOutletContext } from '../../components/admin/AdminLayout';
import {
  Package,
  Wifi,
  Wrench,
  Inbox,
  Shield,
  Server,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Building,
  ArrowLeft,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles
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
  const { currentUser, isSuperAdmin, isInnovationsAdmin, isAmAdmin } = useAuth();
  const { activeBrandFilter, activeConsole, setActiveConsole, openChildConsole, returnToMaster } =
    useOutletContext<AdminOutletContext>();

  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<InternetPlan[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sub-counts for master view launchers
  const [masterNexalusProductsCount, setMasterNexalusProductsCount] = useState(0);
  const [masterAmProductsCount, setMasterAmProductsCount] = useState(0);
  const [masterNexalusLeadsCount, setMasterNexalusLeadsCount] = useState(0);
  const [masterAmLeadsCount, setMasterAmLeadsCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        if (activeConsole === 'master') {
          // Master Console: Load all group data and calculate per-brand previews
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

          // Compute child subsidiary previews
          setMasterNexalusProductsCount(allProds.filter(p => p.brandId === 'nexalus-innovations').length);
          setMasterAmProductsCount(allProds.filter(p => p.brandId === 'am-distributors').length);
          setMasterNexalusLeadsCount(allEnqs.filter(e => e.brandId === 'nexalus-innovations').length);
          setMasterAmLeadsCount(allEnqs.filter(e => e.brandId === 'am-distributors').length);
        } else if (activeConsole === 'nexalus-innovations') {
          // Strictly ONLY Nexalus Innovations data: A.M. Distributors is 100% hidden
          const [techProds, techPlans, techServs, techEnqs] = await Promise.all([
            getProducts('nexalus-innovations'),
            getInternetPlans(),
            getServices('nexalus-innovations'),
            getEnquiries('nexalus-innovations')
          ]);
          setProducts(techProds);
          setPlans(techPlans);
          setServices(techServs);
          setEnquiries(techEnqs);
          setLogs([]);
        } else {
          // Strictly ONLY A.M. Distributors data: Nexalus Innovations is 100% hidden
          const [depotProds, depotServs, depotEnqs] = await Promise.all([
            getProducts('am-distributors'),
            getServices('am-distributors'),
            getEnquiries('am-distributors')
          ]);
          setProducts(depotProds);
          setPlans([]); // Zero tech plans
          setServices(depotServs);
          setEnquiries(depotEnqs);
          setLogs([]);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeConsole]);

  // Real derived statistics
  const newEnquiriesCount = enquiries.filter(e => e.status === 'new').length;
  const inProgressEnquiriesCount = enquiries.filter(e => e.status === 'in_progress' || e.status === 'contacted').length;
  const convertedEnquiriesCount = enquiries.filter(e => e.status === 'converted').length;
  const publishedProductsCount = products.filter(p => p.published).length;
  const activePlansCount = plans.filter(p => p.published).length;

  /* =========================================================================
     VIEW 1: NEXALUS INNOVATIONS DEDICATED CHILD ADMIN PANEL
     (Strictly Tech: CCTV, Optical Fiber, Routers, Managed Switches. Zero A.M.)
     ========================================================================= */
  if (activeConsole === 'nexalus-innovations') {
    return (
      <div className="space-y-8">
        {/* Child Console Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white p-6 sm:p-8 shadow-xl border border-blue-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-cyan-300 border border-blue-400/30 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> CHILD TECH SUBSIDIARY CONSOLE
                </span>
                <span className="text-xs text-blue-300 font-semibold">
                  • Isolated Data View
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Nexalus Innovations Admin Panel
              </h1>
              <p className="text-xs sm:text-sm text-blue-200/90 mt-1.5 max-w-2xl leading-relaxed">
                Dedicated administration for 4K AI CCTV cameras, High-Speed Optical Fiber Internet, Managed Switches &amp; structured networking. <strong className="text-white">A.M. Distributors data is strictly filtered out.</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {isSuperAdmin && (
                <button
                  onClick={returnToMaster}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 shadow-xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Exit to Master Corporate Console
                </button>
              )}
              <a
                href="/brands/nexalus-innovations"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <span>Live Tech Portal</span> <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Dedicated Tech Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Tech & CCTV Products"
            value={publishedProductsCount}
            subtitle={`Total in catalog: ${products.length}`}
            icon={<Package className="w-6 h-6" />}
            colorScheme="blue"
          />

          <StatCard
            title="Tech Installation Leads"
            value={enquiries.length}
            subtitle="Only CCTV & Optical leads"
            icon={<Inbox className="w-6 h-6" />}
            colorScheme="sky"
          />

          <StatCard
            title="Active Fiber Plans"
            value={activePlansCount}
            subtitle="One Broadband commercial & home"
            icon={<Wifi className="w-6 h-6" />}
            colorScheme="teal"
          />

          <StatCard
            title="New Tech Enquiries"
            value={newEnquiriesCount}
            subtitle="Pending initial survey"
            icon={<AlertCircle className="w-6 h-6" />}
            colorScheme="amber"
          />
        </div>

        {/* Quick Launch Shortcuts for Nexalus Innovations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/products"
            className="p-5 rounded-2xl bg-white border border-blue-100 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Tech Products Catalog</h4>
                <p className="text-xs text-slate-500">CCTV, switches &amp; fiber gear</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/admin/plans"
            className="p-5 rounded-2xl bg-white border border-blue-100 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Internet Plans</h4>
                <p className="text-xs text-slate-500">Bandwidth &amp; pricing tiers</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/admin/service-areas"
            className="p-5 rounded-2xl bg-white border border-blue-100 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Fiber Coverage Areas</h4>
                <p className="text-xs text-slate-500">Sangli &amp; Kolhapur nodes</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Isolated Enquiries Table for Nexalus Innovations */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Nexalus Innovations Tech Enquiries &amp; Surveys
              </h2>
              <p className="text-xs text-slate-500">
                Live leads submitted exclusively for CCTV, Fiber broadband and IT networking
              </p>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Open Full Tech CRM <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enquiries.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No active tech inquiries yet</p>
              <p className="text-[11px] text-slate-400">Incoming inquiries from the Nexalus Innovations site will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {enquiries.slice(0, 6).map(enq => (
                <div key={enq.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {enq.customerName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        Tech Customer
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {enq.phone} • {enq.productOrServiceName || enq.location || 'CCTV & Fiber Inquiry'}
                    </div>
                  </div>

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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =========================================================================
     VIEW 2: A.M. DISTRIBUTORS CHIPLUN DEDICATED CHILD ADMIN PANEL
     (Strictly Depot: Mineral Water, Commercial Ice Cream, Dairy. Zero Tech.)
     ========================================================================= */
  if (activeConsole === 'am-distributors') {
    return (
      <div className="space-y-8">
        {/* Child Console Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 text-white p-6 sm:p-8 shadow-xl border border-teal-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-emerald-300 border border-teal-400/30 flex items-center gap-1.5">
                  <Building className="w-3 h-3" /> CHILD LOGISTICS SUBSIDIARY CONSOLE
                </span>
                <span className="text-xs text-teal-300 font-semibold">
                  • Isolated Data View
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                A.M. Distributors Chiplun Admin Panel
              </h1>
              <p className="text-xs sm:text-sm text-teal-200/90 mt-1.5 max-w-2xl leading-relaxed">
                Dedicated administration for 20L Water Cans, Packaged Mineral Water, Commercial Bulk Ice Cream Tubs &amp; Morning Dairy Supply. <strong className="text-white">Nexalus Innovations data is strictly filtered out.</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {isSuperAdmin && (
                <button
                  onClick={returnToMaster}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 shadow-xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Exit to Master Corporate Console
                </button>
              )}
              <a
                href="/brands/am-distributors"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <span>Live Depot Portal</span> <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Dedicated Logistics Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Depot Supplies Catalog"
            value={publishedProductsCount}
            subtitle={`Total in catalog: ${products.length}`}
            icon={<Package className="w-6 h-6" />}
            colorScheme="teal"
          />

          <StatCard
            title="Commercial Supply Leads"
            value={enquiries.length}
            subtitle="Water, Ice Cream & Dairy orders"
            icon={<Inbox className="w-6 h-6" />}
            colorScheme="emerald"
          />

          <StatCard
            title="Pending First Contact"
            value={newEnquiriesCount}
            subtitle="Unassigned customer inquiries"
            icon={<AlertCircle className="w-6 h-6" />}
            colorScheme="amber"
          />

          <StatCard
            title="In-Progress Orders"
            value={inProgressEnquiriesCount}
            subtitle="Under delivery arrangement"
            icon={<Clock className="w-6 h-6" />}
            colorScheme="purple"
          />
        </div>

        {/* Quick Launch Shortcuts for A.M. Distributors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/products"
            className="p-5 rounded-2xl bg-white border border-teal-100 hover:border-teal-300 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Depot Products &amp; Supplies</h4>
                <p className="text-xs text-slate-500">Mineral water cans, retail bottles, ice cream tubs</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/admin/enquiries"
            className="p-5 rounded-2xl bg-white border border-teal-100 hover:border-teal-300 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Distribution CRM &amp; Orders</h4>
                <p className="text-xs text-slate-500">Retail supply requests and delivery inquiries</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Isolated Enquiries Table for A.M. Distributors */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">
                A.M. Distributors Supply Inquiries &amp; Orders
              </h2>
              <p className="text-xs text-slate-500">
                Live leads submitted exclusively for packaged water, bulk ice cream, and dairy distribution
              </p>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
            >
              Open Full Depot CRM <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enquiries.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No active depot inquiries yet</p>
              <p className="text-[11px] text-slate-400">Incoming inquiries from A.M. Distributors will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {enquiries.slice(0, 6).map(enq => (
                <div key={enq.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {enq.customerName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                        Depot Client
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {enq.phone} • {enq.productOrServiceName || enq.location || 'Commercial Order'}
                    </div>
                  </div>

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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =========================================================================
     VIEW 3: NEXALUS INNOVATIONS LLP MASTER CORPORATE SUPER ADMIN DASHBOARD
     (Parent Company Executive Console with 2 Dedicated Child Launchers)
     ========================================================================= */
  return (
    <div className="space-y-8">
      {/* Top Corporate Executive Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-600/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
              CENTRAL HOLDING COMPANY
            </span>
            <span className="text-xs text-blue-200 font-medium">
              • Super Admin Central Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Nexalus Innovations LLP Master Console
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl leading-relaxed">
            Welcome back, <strong className="text-white">{currentUser?.displayName}</strong>. You have unrestricted administrative authority across the holding corporate group. Use the operating console switcher dropdown on the left to navigate into dedicated dashboards for <strong>Nexalus Innovations</strong> and <strong>A.M. Distributors</strong>.
          </p>
        </div>

        <Link
          to="/admin/enquiries"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all shrink-0 cursor-pointer relative z-10"
        >
          <Inbox className="w-4 h-4" /> All Group Inquiries ({enquiries.length})
        </Link>
      </div>

      {/* Main Metric Cards (Corporate Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Published Products"
          value={publishedProductsCount}
          subtitle={`Across both subsidiaries: ${products.length}`}
          icon={<Package className="w-6 h-6" />}
          colorScheme="blue"
        />

        <StatCard
          title="Total Group Inquiries"
          value={enquiries.length}
          subtitle="Both companies combined"
          icon={<Inbox className="w-6 h-6" />}
          colorScheme="teal"
        />

        <StatCard
          title="New Inquiries"
          value={newEnquiriesCount}
          subtitle="Awaiting initial contact"
          icon={<AlertCircle className="w-6 h-6" />}
          colorScheme="amber"
          trend={{ value: `${newEnquiriesCount} Unhandled`, isPositive: false }}
        />

        <StatCard
          title="Leads In Progress"
          value={inProgressEnquiriesCount}
          subtitle="Quotation / Survey scheduled"
          icon={<Clock className="w-6 h-6" />}
          colorScheme="purple"
        />
      </div>

      {/* Leads Pipeline & Brand Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Latest Enquiries CRM Box */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Group Inquiries &amp; Leads
              </h2>
              <p className="text-xs text-slate-500">Live submissions across all web portals</p>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View Full CRM <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

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
        </div>

        {/* Brand Distribution / Logs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Brand Distribution Widget */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Subsidiary Lead Breakdown</h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Nexalus Innovations</div>
                    <div className="text-[10px] text-blue-700">CCTV, fiber &amp; network leads</div>
                  </div>
                </div>
                <span className="text-lg font-black text-blue-950">{masterNexalusLeadsCount}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building className="w-5 h-5 text-teal-600" />
                  <div>
                    <div className="text-xs font-bold text-teal-950">A.M. Distributors Chiplun</div>
                    <div className="text-[10px] text-teal-700">Water, ice cream &amp; dairy leads</div>
                  </div>
                </div>
                <span className="text-lg font-black text-teal-950">{masterAmLeadsCount}</span>
              </div>
            </div>
          </div>

          {/* Recent Audit Logs */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Audit Logs</h3>
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
