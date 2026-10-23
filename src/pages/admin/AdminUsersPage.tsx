import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getUsers,
  updateUser,
  deleteUser,
  provisionAdminAccount,
  getCachedUsers
} from '../../firebase/services';
import { AdminUser, BrandId, UserRole } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import {
  UserPlus,
  UserCheck,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Mail,
  KeyRound,
  Edit2,
  Trash2,
  Search,
  Building,
  Layers,
  Sparkles,
  Loader2,
  Eye,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Activity,
  Users
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { isSuperAdmin, currentUser } = useAuth();
  const { success, error } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab: 'customers' or 'staff'
  const activeTab = searchParams.get('tab') === 'staff' ? 'staff' : 'customers';
  const setActiveTab = (tab: 'customers' | 'staff') => {
    setSearchParams({ tab });
  };

  const [users, setUsers] = useState<AdminUser[]>(() => getCachedUsers());
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Add User Modal State (Staff)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('innovations_admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendResetEmailCheck, setSendResetEmailCheck] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Edit User Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('innovations_admin');
  const [editBrandId, setEditBrandId] = useState<BrandId | 'all'>('nexalus-innovations');
  const [editActive, setEditActive] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Inspect Customer Modal State
  const [inspectCustomer, setInspectCustomer] = useState<AdminUser | null>(null);

  // Delete User Candidate
  const [deleteCandidate, setDeleteCandidate] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const u = await getUsers();
      setUsers(u);
    } catch (err: any) {
      error('Failed to load users', err.message);
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
  }, []);

  // Separate customers and staff
  const customerUsers = useMemo(() => {
    return users.filter(u => u.role === 'customer');
  }, [users]);

  const staffUsers = useMemo(() => {
    return users.filter(u => u.role !== 'customer');
  }, [users]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customerUsers.filter(u => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.deliveryAddress?.city && u.deliveryAddress.city.toLowerCase().includes(q)) ||
        (u.deliveryAddress?.postcode && u.deliveryAddress.postcode.includes(q));
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.active) ||
        (statusFilter === 'inactive' && !u.active);
      return matchesSearch && matchesStatus;
    });
  }, [customerUsers, searchTerm, statusFilter]);

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return staffUsers.filter(u => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.active) ||
        (statusFilter === 'inactive' && !u.active);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staffUsers, searchTerm, roleFilter, statusFilter]);

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.email === currentUser?.email) {
      error('Operation Forbidden', 'You cannot deactivate your own active session account.');
      return;
    }
    try {
      const updated = await updateUser(user.uid, { active: !user.active });
      if (updated) {
        setUsers(prev => prev.map(u => (u.uid === user.uid ? updated : u)));
        success('Status Updated', `${user.displayName} is now ${!user.active ? 'Active' : 'Deactivated'}.`);
      }
    } catch (err: any) {
      error('Status Update Failed', err.message);
    }
  };

  const openCreateModal = () => {
    setDisplayName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setSendResetEmailCheck(false);
    setRole('innovations_admin');
    setIsAddModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !displayName.trim()) {
      error('Missing Information', 'Please provide a full name and email address.');
      return;
    }
    if (!password.trim() || password.trim().length < 6) {
      error('Validation Error', 'Password is required and must be at least 6 characters.');
      return;
    }

    setIsProvisioning(true);
    try {
      const targetEmail = email.trim().toLowerCase();
      const assignedBrand: BrandId | 'all' =
        role === 'am_admin'
          ? 'am-distributors'
          : role === 'super_admin'
          ? 'all'
          : 'nexalus-innovations';

      const result = await provisionAdminAccount({
        displayName: displayName.trim(),
        email: targetEmail,
        password: password.trim(),
        role,
        assignedBrandId: assignedBrand,
        active: true,
        sendResetEmail: sendResetEmailCheck
      });

      setUsers(prev => {
        const idx = prev.findIndex(u => u.uid === result.user.uid || u.email.toLowerCase() === targetEmail);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = result.user;
          return next;
        }
        return [...prev, result.user];
      });

      success(
        'Administrator Enrolled',
        `Account for ${targetEmail} created in Firebase Authentication.`
      );

      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Provisioning Failed', err.message || 'Failed to enroll administrator.');
    } finally {
      setIsProvisioning(false);
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setEditDisplayName(user.displayName);
    setEditRole(user.role);
    setEditBrandId(user.assignedBrandId || (user.role === 'am_admin' ? 'am-distributors' : user.role === 'super_admin' ? 'all' : 'nexalus-innovations'));
    setEditActive(user.active !== false);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editDisplayName.trim()) {
      error('Validation Error', 'Display name cannot be empty.');
      return;
    }

    setIsSavingEdit(true);
    try {
      const updated = await updateUser(editingUser.uid, {
        displayName: editDisplayName.trim(),
        role: editRole,
        assignedBrandId: editBrandId,
        active: editActive
      });

      if (updated) {
        setUsers(prev => prev.map(u => (u.uid === editingUser.uid ? updated : u)));
        success('Profile Updated', `Updated details for ${updated.displayName}.`);
      }
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      error('Save Failed', err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    if (deleteCandidate.email === currentUser?.email) {
      error('Forbidden', 'You cannot delete your own account.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(deleteCandidate.uid);
      setUsers(prev => prev.filter(u => u.uid !== deleteCandidate.uid));
      success('User Removed', `Account for ${deleteCandidate.displayName} has been deleted.`);
      setDeleteCandidate(null);
    } catch (err: any) {
      error('Delete Failed', err.message || 'Could not delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTimestamp = (iso?: string) => {
    if (!iso) return 'Never logged in';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Customer Accounts &amp; User Access
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Firebase Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            View new customer registrations from the public website, check who logged in and when, and manage staff administrator access.
          </p>
        </div>

        {activeTab === 'staff' && isSuperAdmin && (
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Enroll Administrator
          </Button>
        )}
      </div>

      {/* Primary Tab Switcher */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-2 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Registered Customers &amp; Login Logs</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black">
            {customerUsers.length}
          </span>
        </button>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Staff Administrators &amp; Roles</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-black">
              {staffUsers.length}
            </span>
          </button>
        )}
      </div>

      {/* TAB 1: REGISTERED CUSTOMERS & LOGIN LOGS */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Registered Customers</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{customerUsers.length}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Created via Customer Portal on website</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Accounts</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{customerUsers.filter(c => c.active).length}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Can login and place orders</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logged In Customers</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">{customerUsers.filter(c => !!c.lastLogin).length}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">With active login history timestamp</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customers by name, email, phone, city, or pincode..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium text-slate-700"
              >
                <option value="all">All Statuses ({customerUsers.length})</option>
                <option value="active">Active Accounts Only</option>
                <option value="inactive">Deactivated Only</option>
              </select>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {isLoading && users.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
                <p className="text-xs font-semibold">Loading registered customers from Firebase Firestore...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No customer records found</p>
                <p className="text-xs text-slate-400">
                  {searchTerm
                    ? 'No registered customer matches your search criteria.'
                    : 'When visitors register on the website Customer Portal, their profile and login history appear here automatically.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Customer Name &amp; Contact</th>
                      <th className="py-3.5 px-4">Delivery Address &amp; City</th>
                      <th className="py-3.5 px-4">Registration Date</th>
                      <th className="py-3.5 px-4">Last Login Activity</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map(cust => (
                      <tr key={cust.uid} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-bold text-slate-900 text-sm">{cust.displayName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{cust.email}</span>
                          </div>
                          {cust.phone && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono font-semibold text-slate-700">{cust.phone}</span>
                              <a
                                href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] hover:bg-emerald-200"
                                title="Chat on WhatsApp"
                              >
                                WA
                              </a>
                              <a
                                href={`tel:${cust.phone}`}
                                className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] hover:bg-blue-200"
                                title="Call Customer"
                              >
                                Call
                              </a>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          {cust.deliveryAddress?.address ? (
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-800 truncate">{cust.deliveryAddress.address}</div>
                              <div className="text-[11px] text-slate-500">
                                {cust.deliveryAddress.city}{cust.deliveryAddress.postcode ? ` - ${cust.deliveryAddress.postcode}` : ''}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No address provided</span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span>{formatTimestamp(cust.createdAt)}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {cust.lastLogin ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>{formatTimestamp(cust.lastLogin)}</span>
                              </div>
                              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block border border-emerald-200">
                                Logged in
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">No login recorded</span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {cust.active ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" /> Deactivated
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setInspectCustomer(cust)}
                              icon={<Eye className="w-3.5 h-3.5" />}
                            >
                              Inspect
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(cust)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                cust.active
                                  ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {cust.active ? 'Disable' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteCandidate(cust)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Customer Account"
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
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STAFF & ADMINISTRATORS (SUPER ADMIN ONLY) */}
      {activeTab === 'staff' && isSuperAdmin && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff administrators by name or email address..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value as any)}
                className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium text-slate-700"
              >
                <option value="all">All Administrative Roles</option>
                <option value="super_admin">Corporate Super Admin</option>
                <option value="innovations_admin">Nexalus Innovations Admin</option>
                <option value="am_admin">A.M. Distributors Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Administrator</th>
                    <th className="py-3.5 px-4">Role &amp; Scope</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Last Login</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-slate-900">{u.displayName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {u.active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-slate-700">
                        {formatTimestamp(u.lastLogin)}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="secondary" onClick={() => openEditModal(u)} icon={<Edit2 className="w-3.5 h-3.5" />}>
                            Edit
                          </Button>
                          <button
                            onClick={() => setDeleteCandidate(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
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
        </div>
      )}

      {/* INSPECT CUSTOMER MODAL */}
      <Modal
        isOpen={!!inspectCustomer}
        onClose={() => setInspectCustomer(null)}
        title="Customer Profile &amp; Login Details"
        subtitle={`Registered Customer: ${inspectCustomer?.displayName}`}
        maxWidth="lg"
      >
        {inspectCustomer && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Customer Name</span>
                <span className="font-black text-slate-900 text-sm">{inspectCustomer.displayName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Account Status</span>
                <span className="font-bold text-emerald-700">
                  {inspectCustomer.active ? 'Active Customer Account' : 'Deactivated'}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Email Address</span>
                <span className="font-semibold text-slate-800">{inspectCustomer.email}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Phone / Mobile</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-slate-800">{inspectCustomer.phone || 'None'}</span>
                  {inspectCustomer.phone && (
                    <a
                      href={`https://wa.me/${inspectCustomer.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                Primary Delivery Address (Customer Portal)
              </span>
              <div className="text-slate-800 font-medium">
                {inspectCustomer.deliveryAddress?.address || 'No street address provided'}
              </div>
              <div className="text-slate-600">
                City: <strong className="text-slate-900">{inspectCustomer.deliveryAddress?.city || 'Unspecified'}</strong> • PIN: <strong className="text-slate-900">{inspectCustomer.deliveryAddress?.postcode || 'None'}</strong> • State: {inspectCustomer.deliveryAddress?.state || 'Maharashtra'}
              </div>
            </div>

            {/* Timestamps */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Account Created</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>{formatTimestamp(inspectCustomer.createdAt)}</span>
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Last Login Activity</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{formatTimestamp(inspectCustomer.lastLogin)}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  const toDelete = inspectCustomer;
                  setInspectCustomer(null);
                  setDeleteCandidate(toDelete);
                }}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Customer Account
              </Button>
              <Button size="sm" variant="outline" onClick={() => setInspectCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title={deleteCandidate?.role === 'customer' ? 'Confirm Customer Deletion' : 'Confirm User Removal'}
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to delete {deleteCandidate?.role === 'customer' ? 'customer account' : 'administrator account'}{' '}
            <strong className="text-slate-900">{deleteCandidate?.displayName}</strong> ({deleteCandidate?.email})?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteCandidate(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete} isLoading={isDeleting}>
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
