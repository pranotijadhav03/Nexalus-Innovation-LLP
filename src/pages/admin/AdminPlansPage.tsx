import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getInternetPlans,
  createInternetPlan,
  updateInternetPlan,
  deleteInternetPlan
} from '../../firebase/services';
import { InternetPlan } from '../../types';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Plus, Edit2, Trash2, Wifi, Zap, Check, ShieldAlert, Sparkles } from 'lucide-react';

export const AdminPlansPage: React.FC = () => {
  const { isAmAdmin } = useAuth();
  const { success, error } = useToast();

  const [plans, setPlans] = useState<InternetPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InternetPlan | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [speed, setSpeed] = useState('300 Mbps');
  const [speedNumeric, setSpeedNumeric] = useState('300');
  const [price, setPrice] = useState('999');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');
  const [dataAllowance, setDataAllowance] = useState('Truly Unlimited');
  const [features, setFeatures] = useState<string[]>([
    'Symmetrical Download & Upload Speed',
    'Free Wi-Fi 6 Router Rental Included',
    '24/7 Dedicated Support SLA'
  ]);
  const [popular, setPopular] = useState(false);
  const [featured, setFeatured] = useState(true);
  const [published, setPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteCandidate, setDeleteCandidate] = useState<InternetPlan | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getInternetPlans();
      setPlans(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isAmAdmin) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center max-w-lg mx-auto space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600">
          Your account is assigned to A.M. Distributors Chiplun (Cold-Chain &amp; Logistics). Internet plans belong to Nexalus Innovations (CCTV, Internet, Network) and are restricted from your scope.
        </p>
      </div>
    );
  }

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setSpeed('100 Mbps');
    setSpeedNumeric('100');
    setPrice('699');
    setBillingPeriod('monthly');
    setDataAllowance('Truly Unlimited');
    setFeatures([
      'Symmetrical Speed Guarantee',
      'Dual-Band Wi-Fi Router Setup',
      'Low Jitter & Optimized Peering'
    ]);
    setPopular(false);
    setFeatured(true);
    setPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: InternetPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setSpeed(plan.speed);
    setSpeedNumeric(String(plan.speedNumeric));
    setPrice(String(plan.price));
    setBillingPeriod(plan.billingPeriod);
    setDataAllowance(plan.dataAllowance);
    setFeatures([...plan.includedFeatures]);
    setPopular(!!plan.popular);
    setFeatured(plan.featured);
    setPublished(plan.published);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !speed.trim()) {
      error('Validation Error', 'Plan Name and Speed are required.');
      return;
    }

    setIsSaving(true);
    try {
      const generatedSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const planPayload = {
        brandId: 'one-broadband' as const,
        name,
        slug: generatedSlug,
        speed,
        speedNumeric: parseInt(speedNumeric) || 100,
        price: parseFloat(price) || 0,
        billingPeriod,
        dataAllowance,
        includedFeatures: features.filter(f => f.trim() !== ''),
        availability: 'active' as const,
        popular,
        featured,
        published
      };

      if (editingPlan) {
        await updateInternetPlan(editingPlan.id, planPayload);
        success('Plan Updated', `${name} has been updated.`);
      } else {
        await createInternetPlan(planPayload);
        success('Plan Created', `${name} is now live.`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to save plan', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteInternetPlan(deleteCandidate.id);
      success('Plan Removed', `${deleteCandidate.name} has been deleted.`);
      setDeleteCandidate(null);
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Internet Plan Management (One Broadband)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure broadband speed tiers, monthly pricing, feature inclusions, and homepage highlights.
          </p>
        </div>

        <Button
          variant="teal"
          onClick={openCreateModal}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Internet Plan
        </Button>
      </div>

      {/* Plans List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Plan Name</th>
                <th className="py-3.5 px-4">Speed</th>
                <th className="py-3.5 px-4">Tariff Price</th>
                <th className="py-3.5 px-4">Allowance</th>
                <th className="py-3.5 px-4">Status / Popular</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map(plan => (
                <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                        <Wifi className="w-4 h-4" />
                      </div>
                      <div>
                        <div>{plan.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {plan.includedFeatures.length} features included
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-black text-teal-800">
                    {plan.speed}
                  </td>

                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    ₹{plan.price} / {plan.billingPeriod}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {plan.dataAllowance}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          plan.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {plan.published ? 'Published' : 'Draft'}
                      </span>
                      {plan.popular && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                          Popular
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(plan)}
                        className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit Plan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(plan)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Plan"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Internet Plan' : 'Create Internet Plan'}
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Plan Name *"
              placeholder="e.g. Stream Pro 300"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <Input
              label="Speed Label *"
              placeholder="e.g. 300 Mbps"
              value={speed}
              onChange={e => setSpeed(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Numeric Speed (for sorting)"
              type="number"
              placeholder="300"
              value={speedNumeric}
              onChange={e => setSpeedNumeric(e.target.value)}
              required
            />
            <Input
              label="Price (INR) *"
              type="number"
              placeholder="999"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
            <Select
              label="Billing Period"
              value={billingPeriod}
              onChange={e => setBillingPeriod(e.target.value as any)}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'annually', label: 'Annually' }
              ]}
            />
          </div>

          <Input
            label="Data Allowance Policy"
            placeholder="e.g. Truly Unlimited or 3300 GB Commercial"
            value={dataAllowance}
            onChange={e => setDataAllowance(e.target.value)}
          />

          {/* Included Features Editor */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Included Features
              </label>
              <button
                type="button"
                onClick={() => setFeatures([...features, ''])}
                className="text-xs font-bold text-teal-600 hover:text-teal-800"
              >
                + Add Feature
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {features.map((feat, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    placeholder="e.g. Symmetrical 300 Mbps Upload/Download"
                    value={feat}
                    onChange={e => {
                      const updated = [...features];
                      updated[idx] = e.target.value;
                      setFeatures(updated);
                    }}
                    className="flex-1 rounded-lg border border-slate-300 text-xs px-3 py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={e => setPopular(e.target.checked)}
                  className="rounded text-teal-600 w-4 h-4"
                />
                Popular Badge
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={e => setPublished(e.target.checked)}
                  className="rounded text-teal-600 w-4 h-4"
                />
                Published
              </label>
            </div>

            <Button type="submit" variant="teal" isLoading={isSaving}>
              Save Internet Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Plan Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to delete <strong className="text-slate-900">{deleteCandidate?.name}</strong>?
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
