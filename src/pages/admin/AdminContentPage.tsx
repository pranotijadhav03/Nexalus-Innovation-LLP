import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getBanners, updateBanner, getCachedBanners, uploadImageFile } from '../../firebase/services';
import {
  initialBanners,
  DEFAULT_AM_SLIDES,
  DEFAULT_INNOVATIONS_SLIDES,
  DEFAULT_NEXALUS_SLIDES,
  DEFAULT_OUR_BRANDS_CARDS,
  DEFAULT_PARENT_SECTIONS,
  DEFAULT_INNOVATIONS_SECTIONS,
  DEFAULT_AM_SECTIONS
} from '../../data/initialData';
import {
  SiteBanner,
  HeroSlide,
  CustomSection,
  NavbarSettings,
  NavItemConfig,
  BrandDivisionCard,
  WhereServicesUsedSettings,
  EnvironmentCategory,
  DistributionVertical,
  FooterSettings
} from '../../types';
import { Input, TextArea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import {
  Image,
  CheckCircle2,
  Save,
  Building,
  Building2,
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
  Upload,
  Droplets,
  IceCream,
  Milk,
  Truck
} from 'lucide-react';

type ContentScope = 'corporate' | 'nexalus-innovations' | 'am-distributors';
type ContentTab = 'hero' | 'navbar' | 'brands' | 'where-services' | 'verticals' | 'footer' | 'contact' | 'sections';

const APPROVED_ROUTES = [
  { label: 'Parent: Home (/)', path: '/' },
  { label: 'Parent: Our Brands (/#our-brands)', path: '/#our-brands' },
  { label: 'Parent: Services (/services)', path: '/services' },
  { label: 'Parent: Plans (/plans)', path: '/plans' },
  { label: 'Parent: Coverage (/coverage)', path: '/coverage' },
  { label: 'Parent: Projects (/projects)', path: '/projects' },
  { label: 'Parent: About (/about)', path: '/about' },
  { label: 'Parent: Contact (/contact)', path: '/contact' },
  { label: 'Innovations: Home (/brands/nexalus-innovations)', path: '/brands/nexalus-innovations' },
  { label: 'Innovations: About (/brands/nexalus-innovations/about)', path: '/brands/nexalus-innovations/about' },
  { label: 'Innovations: Products (/brands/nexalus-innovations/products)', path: '/brands/nexalus-innovations/products' },
  { label: 'Innovations: Services (/brands/nexalus-innovations/services)', path: '/brands/nexalus-innovations/services' },
  { label: 'Innovations: Contact (/brands/nexalus-innovations/contact)', path: '/brands/nexalus-innovations/contact' },
  { label: 'AM Distributors: Home (/brands/am-distributors)', path: '/brands/am-distributors' },
  { label: 'AM Distributors: About (/brands/am-distributors/about)', path: '/brands/am-distributors/about' },
  { label: 'AM Distributors: Products (/brands/am-distributors/products)', path: '/brands/am-distributors/products' },
  { label: 'AM Distributors: Services (/brands/am-distributors/services)', path: '/brands/am-distributors/services' },
  { label: 'AM Distributors: Contact (/brands/am-distributors/contact)', path: '/brands/am-distributors/contact' }
];

export const AdminContentPage: React.FC = () => {
  const { isSuperAdmin, isInnovationsAdmin, isAmAdmin, canManageBrand } = useAuth();
  const outletCtx = useOutletContext<{ activeConsole?: string }>();
  const { success, error } = useToast();

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

  // Hero Carousel Slides
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  // Dynamic Custom Sections State
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [editingSection, setEditingSection] = useState<CustomSection | null>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isUploadingSectionImage, setIsUploadingSectionImage] = useState(false);

  // 15 Sections Admin Manageable State
  // P1, N1, A1 Navbar Settings
  const [navbarSettings, setNavbarSettings] = useState<NavbarSettings>({
    logoUrl: '',
    brandName: '',
    tagline: '',
    topBannerText: '',
    topBannerPhone: '',
    showTopBanner: true,
    navLinks: [],
    portalButtonLabel: 'Customer Portal',
    showPortalButton: true,
    quoteButtonLabel: 'Get a Quote',
    showQuoteButton: true
  });
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadingBrandIdx, setUploadingBrandIdx] = useState<number | null>(null);

  // P3 Our Brands Cards
  const [ourBrandsCards, setOurBrandsCards] = useState<BrandDivisionCard[]>(() => DEFAULT_OUR_BRANDS_CARDS);
  const [sectionsList, setSectionsList] = useState<Array<{ id: string; name: string; order: number; visible: boolean }>>(() => DEFAULT_PARENT_SECTIONS);

  // P12 Where Services Are Used
  const [whereServicesUsed, setWhereServicesUsed] = useState<WhereServicesUsedSettings>({
    badge: 'DEPLOYMENT ENVIRONMENTS & INDUSTRY FOOTPRINT',
    title: 'Where We Provide Services',
    description: 'High-availability infrastructure engineered for mission-critical operations across enterprise sectors.',
    environments: []
  });

  // A5 Core Distribution Verticals
  const [distributionVerticals, setDistributionVerticals] = useState<DistributionVertical[]>([]);

  // N11, A10 Footer Settings
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    phone: '',
    email: '',
    address: '',
    workingHours: '',
    dispatchSchedule: '',
    description: '',
    visible: true
  });

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
          : (targetId === 'ban-am'
              ? DEFAULT_AM_SLIDES
              : targetId === 'ban-innovations' || targetId === 'ban-nexalus-innovations'
              ? DEFAULT_INNOVATIONS_SLIDES
              : (DEFAULT_NEXALUS_SLIDES || []));
        setSlides(loadedSlides);

        if (current.navbarSettings) {
          setNavbarSettings(current.navbarSettings);
        } else {
          if (activeScope === 'corporate') {
            setNavbarSettings({
              logoUrl: '',
              brandName: 'NEXALUS INNOVATIONS LLP',
              tagline: 'Enterprise Technology & Infrastructure Solutions',
              topBannerText: '',
              topBannerPhone: '+91 9158886444',
              showTopBanner: false,
              navLinks: [
                { id: 'nav-home', label: 'Home', path: '/', visible: true, order: 1 },
                { id: 'nav-brands', label: 'Our Brands', path: '/#our-brands', visible: true, order: 2 },
                { id: 'nav-services', label: 'Services', path: '/services', visible: true, order: 3 },
                { id: 'nav-plans', label: 'Plans & Tariffs', path: '/plans', visible: true, order: 4 },
                { id: 'nav-coverage', label: 'Coverage', path: '/coverage', visible: true, order: 5 },
                { id: 'nav-projects', label: 'Projects', path: '/projects', visible: true, order: 6 },
                { id: 'nav-about', label: 'About Us', path: '/about', visible: true, order: 7 },
                { id: 'nav-contact', label: 'Contact', path: '/contact', visible: true, order: 8 }
              ],
              portalButtonLabel: 'Customer Portal',
              showPortalButton: true,
              quoteButtonLabel: 'Get a Quote',
              showQuoteButton: true
            });
          } else if (activeScope === 'nexalus-innovations') {
            setNavbarSettings({
              logoUrl: '',
              brandName: 'NEXALUS INNOVATIONS',
              tagline: 'CCTV Surveillance • Fiber Internet • Enterprise IT',
              topBannerText: 'Technical Support & NOC SLA: 24/7 Operations Desk',
              topBannerPhone: '+91 9158886444',
              showTopBanner: true,
              navLinks: [
                { id: 'nav-inno-home', label: 'Home', path: '/brands/nexalus-innovations', visible: true, order: 1 },
                { id: 'nav-inno-about', label: 'About Us', path: '/brands/nexalus-innovations/about', visible: true, order: 2 },
                { id: 'nav-inno-products', label: 'Products', path: '/brands/nexalus-innovations/products', visible: true, order: 3 },
                { id: 'nav-inno-services', label: 'Services & AMC', path: '/brands/nexalus-innovations/services', visible: true, order: 4 },
                { id: 'nav-inno-contact', label: 'Contact & Sales', path: '/brands/nexalus-innovations/contact', visible: true, order: 5 }
              ],
              quoteButtonLabel: 'Request Proposal',
              showQuoteButton: true,
              portalButtonLabel: 'Customer Portal',
              showPortalButton: true
            });
          } else {
            setNavbarSettings({
              logoUrl: '',
              brandName: 'A.M. DISTRIBUTORS CHIPLUN',
              tagline: 'Mineral Water • Dairy Products • Cold-Chain Logistics Hub',
              topBannerText: 'Dispatch: Daily 4:00 AM Morning Route',
              topBannerPhone: '+91 9158886444',
              showTopBanner: true,
              navLinks: [
                { id: 'nav-am-home', label: 'Home', path: '/brands/am-distributors', visible: true, order: 1 },
                { id: 'nav-am-about', label: 'About Depot', path: '/brands/am-distributors/about', visible: true, order: 2 },
                { id: 'nav-am-products', label: 'Products & Supplies', path: '/brands/am-distributors/products', visible: true, order: 3 },
                { id: 'nav-am-services', label: 'Cold-Chain & Fleet', path: '/brands/am-distributors/services', visible: true, order: 4 },
                { id: 'nav-am-contact', label: 'Depot Contact & Wholesale', path: '/brands/am-distributors/contact', visible: true, order: 5 }
              ],
              quoteButtonLabel: 'Wholesale Supply Booking',
              showQuoteButton: true,
              portalButtonLabel: 'Customer Portal',
              showPortalButton: true
            });
          }
        }

        if (current.ourBrandsCards && current.ourBrandsCards.length > 0) {
          setOurBrandsCards(current.ourBrandsCards);
        } else {
          setOurBrandsCards(DEFAULT_OUR_BRANDS_CARDS);
        }

        const defaultList = activeScope === 'nexalus-innovations'
          ? DEFAULT_INNOVATIONS_SECTIONS
          : activeScope === 'am-distributors'
          ? DEFAULT_AM_SECTIONS
          : DEFAULT_PARENT_SECTIONS;

        if (current.sectionsOrder && current.sectionsOrder.length > 0) {
          const savedIds = new Set(current.sectionsOrder.map((s: any) => s.id));
          const missing = defaultList.filter(d => !savedIds.has(d.id));
          setSectionsList([...current.sectionsOrder, ...missing]);
        } else {
          setSectionsList(defaultList);
        }
        if (current.whereServicesUsed) {
          setWhereServicesUsed(current.whereServicesUsed);
        }
        if (current.distributionVerticals) {
          setDistributionVerticals(current.distributionVerticals);
        }
        if (current.footerSettings) {
          setFooterSettings(current.footerSettings);
        }
      }
    } catch (err: any) {
      error('Failed to load content', err.message);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        slides,
        navbarSettings,
        ourBrandsCards,
        sectionsOrder: sectionsList,
        whereServicesUsed,
        distributionVerticals,
        footerSettings
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

  // Slides management
  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;
    const reordered = newSlides.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(reordered);
    try {
      await updateBanner(getTargetDocId(activeScope), { slides: reordered });
    } catch {}
    success('Sequence Updated', `Slide moved ${direction} and synchronized live.`);
  };

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
    try {
      await updateBanner(getTargetDocId(activeScope), { slides: newSlides });
    } catch {}
    success('Slide Removed', 'Slide deleted and synchronized live.');
  };

  const handleOpenEditSlide = (slide: HeroSlide) => {
    setEditingSlide({ ...slide });
    setIsSlideModalOpen(true);
  };

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
    try {
      await updateBanner(getTargetDocId(activeScope), { slides: updated });
    } catch {}
    success('Slide Applied', 'Slide details updated and synchronized live.');
  };

  // Logo upload
  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const url = await uploadImageFile(file, 'banners');
      if (url) {
        setNavbarSettings(prev => ({ ...prev, logoUrl: url }));
        success('Logo Attached', 'Brand logo image attached.');
      }
    } catch (err: any) {
      error('Upload Failed', err?.message || 'Could not process logo image.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // P3 Brand Showcase Image upload
  const handleBrandImageUpload = async (file: File, cardIndex: number) => {
    if (!file) return;
    setUploadingBrandIdx(cardIndex);
    try {
      const url = await uploadImageFile(file, 'banners');
      if (url) {
        const updated = [...ourBrandsCards];
        updated[cardIndex].image = url;
        setOurBrandsCards(updated);
        success('Image Uploaded', `${updated[cardIndex].name || 'Brand'} showcase image uploaded.`);
      }
    } catch (err: any) {
      error('Upload Failed', err?.message || 'Could not process showcase image.');
    } finally {
      setUploadingBrandIdx(null);
    }
  };

  // Nav Links helper
  const handleMoveNavLink = (index: number, direction: 'up' | 'down') => {
    const links = [...(navbarSettings.navLinks || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= links.length) return;
    const temp = links[index];
    links[index] = links[targetIdx];
    links[targetIdx] = temp;
    const reordered = links.map((l, idx) => ({ ...l, order: idx + 1 }));
    setNavbarSettings(prev => ({ ...prev, navLinks: reordered }));
  };

  const handleAddNavLink = () => {
    const links = [...(navbarSettings.navLinks || [])];
    const newLink: NavItemConfig = {
      id: `nav-${Date.now()}`,
      label: 'New Page',
      path: '/',
      visible: true,
      order: links.length + 1
    };
    setNavbarSettings(prev => ({ ...prev, navLinks: [...links, newLink] }));
  };

  const handleDeleteNavLink = (id: string) => {
    const links = (navbarSettings.navLinks || []).filter(l => l.id !== id).map((l, idx) => ({ ...l, order: idx + 1 }));
    setNavbarSettings(prev => ({ ...prev, navLinks: links }));
  };

  const handleMoveSection = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sectionsList.length) return;
    const updated = [...sectionsList];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    const reordered = updated.map((s, i) => ({ ...s, order: i + 1 }));
    setSectionsList(reordered);
    try {
      await updateBanner(getTargetDocId(activeScope), { sectionsOrder: reordered });
    } catch {}
    success('Sequence Synchronized', `Moved "${temp.name}" ${direction}. Landing page reordered live.`);
  };

  const handleToggleSectionVisibility = async (idx: number, visible: boolean) => {
    const updated = [...sectionsList];
    updated[idx] = { ...updated[idx], visible };
    setSectionsList(updated);
    try {
      await updateBanner(getTargetDocId(activeScope), { sectionsOrder: updated });
    } catch {}
    success('Visibility Updated', `"${updated[idx].name}" is now ${visible ? 'visible' : 'hidden'} on public landing page.`);
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
            Manage public hero headlines, navbars, showcases, distribution verticals, and contact details across all companies.
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

      {/* Scope Identity Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
            activeScope === 'corporate'
              ? 'bg-blue-600 shadow-blue-500/20'
              : activeScope === 'nexalus-innovations'
              ? 'bg-indigo-600 shadow-indigo-500/20'
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
                ? 'Managing Header/Navbar (P1), Our Brands (P3), Where Services Used (P12), Hero, and Contact'
                : activeScope === 'nexalus-innovations'
                ? 'Managing Division Header/Navbar (N1), Hero (N2), and Division Footer (N11)'
                : 'Managing Depot Header/Navbar (A1), Core Verticals (A5), and Depot Footer (A10)'}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border tracking-wider bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-1.5 self-start sm:self-auto shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Doc: {getTargetDocId(activeScope)}
        </span>
      </div>

      {/* Content Section Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'hero' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          <span>Hero Section {activeScope === 'nexalus-innovations' && '(N2)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('navbar')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'navbar' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {activeScope === 'corporate' ? 'Header & Navbar (P1)' : activeScope === 'nexalus-innovations' ? 'Division Navbar (N1)' : 'Depot Navbar (A1)'}
          </span>
        </button>

        {activeScope === 'corporate' && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('brands')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'brands' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Our Brands (P3)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('where-services')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'where-services' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Where Services Used (P12)</span>
            </button>
          </>
        )}

        {activeScope === 'am-distributors' && (
          <button
            type="button"
            onClick={() => setActiveTab('verticals')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'verticals' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Distribution Verticals (A5)</span>
          </button>
        )}

        {activeScope !== 'corporate' && (
          <button
            type="button"
            onClick={() => setActiveTab('footer')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'footer' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Footer &amp; Details {activeScope === 'nexalus-innovations' ? '(N11)' : '(A10)'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'contact' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Contact Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sections' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Section Visibility</span>
        </button>
      </div>

      {/* Editor Form & Save Bar */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          
          {/* TAB 1: HERO SECTION */}
          {activeTab === 'hero' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Hero Section Headline &amp; Visuals {activeScope === 'nexalus-innovations' && '(N2)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage the main headline, background imagery, and call-to-action buttons.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-teal-900/10 via-emerald-900/10 to-transparent border border-teal-500/20">
                    <div>
                      <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-teal-600" />
                        <span>Hero Carousel Slides ({slides.length})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage sequence, photos, title, subtitle, and copy for each slide.
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
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
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

                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveSlide(idx, 'up')}
                            disabled={idx === 0}
                            title="Move Up"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSlide(idx, 'down')}
                            disabled={idx === slides.length - 1}
                            title="Move Down"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditSlide(slide)}
                            title="Edit slide"
                            className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlide(slide.id)}
                            disabled={slides.length <= 1}
                            title="Delete slide"
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Headline Title *"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Connecting Businesses. Protecting What Matters."
                  required
                />
                <Input
                  label="Badge Tag"
                  value={badge}
                  onChange={e => setBadge(e.target.value)}
                  placeholder="e.g. Enterprise Networking & Security"
                />
              </div>

              <TextArea
                label="Supporting Subtitle / Paragraph"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                rows={3}
                placeholder="Description text displayed below the headline..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Primary Button Label"
                  value={ctaText}
                  onChange={e => setCtaText(e.target.value)}
                  placeholder="e.g. Explore Solutions"
                />
                <Input
                  label="Primary Button Route"
                  value={ctaLink}
                  onChange={e => setCtaLink(e.target.value)}
                  placeholder="e.g. /services"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Secondary Button Label"
                  value={secondaryCtaText}
                  onChange={e => setSecondaryCtaText(e.target.value)}
                  placeholder="e.g. Request Quotation"
                />
                <Input
                  label="Secondary Button Route"
                  value={secondaryCtaLink}
                  onChange={e => setSecondaryCtaLink(e.target.value)}
                  placeholder="e.g. /quote"
                />
              </div>
            </div>
          )}

          {/* TAB 2: NAVBAR & BRANDING (P1, N1, A1) */}
          {activeTab === 'navbar' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Header &amp; Navigation Menu Management {activeScope === 'corporate' ? '(P1)' : activeScope === 'nexalus-innovations' ? '(N1)' : '(A1)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage company logo, brand name, corporate tagline, top announcement bar, action buttons, and nav menu items.
                  </p>
                </div>
              </div>

              {/* Logo & Identity */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Brand Identity &amp; Logo
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    value={navbarSettings.brandName || ''}
                    onChange={e => setNavbarSettings(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder="e.g. NEXALUS INNOVATIONS LLP"
                  />
                  <Input
                    label="Corporate Tagline"
                    value={navbarSettings.tagline || ''}
                    onChange={e => setNavbarSettings(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="e.g. Enterprise Technology & Infrastructure Solutions"
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label="Custom Logo Image URL (Optional)"
                    value={navbarSettings.logoUrl || ''}
                    onChange={e => setNavbarSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="e.g. /images/logo.png or uploaded image URL"
                  />
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Upload Logo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]);
                        }}
                      />
                    </label>
                    {isUploadingLogo && <span className="text-xs text-blue-600 animate-pulse font-semibold">Attaching logo...</span>}
                    {navbarSettings.logoUrl && (
                      <div className="flex items-center gap-2 pl-2">
                        <img src={navbarSettings.logoUrl} alt="Logo Preview" className="h-8 max-w-[120px] object-contain rounded border border-slate-200 bg-white" />
                        <button
                          type="button"
                          onClick={() => setNavbarSettings(prev => ({ ...prev, logoUrl: '' }))}
                          className="text-xs text-rose-600 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Announcement Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Top Announcement / Return Bar
                  </h4>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={navbarSettings.showTopBanner !== false}
                      onChange={e => setNavbarSettings(prev => ({ ...prev, showTopBanner: e.target.checked }))}
                      className="rounded text-blue-600"
                    />
                    <span>Show Top Bar</span>
                  </label>
                </div>
                {navbarSettings.showTopBanner !== false && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Top Bar Phone Number"
                      value={navbarSettings.topBannerPhone || ''}
                      onChange={e => setNavbarSettings(prev => ({ ...prev, topBannerPhone: e.target.value }))}
                      placeholder="+91 9158886444"
                    />
                    <Input
                      label="Top Bar Message / Schedule"
                      value={navbarSettings.topBannerText || ''}
                      onChange={e => setNavbarSettings(prev => ({ ...prev, topBannerText: e.target.value }))}
                      placeholder="e.g. Dispatch: Daily 4:00 AM Morning Route"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Header Action Buttons
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={navbarSettings.showPortalButton !== false}
                        onChange={e => setNavbarSettings(prev => ({ ...prev, showPortalButton: e.target.checked }))}
                        className="rounded text-blue-600"
                      />
                      <span>Show Customer Portal Button</span>
                    </label>
                    <Input
                      label="Portal Button Label"
                      value={navbarSettings.portalButtonLabel || 'Customer Portal'}
                      onChange={e => setNavbarSettings(prev => ({ ...prev, portalButtonLabel: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={navbarSettings.showQuoteButton !== false}
                        onChange={e => setNavbarSettings(prev => ({ ...prev, showQuoteButton: e.target.checked }))}
                        className="rounded text-blue-600"
                      />
                      <span>Show Quote / Booking Button</span>
                    </label>
                    <Input
                      label="Quote Button Label"
                      value={navbarSettings.quoteButtonLabel || 'Get a Quote'}
                      onChange={e => setNavbarSettings(prev => ({ ...prev, quoteButtonLabel: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Menu Items */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Navigation Menu Links ({navbarSettings.navLinks?.length || 0})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Control menu labels, approved system destinations, visibility, and ordering.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddNavLink}
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Menu Link
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {(navbarSettings.navLinks || []).map((link, idx) => (
                    <div key={link.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                      <div className="w-6 text-center text-xs font-black text-slate-400 shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={e => {
                            const updated = [...(navbarSettings.navLinks || [])];
                            updated[idx].label = e.target.value;
                            setNavbarSettings(prev => ({ ...prev, navLinks: updated }));
                          }}
                          className="text-xs border border-slate-300 rounded-lg p-2 font-bold"
                          placeholder="Menu Label"
                        />
                        <select
                          value={link.path}
                          onChange={e => {
                            const updated = [...(navbarSettings.navLinks || [])];
                            updated[idx].path = e.target.value;
                            setNavbarSettings(prev => ({ ...prev, navLinks: updated }));
                          }}
                          className="text-xs border border-slate-300 rounded-lg p-2 bg-white"
                        >
                          {APPROVED_ROUTES.map(r => (
                            <option key={r.path} value={r.path}>{r.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={link.visible !== false}
                            onChange={e => {
                              const updated = [...(navbarSettings.navLinks || [])];
                              updated[idx].visible = e.target.checked;
                              setNavbarSettings(prev => ({ ...prev, navLinks: updated }));
                            }}
                            className="rounded text-blue-600"
                          />
                          <span>Visible</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleMoveNavLink(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveNavLink(idx, 'down')}
                          disabled={idx === (navbarSettings.navLinks?.length || 0) - 1}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNavLink(link.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                          title="Delete Link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OUR BRANDS / DIVISIONS (P3) - Corporate Only */}
          {activeTab === 'brands' && activeScope === 'corporate' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Our Brands &amp; Operating Divisions Showcase (P3)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage the showcase cards for Nexalus Innovations and A.M. Distributors Chiplun displayed on the corporate landing page.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {ourBrandsCards.map((card, idx) => (
                  <div key={card.id || idx} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{card.name}</h4>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={card.visible !== false}
                          onChange={e => {
                            const updated = [...ourBrandsCards];
                            updated[idx].visible = e.target.checked;
                            setOurBrandsCards(updated);
                          }}
                          className="rounded text-blue-600"
                        />
                        <span>Card Visible on Homepage</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Company / Division Name"
                        value={card.name}
                        onChange={e => {
                          const updated = [...ourBrandsCards];
                          updated[idx].name = e.target.value;
                          setOurBrandsCards(updated);
                        }}
                      />
                      <Input
                        label="Category / Tagline"
                        value={card.categoryTagline || ''}
                        onChange={e => {
                          const updated = [...ourBrandsCards];
                          updated[idx].categoryTagline = e.target.value;
                          setOurBrandsCards(updated);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Approved Destination Route"
                        value={card.destinationPath || ''}
                        onChange={e => {
                          const updated = [...ourBrandsCards];
                          updated[idx].destinationPath = e.target.value;
                          setOurBrandsCards(updated);
                        }}
                        placeholder="/brands/nexalus-innovations"
                      />
                      <Input
                        label="Showcase Image Path / URL"
                        value={card.image || ''}
                        onChange={e => {
                          const updated = [...ourBrandsCards];
                          updated[idx].image = e.target.value;
                          setOurBrandsCards(updated);
                        }}
                      />
                    </div>

                    {/* Image Upload & Instant Preview */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {card.image ? (
                            <img
                              src={card.image}
                              alt={card.name}
                              className="w-16 h-12 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-bold shrink-0">
                              No Image
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-800">Upload Showcase Image</p>
                            <p className="text-[11px] text-slate-500">Supports PNG, JPG, WebP up to 5MB</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                            uploadingBrandIdx === idx
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                          }`}>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingBrandIdx === idx ? 'Uploading...' : 'Choose File'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingBrandIdx === idx}
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleBrandImageUpload(file, idx);
                              }}
                              className="hidden"
                            />
                          </label>
                          {card.image && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...ourBrandsCards];
                                updated[idx].image = '';
                                setOurBrandsCards(updated);
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Clear Image"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <TextArea
                      label="Short Description (Card Summary)"
                      value={card.description || ''}
                      onChange={e => {
                        const updated = [...ourBrandsCards];
                        updated[idx].description = e.target.value;
                        setOurBrandsCards(updated);
                      }}
                      rows={2}
                    />

                    {/* Highlights bullet points */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Service &amp; Business Highlights (Bullet Points)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...ourBrandsCards];
                            updated[idx].highlights = [...(updated[idx].highlights || []), 'New highlight item'];
                            setOurBrandsCards(updated);
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                          + Add Highlight
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {(card.highlights || []).map((hl, hlIdx) => (
                          <div key={hlIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={hl}
                              onChange={e => {
                                const updated = [...ourBrandsCards];
                                updated[idx].highlights[hlIdx] = e.target.value;
                                setOurBrandsCards(updated);
                              }}
                              className="flex-1 text-xs border border-slate-300 rounded-lg p-2"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...ourBrandsCards];
                                updated[idx].highlights = updated[idx].highlights.filter((_, i) => i !== hlIdx);
                                setOurBrandsCards(updated);
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WHERE SERVICES ARE USED (P12) - Corporate Only */}
          {activeTab === 'where-services' && activeScope === 'corporate' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Where Services Are Used — Industry Footprint (P12)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage the section headline, description, and enterprise deployment environment tabs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Section Badge Tag"
                  value={whereServicesUsed.badge || ''}
                  onChange={e => setWhereServicesUsed(prev => ({ ...prev, badge: e.target.value }))}
                  placeholder="DEPLOYMENT ENVIRONMENTS & INDUSTRY FOOTPRINT"
                />
                <Input
                  label="Section Title"
                  value={whereServicesUsed.title || ''}
                  onChange={e => setWhereServicesUsed(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Where We Provide Services"
                />
              </div>

              <TextArea
                label="Section Description"
                value={whereServicesUsed.description || ''}
                onChange={e => setWhereServicesUsed(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Environment Categories &amp; Highlights ({whereServicesUsed.environments?.length || 0})
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEnv: EnvironmentCategory = {
                        id: `env-${Date.now()}`,
                        label: 'New Sector',
                        title: 'New Environment Category',
                        tagline: 'High-availability architecture',
                        description: 'Description of deployments and infrastructure in this sector.',
                        image: '/images/products/cat6-cable.jpg',
                        highlights: [
                          { title: 'Core Deployment', subtitle: 'Engineered SLA architecture' },
                          { title: 'Dedicated Monitoring', subtitle: '24/7 Operations desk' }
                        ],
                        scopeSummary: 'Mission-critical enterprise connectivity',
                        visible: true,
                        order: (whereServicesUsed.environments?.length || 0) + 1
                      };
                      setWhereServicesUsed(prev => ({ ...prev, environments: [...(prev.environments || []), newEnv] }));
                    }}
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Environment
                  </Button>
                </div>

                <div className="space-y-4">
                  {(whereServicesUsed.environments || []).map((env, envIdx) => (
                    <div key={env.id || envIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-xs text-slate-800">#{envIdx + 1}: {env.title}</span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={env.visible !== false}
                              onChange={e => {
                                const updated = [...(whereServicesUsed.environments || [])];
                                updated[envIdx].visible = e.target.checked;
                                setWhereServicesUsed(prev => ({ ...prev, environments: updated }));
                              }}
                              className="rounded text-blue-600"
                            />
                            <span>Visible</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (whereServicesUsed.environments || []).filter((_, i) => i !== envIdx);
                              setWhereServicesUsed(prev => ({ ...prev, environments: updated }));
                            }}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Environment Title"
                          value={env.title}
                          onChange={e => {
                            const updated = [...(whereServicesUsed.environments || [])];
                            updated[envIdx].title = e.target.value;
                            setWhereServicesUsed(prev => ({ ...prev, environments: updated }));
                          }}
                        />
                        <Input
                          label="Tab Label / Short Name"
                          value={env.label || ''}
                          onChange={e => {
                            const updated = [...(whereServicesUsed.environments || [])];
                            updated[envIdx].label = e.target.value;
                            setWhereServicesUsed(prev => ({ ...prev, environments: updated }));
                          }}
                        />
                      </div>

                      <TextArea
                        label="Environment Overview"
                        value={env.description || ''}
                        onChange={e => {
                          const updated = [...(whereServicesUsed.environments || [])];
                          updated[envIdx].description = e.target.value;
                          setWhereServicesUsed(prev => ({ ...prev, environments: updated }));
                        }}
                        rows={2}
                      />

                      {/* Highlights */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-700 uppercase">Key Specifications &amp; Features</label>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...(whereServicesUsed.environments || [])];
                              updated[envIdx].highlights = [...(updated[envIdx].highlights || []), { title: 'New Feature', subtitle: 'Feature detail' }];
                              setWhereServicesUsed(prev => ({ ...prev, environments: updated }));
                            }}
                            className="text-[11px] font-bold text-blue-600"
                          >
                            + Add Feature
                          </button>
                        </div>
                        {(env.highlights || []).map((h, hIdx) => (
                          <div key={hIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={h.title}
                              placeholder="Title"
                              onChange={e => {
                                const updated = [...(whereServicesUsed.environments || [])];
                                updated[envIdx].highlights[hIdx].title = e.target.value;
                                setWhereServicesUsed(prev => ({ ...prev, environments: updated }));
                              }}
                              className="w-1/3 text-xs border border-slate-300 rounded p-1.5 font-bold"
                            />
                            <input
                              type="text"
                              value={h.subtitle}
                              placeholder="Detail"
                              onChange={e => {
                                const updated = [...(whereServicesUsed.environments || [])];
                                updated[envIdx].highlights[hIdx].subtitle = e.target.value;
                                setWhereServicesUsed(prev => ({ ...prev, environments: updated }));
                              }}
                              className="flex-1 text-xs border border-slate-300 rounded p-1.5"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...(whereServicesUsed.environments || [])];
                                updated[envIdx].highlights = updated[envIdx].highlights.filter((_, i) => i !== hIdx);
                                setWhereServicesUsed(prev => ({ ...prev, environments: updated }));
                              }}
                              className="text-rose-600 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DISTRIBUTION VERTICALS (A5) - AM Distributors Only */}
          {activeTab === 'verticals' && activeScope === 'am-distributors' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Core Distribution Verticals (A5)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage the 4 distribution vertical cards (Packaged Mineral Water, Ice Cream, Pasteurized Milk, Butter &amp; Dairy) on the Chiplun Depot landing page.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {distributionVerticals.map((vert, idx) => (
                  <div key={vert.id || idx} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{vert.name}</h4>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={vert.visible !== false}
                          onChange={e => {
                            const updated = [...distributionVerticals];
                            updated[idx].visible = e.target.checked;
                            setDistributionVerticals(updated);
                          }}
                          className="rounded text-teal-600"
                        />
                        <span>Card Visible on Depot Page</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Vertical Name / Title"
                        value={vert.name}
                        onChange={e => {
                          const updated = [...distributionVerticals];
                          updated[idx].name = e.target.value;
                          setDistributionVerticals(updated);
                        }}
                      />
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Category Icon
                        </label>
                        <select
                          value={vert.iconName || 'Truck'}
                          onChange={e => {
                            const updated = [...distributionVerticals];
                            updated[idx].iconName = e.target.value;
                            setDistributionVerticals(updated);
                          }}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white font-semibold"
                        >
                          <option value="Droplets">Droplets (Mineral Water)</option>
                          <option value="IceCream">IceCream (Ice Cream Distribution)</option>
                          <option value="Milk">Milk (Pasteurized Milk)</option>
                          <option value="Truck">Truck (Fleet & Dairy)</option>
                          <option value="Sparkles">Sparkles (Specialty Dairy)</option>
                        </select>
                      </div>
                    </div>

                    <TextArea
                      label="Vertical Summary / Description"
                      value={vert.description || ''}
                      onChange={e => {
                        const updated = [...distributionVerticals];
                        updated[idx].description = e.target.value;
                        setDistributionVerticals(updated);
                      }}
                      rows={2}
                    />

                    {/* Highlights bullet points */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Key Supply Highlights (Bullet Points)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...distributionVerticals];
                            updated[idx].highlights = [...(updated[idx].highlights || []), 'New supply specification'];
                            setDistributionVerticals(updated);
                          }}
                          className="text-xs font-bold text-teal-600 hover:text-teal-800"
                        >
                          + Add Highlight
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {(vert.highlights || []).map((hl, hlIdx) => (
                          <div key={hlIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={hl}
                              onChange={e => {
                                const updated = [...distributionVerticals];
                                updated[idx].highlights[hlIdx] = e.target.value;
                                setDistributionVerticals(updated);
                              }}
                              className="flex-1 text-xs border border-slate-300 rounded-lg p-2"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...distributionVerticals];
                                updated[idx].highlights = updated[idx].highlights.filter((_, i) => i !== hlIdx);
                                setDistributionVerticals(updated);
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: FOOTER SETTINGS (N11, A10) */}
          {activeTab === 'footer' && activeScope !== 'corporate' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Footer Information &amp; Operational Details {activeScope === 'nexalus-innovations' ? '(N11)' : '(A10)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage the footer summary paragraph, depot dispatch schedule, contact phone, and operating address.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={footerSettings.visible !== false}
                    onChange={e => setFooterSettings(prev => ({ ...prev, visible: e.target.checked }))}
                    className="rounded text-blue-600"
                  />
                  <span>Footer Visible</span>
                </label>
              </div>

              <TextArea
                label="Footer Company / Depot Description"
                value={footerSettings.description || ''}
                onChange={e => setFooterSettings(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Operating summary displayed in footer..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Footer Contact Phone"
                  value={footerSettings.phone || ''}
                  onChange={e => setFooterSettings(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 9158886444"
                />
                <Input
                  label="Footer Email Address"
                  value={footerSettings.email || ''}
                  onChange={e => setFooterSettings(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="support@company.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Depot / Facility Physical Address"
                  value={footerSettings.address || ''}
                  onChange={e => setFooterSettings(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Kherdi MIDC Road, Chiplun 415605"
                />
                <Input
                  label="Dispatch Schedule / Working Hours"
                  value={footerSettings.workingHours || ''}
                  onChange={e => setFooterSettings(prev => ({ ...prev, workingHours: e.target.value }))}
                  placeholder="Daily Route Dispatch: 4:00 AM - 8:00 PM"
                />
              </div>
            </div>
          )}

          {/* TAB 7: CONTACT & OPERATIONS */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Contact &amp; Operations Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update phone hotlines, support email, operating address, and business hours.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Telephone / Helpline"
                  value={supportPhone}
                  onChange={e => setSupportPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
                <Input
                  label="Official Email Address"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  placeholder="contact@nexalusinnovations.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Office / Depot Address"
                  value={officeAddress}
                  onChange={e => setOfficeAddress(e.target.value)}
                  placeholder="Chiplun, Maharashtra 415605"
                />
                <Input
                  label="Operating Hours"
                  value={workingHours}
                  onChange={e => setWorkingHours(e.target.value)}
                  placeholder="Mon - Sat: 9:00 AM - 7:00 PM"
                />
              </div>
            </div>
          )}

          {/* TAB 8: SECTION VISIBILITY & LIVE REORDERING (ALL THREE COMPANIES) */}
          {activeTab === 'sections' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Landing Page Section Ordering &amp; Visibility Controls
                  </h3>
                  <p className="text-xs text-slate-500">
                    Shift sections up or down on the public landing page and toggle visibility. Changes synchronize instantly.
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-500">
                  {sectionsList.filter(s => s.visible !== false).length} of {sectionsList.length} Sections Active
                </div>
              </div>

              <div className="space-y-2.5">
                {sectionsList.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      sec.visible !== false
                        ? 'bg-white border-slate-200 shadow-xs'
                        : 'bg-slate-50/80 border-slate-200/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700 shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate flex items-center gap-2">
                          <span>{sec.name}</span>
                          {sec.visible === false && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                              Hidden
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          ID: {sec.id}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSection(idx, 'up')}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Move Section Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={idx === sectionsList.length - 1}
                        onClick={() => handleMoveSection(idx, 'down')}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Move Section Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {/* Visibility Toggle */}
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer ml-1 select-none">
                        <input
                          type="checkbox"
                          checked={sec.visible !== false}
                          onChange={e => handleToggleSectionVisibility(idx, e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="hidden sm:inline">
                          {sec.visible !== false ? 'Visible' : 'Hidden'}
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Persistent Save Bar */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All updates synchronize live across public visitors upon saving.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              icon={<Save className="w-4 h-4" />}
              className="w-full sm:w-auto font-black px-6"
            >
              Save &amp; Publish Content
            </Button>
          </div>
        </div>
      </form>

      {/* Slide Edit Modal */}
      {isSlideModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Edit Carousel Slide</h3>
              <button
                type="button"
                onClick={() => { setIsSlideModalOpen(false); setEditingSlide(null); }}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveModalSlide} className="space-y-4">
              <Input
                label="Slide Title *"
                value={editingSlide.title}
                onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })}
                required
              />
              <Input
                label="Subtitle"
                value={editingSlide.subtitle}
                onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
              />
              <TextArea
                label="Description"
                value={editingSlide.description}
                onChange={e => setEditingSlide({ ...editingSlide, description: e.target.value })}
                rows={3}
              />
              <Input
                label="Image URL / Path"
                value={editingSlide.imageUrl}
                onChange={e => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Primary Button Text"
                  value={editingSlide.primaryCtaText || ''}
                  onChange={e => setEditingSlide({ ...editingSlide, primaryCtaText: e.target.value })}
                />
                <Input
                  label="Primary Button Route"
                  value={editingSlide.primaryCtaLink || ''}
                  onChange={e => setEditingSlide({ ...editingSlide, primaryCtaLink: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsSlideModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Slide
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
