import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getCategories, getCachedProducts } from '../../firebase/services';
import { Product, ProductCategory, BrandId } from '../../types';
import { ProductCard } from '../../components/brand/ProductCard';
import { initialProducts } from '../../data/initialData';
import {
  Package,
  Shield,
  Wifi,
  Server,
  Cpu,
  Search,
  ArrowUpDown,
  X,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { QuoteModal } from '../../components/common/QuoteModal';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialBrand = (searchParams.get('brand') as BrandId | 'all') || 'all';

  const [products, setProducts] = useState<Product[]>(() => {
    const cached = getCachedProducts();
    const filtered = cached.filter(p => p.brandId !== 'am-distributors');
    return filtered.length > 0 ? filtered : initialProducts.filter(p => p.brandId !== 'am-distributors');
  });
  const [selectedBrand, setSelectedBrand] = useState<BrandId | 'all'>(initialBrand);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkQuoteOpen, setIsBulkQuoteOpen] = useState(false);

  const loadData = async () => {
    try {
      const allProducts = await getProducts(undefined, true);
      // Strictly exclude A.M. Distributors products from Nexalus hardware catalog
      const filtered = allProducts.filter(p => p.brandId !== 'am-distributors');
      setProducts(filtered.length > 0 ? filtered : initialProducts.filter(p => p.brandId !== 'am-distributors'));
    } catch (err) {
      setProducts(initialProducts.filter(p => p.brandId !== 'am-distributors'));
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      const fresh = getCachedProducts().filter(p => p.brandId !== 'am-distributors');
      if (fresh && fresh.length > 0) {
        setProducts(fresh);
      }
      loadData();
    };

    window.addEventListener('nexalus_data_update', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    document.addEventListener('visibilitychange', handleUpdate);

    return () => {
      window.removeEventListener('nexalus_data_update', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      document.removeEventListener('visibilitychange', handleUpdate);
    };
  }, []);

  // Sync brand when search param changes
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      setSelectedBrand(brandParam as any);
    }
  }, [searchParams]);

  const handleBrandChange = (brand: BrandId | 'all') => {
    setSelectedBrand(brand);
    if (brand === 'all') {
      searchParams.delete('brand');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ brand });
    }
  };

  const getProduct = (id: string): Product => {
    return products.find(p => p.id === id) || initialProducts.find(p => p.id === id) || initialProducts[0];
  };

  // 1. Exactly 6 Curated CCTV Products
  const cctvProductIds = ['prod-cp-1', 'prod-cp-2', 'prod-cp-5', 'prod-cp-3', 'prod-cp-4', 'prod-cp-6'];
  const cctvProducts = useMemo(() => {
    return cctvProductIds.map(getProduct).filter(Boolean);
  }, [products]);

  // 2. Exactly 6 Curated High-Speed Fiber Internet Products
  const internetProductIds = ['prod-ob-1', 'prod-ob-2', 'prod-ob-6', 'prod-ob-3', 'prod-ob-4', 'prod-ob-5'];
  const internetProducts = useMemo(() => {
    return internetProductIds.map(getProduct).filter(Boolean);
  }, [products]);

  // 3. Exactly 6 Curated Enterprise Networking Products
  const networkProductIds = ['prod-itti-6', 'prod-itti-1', 'prod-itti-2', 'prod-itti-4', 'prod-itti-5', 'prod-itti-3'];
  const networkProducts = useMemo(() => {
    return networkProductIds.map(getProduct).filter(Boolean);
  }, [products]);

  // Search & Filtered Products for dynamic searching
  const searchedProducts = useMemo(() => {
    if (!searchQuery.trim() && !onlyInStock && sortBy === 'featured' && selectedBrand === 'all') {
      return [];
    }

    return products.filter(product => {
      // Brand filter
      if (selectedBrand === 'cp-plus' && product.brandId !== 'cp-plus') return false;
      if (selectedBrand === 'one-broadband' && product.brandId !== 'one-broadband') return false;
      if (selectedBrand === 'itti-networking' && product.brandId !== 'itti-networking') return false;

      // In stock filter
      if (onlyInStock && product.availability !== 'in_stock') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesModel = product.modelNumber.toLowerCase().includes(q);
        const matchesCat = product.categoryName.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesSpecs = Object.entries(product.specifications || {}).some(
          ([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
        );

        if (!matchesName && !matchesModel && !matchesCat && !matchesDesc && !matchesSpecs) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, selectedBrand, onlyInStock, searchQuery, sortBy]);

  const isSearching = searchQuery.trim().length > 0 || onlyInStock || sortBy !== 'featured';

  return (
    <div className="flex flex-col w-full">
      {/* =========================================================================
          SLIDE 1: HERO HEADER (DEEP CORPORATE BLUE THEME)
          ========================================================================= */}
      <section className="w-full bg-[#0a1628] text-white py-14 sm:py-20 border-b border-blue-900/40 relative overflow-hidden">
        {/* Subtle background tech accents */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider">
            <Package className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nexalus Commercial Hardware Catalog</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Commercial Hardware &amp; Equipment Catalog
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Authorized OEM commercial equipment supplied and engineered under <strong className="text-white font-bold">Nexalus Innovations LLP</strong>. Each category features 6 certified enterprise models with direct manufacturer warranty and precision deployment support.
          </p>

          {/* Category Switcher Tabs */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 pt-4 flex-wrap">
            <button
              onClick={() => handleBrandChange('all')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
                selectedBrand === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
            >
              All Hardware (18 Models)
            </button>
            <button
              onClick={() => handleBrandChange('cp-plus')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
                selectedBrand === 'cp-plus'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>CCTV Surveillance (6)</span>
            </button>
            <button
              onClick={() => handleBrandChange('one-broadband')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
                selectedBrand === 'one-broadband'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 ring-2 ring-teal-400/50'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
            >
              <Wifi className="w-4 h-4 text-teal-400" />
              <span>Optical Fiber (6)</span>
            </button>
            <button
              onClick={() => handleBrandChange('itti-networking')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
                selectedBrand === 'itti-networking'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
            >
              <Server className="w-4 h-4 text-indigo-400" />
              <span>Enterprise Networking (6)</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CONTROL & SEARCH BAR (CLEAN FLOATING CARD)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 w-full">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xl shadow-slate-900/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by model, name, resolution, ports, or specifications..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sorting & Availability Filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Product Name (A-Z)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={e => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                In Stock Only
              </label>

              {isSearching && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setOnlyInStock(false);
                    setSortBy('featured');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer ml-auto"
                >
                  Reset Search
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DYNAMIC SEARCH RESULTS VIEW (IF SEARCHING OR CUSTOM SORTING)
          ========================================================================= */}
      {isSearching ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Found <strong className="text-slate-900 font-bold">{searchedProducts.length}</strong> matching products
            </p>
          </div>

          {searchedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
              <p className="text-xs text-slate-500">
                We couldn't find any products matching your active search query or filter options.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand('all');
                  setOnlyInStock(false);
                  setSortBy('featured');
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* =========================================================================
           CATEGORY-WISE ALTERNATING COLOR SECTIONS (6 PRODUCTS PER CATEGORY)
           ========================================================================= */
        <div className="w-full flex flex-col pt-8">
          {/* CATEGORY 1: CCTV SURVEILLANCE (CLEAN WHITE THEME) */}
          {(selectedBrand === 'all' || selectedBrand === 'cp-plus') && (
            <section className="w-full bg-white py-14 sm:py-20 border-b border-slate-200/90">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span>CATEGORY 01 — CCTV SURVEILLANCE</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Commercial 4K CCTV Video Surveillance Equipment
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                      High-definition Sony Starvis IP cameras, 32x optical zoom PTZ tracking domes, smart video door stations, and commercial NVR recording arrays with 4K clarity.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      6 Certified Models
                    </span>
                    <Link to="/brands/nexalus-innovations">
                      <Button variant="outline" size="sm" className="font-semibold text-xs border-blue-200 text-blue-700 hover:bg-blue-50" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        CCTV Specs
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 6 CCTV Product Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cctvProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CATEGORY 2: OPTICAL FIBER INTERNET (RICH CORPORATE BLUE THEME) */}
          {(selectedBrand === 'all' || selectedBrand === 'one-broadband') && (
            <section className="w-full bg-gradient-to-b from-[#0a1628] via-[#0f2444] to-[#0a1628] text-white py-14 sm:py-20 border-b border-blue-900/40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-blue-900/50 pb-5">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider border border-teal-400/30">
                      <Wifi className="w-3.5 h-3.5 text-teal-400" />
                      <span>CATEGORY 02 — OPTICAL FIBER BROADBAND &amp; FTTH</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      High-Speed Optical Fiber Internet, Routers &amp; Mesh Wi-Fi
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                      Symmetrical gigabit FTTH broadband gateways, Tri-band Wi-Fi 6 mesh roaming nodes, and outdoor high-gain repeaters engineered for uninterrupted enterprise uptime.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-teal-900/60 text-teal-300 border border-teal-700/50">
                      6 Certified Models
                    </span>
                    <Link to="/brands/nexalus-innovations">
                      <Button variant="outline-white" size="sm" className="font-semibold text-xs border-teal-500/50 text-teal-200 hover:bg-teal-900/30" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Fiber Plans
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 6 Optical Fiber Product Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {internetProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CATEGORY 3: ENTERPRISE IT NETWORKING (CLEAN SLATE/WHITE THEME) */}
          {(selectedBrand === 'all' || selectedBrand === 'itti-networking') && (
            <section className="w-full bg-slate-50 py-14 sm:py-20 border-b border-slate-200/90">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider border border-indigo-200">
                      <Server className="w-3.5 h-3.5 text-indigo-600" />
                      <span>CATEGORY 03 — ENTERPRISE IT NETWORKING</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Layer-2/3 Managed PoE+ Switching &amp; Server Cabinets
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                      Heavy-duty managed PoE+ network switches, 10G optical SFP+ transceivers, heavy-gauge cold-rolled server cabinets, and Fluke-certified pure copper Cat6A structured cabling.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      6 Certified Models
                    </span>
                    <Link to="/brands/nexalus-innovations">
                      <Button variant="outline" size="sm" className="font-semibold text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Switching Specs
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 6 Enterprise Networking Product Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {networkProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* =========================================================================
          ENTERPRISE PROCUREMENT & BULK INQUIRY BANNER (DEEP BLUE THEME)
          ========================================================================= */}
      <section className="w-full bg-[#0a1628] text-white py-14 sm:py-18 border-t border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 p-8 sm:p-12 border border-blue-800/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                Enterprise Procurement &amp; Quotations
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Looking for Bulk Pricing or Customized BOQ Proposals?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Our certified engineering team prepares comprehensive equipment quotations, onsite site assessments, and volume discounts under <strong className="text-white">Nexalus Innovations LLP</strong>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button
                variant="primary"
                size="lg"
                icon={<PhoneCall className="w-4 h-4" />}
                onClick={() => setIsBulkQuoteOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 font-bold shadow-lg shadow-blue-900/50"
              >
                Request Enterprise Quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      <QuoteModal
        isOpen={isBulkQuoteOpen}
        onClose={() => setIsBulkQuoteOpen(false)}
        brandId="general"
        itemType="general"
        itemName="Comprehensive Nexalus Enterprise Hardware Proposal"
      />
    </div>
  );
};
