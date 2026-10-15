import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Server, ShieldAlert, Cpu, Network, ArrowRight, CheckCircle2, PhoneCall, ExternalLink } from 'lucide-react';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { ProductCard } from '../../../components/brand/ProductCard';
import { Button } from '../../../components/common/Button';
import { QuoteModal } from '../../../components/common/QuoteModal';
import { getProducts } from '../../../firebase/services';
import { Product } from '../../../types';

export const IttiNetworkingHomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const allProds = await getProducts('itti-networking', true);
        setProducts(allProds);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      <BrandHeader
        brandId="itti-networking"
        title="ITTI Networking & Cyber Security Solutions"
        subtitle="Enterprise Sophos Next-Gen Firewalls, Layer 2/3 Core Switches, Fiber Optic LIU Infrastructure, and Server Racks operated under Nexalus Innovations LLP."
      />

      {/* Hero Visual Section with Real Enterprise Networking Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-indigo-900/50 shadow-2xl">
          {/* Background image & gradient overlay */}
          <div className="relative h-[480px] sm:h-[520px] lg:h-[580px] w-full">
            <img
              src="/images/nexalus-enterprise-hero.jpg"
              alt="ITTI Networking Infrastructure & Enterprise Switching"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

            {/* Hero Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-2xl px-6 sm:px-12 space-y-5 text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold tracking-wide uppercase backdrop-blur-md">
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  Enterprise Networking &amp; Infrastructure Division
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                  Carrier-Grade <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Networking &amp; Threat</span> Prevention
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  Turnkey cyber defense, multi-gigabit campus switching, fiber optic termination, and certified data center cabling engineered under Nexalus Innovations LLP.
                </p>

                {/* Key Quick Badges */}
                <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-200">
                  <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Sophos Next-Gen Firewall
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> 10G SFP+ Core Switching
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Standardized Server Racks &amp; LIU
                  </div>
                </div>

                {/* CTA Action Buttons */}
                <div className="pt-2 flex flex-wrap gap-3">
                  <Link to="/products?brand=itti-networking">
                    <Button variant="primary" size="md" className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30" icon={<ArrowRight className="w-4 h-4" />}>
                      Explore Networking Products
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="md"
                    className="border-indigo-500/40 text-indigo-200 hover:bg-indigo-900/40"
                    onClick={() => setIsQuoteOpen(true)}
                  >
                    Request Network Assessment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Flagship Hardware Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              Enterprise Networking Hardware & Cabling
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Share instant spec drafts to customer WhatsApp or request direct corporate quotations.
            </p>
          </div>
          <Link
            to="/products?brand=itti-networking"
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
          >
            All Networking Hardware <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading networking catalog...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Enterprise Capabilities Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Turnkey Execution
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              From Server Rack Architecture to Cyber Defense SLA
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Nexalus Innovations LLP coordinates every aspect of your internal network. We supply the Sophos security appliance, configure VLAN segmentation across managed switches, fuse optical fiber cores, and install temperature-controlled server racks.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                'Next-Gen Deep Threat Protection',
                'Zero Copper Throttling & 10G SFP+',
                'Structured STP Cat6A Certification',
                '24/7 SLA Engineering Response'
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setIsQuoteOpen(true)}
              >
                Request Enterprise BOQ Proposal
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"
                alt="Optical Fiber & Server Infrastructure"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="itti-networking"
        itemName="Enterprise ITTI Networking Proposal"
        itemType="general"
      />
    </div>
  );
};
