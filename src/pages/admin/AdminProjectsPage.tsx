import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  uploadImageFile,
  getProjectCategories,
  addProjectCategory,
  deleteProjectCategory
} from '../../firebase/services';
import { Project, BrandId } from '../../types';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BrandBadge } from '../../components/common/BrandBadge';
import { Plus, Edit2, Trash2, FolderGit2, Upload, X, Tag, Image as ImageIcon } from 'lucide-react';

export const AdminProjectsPage: React.FC = () => {
  const { isSuperAdmin, isInnovationsAdmin, isAmAdmin, canManageBrand } = useAuth();
  const { activeBrandFilter } = useOutletContext<{ activeBrandFilter: BrandId | 'all' }>();
  const { success, error } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>(() => getProjectCategories());
  const [isLoading, setIsLoading] = useState(false);

  // Category Manager Modal State (Outside Form)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('4K CCTV Surveillance');
  const [brandId, setBrandId] = useState<BrandId | 'nexalus'>('nexalus');
  const [clientType, setClientType] = useState<Project['clientType']>('Enterprise');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [solutionProvided, setSolutionProvided] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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
      setCategories(getProjectCategories());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleCategoriesUpdate = (e: any) => {
      if (Array.isArray(e.detail)) {
        setCategories(e.detail);
      } else {
        setCategories(getProjectCategories());
      }
    };
    window.addEventListener('nexalus_project_categories_updated', handleCategoriesUpdate);
    return () => {
      window.removeEventListener('nexalus_project_categories_updated', handleCategoriesUpdate);
    };
  }, [activeBrandFilter]);

  // Handle Photo File Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingPhoto(true);
      try {
        const photoUrl = await uploadImageFile(file, 'projects');
        if (photoUrl) {
          setImages(prev => [photoUrl, ...prev.filter(img => img !== photoUrl)]);
          success('Photo Attached', 'Project photo uploaded and compressed.');
        }
      } catch (err: any) {
        error('Upload Failed', err?.message || 'Could not process photo file.');
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  // Add category outside form
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const updated = await addProjectCategory(newCategoryName.trim());
      setCategories(updated);
      setCategory(newCategoryName.trim());
      setNewCategoryName('');
      success('Category Added', 'New project category created successfully.');
    } catch (err: any) {
      error('Failed', err?.message || 'Could not add category.');
    }
  };

  // Delete category outside form
  const handleDeleteCategory = async (catName: string) => {
    try {
      const updated = await deleteProjectCategory(catName);
      setCategories(updated);
      if (category === catName && updated.length > 0) {
        setCategory(updated[0]);
      }
      success('Category Removed', `Removed category "${catName}".`);
    } catch (err: any) {
      error('Failed', err?.message || 'Could not delete category.');
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    const defaultBrand = activeBrandFilter === 'am-distributors' || isAmAdmin
      ? 'am-distributors'
      : activeBrandFilter === 'nexalus-innovations' || isInnovationsAdmin
      ? 'nexalus-innovations'
      : 'nexalus';
    setBrandId(defaultBrand);
    const availableCategories = getProjectCategories();
    setCategory(availableCategories[0] || '4K CCTV Surveillance');
    setClientType('Commercial');
    setLocation('Bengaluru');
    setDescription('');
    setSolutionProvided('');
    setImages(['/images/projects/tech-park-real.jpg']);
    setImageUrlInput('');
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
    setCategory(proj.category || categories[0] || '4K CCTV Surveillance');
    setBrandId(proj.brandId);
    setClientType(proj.clientType);
    setLocation(proj.location);
    setDescription(proj.description);
    setSolutionProvided(proj.solutionProvided);
    setImages([...proj.images]);
    setImageUrlInput('');
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
        category: category.trim() || 'General Engineering',
        brandId,
        clientType,
        location,
        description,
        solutionProvided,
        scope: ['Turnkey Cable & Device Installation', 'Quality Verification & Handoff'],
        images: images.length > 0 ? images : ['/images/server-racks-4508751.jpg'],
        featured,
        published,
        completionDate
      };

      if (editingProject) {
        await updateProject(editingProject.id, payload);
        success('Project Updated', `${title} updated.`);
      } else {
        await createProject(payload);
        success('Project Created', `${title} published to Project Gallery.`);
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-blue-600" />
            <span>Project Gallery</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage completed client installations, turnkey deployments, and gallery photos reflected on the landing page.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Manage Categories Button (Outside Form) */}
          <Button
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
            icon={<Tag className="w-4 h-4 text-indigo-600" />}
          >
            Manage Categories
          </Button>

          {/* Add Project Button */}
          <Button
            variant="primary"
            onClick={openCreateModal}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Project to Gallery
          </Button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Project Title &amp; Photo</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Operating Company</th>
                <th className="py-3.5 px-4">Client Sector</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Completion Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.filter(proj => {
                if (activeBrandFilter === 'am-distributors' || isAmAdmin) return proj.brandId === 'am-distributors';
                if (activeBrandFilter === 'nexalus-innovations' || (isInnovationsAdmin && !isSuperAdmin)) {
                  return proj.brandId === 'nexalus-innovations' || proj.brandId === 'cp-plus' || proj.brandId === 'one-broadband' || proj.brandId === 'itti-networking';
                }
                return proj.brandId === 'nexalus';
              }).map(proj => (
                <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <img
                        src={proj.images[0] || '/images/projects/tech-park-real.jpg'}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200 shadow-xs"
                      />
                      <div className="truncate max-w-xs">{proj.title}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {proj.category || 'General'}
                    </span>
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
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(proj)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
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

      {/* Category Manager Modal (Outside Form) */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Manage Project Gallery Categories"
        maxWidth="md"
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-500">
            These categories are used to filter project case studies on the public landing page and categorize newly added projects.
          </p>

          {/* Add Category Input */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <Input
              placeholder="e.g. Solar Surveillance, Cold Storage"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary" size="sm">
              Add Category
            </Button>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Current Categories ({categories.length})
            </div>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
              {categories.map(cat => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-800 border border-slate-300 shadow-2xs group"
                >
                  <Tag className="w-3 h-3 text-blue-500" />
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-0.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    title={`Delete ${cat}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsCategoryModalOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project Record' : 'Add Project to Gallery'}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Selection */}
            <Select
              label="Project Category *"
              value={category}
              onChange={e => setCategory(e.target.value)}
              options={categories.map(c => ({ value: c, label: c }))}
            />

            {/* Client Sector */}
            <Select
              label="Client Sector"
              value={clientType}
              onChange={e => setClientType(e.target.value as any)}
              options={[
                { value: 'Enterprise', label: 'Enterprise / Corporate' },
                { value: 'Commercial', label: 'Commercial Complex' },
                { value: 'Residential', label: 'Residential Community' },
                { value: 'Government', label: 'Government / Public' },
                { value: 'Retail', label: 'Retail Chains' },
                { value: 'Logistics', label: 'Logistics & Distribution' },
                { value: 'Industrial', label: 'Industrial & Depot' },
                { value: 'Wholesale', label: 'Wholesale & FMCG' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Operating Company */}
            {isSuperAdmin ? (
              <Select
                label="Operating Company *"
                value={brandId}
                onChange={e => setBrandId(e.target.value as any)}
                options={[
                  ...(activeBrandFilter === 'nexalus' ? [{ value: 'nexalus', label: 'Nexalus Corporate Parent (Turnkey & Enterprise)' }] : []),
                  ...(activeBrandFilter === 'nexalus-innovations' ? [
                    { value: 'nexalus-innovations', label: 'Nexalus Innovations (Tech & Hardware)' },
                    { value: 'cp-plus', label: 'CP PLUS Surveillance' },
                    { value: 'one-broadband', label: 'ONE Broadband Optical Fiber' }
                  ] : []),
                  ...(activeBrandFilter === 'am-distributors' ? [{ value: 'am-distributors', label: 'A.M. Distributors Chiplun' }] : [])
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

            <Input
              label="Premises Location *"
              placeholder="e.g. Electronic City, Bengaluru"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Photo Upload & Preview Section */}
          <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Project Cover Photo
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-2xs">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Upload Photo from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              <div className="flex-1 w-full flex items-center gap-2">
                <Input
                  placeholder="Or paste image URL / path"
                  value={imageUrlInput}
                  onChange={e => setImageUrlInput(e.target.value)}
                  className="flex-1 text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (imageUrlInput.trim()) {
                      setImages([imageUrlInput.trim(), ...images]);
                      setImageUrlInput('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Thumbnail Preview with Delete Option */}
            {images.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2.5">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group w-20 h-16 rounded-xl overflow-hidden border border-slate-300 shadow-xs bg-white">
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-full opacity-80 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Remove Photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {isUploadingPhoto && (
              <div className="text-xs text-blue-600 font-semibold animate-pulse">
                Uploading and compressing photo...
              </div>
            )}
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
                  className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                />
                Featured
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={e => setPublished(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                />
                Published
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
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
