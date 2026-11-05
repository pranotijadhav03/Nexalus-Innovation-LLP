import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  FileText,
  MapPin,
  Calendar,
  CreditCard,
  Building2,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Loader2,
  Lock,
  UserPlus,
  LogIn,
  AlertCircle,
  Wifi,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  Truck,
  Package,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { submitPlanOrder, clearPlanCart } from '../../firebase/services';
import { PlanOrder, BrandId, CartPlanItem } from '../../types';
import { Button } from './Button';
import { DocumentViewerModal } from './DocumentViewerModal';

export interface PlanOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: {
    planId?: string;
    planName: string;
    providerName: string;
    speed: string;
    price: number | string;
    billingPeriod?: string;
    brandId?: BrandId | 'one-broadband' | 'nexalus-innovations';
    companyId?: string;
    quantity?: number;
    unitPrice?: number;
  } | null;
  items?: CartPlanItem[]; // Multi-item cart checkout!
  companyId?: string;
  onOrderSuccess?: (orderId: string) => void;
}

export const PlanOrderModal: React.FC<PlanOrderModalProps> = ({
  isOpen,
  onClose,
  plan,
  items,
  companyId,
  onOrderSuccess
}) => {
  const { currentUser, isCustomer } = useAuth();
  const isCustomerLoggedIn = isCustomer && currentUser?.role === 'customer';
  const { success, error } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PlanOrder['paymentMethod']>('pay_on_installation');
  const [notes, setNotes] = useState('');
  const [orderQty, setOrderQty] = useState(1);

  // Multi-item cart local state
  const [cartItemsState, setCartItemsState] = useState<CartPlanItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PlanOrder | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Determine active company identity
  const isMultiItem = Boolean(items && items.length > 0);
  const effectiveCompanyId =
    companyId ||
    (items && items[0]?.companyId) ||
    plan?.companyId ||
    (plan?.brandId === 'am-distributors'
      ? 'am-distributors'
      : plan?.brandId === 'nexalus-innovations'
      ? 'nexalus-innovations'
      : 'nexalus-llp');

  const isAm = effectiveCompanyId === 'am-distributors' || effectiveCompanyId === 'am';
  const isNi = effectiveCompanyId === 'nexalus-innovations';

  // Set default slot according to company
  useEffect(() => {
    if (isAm) {
      setPreferredSlot('Daily 4:00 AM Morning Dispatch');
    } else if (isNi) {
      setPreferredSlot('Next Working Day Site Delivery & Inspection');
    } else {
      setPreferredSlot('Immediate / Next Working Day');
    }
  }, [isAm, isNi]);

  // Sync items when modal opens
  useEffect(() => {
    if (isOpen) {
      if (items && items.length > 0) {
        setCartItemsState(items.map(it => ({ ...it, quantity: it.quantity || 1 })));
      } else if (plan) {
        setOrderQty(Math.max(1, (plan as any)?.quantity || 1));
      }
    }
  }, [isOpen, items, plan]);

  // Price calculations
  const rawPrice = typeof plan?.price === 'number' ? plan.price : parseFloat(String(plan?.price)) || 0;
  const unitPrice =
    typeof (plan as any)?.unitPrice === 'number' && (plan as any).unitPrice > 0
      ? (plan as any).unitPrice
      : (plan as any)?.quantity && (plan as any).quantity > 1
      ? rawPrice / (plan as any).quantity
      : rawPrice;

  const multiTotal = cartItemsState.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );
  const singleTotal = unitPrice * orderQty;
  const grandTotal = isMultiItem ? multiTotal : singleTotal;

  // Auto-close and redirect to Customer Login if accessed without Customer session
  useEffect(() => {
    if (isOpen && !isCustomerLoggedIn) {
      onClose();
      try {
        if (plan) {
          sessionStorage.setItem('nexalus_pending_order_plan', JSON.stringify(plan));
        }
      } catch {}
      window.dispatchEvent(
        new CustomEvent('open_customer_portal', {
          detail: {
            view: 'choice',
            context: 'buy_now',
            prompt: isAm
              ? 'Please log in to your wholesale partner account to place your depot order.'
              : isNi
              ? 'Please log in to your account to procure commercial IT hardware.'
              : 'Please register or log in to complete your broadband order.'
          }
        })
      );
    }
  }, [isOpen, isCustomerLoggedIn, plan, isAm, isNi, onClose]);

  // Pre-fill user profile
  useEffect(() => {
    if (isCustomerLoggedIn && currentUser) {
      if (currentUser.displayName) setCustomerName(currentUser.displayName);
      if (currentUser.phone) setPhone(currentUser.phone.replace(/\D/g, '').slice(0, 10));
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.deliveryAddress) {
        if (currentUser.deliveryAddress.address) setAddress(currentUser.deliveryAddress.address);
        if (currentUser.deliveryAddress.city) setCity(currentUser.deliveryAddress.city);
        if (currentUser.deliveryAddress.postcode)
          setPincode(currentUser.deliveryAddress.postcode.replace(/\D/g, '').slice(0, 6));
      }
    }
  }, [currentUser, isCustomerLoggedIn, isOpen]);

  // Reset state on open if guest
  useEffect(() => {
    if (isOpen) {
      setCompletedOrder(null);
      if (!currentUser) {
        setCustomerName('');
        setPhone('');
        setEmail('');
        setAddress('');
        setCity('');
        setPincode('');
        setNotes('');
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen || (!plan && (!items || items.length === 0))) return null;

  const updateCartItemQty = (index: number, delta: number) => {
    setCartItemsState(prev => {
      const copy = [...prev];
      const cur = copy[index];
      if (!cur) return prev;
      const nextQty = Math.max(1, (cur.quantity || 1) + delta);
      copy[index] = { ...cur, quantity: nextQty };
      return copy;
    });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCustomerLoggedIn) {
      error('Login Required', 'Please register or log in to complete your order.');
      onClose();
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const cleanPin = pincode.replace(/\D/g, '');

    if (!customerName.trim()) {
      error('Validation Error', 'Please enter your full name or registered business name.');
      return;
    }

    if (cleanPhone.length !== 10) {
      error('Validation Error', 'Mobile number must be exactly 10 digits.');
      return;
    }

    if (!address.trim() || !city.trim()) {
      error('Validation Error', 'Please provide complete delivery / installation address and city.');
      return;
    }

    const emailToSave = email.trim() ? email.trim().toLowerCase() : `${cleanPhone}@customer.nexalus.com`;
    const pinToSave = cleanPin || (isAm ? '415605' : '416415');

    setIsSubmitting(true);
    try {
      const effectivePlanId = isMultiItem
        ? cartItemsState[0].planId
        : plan?.planId || 'prod-custom';

      const effectivePlanName = isMultiItem
        ? cartItemsState.length === 1
          ? cartItemsState[0].planName
          : `${cartItemsState[0].planName} (+${cartItemsState.length - 1} more)`
        : plan?.planName || 'Selected Item';

      const effectiveProviderName = isMultiItem
        ? cartItemsState[0].providerName || (isAm ? 'A.M. Distributors' : isNi ? 'Nexalus Innovations' : 'Nexalus Innovations LLP')
        : plan?.providerName || (isAm ? 'A.M. Distributors' : isNi ? 'Nexalus Innovations' : 'Nexalus Innovations LLP');

      const totalQuantity = isMultiItem
        ? cartItemsState.reduce((sum, it) => sum + (it.quantity || 1), 0)
        : orderQty;

      const orderItemsSnapshot = isMultiItem
        ? cartItemsState.map(it => ({
            planId: it.planId,
            planName: it.planName,
            providerName: it.providerName,
            quantity: it.quantity || 1,
            unitPrice: Number(it.price) || 0,
            totalPrice: (Number(it.price) || 0) * (it.quantity || 1)
          }))
        : [
            {
              planId: plan?.planId || '',
              planName: plan?.planName || '',
              providerName: plan?.providerName || '',
              quantity: orderQty,
              unitPrice: unitPrice,
              totalPrice: singleTotal
            }
          ];

      const res = await submitPlanOrder({
        authUid: currentUser?.uid,
        planId: effectivePlanId,
        planName: effectivePlanName,
        providerName: effectiveProviderName,
        speed: isMultiItem
          ? `${cartItemsState.length} product(s) wholesale procurement`
          : plan?.speed || 'Standard',
        price: grandTotal,
        quantity: totalQuantity,
        unitPrice: isMultiItem ? Number(grandTotal) / Math.max(1, totalQuantity) : unitPrice,
        billingPeriod: plan?.billingPeriod || 'order',
        brandId: (isAm ? 'am-distributors' : isNi ? 'nexalus-innovations' : 'nexalus') as any,
        companyId: (isAm ? 'am-distributors' : isNi ? 'nexalus-innovations' : 'nexalus-llp') as any,
        customerName: customerName.trim(),
        phone: cleanPhone,
        email: emailToSave,
        address: address.trim(),
        city: city.trim(),
        pincode: pinToSave,
        preferredSlot,
        paymentMethod,
        paymentStatus: 'pending',
        notes: notes.trim(),
        items: orderItemsSnapshot as any,
        planSnapshot: {
          id: effectivePlanId || 'prod-custom',
          name: effectivePlanName,
          providerId: isAm ? 'am-distributors' : isNi ? 'nexalus-innovations' : 'nexalus',
          providerName: effectiveProviderName,
          speed: isMultiItem ? `${cartItemsState.length} Items` : plan?.speed || 'Standard',
          price: grandTotal,
          currency: 'INR',
          billingPeriod: 'order'
        }
      });

      if (res.success) {
        setCompletedOrder(res.order);
        // Clear this company's cart items on successful order
        clearPlanCart(effectiveCompanyId, currentUser?.uid);
        success('Order Confirmed!', `Order #${res.id} placed successfully.`);
        if (onOrderSuccess) onOrderSuccess(res.id);
      } else {
        error('Order Error', 'Could not record order. Please try again.');
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to submit order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 md:p-6 flex min-h-full items-start sm:items-center justify-center py-6 sm:py-10 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-2xl rounded-[28px] shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3.5rem)] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Scoped by Company */}
        <div
          className={`px-6 py-5 text-white flex items-center justify-between border-b relative shrink-0 z-20 ${
            isAm
              ? 'bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-950 border-teal-800/40'
              : isNi
              ? 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-indigo-800/40'
              : 'bg-gradient-to-r from-slate-950 via-[#0a1633] to-slate-950 border-blue-900/40'
          }`}
        >
          <div
            className={`absolute top-0 left-0 right-0 h-[2.5px] ${
              isAm
                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
                : isNi
                ? 'bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-500'
                : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500'
            }`}
          />
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner border ${
                isAm
                  ? 'bg-teal-500/15 border-teal-400/30 text-teal-300'
                  : isNi
                  ? 'bg-indigo-500/15 border-indigo-400/30 text-indigo-300'
                  : 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300'
              }`}
            >
              {isAm ? (
                <Truck className="w-5 h-5 text-teal-300" />
              ) : isNi ? (
                <ShieldCheck className="w-5 h-5 text-indigo-300" />
              ) : (
                <Zap className="w-5 h-5 text-cyan-300" />
              )}
            </div>
            <div>
              <div
                className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                  isAm ? 'text-teal-300' : isNi ? 'text-indigo-300' : 'text-cyan-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {isAm
                    ? 'B2B Wholesale Cold-Chain Dispatch'
                    : isNi
                    ? 'Enterprise Hardware Procurement'
                    : 'Official Broadband Provisioning'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight mt-0.5">
                {completedOrder
                  ? 'Order Confirmed'
                  : isAm
                  ? 'Wholesale Order & Delivery Checkout'
                  : isNi
                  ? 'Hardware Procurement & Checkout'
                  : 'Instant Plan Booking & Checkout'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ORDER SUCCESS VIEW */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto flex-1 overscroll-contain">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Order Received
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {isAm
                  ? 'Wholesale Dispatch Order Placed!'
                  : isNi
                  ? 'Hardware Order Confirmed!'
                  : 'Plan Order Received!'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{completedOrder.customerName}</strong>. Your order has been recorded in our system and dispatched to operations.
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between border-b border-slate-200/80 pb-2 font-bold text-slate-900">
                <span>Order ID:</span>
                <span className="font-mono text-indigo-700">{completedOrder.id}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Amount:</span>
                <span className="font-extrabold text-slate-900">₹{completedOrder.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Items / Qty:</span>
                <span className="font-semibold text-slate-800">{completedOrder.quantity || 1} units</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery City:</span>
                <span className="font-semibold text-slate-800">
                  {completedOrder.city} ({completedOrder.pincode})
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Scheduled Route / Slot:</span>
                <span className="font-semibold text-slate-800">{completedOrder.preferredSlot}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDocModalOpen(true)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer ${
                  isAm
                    ? 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/25'
                    : isNi
                    ? 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-700/25'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isAm ? 'View & Download Delivery Challan' : 'View & Download Official Receipt'}</span>
              </button>
              <Button variant="outline" size="md" onClick={onClose} className="w-full sm:w-auto">
                Close Window
              </Button>
            </div>
          </div>
        ) : (
          /* MODERN ORDER CHECKOUT FORM */
          <form onSubmit={handleSubmitOrder} noValidate className="p-5 sm:p-7 space-y-4 overflow-y-auto flex-1 overscroll-contain">
            {/* Multi-Item or Single Item Summary Header */}
            {isMultiItem ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Wholesale Cart Items ({cartItemsState.length} distinct products)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Total Qty: <strong className="text-slate-900">{cartItemsState.reduce((sum, it) => sum + (it.quantity || 1), 0)}</strong>
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-slate-50/90 rounded-2xl border border-slate-200 divide-y divide-slate-100">
                  {cartItemsState.map((it, idx) => {
                    const price = Number(it.price) || 0;
                    const qty = Number(it.quantity) || 1;
                    const subtotal = price * qty;
                    return (
                      <div key={it.id || idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <h5 className="font-extrabold text-slate-900 truncate">{it.planName}</h5>
                          <p className="text-[11px] text-slate-500">
                            ₹{price.toLocaleString('en-IN')} each {it.providerName ? `• ${it.providerName}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="flex items-center rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateCartItemQty(idx, -1)}
                              className="w-5 h-5 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-black text-xs text-slate-900">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartItemQty(idx, 1)}
                              className="w-5 h-5 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-black text-slate-900 min-w-16 text-right">
                            ₹{subtotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grand Total Row */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">Total Order Value</span>
                    <span className="text-xs text-slate-400">All wholesale supplies &amp; items included</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ) : plan ? (
              /* Single Plan/Product Summary Card */
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs">
                    <span>{plan.providerName}</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                    {plan.planName}
                  </h4>
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{plan.speed}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/80 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Qty:</span>
                    <div className="flex items-center rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setOrderQty(prev => Math.max(1, prev - 1))}
                        className="w-6 h-6 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-black text-xs text-slate-900">{orderQty}</span>
                      <button
                        type="button"
                        onClick={() => setOrderQty(prev => prev + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </div>
                    {orderQty > 1 && (
                      <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                        (₹{unitPrice.toLocaleString('en-IN')} × {orderQty})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Customer Inputs */}
            <div className="space-y-3 pt-1">
              {/* Row 1: Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isAm ? 'Partner / Business Name' : 'Your Full Name'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={isAm ? 'e.g. Sanket Lohar / Hotel Sagar' : 'e.g. Anand Shinde'}
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Mobile / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        phone.length === 10
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : phone.length > 0
                          ? 'text-amber-700 bg-amber-50 border border-amber-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {phone.length === 10 ? '✓ 10 digits valid' : `${phone.length}/10 digits`}
                    </span>
                  </div>
                  <div className="relative">
                    <Phone
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                        phone.length === 10 ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={e => {
                        let digits = e.target.value.replace(/\D/g, '');
                        if (digits.length === 12 && digits.startsWith('91')) {
                          digits = digits.slice(2);
                        } else if (digits.length === 11 && digits.startsWith('0')) {
                          digits = digits.slice(1);
                        }
                        setPhone(digits.slice(0, 10));
                      }}
                      maxLength={10}
                      required
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-900 shadow-2xs ${
                        phone.length === 10
                          ? 'border-emerald-500 bg-emerald-50/20 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white'
                          : phone.length > 0
                          ? 'border-amber-400 bg-amber-50/20 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white'
                          : 'border-slate-200 bg-slate-50/90 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900 shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 3: Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isAm ? 'Delivery / Depot Dispatch Address' : isNi ? 'Site / Installation Address' : 'Installation Address / Flat / Building'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    placeholder={
                      isAm
                        ? 'Shop / Hotel / Commercial unit, Road, Landmark'
                        : 'Flat / Office / Floor No., Building Name, Street'
                    }
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900 shadow-2xs resize-none"
                  />
                </div>
              </div>

              {/* Row 4: City and PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City / Town <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={isAm ? 'e.g. Chiplun' : 'e.g. Sangli'}
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-900 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    PIN Code <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={isAm ? 'e.g. 415605' : 'e.g. 416415'}
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-mono font-medium text-slate-900 shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 5: Slot & Payment Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {isAm ? 'Preferred Dispatch Slot' : 'Preferred Setup Slot'}
                  </label>
                  <select
                    value={preferredSlot}
                    onChange={e => setPreferredSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-800 shadow-2xs cursor-pointer"
                  >
                    {isAm ? (
                      <>
                        <option value="Daily 4:00 AM Morning Dispatch">Daily 4:00 AM Morning Dispatch</option>
                        <option value="1:00 PM Afternoon Route">1:00 PM Afternoon Route</option>
                        <option value="Immediate Direct Depot Dispatch">Immediate Direct Depot Dispatch</option>
                      </>
                    ) : isNi ? (
                      <>
                        <option value="Next Working Day Site Delivery & Inspection">Next Working Day Site Delivery</option>
                        <option value="Immediate Priority Dispatch">Immediate Priority Dispatch</option>
                        <option value="Scheduled Enterprise AMC Deployment">Scheduled Enterprise AMC Deployment</option>
                      </>
                    ) : (
                      <>
                        <option value="Immediate / Next Working Day">Immediate / Next Working Day</option>
                        <option value="Weekend Priority Installation">Weekend Priority Installation</option>
                        <option value="Within 3 Working Days">Within 3 Working Days</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Preference
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-800 shadow-2xs cursor-pointer"
                  >
                    {isAm ? (
                      <>
                        <option value="cash_on_installation">Cash on Delivery (COD) / Depot Handover</option>
                        <option value="corporate_invoice">B2B Delivery Challan (Trade Credit)</option>
                        <option value="online_upi">UPI / Online QR on Delivery</option>
                      </>
                    ) : isNi ? (
                      <>
                        <option value="pay_on_installation">Pay on Delivery &amp; Physical Testing</option>
                        <option value="corporate_invoice">GST Tax Invoice (Corporate Billing)</option>
                        <option value="online_upi">UPI / Bank Transfer (RTGS / NEFT)</option>
                      </>
                    ) : (
                      <>
                        <option value="pay_on_installation">Pay on Installation (Tested)</option>
                        <option value="online_upi">UPI / Online QR on Setup</option>
                        <option value="corporate_invoice">Corporate / GST Invoicing</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Modern Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3.5">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isAm
                    ? 'FSSAI & GST Compliant Depot • Verified Cold-Chain Dispatch'
                    : isNi
                    ? 'OEM Certified Hardware • Installation Support Included'
                    : 'Zero Advance Risk • Pay After Optical Feasibility'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto py-3 px-6 rounded-xl active:scale-98 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  isAm
                    ? 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/30'
                    : isNi
                    ? 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-700/30'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300/30" />
                    <span>Confirm &amp; Place Order</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <DocumentViewerModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        order={completedOrder}
        documentType={completedOrder?.paymentStatus === 'paid' ? 'paid_receipt' : 'booking_slip'}
      />
    </div>
  );
};
