"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, UserPlus, Search, Edit3, Key, Trash2, 
  CheckCircle2, XCircle, ArrowLeft, Smartphone, Sparkles, 
  Phone, Mail, Lock, Eye, EyeOff, ShieldCheck, RefreshCw, X,
  Building2, Crown, Shield
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { 
  StaffAccount, 
  StaffRole, 
  loadStaffAccounts, 
  saveStaffAccounts, 
  createStaffAccount, 
  updateStaffAccount, 
  resetStaffPassword, 
  deleteStaffAccount 
} from '@/lib/staffStorage';

export default function StaffManagementPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'WAITER' | 'MAID'>('ADMIN');
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<StaffRole>('ADMIN');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffAccount | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    role: 'ADMIN' as StaffRole,
    property: 'Grand Horizon Resort - Marina Bay',
  });

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    username: '',
    role: 'ADMIN' as StaffRole,
    property: '',
    isActive: true,
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassText, setShowPassText] = useState(false);

  const refreshData = () => {
    setStaffList(loadStaffAccounts());
  };

  useEffect(() => {
    refreshData();
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role) {
          setCurrentUserRole(parsed.role);
          if (parsed.role === 'SUPER_ADMIN') {
            setActiveTab('ADMIN');
          }
        }
      }
    } catch (_) {}

    const handleSync = () => refreshData();
    window.addEventListener('staff_accounts_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('staff_accounts_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filter staff by active tab and search query
  const filteredStaff = staffList.filter((s) => {
    if (s.role !== activeTab) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        (s.property && s.property.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const adminCount = staffList.filter((s) => s.role === 'ADMIN').length;
  const waiterCount = staffList.filter((s) => s.role === 'WAITER').length;
  const maidCount = staffList.filter((s) => s.role === 'MAID').length;

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      username: '',
      password: '',
      role: activeTab,
      property: activeTab === 'ADMIN' ? 'Grand Horizon Resort - Marina Bay' : 'Grand Horizon Resort - Marina Bay',
    });
    setShowPassText(false);
    setShowCreateModal(true);
  };

  // Submit Create Form
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast('First and Last name are required.', 'error');
      return;
    }
    if (!formData.phone.trim() || !formData.email.trim()) {
      toast('Phone and Email are required.', 'error');
      return;
    }
    if (!formData.username.trim() || !formData.password.trim()) {
      toast('Username and Password are required.', 'error');
      return;
    }

    // Check duplicate username
    const usernameClean = formData.username.trim().toLowerCase();
    const exists = staffList.some((s) => s.username.toLowerCase() === usernameClean);
    if (exists) {
      toast(`Username "${formData.username}" is already taken. Please choose another.`, 'error');
      return;
    }

    const created = createStaffAccount({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      username: usernameClean,
      password: formData.password,
      role: formData.role,
      property: formData.property.trim() || 'Grand Horizon Resort - Marina Bay',
    });

    const roleLabel = 
      created.role === 'ADMIN' 
        ? 'Hotel Administrator' 
        : created.role === 'WAITER' 
        ? 'Waiter' 
        : 'Maid';

    toast(`New ${roleLabel} account "${created.firstName} ${created.lastName}" (@${created.username}) created successfully!`, 'success');
    setShowCreateModal(false);
    refreshData();
  };

  // Open Edit Modal
  const handleOpenEdit = (staff: StaffAccount) => {
    setSelectedStaff(staff);
    setEditFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      phone: staff.phone,
      email: staff.email,
      username: staff.username,
      role: staff.role,
      property: staff.property || 'Grand Horizon Resort - Marina Bay',
      isActive: staff.isActive,
    });
    setShowEditModal(true);
  };

  // Submit Edit Form
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    if (!editFormData.firstName.trim() || !editFormData.lastName.trim()) {
      toast('First and Last name are required.', 'error');
      return;
    }

    const usernameClean = editFormData.username.trim().toLowerCase();
    const duplicate = staffList.some(
      (s) => s.id !== selectedStaff.id && s.username.toLowerCase() === usernameClean
    );
    if (duplicate) {
      toast(`Username "${editFormData.username}" is already in use by another account.`, 'error');
      return;
    }

    updateStaffAccount(selectedStaff.id, {
      firstName: editFormData.firstName.trim(),
      lastName: editFormData.lastName.trim(),
      phone: editFormData.phone.trim(),
      email: editFormData.email.trim().toLowerCase(),
      username: usernameClean,
      role: editFormData.role,
      property: editFormData.property.trim(),
      isActive: editFormData.isActive,
    });

    toast(`Account for ${editFormData.firstName} ${editFormData.lastName} updated!`, 'success');
    setShowEditModal(false);
    setSelectedStaff(null);
    refreshData();
  };

  // Open Reset Password Modal
  const handleOpenReset = (staff: StaffAccount) => {
    setSelectedStaff(staff);
    setNewPassword('');
    setConfirmPassword('');
    setShowPassText(false);
    setShowResetModal(true);
  };

  // Submit Password Reset
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    if (!newPassword.trim()) {
      toast('Please enter a new password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      toast('Password must be at least 6 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match. Please verify.', 'error');
      return;
    }

    resetStaffPassword(selectedStaff.id, newPassword);
    toast(`Password for ${selectedStaff.firstName} (@${selectedStaff.username}) has been reset successfully!`, 'success');
    setShowResetModal(false);
    setSelectedStaff(null);
    refreshData();
  };

  // Generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = activeTab === 'ADMIN' ? 'Admin@' : activeTab === 'WAITER' ? 'Wait@' : 'Maid@';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(rand);
    setConfirmPassword(rand);
  };

  // Toggle Active/Inactive
  const handleToggleActive = (staff: StaffAccount) => {
    const updatedStatus = !staff.isActive;
    updateStaffAccount(staff.id, { isActive: updatedStatus });
    toast(`Account for ${staff.firstName} is now ${updatedStatus ? 'Active' : 'Suspended'}.`, updatedStatus ? 'success' : 'info');
    refreshData();
  };

  // Delete staff
  const handleDeleteConfirm = () => {
    if (!selectedStaff) return;
    if (selectedStaff.role === 'ADMIN' && adminCount <= 1) {
      toast('Cannot delete the last remaining Hotel Administrator account.', 'error');
      setShowDeleteModal(false);
      return;
    }
    deleteStaffAccount(selectedStaff.id);
    toast(`Account "${selectedStaff.firstName} ${selectedStaff.lastName}" deleted.`, 'info');
    setShowDeleteModal(false);
    setSelectedStaff(null);
    refreshData();
  };

  return (
    <div className="hotel-page">
      {/* Top Breadcrumb & Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/settings"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Settings</span>
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 shadow-xs border border-purple-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Hotel Admin Hub</h1>
                {currentUserRole === 'SUPER_ADMIN' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-500" /> Super Admin Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Super Admin governance: Provision and manage Hotel Administrators, F&B Waitstaff, and Housekeeping Attendants.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-xs transition-colors shadow-sm ${
            activeTab === 'ADMIN'
              ? 'bg-purple-700 hover:bg-purple-800'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>
            + Create {activeTab === 'ADMIN' ? 'Hotel Admin' : activeTab === 'WAITER' ? 'Waiter' : 'Maid'} Account
          </span>
        </button>
      </div>

      {/* Tabs Bar: Hotel Admins, Waiters & Maids */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Tab 1: Hotel Admins (Super Admin Control) */}
          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
              activeTab === 'ADMIN'
                ? 'bg-purple-950 text-white shadow-xs ring-2 ring-purple-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Hotel Admins (Property Admins)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'ADMIN' ? 'bg-purple-800 text-purple-100' : 'bg-purple-50 text-purple-700'
            }`}>
              {adminCount}
            </span>
          </button>

          {/* Tab 2: Waiters */}
          <button
            onClick={() => setActiveTab('WAITER')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
              activeTab === 'WAITER'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Waiters (F&B Waitstaff)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'WAITER' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {waiterCount}
            </span>
          </button>

          {/* Tab 3: Maids */}
          <button
            onClick={() => setActiveTab('MAID')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
              activeTab === 'MAID'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Maids (Housekeeping Attendants)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'MAID' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {maidCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'ADMIN' ? 'hotel admins' : activeTab === 'WAITER' ? 'waiters' : 'maids'} by name, property...`}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          />
        </div>
      </div>

      {/* Super Admin Control Banner (Displayed when on Hotel Admins Tab) */}
      {activeTab === 'ADMIN' && (
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border border-purple-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/80 text-amber-300 flex items-center justify-center shrink-0 border border-purple-700/60 shadow-inner">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Super Admin: Hotel Administrator Provisioning</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Full Property Control
                </span>
              </div>
              <p className="text-xs text-purple-200/90 mt-0.5">
                Super Admins can create and authorize Hotel Administrators. Each Hotel Admin governs front office folios, restaurant KOTs, room readiness, and can provision local Waiters and Maids for their assigned property.
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenCreate}
            className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Hotel Admin</span>
          </button>
        </div>
      )}

      {/* Staff Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="p-4 pl-6">
                {activeTab === 'ADMIN' ? 'Hotel Administrator & Username' : 'Staff Member & Username'}
              </th>
              <th className="p-4">Assigned Hotel Property</th>
              <th className="p-4">Phone Number</th>
              <th className="p-4">Email Address</th>
              <th className="p-4">Workstation Access</th>
              <th className="p-4">Status</th>
              <th className="p-4">Last Shift Active</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                  No {activeTab === 'ADMIN' ? 'hotel administrator' : activeTab === 'WAITER' ? 'waiter' : 'maid'} accounts found matching your query.
                </td>
              </tr>
            ) : (
              filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${
                        staff.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : staff.role === 'WAITER'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {staff.role === 'ADMIN' ? (
                          <ShieldCheck className="w-4 h-4 text-purple-700" />
                        ) : (
                          `${staff.firstName[0]}${staff.lastName[0]}`
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 block text-xs">
                            {staff.firstName} {staff.lastName}
                          </span>
                          {staff.role === 'ADMIN' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              Admin
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block">
                          @{staff.username} • <span className="text-[10px] text-slate-500">{staff.id}</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-slate-700 font-medium">
                    <span className="flex items-center gap-1.5 text-xs">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[180px]">
                        {staff.property || 'Main Flagship Hotel'}
                      </span>
                    </span>
                  </td>

                  <td className="p-4 text-slate-700 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {staff.phone}
                    </span>
                  </td>

                  <td className="p-4 text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {staff.email}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      staff.role === 'ADMIN'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : staff.role === 'WAITER'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {staff.role === 'ADMIN' ? (
                        <>
                          <Crown className="w-3 h-3 text-purple-600" /> Hotel Admin (Full OS)
                        </>
                      ) : staff.role === 'WAITER' ? (
                        <>
                          <Smartphone className="w-3 h-3 text-amber-600" /> Waiter POS Handheld
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-emerald-600" /> Maid Housekeeper
                        </>
                      )}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(staff)}
                      title="Click to toggle account status"
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                        staff.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {staff.isActive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Suspended
                        </>
                      )}
                    </button>
                  </td>

                  <td className="p-4 text-slate-400 text-xs">
                    {staff.lastLogin || 'No shift logged yet'}
                  </td>

                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(staff)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Edit profile & contact details"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleOpenReset(staff)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Reset workstation password"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        <span>Reset Password</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedStaff(staff);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE ACCOUNT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${
                  formData.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Create {formData.role === 'ADMIN' ? 'Hotel Administrator' : formData.role === 'WAITER' ? 'Waiter' : 'Maid'} Account
                  </h3>
                  <p className="text-xs text-slate-500">
                    {formData.role === 'ADMIN'
                      ? 'Super Admin Provisioning: Grant full property management access'
                      : 'Enter personal and workstation credentials'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              {/* Account Role Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Role *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                      formData.role === 'ADMIN'
                        ? 'bg-purple-50 border-purple-300 text-purple-900 ring-2 ring-purple-400/30 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Crown className="w-4 h-4 text-purple-600" />
                    <span>Hotel Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'WAITER' })}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                      formData.role === 'WAITER'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400/30 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-amber-500" />
                    <span>Waiter POS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'MAID' })}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                      formData.role === 'MAID'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-2 ring-emerald-400/30 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Maid Portal</span>
                  </button>
                </div>
              </div>

              {/* Property Assignment (Crucial for Hotel Admins) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Hotel Property / Branch {formData.role === 'ADMIN' ? '*' : '(Optional)'}
                </label>
                <input
                  type="text"
                  required={formData.role === 'ADMIN'}
                  placeholder="e.g. Grand Horizon Resort - Marina Bay"
                  value={formData.property}
                  onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                  className="hotel-input text-xs"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-medium mr-1">Quick Suggestions:</span>
                  {[
                    'Grand Horizon Resort - Marina Bay',
                    'Grand Horizon Boutique & Villas',
                    'Grand Horizon City Center Suites'
                  ].map((prop) => (
                    <button
                      key={prop}
                      type="button"
                      onClick={() => setFormData({ ...formData, property: prop })}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-800 transition-colors"
                    >
                      {prop}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder={formData.role === 'ADMIN' ? 'e.g. Siddharth' : 'e.g. Karthik'}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="hotel-input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder={formData.role === 'ADMIN' ? 'e.g. Varma' : 'e.g. Raman'}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="hotel-input text-xs"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="hotel-input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder={formData.role === 'ADMIN' ? 'e.g. admin.resort@hotel.com' : 'e.g. staff@hotel.com'}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="hotel-input text-xs"
                  />
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username (Login ID) *</label>
                  <input
                    type="text"
                    required
                    placeholder={formData.role === 'ADMIN' ? 'e.g. admin_siddharth' : 'e.g. waiter_karthik'}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="hotel-input text-xs font-mono"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Password *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
                        let rand = formData.role === 'ADMIN' ? 'Admin@' : formData.role === 'WAITER' ? 'Wait@' : 'Maid@';
                        for (let i = 0; i < 4; i++) {
                          rand += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        setFormData({ ...formData, password: rand });
                      }}
                      className="text-[10px] text-purple-700 hover:underline font-semibold"
                    >
                      Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassText ? 'text' : 'password'}
                      required
                      placeholder={formData.role === 'ADMIN' ? 'e.g. Admin@123' : 'e.g. Waiter@123'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="hotel-input text-xs pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassText(!showPassText)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white font-bold text-xs transition-colors shadow-sm ${
                    formData.role === 'ADMIN' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Save & Activate Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACCOUNT DETAILS MODAL */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Profile: {selectedStaff.firstName} {selectedStaff.lastName}
                  </h3>
                  <p className="text-xs text-slate-500">ID: {selectedStaff.id}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="hotel-input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="hotel-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Property / Branch</label>
                <input
                  type="text"
                  placeholder="e.g. Grand Horizon Resort - Marina Bay"
                  value={editFormData.property}
                  onChange={(e) => setEditFormData({ ...editFormData, property: e.target.value })}
                  className="hotel-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="hotel-input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="hotel-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    className="hotel-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Assignment</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as StaffRole })}
                    className="hotel-input text-xs"
                  >
                    <option value="ADMIN">Hotel Administrator (Full Access)</option>
                    <option value="WAITER">Waiter (Waiter POS Handheld)</option>
                    <option value="MAID">Maid (Housekeeping)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Operational Status</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={editFormData.isActive}
                      onChange={() => setEditFormData({ ...editFormData, isActive: true })}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-emerald-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={!editFormData.isActive}
                      onChange={() => setEditFormData({ ...editFormData, isActive: false })}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-semibold text-rose-700">Suspended / Inactive</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowResetModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
                  <p className="text-xs text-slate-500">
                    For {selectedStaff.firstName} {selectedStaff.lastName} (@{selectedStaff.username})
                  </p>
                </div>
              </div>
              <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-3.5 text-xs">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate Strong Password</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password *</label>
                <div className="relative">
                  <input
                    type={showPassText ? 'text' : 'password'}
                    required
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="hotel-input text-xs pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassText(!showPassText)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="hotel-input text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                The account holder will be required to sign in with this new password on their workstation terminal or handheld.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  Set New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Account?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to delete the account for <strong className="text-slate-800">{selectedStaff.firstName} {selectedStaff.lastName}</strong> (@{selectedStaff.username})? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="w-1/2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
