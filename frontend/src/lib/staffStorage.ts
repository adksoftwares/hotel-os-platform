export type StaffRole = 'WAITER' | 'MAID' | 'ADMIN' | 'SUPER_ADMIN';

export interface StaffAccount {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  role: StaffRole;
  property?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export const INITIAL_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'STF-SA01',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '',
    email: 'superadmin@hotel.com',
    username: 'superadmin',
    password: 'Super@123',
    role: 'SUPER_ADMIN',
    property: 'Corporate Multi-Property HQ',
    isActive: true,
    createdAt: '2026-10-01',
    lastLogin: '2026-10-19 17:30',
  },
  {
    id: 'STF-A02',
    firstName: 'Hotel',
    lastName: 'Admin 001',
    phone: '',
    email: 'hotel001@hotel.com',
    username: 'hotel001',
    password: 'hotel001',
    role: 'ADMIN',
    property: 'Grand ADK Hotel',
    isActive: true,
    createdAt: '2026-10-20',
    lastLogin: '2026-10-20 18:00',
  },
];

const STORAGE_KEY = 'hotel_staff_accounts';

export const loadStaffAccounts = (): StaffAccount[] => {
  if (typeof window === 'undefined') return INITIAL_STAFF_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Purge fake mock staff accounts (including demo STF-A01 / admin@hotel.com)
        const fakeIdentifiers = [
          'admin',
          'stf-a01',
          'admin@hotel.com',
          'waiter_ravi',
          'waiter_sanjay',
          'maid_priya',
          'maid_anitha',
          'admin_meenakshi'
        ];
        const clean = parsed.filter(
          (p: StaffAccount) =>
            !fakeIdentifiers.includes((p.username || '').toLowerCase()) &&
            !fakeIdentifiers.includes((p.email || '').toLowerCase()) &&
            (p.id || '').toUpperCase() !== 'STF-A01'
        );

        // Ensure Super Admin exists
        const hasSuperAdmin = clean.some((p: StaffAccount) => p.role === 'SUPER_ADMIN' || p.username === 'superadmin');
        const finalAccounts = hasSuperAdmin ? clean : [...INITIAL_STAFF_ACCOUNTS.filter(a => a.role === 'SUPER_ADMIN'), ...clean];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalAccounts));
        return finalAccounts;
      }
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
  const prefix = accountData.role === 'SUPER_ADMIN' 
    ? 'STF-SA' 
    : accountData.role === 'ADMIN' 
    ? 'STF-A' 
    : accountData.role === 'WAITER' 
    ? 'STF-W' 
    : 'STF-M';
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

export const updateStaffAccount = (id: string, updates: Partial<StaffAccount>): boolean => {
  const accounts = loadStaffAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) return false;

  accounts[index] = { ...accounts[index], ...updates };
  saveStaffAccounts(accounts);
  return true;
};

export const resetStaffPassword = (id: string, newPass: string): boolean => {
  return updateStaffAccount(id, { password: newPass });
};

export const deleteStaffAccount = (id: string): boolean => {
  const accounts = loadStaffAccounts();
  const filtered = accounts.filter((a) => a.id !== id);
  if (filtered.length === accounts.length) return false;

  saveStaffAccounts(filtered);
  return true;
};
