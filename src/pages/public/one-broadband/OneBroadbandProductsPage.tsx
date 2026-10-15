import React, { useState, useEffect } from 'react';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { ProductCard } from '../../../components/brand/ProductCard';
import { Input } from '../../../components/common/Input';
import { getProducts, getCategories } from '../../../firebase/services';
import { Product, ProductCategory } from '../../../types';
import { Search } from 'lucide-react';

export const OneBroadbandProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prods, cats] = await Promise.all([
          getProducts('one-broadband', true),
          getCategories('one-broadband')
        ]);
        setProducts(prods);
        setCategories(cats);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filtered = products.filter(p => {
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
        brandId="one-broadband"
        title="Wi-Fi 6 Routers & Optical Fiber Equipment"
        subtitle="Dual-band gigabit routers, optical network terminals (ONT), and whole-home mesh Wi-Fi systems engineered for ultra-fast broadband."
        breadcrumbs={[{ label: 'Products' }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search equipment (e.g. PoE switch, SFP, ONT)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Hardware ({products.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            Loading networking hardware...
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-slate-500 text-sm">No networking products found matching your filter.</p>
          </div>
        )}
      </section>
    </div>
  );
};
