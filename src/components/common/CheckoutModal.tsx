import React, { useState } from 'react';
import { Product } from '../../types';
import { Modal } from './Modal';
import { createOrder } from '../../firebase/services';
import { useToast } from '../../context/ToastContext';
import {
  CheckCircle2,
  Truck,
  ShieldCheck,
  CreditCard,
  Banknote,
  Building,
  ArrowRight,
  PackageCheck
} from 'lucide-react';

interface CheckoutItem {
  product: Product;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CheckoutItem[];
  onOrderSuccess?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess
}) => {
  const { success, error: toastError } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Sangli');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'bank_transfer'>('cod');
  const [orderNotes, setOrderNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{
    orderId: string;
    totalAmount: number;
    customerName: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    paymentMethod: string;
  } | null>(null);

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.product.price || 0) * item.quantity,
    0
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      toastError('Missing Fields', 'Please fill in your name, phone number, and delivery address.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toastError('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (pincode.replace(/\D/g, '').length !== 6) {
      toastError('Invalid PIN Code', 'Please enter a valid 6-digit PIN code.');
      return;
    }

    if (items.length === 0) {
      toastError('Cart Empty', 'Please select at least one product to purchase.');
      return;
    }

    setIsSubmitting(true);
    try {
      const primaryBrandId = items[0]?.product?.brandId || 'nexalus-innovations';

      const orderPayload = {
        brandId: primaryBrandId,
        items: items.map(i => ({
          productId: i.product.id,
          productName: i.product.name,
          modelNumber: i.product.modelNumber,
          price: i.product.price || 0,
          quantity: i.quantity,
          image: i.product.images?.[0],
          brandId: i.product.brandId || primaryBrandId
        })),
        totalAmount,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        paymentMethod,
        orderNotes: orderNotes.trim()
      };

      const res = await createOrder(orderPayload);
      if (res.success) {
        setPlacedOrder({
          orderId: res.orderId,
          totalAmount,
          customerName: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          paymentMethod
        });
        success('Order Confirmed!', `Your order #${res.orderId} has been successfully placed.`);
        if (onOrderSuccess) onOrderSuccess();
      }
    } catch (err: any) {
      toastError('Checkout Failed', err.message || 'Could not place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setPlacedOrder(null);
    onClose();
  };

  const formatPrice = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const whatsappConfirmationText = placedOrder
    ? encodeURIComponent(
        `Hello Nexalus Innovations, I have placed an online order!\n\n` +
        `*Order ID:* ${placedOrder.orderId}\n` +
        `*Customer Name:* ${placedOrder.customerName}\n` +
        `*Contact:* ${placedOrder.phone}\n` +
        `*Total Amount:* ${formatPrice(placedOrder.totalAmount)}\n` +
        `*Delivery Address:* ${placedOrder.address}, ${placedOrder.city} - ${placedOrder.pincode}\n` +
        `*Payment Method:* ${placedOrder.paymentMethod.toUpperCase()}\n\n` +
        `Please confirm dispatch status and delivery schedule.`
      )
    : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={placedOrder ? 'Order Placed Successfully!' : 'Complete Your Purchase'}
      subtitle={placedOrder ? `Confirmation #${placedOrder.orderId}` : 'Fast checkout • Direct dispatch across Maharashtra'}
      maxWidth="2xl"
    >
      {placedOrder ? (
        /* ORDER CONFIRMATION SCREEN */
        <div className="py-4 text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-emerald-100 text-emerald-600 shadow-md animate-bounce">
            <CheckCircle2 className="w-14 h-14" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              Order ID: #{placedOrder.orderId}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Thank You, {placedOrder.customerName}!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your order has been registered in our system and sent to our Sangli / Chiplun logistics desk.
            </p>
          </div>

          {/* Order Details Summary Box */}
          <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-3 max-w-md mx-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Total Amount Payable:</span>
              <span className="text-base font-extrabold text-slate-900">{formatPrice(placedOrder.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Payment Mode:</span>
              <span className="font-bold text-slate-800 uppercase">{placedOrder.paymentMethod}</span>
            </div>
            <div className="pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium block">Delivery Address:</span>
              <span className="font-semibold text-slate-800 block mt-0.5">
                {placedOrder.address}, {placedOrder.city} - {placedOrder.pincode}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Estimated Delivery:</span>
              <span className="font-bold text-emerald-700">2-4 Business Days (Express)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={`https://wa.me/919158886444?text=${whatsappConfirmationText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Get WhatsApp Updates</span>
            </a>

            <button
              onClick={handleModalClose}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        /* CHECKOUT FORM & ORDER SUMMARY */
        <form onSubmit={handlePlaceOrder} className="space-y-6">
          {/* Order Items Preview */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Order Items ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </div>

            <div className="divide-y divide-slate-200/70 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.product.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.product.images?.[0] || '/images/products/cp-bullet.jpg'}
                      alt={item.product.name}
                      className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-200 shrink-0 p-1"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Model: {item.product.modelNumber} • Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="font-extrabold text-slate-900 shrink-0 text-sm">
                    {formatPrice((item.product.price || 0) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Total Bill (Incl. GST):</span>
              <span className="font-black text-slate-900 text-base sm:text-lg">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          {/* Delivery & Customer Details */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" />
              1. Delivery Address &amp; Contact
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pranoti Jadhav"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Mobile / WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono ${phone.length === 10 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    {phone.length}/10 digits
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(digits);
                    }}
                    className="w-full text-xs pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white font-mono tracking-wider"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Address (Building, Street, Area) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot No 12, Vishrambag, Sangli"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City / District <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sangli, Chiplun, Kolhapur..."
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Pincode <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono ${pincode.length === 6 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    {pincode.length}/6 digits
                  </span>
                </div>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit PIN"
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" />
              2. Select Payment Method
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">Cash / Pay on Delivery</span>
                </div>
                <span className="text-[10px] text-slate-500">Pay cash or scan QR on arrival</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="font-bold">UPI / GPay / PhonePe</span>
                </div>
                <span className="text-[10px] text-slate-500">Instant scan &amp; transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold ring-2 ring-blue-600/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold">Bank Transfer / NEFT</span>
                </div>
                <span className="text-[10px] text-slate-500">GST B2B Tax Invoice</span>
              </button>
            </div>
          </div>

          {/* Place Order CTA Button */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <PackageCheck className="w-5 h-5" />
                  <span>Confirm &amp; Place Order • {formatPrice(totalAmount)}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Official Nexalus Warranty
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                Free Express Delivery
              </span>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
