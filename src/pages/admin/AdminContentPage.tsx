import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getBanners, updateBanner } from '../../firebase/services';
import { SiteBanner } from '../../types';
import { Input, TextArea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { BrandBadge } from '../../components/common/BrandBadge';
import { Image, CheckCircle2, Save } from 'lucide-react';

export const AdminContentPage: React.FC = () => {
  const { isSuperAdmin, isCpPlusAdmin, isOneBroadbandAdmin, canManageBrand } = useAuth();
  const { success, error } = useToast();

  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [editingBanner, setEditingBanner] = useState<SiteBanner | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getBanners();
      setBanners(data);
    }
    load();
  }, []);

  const handleUpdate = async (b: SiteBanner) => {
    if (!canManageBrand(b.brandId)) {
      error('Access Denied', 'You cannot modify banners for another brand.');
      return;
    }

    setIsSaving(true);
    try {
      await updateBanner(b.id, b);
      success('Banner Saved', `${b.title} saved successfully.`);
      const updated = await getBanners();
      setBanners(updated);
    } catch (err: any) {
      error('Failed to update banner', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Hero Banners & Website Content Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Edit public headlines, supporting text, and call-to-action buttons for Nexalus Innovations LLP, Nexalus Innovations, and A.M. Distributors Chiplun.
        </p>
      </div>

      <div className="space-y-6">
        {banners.map(banner => {
          const isAllowed = canManageBrand(banner.brandId);
          return (
            <div
              key={banner.id}
              className={`p-6 sm:p-8 bg-white rounded-3xl border ${
                isAllowed ? 'border-slate-200 shadow-xs' : 'border-slate-100 opacity-60'
              } space-y-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrandBadge brandId={banner.brandId} size="md" />
                  <span className="text-xs font-mono text-slate-400">ID: {banner.id}</span>
                </div>
                {!isAllowed && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    Read-Only (Different Brand)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Hero Headline Title"
                  value={banner.title}
                  disabled={!isAllowed}
                  onChange={e => {
                    const val = e.target.value;
                    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, title: val } : b));
                  }}
                />
                <Input
                  label="CTA Button Text"
                  value={banner.ctaText}
                  disabled={!isAllowed}
                  onChange={e => {
                    const val = e.target.value;
                    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, ctaText: val } : b));
                  }}
                />
              </div>

              <TextArea
                label="Supporting Subtitle Text"
                rows={2}
                value={banner.subtitle}
                disabled={!isAllowed}
                onChange={e => {
                  const val = e.target.value;
                  setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, subtitle: val } : b));
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Button Destination Link"
                  value={banner.ctaLink}
                  disabled={!isAllowed}
                  onChange={e => {
                    const val = e.target.value;
                    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, ctaLink: val } : b));
                  }}
                />
                <Input
                  label="Background Hero Image URL"
                  value={banner.imageUrl || ''}
                  disabled={!isAllowed}
                  onChange={e => {
                    const val = e.target.value;
                    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, imageUrl: val } : b));
                  }}
                />
              </div>

              {isAllowed && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={banner.active}
                      onChange={e => {
                        const checked = e.target.checked;
                        setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, active: checked } : b));
                      }}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    Active Banner Display
                  </label>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdate(banner)}
                    icon={<Save className="w-3.5 h-3.5" />}
                    isLoading={isSaving}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
