"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, UserPlus, Search, Edit3, Key, Trash2, 
  CheckCircle2, XCircle, ArrowLeft, Smartphone, Sparkles, 
  Phone, Mail, Lock, Eye, EyeOff, ShieldCheck, RefreshCw, X
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
  const [activeTab, setActiveTab] = useState<'WAITER' | 'MAID'>('WAITER');
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
    role: 'WAITER' as StaffRole,
  });

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    username: '',
    role: 'WAITER' as StaffRole,
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
        s.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
    });

    toast(`New ${created.role === 'WAITER' ? 'Waiter' : 'Maid'} account "${created.firstName} ${created.lastName}" (@${created.username}) created successfully!`, 'success');
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
      toast(`Username "${editFormData.username}" is already in use by another staff member.`, 'error');
      return;
    }

    updateStaffAccount(selectedStaff.id, {
      firstName: editFormData.firstName.trim(),
      lastName: editFormData.lastName.trim(),
      phone: editFormData.phone.trim(),
      email: editFormData.email.trim().toLowerCase(),
      username: usernameClean,
      role: editFormData.role,
      isActive: editFormData.isActive,
    });

    toast(`Staff profile for ${editFormData.firstName} ${editFormData.lastName} updated!`, 'success');
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
    let rand = activeTab === 'WAITER' ? 'Wait@' : 'Maid@';
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
    deleteStaffAccount(selectedStaff.id);
    toast(`Staff account "${selectedStaff.firstName} ${selectedStaff.lastName}" deleted.`, 'info');
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
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Account Management</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Create and manage dedicated shift accounts for Waiters and Maids with individual login credentials.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Create {activeTab === 'WAITER' ? 'Waiter' : 'Maid'} Account</span>
        </button>
      </div>

      {/* Tabs Bar: Waiters & Maids */}
      <div className="flex items-center justify-between gap-4 mb-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('WAITER')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
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

          <button
            onClick={() => setActiveTab('MAID')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
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
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'WAITER' ? 'waiters' : 'maids'} by name, phone...`}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="p-4 pl-6">Staff Member & Username</th>
              <th className="p-4">Phone Number</th>
              <th className="p-4">Email Address</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Last Shift Active</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                  No {activeTab === 'WAITER' ? 'waiter' : 'maid'} accounts found matching your query.
                </td>
              </tr>
            ) : (
              filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        staff.role === 'WAITER' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {staff.firstName[0]}{staff.lastName[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          {staff.firstName} {staff.lastName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 block">
                          @{staff.username} • <span className="text-[10px] text-slate-500">{staff.id}</span>
                        </span>
                      </div>
                    </div>
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
                      staff.role === 'WAITER'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {staff.role === 'WAITER' ? <Smartphone className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                      {staff.role === 'WAITER' ? 'Waiter POS' : 'Maid Housekeeper'}
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
                        title="Delete staff account"
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

      {/* CREATE STAFF ACCOUNT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Create {formData.role === 'WAITER' ? 'Waiter' : 'Maid'} Account
                  </h3>
                  <p className="text-xs text-slate-500">Enter personal and workstation credentials</p>
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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'WAITER' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                      formData.role === 'WAITER'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400/30'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-amber-500" />
                    <span>Waiter POS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'MAID' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                      formData.role === 'MAID'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-2 ring-emerald-400/30'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Maid Housekeeper</span>
                  </button>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karthik"
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
                    placeholder="e.g. Raman"
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
                    placeholder="e.g. karthik@hotel.com"
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
                    placeholder="e.g. waiter_karthik"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="hotel-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift Password *</label>
                  <div className="relative">
                    <input
                      type={showPassText ? 'text' : 'password'}
                      required
                      placeholder="e.g. Waiter@123"
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  Save & Activate Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF DETAILS MODAL */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-150">
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
                    <option value="WAITER">Waiter (Waiter POS)</option>
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
                      className="text-blue-600 focus:ring-blue-500"
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
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate Strong Password</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Shift Password *</label>
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
                The staff member will be required to sign in with this new password on their workstation handheld.
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
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Staff Account?</h3>
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
