import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateCustomerProfile, getCustomerEnquiries } from '../../firebase/services';
import { Enquiry, CustomerDeliveryAddress } from '../../types';
import {
  User,
  MapPin,
  FileText,
  Shield,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  LogOut,
  Save,
  Send,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Wifi,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/common/Button';

const INDIAN_STATES = [
  'Maharashtra',
  'Goa',
  'Gujarat',
  'Karnataka',
  'Madhya Pradesh',
  'Delhi',
  'Other'
];

export const CustomerAccountPage: React.FC = () => {
  const { currentUser, isAuthenticated, isCustomer, logout, refreshUserProfile } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'address' | 'inquiries' | 'security'>('address');

  // Address & Contact Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('India');
  const [additionalDeliveryInfo, setAdditionalDeliveryInfo] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState<Enquiry[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);

  // Security / Password State
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Initialize form fields when currentUser loads
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.displayName || '');
      setPhone(currentUser.phone || '');
      if (currentUser.deliveryAddress) {
        setAddress(currentUser.deliveryAddress.address || '');
        setCity(currentUser.deliveryAddress.city || '');
        setState(currentUser.deliveryAddress.state || 'Maharashtra');
        setPostcode(currentUser.deliveryAddress.postcode || '');
        setCountry(currentUser.deliveryAddress.country || 'India');
        setAdditionalDeliveryInfo(currentUser.deliveryAddress.additionalDeliveryInfo || '');
      }
    }
  }, [currentUser]);

  // Load Customer Inquiries
  useEffect(() => {
    if (currentUser?.email) {
      setIsLoadingInquiries(true);
      getCustomerEnquiries(currentUser.email)
        .then(res => setInquiries(res))
        .catch(err => console.warn('Failed to load enquiries:', err))
        .finally(() => setIsLoadingInquiries(false));
    }
  }, [currentUser?.email]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!address.trim() || !city.trim() || !postcode.trim()) {
      error('Validation Error', 'Please specify your street address, city, and pincode.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedDelivery: CustomerDeliveryAddress = {
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postcode: postcode.trim(),
        country: country.trim() || 'India',
        additionalDeliveryInfo: additionalDeliveryInfo.trim()
      };

      const res = await updateCustomerProfile(currentUser.uid, {
        displayName: fullName.trim(),
        phone: phone.trim(),
        deliveryAddress: updatedDelivery
      });

      if (res) {
        await refreshUserProfile();
        success('Profile Saved', 'Your delivery location and contact details have been updated.');
      } else {
        error('Save Failed', 'Could not update your profile. Please try again.');
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to save address.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!currentUser?.email || !auth) return;
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      success('Email Dispatched', `Password reset instructions sent to ${currentUser.email}`);
    } catch (err: any) {
      error('Reset Failed', err.message || 'Could not send password reset email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    success('Signed Out', 'You have been signed out of your customer account.');
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">New Request</span>;
      case 'contacted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Contacted</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">In Progress</span>;
      case 'quotation_sent':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Quotation Sent</span>;
      case 'converted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Connected / Installed</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // If visitor is not authenticated, show welcoming prompt
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Customer Portal
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Please sign in to view your broadband inquiries, manage your saved delivery address, or request enterprise IT networking quotes.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open_customer_portal', { detail: { view: 'login' } }));
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Sign In to Your Account</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open_customer_portal', { detail: { view: 'register' } }));
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              <span>New Customer? Register Here</span>
            </button>
          </div>
          <div className="pt-2">
            <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors">
              ← Return to Nexalus Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/20 border-2 border-white/20">
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  {currentUser.displayName || 'Customer'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {isCustomer ? 'Verified Customer' : 'Staff / Member'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  {currentUser.email}
                </span>
                {currentUser.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    {currentUser.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              icon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 mb-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`pb-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'address'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery &amp; Installation Address</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`pb-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Service Inquiries</span>
            {inquiries.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800">
                {inquiries.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`pb-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security &amp; Support</span>
          </button>
        </div>

        {/* TAB 1: DELIVERY & INSTALLATION ADDRESS */}
        {activeTab === 'address' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-3xl">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Installation &amp; Delivery Location
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Keep your service address updated for on-site fiber feasibility checks, hardware deliveries, and technician visits.
              </p>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Primary Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Street Address / Flat / Building <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2nd Floor, Sai Commercial Complex, Guhagar Road"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chiplun"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Pincode <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 415605"
                    value={postcode}
                    onChange={e => setPostcode(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium text-slate-700"
                  >
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Landmark &amp; Additional Delivery Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Near Chiplun Railway Station, Opposite Government Hospital"
                  value={additionalDeliveryInfo}
                  onChange={e => setAdditionalDeliveryInfo(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isSavingProfile}
                  icon={isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                >
                  {isSavingProfile ? 'Saving Details...' : 'Save Delivery Address'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: MY SERVICE INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Your Service Requests &amp; Inquiries
                </h2>
                <p className="text-xs text-slate-500">
                  Track the status of your broadband plan inquiries, quotation requests, and support tickets.
                </p>
              </div>
              <Link
                to="/plans"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Explore Broadband Plans</span>
              </Link>
            </div>

            {isLoadingInquiries ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-xs font-bold text-slate-600">Retrieving your inquiries from Firestore...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-slate-900">No Inquiries Submitted Yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You haven&apos;t submitted any broadband or CCTV quotation requests yet with this email address ({currentUser.email}).
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    to="/plans"
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Browse Fiber Plans
                  </Link>
                  <Link
                    to="/quote"
                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Request a Quote
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map(inq => (
                  <div
                    key={inq.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-blue-700 tracking-wider">
                          {inq.enquiryType.toUpperCase()}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-bold text-slate-800">
                          {inq.productOrServiceName || 'General Enquiry'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(inq.status)}
                        <span className="text-[10px] text-slate-400">
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      &quot;{inq.message}&quot;
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Location: {inq.location} {inq.pincode ? `(${inq.pincode})` : ''}
                      </span>
                      {inq.websiteName && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          Division: {inq.websiteName}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SECURITY & SUPPORT */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Account Password</h3>
                  <p className="text-xs text-slate-500">Manage your secure Firebase credentials</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Click below to receive an official Firebase password reset email. You will receive a secure link in your registered email inbox (<strong>{currentUser.email}</strong>).
              </p>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendPasswordReset}
                  disabled={isSendingReset}
                  icon={isSendingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                >
                  {isSendingReset ? 'Sending Reset Link...' : 'Send Password Reset Email'}
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Direct Customer Care</h3>
                  <p className="text-xs text-slate-500">Chiplun Central Support &amp; Technical NOC</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Need immediate broadband troubleshooting, fiber connection shifting, or high-definition CCTV camera alignment?
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href="https://wa.me/919158886444?text=Hello%20Nexalus,%20I%20am%20an%20existing%20customer%20and%20require%20assistance."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp Support</span>
                </a>
                <a
                  href="tel:+919158886444"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call +91 9158886444</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
