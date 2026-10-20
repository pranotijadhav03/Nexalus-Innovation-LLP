import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, BrandId } from '../types';
import { getUsers, addAuditLog } from '../firebase/services';
import { initialUsers } from '../data/initialData';

interface AuthContextType {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  quickLogin: (role?: 'super_admin' | 'innovations_admin' | 'am_admin') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  canManageBrand: (brandId: BrandId | 'general' | 'nexalus' | 'nexalus-innovations' | 'am-distributors') => boolean;
  brandScope: BrandId | 'all';
  isSuperAdmin: boolean;
  isInnovationsAdmin: boolean;
  isAmAdmin: boolean;
  isCpPlusAdmin: boolean;
  isOneBroadbandAdmin: boolean;
  isNetworkingAdmin: boolean;
}

const AUTH_USER_KEY = 'nexalus_admin_session';

function getStoredSession(): AdminUser | null {
  try {
    const session = sessionStorage.getItem(AUTH_USER_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed && parsed.email) return parsed;
    }
  } catch (e) {}
  try {
    const local = localStorage.getItem(AUTH_USER_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed && parsed.email) return parsed;
    }
  } catch (e) {}
  return null;
}

function persistSession(user: AdminUser | null): void {
  if (user) {
    try {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (e) {}
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (e) {}
  } else {
    try {
      sessionStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {}
    try {
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {}
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => getStoredSession());
  const [isLoading, setIsLoading] = useState<boolean>(() => !getStoredSession());

  useEffect(() => {
    let isMounted = true;
    async function verifySavedSession() {
      try {
        const saved = getStoredSession();
        if (saved && saved.email) {
          // Attempt fast validation against Firestore / local users
          try {
            const users = await getUsers();
            const matched = users.find(u => u.email.toLowerCase() === saved.email.toLowerCase());
            if (matched && matched.active && isMounted) {
              const updated = { ...matched, lastLogin: saved.lastLogin || new Date().toISOString() };
              setCurrentUser(updated);
              persistSession(updated);
            }
          } catch (e) {
            // Keep existing session if network check fails
            console.warn('Background session revalidation notice:', e);
          }
        }
      } catch (e) {
        console.error('Failed reading session state:', e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    verifySavedSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (!email || !email.trim()) {
        setIsLoading(false);
        return { success: false, error: 'Please enter your registered administrator email.' };
      }

      if (!password || !password.trim()) {
        setIsLoading(false);
        return { success: false, error: 'Password is required to unlock the Admin Dashboard.' };
      }

      const inputEmail = email.trim().toLowerCase();
      const inputPass = password.trim();

      const users = await getUsers();
      let matched = users.find(u => u.email.toLowerCase() === inputEmail);

      // Support simple alias if user enters just "admin" or "superadmin"
      if (!matched && (inputEmail === 'admin' || inputEmail === 'superadmin')) {
        matched = users.find(u => u.role === 'super_admin');
      }

      if (!matched) {
        setIsLoading(false);
        return { success: false, error: 'Access Denied: Unrecognized administrator email address. Try admin@nexalus.com' };
      }

      if (!matched.active) {
        setIsLoading(false);
        return { success: false, error: 'This admin account is currently deactivated. Contact Parent Corporate Admin.' };
      }

      // Flexible Simple Password Verification: accept admin123, admin@123 or defined password
      const isPasswordValid =
        matched.password === inputPass ||
        (matched.role === 'super_admin' && (inputPass === 'admin123' || inputPass === 'admin@123' || inputPass === 'Nexalus@Admin2026')) ||
        (matched.role === 'innovations_admin' && (inputPass === 'admin123' || inputPass === 'Innovations@2026')) ||
        (matched.role === 'am_admin' && (inputPass === 'admin123' || inputPass === 'AmChiplun@2026'));

      if (!isPasswordValid) {
        setIsLoading(false);
        return { success: false, error: 'Access Denied: Invalid administrator password. Try admin123' };
      }

      const userWithUpdatedLogin: AdminUser = {
        ...matched,
        lastLogin: new Date().toISOString()
      };

      setCurrentUser(userWithUpdatedLogin);
      persistSession(userWithUpdatedLogin);
      try {
        addAuditLog('ADMIN_LOGIN', `Admin signed in: ${userWithUpdatedLogin.email} (${userWithUpdatedLogin.role})`, undefined, userWithUpdatedLogin.email).catch(console.warn);
      } catch (e) {
        console.warn('Audit log write error:', e);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed.' };
    }
  };

  const quickLogin = async (
    role: 'super_admin' | 'innovations_admin' | 'am_admin' = 'super_admin'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      let users: AdminUser[] = [];
      try {
        users = await getUsers();
      } catch (e) {
        console.warn('Quick login user fetch fallback:', e);
      }

      let target = users.find(u => u.role === role && u.active);
      if (!target) {
        target = initialUsers.find(u => u.role === role);
      }

      if (!target) {
        setIsLoading(false);
        return { success: false, error: 'Target admin profile could not be found.' };
      }

      const userWithUpdatedLogin: AdminUser = {
        ...target,
        lastLogin: new Date().toISOString()
      };

      setCurrentUser(userWithUpdatedLogin);
      persistSession(userWithUpdatedLogin);

      try {
        addAuditLog('ADMIN_LOGIN', `Quick-login activated: ${userWithUpdatedLogin.email} (${userWithUpdatedLogin.role})`, undefined, userWithUpdatedLogin.email).catch(console.warn);
      } catch (e) {
        console.warn('Audit log write error:', e);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Quick login failed.' };
    }
  };

  const logout = () => {
    if (currentUser) {
      try {
        addAuditLog('ADMIN_LOGOUT', `Admin signed out: ${currentUser.email}`, undefined, currentUser.email).catch(console.warn);
      } catch (e) {}
    }
    setCurrentUser(null);
    persistSession(null);
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isInnovationsAdmin =
    currentUser?.role === 'innovations_admin' ||
    currentUser?.role === 'cp_plus_admin' ||
    currentUser?.role === 'one_broadband_admin' ||
    currentUser?.role === 'networking_admin';
  const isAmAdmin = currentUser?.role === 'am_admin';

  // Compatibility flags mapped to unified Nexalus Innovations
  const isCpPlusAdmin = isInnovationsAdmin;
  const isOneBroadbandAdmin = isInnovationsAdmin;
  const isNetworkingAdmin = isInnovationsAdmin;

  const brandScope: BrandId | 'all' = isSuperAdmin
    ? 'all'
    : isAmAdmin
    ? 'am-distributors'
    : 'nexalus-innovations';

  // Permission enforcement
  const canManageBrand = (brandId: BrandId | 'general' | 'nexalus' | 'nexalus-innovations' | 'am-distributors'): boolean => {
    if (!currentUser) return false;
    if (isSuperAdmin) return true;
    if (isInnovationsAdmin) {
      return (
        brandId === 'nexalus-innovations' ||
        brandId === 'cp-plus' ||
        brandId === 'one-broadband' ||
        brandId === 'itti-networking' ||
        brandId === 'nexalus'
      );
    }
    if (isAmAdmin) {
      return brandId === 'am-distributors';
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        quickLogin,
        logout,
        canManageBrand,
        brandScope,
        isSuperAdmin,
        isInnovationsAdmin,
        isAmAdmin,
        isCpPlusAdmin,
        isOneBroadbandAdmin,
        isNetworkingAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
