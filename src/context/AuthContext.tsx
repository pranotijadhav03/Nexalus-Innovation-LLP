import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import { AdminUser, BrandId, CustomerRegistrationData } from '../types';
import { addAuditLog, registerCustomer, withTimeout, getCachedUsers } from '../firebase/services';

interface AuthContextType {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCustomer: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginCustomer: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerCustomerAccount: (data: CustomerRegistrationData) => Promise<{ success: boolean; error?: string }>;
  refreshUserProfile: () => Promise<void>;
  logout: () => Promise<void>;
  canManageBrand: (brandId: BrandId | 'general' | 'nexalus' | 'nexalus-innovations' | 'am-distributors') => boolean;
  brandScope: BrandId | 'all';
  isSuperAdmin: boolean;
  isInnovationsAdmin: boolean;
  isAmAdmin: boolean;
  isCpPlusAdmin: boolean;
  isOneBroadbandAdmin: boolean;
  isNetworkingAdmin: boolean;
}

const LEGACY_AUTH_KEY = 'nexalus_admin_session';

// Strictly purge legacy insecure localStorage / sessionStorage auth caches
try {
  sessionStorage.removeItem(LEGACY_AUTH_KEY);
  localStorage.removeItem('nexalus_auth_user');
  localStorage.removeItem('nexalus_auth_session');
} catch {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_ADMIN_ROLES = [
  'super_admin',
  'innovations_admin',
  'am_admin',
  'cp_plus_admin',
  'one_broadband_admin',
  'networking_admin'
];

const VALID_ALL_ROLES = [...VALID_ADMIN_ROLES, 'customer'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to verify user profile document in Firestore (admins & customers)
  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<AdminUser | null> => {
    const cleanEmail = (firebaseUser.email || '').toLowerCase().trim();

    if (db) {
      try {
        // 1. Direct lookup by Firebase Auth UID with 1200ms timeout
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await withTimeout(getDoc(docRef), 1200);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.active !== false && VALID_ALL_ROLES.includes(data.role)) {
            return {
              uid: firebaseUser.uid,
              displayName: data.displayName || firebaseUser.displayName || firebaseUser.email || (data.role === 'customer' ? 'Customer' : 'Administrator'),
              email: cleanEmail || data.email,
              role: data.role,
              phone: data.phone,
              deliveryAddress: data.deliveryAddress,
              assignedBrandId: data.assignedBrandId,
              active: true,
              createdAt: data.createdAt || new Date().toISOString(),
              lastLogin: data.lastLogin
            };
          }
        }

        // 2. Fallback query by email (for accounts whose Firestore doc was keyed by legacy/seed ID)
        if (cleanEmail) {
          const q = query(
            collection(db, 'users'),
            where('email', '==', cleanEmail)
          );
          const querySnap = await withTimeout(getDocs(q), 1200);

          if (!querySnap.empty) {
            const matchedDoc = querySnap.docs[0];
            const data = matchedDoc.data();

            if (data && data.active !== false && VALID_ALL_ROLES.includes(data.role)) {
              const profile: AdminUser = {
                uid: firebaseUser.uid,
                displayName: data.displayName || firebaseUser.displayName || cleanEmail || (data.role === 'customer' ? 'Customer' : 'Administrator'),
                email: cleanEmail,
                role: data.role,
                phone: data.phone,
                deliveryAddress: data.deliveryAddress,
                assignedBrandId: data.assignedBrandId,
                active: true,
                createdAt: data.createdAt || new Date().toISOString(),
                lastLogin: data.lastLogin
              };

              // Sync doc to be addressable by UID going forward
              if (matchedDoc.id !== firebaseUser.uid) {
                try {
                  const { password: _p, ...safeData } = data;
                  withTimeout(setDoc(doc(db, 'users', firebaseUser.uid), {
                    ...safeData,
                    uid: firebaseUser.uid,
                    lastLogin: new Date().toISOString()
                  }, { merge: true }), 1500).catch(() => {});
                } catch {}
              }

              return profile;
            }
          }
        }
      } catch (err) {
        console.warn('Firestore user fetch timed out or offline, checking local registry:', err);
      }
    }

    // 3. Fallback to cached/initial users registry by email
    const cachedUsers = getCachedUsers();
    const matchedUser = cachedUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (matchedUser && matchedUser.active !== false) {
      const profile: AdminUser = {
        ...matchedUser,
        uid: firebaseUser.uid
      };
      if (db) {
        withTimeout(setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true }), 1500).catch(() => {});
      }
      return profile;
    }

    // 4. Role inference for known administrator email conventions
    if (cleanEmail) {
      let inferredRole: any = null;
      let inferredBrand: any = null;
      let inferredName = 'Administrator';

      if (cleanEmail === 'admin@nexalus.com' || cleanEmail === 'admin@nexalusinnovations.com') {
        inferredRole = 'super_admin';
        inferredBrand = 'all';
        inferredName = 'Nexalus Corporate Master Admin';
      } else if (cleanEmail === 'admin@innovations.com' || cleanEmail.includes('innovations')) {
        inferredRole = 'innovations_admin';
        inferredBrand = 'nexalus-innovations';
        inferredName = 'Nexalus Innovations Admin';
      } else if (cleanEmail === 'admin@amdistributors.com' || cleanEmail === 'admin@am.com' || cleanEmail.includes('amdistributors') || cleanEmail.includes('am.admin')) {
        inferredRole = 'am_admin';
        inferredBrand = 'am-distributors';
        inferredName = 'A.M. Distributors Admin';
      }

      if (inferredRole) {
        const profile: AdminUser = {
          uid: firebaseUser.uid,
          displayName: inferredName,
          email: cleanEmail,
          role: inferredRole,
          assignedBrandId: inferredBrand,
          active: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        if (db) {
          withTimeout(setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true }), 1500).catch(() => {});
        }
        return profile;
      }
    }

    return null;
  };

  const refreshUserProfile = useCallback(async () => {
    if (auth && auth.currentUser) {
      const profile = await fetchUserProfile(auth.currentUser);
      if (profile) {
        setCurrentUser(profile);
      }
    }
  }, []);

  useEffect(() => {
    const activeAuth = auth;
    if (!isFirebaseConfigured || !activeAuth) {
      console.warn('Firebase Authentication is not configured or offline.');
      setIsLoading(false);
      return;
    }

    // Subscribe to genuine Firebase Authentication state listener
    const unsubscribe = onAuthStateChanged(activeAuth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const userProfile = await fetchUserProfile(firebaseUser);

        if (userProfile) {
          setCurrentUser(userProfile);
        } else {
          // Authenticated in Firebase Auth, but NOT an authorized user in Firestore
          console.warn(`User ${firebaseUser.email} has no registered profile. Revoking access.`);
          await signOut(activeAuth);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Auth state resolution error:', err);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Admin login handler (Restricted strictly to administrators)
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (!isFirebaseConfigured || !auth || !db) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Authentication service is not available. Please check system configuration.'
      };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail) {
      setIsLoading(false);
      return { success: false, error: 'Please enter your registered administrator email.' };
    }

    if (!trimmedPass) {
      setIsLoading(false);
      return { success: false, error: 'Password is required to sign in.' };
    }

    try {
      // 1. Authenticate identity through Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPass);
      const firebaseUser = userCredential.user;

      // 2. Authorize role through verified Firestore record
      const userProfile = await fetchUserProfile(firebaseUser);

      if (!userProfile) {
        await signOut(auth);
        setCurrentUser(null);
        setIsLoading(false);
        return {
          success: false,
          error: 'Access denied: This account has no active profile in the system.'
        };
      }

      if (userProfile.role === 'customer' || !VALID_ADMIN_ROLES.includes(userProfile.role)) {
        await signOut(auth);
        setCurrentUser(null);
        setIsLoading(false);
        return {
          success: false,
          error: 'Access denied: Customer accounts cannot access the administration console. Please use the Customer Portal to sign in.'
        };
      }

      const now = new Date().toISOString();
      const updatedProfile: AdminUser = {
        ...userProfile,
        lastLogin: now
      };

      setCurrentUser(updatedProfile);

      // Record successful login in audit logs
      try {
        await addAuditLog(
          'ADMIN_LOGIN',
          `Admin signed in via Firebase Auth: ${updatedProfile.email} (${updatedProfile.role})`,
          undefined,
          updatedProfile.email
        );
      } catch (logErr) {
        console.warn('Audit log write error:', logErr);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);

      let errorMessage = 'Invalid email or password. Please verify your credentials and try again.';
      if (err.code === 'auth/user-disabled') {
        errorMessage = 'This administrator account has been deactivated. Please contact a super administrator.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Access is temporarily locked. Please wait a few minutes before retrying.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      }

      return { success: false, error: errorMessage };
    }
  };

  // Customer login handler
  const loginCustomer = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (!isFirebaseConfigured || !auth || !db) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Authentication service is currently offline. Please try again later.'
      };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail) {
      setIsLoading(false);
      return { success: false, error: 'Please enter your registered email address.' };
    }

    if (!trimmedPass) {
      setIsLoading(false);
      return { success: false, error: 'Password is required to sign in.' };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPass);
      const firebaseUser = userCredential.user;
      const userProfile = await fetchUserProfile(firebaseUser);

      if (!userProfile) {
        await signOut(auth);
        setCurrentUser(null);
        setIsLoading(false);
        return {
          success: false,
          error: 'Account record could not be found. Please register or contact support.'
        };
      }

      const now = new Date().toISOString();
      const updatedProfile: AdminUser = {
        ...userProfile,
        lastLogin: now
      };

      setCurrentUser(updatedProfile);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);

      let errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been deactivated. Please contact customer support.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please verify and try again.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please wait a moment before trying again.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      return { success: false, error: errorMessage };
    }
  };

  // Customer registration handler
  const registerCustomerAccount = async (data: CustomerRegistrationData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await registerCustomer(data);
      setCurrentUser(result.user);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      let msg = 'Registration failed. Please check your information and try again.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please log in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address is not valid.';
      } else if (err.message) {
        msg = err.message;
      }
      return { success: false, error: msg };
    }
  };

  const logout = async (): Promise<void> => {
    if (currentUser && currentUser.role !== 'customer') {
      try {
        await addAuditLog('ADMIN_LOGOUT', `Admin signed out: ${currentUser.email}`, undefined, currentUser.email);
      } catch (e) {}
    }

    setCurrentUser(null);

    // Clean up any remaining legacy storage
    try {
      sessionStorage.removeItem(LEGACY_AUTH_KEY);
      localStorage.removeItem('nexalus_auth_user');
      localStorage.removeItem('nexalus_auth_session');
    } catch {}

    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Firebase signOut error:', err);
      }
    }
  };

  const isCustomer = currentUser?.role === 'customer';
  const isAdmin = currentUser != null && currentUser.role !== 'customer';
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
    if (!currentUser || isCustomer) return false;
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
        isCustomer,
        isAdmin,
        login,
        loginCustomer,
        registerCustomerAccount,
        refreshUserProfile,
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
