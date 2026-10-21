import React, { useState } from 'react';
import { Product } from '../../types';
import { Modal } from '../common/Modal';
import { BrandBadge } from '../common/BrandBadge';
import {
  CheckCircle2,
  Phone,
  FileText,
  ShieldCheck,
  Truck,
  Layers,
  Sparkles,
  Camera
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuote: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenQuote
}) => {
  if (!product) return null;

  const isAm = product.brandId === 'am-distributors';
  const defaultFallback = isAm
    ? '/images/projects/am-distributors-chiplun.jpg'
    : '/images/products/cp-bullet.jpg';

  const [selectedImg, setSelectedImg] = useState<string>(
    product.images?.[0] || defaultFallback
  );
  const [imgError, setImgError] = useState(false);

  // Sync selected image when product changes
  React.useEffect(() => {
    setSelectedImg(product.images?.[0] || defaultFallback);
    setImgError(false);
  }, [product, defaultFallback]);

  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for Pricing';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Nexalus Innovations, I would like to purchase / order this product:\n\n` +
    `*Product:* ${product.name}\n` +
    `*Model Number:* ${product.modelNumber}\n` +
    `*Category:* ${product.categoryName}\n` +
    `*Price:* ${formatPrice(product.price)}\n\n` +
    `Please share stock availability, delivery schedule, and payment details.`
  );

  const specList = Object.entries(product.specifications || {});

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`Model: ${product.modelNumber} • ${product.categoryName}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top Product Showcase (Image + Quick Summary) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left: Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-4/3 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
              {imgError ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-100">
                  <Camera className="w-12 h-12 text-slate-400 mb-2" />
                  <span className="text-xs font-mono text-slate-500">{product.modelNumber}</span>
                </div>
              ) : (
                <img
                  src={selectedImg}
                  alt={product.name}
                  onError={() => {
                    if (selectedImg !== defaultFallback) {
                      setSelectedImg(defaultFallback);
                    } else {
                      setImgError(true);
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Thumbnail selector if multiple images */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedImg(img);
                      setImgError(false);
                    }}
                    className={`w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                      selectedImg === img ? 'border-blue-600 scale-105 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Price & Key Purchase Info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <BrandBadge brandId={product.brandId} />
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <Layers className="w-3 h-3" />
                {product.categoryName}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                {product.availability === 'in_stock' ? 'In Stock • Ready to Dispatch' : 'Available on Order'}
              </span>
            </div>

            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Catalog Model: {product.modelNumber}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 leading-snug">
                {product.name}
              </h2>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Price / Estimated Rate:
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                {formatPrice(product.price)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Inclusive of GST • Official B2B Tax Invoice &amp; Warranty provided
              </p>
            </div>

            {/* WHERE & HOW CUSTOMER PURCHASES THIS PRODUCT */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Where &amp; How to Purchase:
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct purchasing is available via WhatsApp order desk, official GST Quotation proposal, or telephone support.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* 1. Instant WhatsApp Purchase */}
                <a
                  href={`https://wa.me/919158886444?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Order on WhatsApp</span>
                </a>

                {/* 2. Official Proposal & Quote Form */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenQuote(product);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Request Quote &amp; PO</span>
                </button>
              </div>

              {/* Call Hotline */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  Direct Call: <a href="tel:+919158886444" className="text-white font-bold hover:underline">+91 9158886444</a>
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  Sangli &amp; Chiplun Dispatch
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Product Overview &amp; Scope
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>
        </div>

        {/* Complete Technical Specifications Table */}
        {specList.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Complete Technical Specifications</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {specList.length} parameters
              </span>
            </h3>

            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <tbody>
                  {specList.map(([key, val], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}
                    >
                      <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3 border-b border-slate-100">
                        {key}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 border-b border-slate-100">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
