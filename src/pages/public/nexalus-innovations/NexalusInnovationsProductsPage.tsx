import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories, getCachedProducts, getCachedCategories, subscribeToProducts, subscribeToCategories } from '../../../firebase/services';
import { Product, ProductCategory } from '../../../types';
import { initialProducts, initialCategories } from '../../../data/initialData';
import { ProductCard } from '../../../components/brand/ProductCard';
import { Cpu, Shield, Wifi, Server, Sparkles, Filter, Search, X, Layers, SlidersHorizontal } from 'lucide-react';

export const NexalusInnovationsProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('category');

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'name' | 'price-asc' | 'price-desc'>('featured');

  const [techProducts, setTechProducts] = useState<Product[]>(() =>
    getCachedProducts('nexalus-innovations')
  );

  const [categories, setCategories] = useState<ProductCategory[]>(() =>
    getCachedCategories('nexalus-innovations')
  );

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        getProducts('nexalus-innovations', true),
        getCategories('nexalus-innovations')
      ]);
      if (prods && prods.length > 0) setTechProducts(prods);
      if (cats && cats.length > 0) setCategories(cats);
    } catch (err) {
      console.warn('Could not load tech products:', err);
    }
  };

  useEffect(() => {
    loadData();

    const unsubCats = subscribeToCategories((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    }, 'nexalus-innovations');

    const unsubProds = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) setTechProducts(prods);
    }, 'nexalus-innovations');

    // Listen for real-time cross-tab updates when admin creates/edits/deletes products
    const handleUpdate = () => {
      const freshProds = getCachedProducts('nexalus-innovations');
      const freshCats = getCachedCategories('nexalus-innovations');
      if (freshProds && freshProds.length > 0) setTechProducts(freshProds);
      if (freshCats && freshCats.length > 0) setCategories(freshCats);
      loadData();
    };

    window.addEventListener('nexalus_data_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    document.addEventListener('visibilitychange', handleUpdate);

    return () => {
      unsubCats();
      unsubProds();
      window.removeEventListener('nexalus_data_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      document.removeEventListener('visibilitychange', handleUpdate);
    };
  }, []);

  // Map URL parameter ?category=...
  useEffect(() => {
    if (catParam) {
      const matched = categories.find(c => c.id === catParam || c.slug === catParam);
      if (matched) {
        setSelectedCategoryId(matched.id);
      } else {
        setSelectedCategoryId('all');
      }
    } else {
      setSelectedCategoryId('all');
    }
  }, [catParam, categories]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    if (catId === 'all') {
      const next = new URLSearchParams(searchParams);
      next.delete('category');
      setSearchParams(next, { replace: true });
    } else {
      const next = new URLSearchParams(searchParams);
      next.set('category', catId);
      setSearchParams(next, { replace: true });
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    techProducts.forEach(p => {
      if (p.published !== false) {
        counts.set(p.categoryId, (counts.get(p.categoryId) || 0) + 1);
      }
    });
    return counts;
  }, [techProducts]);

  // Filtered and Sorted Products
  const displayedProducts = useMemo(() => {
    let list = techProducts.filter(p => {
      if (p.published === false) return false;

      // Category filter
      if (selectedCategoryId !== 'all' && p.categoryId !== selectedCategoryId) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        let matches = false;
        if (q.length <= 3) {
          const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(^|[^a-z0-9])${escaped}`, 'i');
          matches =
            regex.test(p.name || '') ||
            regex.test(p.modelNumber || '') ||
            regex.test(p.categoryName || '') ||
            regex.test(p.description || '') ||
            Object.entries(p.specifications || {}).some(
              ([k, v]) => regex.test(k) || regex.test(String(v))
            );
        } else {
          matches =
            (p.name || '').toLowerCase().includes(q) ||
            (p.modelNumber || '').toLowerCase().includes(q) ||
            (p.categoryName || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q) ||
            Object.entries(p.specifications || {}).some(
              ([k, v]) => k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q)
            );
        }

        if (!matches) {
          return false;
        }
      }

      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return (a.divisionShowcaseOrder || 0) - (b.divisionShowcaseOrder || 0);
    });

    return list;
  }, [techProducts, selectedCategoryId, searchQuery, sortBy]);

  const activeCategoryObj = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="space-y-10 sm:space-y-12 pb-20 bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-slate-900 text-white py-14 sm:py-20 border-b border-indigo-950/60 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950 text-cyan-300 text-xs font-bold border border-indigo-700/50 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nexalus Innovations • Technology Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            {activeCategoryObj ? activeCategoryObj.name : 'Commercial Hardware & Infrastructure'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            {activeCategoryObj?.description || 'Authentic commercial-grade 4K CCTV cameras, optical fiber Wi-Fi 6 ONT gateways, managed Layer-2/3 PoE+ switches, and certified structured cabling accessories.'}
          </p>
        </div>
      </section>

      {/* Main Catalog Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search Bar & Controls Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search CCTV, ONT routers, PoE switches, cables..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector & Result Count */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Showing <span className="text-slate-900 font-black">{displayedProducts.length}</span> of {techProducts.filter(p => p.published !== false).length} Products
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products by"
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="name">Product Name (A-Z)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pb-2">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategoryId === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>All Products</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              selectedCategoryId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {techProducts.length}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count = categoryCounts.get(cat.id) || 0;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map(product => (
              <ProductCard key={product.id} product={product} animate={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">No matching products found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {searchQuery
                ? `No products matched "${searchQuery}". Try different keywords or reset your search.`
                : 'No products are currently available in this category.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                Clear Search Query
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
