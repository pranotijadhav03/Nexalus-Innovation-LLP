import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getProjects, createProject, updateProject, deleteProject, uploadImageFile } from '../../firebase/services';
import { Project, BrandId } from '../../types';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BrandBadge } from '../../components/common/BrandBadge';
import { Plus, Edit2, Trash2, FolderGit2, Upload, X } from 'lucide-react';

export const AdminProjectsPage: React.FC = () => {
  const { isSuperAdmin, isInnovationsAdmin, isAmAdmin, canManageBrand } = useAuth();
  const { activeBrandFilter } = useOutletContext<{ activeBrandFilter: BrandId | 'all' }>();
  const { success, error } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState<BrandId | 'nexalus'>('nexalus');
  const [clientType, setClientType] = useState<'Enterprise' | 'Commercial' | 'Residential' | 'Government' | 'Retail'>('Enterprise');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [solutionProvided, setSolutionProvided] = useState('');
  const [scopeList, setScopeList] = useState<string[]>(['Turnkey Cable & Device Installation']);
  const [images, setImages] = useState<string[]>([]);
  const [completionDate, setCompletionDate] = useState('2026-03-01');
  const [featured, setFeatured] = useState(true);
  const [published, setPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteCandidate, setDeleteCandidate] = useState<Project | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getProjects(activeBrandFilter === 'all' ? undefined : activeBrandFilter);
      setProjects(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeBrandFilter]);

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    const defaultBrand = isAmAdmin ? 'am-distributors' : 'nexalus-innovations';
    setBrandId(defaultBrand);
    setClientType('Commercial');
    setLocation('Bengaluru');
    setDescription('');
    setSolutionProvided('');
    setScopeList(['Site Assessment & Structured Cabling', 'Equipment Deployment & Setup']);
    setImages(['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80']);
    setCompletionDate(new Date().toISOString().split('T')[0]);
    setFeatured(true);
    setPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    if (!canManageBrand(proj.brandId)) {
      error('Access Denied', 'You cannot modify projects outside your brand.');
      return;
    }
    setEditingProject(proj);
    setTitle(proj.title);
    setBrandId(proj.brandId);
    setClientType(proj.clientType);
    setLocation(proj.location);
    setDescription(proj.description);
    setSolutionProvided(proj.solutionProvided);
    setScopeList([...proj.scope]);
    setImages([...proj.images]);
    setCompletionDate(proj.completionDate);
    setFeatured(proj.featured);
    setPublished(proj.published);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      error('Validation Error', 'Title and location are required.');
      return;
    }

    if (!canManageBrand(brandId)) {
      error('Access Denied', 'Cannot save project for unassigned brand.');
      return;
    }

    setIsSaving(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        title,
        slug,
        brandId,
        clientType,
        location,
        description,
        solutionProvided,
        scope: scopeList.filter(s => s.trim() !== ''),
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'],
        featured,
        published,
        completionDate
      };

      if (editingProject) {
        await updateProject(editingProject.id, payload);
        success('Project Updated', `${title} updated.`);
      } else {
        await createProject(payload);
        success('Project Created', `${title} published to portfolio.`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to save project', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteProject(deleteCandidate.id);
      success('Project Deleted', `${deleteCandidate.title} was removed.`);
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
            Portfolio & Project Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage completed case studies, installation galleries, and commercial scopes.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Add Project Case Study
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Project Title</th>
                <th className="py-3.5 px-4">Division</th>
                <th className="py-3.5 px-4">Sector / Client</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Completion Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map(proj => (
                <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <img
                        src={proj.images[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="truncate max-w-xs">{proj.title}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <BrandBadge brandId={proj.brandId} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {proj.clientType}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {proj.location}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    {proj.completionDate}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(proj)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(proj)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg"
                        title="Delete Project"
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
        title={editingProject ? 'Edit Project Record' : 'Create Project Record'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Project Title *"
            placeholder="e.g. Apex Tech Park — Integrated Campus Infrastructure"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isSuperAdmin ? (
              <Select
                label="Operating Company *"
                value={brandId}
                onChange={e => setBrandId(e.target.value as any)}
                options={[
                  { value: 'nexalus-innovations', label: 'Nexalus Innovations (CCTV, Internet, Network)' },
                  { value: 'am-distributors', label: 'A.M. Distributors Chiplun' }
                ]}
              />
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Operating Company
                </label>
                <div className="p-2.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-800">
                  {brandId === 'am-distributors' ? 'A.M. Distributors Chiplun' : 'Nexalus Innovations'}
                </div>
              </div>
            )}

            <Select
              label="Client Sector"
              value={clientType}
              onChange={e => setClientType(e.target.value as any)}
              options={[
                { value: 'Enterprise', label: 'Enterprise / Corporate' },
                { value: 'Commercial', label: 'Commercial Complex' },
                { value: 'Residential', label: 'Residential Community' },
                { value: 'Government', label: 'Government / Public' },
                { value: 'Retail', label: 'Retail Chains' }
              ]}
            />

            <Input
              label="Premises Location"
              placeholder="e.g. Electronic City, Bengaluru"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />
          </div>

          <TextArea
            label="Project Overview & Problem Statement"
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <TextArea
            label="Solution Provided by Nexalus"
            rows={2}
            value={solutionProvided}
            onChange={e => setSolutionProvided(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Completion Date (YYYY-MM-DD)"
              value={completionDate}
              onChange={e => setCompletionDate(e.target.value)}
            />
            <div className="flex items-center gap-4 pt-6 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={e => setFeatured(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4"
                />
                Featured
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={e => setPublished(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4"
                />
                Published
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Project Case Study
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Project Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to delete <strong className="text-slate-900">{deleteCandidate?.title}</strong>?
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
