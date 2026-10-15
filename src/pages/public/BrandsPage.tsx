import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Wifi,
  Server,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
  Cpu,
  Truck,
  Droplets,
  IceCream,
  Milk,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const BrandsPage: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Header */}
      <section className="bg-gradient-to-b from-blue-900/10 via-slate-50 to-white py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Operating Companies &amp; Portals
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
            Our Operating Companies
          </h1>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            Under <strong>Nexalus Innovations LLP</strong>, we operate two distinct commercial entities: <strong>Nexalus Innovations</strong> (CCTV Surveillance, Gigabit Fiber Internet, Enterprise IT Networking) and <strong>A.M. Distributors Chiplun</strong> (Regional Logistics Hub for Packaged Mineral Water, Commercial Ice Cream &amp; Dairy Products).
          </p>
        </div>
      </section>

      {/* 2. Operating Company 1: Nexalus Innovations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-blue-200/90 shadow-sm p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:shadow-xl transition-all">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Technology &amp; Electronics Operating Company
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Nexalus Innovations
                </h2>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Operating as the core technology, electronics, and network infrastructure arm of Nexalus Innovations LLP. Authorized partner delivering commercial 4K AI video surveillance, high-speed symmetrical optical fiber internet leased lines, Layer-2/Layer-3 managed PoE+ switches, and structured copper/fiber cabling with preventive maintenance contracts (AMC).
            </p>

            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Division Capabilities &amp; Scope:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  '4K Ultra-HD Network IP Bullet & Dome Cameras',
                  'Symmetrical Gigabit Optical Fiber Internet',
                  'Layer-2/Layer-3 Managed Gigabit PoE+ Switches',
                  'AI Face Recognition & Vehicle ANPR Detection',
                  'Pure Oxygen-Free Cat6A Cabling & Server Racks',
                  'Comprehensive 24/7 CCTV & Network AMC Maintenance'
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <Link to="/brands/nexalus-innovations">
                <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                  Visit
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" size="md">
                  View Technology Hardware Catalog
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src="/images/projects/nexalus-innovations-division.jpg"
                alt="Nexalus Innovations Commercial Technology Facility"
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Operating Company 2: A.M. Distributors Chiplun */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-teal-200/90 shadow-sm p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:shadow-xl transition-all">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
                  Cold-Chain &amp; Logistics Operating Company
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  A.M. Distributors Chiplun
                </h2>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Operating directly from Chiplun, Maharashtra, A.M. Distributors is the regional logistics hub and cold-chain powerhouse commanding temperature-controlled cold-room storage, refrigerated fleet, and dependable daily morning delivery routes across retail, commercial, and hospitality sectors.
            </p>

            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Distribution Capabilities &amp; Scope:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  'Chiplun Regional Logistics Hub & Cold-Room Storage',
                  'Packaged Mineral Water (20L Jars & Retail Bottles)',
                  'Commercial Ice Cream Distributor (-18°C Reefer Fleet)',
                  'Farm-Fresh Milk, Butter, Ghee & Complete Dairy Line',
                  'Scheduled Morning 4:00 AM Punctual Retail Route',
                  'FSSAI Compliant Temperature-Logged Assurance'
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <Link to="/brands/am-distributors">
                <Button variant="teal" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                  Visit
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="md">
                  Inquire Depot Wholesale
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src="/images/projects/am-distributors-chiplun.jpg"
                alt="A.M. Distributors Chiplun Regional Logistics Hub"
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>


      {/* 5. Corporate Single-Window Integration */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold">Single Corporate Umbrella — Nexalus Innovations LLP</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Whether you need turnkey CCTV &amp; optical network infrastructure from Nexalus Innovations or regional cold-chain distribution from A.M. Distributors Chiplun, you deal with a trusted corporate governance entity.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link to="/quote">
              <Button variant="primary" size="lg">
                Request Corporate Quotation
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline-white" size="lg">
                Contact Corporate Office
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
