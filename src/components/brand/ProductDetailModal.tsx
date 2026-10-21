import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { Modal } from '../common/Modal';
import { BrandBadge } from '../common/BrandBadge';
import { useCart } from '../../context/CartContext';
import { CheckoutModal } from '../common/CheckoutModal';
import {
  CheckCircle2,
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  Check,
  Camera,
  Package
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuote?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  if (!product) return null;

  const { addToCart, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const isAm = product.brandId === 'am-distributors';
  const defaultFallback = isAm
    ? '/images/projects/am-distributors-chiplun.jpg'
    : '/images/products/cp-bullet.jpg';

  const [selectedImg, setSelectedImg] = useState<string>(
    product.images?.[0] || defaultFallback
  );
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setSelectedImg(product.images?.[0] || defaultFallback);
    setImgError(false);
    setQuantity(1);
  }, [product, defaultFallback]);

  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for Pricing';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
    openCart();
  };

  const handleBuyNow = () => {
    setIsCheckoutOpen(true);
  };

  const specList = Object.entries(product.specifications || {});
  const keySpecs = specList.slice(0, 3);

  return (
    <>
      <Modal
        isOpen={isOpen && !isCheckoutOpen}
        onClose={onClose}
        title={product.name}
        subtitle={`Model: ${product.modelNumber} • Category: ${product.categoryName}`}
        maxWidth="4xl"
      >
        <div className="space-y-6">
          {/* Main Top Grid (Image Left + Info & Actions Right) - Balanced 50/50 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
            {/* Left Column: Product Image & Trust Highlights */}
            <div className="space-y-3">
              <div className="relative aspect-4/3 bg-gradient-to-br from-slate-50 to-slate-100/70 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs flex items-center justify-center p-4">
                {imgError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-100 rounded-xl">
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
                    className="w-full h-full object-contain rounded-xl drop-shadow-sm"
                  />
                )}
              </div>

              {/* Thumbnails if multiple images */}
              {product.images && product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedImg(img);
                        setImgError(false);
                      }}
                      className={`w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all cursor-pointer bg-slate-50 ${
                        selectedImg === img ? 'border-blue-600 scale-105 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges under Image - Balanced Width */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-600">
                <div className="flex flex-col items-center gap-1 font-medium">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Free Dispatch</span>
                </div>
                <div className="flex flex-col items-center gap-1 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1-Yr Warranty</span>
                </div>
                <div className="flex flex-col items-center gap-1 font-medium">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>GST Tax Invoice</span>
                </div>
              </div>
            </div>

            {/* Right Column: Clean, Perfectly Proportioned Product Details & Buying Actions */}
            <div className="space-y-4 pt-1">
              {/* Badges in a single clean row */}
              <div className="flex flex-wrap items-center gap-2">
                <BrandBadge brandId={product.brandId} />
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  {product.availability === 'in_stock' ? 'In Stock • Ready to Dispatch' : 'Available on Order'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200">
                  <Package className="w-3 h-3 text-slate-400" />
                  {product.modelNumber}
                </span>
              </div>

              {/* Price Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/60 via-slate-50 to-indigo-50/40 border border-blue-100 shadow-2xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Special Commercial Price
                </div>
                <div className="flex items-baseline gap-2.5 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (Inclusive of all taxes &amp; GST)
                  </span>
                </div>
              </div>

              {/* Quick Specification Highlights (Adds substance to balance the image) */}
              {keySpecs.length > 0 && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-700">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Key Features:
                  </span>
                  {keySpecs.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">{k}:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[200px]">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selector + Subtotal in one balanced row */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Select Quantity:
                  </label>
                  <span className="text-xs text-slate-600">
                    Subtotal: <strong className="text-slate-900 font-black text-sm">{formatPrice((product.price || 0) * quantity)}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center bg-white rounded-xl border border-slate-300 shadow-2xs p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center font-bold text-slate-900 font-mono text-sm">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Unit Price: {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              {/* E-Commerce Buttons: Add to Cart + Buy Now */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-slate-900/15 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                {/* 2. Buy Now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Quick dispatch note */}
              <p className="text-[11px] text-slate-500 text-center pt-0.5">
                ⚡ Express delivery dispatched from Sangli &amp; Chiplun within 24 hours.
              </p>
            </div>
          </div>

          {/* Product Overview & Description (Clean full width box) */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Product Overview &amp; Information
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
              {product.description}
            </p>
          </div>

          {/* Complete Technical Specifications Table */}
          {specList.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
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

      {/* Checkout Modal when "Buy Now" is clicked */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          onClose();
        }}
        items={[{ product, quantity }]}
      />
    </>
  );
};
