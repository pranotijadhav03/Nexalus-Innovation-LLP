import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEnquiries, getProducts, getInternetPlans, getBroadbandPlans, getServices } from '../../firebase/services';
import { Enquiry, Product, Service, BrandId } from '../../types';
import { StatCard } from '../../components/admin/StatCard';
import {
  BarChart3,
  TrendingUp,
  Inbox,
  Shield,
  Wifi,
  Package,
  Building,
  Truck
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const outletCtx = useOutletContext<{ activeBrandFilter?: BrandId | 'corporate' | 'all' }>();
  const activeBrandFilter = outletCtx?.activeBrandFilter || 'all';

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPlansCount, setTotalPlansCount] = useState<number>(0);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [e, p, netPlans, bbPlans, s] = await Promise.all([
          getEnquiries(activeBrandFilter === 'all' || activeBrandFilter === 'corporate' ? undefined : activeBrandFilter),
          getProducts(activeBrandFilter === 'all' || activeBrandFilter === 'corporate' ? undefined : activeBrandFilter),
          getInternetPlans(),
          getBroadbandPlans(),
          getServices(activeBrandFilter === 'all' || activeBrandFilter === 'corporate' ? undefined : activeBrandFilter)
        ]);
        setEnquiries(e);
        setProducts(p);
        const publishedBb = bbPlans.filter(b => b.published !== false).length;
        const publishedNet = netPlans.filter(n => n.published !== false).length;
        setTotalPlansCount(publishedBb + publishedNet);
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
    e =>
      e.websiteId === 'nexalus-innovations' ||
      e.brandId === 'nexalus-innovations' ||
      e.brandId === 'cp-plus' ||
      e.brandId === 'one-broadband' ||
      e.brandId === 'itti-networking'
  ).length;

  const amDistributorsEnquiries = enquiries.filter(
    e => e.websiteId === 'am-distributors' || e.brandId === 'am-distributors'
  ).length;

  const corporateEnquiries = enquiries.filter(
    e =>
      e.websiteId === 'corporate' ||
      (e.brandId as string) === 'general' ||
      (e.brandId as string) === 'nexalus' ||
      (e.brandId as string) === 'all' ||
      !e.brandId
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Performance &amp; Analytics Reports
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
          title={
            activeBrandFilter === 'am-distributors'
              ? 'Water & Dairy SKUs'
              : activeBrandFilter === 'nexalus-innovations'
              ? 'Hardware & CCTV Items'
              : 'Active Products'
          }
          value={products.length}
          subtitle="Catalog items online"
          icon={<Package className="w-5 h-5" />}
          colorScheme="amber"
        />
        {activeBrandFilter === 'nexalus-innovations' ? (
          <StatCard
            title="IT & Network Services"
            value={services.length}
            subtitle="CCTV, AMC & structured cabling"
            icon={<Shield className="w-5 h-5" />}
            colorScheme="teal"
          />
        ) : activeBrandFilter === 'am-distributors' ? (
          <StatCard
            title="Cold-Chain Routes"
            value={services.length}
            subtitle="Scheduled delivery logistics"
            icon={<Truck className="w-5 h-5" />}
            colorScheme="teal"
          />
        ) : (
          <StatCard
            title="Broadband Plans"
            value={totalPlansCount}
            subtitle="Symmetric high-speed tiers"
            icon={<Wifi className="w-5 h-5" />}
            colorScheme="teal"
          />
        )}
      </div>

      {/* Division or Pipeline Analysis */}
      {activeBrandFilter === 'all' || activeBrandFilter === 'corporate' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Group Division Lead Distribution
          </h3>
          <div className="space-y-5 max-w-3xl">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-2 text-slate-700">
                  <Shield className="w-3.5 h-3.5 text-blue-600" /> Nexalus Innovations (CCTV &amp; Network)
                </span>
                <span className="text-slate-900 font-bold">
                  {nexalusInnovationsEnquiries} ({totalEnquiries > 0 ? Math.round((nexalusInnovationsEnquiries / totalEnquiries) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalEnquiries > 0 ? (nexalusInnovationsEnquiries / totalEnquiries) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-2 text-slate-700">
                  <Truck className="w-3.5 h-3.5 text-teal-600" /> A.M. Distributors Chiplun (Cold-Chain &amp; Logistics)
                </span>
                <span className="text-slate-900 font-bold">
                  {amDistributorsEnquiries} ({totalEnquiries > 0 ? Math.round((amDistributorsEnquiries / totalEnquiries) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalEnquiries > 0 ? (amDistributorsEnquiries / totalEnquiries) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-2 text-slate-700">
                  <Building className="w-3.5 h-3.5 text-slate-700" /> Nexalus Innovations LLP Corporate Desk
                </span>
                <span className="text-slate-900 font-bold">
                  {corporateEnquiries} ({totalEnquiries > 0 ? Math.round((corporateEnquiries / totalEnquiries) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-700 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalEnquiries > 0 ? (corporateEnquiries / totalEnquiries) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            {activeBrandFilter === 'am-distributors' ? 'A.M. Distributors' : 'Nexalus Innovations'} Inquiries Pipeline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">New Inquiries</span>
              <div className="text-2xl font-black text-amber-950 mt-1">{newEnquiries}</div>
              <span className="text-[11px] text-amber-700 mt-1 block">Awaiting customer response</span>
            </div>
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">In Progress</span>
              <div className="text-2xl font-black text-blue-950 mt-1">{inProgressEnquiries}</div>
              <span className="text-[11px] text-blue-700 mt-1 block">Active proposal or survey</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Closed / Converted</span>
              <div className="text-2xl font-black text-emerald-950 mt-1">{closedEnquiries}</div>
              <span className="text-[11px] text-emerald-700 mt-1 block">Completed work orders</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
