import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEnquiries, getProducts, getInternetPlans, getServices } from '../../firebase/services';
import { Enquiry, Product, InternetPlan, Service, BrandId } from '../../types';
import { StatCard } from '../../components/admin/StatCard';
import {
  BarChart3,
  TrendingUp,
  Inbox,
  Shield,
  Wifi,
  Server,
  Package,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  Truck
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const { activeBrandFilter } = useOutletContext<{ activeBrandFilter: BrandId | 'all' }>();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<InternetPlan[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [e, p, pl, s] = await Promise.all([
          getEnquiries(activeBrandFilter),
          getProducts(activeBrandFilter === 'all' ? undefined : activeBrandFilter),
          getInternetPlans(),
          getServices(activeBrandFilter === 'all' ? undefined : activeBrandFilter)
        ]);
        setEnquiries(e);
        setProducts(p);
        setPlans(pl);
        setServices(s);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [activeBrandFilter]);

  const totalEnquiries = enquiries.length;
  const newEnquiries = enquiries.filter(e => e.status === 'new').length;
  const inProgressEnquiries = enquiries.filter(e => e.status === 'in_progress').length;
  const closedEnquiries = enquiries.filter(e => e.status === 'closed').length;
  const conversionRate = totalEnquiries > 0 ? Math.round((closedEnquiries / totalEnquiries) * 100) : 0;

  const nexalusInnovationsEnquiries = enquiries.filter(
    e => e.brandId === 'nexalus-innovations' || e.brandId === 'cp-plus' || e.brandId === 'one-broadband' || e.brandId === 'itti-networking'
  ).length;
  const amDistributorsEnquiries = enquiries.filter(e => e.brandId === 'am-distributors').length;
  const corporateEnquiries = enquiries.filter(
    e => (e.brandId as string) === 'general' || (e.brandId as string) === 'nexalus'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Performance & Analytics Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational pipeline, enquiries breakdown, and brand performance metrics across Nexalus Innovations LLP.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            Active Scope: {activeBrandFilter === 'all' ? 'All Divisions' : activeBrandFilter.toUpperCase()}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inquiries Received"
          value={totalEnquiries}
          subtitle={`${newEnquiries} awaiting first response`}
          icon={<Inbox className="w-5 h-5" />}
          colorScheme="blue"
        />
        <StatCard
          title="Resolution Rate"
          value={`${conversionRate}%`}
          subtitle={`${closedEnquiries} closed successfully`}
          icon={<TrendingUp className="w-5 h-5" />}
          colorScheme="emerald"
        />
        <StatCard
          title="Active Products"
          value={products.length}
          subtitle="Catalog items online"
          icon={<Package className="w-5 h-5" />}
          colorScheme="amber"
        />
        <StatCard
          title="Broadband Plans"
          value={plans.length}
          subtitle="Symmetric high-speed tiers"
          icon={<Wifi className="w-5 h-5" />}
          colorScheme="teal"
        />
      </div>

      {/* Division Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Division Lead Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-2 text-slate-700">
                  <Shield className="w-3.5 h-3.5 text-blue-600" /> Nexalus Innovations (CCTV, Internet &amp; Network)
                </span>
                <span className="text-slate-900">
                  {nexalusInnovationsEnquiries} (
                  {totalEnquiries > 0
                    ? Math.round((nexalusInnovationsEnquiries / totalEnquiries) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalEnquiries > 0
                        ? (nexalusInnovationsEnquiries / totalEnquiries) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-2 text-slate-700">
                  <Truck className="w-3.5 h-3.5 text-teal-600" /> A.M. Distributors Chiplun (Cold-Chain &amp; Logistics)
                </span>
                <span className="text-slate-900">
                  {amDistributorsEnquiries} (
                  {totalEnquiries > 0
                    ? Math.round((amDistributorsEnquiries / totalEnquiries) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalEnquiries > 0
                        ? (amDistributorsEnquiries / totalEnquiries) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-2 text-slate-700">
                  <Building className="w-3.5 h-3.5 text-slate-700" /> Nexalus Innovations LLP Corporate
                </span>
                <span className="text-slate-900">
                  {corporateEnquiries} (
                  {totalEnquiries > 0
                    ? Math.round((corporateEnquiries / totalEnquiries) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-700 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalEnquiries > 0
                        ? (corporateEnquiries / totalEnquiries) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-2 text-slate-700">
                  <Building className="w-3.5 h-3.5 text-blue-600" /> Nexalus Corporate / General
                </span>
                <span className="text-slate-900">{corporateEnquiries} ({totalEnquiries > 0 ? Math.round((corporateEnquiries / totalEnquiries) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalEnquiries > 0 ? (corporateEnquiries / totalEnquiries) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lead Funnel Stages */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-blue-600" />
            Lead Status Pipeline
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-amber-900">{newEnquiries}</div>
              <div className="text-[11px] font-bold text-amber-700 uppercase mt-0.5">New Leads</div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-blue-900">{inProgressEnquiries}</div>
              <div className="text-[11px] font-bold text-blue-700 uppercase mt-0.5">In Progress</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-2xl font-black text-emerald-900">{closedEnquiries}</div>
              <div className="text-[11px] font-bold text-emerald-700 uppercase mt-0.5">Converted</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Lead conversion metrics automatically update as inquiries transition through response, quote delivery, and site activation milestones.
          </p>
        </div>
      </div>
    </div>
  );
};
