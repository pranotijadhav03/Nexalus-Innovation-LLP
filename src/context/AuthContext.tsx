import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, BrandId } from '../types';
import { getUsers, addAuditLog } from '../firebase/services';

interface AuthContextType {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

// Strictly purge any legacy persistent localStorage auth cache so dashboard never opens directly
try {
  localStorage.removeItem('nexalus_auth_user');
  localStorage.removeItem('nexalus_auth_session');
} catch (e) {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only check active tab session in sessionStorage (no persistent cross-session auto-login)
    async function verifySavedSession() {
      try {
        const saved = sessionStorage.getItem(AUTH_USER_KEY);
        if (saved) {
          const parsed: AdminUser = JSON.parse(saved);
          if (parsed && parsed.email) {
            const users = await getUsers();
            const matched = users.find(u => u.email.toLowerCase() === parsed.email.toLowerCase());
            if (matched && matched.active) {
              setCurrentUser({ ...matched, lastLogin: parsed.lastLogin });
            } else {
              sessionStorage.removeItem(AUTH_USER_KEY);
              setCurrentUser(null);
            }
          }
        }
      } catch (e) {
        console.error('Failed reading session state:', e);
        sessionStorage.removeItem(AUTH_USER_KEY);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    verifySavedSession();
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
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(userWithUpdatedLogin));
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

  const logout = () => {
    if (currentUser) {
      addAuditLog('ADMIN_LOGOUT', `Admin signed out: ${currentUser.email}`, undefined, currentUser.email);
    }
    setCurrentUser(null);
    sessionStorage.removeItem(AUTH_USER_KEY);
    try {
      localStorage.removeItem('nexalus_auth_user');
      localStorage.removeItem('nexalus_auth_session');
    } catch (e) {}
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
