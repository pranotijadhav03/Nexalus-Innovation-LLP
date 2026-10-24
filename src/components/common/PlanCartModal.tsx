import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingCart,
  Trash2,
  Zap,
  ShoppingBag,
  ArrowRight,
  Wifi,
  Sparkles,
  Lock
} from 'lucide-react';
import {
  getPlanCart,
  removeFromPlanCart,
  clearPlanCart
} from '../../firebase/services';
import { CartPlanItem } from '../../types';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export interface PlanCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToOrder: (plan: {
    planId?: string;
    planName: string;
    providerName: string;
    speed: string;
    price: number | string;
    billingPeriod?: string;
    brandId?: any;
  }) => void;
}

const getProviderBadge = (providerName: string) => {
  const p = (providerName || '').toLowerCase();
  if (p.includes('airtel')) {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }
  if (p.includes('bsnl')) {
    return 'bg-sky-50 text-sky-700 border-sky-200';
  }
  if (p.includes('railwire')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  if (p.includes('one')) {
    return 'bg-teal-50 text-teal-700 border-teal-200';
  }
  return 'bg-blue-50 text-blue-700 border-blue-200';
};

export const PlanCartModal: React.FC<PlanCartModalProps> = ({
  isOpen,
  onClose,
  onProceedToOrder
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { info } = useToast();
  const [cartItems, setCartItems] = useState<CartPlanItem[]>(() => {
    try {
      return getPlanCart();
    } catch {
      return [];
    }
  });

  // Sync cart items with localStorage and events
  useEffect(() => {
    const refreshCart = (e?: any) => {
      const items = e?.detail || getPlanCart();
      setCartItems(Array.isArray(items) ? items : []);
    };

    if (isOpen) {
      refreshCart();
    }

    window.addEventListener('nexalus_plan_cart_updated', refreshCart);
    window.addEventListener('storage', refreshCart);

    return () => {
      window.removeEventListener('nexalus_plan_cart_updated', refreshCart);
      window.removeEventListener('storage', refreshCart);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckoutItem = (item: CartPlanItem) => {
    if (!isAuthenticated) {
      onClose();
      try {
        sessionStorage.setItem('nexalus_pending_order_plan', JSON.stringify({
          planId: item.planId,
          planName: item.planName,
          providerName: item.providerName,
          speed: item.speed,
          price: item.price,
          billingPeriod: item.billingPeriod,
          brandId: item.brandId
        }));
      } catch {}

      info(
        'Registration & Login Required',
        'Direct Buy Now is not permitted. Please register and log in first to purchase this plan.'
      );

      window.dispatchEvent(
        new CustomEvent('open_customer_portal', {
          detail: {
            view: 'choice',
            context: 'cart_checkout',
            prompt: `Direct Buy Now is restricted. Please register your customer account, or log in if you already have an account, to purchase ${item.providerName} - ${item.planName}. Once logged in, Buy Now is activated immediately.`
          }
        })
      );
      return;
    }

    onClose();
    onProceedToOrder({
      planId: item.planId,
      planName: item.planName,
      providerName: item.providerName,
      speed: item.speed,
      price: item.price,
      billingPeriod: item.billingPeriod,
      brandId: item.brandId
    });
  };

  const handleBrowsePlans = () => {
    onClose();
    navigate('/plans');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-950 via-[#0b1739] to-slate-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-blue-500" />

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-400/30 text-orange-400 flex items-center justify-center shadow-inner shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                  Broadband Cart
                </h3>
                {cartItems.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    {cartItems.length} {cartItems.length === 1 ? 'Plan' : 'Plans'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {cartItems.length > 0
                  ? 'Review selected fiber plans and proceed to checkout'
                  : 'Your cart is currently empty'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-slate-700/60"
            title="Close Cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-3 bg-slate-50/40">
          {cartItems.length === 0 ? (
            <div className="py-12 px-6 text-center text-slate-500 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner border border-slate-200">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <p className="text-base font-bold text-slate-900">Your Broadband Cart is Empty</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Browse high-speed fiber broadband plans and click &ldquo;Add to Cart&rdquo; to save them here.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleBrowsePlans}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Browse Broadband Plans
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-blue-400/80 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getProviderBadge(item.providerName)}`}>
                        {item.providerName || 'Broadband'}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 truncate group-hover:text-blue-900 transition-colors">
                        {item.planName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <span className="font-extrabold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/50 flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-blue-600" />
                        {item.speed}
                      </span>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="font-black text-slate-900 text-sm">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">
                          /{item.billingPeriod || 'mo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => handleCheckoutItem(item)}
                        className="py-2 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all group/btn"
                        title="Proceed to Buy this Plan"
                      >
                        <span>Buy Now</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCheckoutItem(item)}
                        className="py-2 px-3.5 sm:px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-slate-900/20 transition-all group/btn"
                        title="Register and log in first to Buy Now"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Login to Buy</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFromPlanCart(item.id)}
                      className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200/60 transition-colors cursor-pointer"
                      title="Remove from Cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modern Modal Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={clearPlanCart}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1.5 group"
              title="Clear all plans from cart"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
              <span>Clear Cart</span>
            </button>

            <button
              type="button"
              onClick={handleBrowsePlans}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Add More Plans</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
