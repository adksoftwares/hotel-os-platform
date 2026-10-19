export type StaffRole = 'WAITER' | 'MAID' | 'ADMIN';

export interface StaffAccount {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export const INITIAL_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'STF-W01',
    firstName: 'Ravi',
    lastName: 'Kumar',
    phone: '+91 98401 23456',
    email: 'ravi.waiter@hotel.com',
    username: 'waiter_ravi',
    password: 'password123',
    role: 'WAITER',
    isActive: true,
    createdAt: '2026-10-10',
    lastLogin: '2026-10-19 14:30',
  },
  {
    id: 'STF-W02',
    firstName: 'Sanjay',
    lastName: 'Dutt',
    phone: '+91 98402 34567',
    email: 'sanjay.waiter@hotel.com',
    username: 'waiter_sanjay',
    password: 'password123',
    role: 'WAITER',
    isActive: true,
    createdAt: '2026-10-12',
    lastLogin: '2026-10-19 12:15',
  },
  {
    id: 'STF-M01',
    firstName: 'Priya',
    lastName: 'Selvam',
    phone: '+91 98403 45678',
    email: 'priya.maid@hotel.com',
    username: 'maid_priya',
    password: 'password123',
    role: 'MAID',
    isActive: true,
    createdAt: '2026-10-09',
    lastLogin: '2026-10-19 15:45',
  },
  {
    id: 'STF-M02',
    firstName: 'Anitha',
    lastName: 'Ramesh',
    phone: '+91 98404 56789',
    email: 'anitha.maid@hotel.com',
    username: 'maid_anitha',
    password: 'password123',
    role: 'MAID',
    isActive: true,
    createdAt: '2026-10-11',
    lastLogin: '2026-10-18 17:00',
  },
  {
    id: 'STF-A01',
    firstName: 'Hotel',
    lastName: 'Administrator',
    phone: '+91 98400 00000',
    email: 'admin@hotel.com',
    username: 'admin',
    password: 'Admin@123',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2026-10-01',
    lastLogin: '2026-10-19 17:00',
  },
];

const STORAGE_KEY = 'hotel_staff_accounts';

export const loadStaffAccounts = (): StaffAccount[] => {
  if (typeof window === 'undefined') return INITIAL_STAFF_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Seed default if empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STAFF_ACCOUNTS));
  } catch (_) {}
  return INITIAL_STAFF_ACCOUNTS;
};

export const saveStaffAccounts = (accounts: StaffAccount[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    window.dispatchEvent(new CustomEvent('staff_accounts_updated'));
  } catch (_) {}
};

export const createStaffAccount = (
  accountData: Omit<StaffAccount, 'id' | 'createdAt' | 'isActive'>
): StaffAccount => {
  const accounts = loadStaffAccounts();
  const prefix = accountData.role === 'WAITER' ? 'STF-W' : accountData.role === 'MAID' ? 'STF-M' : 'STF-A';
  const newId = `${prefix}${Math.floor(100 + Math.random() * 900)}`;

  const newAccount: StaffAccount = {
    ...accountData,
    id: newId,
    isActive: true,
    createdAt: new Date().toISOString().split('T')[0],
  };

  const updated = [newAccount, ...accounts];
  saveStaffAccounts(updated);
  return newAccount;
};

export const updateStaffAccount = (
  id: string,
  updates: Partial<Omit<StaffAccount, 'id' | 'createdAt'>>
) => {
  const accounts = loadStaffAccounts();
  const updated = accounts.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc));
  saveStaffAccounts(updated);
};

export const resetStaffPassword = (id: string, newPassword: string) => {
  const accounts = loadStaffAccounts();
  const updated = accounts.map((acc) =>
    acc.id === id ? { ...acc, password: newPassword } : acc
  );
  saveStaffAccounts(updated);
};

export const deleteStaffAccount = (id: string) => {
  const accounts = loadStaffAccounts();
  const updated = accounts.filter((acc) => acc.id !== id);
  saveStaffAccounts(updated);
};
