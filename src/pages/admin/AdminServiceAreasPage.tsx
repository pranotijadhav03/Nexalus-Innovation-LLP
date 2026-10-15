import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea
} from '../../firebase/services';
import { ServiceArea } from '../../types';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Plus, Edit2, Trash2, MapPin, ShieldAlert } from 'lucide-react';

export const AdminServiceAreasPage: React.FC = () => {
  const { isAmAdmin } = useAuth();
  const { success, error } = useToast();

  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);

  // Form State
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560034');
  const [status, setStatus] = useState<'fully_operational' | 'expanding_soon' | 'planned'>('fully_operational');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [deleteCandidate, setDeleteCandidate] = useState<ServiceArea | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getServiceAreas();
      setAreas(data);
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
          Fiber internet service area management belongs to Nexalus Innovations (CCTV, Internet, Network).
        </p>
      </div>
    );
  }

  const openCreateModal = () => {
    setEditingArea(null);
    setLocality('');
    setCity('Bengaluru');
    setState('Karnataka');
    setPincode('');
    setStatus('fully_operational');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (area: ServiceArea) => {
    setEditingArea(area);
    setLocality(area.locality);
    setCity(area.city);
    setState(area.state);
    setPincode(area.pincode);
    setStatus(area.status);
    setNotes(area.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locality.trim() || !pincode.trim()) {
      error('Validation Error', 'Locality and PIN code are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        brandId: 'one-broadband' as const,
        locality,
        city,
        state,
        pincode: pincode.trim(),
        status,
        notes
      };

      if (editingArea) {
        await updateServiceArea(editingArea.id, payload);
        success('Service Area Updated', `${locality} updated.`);
      } else {
        await createServiceArea(payload);
        success('Service Area Added', `${locality} added to verified registry.`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to save area', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteServiceArea(deleteCandidate.id);
      success('Area Removed', `${deleteCandidate.locality} was deleted.`);
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
            One Broadband Service Areas & Coverage Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage official serviceable zones queried by the public coverage checker.
          </p>
        </div>

        <Button variant="teal" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Add Coverage Zone
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">PIN Code</th>
                <th className="py-3.5 px-4">Locality / Zone</th>
                <th className="py-3.5 px-4">City / State</th>
                <th className="py-3.5 px-4">Operational Status</th>
                <th className="py-3.5 px-4">Feeder Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {areas.map(area => (
                <tr key={area.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {area.pincode}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {area.locality}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {area.city}, {area.state}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        area.status === 'fully_operational'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-cyan-50 text-cyan-700'
                      }`}
                    >
                      {area.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 truncate max-w-xs">
                    {area.notes || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(area)}
                        className="p-1.5 text-slate-500 hover:text-teal-600 rounded-lg"
                        title="Edit Zone"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(area)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg"
                        title="Delete Zone"
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArea ? 'Edit Coverage Zone' : 'Add Coverage Zone'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Locality / Neighborhood *"
            placeholder="e.g. Koramangala 5th Block"
            value={locality}
            onChange={e => setLocality(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="6-Digit PIN Code *"
              placeholder="560034"
              value={pincode}
              onChange={e => setPincode(e.target.value)}
              required
            />
            <Select
              label="Operational Status"
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              options={[
                { value: 'fully_operational', label: 'Fully Operational (24h Setup)' },
                { value: 'expanding_soon', label: 'Expanding Soon (Rolling Out)' },
                { value: 'planned', label: 'Planned / Future Node' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={city}
              onChange={e => setCity(e.target.value)}
            />
            <Input
              label="State"
              value={state}
              onChange={e => setState(e.target.value)}
            />
          </div>

          <Input
            label="Internal Notes"
            placeholder="e.g. Node IND-04 active; gigabit capacity confirmed"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="teal" isLoading={isSaving}>
              Save Service Area
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Area Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to delete <strong className="text-slate-900">{deleteCandidate?.locality}</strong>?
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
