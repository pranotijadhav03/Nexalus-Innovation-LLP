import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  subscribeToPlanOrders,
  createPlanOrder,
  updatePlanOrder,
  deletePlanOrder,
  getCachedPlanOrders
} from '../../firebase/services';
import { PlanOrder, BrandId } from '../../types';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  ShoppingCart,
  Zap,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  User,
  CreditCard,
  Wifi,
  ChevronRight,
  RefreshCw,
  Building2
} from 'lucide-react';

const MAHARASHTRA_CITIES = [
  'Chiplun',
  'Ratnagiri',
  'Sangli',
  'Kolhapur',
  'Pune',
  'Mumbai',
  'Khed',
  'Satara',
  'Other'
];

export const AdminOrdersPage: React.FC = () => {
  const { isSuperAdmin, isInnovationsAdmin, canManageBrand } = useAuth();
  const outletCtx = useOutletContext<{ activeBrandFilter?: BrandId | 'all' }>();
  const { success, error } = useToast();

  const [orders, setOrders] = useState<PlanOrder[]>(() => getCachedPlanOrders());
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PlanOrder | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<PlanOrder | null>(null);

  // Form Fields for Create / Edit
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Chiplun');
  const [pincode, setPincode] = useState('415605');
  const [providerName, setProviderName] = useState('Airtel Xstream');
  const [planName, setPlanName] = useState('Airtel Fiber Basic 40 Mbps');
  const [speed, setSpeed] = useState('40 Mbps');
  const [price, setPrice] = useState<number | string>(499);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [preferredSlot, setPreferredSlot] = useState('Immediate / Next Working Day');
  const [paymentMethod, setPaymentMethod] = useState<PlanOrder['paymentMethod']>('pay_on_installation');
  const [orderStatus, setOrderStatus] = useState<PlanOrder['status']>('new');
  const [notes, setNotes] = useState('');
  const [assignedEngineer, setAssignedEngineer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Subscription
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToPlanOrders((liveOrders) => {
      setOrders(liveOrders);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const openCreateModal = () => {
    setSelectedOrder(null);
    setCustomerName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCity('Chiplun');
    setPincode('415605');
    setProviderName('Airtel Xstream');
    setPlanName('Airtel Fiber Basic 40 Mbps');
    setSpeed('40 Mbps');
    setPrice(499);
    setBillingPeriod('monthly');
    setPreferredSlot('Immediate / Next Working Day');
    setPaymentMethod('pay_on_installation');
    setOrderStatus('new');
    setNotes('');
    setAssignedEngineer('');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (order: PlanOrder) => {
    setSelectedOrder(order);
    setCustomerName(order.customerName);
    setPhone(order.phone);
    setEmail(order.email);
    setAddress(order.address);
    setCity(order.city);
    setPincode(order.pincode);
    setProviderName(order.providerName);
    setPlanName(order.planName);
    setSpeed(order.speed);
    setPrice(order.price);
    setBillingPeriod(order.billingPeriod || 'monthly');
    setPreferredSlot(order.preferredSlot || 'Immediate / Next Working Day');
    setPaymentMethod(order.paymentMethod);
    setOrderStatus(order.status);
    setNotes(order.notes || '');
    setAssignedEngineer(order.assignedEngineer || '');
    setIsEditModalOpen(true);
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim() || !email.trim()) {
      error('Validation Error', 'Customer Name, Phone, and Email are required.');
      return;
    }

    if (!address.trim() || !city.trim() || !pincode.trim()) {
      error('Validation Error', 'Complete address, city, and pincode are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedOrder) {
        // Edit Existing Order
        const updated = await updatePlanOrder(selectedOrder.id, {
          customerName: customerName.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          providerName,
          planName,
          speed,
          price: typeof price === 'number' ? price : Number(price) || price,
          billingPeriod,
          preferredSlot,
          paymentMethod,
          status: orderStatus,
          notes: notes.trim(),
          assignedEngineer: assignedEngineer.trim()
        });

        if (updated) {
          success('Order Updated', `Order #${selectedOrder.id} successfully updated.`);
          setIsEditModalOpen(false);
          setSelectedOrder(null);
        }
      } else {
        // Create New Order
        const created = await createPlanOrder({
          customerName: customerName.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          address: address.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          providerName,
          planName,
          speed,
          price: typeof price === 'number' ? price : Number(price) || price,
          billingPeriod,
          preferredSlot,
          paymentMethod,
          status: orderStatus,
          notes: notes.trim(),
          assignedEngineer: assignedEngineer.trim(),
          brandId: 'one-broadband'
        });

        success('Order Created', `Order #${created.id} recorded in Firebase successfully.`);
        setIsCreateModalOpen(false);
      }
    } catch (err: any) {
      error('Save Failed', err.message || 'Could not save order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deletePlanOrder(deleteCandidate.id);
      success('Order Deleted', `Order #${deleteCandidate.id} has been permanently deleted.`);
      setDeleteCandidate(null);
    } catch (err: any) {
      error('Delete Failed', err.message || 'Failed to delete order.');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    success('Copied', `${label} copied to clipboard.`);
  };

  // Filter Orders
  const filteredOrders = orders.filter((order) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      order.id.toLowerCase().includes(s) ||
      order.customerName.toLowerCase().includes(s) ||
      order.phone.toLowerCase().includes(s) ||
      order.email.toLowerCase().includes(s) ||
      order.city.toLowerCase().includes(s) ||
      order.planName.toLowerCase().includes(s) ||
      order.providerName.toLowerCase().includes(s);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesProvider =
      providerFilter === 'all' ||
      order.providerName.toLowerCase().includes(providerFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesProvider;
  });

  // Status Metrics
  const totalCount = orders.length;
  const newCount = orders.filter((o) => o.status === 'new').length;
  const scheduledCount = orders.filter(
    (o) => o.status === 'confirmed' || o.status === 'installation_scheduled'
  ).length;
  const convertedCount = orders.filter((o) => o.status === 'converted').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Live Broadband Provisioning Desk
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Firebase Synced
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Broadband Plan Orders & Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer plan orders, provisioning requests, and door-to-door installation status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={openCreateModal}
            className="flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Orders
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">All time bookings</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-200 bg-blue-50/40 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            New Bookings
          </div>
          <div className="text-2xl font-black text-blue-900 mt-1">{newCount}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Awaiting optical dispatch</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 bg-amber-50/40 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            Scheduled / In-Progress
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{scheduledCount}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Technician line pulling</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/40 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Active / Connected
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{convertedCount}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Online & provisioned</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-200 bg-rose-50/40 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
            Cancelled
          </div>
          <div className="text-2xl font-black text-rose-900 mt-1">{cancelledCount}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Rejected or non-serviceable</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search booking ID, customer, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="confirmed">Confirmed</option>
            <option value="installation_scheduled">Installation Scheduled</option>
            <option value="converted">Active / Connected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Providers</option>
            <option value="Airtel">Airtel Xstream</option>
            <option value="BSNL">BSNL Bharat Fibre</option>
            <option value="RailWire">RailWire</option>
            <option value="One Broadband">One Broadband</option>
          </select>

          {(search || statusFilter !== 'all' || providerFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setProviderFilter('all');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading && orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs font-semibold">Connecting to Firebase Plan Orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">No plan orders found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {search || statusFilter !== 'all' || providerFilter !== 'all'
                  ? 'No orders match your filter criteria. Try clearing search filters.'
                  : 'Customer plan orders placed through "Buy Now" or cart checkout will appear here in real time.'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={openCreateModal}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Order Manually
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-extrabold text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Booking ID & Date</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Plan & Tariff</th>
                  <th className="px-4 py-3.5">Installation Location</th>
                  <th className="px-4 py-3.5">Payment & Slot</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const statusColors: Record<PlanOrder['status'], { bg: string; text: string; border: string }> = {
                    new: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                    confirmed: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
                    installation_scheduled: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                    converted: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
                    cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
                  };
                  const color = statusColors[order.status] || statusColors.new;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Booking ID & Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                          <span>{order.id}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(order.id, 'Booking ID')}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="Copy ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'Recent'}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${order.phone}`}
                            className="text-slate-600 hover:text-blue-600 flex items-center gap-1 font-semibold text-[11px]"
                            title="Call customer"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{order.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/91${order.phone.replace(/\D/g, '').slice(-10)}?text=Hello%20${encodeURIComponent(order.customerName)},%20this%20is%20Nexalus%20Innovations%20regarding%20your%20Broadband%20Plan%20Booking%20%23${order.id}%20for%20${encodeURIComponent(order.planName)}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                          {order.email}
                        </div>
                      </td>

                      {/* Plan & Tariff */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Wifi className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{order.providerName} - {order.planName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-bold text-[10px] border border-teal-200">
                            {order.speed}
                          </span>
                          <span className="font-extrabold text-slate-900 text-[11px]">
                            ₹{order.price} <span className="text-[10px] font-normal text-slate-500">/{order.billingPeriod || 'mo'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{order.city} ({order.pincode})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 max-w-[200px]" title={order.address}>
                          {order.address}
                        </div>
                      </td>

                      {/* Payment & Slot */}
                      <td className="px-4 py-3.5">
                        <div className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">
                          {order.paymentMethod ? order.paymentMethod.replace(/_/g, ' ') : 'Pay On Install'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{order.preferredSlot || 'Immediate'}</span>
                        </div>
                        {order.assignedEngineer && (
                          <div className="text-[10px] font-semibold text-blue-700 mt-1 flex items-center gap-1">
                            <span>Tech:</span>
                            <span>{order.assignedEngineer}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${color.bg} ${color.text} ${color.border}`}>
                          {order.status === 'new' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>}
                          {order.status === 'converted' && <CheckCircle2 className="w-3 h-3" />}
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(order)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                            title="Edit Order / Change Status"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(order)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT ORDER MODAL */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedOrder(null);
        }}
        title={selectedOrder ? `Edit Broadband Order #${selectedOrder.id}` : 'Create New Broadband Plan Order'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveOrder} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Full Name *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rahul Patil"
              required
            />

            <Input
              label="Contact Phone Number *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              required
            />

            <Select
              label="Installation City *"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              options={MAHARASHTRA_CITIES.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Full Installation Address *"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House No, Society / Bldg, Road, Landmark"
                required
              />
            </div>
            <Input
              label="PIN Code *"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="415605"
              required
            />
          </div>

          {/* Plan & Pricing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Broadband Plan Configuration
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Provider Name"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                options={[
                  { value: 'Airtel Xstream', label: 'Airtel Xstream' },
                  { value: 'BSNL Bharat Fibre', label: 'BSNL Bharat Fibre' },
                  { value: 'RailWire Broadband', label: 'RailWire Broadband' },
                  { value: 'One Broadband', label: 'One Broadband' }
                ]}
              />

              <Input
                label="Plan Name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g. Airtel Fiber Basic 40 Mbps"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Speed"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                placeholder="40 Mbps / 100 Mbps"
                required
              />

              <Input
                label="Price (₹)"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="499"
                required
              />

              <Select
                label="Billing Period"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'half-yearly', label: 'Half-Yearly' },
                  { value: 'annual', label: 'Annual' }
                ]}
              />
            </div>
          </div>

          {/* Fulfillment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              options={[
                { value: 'pay_on_installation', label: 'Pay On Installation' },
                { value: 'online_upi', label: 'Online UPI' },
                { value: 'corporate_invoice', label: 'Corporate Invoice' }
              ]}
            />

            <Select
              label="Preferred Slot"
              value={preferredSlot}
              onChange={(e) => setPreferredSlot(e.target.value)}
              options={[
                { value: 'Immediate / Next Working Day', label: 'Immediate / Next Working Day' },
                { value: 'Morning (09:00 AM - 01:00 PM)', label: 'Morning (09:00 AM - 01:00 PM)' },
                { value: 'Afternoon (02:00 PM - 06:00 PM)', label: 'Afternoon (02:00 PM - 06:00 PM)' },
                { value: 'Weekend Slot', label: 'Weekend Slot' }
              ]}
            />

            <Select
              label="Order Status"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value as any)}
              options={[
                { value: 'new', label: 'New Booking' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'installation_scheduled', label: 'Installation Scheduled' },
                { value: 'converted', label: 'Active & Connected' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Assigned Optical Engineer / Technician"
              value={assignedEngineer}
              onChange={(e) => setAssignedEngineer(e.target.value)}
              placeholder="e.g. Ramesh Kadam (+91 9158886444)"
            />

            <TextArea
              label="Internal Admin Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes on fiber pole, ONT modem model, special customer requests..."
              rows={2}
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedOrder(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {selectedOrder ? 'Update Order' : 'Create Order'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Permanent Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to permanently delete order{' '}
            <strong className="text-slate-900 font-mono">#{deleteCandidate?.id}</strong> for{' '}
            <strong>{deleteCandidate?.customerName}</strong> ({deleteCandidate?.planName})?
          </p>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            This action removes the record from both Firestore and local database.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteCandidate(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Yes, Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
