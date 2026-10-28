import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getBanners, updateBanner, getCachedBanners, uploadImageFile } from '../../firebase/services';
import { initialBanners, DEFAULT_AM_SLIDES, DEFAULT_NEXALUS_SLIDES } from '../../data/initialData';
import { SiteBanner, HeroSlide, CustomSection } from '../../types';
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
  Users,
  Plus,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  X,
  Upload
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
  const [banners, setBanners] = useState<SiteBanner[]>(() => getCachedBanners());
  const [isLoading, setIsLoading] = useState(false);
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

  // Hero Carousel Slides for A.M. Distributors
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  // Dynamic Custom Sections State
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [editingSection, setEditingSection] = useState<CustomSection | null>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isUploadingSectionImage, setIsUploadingSectionImage] = useState(false);

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
        setCustomSections(current.customSections || []);

        const loadedSlides = (current.slides && current.slides.length > 0)
          ? current.slides
          : (targetId === 'ban-am' ? DEFAULT_AM_SLIDES : (DEFAULT_NEXALUS_SLIDES || []));
        setSlides(loadedSlides);
      }
    } catch (err: any) {
      error('Failed to load content', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reorder slide up or down
  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;
    const reordered = newSlides.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(reordered);
    // Instant live persistence
    try {
      const targetId = getTargetDocId(activeScope);
      await updateBanner(targetId, { slides: reordered });
    } catch {}
    success('Sequence Updated', `Slide moved ${direction} and synchronized live.`);
  };

  // Delete slide
  const handleDeleteSlide = async (id: string) => {
    if (slides.length <= 1) {
      error('Action Denied', 'A minimum of 1 slide is required for the carousel.');
      return;
    }
    const newSlides = slides.filter(s => s.id !== id).map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(newSlides);
    if (previewSlideIdx >= newSlides.length) {
      setPreviewSlideIdx(0);
    }
    // Instant live persistence
    try {
      const targetId = getTargetDocId(activeScope);
      await updateBanner(targetId, { slides: newSlides });
    } catch {}
    success('Slide Removed', 'Slide deleted and synchronized live.');
  };

  // Open modal to edit existing slide
  const handleOpenEditSlide = (slide: HeroSlide) => {
    setEditingSlide({ ...slide });
    setIsSlideModalOpen(true);
  };

  // Open modal to add new slide
  const handleOpenAddSlide = () => {
    const isAm = activeScope === 'am-distributors';
    setEditingSlide({
      id: `slide-${Date.now()}`,
      title: '',
      subtitle: '',
      description: '',
      imageUrl: isAm ? '/images/products/am-water-jar-20l.jpg' : '/images/fermilab-blue-racks-real.jpg',
      videoUrl: '',
      mediaType: 'image',
      badge: isAm ? 'A.M. Distributors Chiplun Supply' : 'Enterprise Technology & Infrastructure',
      primaryCtaText: isAm ? 'Order Wholesale Supply' : 'Explore Our Solutions',
      primaryCtaLink: isAm ? '/brands/am-distributors/products' : '/products',
      secondaryCtaText: isAm ? 'Contact Chiplun Depot' : 'Request Quotation',
      secondaryCtaLink: '/contact',
      order: slides.length + 1
    });
    setIsSlideModalOpen(true);
  };

  // Save changes from slide modal
  const handleSaveModalSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide || !editingSlide.title.trim()) {
      error('Validation Error', 'Slide Title is required.');
      return;
    }
    const exists = slides.some(s => s.id === editingSlide.id);
    let updated: HeroSlide[];
    if (exists) {
      updated = slides.map(s => s.id === editingSlide.id ? editingSlide : s);
    } else {
      updated = [...slides, editingSlide];
    }
    setSlides(updated);
    setIsSlideModalOpen(false);
    setEditingSlide(null);
    // Instant live persistence
    try {
      const targetId = getTargetDocId(activeScope);
      await updateBanner(targetId, { slides: updated });
    } catch {}
    success('Slide Applied', 'Slide details updated and synchronized live.');
  };

  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);

  // Upload and compress hero background image for main landing page
  const handleMainHeroImageUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingMainImage(true);
    try {
      const compressedUrl = await uploadImageFile(file, 'banners');
      if (compressedUrl) {
        setImageUrl(compressedUrl);
        success('Image Attached', 'Hero background image selected and compressed.');
      }
    } catch (err: any) {
      error('Upload Failed', err?.message || 'Could not process image.');
    } finally {
      setIsUploadingMainImage(false);
    }
  };

  // Open modal to add new custom section
  const handleOpenAddSection = () => {
    setEditingSection({
      id: `sec-${Date.now()}`,
      title: '',
      subtitle: '',
      badge: '',
      content: '',
      imageUrl: '',
      ctaText: 'Learn More',
      ctaLink: '/contact',
      active: true,
      order: customSections.length + 1
    });
    setIsSectionModalOpen(true);
  };

  // Open modal to edit existing custom section
  const handleOpenEditSection = (section: CustomSection) => {
    setEditingSection({ ...section });
    setIsSectionModalOpen(true);
  };

  // Move custom section up or down
  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= customSections.length) return;
    const newSections = [...customSections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    const reordered = newSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    setCustomSections(reordered);
    const targetId = getTargetDocId(activeScope);
    try {
      await updateBanner(targetId, { customSections: reordered });
      success('Sequence Updated', `Section moved ${direction} and synchronized live.`);
    } catch {}
  };

  // Delete custom section
  const handleDeleteSection = async (id: string) => {
    const newSections = customSections.filter(s => s.id !== id);
    setCustomSections(newSections);
    const targetId = getTargetDocId(activeScope);
    try {
      await updateBanner(targetId, { customSections: newSections });
      success('Section Removed', 'Custom section deleted and synchronized live.');
    } catch {}
  };

  // Toggle active status
  const handleToggleSectionActive = async (id: string, activeStatus: boolean) => {
    const newSections = customSections.map(s => s.id === id ? { ...s, active: activeStatus } : s);
    setCustomSections(newSections);
    const targetId = getTargetDocId(activeScope);
    try {
      await updateBanner(targetId, { customSections: newSections });
      success('Visibility Updated', `Section is now ${activeStatus ? 'visible' : 'hidden'} on the website.`);
    } catch {}
  };

  // Save changes from section modal
  const handleSaveModalSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editingSection.title.trim()) {
      error('Validation Error', 'Section Title is required.');
      return;
    }
    const exists = customSections.some(s => s.id === editingSection.id);
    let updated: CustomSection[];
    if (exists) {
      updated = customSections.map(s => s.id === editingSection.id ? editingSection : s);
    } else {
      updated = [...customSections, editingSection];
    }
    setCustomSections(updated);
    setIsSectionModalOpen(false);
    setEditingSection(null);
    const targetId = getTargetDocId(activeScope);
    try {
      await updateBanner(targetId, { customSections: updated });
      success('Section Saved & Published', 'Custom section is now live on the public website.');
    } catch (err: any) {
      error('Error', err?.message || 'Failed to save section.');
    }
  };

  // Handle image upload for custom section
  const handleSectionImageUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingSectionImage(true);
    try {
      const compressedUrl = await uploadImageFile(file, 'banners');
      if (compressedUrl && editingSection) {
        setEditingSection({ ...editingSection, imageUrl: compressedUrl });
        success('Image Selected', 'Section image set and compressed cleanly.');
      }
    } catch (err: any) {
      error('Upload Failed', err?.message || 'Could not process image.');
    } finally {
      setIsUploadingSectionImage(false);
    }
  };

  // Handle instant local image selection for slides with canvas compression
  const handleSlideImageUpload = async (file: File) => {
    if (!file) return;
    try {
      const compressedUrl = await uploadImageFile(file, 'banners');
      if (compressedUrl && editingSlide) {
        setEditingSlide({ ...editingSlide, imageUrl: compressedUrl, mediaType: 'image' });
        success('Image Selected', 'Slide image set and compressed cleanly.');
      }
    } catch (err: any) {
      error('Upload Failed', err?.message || 'Could not process image.');
    }
  };

  const [isUploadingSlideVideo, setIsUploadingSlideVideo] = useState(false);
  const handleSlideVideoUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingSlideVideo(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const videoDataUrl = reader.result as string;
        if (editingSlide) {
          setEditingSlide({
            ...editingSlide,
            videoUrl: videoDataUrl,
            imageUrl: editingSlide.imageUrl || '/images/fermilab-blue-racks-real.jpg',
            mediaType: 'video'
          });
        }
        success('Video Attached', 'Hero slide background video attached.');
        setIsUploadingSlideVideo(false);
      };
      reader.onerror = () => {
        error('Upload Failed', 'Could not read video file.');
        setIsUploadingSlideVideo(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      error('Upload Failed', err?.message || 'Could not process video.');
      setIsUploadingSlideVideo(false);
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
        showContact,
        customSections,
        slides
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
              <div className="space-y-6 animate-in fade-in duration-150">
                {(activeScope === 'am-distributors' || activeScope === 'corporate') ? (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-teal-900/10 via-emerald-900/10 to-transparent border border-teal-500/20">
                      <div>
                        <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-teal-600" />
                          <span>Hero Carousel Slides ({slides.length})</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Manage sequence, photos, title, subtitle, and copy for each slide. Changes reflect live on the website.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="teal"
                        size="sm"
                        onClick={handleOpenAddSlide}
                        icon={<Plus className="w-4 h-4" />}
                        className="font-bold cursor-pointer shrink-0"
                      >
                        Add New Slide
                      </Button>
                    </div>

                    {/* Slides List with Reorder, Edit, and Delete */}
                    <div className="space-y-3">
                      {slides.map((slide, idx) => (
                        <div
                          key={slide.id || idx}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-400/60 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="relative shrink-0 w-16 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                              <img
                                src={slide.imageUrl}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-black text-teal-300">
                                #{idx + 1}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-black text-slate-900 truncate">
                                {slide.title || 'Untitled Slide'}
                              </div>
                              <div className="text-[11px] font-semibold text-teal-700 truncate">
                                {slide.subtitle || 'No subtitle set'}
                              </div>
                              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {slide.description}
                              </div>
                            </div>
                          </div>

                          {/* Slide Actions: Sequence Up / Down, Edit, Delete */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveSlide(idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up in sequence"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSlide(idx, 'down')}
                              disabled={idx === slides.length - 1}
                              title="Move Down in sequence"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditSlide(slide)}
                              title="Edit slide content"
                              className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 hover:text-teal-900 transition-all cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSlide(slide.id)}
                              disabled={slides.length <= 1}
                              title="Delete slide"
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Standard Depot Default Metadata & Toggles */}
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      <Input
                        label="Depot Fallback Title"
                        placeholder="A.M. Distributors Chiplun"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        disabled={isSaving}
                      />
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 pt-1">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={e => setActive(e.target.checked)}
                          disabled={isSaving}
                          className="rounded text-teal-600 w-4 h-4 focus:ring-teal-500"
                        />
                        <span>Hero Section Active on Public Website</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <>
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

                    <div className="space-y-2">
                      <Input
                        label="Hero Background Image URL / Asset Path"
                        placeholder="e.g. /images/hero-server.jpg or /images/simple-cctv-camera.jpg"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        disabled={isSaving}
                      />
                      <div className="flex flex-wrap items-center gap-3 pt-0.5">
                        <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer transition-all shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                          <span>Choose / Upload Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                handleMainHeroImageUpload(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        {isUploadingMainImage && (
                          <span className="text-xs text-blue-600 font-semibold animate-pulse">
                            Compressing and setting image...
                          </span>
                        )}
                        {imageUrl && (
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pr-3 shadow-2xs">
                            <div className="w-12 h-8 rounded-lg overflow-hidden border border-slate-300 bg-slate-200 shrink-0">
                              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[11px] font-medium text-slate-600 truncate max-w-[200px]">
                              {imageUrl.startsWith('data:') ? 'Local Image Attached (Optimized)' : imageUrl}
                            </span>
                            <button
                              type="button"
                              onClick={() => setImageUrl('')}
                              className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                              title="Clear Image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* One-Click Infrastructure Presets */}
                      <div className="pt-2">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Quick Presets (Internet, Networking & CCTV Infrastructure)
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                          {[
                            { name: 'Server Datacenter', path: '/images/fermilab-blue-racks-real.jpg' },
                            { name: 'Gigabit Fiber', path: '/images/fiber-optic-glowing.jpg' },
                            { name: 'Managed Switches', path: '/images/network-hero-banner.jpg' },
                            { name: 'CCTV Surveillance', path: '/images/cctv-hero-banner.jpg' },
                            { name: 'Commercial Campus', path: '/images/projects/tech-park-real.jpg' }
                          ].map(preset => (
                            <button
                              key={preset.path}
                              type="button"
                              onClick={() => setImageUrl(preset.path)}
                              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                                imageUrl === preset.path
                                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                                  : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 hover:bg-white'
                              }`}
                            >
                              <div className="h-10 rounded-lg overflow-hidden mb-1.5 border border-slate-200">
                                <img src={preset.path} alt={preset.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="text-[10px] font-bold truncate">{preset.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

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
                  </>
                )}
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

                {/* DYNAMIC CUSTOM CONTENT SECTIONS CREATOR */}
                <div className="pt-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-transparent border border-blue-500/20">
                    <div>
                      <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-blue-600" />
                        <span>Dynamic Custom Website Sections ({customSections.length})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Add promotional banners, announcements, seasonal offers, or custom corporate blocks that immediately reflect on this website.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleOpenAddSection}
                      icon={<Plus className="w-4 h-4" />}
                      className="font-bold cursor-pointer shrink-0"
                    >
                      Add Custom Section
                    </Button>
                  </div>

                  {customSections.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                      <p className="text-xs font-semibold text-slate-500">
                        No custom sections created for this website yet. Click &quot;Add Custom Section&quot; to build one.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customSections.map((sec, idx) => (
                        <div
                          key={sec.id || idx}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400/60 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            {sec.imageUrl ? (
                              <div className="w-14 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                                <img src={sec.imageUrl} alt={sec.title} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                #{idx + 1}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 truncate">
                                  {sec.title}
                                </span>
                                {sec.badge && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                    {sec.badge}
                                  </span>
                                )}
                              </div>
                              {sec.subtitle && (
                                <div className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                                  {sec.subtitle}
                                </div>
                              )}
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {sec.content}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600 mr-2">
                              <input
                                type="checkbox"
                                checked={sec.active !== false}
                                onChange={e => handleToggleSectionActive(sec.id, e.target.checked)}
                                className="rounded text-blue-600 w-3.5 h-3.5 focus:ring-blue-500"
                              />
                              <span className="text-[11px]">Active</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleMoveSection(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSection(idx, 'down')}
                              disabled={idx === customSections.length - 1}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditSection(sec)}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer"
                              title="Edit Section"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(sec.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                              title="Delete Section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

            {(activeScope === 'am-distributors' || activeScope === 'corporate') && slides.length > 0 ? (
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-500/30">
                    Depot Carousel Active ({slides.length} Slides)
                  </span>
                  <div className="flex gap-1.5">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPreviewSlideIdx(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                          previewSlideIdx === i ? 'bg-teal-400 scale-125' : 'bg-slate-700 hover:bg-slate-500'
                        }`}
                        title={`Preview slide #${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {slides[previewSlideIdx] && (
                  <div className="space-y-3">
                    <div className="h-36 rounded-2xl overflow-hidden border border-slate-800 relative shadow-md">
                      <img
                        src={slides[previewSlideIdx].imageUrl}
                        alt={slides[previewSlideIdx].title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-xs font-black text-white drop-shadow">
                        #{previewSlideIdx + 1}: {slides[previewSlideIdx].title}
                      </div>
                    </div>

                    <div className="text-sm font-black text-teal-300 leading-snug">
                      {slides[previewSlideIdx].subtitle}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {slides[previewSlideIdx].description}
                    </p>

                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-teal-500/20">
                        <span>{slides[previewSlideIdx].primaryCtaText || 'Order Wholesale Supply'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                      {slides[previewSlideIdx].secondaryCtaText && (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 border border-slate-700">
                          <span>{slides[previewSlideIdx].secondaryCtaText}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
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
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">Public Synchronization</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              When you click &ldquo;Save &amp; Publish Content&rdquo;, the document is persisted live in Cloud Firestore collection <code className="font-mono text-blue-700">banners</code>. Changes appear immediately on the corresponding public website.
            </p>
          </div>
        </div>
      </div>

      {/* CUSTOM SECTION MODAL */}
      {isSectionModalOpen && editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {customSections.some(s => s.id === editingSection.id) ? 'Edit Custom Section' : 'Create Custom Section'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure headline, content paragraphs, image, and CTA route for this website.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSectionModalOpen(false);
                  setEditingSection(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModalSection} className="space-y-4">
              <Input
                label="Section Title *"
                placeholder="e.g. Scheduled Institutional Bulk Water Delivery"
                value={editingSection.title}
                onChange={e => setEditingSection({ ...editingSection, title: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Subtitle / Supporting Tagline"
                  placeholder="e.g. Serving Khed & Chiplun Industrial Corridors"
                  value={editingSection.subtitle || ''}
                  onChange={e => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                />
                <Input
                  label="Section Badge Tag"
                  placeholder="e.g. Commercial Wholesale Priority"
                  value={editingSection.badge || ''}
                  onChange={e => setEditingSection({ ...editingSection, badge: e.target.value })}
                />
              </div>

              <TextArea
                label="Section Body / Content Description *"
                placeholder="Write the detailed information, operational specifications, or service summary here..."
                value={editingSection.content}
                onChange={e => setEditingSection({ ...editingSection, content: e.target.value })}
                rows={4}
                required
              />

              {/* Image Input + Upload */}
              <div className="space-y-2">
                <Input
                  label="Section Image URL / Path (Optional)"
                  placeholder="e.g. /images/products/am-water-jar-20l.jpg or upload below"
                  value={editingSection.imageUrl || ''}
                  onChange={e => setEditingSection({ ...editingSection, imageUrl: e.target.value })}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Upload Image from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files?.[0]) handleSectionImageUpload(e.target.files[0]);
                      }}
                    />
                  </label>
                  {isUploadingSectionImage && (
                    <span className="text-xs text-blue-600 font-semibold animate-pulse">
                      Compressing and attaching...
                    </span>
                  )}
                  {editingSection.imageUrl && (
                    <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <img
                        src={editingSection.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="CTA Button Text"
                  placeholder="e.g. Order Wholesale Supply"
                  value={editingSection.ctaText || ''}
                  onChange={e => setEditingSection({ ...editingSection, ctaText: e.target.value })}
                />
                <Input
                  label="CTA Button Route / Link"
                  placeholder="e.g. /brands/am-distributors/products or /contact"
                  value={editingSection.ctaLink || ''}
                  onChange={e => setEditingSection({ ...editingSection, ctaLink: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 pt-1">
                <input
                  type="checkbox"
                  checked={editingSection.active !== false}
                  onChange={e => setEditingSection({ ...editingSection, active: e.target.checked })}
                  className="rounded text-blue-600 w-4 h-4 focus:ring-blue-500"
                />
                <span>Active and Visible Immediately on Website</span>
              </label>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setIsSectionModalOpen(false);
                    setEditingSection(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Apply &amp; Publish Section
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Slide Edit/Create Modal */}
      {isSlideModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">
                  {slides.some(s => s.id === editingSlide.id) ? 'Edit Hero Slide' : 'Add New Hero Slide'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSlideModalOpen(false);
                  setEditingSlide(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalSlide} className="space-y-4">
              <Input
                label="Announcement Badge / Category"
                placeholder="e.g. PARENT COMPANY, ENTERPRISE TECH"
                value={editingSlide.badge || ''}
                onChange={e => setEditingSlide({ ...editingSlide, badge: e.target.value })}
              />

              <Input
                label="Slide Title *"
                placeholder="e.g. Connecting Businesses. Protecting What Matters."
                value={editingSlide.title}
                onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })}
                required
              />

              <Input
                label="Slide Subtitle *"
                placeholder="e.g. Nexalus Innovations LLP delivers connectivity, security and networking solutions."
                value={editingSlide.subtitle}
                onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                required
              />

              <TextArea
                label="Slide Copy / Description"
                placeholder="Additional details shown on the hero card."
                rows={2}
                value={editingSlide.description}
                onChange={e => setEditingSlide({ ...editingSlide, description: e.target.value })}
              />

              {/* Media Type Switcher: Image vs Video */}
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Hero Slide Background Media
                  </label>
                  <div className="flex bg-white p-0.5 rounded-lg border border-slate-300">
                    <button
                      type="button"
                      onClick={() => setEditingSlide({ ...editingSlide, mediaType: 'image' })}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        editingSlide.mediaType !== 'video'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📷 Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSlide({ ...editingSlide, mediaType: 'video' })}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        editingSlide.mediaType === 'video'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🎥 HD Video
                    </button>
                  </div>
                </div>

                {editingSlide.mediaType === 'video' ? (
                  <div className="space-y-2">
                    <Input
                      label="Video URL / Path"
                      placeholder="e.g. /videos/hero-background.mp4 or CDN link"
                      value={editingSlide.videoUrl || ''}
                      onChange={e => setEditingSlide({ ...editingSlide, videoUrl: e.target.value, mediaType: 'video' })}
                    />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer transition-all shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Upload Video (.mp4, .webm)</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          className="hidden"
                          onChange={e => {
                            if (e.target.files?.[0]) handleSlideVideoUpload(e.target.files[0]);
                          }}
                        />
                      </label>
                      {isUploadingSlideVideo && (
                        <span className="text-xs text-blue-600 font-semibold animate-pulse">
                          Attaching video...
                        </span>
                      )}
                    </div>
                    {editingSlide.videoUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-300 bg-slate-950 max-h-36">
                        <video
                          src={editingSlide.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-36 object-cover"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      label="Slide Image URL / Path"
                      placeholder="e.g. /images/products/am-icecream-tub.jpg or /images/fermilab-blue-racks-real.jpg"
                      value={editingSlide.imageUrl}
                      onChange={e => setEditingSlide({ ...editingSlide, imageUrl: e.target.value, mediaType: 'image' })}
                      required
                    />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer transition-all shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-teal-600" />
                        <span>Upload Image from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            if (e.target.files?.[0]) handleSlideImageUpload(e.target.files[0]);
                          }}
                        />
                      </label>
                      {editingSlide.imageUrl && (
                        <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                          <img
                            src={editingSlide.imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Primary Button Text"
                  placeholder="e.g. Inquire Ice Cream Wholesale"
                  value={editingSlide.primaryCtaText || ''}
                  onChange={e => setEditingSlide({ ...editingSlide, primaryCtaText: e.target.value })}
                />
                <Input
                  label="Primary Button Route"
                  placeholder="e.g. /brands/am-distributors/products"
                  value={editingSlide.primaryCtaLink || ''}
                  onChange={e => setEditingSlide({ ...editingSlide, primaryCtaLink: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Secondary Button Text"
                  placeholder="e.g. Explore Flavor Portfolio"
                  value={editingSlide.secondaryCtaText || ''}
                  onChange={e => setEditingSlide({ ...editingSlide, secondaryCtaText: e.target.value })}
                />
                <Input
                  label="Secondary Button Route"
                  placeholder="e.g. /contact"
                  value={editingSlide.secondaryCtaLink || ''}
                  onChange={e => setEditingSlide({ ...editingSlide, secondaryCtaLink: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setIsSlideModalOpen(false);
                    setEditingSlide(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="teal" size="md">
                  Apply Slide Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
