import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getBanners, updateBanner } from '../../firebase/services';
import { initialBanners } from '../../data/initialData';
import { SiteBanner } from '../../types';
import { Input, TextArea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import {
  Image,
  CheckCircle2,
  Save,
  Building,
  Shield,
  Layers,
  ExternalLink,
  Eye,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  ToggleLeft,
  LayoutTemplate,
  Sliders,
  HelpCircle,
  Users
} from 'lucide-react';

type ContentScope = 'corporate' | 'nexalus-innovations' | 'am-distributors';
type ContentTab = 'hero' | 'contact' | 'sections';

export const AdminContentPage: React.FC = () => {
  const { isSuperAdmin, isInnovationsAdmin, isAmAdmin, canManageBrand } = useAuth();
  const outletCtx = useOutletContext<{ activeConsole?: string }>();
  const { success, error } = useToast();

  // Determine initial scope based on active console or role
  const getInitialScope = (): ContentScope => {
    if (isInnovationsAdmin) return 'nexalus-innovations';
    if (isAmAdmin) return 'am-distributors';
    if (outletCtx?.activeConsole === 'nexalus-innovations') return 'nexalus-innovations';
    if (outletCtx?.activeConsole === 'am-distributors') return 'am-distributors';
    return 'corporate';
  };

  const [activeScope, setActiveScope] = useState<ContentScope>(getInitialScope);
  const [activeTab, setActiveTab] = useState<ContentTab>('hero');
  const [banners, setBanners] = useState<SiteBanner[]>(initialBanners);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields for Active Scope
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [secondaryCtaText, setSecondaryCtaText] = useState('');
  const [secondaryCtaLink, setSecondaryCtaLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);

  // Contact & Operations Details
  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [workingHours, setWorkingHours] = useState('');

  // Section Visibility Toggles
  const [showHero, setShowHero] = useState(true);
  const [showTeam, setShowTeam] = useState(true);
  const [showFaqs, setShowFaqs] = useState(true);
  const [showContact, setShowContact] = useState(true);

  const getTargetDocId = (scope: ContentScope): string => {
    switch (scope) {
      case 'corporate':
        return 'ban-parent';
      case 'nexalus-innovations':
        return 'ban-innovations';
      case 'am-distributors':
        return 'ban-am';
    }
  };

  const getTargetBrandId = (scope: ContentScope) => {
    switch (scope) {
      case 'corporate':
        return 'nexalus';
      case 'nexalus-innovations':
        return 'nexalus-innovations';
      case 'am-distributors':
        return 'am-distributors';
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);

      const targetId = getTargetDocId(activeScope);
      const current = data.find(b => b.id === targetId) || initialBanners.find(b => b.id === targetId);
      if (current) {
        setTitle(current.title || '');
        setSubtitle(current.subtitle || '');
        setBadge(current.badge || '');
        setCtaText(current.ctaText || 'Learn More');
        setCtaLink(current.ctaLink || '/');
        setSecondaryCtaText(current.secondaryCtaText || '');
        setSecondaryCtaLink(current.secondaryCtaLink || '');
        setImageUrl(current.imageUrl || '');
        setActive(current.active !== false);

        setSupportPhone(current.supportPhone || '+91 98765 43210');
        setSupportEmail(current.supportEmail || 'contact@nexalusinnovations.com');
        setOfficeAddress(current.officeAddress || 'Chiplun, Maharashtra 415605');
        setWorkingHours(current.workingHours || 'Mon - Sat: 9:00 AM - 7:00 PM');

        setShowHero(current.showHero !== false);
        setShowTeam(current.showTeam !== false);
        setShowFaqs(current.showFaqs !== false);
        setShowContact(current.showContact !== false);
      }
    } catch (err: any) {
      error('Failed to load content', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Keep activeScope strictly synchronized with active workspace console
  useEffect(() => {
    let targetScope: ContentScope = 'corporate';
    if (isInnovationsAdmin || outletCtx?.activeConsole === 'nexalus-innovations') {
      targetScope = 'nexalus-innovations';
    } else if (isAmAdmin || outletCtx?.activeConsole === 'am-distributors') {
      targetScope = 'am-distributors';
    } else {
      targetScope = 'corporate';
    }
    setActiveScope(targetScope);
  }, [outletCtx?.activeConsole, isInnovationsAdmin, isAmAdmin]);

  useEffect(() => {
    loadData();
  }, [activeScope]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const brandId = getTargetBrandId(activeScope);

    if (!canManageBrand(brandId as any)) {
      error('Access Denied', 'You do not have permission to modify content for this company.');
      return;
    }

    if (!title.trim()) {
      error('Validation Error', 'Headline Title is required.');
      return;
    }

    setIsSaving(true);
    try {
      const targetId = getTargetDocId(activeScope);
      const payload: Partial<SiteBanner> = {
        id: targetId,
        brandId: brandId as any,
        title: title.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim(),
        ctaText: ctaText.trim() || 'Learn More',
        ctaLink: ctaLink.trim() || '/',
        secondaryCtaText: secondaryCtaText.trim(),
        secondaryCtaLink: secondaryCtaLink.trim(),
        imageUrl: imageUrl.trim(),
        active,
        supportPhone: supportPhone.trim(),
        supportEmail: supportEmail.trim(),
        officeAddress: officeAddress.trim(),
        workingHours: workingHours.trim(),
        showHero,
        showTeam,
        showFaqs,
        showContact
      };

      await updateBanner(targetId, payload);
      success(
        'Content Published',
        `Website content for ${
          activeScope === 'corporate'
            ? 'Nexalus Innovations LLP'
            : activeScope === 'nexalus-innovations'
            ? 'Nexalus Innovations'
            : 'A.M. Distributors Chiplun'
        } has been updated live.`
      );
      loadData();
    } catch (err: any) {
      error('Failed to save content', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dynamic Website Content &amp; Media Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage public hero headlines, contact details, service badges, and section visibility across all websites.
          </p>
        </div>

        {/* Public Website Preview Shortcut */}
        <a
          href={
            activeScope === 'corporate'
              ? '/'
              : activeScope === 'nexalus-innovations'
              ? '/brands/nexalus-innovations'
              : '/brands/am-distributors'
          }
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Public Page</span>
        </a>
      </div>

      {/* Workspace-Scoped Destination Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
            activeScope === 'corporate'
              ? 'bg-blue-600 shadow-blue-500/20'
              : activeScope === 'nexalus-innovations'
              ? 'bg-blue-600 shadow-blue-500/20'
              : 'bg-teal-700 shadow-teal-700/20'
          } shadow-sm`}>
            {activeScope === 'corporate' ? (
              <Layers className="w-5 h-5" />
            ) : activeScope === 'nexalus-innovations' ? (
              <Shield className="w-5 h-5" />
            ) : (
              <Building className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              {activeScope === 'corporate'
                ? 'Corporate Parent Website (Nexalus Innovations LLP)'
                : activeScope === 'nexalus-innovations'
                ? 'Nexalus Innovations Website (Tech, CCTV & Fiber)'
                : 'A.M. Distributors Chiplun Website (FMCG Logistics & Depot)'}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {activeScope === 'corporate'
                ? 'Managing hero headline, corporate executive team section, and parent contact details'
                : activeScope === 'nexalus-innovations'
                ? 'Managing tech hero banners, service badges, and fiber contact hotline'
                : 'Managing depot hero banners, wholesale supply badges, and cold-chain depot contact'}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border tracking-wider bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-1.5 self-start sm:self-auto shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Doc: {getTargetDocId(activeScope)}
        </span>
      </div>

      {/* Active Scope Information Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
        activeScope === 'corporate'
          ? 'bg-blue-50/70 border-blue-200/80 text-blue-950'
          : activeScope === 'nexalus-innovations'
          ? 'bg-indigo-50/70 border-indigo-200/80 text-indigo-950'
          : 'bg-teal-50/70 border-teal-200/80 text-teal-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs shrink-0">
            {activeScope === 'corporate' ? (
              <Layers className="w-5 h-5 text-blue-600" />
            ) : activeScope === 'nexalus-innovations' ? (
              <Shield className="w-5 h-5 text-indigo-600" />
            ) : (
              <Building className="w-5 h-5 text-teal-600" />
            )}
          </div>
          <div>
            <div className="text-xs font-black tracking-tight">
              {activeScope === 'corporate'
                ? 'Managing: Nexalus Innovations LLP Corporate Landing Page (/)'
                : activeScope === 'nexalus-innovations'
                ? 'Managing: Nexalus Innovations Tech & Fiber Landing Page (/brands/nexalus-innovations)'
                : 'Managing: A.M. Distributors Chiplun Landing Page (/brands/am-distributors)'}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              Live Cloud Firestore Document: <code className="font-mono font-bold">{getTargetDocId(activeScope)}</code> • Real-time synchronization active
            </div>
          </div>
        </div>

        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-white border tracking-wider shrink-0 shadow-2xs">
          {active ? '● Live on Public Website' : '○ Draft / Hidden'}
        </span>
      </div>

      {/* Content Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Hero &amp; Branding</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Contact &amp; Operations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sections'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Section Visibility</span>
        </button>
      </div>

      {/* Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Editor Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            {/* TAB 1: HERO & BRANDING */}
            {activeTab === 'hero' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <Input
                  label="Hero Headline Title"
                  placeholder="e.g. Connecting Businesses. Protecting What Matters."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  disabled={isSaving}
                />

                <Input
                  label="Announcement / Sub-Heading Badge"
                  placeholder="e.g. Enterprise Networking & Multi-Company Solutions"
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                  disabled={isSaving}
                />

                <TextArea
                  label="Supporting Description / Subtitle"
                  placeholder="Enter 2-3 sentences explaining the company core value proposition..."
                  rows={4}
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  disabled={isSaving}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Primary Button (CTA) Text"
                    placeholder="e.g. Explore Our Solutions"
                    value={ctaText}
                    onChange={e => setCtaText(e.target.value)}
                    disabled={isSaving}
                  />
                  <Input
                    label="Primary Button Route"
                    placeholder="e.g. /services or /products"
                    value={ctaLink}
                    onChange={e => setCtaLink(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Secondary Button Text"
                    placeholder="e.g. Request Quotation"
                    value={secondaryCtaText}
                    onChange={e => setSecondaryCtaText(e.target.value)}
                    disabled={isSaving}
                  />
                  <Input
                    label="Secondary Button Route"
                    placeholder="e.g. /quote or /contact"
                    value={secondaryCtaLink}
                    onChange={e => setSecondaryCtaLink(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <Input
                  label="Hero Background Image URL / Asset Path"
                  placeholder="e.g. /images/hero-server.jpg or /images/simple-cctv-camera.jpg"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  disabled={isSaving}
                />

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 pt-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={e => setActive(e.target.checked)}
                    disabled={isSaving}
                    className="rounded text-blue-600 w-4 h-4 focus:ring-blue-500"
                  />
                  <span>Hero Section Active on Public Website</span>
                </label>
              </div>
            )}

            {/* TAB 2: CONTACT & OPERATIONS */}
            {activeTab === 'contact' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Central Support Phone / WhatsApp"
                    placeholder="e.g. +91 98765 43210"
                    value={supportPhone}
                    onChange={e => setSupportPhone(e.target.value)}
                    disabled={isSaving}
                  />
                  <Input
                    label="Official Inquiries Email"
                    placeholder="e.g. contact@nexalusinnovations.com"
                    value={supportEmail}
                    onChange={e => setSupportEmail(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <Input
                  label="Physical Office / Depot Address"
                  placeholder="e.g. Chiplun Central Office, Maharashtra 415605"
                  value={officeAddress}
                  onChange={e => setOfficeAddress(e.target.value)}
                  disabled={isSaving}
                />

                <Input
                  label="Business / Dispatch Hours"
                  placeholder="e.g. Mon - Sat: 9:00 AM - 7:00 PM"
                  value={workingHours}
                  onChange={e => setWorkingHours(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            )}

            {/* TAB 3: SECTION VISIBILITY */}
            {activeTab === 'sections' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <p className="text-xs text-slate-500 mb-2">
                  Control which content modules appear on this company&apos;s public website:
                </p>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
                  <label className="p-3 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Hero &amp; Headline Banner</div>
                      <div className="text-[11px] text-slate-500">Show main banner with CTA buttons</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showHero}
                      onChange={e => setShowHero(e.target.checked)}
                      className="rounded text-blue-600 w-4 h-4 focus:ring-blue-500"
                    />
                  </label>

                  <label className="p-3 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Our Team Section</div>
                      <div className="text-[11px] text-slate-500">Show leadership &amp; operational personnel carousel</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showTeam}
                      onChange={e => setShowTeam(e.target.checked)}
                      className="rounded text-blue-600 w-4 h-4 focus:ring-blue-500"
                    />
                  </label>

                  <label className="p-3 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-800">FAQs &amp; Help Desk</div>
                      <div className="text-[11px] text-slate-500">Display frequently asked questions</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showFaqs}
                      onChange={e => setShowFaqs(e.target.checked)}
                      className="rounded text-blue-600 w-4 h-4 focus:ring-blue-500"
                    />
                  </label>

                  <label className="p-3 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Contact &amp; Site Survey CTA</div>
                      <div className="text-[11px] text-slate-500">Show bottom inquiry banner &amp; office address</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showContact}
                      onChange={e => setShowContact(e.target.checked)}
                      className="rounded text-blue-600 w-4 h-4 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                icon={<Save className="w-4 h-4" />}
              >
                Save &amp; Publish Content
              </Button>
            </div>
          </form>
        </div>

        {/* Live Visual Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Real-Time Website Visual Preview</span>
          </div>

          <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-7 border border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
            {/* Background Image Preview */}
            {imageUrl && (
              <div
                className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            )}

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-blue-400/30">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>
                  {badge ||
                    (activeScope === 'corporate'
                      ? 'NEXALUS INNOVATIONS LLP'
                      : activeScope === 'nexalus-innovations'
                      ? 'TECH & FIBER DIVISION'
                      : 'A.M. DISTRIBUTORS CHIPLUN')}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {title || 'Enter headline title above...'}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                {subtitle || 'Supporting description will be displayed here on the public website...'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <span className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-blue-500/30">
                  <span>{ctaText || 'Primary CTA'}</span>
                  <ExternalLink className="w-3 h-3" />
                </span>

                {secondaryCtaText && (
                  <span className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 border border-slate-700">
                    <span>{secondaryCtaText}</span>
                  </span>
                )}
              </div>

              {/* Contact Snapshot */}
              {(supportPhone || supportEmail) && (
                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  {supportPhone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-blue-400" />
                      <span>{supportPhone}</span>
                    </div>
                  )}
                  {supportEmail && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-blue-400" />
                      <span>{supportEmail}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">Public Synchronization</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              When you click &ldquo;Save &amp; Publish Content&rdquo;, the document is persisted live in Cloud Firestore collection <code className="font-mono text-blue-700">banners</code>. Changes appear immediately on the corresponding public website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
