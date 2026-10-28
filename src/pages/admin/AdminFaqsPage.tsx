import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { AdminOutletContext, AdminConsoleMode } from '../../components/admin/AdminLayout';
import { getFaqs, createFaq, updateFaq, deleteFaq, getCachedFaqs } from '../../firebase/services';
import { FAQ, BrandId } from '../../types';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BrandBadge } from '../../components/common/BrandBadge';
import { Plus, Edit2, Trash2, HelpCircle } from 'lucide-react';

export const AdminFaqsPage: React.FC = () => {
  const { isSuperAdmin, isInnovationsAdmin, isAmAdmin, canManageBrand } = useAuth();
  const outletCtx = useOutletContext<AdminOutletContext>();
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();

  const consoleParam = searchParams.get('console');
  const effectiveConsole: AdminConsoleMode = (isAmAdmin || consoleParam === 'am-distributors' || outletCtx?.activeConsole === 'am-distributors')
    ? 'am-distributors'
    : (isInnovationsAdmin || consoleParam === 'nexalus-innovations' || outletCtx?.activeConsole === 'nexalus-innovations')
    ? 'nexalus-innovations'
    : 'master';

  const initialBrand = effectiveConsole === 'am-distributors'
    ? 'am-distributors'
    : effectiveConsole === 'nexalus-innovations'
    ? 'nexalus-innovations'
    : 'nexalus';
  const [faqs, setFaqs] = useState<FAQ[]>(() => getCachedFaqs(initialBrand));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  // Form State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [brandId, setBrandId] = useState<BrandId | 'nexalus'>(() => {
    if (effectiveConsole === 'am-distributors') return 'am-distributors';
    if (effectiveConsole === 'nexalus-innovations') return 'nexalus-innovations';
    return 'nexalus';
  });
  const [category, setCategory] = useState('General');
  const [order, setOrder] = useState('1');
  const [published, setPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteCandidate, setDeleteCandidate] = useState<FAQ | null>(null);

  const loadData = async () => {
    const effectiveBrand = effectiveConsole === 'am-distributors'
      ? 'am-distributors'
      : effectiveConsole === 'nexalus-innovations'
      ? 'nexalus-innovations'
      : 'nexalus';
    const data = await getFaqs(effectiveBrand);
    setFaqs(data);
  };

  useEffect(() => {
    loadData();
  }, [effectiveConsole]);

  const openCreateModal = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    const defaultBrand = effectiveConsole === 'am-distributors'
      ? 'am-distributors'
      : effectiveConsole === 'nexalus-innovations'
      ? 'nexalus-innovations'
      : 'nexalus';
    setBrandId(defaultBrand);
    setCategory(effectiveConsole === 'am-distributors' ? 'Cold-Chain & Water Supply' : 'General');
    setOrder(String(faqs.length + 1));
    setPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (f: FAQ) => {
    if (!canManageBrand(f.brandId)) {
      error('Access Denied', 'Cannot edit FAQs for another brand.');
      return;
    }
    setEditingFaq(f);
    setQuestion(f.question);
    setAnswer(f.answer);
    setBrandId(f.brandId);
    setCategory(f.category);
    setOrder(String(f.order));
    setPublished(f.published);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    if (!canManageBrand(brandId)) {
      error('Access Denied', 'Cannot save FAQ for unassigned brand.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        question,
        answer,
        brandId,
        category,
        order: parseInt(order) || 1,
        published
      };

      if (editingFaq) {
        await updateFaq(editingFaq.id, payload);
        success('FAQ Updated', 'Question and answer updated.');
      } else {
        await createFaq(payload);
        success('FAQ Created', 'New FAQ added.');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Save Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteFaq(deleteCandidate.id);
      success('FAQ Deleted', 'Question was removed.');
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
            {effectiveConsole === 'am-distributors'
              ? 'A.M. Distributors Chiplun Depot FAQs'
              : effectiveConsole === 'nexalus-innovations'
              ? 'Nexalus Innovations Tech & Security FAQs'
              : 'Frequently Asked Questions (FAQ) Management'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {effectiveConsole === 'am-distributors'
              ? 'Maintain customer questions for packaged drinking water, commercial ice cream cold-chain, and morning dairy delivery.'
              : effectiveConsole === 'nexalus-innovations'
              ? 'Maintain customer answers for CCTV surveillance, optical fiber broadband, and office networking.'
              : 'Maintain authoritative customer answers across all operating divisions and holding company operations.'}
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Add New FAQ
        </Button>
      </div>

      <div className="space-y-3">
        {faqs
          .filter(faq => {
            if (effectiveConsole === 'am-distributors') {
              return faq.brandId === 'am-distributors';
            }
            if (effectiveConsole === 'nexalus-innovations') {
              return ['nexalus-innovations', 'cp-plus', 'one-broadband', 'itti-networking'].includes(faq.brandId);
            }
            // Master Console (Parent Company) - strictly parent corporate FAQs!
            return faq.brandId === 'nexalus' || (faq.brandId as any) === 'corporate';
          })
          .map(faq => (
          <div
            key={faq.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <BrandBadge brandId={faq.brandId} size="sm" />
                <span className="text-[11px] font-semibold text-slate-500">{faq.category}</span>
                <span className="text-[11px] font-mono text-slate-400">Order #{faq.order}</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{faq.question}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => openEditModal(faq)}
                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"
                title="Edit FAQ"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteCandidate(faq)}
                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg"
                title="Delete FAQ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaq ? 'Edit FAQ' : 'Add FAQ'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Question *"
            placeholder="e.g. Can I monitor CP PLUS cameras remotely on smartphone?"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isSuperAdmin ? (
              <Select
                label="Operating Company *"
                value={brandId}
                onChange={e => setBrandId(e.target.value as any)}
                options={[
                  ...(effectiveConsole === 'master' ? [{ value: 'nexalus', label: 'Nexalus Corporate Parent (Turnkey & Enterprise)' }] : []),
                  ...(effectiveConsole === 'nexalus-innovations' ? [{ value: 'nexalus-innovations', label: 'Nexalus Innovations (CCTV, Internet, Network)' }] : []),
                  ...(effectiveConsole === 'am-distributors' ? [{ value: 'am-distributors', label: 'A.M. Distributors Chiplun' }] : [])
                ]}
              />
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Operating Company
                </label>
                <div className="p-2.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-800">
                  {brandId === 'am-distributors' ? 'A.M. Distributors Chiplun' : 'Nexalus Innovations'} (Role Locked)
                </div>
              </div>
            )}

            <Input
              label="Topic Category"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />

            <Input
              label="Sort Order"
              type="number"
              value={order}
              onChange={e => setOrder(e.target.value)}
            />
          </div>

          <TextArea
            label="Official Answer *"
            placeholder="Verified factual answer approved by management..."
            rows={4}
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            required
          />

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={published}
                onChange={e => setPublished(e.target.checked)}
                className="rounded text-blue-600 w-4 h-4"
              />
              Published to FAQ
            </label>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save FAQ
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm FAQ Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to delete <strong className="text-slate-900">{deleteCandidate?.question}</strong>?
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
