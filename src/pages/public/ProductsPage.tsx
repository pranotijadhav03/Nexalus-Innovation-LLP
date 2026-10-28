import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getCategories, getCachedProducts, getCachedCategories } from '../../firebase/services';
import { Product, ProductCategory } from '../../types';
import { ProductCard } from '../../components/brand/ProductCard';
import { initialProducts, initialCategories } from '../../data/initialData';
import {
  Package,
  Shield,
  Wifi,
  Server,
  Cpu,
  Search,
  ArrowUpDown,
  X,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { QuoteModal } from '../../components/common/QuoteModal';

// Helper to pick category icon
function getCategoryIcon(cat: ProductCategory) {
  const name = (cat.name || '').toLowerCase();
  const slug = (cat.slug || '').toLowerCase();
  if (name.includes('cctv') || name.includes('camera') || slug.includes('cctv')) {
    return <Shield className="w-4 h-4 text-cyan-400" />;
  }
  if (name.includes('fiber') || name.includes('broadband') || name.includes('internet') || slug.includes('fiber')) {
    return <Wifi className="w-4 h-4 text-teal-400" />;
  }
  if (name.includes('network') || name.includes('switch') || slug.includes('network')) {
    return <Server className="w-4 h-4 text-indigo-400" />;
  }
  if (name.includes('electronic') || name.includes('cable') || slug.includes('cable')) {
    return <Cpu className="w-4 h-4 text-amber-400" />;
  }
  return <Layers className="w-4 h-4 text-blue-400" />;
}

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const brandParam = searchParams.get('brand');
  const catParam = searchParams.get('category');

  // Categories & Products state with instant sync fallback
  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const cached = getCachedCategories('nexalus-innovations');
    const filtered = cached.filter(c => c.brandId !== 'am-distributors');
    return filtered.length > 0 ? filtered : initialCategories.filter(c => c.brandId !== 'am-distributors');
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const cached = getCachedProducts();
    const filtered = cached.filter(p => p.brandId !== 'am-distributors');
    return filtered.length > 0 ? filtered : initialProducts.filter(p => p.brandId !== 'am-distributors');
  });

  // Active Category Filter: 'all' or category ID
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [isBulkQuoteOpen, setIsBulkQuoteOpen] = useState(false);

  const loadData = async () => {
    try {
      const [cats, prods] = await Promise.all([
        getCategories('nexalus-innovations'),
        getProducts(undefined, true)
      ]);
      const validCats = cats.filter(c => c.brandId !== 'am-distributors');
      const validProds = prods.filter(p => p.brandId !== 'am-distributors');
      if (validCats.length > 0) setCategories(validCats);
      if (validProds.length > 0) setProducts(validProds);
    } catch {
      // fallback to initialData
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      const freshCats = getCachedCategories('nexalus-innovations').filter(c => c.brandId !== 'am-distributors');
      const freshProds = getCachedProducts().filter(p => p.brandId !== 'am-distributors');
      if (freshCats.length > 0) setCategories(freshCats);
      if (freshProds.length > 0) setProducts(freshProds);
      loadData();
    };

    window.addEventListener('nexalus_data_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    document.addEventListener('visibilitychange', handleUpdate);

    return () => {
      window.removeEventListener('nexalus_data_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      document.removeEventListener('visibilitychange', handleUpdate);
    };
  }, []);

  // Map URL parameters (brand or category) to selectedCategoryId
  useEffect(() => {
    if (catParam) {
      const matched = categories.find(c => c.id === catParam || c.slug === catParam);
      if (matched) {
        setSelectedCategoryId(matched.id);
        return;
      }
    }
    if (brandParam) {
      if (brandParam === 'cp-plus') {
        const cat = categories.find(c => c.id === 'cat-cctv-surveillance' || c.name.toLowerCase().includes('cctv'));
        if (cat) {
          setSelectedCategoryId(cat.id);
          return;
        }
      }
      if (brandParam === 'one-broadband') {
        const cat = categories.find(c => c.id === 'cat-optical-fiber' || c.name.toLowerCase().includes('fiber'));
        if (cat) {
          setSelectedCategoryId(cat.id);
          return;
        }
      }
      if (brandParam === 'itti-networking') {
        const cat = categories.find(c => c.id === 'cat-enterprise-networking' || c.name.toLowerCase().includes('network'));
        if (cat) {
          setSelectedCategoryId(cat.id);
          return;
        }
      }
    }
    if (!catParam && !brandParam) {
      setSelectedCategoryId('all');
    }
  }, [brandParam, catParam, categories]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    if (catId === 'all') {
      searchParams.delete('category');
      searchParams.delete('brand');
      setSearchParams(searchParams);
    } else {
      searchParams.set('category', catId);
      searchParams.delete('brand');
      setSearchParams(searchParams);
    }
  };

  // Helper to match a product to a category
  const doesProductBelongToCategory = (product: Product, category: ProductCategory): boolean => {
    if (product.categoryId === category.id) return true;
    const catName = category.name.trim().toLowerCase();
    const prodCatName = (product.categoryName || '').trim().toLowerCase();
    if (prodCatName && prodCatName === catName) return true;

    // Umbrella group matching ONLY for canonical root umbrella category IDs (NOT for custom categories)
    if (category.id === 'cat-cctv-surveillance' &&
        (product.categoryId === 'cat-cctv-surveillance' || product.brandId === 'cp-plus' || prodCatName.includes('cctv') || prodCatName.includes('camera'))) {
      return true;
    }
    if (category.id === 'cat-optical-fiber' &&
        (product.categoryId === 'cat-optical-fiber' || product.brandId === 'one-broadband' || prodCatName.includes('fiber') || prodCatName.includes('broadband'))) {
      return true;
    }
    if (category.id === 'cat-enterprise-networking' &&
        (product.categoryId === 'cat-enterprise-networking' || product.brandId === 'itti-networking' || prodCatName.includes('network') || prodCatName.includes('switch'))) {
      return true;
    }
    return false;
  };

  // Count products per category
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    categories.forEach(cat => {
      const count = products.filter(p => doesProductBelongToCategory(p, cat)).length;
      map.set(cat.id, count);
    });
    return map;
  }, [categories, products]);

  // Group products by category
  const categorizedProducts = useMemo(() => {
    return categories.map(cat => ({
      category: cat,
      products: products.filter(p => doesProductBelongToCategory(p, cat))
    })).filter(group => group.products.length > 0);
  }, [categories, products]);

  // Filtered/Searched products
  const searchedProducts = useMemo(() => {
    const isFiltered = searchQuery.trim().length > 0 || onlyInStock || sortBy !== 'featured' || selectedCategoryId !== 'all';
    if (!isFiltered) return [];

    let list = products.filter(product => {
      // Category filter
      if (selectedCategoryId !== 'all') {
        const cat = categories.find(c => c.id === selectedCategoryId);
        if (cat && !doesProductBelongToCategory(product, cat)) {
          return false;
        }
      }

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
    });

    list.sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [products, categories, selectedCategoryId, onlyInStock, searchQuery, sortBy]);

  const isSearchActive = searchQuery.trim().length > 0 || onlyInStock || sortBy !== 'featured';
  const isCategoryTabSelected = selectedCategoryId !== 'all' && !isSearchActive;

  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="w-full bg-[#0a1628] text-white py-14 sm:py-20 border-b border-blue-900/40 relative overflow-hidden">
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
            Authorized OEM commercial equipment supplied and engineered under <strong className="text-white font-bold">Nexalus Innovations LLP</strong>. Every category features certified enterprise models with direct manufacturer warranty and precision deployment support.
          </p>

          {/* DYNAMIC CATEGORY TABS */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 pt-4 flex-wrap">
            <button
              type="button"
              onClick={() => handleCategorySelect('all')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
                selectedCategoryId === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
            >
              All Hardware ({products.length})
            </button>

            {categories.map(cat => {
              const count = categoryCounts.get(cat.id) || 0;
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat.name} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEARCH & FILTER CONTROLS */}
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

              {(isSearchActive || selectedCategoryId !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setOnlyInStock(false);
                    setSortBy('featured');
                    setSelectedCategoryId('all');
                    searchParams.delete('category');
                    searchParams.delete('brand');
                    setSearchParams(searchParams);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer ml-auto"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS DISPLAY VIEW */}
      {isSearchActive ? (
        /* 1. Dynamic Search Results View */
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
                  setSelectedCategoryId('all');
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
      ) : isCategoryTabSelected ? (
        /* 2. Single Selected Category View */
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
          {(() => {
            const currentCat = categories.find(c => c.id === selectedCategoryId);
            const catProds = products.filter(p => currentCat && doesProductBelongToCategory(p, currentCat));
            return (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200">
                      {currentCat && getCategoryIcon(currentCat)}
                      <span>{currentCat?.name}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {currentCat?.name} Catalog
                    </h2>
                    {currentCat?.description && (
                      <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                        {currentCat.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {catProds.length} Certified Models
                    </span>
                  </div>
                </div>

                {catProds.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
                    <Package className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">No products currently in this category.</p>
                    <p className="text-xs text-slate-400">Add products to this category from the Admin Console.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {catProds.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </section>
      ) : (
        /* 3. All Hardware View (Grouped by every category dynamically) */
        <div className="w-full flex flex-col pt-8 divide-y divide-slate-100">
          {categorizedProducts.map((group, index) => {
            const isDarkTheme = index % 2 === 1;
            return (
              <section
                key={group.category.id}
                className={`w-full py-14 sm:py-20 border-b border-slate-200/90 ${
                  isDarkTheme
                    ? 'bg-gradient-to-b from-[#0a1628] via-[#0f2444] to-[#0a1628] text-white'
                    : 'bg-white text-slate-900'
                }`}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                  {/* Category Header */}
                  <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 ${
                    isDarkTheme ? 'border-b border-blue-900/50' : 'border-b border-slate-100'
                  }`}>
                    <div className="space-y-2">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                        isDarkTheme
                          ? 'bg-blue-500/20 text-cyan-300 border-blue-400/30'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {getCategoryIcon(group.category)}
                        <span>CATEGORY 0{index + 1} &mdash; {group.category.name}</span>
                      </div>
                      <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                        isDarkTheme ? 'text-white' : 'text-slate-900'
                      }`}>
                        {group.category.name} Equipment
                      </h2>
                      {group.category.description && (
                        <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${
                          isDarkTheme ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {group.category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${
                        isDarkTheme
                          ? 'bg-blue-900/60 text-cyan-300 border-blue-700/50'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {group.products.length} Certified Models
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(group.category.id)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                          isDarkTheme
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <span>View All {group.category.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.products.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* BULK QUOTE MODAL */}
      <QuoteModal
        isOpen={isBulkQuoteOpen}
        onClose={() => setIsBulkQuoteOpen(false)}
        brandId="nexalus-innovations"
        itemName="Commercial Equipment Bulk Procurement"
        itemType="product"
      />
    </div>
  );
};
