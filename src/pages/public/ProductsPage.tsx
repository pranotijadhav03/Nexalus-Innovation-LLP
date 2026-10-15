import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../../firebase/services';
import { Product, ProductCategory, BrandId } from '../../types';
import { ProductCard } from '../../components/brand/ProductCard';
import {
  Package,
  Shield,
  Wifi,
  Server,
  Cpu,
  Truck,
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowUpDown,
  X,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { QuoteModal } from '../../components/common/QuoteModal';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialBrand = (searchParams.get('brand') as BrandId | 'all') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandId | 'all'>(initialBrand);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkQuoteOpen, setIsBulkQuoteOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [allProducts, allCategories] = await Promise.all([
          getProducts(undefined, true),
          getCategories()
        ]);
        setProducts(allProducts);
        setCategories(allCategories);
      } finally {
        setIsLoading(false);
      }
    }
    load();
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
    setSelectedCategory('all');
    if (brand === 'all') {
      searchParams.delete('brand');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ brand });
    }
  };

  // Filter available categories based on selected brand
  const filteredCategories = useMemo(() => {
    if (selectedBrand === 'all') return categories;
    if (selectedBrand === 'nexalus-innovations') {
      return categories.filter(c => c.brandId === 'nexalus-innovations');
    }
    if (selectedBrand === 'am-distributors') {
      return categories.filter(c => c.brandId === 'am-distributors');
    }
    return categories.filter(c => c.brandId === selectedBrand);
  }, [categories, selectedBrand]);

  // Main filter & sort logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Brand / Division filter
      if (selectedBrand === 'nexalus-innovations') {
        if (
          product.brandId !== 'nexalus-innovations' &&
          product.brandId !== 'cp-plus' &&
          product.brandId !== 'one-broadband' &&
          product.brandId !== 'itti-networking'
        ) {
          return false;
        }
      } else if (selectedBrand === 'am-distributors') {
        if (product.brandId !== 'am-distributors') {
          return false;
        }
      } else if (selectedBrand !== 'all' && product.brandId !== selectedBrand) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
        return false;
      }

      // In stock filter
      if (onlyInStock && product.availability !== 'in_stock') {
        return false;
      }

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
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      }
      if (sortBy === 'price-asc') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === 'price-desc') {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [products, selectedBrand, selectedCategory, onlyInStock, searchQuery, sortBy]);

  const cctvCount = products.filter(p => p.brandId === 'cp-plus' || p.categoryId === 'cat-nex-cctv').length;
  const internetCount = products.filter(p => p.brandId === 'one-broadband' || p.categoryId === 'cat-nex-internet').length;
  const networkCount = products.filter(p => p.brandId === 'itti-networking' || p.categoryId === 'cat-nex-networking' || p.categoryId === 'cat-nex-electronics').length;
  const amCount = products.filter(p => p.brandId === 'am-distributors' || p.categoryId?.startsWith('cat-am-')).length;

  return (
    <div className="space-y-10 sm:space-y-12 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-14 sm:py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Package className="w-3.5 h-3.5" /> Nexalus Commercial Catalog
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Commercial Hardware &amp; Logistics Catalog
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed max-w-2xl mx-auto">
            Explore commercial lines across <strong className="text-sky-400 font-semibold">Nexalus Innovations</strong> (4K AI CCTV cameras, Gigabit Fiber routers, Enterprise switches) and <strong className="text-teal-400 font-semibold">A.M. Distributors Chiplun</strong> (Packaged mineral water, ice cream, fresh milk &amp; dairy products).
          </p>

          {/* Operating Company Switcher Tabs */}
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <button
              onClick={() => handleBrandChange('all')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                selectedBrand === 'all'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
              }`}
            >
              All Offerings ({products.length})
            </button>
            <button
              onClick={() => handleBrandChange('nexalus-innovations')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                selectedBrand === 'nexalus-innovations'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
              }`}
            >
              <Cpu className="w-4 h-4 text-blue-400" />
              Nexalus Innovations (CCTV, Internet, Network) ({cctvCount + internetCount + networkCount})
            </button>
            <button
              onClick={() => handleBrandChange('am-distributors')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                selectedBrand === 'am-distributors'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
              }`}
            >
              <Truck className="w-4 h-4 text-teal-400" />
              A.M. Distributors Chiplun ({amCount})
            </button>
          </div>
        </div>
      </section>

      {/* Filter and Control Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sorting & Availability */}
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
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {filteredCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? selectedBrand === 'cp-plus'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : selectedBrand === 'one-broadband'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : selectedBrand === 'itti-networking'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Results Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> products
            {selectedBrand !== 'all' && (
              <span> in <span className="font-bold text-slate-800">{selectedBrand === 'cp-plus' ? 'CCTV Surveillance' : selectedBrand === 'one-broadband' ? 'Fiber Internet' : selectedBrand === 'itti-networking' ? 'Enterprise Networking' : 'Nexalus Innovations'}</span></span>
            )}
          </p>
          {(searchQuery || selectedCategory !== 'all' || onlyInStock) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setOnlyInStock(false);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Reset Filters
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
                <div className="aspect-4/3 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                <div className="h-8 bg-slate-200 rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
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
                setSelectedCategory('all');
                setSelectedBrand('all');
                setOnlyInStock(false);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Enterprise Quotation & Bulk Inquiry Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-xl border border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Enterprise Procurement & Quotations
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Looking for Bulk Pricing or Customized BOQ Proposals?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Our engineering team prepares comprehensive equipment quotations, site installation assessments, and enterprise volume discounts for corporates, tech parks, and institutions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              variant="primary"
              size="lg"
              icon={<PhoneCall className="w-4 h-4" />}
              onClick={() => setIsBulkQuoteOpen(true)}
            >
              Request Enterprise Quote
            </Button>
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
