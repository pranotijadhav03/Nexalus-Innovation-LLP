import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getSeoSettings, updateSeoSettings } from '../../firebase/services';
import { SeoSettings } from '../../types';
import { Input, TextArea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Globe, Save, Search, CheckCircle2 } from 'lucide-react';

export const AdminSeoPage: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const { success, error } = useToast();

  const [settings, setSettings] = useState<SeoSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getSeoSettings();
      setSettings(data);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      await updateSeoSettings(settings);
      success('SEO Settings Updated', 'Search engine optimization & contact metadata updated.');
    } catch (err: any) {
      error('Failed to update SEO', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading SEO settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          SEO & Corporate Meta Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure global site title, search keywords, meta descriptions, and parent organization contact details.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Search Engine Metadata */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            Global Search Engine Metadata
          </h2>

          <Input
            label="Default Page Title Tag (<title>)"
            value={settings.siteTitle}
            onChange={e => setSettings({ ...settings, siteTitle: e.target.value })}
            required
          />

          <TextArea
            label="Meta Description"
            rows={3}
            value={settings.siteDescription}
            onChange={e => setSettings({ ...settings, siteDescription: e.target.value })}
            required
          />

          <Input
            label="SEO Focus Keywords (Comma separated)"
            value={settings.keywords}
            onChange={e => setSettings({ ...settings, keywords: e.target.value })}
            required
          />
        </div>

        {/* Official Contact Metadata */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Official Organizational Contact Info
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Public Support Email"
              type="email"
              value={settings.contactEmail}
              onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
              required
            />
            <Input
              label="Primary Phone Number"
              value={settings.contactPhone}
              onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
              required
            />
          </div>

          <TextArea
            label="Registered Office Address"
            rows={2}
            value={settings.address}
            onChange={e => setSettings({ ...settings, address: e.target.value })}
            required
          />
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Official Social Media Presence
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="LinkedIn URL"
              value={settings.socials?.linkedin || ''}
              onChange={e => setSettings({
                ...settings,
                socials: { ...settings.socials, linkedin: e.target.value }
              })}
            />
            <Input
              label="X / Twitter URL"
              value={settings.socials?.twitter || ''}
              onChange={e => setSettings({
                ...settings,
                socials: { ...settings.socials, twitter: e.target.value }
              })}
            />
            <Input
              label="Facebook URL"
              value={settings.socials?.facebook || ''}
              onChange={e => setSettings({
                ...settings,
                socials: { ...settings.socials, facebook: e.target.value }
              })}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Save className="w-4 h-4" />}
            isLoading={isSaving}
          >
            Save All SEO Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
