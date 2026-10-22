import React, { useState, useEffect, useMemo } from 'react';
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
  EyeOff
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { isSuperAdmin, currentUser } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<AdminUser[]>(() => getCachedUsers());
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Add User Modal State
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

  // Delete User Candidate
  const [deleteCandidate, setDeleteCandidate] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const u = await getUsers();
      setUsers(u);
    } catch (err: any) {
      error('Failed to load administrators', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.active) ||
        (statusFilter === 'inactive' && !u.active);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Top-level Super-Admin Authorization Guard
  if (!isSuperAdmin) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center max-w-lg mx-auto space-y-4 shadow-sm my-12">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Staff & Role Permissions is strictly restricted to Corporate Super Administrators (Nexalus Parent). Child-company administrators cannot access, inspect, or manage administrative staff accounts.
        </p>
      </div>
    );
  }

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

  const handleSendResetEmail = async (targetEmail: string) => {
    if (!auth) {
      error('Authentication Error', 'Firebase Authentication service is offline.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      success('Reset Email Dispatched', `Firebase password reset link sent to ${targetEmail}`);
    } catch (err: any) {
      error('Reset Failed', err.message || 'Could not send password reset email.');
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
        `Account for ${targetEmail} created in Firebase Authentication with your specified password. The administrator can log in immediately at /admin/login.`
      );

      setIsAddModalOpen(false);
      setDisplayName('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setSendResetEmailCheck(false);
      setRole('innovations_admin');
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
        success('Profile Updated', `Updated permissions and details for ${updated.displayName}.`);
      }
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      error('Update Failed', err.message || 'Failed to save changes.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteCandidate) return;
    if (deleteCandidate.email === currentUser?.email) {
      error('Operation Forbidden', 'You cannot delete your own account.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(deleteCandidate.uid);
      setUsers(prev => prev.filter(u => u.uid !== deleteCandidate.uid));
      success('User Deleted', `Administrator profile ${deleteCandidate.displayName} has been removed.`);
      setDeleteCandidate(null);
    } catch (err: any) {
      error('Delete Failed', err.message || 'Could not delete administrator.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (userRole: string, brandScope?: string) => {
    switch (userRole) {
      case 'super_admin':
        return (
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
              <Shield className="w-3.5 h-3.5 text-blue-700" /> Parent Corporate Master Admin
            </span>
            <div className="text-[10px] text-slate-500 font-medium">Scope: All Divisions & Child Companies</div>
          </div>
        );
      case 'innovations_admin':
      case 'cp_plus_admin':
      case 'one_broadband_admin':
      case 'networking_admin':
        return (
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-200">
              <Layers className="w-3.5 h-3.5 text-sky-700" /> Nexalus Innovations Admin
            </span>
            <div className="text-[10px] text-slate-500 font-medium">Scope: CCTV, Fiber Internet, Networking</div>
          </div>
        );
      case 'am_admin':
        return (
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
              <Building className="w-3.5 h-3.5 text-teal-700" /> A.M. Distributors Admin
            </span>
            <div className="text-[10px] text-slate-500 font-medium">Scope: Chiplun Cold-Chain & Dairy Logistics</div>
          </div>
        );
      case 'customer':
        return (
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Customer (Public Portal)
            </span>
            <div className="text-[10px] text-slate-500 font-medium">Scope: Customer Portal & Inquiries</div>
          </div>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {userRole} ({brandScope || 'general'})
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Staff & Role Permissions
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage administrative accounts, role segregation, and secure divisional boundaries across Nexalus Parent, Nexalus Innovations, and A.M. Distributors Chiplun.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Enroll Administrator
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by administrator name or email address..."
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
            <option value="all">All Roles & Divisions</option>
            <option value="super_admin">Corporate Super Admin</option>
            <option value="innovations_admin">Nexalus Innovations Admin</option>
            <option value="am_admin">A.M. Distributors Admin</option>
            <option value="customer">Customer Accounts</option>
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

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-xs font-semibold">Loading verified administrator accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p className="text-sm font-bold text-slate-700">No administrator records found</p>
            <p className="text-xs text-slate-400">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filter selections.'
                : 'Click "Enroll Administrator" to provision your first child-company admin.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Administrator</th>
                  <th className="py-3.5 px-4">Role & Scope</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => {
                  const isSelf = u.email.toLowerCase() === currentUser?.email.toLowerCase();
                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{u.displayName}</span>
                          {isSelf && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getRoleBadge(u.role, u.assignedBrandId)}
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
                      <td className="py-4 px-4 text-slate-500 text-[11px]">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Never'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSendResetEmail(u.email)}
                            title="Dispatch password setup / reset link to admin email"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Reset Link</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            title="Edit administrator role, brand assignment, or name"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {!isSelf && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                                  u.active
                                    ? 'text-amber-700 hover:bg-amber-50 border-amber-200'
                                    : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                                }`}
                              >
                                {u.active ? 'Deactivate' : 'Activate'}
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteCandidate(u)}
                                title="Delete administrator profile"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
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

      {/* Enroll New Administrator Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isProvisioning && setIsAddModalOpen(false)}
        title="Enroll New Administrator"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Anand Murthy"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            disabled={isProvisioning}
          />
          <Input
            label="Corporate / Official Email Address"
            type="email"
            placeholder="e.g. anand@nexalusinnovations.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={isProvisioning}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Account Login Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password for this administrator (min 6 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isProvisioning}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              This password is saved directly to Firebase Authentication. Share it with the administrator so they can sign in immediately at /admin/login.
            </p>
          </div>

          <div className="pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={sendResetEmailCheck}
                onChange={e => setSendResetEmailCheck(e.target.checked)}
                disabled={isProvisioning}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Also send password setup/reset email link to this user</span>
            </label>
          </div>

          <div className="p-3.5 bg-blue-50/80 border border-blue-200/90 rounded-2xl text-xs text-blue-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-blue-900">
              <Shield className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Real Firebase Authentication Account</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Enrolling creates a verified account directly in Firebase Authentication and stores the matching administrator profile in Cloud Firestore. Passwords are never stored on client machines; an official Firebase password setup link is dispatched immediately.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Role & Division Scope
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              disabled={isProvisioning}
              className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium text-slate-800"
            >
              <option value="innovations_admin">
                Nexalus Innovations Admin (CCTV, Optical Fiber Internet, Enterprise Network)
              </option>
              <option value="am_admin">
                A.M. Distributors Chiplun Admin (Packaged Water, Cold Storage & Dairy Logistics)
              </option>
              <option value="super_admin">
                Nexalus Parent Corporate Master Admin (Full System Oversight)
              </option>
              <option value="customer">
                Customer (Client Portal Access, No Administrative Privileges)
              </option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              disabled={isProvisioning}
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isProvisioning}
              icon={isProvisioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            >
              {isProvisioning ? 'Provisioning Account...' : 'Enroll & Dispatch Link'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Administrator Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isSavingEdit && setIsEditModalOpen(false)}
        title="Edit Administrator Profile"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="text-xs font-mono py-2 px-3 bg-slate-100 rounded-xl text-slate-600 border border-slate-200">
              {editingUser?.email}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Firebase Authentication identity emails are immutable for security.
            </p>
          </div>

          <Input
            label="Full Name"
            value={editDisplayName}
            onChange={e => setEditDisplayName(e.target.value)}
            required
            disabled={isSavingEdit}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Role Permission
            </label>
            <select
              value={editRole}
              onChange={e => {
                const nextRole = e.target.value as UserRole;
                setEditRole(nextRole);
                if (nextRole === 'am_admin') setEditBrandId('am-distributors');
                else if (nextRole === 'super_admin') setEditBrandId('all');
                else setEditBrandId('nexalus-innovations');
              }}
              disabled={isSavingEdit}
              className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium text-slate-800"
            >
              <option value="innovations_admin">Nexalus Innovations Admin (CCTV, Internet, Network)</option>
              <option value="am_admin">A.M. Distributors Chiplun Admin (Cold-Chain & Logistics)</option>
              <option value="super_admin">Nexalus Parent Corporate Master Admin</option>
              <option value="customer">Customer (Public Portal Only)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Assigned Division Scope
            </label>
            <select
              value={editBrandId}
              onChange={e => setEditBrandId(e.target.value as any)}
              disabled={isSavingEdit}
              className="w-full text-xs py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium text-slate-800"
            >
              <option value="all">All Divisions (Corporate Master)</option>
              <option value="nexalus-innovations">Nexalus Innovations (Tech & Fiber)</option>
              <option value="am-distributors">A.M. Distributors Chiplun (Cold-Chain)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="editActive"
              checked={editActive}
              onChange={e => setEditActive(e.target.checked)}
              disabled={isSavingEdit || editingUser?.email === currentUser?.email}
              className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="editActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Account Status Active (permits dashboard sign-in)
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              disabled={isSavingEdit}
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSavingEdit}
              icon={isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            >
              {isSavingEdit ? 'Saving Changes...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <Modal
          isOpen={!!deleteCandidate}
          onClose={() => !isDeleting && setDeleteCandidate(null)}
          title="Delete Administrator Profile"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete administrator account <span className="font-bold text-slate-900">{deleteCandidate.displayName}</span> ({deleteCandidate.email})?
            </p>
            <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl font-medium">
              This action removes their administrative authorization document from Cloud Firestore. They will immediately lose all access to the admin dashboard.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeleteCandidate(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteUser}
                icon={isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              >
                {isDeleting ? 'Deleting...' : 'Delete Profile'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
