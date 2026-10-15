import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getUsers, updateUser, createUser } from '../../firebase/services';
import { AdminUser, BrandId, UserRole } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Users, UserPlus, Shield, CheckCircle2, XCircle, KeyRound, Mail, AlertTriangle } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { isSuperAdmin, currentUser } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New user form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Admin@Nexalus2026');
  const [role, setRole] = useState<UserRole>('innovations_admin');
  const [assignedBrandId, setAssignedBrandId] = useState<BrandId | 'all'>('nexalus-innovations');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const u = await getUsers();
        setUsers(u);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.email === currentUser?.email) {
      error('Operation Forbidden', 'You cannot deactivate your own active session account.');
      return;
    }
    try {
      const updated = await updateUser(user.uid, { active: !user.active });
      if (updated) {
        setUsers(prev => prev.map(u => (u.uid === user.uid ? updated : u)));
        success('User Updated', `${user.displayName} is now ${!user.active ? 'Active' : 'Deactivated'}.`);
      }
    } catch (err: any) {
      error('Failed to update user', err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !displayName.trim()) {
      error('Missing Information', 'Please provide a full name and email address.');
      return;
    }

    try {
      const newUser = await createUser({
        displayName: displayName.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() || 'Admin@Nexalus2026',
        role,
        assignedBrandId: role === 'am_admin' ? 'am-distributors' : role === 'super_admin' ? 'all' : 'nexalus-innovations',
        active: true
      });
      setUsers(prev => [...prev, newUser]);
      success('User Created', `Administrator access granted to ${newUser.email}`);
      setIsModalOpen(false);
      setDisplayName('');
      setEmail('');
      setPassword('Admin@Nexalus2026');
      setRole('innovations_admin');
    } catch (err: any) {
      error('Failed to create user', err.message);
    }
  };

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'super_admin':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Parent Corporate Master Admin</span>;
      case 'innovations_admin':
      case 'cp_plus_admin':
      case 'one_broadband_admin':
      case 'networking_admin':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">Nexalus Innovations Admin</span>;
      case 'am_admin':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">A.M. Distributors Admin</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Staff Member</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Staff & Role Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage administrative role segregation and security access between Nexalus Parent, Nexalus Innovations, and A.M. Distributors Chiplun.
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add New Administrator
          </Button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Administrator</th>
                <th className="py-3.5 px-4">Role & Scope</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.uid} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <div className="font-bold text-slate-900">{u.displayName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getRoleBadge(u.role)}
                  </td>
                  <td className="py-4 px-4">
                    {u.active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-600" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-500 text-[11px]">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {isSuperAdmin && u.email !== currentUser?.email && (
                      <Button
                        variant={u.active ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Administrative Account"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Anand Murthy"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. anand@nexalusinnovations.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            label="Security Password"
            type="text"
            placeholder="e.g. Secure@Nexalus2026"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role & Division Scope
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white"
            >
              <option value="super_admin">Nexalus Parent Corporate Master Admin</option>
              <option value="innovations_admin">Nexalus Innovations Admin (CCTV, Internet, Network)</option>
              <option value="am_admin">A.M. Distributors Chiplun Admin (Cold-Chain & Logistics)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Grant Access
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
