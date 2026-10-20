import React, { useState } from 'react';
import { initialProducts } from '../../../data/initialData';
import { ProductCard } from '../../../components/brand/ProductCard';
import { Truck, Droplets, IceCream, Milk, Sparkles } from 'lucide-react';

export const AmDistributorsProductsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'water' | 'icecream' | 'dairy'>('all');

  const products = initialProducts.filter(p => p.brandId === 'am-distributors');

  const displayedProducts = products.filter(p => {
    if (filter === 'water') return p.categoryId.includes('water');
    if (filter === 'icecream') return p.categoryId.includes('icecream');
    if (filter === 'dairy') return p.categoryId.includes('dairy');
    return true;
  });

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* Header */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-950 via-[#061e24] to-slate-950 text-white py-14 sm:py-20 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] opacity-15 [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider border border-teal-400/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <Truck className="w-3.5 h-3.5 text-teal-300" />
            <span>Wholesale Supply Catalog • A.M. Distributors Chiplun</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Mineral Water, Ice Cream &amp; Dairy Products
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Wholesale depot distribution covering packaged 20L water cans, retail bottle cases, commercial ice cream bulk tubs, and daily farm-fresh dairy supplies.
          </p>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 mb-8 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              filter === 'all'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 -translate-y-0.5'
                : 'bg-white text-slate-600 hover:bg-slate-50 hover:shadow-md hover:border-teal-300 hover:-translate-y-0.5 border border-slate-200/90'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilter('water')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              filter === 'water'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 -translate-y-0.5'
                : 'bg-white text-slate-600 hover:bg-slate-50 hover:shadow-md hover:border-teal-300 hover:-translate-y-0.5 border border-slate-200/90'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-teal-500" />
            Packaged Mineral Water
          </button>
          <button
            onClick={() => setFilter('icecream')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              filter === 'icecream'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 -translate-y-0.5'
                : 'bg-white text-slate-600 hover:bg-slate-50 hover:shadow-md hover:border-cyan-300 hover:-translate-y-0.5 border border-slate-200/90'
            }`}
          >
            <IceCream className="w-3.5 h-3.5 text-cyan-500" />
            Commercial Ice Creams
          </button>
          <button
            onClick={() => setFilter('dairy')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              filter === 'dairy'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 -translate-y-0.5'
                : 'bg-white text-slate-600 hover:bg-slate-50 hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 border border-slate-200/90'
            }`}
          >
            <Milk className="w-3.5 h-3.5 text-emerald-500" />
            Milk &amp; Dairy Products
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </section>
    </div>
  );
};
