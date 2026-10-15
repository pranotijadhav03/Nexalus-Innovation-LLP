import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { Button } from '../../../components/common/Button';
import { QuoteModal } from '../../../components/common/QuoteModal';
import { WhatsAppShareModal } from '../../../components/common/WhatsAppShareModal';
import { getProductBySlug } from '../../../firebase/services';
import { Product } from '../../../types';
import { Shield, Sparkles, CheckCircle2, ArrowLeft, Send, MessageCircle } from 'lucide-react';

export const CpPlusProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (slug) {
        const prod = await getProductBySlug(slug);
        if (prod) {
          setProduct(prod);
          setSelectedImage(prod.images[0] || '');
        }
      }
      setIsLoading(false);
    }
    load();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm">
        Loading product specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 max-w-lg mx-auto text-center px-4 space-y-4">
        <Shield className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested surveillance equipment model is unavailable or has been archived.
        </p>
        <Link to="/brands/cp-plus/products">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to CP PLUS Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <BrandHeader
        brandId="cp-plus"
        title={product.name}
        subtitle={`Model Number: ${product.modelNumber} — Category: ${product.categoryName}`}
        breadcrumbs={[
          { label: 'Products', path: '/brands/cp-plus/products' },
          { label: product.modelNumber }
        ]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
          {/* Gallery View */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={selectedImage || '/images/products/cp-v34g.jpg'}
                alt={product.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== '/images/products/cp-v34g.jpg') {
                    target.src = '/images/products/cp-v34g.jpg';
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img ? 'border-sky-600 scale-102' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <img
                      src={img}
                      alt="Thumbnail"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== '/images/products/cp-v34g.jpg') {
                          target.src = '/images/products/cp-v34g.jpg';
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Specs */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                  {product.categoryName}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  SKU: {product.modelNumber}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                    product.availability === 'in_stock'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {product.availability === 'in_stock' ? 'In Stock / Ready for Installation' : 'Available on Order'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                {product.name}
              </h1>

              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                {product.description}
              </p>

              {/* Price Display */}
              <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Official Pricing / Installation
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">
                    {product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'Custom Quotation Only'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    *Excludes GST, structured cabling, and onsite mounting accessories
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsWhatsAppOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Share Draft on WhatsApp
                  </button>
                  <Button
                    variant="sky"
                    size="md"
                    onClick={() => setIsQuoteOpen(true)}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Request Official Quote
                  </Button>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Technical Specifications
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {Object.entries(product.specifications || {}).map(([param, val]) => (
                    <div key={param} className="grid grid-cols-1 sm:grid-cols-3 p-3 text-xs">
                      <span className="font-semibold text-slate-600 sm:col-span-1">{param}</span>
                      <span className="text-slate-900 sm:col-span-2 font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/brands/cp-plus/products"
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to All Products
              </Link>
              <span className="text-xs text-slate-400">
                Authorized Distribution by Nexalus Innovations LLP
              </span>
            </div>
          </div>
        </div>
      </section>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="cp-plus"
        itemName={`${product.name} (${product.modelNumber})`}
        itemType="product"
      />

      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        product={product}
      />
    </div>
  );
};
