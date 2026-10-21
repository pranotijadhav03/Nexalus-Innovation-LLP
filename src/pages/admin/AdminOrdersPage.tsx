import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  resolveOrderBrandId
} from '../../firebase/services';
import { CustomerOrder } from '../../types';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BrandBadge } from '../../components/common/BrandBadge';
import { AdminOutletContext } from '../../components/admin/AdminLayout';
import {
  ShoppingBag,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Building,
  Banknote,
  PackageCheck,
  AlertCircle
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const outletCtx = useOutletContext<AdminOutletContext>();
  const activeBrandFilter = outletCtx?.activeBrandFilter || 'all';

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [editStatus, setEditStatus] = useState<CustomerOrder['status']>('confirmed');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<CustomerOrder | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allOrders = await getOrders(activeBrandFilter);
      allOrders.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setOrders(allOrders);
    } catch (e: any) {
      toastError('Load Failed', e.message || 'Could not fetch orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('nexalus_data_update', handleUpdate);
    return () => window.removeEventListener('nexalus_data_update', handleUpdate);
  }, [activeBrandFilter]);

  const openDetailModal = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditNotes(order.orderNotes || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      const updated = await updateOrderStatus(selectedOrder.id, editStatus, editNotes);
      if (updated) {
        setSelectedOrder(updated);
        success('Order Updated', `Status changed to ${editStatus.toUpperCase()}`);
        loadData();
      }
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Could not update order status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteOrder(deleteCandidate.id);
      success('Order Deleted', `Order #${deleteCandidate.id} has been removed.`);
      setDeleteCandidate(null);
      if (selectedOrder?.id === deleteCandidate.id) setSelectedOrder(null);
      loadData();
    } catch (err: any) {
      toastError('Delete Failed', err.message || 'Could not delete order.');
    }
  };

  // KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount : 0), 0);
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
  const dispatchedCount = orders.filter(o => o.status === 'dispatched').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const query = search.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.phone.toLowerCase().includes(query) ||
      o.city.toLowerCase().includes(query) ||
      (o.email && o.email.toLowerCase().includes(query)) ||
      o.items.some(i => i.productName.toLowerCase().includes(query) || i.modelNumber.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || o.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  }).sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  const formatPrice = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <ShoppingBag className="w-6 h-6 text-blue-600" />
          <span>
            {activeBrandFilter === 'nexalus-innovations'
              ? 'Nexalus Innovations Orders'
              : activeBrandFilter === 'am-distributors'
              ? 'A.M. Distributors Chiplun Orders'
              : 'Online Store Customer Orders'}
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {activeBrandFilter === 'am-distributors'
            ? 'Wholesale mineral water, dairy products and cold-chain logistics customer orders.'
            : activeBrandFilter === 'nexalus-innovations'
            ? 'CCTV security surveillance, optical fiber and networking store orders.'
            : 'Live customer purchases placed via Add to Cart & Buy Now with real-time Firebase Firestore sync.'}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Total Orders</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{orders.length}</div>
            <div className="text-xs text-blue-600 font-bold mt-0.5">Revenue: {formatPrice(totalRevenue)}</div>
          </div>
        </div>

        {/* Confirmed Orders Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Awaiting Dispatch</span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600">{confirmedCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Ready for packing &amp; transport</div>
          </div>
        </div>

        {/* Dispatched Orders Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>In Transit</span>
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-600">{dispatchedCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Dispatched from Sangli/Chiplun</div>
          </div>
        </div>

        {/* Delivered Orders Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Delivered (Fulfilled)</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600">{deliveredCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Completed customer handovers</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="w-full md:w-96">
          <Input
            placeholder="Search by Order #, Customer, Phone, City, Product..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {/* Status Filter */}
          <select
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium cursor-pointer"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="confirmed">Confirmed / Pending</option>
            <option value="dispatched">Dispatched (In Transit)</option>
            <option value="delivered">Delivered (Completed)</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Method Filter */}
          <select
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium cursor-pointer"
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payments</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="upi">UPI / GPay / PhonePe</option>
            <option value="bank_transfer">Bank Transfer (B2B)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Order ID</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Order Date</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Division</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Delivery City &amp; Address</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No orders found matching the filter or search query.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const firstItem = order.items[0];
                  const extraItemsCount = order.items.length - 1;
                  const orderBrand = order.brandId || resolveOrderBrandId(order);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-[11px] border border-blue-200 inline-block">
                          #{order.id}
                        </span>
                      </td>

                      {/* Order Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Division Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <BrandBadge brandId={orderBrand} size="sm" />
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{order.phone}</div>
                        {order.email && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {order.email}
                          </div>
                        )}
                      </td>

                      {/* Delivery Address */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{order.city} • PIN {order.pincode}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate" title={order.address}>
                          {order.address}
                        </div>
                      </td>

                      {/* Items Summary */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          {firstItem?.image && (
                            <img
                              src={firstItem.image}
                              alt=""
                              className="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-200 p-0.5 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {firstItem?.productName || 'Equipment'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Qty: {firstItem?.quantity} {extraItemsCount > 0 ? `(+${extraItemsCount} more)` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm whitespace-nowrap">
                        {formatPrice(order.totalAmount)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            order.paymentMethod === 'cod'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.paymentMethod === 'upi'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}
                        >
                          {order.paymentMethod === 'cod'
                            ? 'COD'
                            : order.paymentMethod === 'upi'
                            ? 'UPI PAY'
                            : 'BANK NEFT'}
                        </span>
                      </td>

                      {/* Order Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            order.status === 'confirmed'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : order.status === 'dispatched'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : order.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct WhatsApp Message to Customer */}
                          {order.phone && (
                            <a
                              href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hello ${order.customerName}, this is regarding your Nexalus Innovations order #${order.id} for ${formatPrice(order.totalAmount)}. Our logistics team is preparing your dispatch.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Message Customer on WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Inspect Modal */}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openDetailModal(order)}
                            icon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Inspect
                          </Button>

                          {/* Delete Order */}
                          <button
                            onClick={() => setDeleteCandidate(order)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect & Order Fulfillment Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Purchase Order #${selectedOrder?.id}`}
        subtitle={`Registered on ${selectedOrder ? new Date(selectedOrder.createdAt).toLocaleString('en-IN') : ''}`}
        maxWidth="2xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status & Payment Banner */}
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900 uppercase text-[10px]">Division:</span>
                <BrandBadge brandId={selectedOrder.brandId || resolveOrderBrandId(selectedOrder)} size="sm" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900 uppercase text-[10px]">Payment Mode:</span>
                <span className="font-black text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200 uppercase">
                  {selectedOrder.paymentMethod}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Total Order Bill:</span>
                <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {formatPrice(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            {/* Customer & Delivery Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Customer Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</span>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Mobile / Phone</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-semibold text-slate-800">{selectedOrder.phone}</span>
                  <a
                    href={`https://wa.me/${selectedOrder.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-500 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${selectedOrder.phone}`}
                    className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 transition-colors"
                  >
                    Call
                  </a>
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Delivery Address</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {selectedOrder.address}, {selectedOrder.city} - PIN {selectedOrder.pincode}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Order Date &amp; Time</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(selectedOrder.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Customer Email</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{selectedOrder.email || 'None'}</span>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Items in This Order ({selectedOrder.items.length})</span>
                <span className="text-slate-500 font-mono">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>

              <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden bg-white">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{item.productName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Model: {item.modelNumber} • Unit Price: {formatPrice(item.price)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-slate-900 text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <div className="text-[10px] text-slate-400">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status & Dispatch Workflow Form */}
            <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-slate-200 space-y-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Update Order Fulfillment Status</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Order Status"
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as CustomerOrder['status'])}
                  options={[
                    { value: 'confirmed', label: '1. Confirmed (Awaiting Dispatch)' },
                    { value: 'dispatched', label: '2. Dispatched (In Transit)' },
                    { value: 'delivered', label: '3. Delivered (Completed)' },
                    { value: 'cancelled', label: '4. Cancelled' }
                  ]}
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fulfillment Notes / Tracking #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dispatched via Chiplun van, Waybill #4920"
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isUpdating}
                  icon={<PackageCheck className="w-4 h-4" />}
                >
                  Save Status Update
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Delete Order Record"
        subtitle="This action cannot be undone."
        maxWidth="md"
      >
        {deleteCandidate && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete Order <strong>#{deleteCandidate.id}</strong> placed by <strong>{deleteCandidate.customerName}</strong> ({formatPrice(deleteCandidate.totalAmount)})?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteCandidate(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
