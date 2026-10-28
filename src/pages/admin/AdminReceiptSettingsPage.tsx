import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  getReceiptSettings,
  updateReceiptSettings,
  getCachedReceiptSettings,
  subscribeReceiptSettings,
  DEFAULT_RECEIPT_SETTINGS
} from '../../firebase/services';
import { ReceiptSettings } from '../../types';
import { Button } from '../../components/common/Button';
import { Input, TextArea } from '../../components/common/Input';
import {
  FileText,
  Save,
  RotateCcw,
  Building,
  UserCheck,
  ShieldCheck,
  Plus,
  Trash2,
  Eye,
  Sparkles,
  Percent,
  Layers,
  ToggleLeft,
  ToggleRight,
  Upload,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { VERIFIED_COMPANY_DETAILS } from '../../utils/documentGenerator';

export const AdminReceiptSettingsPage: React.FC = () => {
  const { success, error } = useToast();
  const [settings, setSettings] = useState<ReceiptSettings>(() => getCachedReceiptSettings());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingSign, setIsUploadingSign] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [previewTab, setPreviewTab] = useState<'paid_receipt' | 'booking_slip'>('paid_receipt');

  useEffect(() => {
    setIsLoading(true);
    const unsub = subscribeReceiptSettings((s) => {
      setSettings(s);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleChange = (field: keyof ReceiptSettings, value: any) => {
    setSettings((prev: ReceiptSettings) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggle = async (field: keyof ReceiptSettings) => {
    const nextVal = !settings[field];
    const updated = {
      ...settings,
      [field]: nextVal
    };
    setSettings(updated);
    try {
      await updateReceiptSettings({ [field]: nextVal });
      const labelMap: Record<string, string> = {
        showSignatory: 'Authorized Signatory Box',
        showInstallationPremises: 'Service & Installation Premises',
        showPaymentInfo: 'Payment Info Details',
        showOfficialNotice: 'Official Notice & Notes',
        showGstRow: 'GST & Tax Row',
        showTagline: 'Company Tagline'
      };
      success('Instant Sync', `${labelMap[field] || String(field)} is now ${nextVal ? 'ENABLED' : 'DISABLED'}.`);
    } catch (err: any) {
      error('Toggle Failed', err?.message);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Invalid File', 'Please select an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      error('File Too Large', 'Signature image should be smaller than 5MB.');
      return;
    }

    setIsUploadingSign(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rawBase64 = reader.result as string;
        // Optimize and resize signature image
        const img = new Image();
        img.src = rawBase64;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const maxDim = 500;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/png');
            setSettings(prev => ({ ...prev, signatureImageUrl: optimizedBase64 }));
            await updateReceiptSettings({ signatureImageUrl: optimizedBase64 });
            success('Signature Uploaded', 'Official signature graphic uploaded and synced across all receipts.');
          }
          setIsUploadingSign(false);
        };
        img.onerror = () => {
          setIsUploadingSign(false);
          error('Image Error', 'Could not process signature image.');
        };
      } catch (err: any) {
        setIsUploadingSign(false);
        error('Upload Failed', err?.message);
      }
    };
    reader.onerror = () => {
      setIsUploadingSign(false);
      error('Read Failed', 'Could not read signature file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = async () => {
    setSettings(prev => ({ ...prev, signatureImageUrl: '' }));
    try {
      await updateReceiptSettings({ signatureImageUrl: '' });
      success('Signature Removed', 'Receipts will now use the typed signatory designation.');
    } catch (err: any) {
      error('Remove Failed', err?.message);
    }
  };

  const handleAddTerm = () => {
    if (!newTerm.trim()) return;
    setSettings((prev: ReceiptSettings) => ({
      ...prev,
      customTerms: [...(prev.customTerms || []), newTerm.trim()]
    }));
    setNewTerm('');
  };

  const handleRemoveTerm = (index: number) => {
    setSettings((prev: ReceiptSettings) => ({
      ...prev,
      customTerms: (prev.customTerms || []).filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateReceiptSettings(settings);
      success('Template Updated', 'Receipt and booking slip contents have been saved and applied.');
    } catch (err: any) {
      error('Save Failed', err?.message || 'Could not update receipt settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all receipt and booking slip template contents to official defaults?')) {
      return;
    }
    setSettings(DEFAULT_RECEIPT_SETTINGS);
    setIsSaving(true);
    try {
      await updateReceiptSettings(DEFAULT_RECEIPT_SETTINGS);
      success('Settings Reset', 'Template contents restored to official corporate defaults.');
    } catch (err: any) {
      error('Reset Failed', err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2 border border-blue-200">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Executive Document Configuration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Receipt &amp; Booking Slip Content Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure visible document sections, customize GST &amp; tax settings, edit header details, official notices, and legal terms that appear on all generated Broadband Booking Slips and Paid Payment Receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Reset Defaults
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            Save &amp; Apply Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Edit Form (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">

          {/* 1. Visible Document Sections (Toggles) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-indigo-600" />
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Document Sections &amp; Component Toggles
                </h2>
                <p className="text-[11px] text-slate-500">
                  Select which sections should appear or be omitted from printed/downloaded customer documents.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Header Tagline */}
              <div
                onClick={() => handleToggle('showTagline')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  settings.showTagline
                    ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Header Division Tagline</div>
                  <div className="text-[10px] text-slate-500">Subtext under company title</div>
                </div>
                {settings.showTagline ? (
                  <ToggleRight className="w-6 h-6 text-blue-600 shrink-0" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-400 shrink-0" />
                )}
              </div>

              {/* Authorized Signatory */}
              <div
                onClick={() => handleToggle('showSignatory')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  settings.showSignatory
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Authorized Signatory Box</div>
                  <div className="text-[10px] text-slate-500">Bottom signature &amp; designation</div>
                </div>
                {settings.showSignatory ? (
                  <ToggleRight className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-400 shrink-0" />
                )}
              </div>

              {/* Installation Premises */}
              <div
                onClick={() => handleToggle('showInstallationPremises')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  settings.showInstallationPremises !== false
                    ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Installation Premises Block</div>
                  <div className="text-[10px] text-slate-500">Service drop address column</div>
                </div>
                {settings.showInstallationPremises !== false ? (
                  <ToggleRight className="w-6 h-6 text-blue-600 shrink-0" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-400 shrink-0" />
                )}
              </div>

              {/* Payment Info Block */}
              <div
                onClick={() => handleToggle('showPaymentInfo')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  settings.showPaymentInfo !== false
                    ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Payment Information Box</div>
                  <div className="text-[10px] text-slate-500">Account name &amp; payment method</div>
                </div>
                {settings.showPaymentInfo !== false ? (
                  <ToggleRight className="w-6 h-6 text-blue-600 shrink-0" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-400 shrink-0" />
                )}
              </div>

              {/* Official Notice */}
              <div
                onClick={() => handleToggle('showOfficialNotice')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  settings.showOfficialNotice !== false
                    ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Official Notice &amp; Notes</div>
                  <div className="text-[10px] text-slate-500">Booking / receipt guidance notice</div>
                </div>
                {settings.showOfficialNotice !== false ? (
                  <ToggleRight className="w-6 h-6 text-blue-600 shrink-0" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-400 shrink-0" />
                )}
              </div>

              {/* GST Row */}
              <div
                onClick={() => handleToggle('showGstRow')}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  settings.showGstRow !== false
                    ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">GST Taxation Line Item</div>
                  <div className="text-[10px] text-slate-500">Shows tax calculation in totals</div>
                </div>
                {settings.showGstRow !== false ? (
                  <ToggleRight className="w-6 h-6 text-blue-600 shrink-0" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-400 shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* 2. GST & Taxation Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Percent className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                GST &amp; Taxation Setup
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="GST Rate (%)"
                type="number"
                min="0"
                max="28"
                value={settings.gstRate !== undefined ? settings.gstRate : 18}
                onChange={e => handleChange('gstRate', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Company GSTIN Number"
                placeholder="e.g. 27AAPCN1234F1Z5"
                value={settings.gstNumber || ''}
                onChange={e => handleChange('gstNumber', e.target.value.toUpperCase())}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">GST Mode</label>
                <select
                  value={settings.gstInclusive !== false ? 'inclusive' : 'exclusive'}
                  onChange={e => handleChange('gstInclusive', e.target.value === 'inclusive')}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                >
                  <option value="inclusive">Inclusive in Tariff (Standard)</option>
                  <option value="exclusive">Extra / Added on Top</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Company Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Company Header Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Name *"
                value={settings.companyName}
                onChange={e => handleChange('companyName', e.target.value)}
                required
              />
              <Input
                label="Tagline / Division"
                placeholder="Leave blank or disable toggle above"
                value={settings.tagline || ''}
                onChange={e => handleChange('tagline', e.target.value)}
              />
            </div>

            <Input
              label="Street Address / Registered Office *"
              value={settings.address}
              onChange={e => handleChange('address', e.target.value)}
              required
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City *"
                value={settings.city}
                onChange={e => handleChange('city', e.target.value)}
                required
              />
              <Input
                label="State *"
                value={settings.state}
                onChange={e => handleChange('state', e.target.value)}
                required
              />
              <Input
                label="PIN Code *"
                value={settings.pincode}
                onChange={e => handleChange('pincode', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Customer Hotline / Phone *"
                value={settings.phone}
                onChange={e => handleChange('phone', e.target.value)}
                required
              />
              <Input
                label="Official Email *"
                type="email"
                value={settings.email}
                onChange={e => handleChange('email', e.target.value)}
                required
              />
            </div>

            <Input
              label="Website URL"
              value={settings.website}
              onChange={e => handleChange('website', e.target.value)}
            />
          </div>

          {/* 4. Authorized Signatory Details (If Enabled) */}
          {settings.showSignatory && (
            <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Authorized Signatory Block
                </h2>
              </div>

              {/* Signature Image Upload Block */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>Official Scanned Signature / Stamp</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Upload physical signature image (PNG with transparent background recommended)
                    </div>
                  </div>
                  {settings.signatureImageUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveSignature}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                {settings.signatureImageUrl ? (
                  <div className="p-4 bg-white rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center min-w-[140px] max-w-[200px]">
                      <img
                        src={settings.signatureImageUrl}
                        alt="Current Signature"
                        className="max-h-16 max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <div className="text-xs font-bold text-emerald-800 flex items-center gap-1 justify-center sm:justify-start">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active Signature Graphic</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        This signature is linked and will be displayed above the signatory title on all official receipts and booking slips.
                      </p>
                    </div>
                    <div>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Replace</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleSignatureUpload}
                          disabled={isUploadingSign}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        {isUploadingSign ? 'Processing signature...' : 'Click to upload official signature image'}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Supports PNG, JPG, WebP, SVG (Max 5MB)</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSignatureUpload}
                      disabled={isUploadingSign}
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Signatory Full Name"
                  placeholder="e.g. Authorized Executive"
                  value={settings.signatoryName || ''}
                  onChange={e => handleChange('signatoryName', e.target.value)}
                />
                <Input
                  label="Official Title / Designation"
                  placeholder="e.g. Authorized Signatory"
                  value={settings.signatoryTitle || ''}
                  onChange={e => handleChange('signatoryTitle', e.target.value)}
                />
              </div>

              <Input
                label="Authentication Subtitle"
                placeholder="e.g. Electronically generated & authenticated"
                value={settings.signatorySubtitle || ''}
                onChange={e => handleChange('signatorySubtitle', e.target.value)}
              />
            </div>
          )}

          {/* 5. Official Notices & Disclaimers */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Official Notices &amp; Acknowledgment Text
              </h2>
            </div>

            <TextArea
              label="Booking Slip Notice (Payment Pending / COD)"
              rows={3}
              value={settings.bookingSlipNotice}
              onChange={e => handleChange('bookingSlipNotice', e.target.value)}
              helperText="Shown on booking confirmations issued prior to physical line installation."
            />

            <TextArea
              label="Paid Receipt Acknowledgment (Payment Verified)"
              rows={3}
              value={settings.paidReceiptNotice}
              onChange={e => handleChange('paidReceiptNotice', e.target.value)}
              helperText="Shown on verified payment receipts confirming broadband subscription."
            />

            <Input
              label="Document Footer Note"
              value={settings.footerNote}
              onChange={e => handleChange('footerNote', e.target.value)}
            />
          </div>

          {/* 6. Custom Policy Terms */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Custom Terms &amp; Conditions
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {(settings.customTerms || []).length} term(s)
              </span>
            </div>

            <div className="space-y-2">
              {(settings.customTerms || []).map((term: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={term}
                    onChange={e => {
                      const updated = [...settings.customTerms];
                      updated[idx] = e.target.value;
                      handleChange('customTerms', updated);
                    }}
                    className="flex-1 text-xs bg-transparent border-none focus:outline-none text-slate-800 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTerm(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete Term"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Term Input */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Add new term or service clause..."
                value={newTerm}
                onChange={e => setNewTerm(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTerm();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTerm}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Term
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              Save &amp; Apply Changes
            </Button>
          </div>
        </form>

        {/* Right: Live Interactive Document Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Live Visual Document Preview</span>
            </div>

            {/* Toggle Preview Mode */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPreviewTab('paid_receipt')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  previewTab === 'paid_receipt'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paid Receipt
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('booking_slip')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  previewTab === 'booking_slip'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Booking Slip
              </button>
            </div>
          </div>

          {/* Scaled-down Document Canvas */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-lg overflow-hidden text-slate-800 text-xs">
            {/* Header */}
            <div className="bg-[#152238] text-white p-5 border-b-2 border-indigo-500 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-white p-1 rounded-lg">
                    <img src={VERIFIED_COMPANY_DETAILS.logoBase64} alt="logo" className="h-6 w-auto" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white leading-none">
                      {settings.companyName || 'Nexalus Innovations LLP'}
                    </h3>
                    {settings.showTagline && settings.tagline && (
                      <p className="text-[9px] text-indigo-300 font-semibold mt-0.5">
                        {settings.tagline}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  previewTab === 'paid_receipt' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                }`}>
                  {previewTab === 'paid_receipt' ? 'PAID RECEIPT' : 'BOOKING SLIP'}
                </span>
              </div>

              <div className="text-[10px] text-slate-300 space-y-0.5 pt-1">
                <p>{settings.address}, {settings.city} - {settings.pincode}</p>
                <p>Phone: <strong>{settings.phone}</strong> &bull; {settings.email}</p>
                {settings.gstNumber && <p className="text-[9px] text-indigo-300 font-mono">GSTIN: {settings.gstNumber}</p>}
              </div>
            </div>

            {/* Simulated Billed To & Service Premises */}
            <div className="p-4 bg-slate-50/60 border-b border-slate-200 grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="text-[9px] font-black uppercase text-indigo-600">Billed To:</div>
                <div className="font-bold text-slate-900">Sanket Lohar</div>
                <div className="text-slate-500 text-[10px]">+91 9158886444</div>
              </div>

              {settings.showInstallationPremises !== false ? (
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-[9px] font-black uppercase text-indigo-600">Service Premises:</div>
                  <div className="font-medium text-slate-900 leading-snug">100 Feet Rd, Vishrambag</div>
                  <div className="text-slate-700 font-bold text-[10px]">{settings.city} - {settings.pincode}</div>
                </div>
              ) : (
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="text-[9px] font-black uppercase text-indigo-600">Account Status:</div>
                  <div className="font-bold text-emerald-600">Verified Direct Account</div>
                  <div className="text-slate-500 text-[10px]">Active Customer Reference</div>
                </div>
              )}
            </div>

            {/* Table Mockup */}
            <div className="p-4 space-y-3">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-[#152238] text-white p-2 text-[9px] font-bold uppercase flex justify-between">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="p-2 text-[10px] flex justify-between bg-white">
                  <span>Airtel 30 Mbps FTTH (Semi-Annual)</span>
                  <strong className="text-slate-900 font-mono">₹3,000.00</strong>
                </div>
              </div>

              {/* Total Pill */}
              <div className="flex justify-end">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5 flex items-center gap-3">
                  <span className="text-[10px] font-bold text-indigo-900 uppercase">
                    {previewTab === 'paid_receipt' ? 'Amount Paid:' : 'Amount Due:'}
                  </span>
                  <span className="font-mono font-black text-sm text-slate-900">₹3,000.00</span>
                </div>
              </div>

              {/* Notice Mockup */}
              {settings.showOfficialNotice !== false && (
                <div className={`p-3 rounded-lg text-[10px] leading-relaxed border ${
                  previewTab === 'paid_receipt' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}>
                  <strong>{previewTab === 'paid_receipt' ? 'Payment Verified: ' : 'Official Notice: '}</strong>
                  {previewTab === 'paid_receipt' ? settings.paidReceiptNotice : settings.bookingSlipNotice}
                </div>
              )}

              {/* Signatory Box (Shown ONLY if toggle enabled) */}
              {settings.showSignatory && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-right space-y-0.5">
                  <div className="text-[9px] font-bold uppercase text-slate-400">For {settings.companyName}</div>
                  {settings.signatureImageUrl ? (
                    <div className="py-1 flex justify-end">
                      <img
                        src={settings.signatureImageUrl}
                        alt="Authorized Signature"
                        className="h-10 max-w-[140px] object-contain"
                      />
                    </div>
                  ) : (
                    <div className="font-serif italic text-2xl font-bold text-slate-900 py-0.5">
                      {settings.signatoryName || 'Authorized Signatory'}
                    </div>
                  )}
                  <div className="text-[10px] font-bold text-slate-700">
                    {settings.signatoryTitle || 'Authorized Signatory'}
                  </div>
                  {settings.signatureImageUrl && settings.signatoryName && settings.signatoryName !== 'Authorized Signatory' && (
                    <div className="text-[9px] text-slate-600 font-medium">
                      {settings.signatoryName}
                    </div>
                  )}
                  {settings.signatorySubtitle && (
                    <div className="text-[8px] text-slate-400">
                      {settings.signatorySubtitle}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#152238] text-white px-4 py-2 text-[9px] flex justify-between">
              <span>{settings.footerNote}</span>
              <span>Hotline: {settings.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
