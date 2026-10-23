import React, { useState, useEffect } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminOutletContext, AdminConsoleMode } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import {
  Package,
  ShoppingCart,
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
  ChevronRight,
  Globe,
  BarChart3
} from 'lucide-react';
import {
  getProducts,
  getInternetPlans,
  getBroadbandPlans,
  getServices,
  getEnquiries,
  getPlanOrders,
  getCachedPlanOrders,
  getAuditLogs,
  getTeamMembers,
  getUsers,
  getCachedProducts,
  getCachedInternetPlans,
  getCachedBroadbandPlans,
  getCachedServices,
  getCachedEnquiries,
  getCachedAuditLogs,
  getCachedTeamMembers,
  getCachedUsers
} from '../../firebase/services';
import { Product, InternetPlan, Service, Enquiry, AuditLog, TeamMember, PlanOrder } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, isSuperAdmin } = useAuth();
  const outletCtx = useOutletContext<AdminOutletContext>();
  const [searchParams] = useSearchParams();
  const consoleParam = searchParams.get('console');
  const activeConsole: AdminConsoleMode = (consoleParam === 'am-distributors' || consoleParam === 'nexalus-innovations' || consoleParam === 'master')
    ? (consoleParam as AdminConsoleMode)
    : (outletCtx?.activeConsole || 'master');
  const setActiveConsole = outletCtx?.setActiveConsole || (() => {});
  const returnToMaster = outletCtx?.returnToMaster || (() => {});

  const getNavPath = (path: string) => {
    if (isSuperAdmin && activeConsole && activeConsole !== 'master') {
      return `${path}?console=${activeConsole}`;
    }
    return path;
  };

  const initialProds = getCachedProducts(undefined);
  const initialEnqs = getCachedEnquiries('all');

  const [products, setProducts] = useState<Product[]>(() => initialProds);
  const [plans, setPlans] = useState<InternetPlan[]>(() => getCachedInternetPlans());
  const [broadbandPlansCount, setBroadbandPlansCount] = useState<number>(() => getCachedBroadbandPlans().filter(p => p.published).length);
  const [services, setServices] = useState<Service[]>(() => getCachedServices(undefined));
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => initialEnqs);
  const [planOrders, setPlanOrders] = useState<PlanOrder[]>(() => getCachedPlanOrders());
  const [logs, setLogs] = useState<AuditLog[]>(() => getCachedAuditLogs().slice(0, 6));
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => getCachedTeamMembers('all'));
  const [usersCount, setUsersCount] = useState<number>(() => getCachedUsers().length);
  const [isLoading, setIsLoading] = useState(false);

  // Subsidiary metrics initialized synchronously
  const [nexalusProductsCount, setNexalusProductsCount] = useState<number>(
    () => initialProds.filter(p => p.brandId === 'nexalus-innovations' || p.brandId === 'cp-plus' || p.brandId === 'one-broadband' || p.brandId === 'itti-networking').length
  );
  const [amProductsCount, setAmProductsCount] = useState<number>(
    () => initialProds.filter(p => p.brandId === 'am-distributors').length
  );
  const [nexalusLeadsCount, setNexalusLeadsCount] = useState<number>(
    () => initialEnqs.filter(e => e.brandId === 'nexalus-innovations' || e.brandId === 'cp-plus' || e.brandId === 'one-broadband' || e.brandId === 'itti-networking').length
  );
  const [amLeadsCount, setAmLeadsCount] = useState<number>(
    () => initialEnqs.filter(e => e.brandId === 'am-distributors').length
  );

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allProds, allPlans, allBbPlans, allServs, allEnqs, allLogs, allTeam, allUsers, allOrders] = await Promise.all([
        getProducts(undefined),
        getInternetPlans(),
        getBroadbandPlans(),
        getServices(undefined),
        getEnquiries('all'),
        getAuditLogs(),
        getTeamMembers('all'),
        getUsers(),
        getPlanOrders()
      ]);
      setProducts(allProds);
      setPlans(allPlans);
      setBroadbandPlansCount(allBbPlans.filter(p => p.published).length);
      setServices(allServs);
      setEnquiries(allEnqs);
      setLogs(allLogs.slice(0, 6));
      setTeamMembers(allTeam);
      setUsersCount(allUsers.length);
      setPlanOrders(allOrders);

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
    // Parent company scoped data
    const corporateEnquiries = enquiries.filter(
      e => e.websiteId === 'corporate' || (e.brandId as any) === 'general' || (e.brandId as any) === 'nexalus' || !e.brandId || (e.brandId as any) === 'all'
    );
    const newCorporateCount = corporateEnquiries.filter(e => e.status === 'new').length;
    const inProgressCorporateCount = corporateEnquiries.filter(
      e => e.status === 'in_progress' || e.status === 'contacted'
    ).length;

    const corporateTeam = teamMembers.filter(
      m => m.division === 'corporate' || m.division === 'all' || m.deptType === 'leadership'
    );

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
              Nexalus Innovations LLP • Central Parent Governance &amp; Operating Workspaces Hub
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={getNavPath('/admin/enquiries')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Inbox className="w-4 h-4" /> Corporate Inquiries ({corporateEnquiries.length})
            </Link>
          </div>
        </div>

        {/* Corporate Parent Company Metrics */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Corporate Master Key Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            <Link to="/admin/orders" className="block cursor-pointer">
              <StatCard
                title="Plan Bookings"
                value={planOrders.length}
                subtitle={`${planOrders.filter(o => o.status === 'new').length} new orders`}
                icon={<ShoppingCart className="w-6 h-6 text-orange-500" />}
                colorScheme="teal"
                trend={{ value: `${planOrders.filter(o => o.status === 'new').length} New`, isPositive: planOrders.filter(o => o.status === 'new').length === 0 }}
              />
            </Link>
            <StatCard
              title="Corporate Inquiries"
              value={corporateEnquiries.length}
              subtitle={`${newCorporateCount} new • ${inProgressCorporateCount} in review`}
              icon={<Inbox className="w-6 h-6" />}
              colorScheme="blue"
              trend={{ value: `${newCorporateCount} New Leads`, isPositive: newCorporateCount === 0 }}
            />

            <StatCard
              title="Products Catalog"
              value={products.length}
              subtitle={`${nexalusProductsCount} Tech • ${amProductsCount} FMCG`}
              icon={<Package className="w-6 h-6" />}
              colorScheme="amber"
            />

            <StatCard
              title="Broadband Plans"
              value={broadbandPlansCount}
              subtitle="Active FTTH Tariffs"
              icon={<Wifi className="w-6 h-6" />}
              colorScheme="teal"
            />

            <StatCard
              title="Leadership Team"
              value={corporateTeam.length}
              subtitle="Designated partners"
              icon={<Users className="w-6 h-6" />}
              colorScheme="purple"
            />

            <StatCard
              title="Staff & Roles"
              value={usersCount || 3}
              subtitle="Authorized administrators"
              icon={<Shield className="w-6 h-6" />}
              colorScheme="blue"
            />

            <StatCard
              title="Audit Events"
              value={logs.length}
              subtitle="Logged system actions"
              icon={<Clock className="w-6 h-6" />}
              colorScheme="blue"
            />
          </div>
        </div>

        {/* Corporate Parent Quick Operations */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Corporate Master Operations &amp; Commercial Management
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Link
              to="/admin/products"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Products Catalog</span>
            </Link>

            <Link
              to="/admin/categories"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-orange-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Categories</span>
            </Link>

            <Link
              to="/admin/plans"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wifi className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Plans &amp; Pricing</span>
            </Link>

            <Link
              to="/admin/services"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Services</span>
            </Link>

            <Link
              to="/admin/content"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Image className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Website Content</span>
            </Link>

            <Link
              to={getNavPath('/admin/enquiries')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Inbox className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">CRM Inquiries</span>
            </Link>

            <Link
              to="/admin/team"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Leadership Team</span>
            </Link>

            <Link
              to="/admin/users"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Staff Roles</span>
            </Link>

            <Link
              to="/admin/reports"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Group Reports</span>
            </Link>

            <Link
              to="/admin/seo"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">SEO &amp; Socials</span>
            </Link>

            <Link
              to="/admin/audit-logs"
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Audit Logs</span>
            </Link>
          </div>
        </div>

        {/* Recent Broadband Plan Orders (Buy Now & Cart Checkouts) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Recent Broadband Plan Orders &amp; Bookings
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Live Firebase Orders
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Customer bookings from &quot;Buy Now&quot; and broadband cart checkouts
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
            >
              Open Orders &amp; Bookings Desk <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {planOrders.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ShoppingCart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No broadband plan orders recorded yet</p>
              <p className="text-[11px] text-slate-400">
                Orders placed via the website or manual entries will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {planOrders.slice(0, 5).map(order => (
                <div key={order.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-slate-900">
                        {order.id}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {order.customerName}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        ({order.phone})
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                        {order.city}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{order.providerName} - {order.planName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-bold text-teal-700">{order.speed}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-extrabold text-slate-900">₹{order.price}/{order.billingPeriod || 'mo'}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500">{order.paymentMethod ? order.paymentMethod.replace(/_/g, ' ').toUpperCase() : 'PAY ON INSTALLATION'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        order.status === 'new'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : order.status === 'confirmed'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : order.status === 'installation_scheduled'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : order.status === 'converted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {order.status === 'new' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1 animate-pulse"></span>}
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <Link
                      to="/admin/orders"
                      className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Manage Order"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Corporate Inquiries & Live Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Latest Corporate Enquiries CRM Box */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Parent Corporate Inquiries &amp; Partnerships
                </h2>
                <p className="text-xs text-slate-500">Submissions received via parent corporate contact channels</p>
              </div>
              <Link
                to={getNavPath('/admin/enquiries')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Open Corporate CRM <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {corporateEnquiries.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No active parent inquiries in Firestore</p>
                <p className="text-[11px] text-slate-400">Incoming inquiries from the corporate contact page will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {corporateEnquiries.slice(0, 5).map(enq => (
                  <div key={enq.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {enq.customerName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Corporate Parent
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {enq.phone} • {enq.email || enq.location || 'General Inquiry'}
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
                        to={getNavPath('/admin/enquiries')}
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

          {/* Database Audit Logs */}
          <div className="lg:col-span-4 space-y-6">
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

        {/* Clearly Labeled Separate Section: Group Consolidated Overview */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                Group-Wide Consolidated Snapshot
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Operating Entities Aggregate Summary
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Select a workspace above to edit products or services
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Nexalus Innovations</span>
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xl font-black text-white">{nexalusProductsCount} Products</div>
              <p className="text-[11px] text-slate-400">{nexalusLeadsCount} total tech inquiries</p>
              <button
                type="button"
                onClick={() => setActiveConsole('nexalus-innovations')}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 pt-1 cursor-pointer"
              >
                <span>Open Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">A.M. Distributors Chiplun</span>
                <Building className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-xl font-black text-white">{amProductsCount} FMCG Products</div>
              <p className="text-[11px] text-slate-400">{amLeadsCount} total depot inquiries</p>
              <button
                type="button"
                onClick={() => setActiveConsole('am-distributors')}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 pt-1 cursor-pointer"
              >
                <span>Open Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Total Group Enquiries</span>
                <Inbox className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-black text-white">{enquiries.length} Inquiries</div>
              <p className="text-[11px] text-slate-400">{corporateEnquiries.length} parent • {enquiries.length - corporateEnquiries.length} subsidiaries</p>
              <Link
                to="/admin/reports"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-1 cursor-pointer"
              >
                <span>View Full Group Reports</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
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

        {/* 4 Tech Stat Cards - Scoped strictly to CCTV, IT Services, Leads, and Tech Staff */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="CCTV & Hardware"
            value={cctvProducts.length}
            subtitle={`${techProducts.length} total tech products`}
            icon={<Shield className="w-6 h-6" />}
            colorScheme="blue"
          />

          <StatCard
            title="IT & Network Services"
            value={techServices.length}
            subtitle="CCTV, AMC & structured cabling"
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

          <StatCard
            title="Tech Staff"
            value={teamMembers.filter(m => m.division === "nexalus-innovations" || m.division === "corporate" || m.division === "all").length}
            subtitle="Engineers & technicians"
            icon={<Users className="w-6 h-6" />}
            colorScheme="blue"
          />
        </div>

        {/* Tech Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Tech Console Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <Link
              to={getNavPath('/admin/products')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">CCTV Hardware</span>
            </Link>

            <Link
              to={getNavPath('/admin/categories')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Categories</span>
            </Link>

            <Link
              to={getNavPath('/admin/services')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">IT Services</span>
            </Link>

            <Link
              to={getNavPath('/admin/enquiries')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Inbox className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Tech Leads</span>
            </Link>

            <Link
              to={getNavPath('/admin/team')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Tech Team</span>
            </Link>

            <Link
              to={getNavPath('/admin/content')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Image className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Website Content</span>
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
              to={getNavPath('/admin/enquiries')}
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
                      to={getNavPath('/admin/enquiries')}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

          <StatCard
            title="Depot Staff"
            value={teamMembers.filter(m => m.division === "am-distributors" || m.division === "all").length}
            subtitle="Fleet captains & handlers"
            icon={<Users className="w-6 h-6" />}
            colorScheme="teal"
          />
        </div>

        {/* Depot Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Chiplun Depot Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              to={getNavPath('/admin/products')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Water &amp; Dairy SKUs</span>
            </Link>

            <Link
              to={getNavPath('/admin/categories')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Categories</span>
            </Link>

            <Link
              to={getNavPath('/admin/services')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Route Services</span>
            </Link>

            <Link
              to={getNavPath('/admin/enquiries')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Inbox className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Wholesale Orders</span>
            </Link>

            <Link
              to={getNavPath('/admin/team')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Chiplun Team</span>
            </Link>

            <Link
              to={getNavPath('/admin/content')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all text-center flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Image className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Website Content</span>
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
              to={getNavPath('/admin/enquiries')}
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
                      to={getNavPath('/admin/enquiries')}
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
