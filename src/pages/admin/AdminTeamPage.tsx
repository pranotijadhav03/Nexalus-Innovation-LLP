import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { AdminOutletContext } from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  uploadImageFile,
  getCachedTeamMembers
} from '../../firebase/services';
import { TeamMember } from '../../types';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Search,
  CheckCircle2,
  Sparkles,
  Shield,
  Building,
  Layers,
  Palette
} from 'lucide-react';

interface ColorTheme {
  id: string;
  name: string;
  colorLabel: string;
  circleBorder: string;
  circleShadow: string;
  circleHoverShadow: string;
  badgeBg: string;
  sampleHex: string;
}

const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'amber',
    name: 'Amber Gold',
    colorLabel: 'Executive & Leadership',
    circleBorder: 'border-amber-400',
    circleShadow: 'shadow-[0_10px_30px_rgba(245,158,11,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(245,158,11,0.7)]',
    badgeBg: 'bg-amber-500',
    sampleHex: '#f59e0b',
  },
  {
    id: 'blue',
    name: 'Royal Blue',
    colorLabel: 'Corporate & CCTV',
    circleBorder: 'border-blue-500',
    circleShadow: 'shadow-[0_10px_30px_rgba(59,130,246,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(59,130,246,0.7)]',
    badgeBg: 'bg-blue-600',
    sampleHex: '#2563eb',
  },
  {
    id: 'cyan',
    name: 'Cyan Neon',
    colorLabel: 'Fiber Optics & Broadband',
    circleBorder: 'border-cyan-400',
    circleShadow: 'shadow-[0_10px_30px_rgba(6,182,212,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(6,182,212,0.7)]',
    badgeBg: 'bg-cyan-600',
    sampleHex: '#0891b2',
  },
  {
    id: 'teal',
    name: 'Teal Fresh',
    colorLabel: 'Logistics & Depot Operations',
    circleBorder: 'border-teal-400',
    circleShadow: 'shadow-[0_10px_30px_rgba(20,184,166,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(20,184,166,0.7)]',
    badgeBg: 'bg-teal-600',
    sampleHex: '#0d9488',
  },
  {
    id: 'indigo',
    name: 'Indigo Enterprise',
    colorLabel: 'Enterprise Networking & ITTI',
    circleBorder: 'border-indigo-500',
    circleShadow: 'shadow-[0_10px_30px_rgba(99,102,241,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(99,102,241,0.7)]',
    badgeBg: 'bg-indigo-600',
    sampleHex: '#4f46e5',
  },
  {
    id: 'emerald',
    name: 'Emerald Pure',
    colorLabel: 'Chiplun Water & Quality',
    circleBorder: 'border-emerald-500',
    circleShadow: 'shadow-[0_10px_30px_rgba(16,185,129,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(16,185,129,0.7)]',
    badgeBg: 'bg-emerald-600',
    sampleHex: '#059669',
  },
  {
    id: 'sky',
    name: 'Sky Cool',
    colorLabel: 'Cold-Chain & Dairy Fleet',
    circleBorder: 'border-sky-400',
    circleShadow: 'shadow-[0_10px_30px_rgba(56,189,248,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(56,189,248,0.7)]',
    badgeBg: 'bg-sky-500',
    sampleHex: '#0284c7',
  },
  {
    id: 'rose',
    name: 'Rose Vibrant',
    colorLabel: 'Customer Desk & Hospitality',
    circleBorder: 'border-rose-400',
    circleShadow: 'shadow-[0_10px_30px_rgba(244,63,94,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(244,63,94,0.7)]',
    badgeBg: 'bg-rose-500',
    sampleHex: '#e11d48',
  },
  {
    id: 'purple',
    name: 'Purple Modern',
    colorLabel: 'Digital Infrastructure',
    circleBorder: 'border-purple-400',
    circleShadow: 'shadow-[0_10px_30px_rgba(168,85,247,0.45)]',
    circleHoverShadow: 'group-hover:shadow-[0_16px_40px_rgba(168,85,247,0.7)]',
    badgeBg: 'bg-purple-600',
    sampleHex: '#9333ea',
  },
];

export const AdminTeamPage: React.FC = () => {
  const { success, error } = useToast();
  const { isSuperAdmin, isInnovationsAdmin, isAmAdmin } = useAuth();
  const outletCtx = useOutletContext<AdminOutletContext>();
  const activeConsole = outletCtx?.activeConsole || 'master';

  const [members, setMembers] = useState<TeamMember[]>(() => getCachedTeamMembers('all'));
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getInitialFilterDivision = (): 'all' | 'corporate' | 'nexalus-innovations' | 'am-distributors' => {
    if (isAmAdmin || activeConsole === 'am-distributors') return 'am-distributors';
    if (isInnovationsAdmin || activeConsole === 'nexalus-innovations') return 'nexalus-innovations';
    return 'corporate';
  };

  const [filterDivision, setFilterDivision] = useState<'all' | 'corporate' | 'nexalus-innovations' | 'am-distributors'>(getInitialFilterDivision);

  useEffect(() => {
    if (isSuperAdmin) {
      if (activeConsole === 'am-distributors') setFilterDivision('am-distributors');
      else if (activeConsole === 'nexalus-innovations') setFilterDivision('nexalus-innovations');
      else setFilterDivision('corporate');
    }
  }, [activeConsole, isSuperAdmin]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<TeamMember | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [deptType, setDeptType] = useState<'leadership' | 'tech' | 'logistics' | 'operations'>('leadership');
  const [division, setDivision] = useState<'all' | 'corporate' | 'nexalus-innovations' | 'am-distributors'>('all');
  const [image, setImage] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [tag, setTag] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState('amber');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getTeamMembers('all');
      setMembers(data);
    } catch (err: any) {
      error('Error', 'Failed to load team members: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingMember(null);
    setName('');
    setRole('');
    if (isAmAdmin || activeConsole === 'am-distributors') {
      setDepartment('Distribution & Cold-Chain Logistics');
      setDeptType('logistics');
      setDivision('am-distributors');
      setSelectedThemeId('teal');
    } else if (isInnovationsAdmin || activeConsole === 'nexalus-innovations') {
      setDepartment('Optical Fiber & CCTV Engineering');
      setDeptType('tech');
      setDivision('nexalus-innovations');
      setSelectedThemeId('blue');
    } else {
      setDepartment('Leadership & Strategic Direction');
      setDeptType('leadership');
      setDivision('corporate');
      setSelectedThemeId('amber');
    }
    setImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');
    setSpecialty('Leading technical operations, security strategies, and regional execution across Maharashtra.');
    setTag('MANAGEMENT');
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setDepartment(member.department);
    setDeptType(member.deptType || 'leadership');
    setDivision(member.division || 'all');
    setImage(member.image);
    setSpecialty(member.specialty);
    setTag(member.tag);

    // Find closest matching color theme
    const matched = COLOR_THEMES.find(t => t.circleBorder === member.circleBorder) || COLOR_THEMES[0];
    setSelectedThemeId(matched.id);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const url = await uploadImageFile(e.target.files[0], 'team');
        setImage(url);
        success('Image Uploaded', 'Team member photo attached successfully.');
      } catch (err: any) {
        error('Upload Failed', err.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !role.trim()) {
      error('Validation Error', 'Full Name and Designation / Role are required.');
      return;
    }

    if (isAmAdmin && division !== 'am-distributors') {
      error('Access Denied', 'A.M. Distributors administrators can only add or update personnel for A.M. Distributors Chiplun.');
      return;
    }
    if (isInnovationsAdmin && division === 'am-distributors') {
      error('Access Denied', 'Nexalus Innovations administrators cannot manage personnel for A.M. Distributors.');
      return;
    }

    const theme = COLOR_THEMES.find(t => t.id === selectedThemeId) || COLOR_THEMES[0];

    const payload = {
      name: name.trim(),
      role: role.trim(),
      department: department.trim() || 'General Operations',
      deptType,
      division,
      image: image.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      specialty: specialty.trim() || 'Dedicated team member driving excellence.',
      tag: tag.trim() || role.split(' ')[0].toUpperCase(),
      circleBorder: theme.circleBorder,
      circleShadow: theme.circleShadow,
      circleHoverShadow: theme.circleHoverShadow,
      badgeBg: theme.badgeBg,
      published: true,
    };

    setIsSaving(true);
    try {
      if (editingMember) {
        await updateTeamMember(editingMember.id, payload);
        success('Member Updated', `${payload.name} details have been updated successfully.`);
      } else {
        await createTeamMember(payload);
        success('Member Added', `${payload.name} has been added to Our Team.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      error('Save Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;

    if (isAmAdmin && deleteCandidate.division !== 'am-distributors') {
      error('Access Denied', 'You cannot delete team members outside A.M. Distributors Chiplun.');
      return;
    }
    if (isInnovationsAdmin && deleteCandidate.division === 'am-distributors') {
      error('Access Denied', 'You cannot delete A.M. Distributors team members.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTeamMember(deleteCandidate.id);
      success('Member Removed', `${deleteCandidate.name} has been removed from Our Team.`);
      setDeleteCandidate(null);
      await loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const currentTheme = COLOR_THEMES.find(t => t.id === selectedThemeId) || COLOR_THEMES[0];

  // Filtering with strict role boundaries
  const filteredMembers = members.filter(m => {
    if (isAmAdmin && m.division !== 'am-distributors') return false;
    if (isInnovationsAdmin && m.division === 'am-distributors') return false;

    const matchesDivision =
      filterDivision === 'all'
        ? true
        : filterDivision === 'corporate'
        ? m.division === 'corporate' || m.division === 'all'
        : filterDivision === 'nexalus-innovations'
        ? m.division === 'nexalus-innovations' || m.division === 'all'
        : filterDivision === 'am-distributors'
        ? m.division === 'am-distributors'
        : true;

    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tag.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDivision && matchesSearch;
  });

  const divisionOptions = useMemo(() => {
    if (isAmAdmin) {
      return [
        { value: 'am-distributors', label: 'A.M. Distributors (Chiplun FMCG Depot)' }
      ];
    }
    if (isInnovationsAdmin) {
      return [
        { value: 'nexalus-innovations', label: 'Nexalus Innovations (Tech/Fiber/CCTV)' },
        { value: 'corporate', label: 'Parent Website Only (Nexalus Innovations LLP)' },
        { value: 'all', label: 'All Technology Portals' }
      ];
    }
    return [
      { value: 'all', label: 'All 3 Websites (Parent + Both Child Websites)' },
      { value: 'corporate', label: 'Parent Website Only (Nexalus Innovations LLP Corporate)' },
      { value: 'nexalus-innovations', label: 'Child Site 1: Nexalus Innovations (Tech/Fiber/CCTV)' },
      { value: 'am-distributors', label: 'Child Site 2: A.M. Distributors (Chiplun FMCG Depot)' },
    ];
  }, [isAmAdmin, isInnovationsAdmin]);

  const totalMembers = members.length;
  const parentMembers = members.filter(m => m.division === 'corporate' || m.division === 'all').length;
  const nexalusMembers = members.filter(m => m.division === 'nexalus-innovations' || m.division === 'all').length;
  const amMembers = members.filter(m => m.division === 'am-distributors' || m.division === 'all').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {activeConsole === 'master'
                ? 'Corporate Leadership & Executive Team'
                : activeConsole === 'nexalus-innovations'
                ? 'Nexalus Innovations Tech & Engineering Team'
                : 'A.M. Distributors Chiplun Depot & Logistics Team'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {activeConsole === 'master'
              ? 'Manage executive partners, directors, and governance leadership for Nexalus Innovations LLP.'
              : activeConsole === 'nexalus-innovations'
              ? 'Manage CCTV engineers, optical fiber specialists, and enterprise network administrators.'
              : 'Manage refrigerated fleet captains, Chiplun depot managers, and dairy compliance staff.'}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreateModal}
          icon={<Plus className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 font-bold shrink-0 w-full sm:w-auto justify-center"
        >
          Add Team Member
        </Button>
      </div>

      {/* Summary KPI Badges (Scoped by role) */}
      <div className={`grid gap-4 ${isAmAdmin ? 'grid-cols-1 max-w-xs' : isInnovationsAdmin ? 'grid-cols-2 max-w-md' : 'grid-cols-2 lg:grid-cols-4'}`}>
        {!isAmAdmin && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Total Team Members
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900">{isInnovationsAdmin ? nexalusMembers : totalMembers}</span>
              <span className="text-xs font-bold text-slate-400">{isInnovationsAdmin ? 'tech network' : 'across network'}</span>
            </div>
          </div>
        )}

        {!isAmAdmin && isSuperAdmin && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
              Parent: Nexalus LLP
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-blue-600">{parentMembers}</span>
              <span className="text-xs font-bold text-slate-400">Corporate HQ</span>
            </div>
          </div>
        )}

        {!isAmAdmin && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
              Nexalus Innovations
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-indigo-600">{nexalusMembers}</span>
              <span className="text-xs font-bold text-slate-400">Tech &amp; Fiber</span>
            </div>
          </div>
        )}

        {!isInnovationsAdmin && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">
              A.M. Distributors
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-teal-600">{amMembers}</span>
              <span className="text-xs font-bold text-slate-400">Chiplun Logistics</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Division Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {isSuperAdmin && (
            <button
              onClick={() => setFilterDivision('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                filterDivision === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Divisions ({totalMembers})
            </button>
          )}
          {isSuperAdmin && (
            <button
              onClick={() => setFilterDivision('corporate')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterDivision === 'corporate'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Parent: Nexalus LLP ({parentMembers})
            </button>
          )}
          {!isAmAdmin && (
            <button
              onClick={() => setFilterDivision('nexalus-innovations')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterDivision === 'nexalus-innovations'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Nexalus Innovations ({nexalusMembers})
            </button>
          )}
          {!isInnovationsAdmin && (
            <button
              onClick={() => setFilterDivision('am-distributors')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterDivision === 'am-distributors'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              A.M. Distributors ({amMembers})
            </button>
          )}
        </div>

        {/* Search */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search team member..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Team Members Grid View */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Loading team members...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No team members found</h3>
            <p className="text-xs text-slate-500">Try adjusting your filters or add a new team member.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openCreateModal}
            icon={<Plus className="w-4 h-4" />}
          >
            Add First Member
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map(member => (
            <div
              key={member.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Division Badge Pill */}
              <div className="flex items-center justify-between w-full mb-4">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                    member.division === 'corporate'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : member.division === 'nexalus-innovations'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : member.division === 'am-distributors'
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}
                >
                  {member.division === 'corporate'
                    ? 'Parent (Nexalus LLP)'
                    : member.division === 'nexalus-innovations'
                    ? 'Nexalus Innovations'
                    : member.division === 'am-distributors'
                    ? 'A.M. Distributors'
                    : 'All Websites'}
                </span>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Member"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteCandidate(member)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Round Photo with Colored Border & Shadow */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div
                    className={`w-32 h-32 rounded-full p-1 border-4 ${
                      member.circleBorder || 'border-blue-500'
                    } ${
                      member.circleShadow || 'shadow-[0_10px_30px_rgba(59,130,246,0.45)]'
                    } ${
                      member.circleHoverShadow || 'group-hover:shadow-[0_16px_40px_rgba(59,130,246,0.7)]'
                    } transition-all duration-300 overflow-hidden bg-slate-100 flex items-center justify-center`}
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {member.tag && (
                    <span
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-md whitespace-nowrap ${
                        member.badgeBg || 'bg-blue-600'
                      }`}
                    >
                      {member.tag}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  {member.name}
                </h3>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mt-1">
                  {member.role}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  {member.department}
                </p>
              </div>

              {/* Specialty & Description */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {member.specialty}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit Team Member' : 'Add New Team Member'}
        subtitle="Configure circular photo, matched color glow, role, and division visibility."
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-5 p-6 overflow-y-auto max-h-[75vh]">
          {/* Live Preview Box */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <div
                className={`w-28 h-28 rounded-full p-1 border-4 ${currentTheme.circleBorder} ${currentTheme.circleShadow} transition-all duration-300 overflow-hidden bg-slate-200 flex items-center justify-center`}
              >
                <img
                  src={image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </div>
              <span
                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-md whitespace-nowrap ${currentTheme.badgeBg}`}
              >
                {tag || 'TAG'}
              </span>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Live Card Preview
              </div>
              <h4 className="text-base font-black text-slate-900">
                {name || 'Team Member Name'}
              </h4>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                {role || 'Role / Designation'}
              </p>
              <p className="text-[11px] text-slate-500">
                {department || 'Department'}
              </p>
            </div>
          </div>

          {/* Color Theme Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Circle Color Theme &amp; Matching Glow Shadow
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {COLOR_THEMES.map(theme => {
                const isSelected = selectedThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-4 h-4 rounded-full border border-white shadow-xs shrink-0"
                        style={{ backgroundColor: theme.sampleHex }}
                      />
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">
                        {theme.name}
                      </p>
                      <p className="text-[9px] text-slate-500 truncate">
                        {theme.colorLabel}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Member Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Rahul Patil"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <Input
              label="Designation / Role *"
              placeholder="e.g. Lead CCTV Surveillance Engineer"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            />
          </div>

          {/* Department & Dept Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department Name"
              placeholder="e.g. Enterprise Fiber Division"
              value={department}
              onChange={e => setDepartment(e.target.value)}
            />
            <Select
              label="Department Category"
              value={deptType}
              onChange={e => setDeptType(e.target.value as any)}
              options={[
                { value: 'leadership', label: 'Leadership & Board' },
                { value: 'tech', label: 'Technical & Engineering' },
                { value: 'logistics', label: 'Logistics & Warehouse Depot' },
                { value: 'operations', label: 'Client Support & Operations' },
              ]}
            />
          </div>

          {/* Division (Website Target) & Badge Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Display on Website(s) *"
              value={division}
              onChange={e => setDivision(e.target.value as any)}
              options={divisionOptions}
            />
            <Input
              label="Badge Tag Pill (Shown under circle)"
              placeholder="e.g. LEADERSHIP, SURVEILLANCE, FIBER TECH"
              value={tag}
              onChange={e => setTag(e.target.value.toUpperCase())}
            />
          </div>

          {/* Photo URL & Local Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Photo Source (URL or Upload Image)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://images.unsplash.com/... or uploaded file"
                value={image}
                onChange={e => setImage(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-600 focus:outline-none"
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-slate-500">
              Tip: Upload a square portrait photo for the best circular presentation.
            </p>
          </div>

          {/* Specialty / Description */}
          <TextArea
            label="Specialty / Core Focus (Bio)"
            rows={3}
            placeholder="e.g. Specializes in multi-gigabit campus switching, Fluke cable certifications, and server rack installations."
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
          />

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              className="w-full sm:w-auto justify-center"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-700 font-bold shadow-md shadow-blue-500/20"
            >
              {isSaving ? 'Saving...' : editingMember ? 'Update Member' : 'Add Team Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Remove Team Member"
        maxWidth="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove <strong className="text-slate-900">{deleteCandidate?.name}</strong> from the team section? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteCandidate(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Removing...' : 'Yes, Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
