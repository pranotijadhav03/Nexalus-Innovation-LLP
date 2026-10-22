import React, { useState, useEffect } from 'react';
import { getProducts, getCachedProducts } from '../../../firebase/services';
import { Product } from '../../../types';
import { ProductCard } from '../../../components/brand/ProductCard';
import { Cpu, Shield, Wifi, Server, Sparkles, Filter } from 'lucide-react';

export const NexalusInnovationsProductsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'cctv' | 'internet' | 'network'>('all');
  const [techProducts, setTechProducts] = useState<Product[]>(() =>
    getCachedProducts('nexalus-innovations')
  );

  const loadData = async () => {
    try {
      const prods = await getProducts('nexalus-innovations', true);
      if (prods && prods.length > 0) {
        setTechProducts(prods);
      }
    } catch (err) {
      console.warn('Could not load tech products:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for real-time updates when admin creates/edits/deletes products
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('nexalus_data_update', handleUpdate);
    return () => window.removeEventListener('nexalus_data_update', handleUpdate);
  }, []);

  const displayedProducts = techProducts.filter(p => {
    if (filter === 'cctv') return p.categoryId.includes('cctv');
    if (filter === 'internet') return p.categoryId.includes('router') || p.categoryId.includes('mesh') || p.categoryId.includes('onu') || p.categoryId.includes('internet');
    if (filter === 'network') return p.categoryId.includes('switch') || p.categoryId.includes('rack') || p.categoryId.includes('cabling') || p.categoryId.includes('electronics') || p.categoryId.includes('security');
    return true;
  });

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* Header */}
      <section className="bg-slate-900 text-white py-14 sm:py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-900/60 text-sky-400 text-xs font-semibold border border-blue-700/50">
            <Cpu className="w-3.5 h-3.5" />
            <span>Hardware Catalog • Nexalus Innovations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Commercial Hardware Catalog
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Authentic commercial-grade 4K CCTV cameras, optical fiber Wi-Fi 6 ONT gateways, managed Layer-2/3 PoE+ switches, and certified structured cabling accessories.
          </p>
        </div>
      </section>

      {/* Product List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Filters */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Hardware ({techProducts.length})
          </button>
          <button
            onClick={() => setFilter('cctv')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'cctv'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-sky-500" />
            CCTV Surveillance
          </button>
          <button
            onClick={() => setFilter('internet')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'internet'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-teal-500" />
            Fiber ONT &amp; Routers
          </button>
          <button
            onClick={() => setFilter('network')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'network'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-indigo-500" />
            Switches &amp; Structured Cabling
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
