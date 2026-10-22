import React, { useState, useEffect } from 'react';
import { getProducts } from '../../../firebase/services';
import { Product } from '../../../types';
import { initialProducts } from '../../../data/initialData';
import { ProductCard } from '../../../components/brand/ProductCard';
import { Truck, Droplets, IceCream, Milk, Sparkles } from 'lucide-react';

export const AmDistributorsProductsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'water' | 'icecream' | 'dairy'>('all');

  const [products, setProducts] = useState<Product[]>(
    initialProducts.filter(p => p.brandId === 'am-distributors')
  );

  useEffect(() => {
    getProducts('am-distributors', true).then(prods => {
      if (prods && prods.length > 0) {
        setProducts(prods);
      }
    }).catch(err => {
      console.warn('Could not load products from Firestore:', err);
    });
  }, []);

  const displayedProducts = products.filter(p => {
    if (filter === 'water') return p.categoryId.includes('water');
    if (filter === 'icecream') return p.categoryId.includes('icecream');
    if (filter === 'dairy') return p.categoryId.includes('dairy');
    return true;
  });

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* Header */}
      <section className="bg-slate-900 text-white py-14 sm:py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-900/60 text-teal-400 text-xs font-semibold border border-teal-700/50">
            <Truck className="w-3.5 h-3.5" />
            <span>Wholesale Supply Catalog • A.M. Distributors Chiplun</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Mineral Water, Ice Cream &amp; Dairy Products
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Wholesale depot distribution covering packaged 20L water cans, retail bottle cases, commercial ice cream bulk tubs, and daily farm-fresh dairy supplies.
          </p>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilter('water')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'water'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            Packaged Mineral Water
          </button>
          <button
            onClick={() => setFilter('icecream')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'icecream'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <IceCream className="w-3.5 h-3.5 text-cyan-500" />
            Commercial Ice Creams
          </button>
          <button
            onClick={() => setFilter('dairy')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'dairy'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Milk className="w-3.5 h-3.5 text-emerald-500" />
            Milk &amp; Dairy Products
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
