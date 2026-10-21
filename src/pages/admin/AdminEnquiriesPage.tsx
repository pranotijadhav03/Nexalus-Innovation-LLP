import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  getUsers
} from '../../firebase/services';
import { Enquiry, EnquiryStatus, AdminUser, BrandId } from '../../types';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BrandBadge } from '../../components/common/BrandBadge';
import {
  Inbox,
  Search,
  Filter,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserCheck
} from 'lucide-react';

export const AdminEnquiriesPage: React.FC = () => {
  const { isSuperAdmin, isInnovationsAdmin, isAmAdmin, brandScope, canManageBrand } = useAuth();
  const outletCtx = useOutletContext<{ activeBrandFilter?: BrandId | 'all' }>();
  const { success, error } = useToast();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState<string>(
    isSuperAdmin ? (outletCtx?.activeBrandFilter || 'all') : (brandScope as string)
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSuperAdmin && outletCtx?.activeBrandFilter) {
      setBrandFilter(outletCtx.activeBrandFilter);
    }
  }, [outletCtx?.activeBrandFilter, isSuperAdmin]);

  // Detail Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [editStatus, setEditStatus] = useState<EnquiryStatus>('new');
  const [internalNotes, setInternalNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete State
  const [deleteCandidate, setDeleteCandidate] = useState<Enquiry | null>(null);

  const [allEnquiriesRaw, setAllEnquiriesRaw] = useState<Enquiry[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allEnqs, allUsers] = await Promise.all([
        getEnquiries('all'),
        getUsers()
      ]);
      setAllEnquiriesRaw(allEnqs);
      setUsers(allUsers);

      // Now filter based on scope & status
      let filteredEnqs = allEnqs;
      const scope = isSuperAdmin ? brandFilter : (brandScope as string);

      if (scope && scope !== 'all') {
        if (scope === 'corporate' || scope === 'general') {
          filteredEnqs = filteredEnqs.filter(e => e.websiteId === 'corporate' || e.brandId === 'general');
        } else if (scope === 'nexalus-innovations') {
          filteredEnqs = filteredEnqs.filter(e =>
            e.websiteId === 'nexalus-innovations' ||
            e.brandId === 'nexalus-innovations' ||
            e.brandId === 'cp-plus' ||
            e.brandId === 'one-broadband' ||
            e.brandId === 'itti-networking'
          );
        } else if (scope === 'am-distributors') {
          filteredEnqs = filteredEnqs.filter(e => e.websiteId === 'am-distributors' || e.brandId === 'am-distributors');
        }
      }

      if (statusFilter && statusFilter !== 'all') {
        filteredEnqs = filteredEnqs.filter(e => e.status === statusFilter);
      }

      setEnquiries(filteredEnqs);
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
  }, [brandFilter, statusFilter]);

  const openDetailModal = (enq: Enquiry) => {
    if (!canManageBrand(enq.brandId)) {
      error('Access Denied', 'You cannot view enquiries outside your assigned brand.');
      return;
    }
    setSelectedEnquiry(enq);
    setEditStatus(enq.status);
    setInternalNotes(enq.internalNotes || '');
    setAssignedTo(enq.assignedTo || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    setIsUpdating(true);
    try {
      const updated = await updateEnquiryStatus(
        selectedEnquiry.id,
        editStatus,
        internalNotes,
        assignedTo
      );
      if (updated) {
        setSelectedEnquiry(updated);
        success('Enquiry Updated', `Status changed to ${editStatus.replace('_', ' ').toUpperCase()}`);
        loadData();
      }
    } catch (err: any) {
      error('Update Failed', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteEnquiry(deleteCandidate.id);
      success('Enquiry Removed', `Record #${deleteCandidate.id} was deleted.`);
      setDeleteCandidate(null);
      if (selectedEnquiry?.id === deleteCandidate.id) setSelectedEnquiry(null);
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  // Counts for each website
  const corporateCount = allEnquiriesRaw.filter(e => e.websiteId === 'corporate' || e.brandId === 'general').length;
  const innovationsCount = allEnquiriesRaw.filter(e =>
    e.websiteId === 'nexalus-innovations' ||
    e.brandId === 'nexalus-innovations' ||
    e.brandId === 'cp-plus' ||
    e.brandId === 'one-broadband' ||
    e.brandId === 'itti-networking'
  ).length;
  const amCount = allEnquiriesRaw.filter(e => e.websiteId === 'am-distributors' || e.brandId === 'am-distributors').length;

  const filtered = enquiries.filter(e => {
    const query = search.toLowerCase();
    return (
      e.id.toLowerCase().includes(query) ||
      e.customerName.toLowerCase().includes(query) ||
      e.phone.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query) ||
      (e.sourcePage && e.sourcePage.toLowerCase().includes(query)) ||
      (e.productOrServiceName && e.productOrServiceName.toLowerCase().includes(query)) ||
      (e.location && e.location.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Website Inquiries &amp; Customer CRM
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time inquiries, quote requests, and orders organized across all 3 operating websites with full page tracking.
        </p>
      </div>

      {/* 3 WEBSITE SELECTOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* All Portals Card */}
        <button
          onClick={() => setBrandFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            brandFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/30'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">All Websites</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${brandFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {allEnquiriesRaw.length}
            </span>
          </div>
          <div className="mt-3">
            <div className="font-black text-sm">Combined Inquiries</div>
            <div className={`text-[11px] mt-0.5 ${brandFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
              Master consolidated stream
            </div>
          </div>
        </button>

        {/* Website 1: Corporate Parent */}
        <button
          onClick={() => setBrandFilter('corporate')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            brandFilter === 'corporate'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/30'
              : 'bg-white hover:bg-blue-50/50 text-slate-700 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-85">Corporate Portal</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${brandFilter === 'corporate' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'}`}>
              {corporateCount}
            </span>
          </div>
          <div className="mt-3">
            <div className="font-black text-sm">Nexalus Innovations LLP</div>
            <div className={`text-[11px] mt-0.5 ${brandFilter === 'corporate' ? 'text-blue-100' : 'text-slate-500'}`}>
              Holding company &amp; group contracts
            </div>
          </div>
        </button>

        {/* Website 2: Nexalus Innovations Tech */}
        <button
          onClick={() => setBrandFilter('nexalus-innovations')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            brandFilter === 'nexalus-innovations'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-600/30'
              : 'bg-white hover:bg-indigo-50/50 text-slate-700 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-85">Tech &amp; Security</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${brandFilter === 'nexalus-innovations' ? 'bg-indigo-700 text-white' : 'bg-indigo-50 text-indigo-700'}`}>
              {innovationsCount}
            </span>
          </div>
          <div className="mt-3">
            <div className="font-black text-sm">Nexalus Innovations</div>
            <div className={`text-[11px] mt-0.5 ${brandFilter === 'nexalus-innovations' ? 'text-indigo-100' : 'text-slate-500'}`}>
              CCTV, Optical Fiber &amp; Switches
            </div>
          </div>
        </button>

        {/* Website 3: A.M. Distributors Chiplun */}
        <button
          onClick={() => setBrandFilter('am-distributors')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            brandFilter === 'am-distributors'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600/30'
              : 'bg-white hover:bg-emerald-50/50 text-slate-700 border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-85">Chiplun Depot</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${brandFilter === 'am-distributors' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
              {amCount}
            </span>
          </div>
          <div className="mt-3">
            <div className="font-black text-sm">A.M. Distributors Chiplun</div>
            <div className={`text-[11px] mt-0.5 ${brandFilter === 'am-distributors' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Mineral Water, Ice Cream &amp; Dairy
            </div>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="w-full md:w-96">
          <Input
            placeholder="Search by customer, phone, website, or page..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <select
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses ({filtered.length})</option>
            <option value="new">New (Uncontacted)</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In Progress</option>
            <option value="quotation_sent">Quotation Sent</option>
            <option value="converted">Converted (Won)</option>
            <option value="closed">Closed / Archived</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Ticket</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Enquiry Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Origin Website &amp; Page</th>
                <th className="py-3.5 px-4">Requirement / Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No inquiries found matching this website or status filter.
                  </td>
                </tr>
              ) : (
                filtered.map(enq => {
                  const isAmDist = enq.websiteId === 'am-distributors' || enq.brandId === 'am-distributors';
                  const isNexTech = enq.websiteId === 'nexalus-innovations' || enq.brandId === 'nexalus-innovations' || enq.brandId === 'cp-plus' || enq.brandId === 'one-broadband' || enq.brandId === 'itti-networking';

                  const websiteDisplay = isAmDist
                    ? 'A.M. Distributors Chiplun'
                    : isNexTech
                    ? 'Nexalus Innovations'
                    : 'Nexalus Innovations LLP';

                  return (
                    <tr key={enq.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] border border-slate-200 inline-block">
                          #{enq.id}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>
                            {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {new Date(enq.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{enq.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{enq.phone}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{enq.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              isAmDist
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isNexTech
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {websiteDisplay}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {enq.sourcePage || 'General Form'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">
                          {enq.productOrServiceName || 'General Enquiry'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {enq.location || 'Location unlisted'} {enq.pincode ? `• PIN ${enq.pincode}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            enq.status === 'new'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : enq.status === 'contacted'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : enq.status === 'in_progress'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : enq.status === 'quotation_sent'
                              ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                              : enq.status === 'converted'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          {enq.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {enq.phone && (
                            <a
                              href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openDetailModal(enq)}
                            icon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Inspect
                          </Button>
                          <button
                            onClick={() => setDeleteCandidate(enq)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Delete Lead"
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

      {/* Enquiry Inspect & Workflow Modal */}
      <Modal
        isOpen={!!selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        title={`Enquiry Ticket #${selectedEnquiry?.id}`}
        subtitle={`Registered on ${selectedEnquiry ? new Date(selectedEnquiry.createdAt).toLocaleString() : ''}`}
        maxWidth="2xl"
      >
        {selectedEnquiry && (
          <div className="space-y-6">
            {/* Origin Website & Source Page Banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-900 uppercase text-[10px]">Origin Website:</span>
                <span className="font-black text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                  {selectedEnquiry.websiteName || (selectedEnquiry.brandId === 'am-distributors' ? 'A.M. Distributors Chiplun' : selectedEnquiry.brandId === 'nexalus-innovations' ? 'Nexalus Innovations' : 'Nexalus Innovations LLP')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Submitted On Page:</span>
                <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {selectedEnquiry.sourcePage || 'Contact / Quote Modal'}
                </span>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Customer Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedEnquiry.customerName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Phone &amp; Mobile</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-slate-800">{selectedEnquiry.phone}</span>
                  <a
                    href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-500 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${selectedEnquiry.phone}`}
                    className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-500 transition-colors"
                  >
                    Call
                  </a>
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Email Address</span>
                <span className="font-semibold text-slate-800">{selectedEnquiry.email}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Premises Location / PIN</span>
                <span className="font-semibold text-slate-800">
                  {selectedEnquiry.location} {selectedEnquiry.pincode ? `(${selectedEnquiry.pincode})` : ''}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Enquiry Date &amp; Time</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {new Date(selectedEnquiry.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                  <span className="text-slate-400 font-normal">•</span>
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(selectedEnquiry.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Enquiry Ticket ID</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                  #{selectedEnquiry.id}
                </span>
              </div>
            </div>

            {/* Inquired Product / Message */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Inquiry Details & Message:
              </div>
              {selectedEnquiry.productOrServiceName && (
                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 font-medium">
                  Associated Item: <span className="font-bold">{selectedEnquiry.productOrServiceName}</span>
                </div>
              )}
              <div className="p-4 rounded-xl bg-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedEnquiry.message || 'No additional message provided.'}
              </div>
            </div>

            {/* Workflow Management Form */}
            <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-slate-200 space-y-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Lead Status & Staff Action
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Workflow Stage"
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as EnquiryStatus)}
                  options={[
                    { value: 'new', label: '1. New (Pending Review)' },
                    { value: 'contacted', label: '2. Contacted (Phone / Email)' },
                    { value: 'in_progress', label: '3. In Progress (Site Survey)' },
                    { value: 'quotation_sent', label: '4. Quotation Sent' },
                    { value: 'converted', label: '5. Converted (Won / Client)' },
                    { value: 'closed', label: '6. Closed / Lost' }
                  ]}
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assign Staff Officer
                  </label>
                  <select
                    className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2.5 bg-white"
                    value={assignedTo}
                    onChange={e => setAssignedTo(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.uid} value={u.email}>
                        {u.displayName} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <TextArea
                label="Internal Confidential Notes"
                placeholder="Log customer phone calls, site visit observations, and quote negotiation notes..."
                rows={3}
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedEnquiry(null)}>
                  Close
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
                  Save Lead Updates
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Delete Lead Modal */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Lead Removal"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to remove inquiry record <strong className="text-slate-900">#{deleteCandidate?.id}</strong> from {deleteCandidate?.customerName}?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteCandidate(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
