import React, { useState, useEffect } from 'react';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { ProductCard } from '../../../components/brand/ProductCard';
import { Input } from '../../../components/common/Input';
import { getProducts, getCategories, getCachedProducts } from '../../../firebase/services';
import { Product, ProductCategory } from '../../../types';
import { Search, Filter, Shield } from 'lucide-react';

export const CpPlusProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => getCachedProducts('cp-plus'));
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    try {
      const [prods, cats] = await Promise.all([
        getProducts('cp-plus', true),
        getCategories('cp-plus')
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.warn('Failed to load CP Plus products:', e);
    }
  };

  useEffect(() => {
    load();

    const handleUpdate = () => {
      const fresh = getCachedProducts('cp-plus');
      if (fresh && fresh.length > 0) setProducts(fresh);
      load();
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

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-20">
      <BrandHeader
        brandId="cp-plus"
        title="CP PLUS CCTV & Surveillance Products"
        subtitle="Explore high-definition Dome, Bullet, 4G Wireless, and IP Network cameras with multichannel NVR recorders."
        breadcrumbs={[{ label: 'Products' }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search & Category Filter Toolbar */}
        <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search by model (e.g. CP-UNC) or name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            Loading CP PLUS catalog...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div>
            <div className="text-xs text-slate-500 font-medium mb-4">
              Showing {filteredProducts.length} verified surveillance items
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Shield className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No products match your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the category filter to view available CP PLUS hardware.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
