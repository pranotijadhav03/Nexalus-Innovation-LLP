import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { CheckoutModal } from './CheckoutModal';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Truck
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const formatPrice = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const handleStartCheckout = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          onClick={closeCart}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        />

        {/* Sliding Panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Your Cart</h3>
                  <p className="text-xs text-slate-500">{cartCount} {cartCount === 1 ? 'item' : 'items'} selected</p>
                </div>
              </div>

              <button
                onClick={closeCart}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 opacity-60" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Your Cart is Empty</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Browse our high-performance CCTV cameras, optical fiber, and network equipment to add items.
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                cartItems.map(item => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3"
                  >
                    <img
                      src={item.product.images?.[0] || '/images/products/cp-bullet.jpg'}
                      alt={item.product.name}
                      className="w-14 h-14 object-contain rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate" title={item.product.name}>
                        {item.product.name}
                      </h4>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Model: {item.product.modelNumber}
                      </div>
                      <div className="font-extrabold text-blue-700 text-xs mt-1">
                        {formatPrice(item.product.price || 0)}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-800">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Estimated Tax (GST):</span>
                    <span className="font-semibold text-slate-800">Included (18%)</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery Charges:</span>
                    <span className="font-bold text-emerald-600">FREE Express Dispatch</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm">
                    <span className="font-extrabold text-slate-900">Total Payable:</span>
                    <span className="font-black text-xl text-blue-700">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <div className="pt-1 space-y-2">
                  <button
                    onClick={handleStartCheckout}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <button
                      onClick={clearCart}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      Clear All
                    </button>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-blue-600" />
                      Sangli &amp; Chiplun Dispatch
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal when proceeding from Cart */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderSuccess={() => {
          clearCart();
          closeCart();
        }}
      />
    </>
  );
};
