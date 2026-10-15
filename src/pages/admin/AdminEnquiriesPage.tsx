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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const scope = isSuperAdmin ? (brandFilter as any) : (brandScope as any);
      const [allEnqs, allUsers] = await Promise.all([
        getEnquiries(scope, statusFilter),
        getUsers()
      ]);
      setEnquiries(allEnqs);
      setUsers(allUsers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  const filtered = enquiries.filter(e => {
    const query = search.toLowerCase();
    return (
      e.id.toLowerCase().includes(query) ||
      e.customerName.toLowerCase().includes(query) ||
      e.phone.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query) ||
      (e.location && e.location.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Enquiry & Lead CRM Pipeline
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Process customer quote requests, CCTV site inquiries, and fiber connections through the official sales stages.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search by ID, name, phone, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {isSuperAdmin && (
            <select
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700"
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
            >
              <option value="all">All Operating Companies</option>
              <option value="nexalus-innovations">Nexalus Innovations (CCTV, Internet, Network)</option>
              <option value="am-distributors">A.M. Distributors Chiplun (Cold-Chain)</option>
              <option value="general">Nexalus LLP Corporate</option>
            </select>
          )}

          <select
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
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
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Brand Division</th>
                <th className="py-3.5 px-4">Subject / Location</th>
                <th className="py-3.5 px-4">Workflow Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(enq => (
                <tr key={enq.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    #{enq.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{enq.customerName}</div>
                    <div className="text-[11px] text-slate-500">{enq.phone} • {enq.email}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <BrandBadge brandId={enq.brandId} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-800 truncate">
                      {enq.productOrServiceName || 'General Enquiry'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {enq.location || 'Location unlisted'}
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
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
            {/* Customer Details Box */}
            <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Customer Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedEnquiry.customerName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Phone & Mobile</span>
                <span className="font-semibold text-slate-800">{selectedEnquiry.phone}</span>
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
