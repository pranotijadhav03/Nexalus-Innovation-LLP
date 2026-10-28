import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Users,
  Copy,
  Check,
  ExternalLink,
  Lock
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

  // Add User / Registration Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'customer' | 'staff'>('customer');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('innovations_admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Sangli');
  const [pincode, setPincode] = useState('416415');
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Success Credentials Dialog
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
    isCustomer: boolean;
  } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

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

  // Separate customers and staff (strictly newest first / descending order)
  const customerUsers = useMemo(() => {
    return users
      .filter(u => u.role === 'customer')
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || a.lastLogin || 0).getTime();
        const timeB = new Date(b.createdAt || b.lastLogin || 0).getTime();
        return timeB - timeA;
      });
  }, [users]);

  const staffUsers = useMemo(() => {
    return users
      .filter(u => u.role !== 'customer')
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || a.lastLogin || 0).getTime();
        const timeB = new Date(b.createdAt || b.lastLogin || 0).getTime();
        return timeB - timeA;
      });
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

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  const openCreateModal = (mode: 'customer' | 'staff') => {
    setAddMode(mode);
    setDisplayName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setPhone('');
    setAddress('');
    setCity('Sangli');
    setPincode('416415');
    if (mode === 'customer') {
      setRole('customer');
    } else {
      setRole('innovations_admin');
    }
    generateRandomPassword();
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

      const deliveryAddress = addMode === 'customer' && (address || city || pincode)
        ? {
            address: address.trim(),
            city: city.trim(),
            state: 'Maharashtra',
            postcode: pincode.trim()
          }
        : undefined;

      const result = await provisionAdminAccount({
        displayName: displayName.trim(),
        email: targetEmail,
        password: password.trim(),
        role,
        assignedBrandId: assignedBrand,
        active: true,
        sendResetEmail: false,
        phone: phone.trim() || undefined,
        deliveryAddress
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

      // Save credentials for the copy dialog
      setCreatedCredentials({
        name: displayName.trim(),
        email: targetEmail,
        password: password.trim(),
        role: role === 'customer'
          ? 'Customer'
          : role === 'super_admin'
          ? 'Corporate Super Admin'
          : role === 'innovations_admin'
          ? 'Nexalus Innovations Admin'
          : 'A.M. Distributors Admin',
        isCustomer: role === 'customer'
      });

      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Provisioning Failed', err.message || 'Failed to enroll account.');
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const loginUrl = `${window.location.origin}/login`;
    const text = `--- NEXALUS PORTAL CREDENTIALS ---
Name: ${createdCredentials.name}
Role: ${createdCredentials.role}
Email: ${createdCredentials.email}
Password: ${createdCredentials.password}
Login URL: ${loginUrl}
----------------------------------`;
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    success('Credentials Copied', 'Login credentials copied to your clipboard.');
    setTimeout(() => setHasCopied(false), 2500);
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
              Customer Accounts &amp; Administrator Access
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Register new customers, view website logins, enroll company administrators, and manage portal access credentials.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="teal"
            size="sm"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => openCreateModal('customer')}
          >
            Register Customer
          </Button>

          {isSuperAdmin && (
            <Button
              variant="primary"
              size="sm"
              icon={<Shield className="w-4 h-4" />}
              onClick={() => openCreateModal('staff')}
            >
              Enroll Administrator
            </Button>
          )}
        </div>
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
          <UserCheck className="w-4 h-4" />
          <span>Registered Customers &amp; Login History ({customerUsers.length})</span>
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
            <Shield className="w-4 h-4" />
            <span>Company Administrators ({staffUsers.length})</span>
          </button>
        )}
      </div>

      {/* TAB 1: REGISTERED CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search registered customers by name, phone, email, or city..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium text-slate-700"
              >
                <option value="all">All Customer Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Deactivated Only</option>
              </select>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredCustomers.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No Customers Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchTerm ? 'No registered customers match your search.' : 'No customer accounts registered yet.'}
                </p>
                <Button size="sm" variant="teal" onClick={() => openCreateModal('customer')} icon={<UserPlus className="w-4 h-4" />}>
                  Register First Customer
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Customer Details</th>
                      <th className="py-3.5 px-4">Phone / Contact</th>
                      <th className="py-3.5 px-4">City / Address</th>
                      <th className="py-3.5 px-4">Registered On</th>
                      <th className="py-3.5 px-4">Last Login</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map(cust => (
                      <tr key={cust.uid} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-bold text-slate-900">{cust.displayName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                            <Mail className="w-3 h-3 text-slate-400" /> {cust.email}
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {cust.phone ? (
                            <span className="font-semibold text-slate-800">{cust.phone}</span>
                          ) : (
                            <span className="text-slate-400 italic">Not set</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          {cust.deliveryAddress?.city ? (
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-800 truncate max-w-xs">{cust.deliveryAddress.address || cust.deliveryAddress.city}</div>
                              <div className="text-[11px] text-slate-500">
                                {cust.deliveryAddress.city}{cust.deliveryAddress.postcode ? ` - ${cust.deliveryAddress.postcode}` : ''}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No address</span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-medium text-slate-700">{formatTimestamp(cust.createdAt)}</span>
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

      {/* TAB 2: STAFF & ADMINISTRATORS */}
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
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                          u.role === 'super_admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : u.role === 'innovations_admin'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-teal-50 text-teal-700 border-teal-200'
                        }`}>
                          {u.role === 'super_admin'
                            ? 'Corporate Super Admin'
                            : u.role === 'innovations_admin'
                            ? 'Nexalus Innovations Admin'
                            : 'A.M. Distributors Admin'}
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

      {/* CREATE USER / ENROLL ADMIN MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={addMode === 'customer' ? 'Register New Customer Account' : 'Enroll System Administrator'}
        subtitle={
          addMode === 'customer'
            ? 'Create a customer profile with login credentials for public portal access.'
            : 'Create an administrator account with access to manage specific company operations.'
        }
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Sanket Lohar"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
          />

          <Input
            label="Email Address (Login Username) *"
            type="email"
            placeholder="e.g. customer@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          {/* Password with generator */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Password * (minimum 6 characters)
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" /> Generate Password
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter or generate a strong password"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Administrator Role Selection */}
          {addMode === 'staff' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Administrative Scope &amp; Role *
              </label>
              <div className="space-y-2">
                <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  role === 'super_admin' ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600' : 'border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="admin_role"
                    checked={role === 'super_admin'}
                    onChange={() => setRole('super_admin')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-extrabold text-xs text-purple-900">Corporate Super Admin</div>
                    <div className="text-[11px] text-slate-500">Unrestricted governance over Nexalus Innovations LLP, all child brands &amp; admin accounts.</div>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  role === 'innovations_admin' ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600' : 'border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="admin_role"
                    checked={role === 'innovations_admin'}
                    onChange={() => setRole('innovations_admin')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-extrabold text-xs text-blue-900">Nexalus Innovations Admin</div>
                    <div className="text-[11px] text-slate-500">Manages tech hardware, CCTV, fiber internet, networking, orders, and inquiries.</div>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  role === 'am_admin' ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600' : 'border-slate-200'
                }`}>
                  <input
                    type="radio"
                    name="admin_role"
                    checked={role === 'am_admin'}
                    onChange={() => setRole('am_admin')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-extrabold text-xs text-teal-900">A.M. Distributors Admin</div>
                    <div className="text-[11px] text-slate-500">Dedicated management for Chiplun FMCG depot, water, dairy, ice cream &amp; fleet operations.</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Customer Specific Fields */}
          {addMode === 'customer' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <Input
                label="Mobile / Phone Number"
                placeholder="e.g. +91 9158886444"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />

              <Input
                label="Installation / Delivery Address"
                placeholder="e.g. Flat 402, Kokitkar Garden, 100 Feet Rd"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
                <Input
                  label="PIN Code"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={addMode === 'customer' ? 'teal' : 'primary'}
              size="sm"
              type="submit"
              isLoading={isProvisioning}
            >
              {addMode === 'customer' ? 'Create Customer Account' : 'Enroll Administrator'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CREDENTIALS SUCCESS & COPY MODAL */}
      <Modal
        isOpen={!!createdCredentials}
        onClose={() => setCreatedCredentials(null)}
        title="Account Created &amp; Credentials Ready"
        subtitle="The account has been created in Firebase Authentication. Copy these credentials to send to the user."
        maxWidth="md"
      >
        {createdCredentials && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Account Successfully Registered!</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                This account can now log into the portal directly using the credentials below.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-sans font-bold">Account Name:</span>
                <strong className="text-slate-900">{createdCredentials.name}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-sans font-bold">Assigned Role:</span>
                <strong className="text-indigo-700">{createdCredentials.role}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-sans font-bold">Login Email:</span>
                <strong className="text-slate-900">{createdCredentials.email}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-sans font-bold">Password:</span>
                <strong className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {createdCredentials.password}
                </strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-sans font-bold">Portal URL:</span>
                <span className="text-blue-700 underline">{window.location.origin}/login</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreatedCredentials(null)}
              >
                Close
              </Button>

              <Button
                variant={hasCopied ? 'teal' : 'primary'}
                size="sm"
                onClick={handleCopyCredentials}
                icon={hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {hasCopied ? 'Copied to Clipboard!' : 'Copy Login Credentials'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

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

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Administrator Details"
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Display Name *"
            value={editDisplayName}
            onChange={e => setEditDisplayName(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Role</label>
            <select
              value={editRole}
              onChange={e => setEditRole(e.target.value as UserRole)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="super_admin">Corporate Super Admin</option>
              <option value="innovations_admin">Nexalus Innovations Admin</option>
              <option value="am_admin">A.M. Distributors Admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Assigned Entity</label>
            <select
              value={editBrandId}
              onChange={e => setEditBrandId(e.target.value as any)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="all">Consolidated / All Operations</option>
              <option value="nexalus-innovations">Nexalus Innovations</option>
              <option value="am-distributors">A.M. Distributors Chiplun</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={editActive}
              onChange={e => setEditActive(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600"
            />
            <span>Active Account (Able to login)</span>
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSavingEdit}>
              Save Changes
            </Button>
          </div>
        </form>
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
