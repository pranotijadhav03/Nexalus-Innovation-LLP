import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, getCategories, getCachedProducts, getCachedCategories } from '../../../firebase/services';
import { Product, ProductCategory } from '../../../types';
import { initialProducts, initialCategories } from '../../../data/initialData';
import { ProductCard } from '../../../components/brand/ProductCard';
import { Truck, Droplets, IceCream, Milk, Package, Sparkles } from 'lucide-react';

const DEFAULT_AM_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-am-water',
    brandId: 'am-distributors',
    name: 'Packaged Mineral Water',
    slug: 'packaged-mineral-water-chiplun',
    description: 'Hygienically packaged 20L natural mineral water dispenser jars and retail bottle crates with automated steam sanitization.'
  },
  {
    id: 'cat-am-icecream',
    brandId: 'am-distributors',
    name: 'Commercial Ice Creams',
    slug: 'commercial-ice-cream-chiplun',
    description: 'Certified -18°C refrigerated delivery of commercial bulk ice cream tubs, cones, and retail bars for parlors and banquets.'
  },
  {
    id: 'cat-am-dairy',
    brandId: 'am-distributors',
    name: 'Milk & Dairy Products',
    slug: 'milk-dairy-products-chiplun',
    description: 'Fresh pasteurized standardized milk pouches, churned table butter, ghee, and cheese blocks delivered daily at 4:00 AM.'
  }
];

export const AmDistributorsProductsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>(() =>
    getCachedProducts('am-distributors')
  );
  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const cached = getCachedCategories('am-distributors');
    return cached.length > 0 ? cached : DEFAULT_AM_CATEGORIES;
  });

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        getProducts('am-distributors', true),
        getCategories('am-distributors')
      ]);
      if (prods && prods.length > 0) {
        setProducts(prods);
      }
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    } catch (err) {
      console.warn('Could not load AM Distributors catalog data:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for real-time cross-tab updates when admin creates/edits/deletes products or categories
    const handleUpdate = () => {
      const freshProds = getCachedProducts('am-distributors');
      if (freshProds && freshProds.length > 0) {
        setProducts(freshProds);
      }
      const freshCats = getCachedCategories('am-distributors');
      if (freshCats && freshCats.length > 0) {
        setCategories(freshCats);
      }
    };

    window.addEventListener('nexalus_data_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('nexalus_data_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Filter products by selected category
  const displayedProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter(p =>
      p.categoryId === selectedCategory ||
      p.categoryId.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [products, selectedCategory]);

  // Dynamically determine background image based on selected category & its products
  const currentBgImage = useMemo(() => {
    if (selectedCategory === 'all') {
      return '/images/am-warehouse-depot.jpg';
    }

    // 1. Look for a product in this category that has an image
    const prodsInCat = products.filter(
      p =>
        p.categoryId === selectedCategory ||
        p.categoryId.toLowerCase().includes(selectedCategory.toLowerCase())
    );
    const prodWithImage = prodsInCat.find(p => p.images && p.images.length > 0 && p.images[0]);
    if (prodWithImage && prodWithImage.images[0]) {
      return prodWithImage.images[0];
    }

    // 2. Keyword fallback (if admin created a category before adding product photos)
    const catObj = categories.find(c => c.id === selectedCategory || c.slug === selectedCategory);
    const catKey = (catObj?.name || catObj?.slug || selectedCategory).toLowerCase();

    if (catKey.includes('water')) {
      return '/images/products/am-water-jar-20l.jpg';
    }
    if (catKey.includes('icecream') || catKey.includes('ice cream')) {
      return '/images/products/am-icecream-tub.jpg';
    }
    if (
      catKey.includes('dairy') ||
      catKey.includes('milk') ||
      catKey.includes('butter') ||
      catKey.includes('cheese')
    ) {
      return '/images/products/am-fresh-milk-dairy.jpg';
    }

    return '/images/am-warehouse-depot.jpg';
  }, [selectedCategory, products, categories]);

  // Selected Category Info for Header Title & Description
  const activeCategoryObj = categories.find(
    c => c.id === selectedCategory || c.slug === selectedCategory
  );
  const heroTitle = activeCategoryObj
    ? activeCategoryObj.name
    : 'Mineral Water, Ice Cream & Dairy Products';
  const heroDesc =
    activeCategoryObj?.description ||
    'Wholesale depot distribution covering packaged 20L water cans, retail bottle cases, commercial ice cream bulk tubs, and daily farm-fresh dairy supplies.';

  // Category Icon Helper
  const getCategoryIcon = (catName: string, catSlug: string) => {
    const key = (catName + ' ' + catSlug).toLowerCase();
    if (key.includes('water')) return <Droplets className="w-3.5 h-3.5 text-blue-500" />;
    if (key.includes('icecream') || key.includes('ice cream')) return <IceCream className="w-3.5 h-3.5 text-cyan-500" />;
    if (key.includes('dairy') || key.includes('milk') || key.includes('butter') || key.includes('cheese')) {
      return <Milk className="w-3.5 h-3.5 text-emerald-500" />;
    }
    return <Package className="w-3.5 h-3.5 text-teal-500" />;
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* Header with Dynamic Category Background Image */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-16 sm:py-24 border-b border-slate-800 transition-all duration-700 ease-in-out">
        {/* Dynamic Category Background Image with Crisp Clear Visibility */}
        <div className="absolute inset-0">
          <img
            key={currentBgImage}
            src={currentBgImage}
            alt={heroTitle}
            className="w-full h-full object-cover object-center opacity-80 filter brightness-90 contrast-110 scale-100 transition-all duration-700 ease-out animate-in fade-in"
          />
          {/* Subtle vignette gradient: leaves center clear to show the product clearly while keeping text readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-transparent to-slate-950/75" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 text-teal-300 text-xs font-bold border border-teal-500/50 backdrop-blur-md shadow-md">
            <Truck className="w-3.5 h-3.5 text-teal-400" />
            <span>Wholesale Supply Catalog • A.M. Distributors Chiplun</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
            {heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-100 max-w-2xl mx-auto leading-relaxed font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {heroDesc}
          </p>
        </div>
      </section>

      {/* Catalog Grid & Dynamic Category Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {/* All Products Tab */}
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Products ({products.length})
          </button>

          {/* Dynamic Categories (including any added by admin in Firestore) */}
          {categories.map(cat => {
            const count = products.filter(
              p => p.categoryId === cat.id || p.categoryId.toLowerCase().includes(cat.id.toLowerCase())
            ).length;
            const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {getCategoryIcon(cat.name, cat.slug)}
                <span>{cat.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Products Found in this Category</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              New wholesale inventory is regularly added by our depot managers. Check back shortly or view all items.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              View All Products
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
