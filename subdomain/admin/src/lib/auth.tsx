'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getUserProfile, loginUser, updateUserProfile } from '@/app/actions/auth';

export type UserRole = 'user' | 'manager' | 'admin' | 'super_admin';

interface UserProfile {
  _id: string;
  uid?: string; // For backward compatibility
  email: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
  permissions?: {
    dashboard: boolean;
    analytics: boolean;
    store: boolean;
    products: boolean;
    media: boolean;
    inbox: boolean;
    blogs: boolean;
    marketing: boolean;
    pinterest: boolean;
    settings: boolean;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loginRequired: boolean;
  loginGateLoading: boolean;
  sessionTimeRemaining: number;
  extendSession: (seconds?: number) => void;
  setSessionExpiryTime: (expireTimeMs: number) => void;
  signIn: (email?: string, password?: string) => Promise<{ user?: UserProfile; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
  toggleLoginGate: (password?: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local bypass for development if needed
const BYPASS_AUTH = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';
const MOCK_ADMIN: UserProfile = {
  _id: 'dev-admin',
  uid: 'dev-admin',
  email: 'admin@fashcon.dev',
  role: 'super_admin',
  displayName: 'Dev Administrator',
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 4000): Promise<T | null> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

/**
 * Sets the HttpOnly session cookie via the server API route.
 * This is what the middleware checks on every navigation.
 */
async function setServerSession(email: string, role: string, expireTime?: number): Promise<{ success: boolean; expireTime?: number; remainingSeconds?: number } | null> {
  try {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, expireTime, clientTime: Date.now() }),
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to set server session:', e);
    return null;
  }
}

/**
 * Clears the HttpOnly session cookie via the server API route.
 */
async function clearServerSession(): Promise<void> {
  try {
    await fetch('/api/auth/session', { method: 'DELETE' });
  } catch (e) {
    console.error('Failed to clear server session:', e);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(true);
  const [loginGateLoading, setLoginGateLoading] = useState(true);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(600); // 10 minutes countdown

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('fashcon_admin_user');
      localStorage.removeItem('fashcon_session_expire');
      await clearServerSession();
      setUser(null);
      setProfile(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  // Function to extend session (default adds 5 minutes = 300s, negative reduces)
  const extendSession = useCallback((seconds = 300) => {
    const expireStr = localStorage.getItem('fashcon_session_expire');
    let currentExpire = expireStr ? parseInt(expireStr, 10) : Date.now();
    if (currentExpire < Date.now()) {
      currentExpire = Date.now();
    }
    const newExpire = currentExpire + (seconds * 1000);
    localStorage.setItem('fashcon_session_expire', newExpire.toString());
    
    const remaining = Math.max(0, Math.ceil((newExpire - Date.now()) / 1000));
    setSessionTimeRemaining(remaining);

    if (seconds > 0) {
      toast.success(`Session extended by ${Math.round(seconds / 60)} minutes`, { id: 'session-extend' });
    } else {
      const absSeconds = Math.abs(seconds);
      const reducedText = absSeconds >= 60 ? `${Math.round(absSeconds / 60)} minute(s)` : `${absSeconds} seconds`;
      toast.success(`Session reduced by ${reducedText}`, { id: 'session-reduce' });
    }

    if (remaining <= 0) {
      logout();
      toast.error('Session expired.', { id: 'session-timeout' });
    } else if (user) {
      setServerSession(user.email, user.role, newExpire);
    }
  }, [logout, user]);

  // Function to set session to terminate at a specific absolute timestamp
  const setSessionExpiryTime = useCallback((expireTimeMs: number) => {
    localStorage.setItem('fashcon_session_expire', expireTimeMs.toString());
    const remaining = Math.max(0, Math.ceil((expireTimeMs - Date.now()) / 1000));
    setSessionTimeRemaining(remaining);
    toast.success(`Session target expiration updated`, { id: 'session-set-target' });
    
    if (remaining <= 0) {
      logout();
      toast.error('Session expired.', { id: 'session-timeout' });
    } else if (user) {
      setServerSession(user.email, user.role, expireTimeMs);
    }
  }, [logout, user]);

  // Background timer interval to decrement session time when user is logged in
  useEffect(() => {
    if (!user) {
      return;
    }

    // Initial check on mount/user change
    const expireStr = localStorage.getItem('fashcon_session_expire');
    if (expireStr) {
      const expireTime = parseInt(expireStr, 10);
      const remaining = Math.max(0, Math.ceil((expireTime - Date.now()) / 1000));
      setSessionTimeRemaining(remaining);
      if (remaining <= 0) {
        logout();
        return;
      }
    } else {
      const newExpire = Date.now() + 600000;
      localStorage.setItem('fashcon_session_expire', newExpire.toString());
      setSessionTimeRemaining(600);
      if (user) {
        setServerSession(user.email, user.role, newExpire);
      }
    }

    const interval = setInterval(() => {
      const expireStrCurrent = localStorage.getItem('fashcon_session_expire');
      if (expireStrCurrent) {
        const expireTime = parseInt(expireStrCurrent, 10);
        const remaining = Math.max(0, Math.ceil((expireTime - Date.now()) / 1000));
        setSessionTimeRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          logout();
          toast.error('Session expired automatically for security.', { id: 'session-timeout' });
        }
      } else {
        const newExpire = Date.now() + 600000;
        localStorage.setItem('fashcon_session_expire', newExpire.toString());
        setSessionTimeRemaining(600);
        if (user) {
          setServerSession(user.email, user.role, newExpire);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, logout]);

  // Fetch login gate status
  useEffect(() => {
    const fetchLoginGate = async () => {
      try {
        const res = await fetch('/api/auth/login-gate');
        const data = await res.json();
        setLoginRequired(data.loginRequired ?? true);
      } catch {
        setLoginRequired(true); // Default to requiring login on error
      } finally {
        setLoginGateLoading(false);
      }
    };
    fetchLoginGate();
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (BYPASS_AUTH) {
        setProfile(MOCK_ADMIN);
        setUser(MOCK_ADMIN);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        
        if (data.success && data.authenticated) {
          // Sync client-side session expire with server cookie, correcting for clock skew
          const remaining = data.remainingSeconds ?? Math.max(0, Math.ceil((data.expireTime - Date.now()) / 1000));
          const localExpire = Date.now() + remaining * 1000;
          localStorage.setItem('fashcon_session_expire', localExpire.toString());
          setSessionTimeRemaining(remaining);

          // Restore user profile (check localStorage cache, otherwise fallback)
          const storedUser = localStorage.getItem('fashcon_admin_user');
          let cachedUser: UserProfile | null = null;
          if (storedUser) {
            try {
              cachedUser = JSON.parse(storedUser);
            } catch (e) {
              console.error('Failed to parse cached user:', e);
            }
          }

          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
          const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

          if (data.email === adminEmail || data.email === superAdminEmail) {
            // Static Admin Role
            const staticUser: UserProfile = {
              _id: data.role === 'super_admin' ? 'local-super-admin' : 'local-admin',
              uid: data.role === 'super_admin' ? 'local-super-admin' : 'local-admin',
              email: data.email,
              role: data.role,
              displayName: data.role === 'super_admin' ? 'System Super Admin' : 'System Admin',
            };

            // Attempt to get fresh profile for details like photoURL
            try {
              const freshProfile = await getUserProfile(data.email);
              if (freshProfile) {
                const merged = { ...staticUser, ...freshProfile, role: data.role };
                setUser(merged);
                setProfile(merged);
                localStorage.setItem('fashcon_admin_user', JSON.stringify(merged));
                setLoading(false);
                return;
              }
            } catch (e) {
              console.warn('Could not retrieve DB settings for static admin profile:', e);
            }

            const finalUser = cachedUser && cachedUser.email === data.email ? cachedUser : staticUser;
            setUser(finalUser);
            setProfile(finalUser);
            localStorage.setItem('fashcon_admin_user', JSON.stringify(finalUser));
          } else {
            // MongoDB User Role
            try {
              const freshProfile = await getUserProfile(data.email);
              if (freshProfile) {
                const merged = { ...freshProfile, role: data.role };
                setUser(merged);
                setProfile(merged);
                localStorage.setItem('fashcon_admin_user', JSON.stringify(merged));
              } else {
                // If profile not found, fall back to cached or basic session details
                const fallbackUser = cachedUser && cachedUser.email === data.email ? cachedUser : {
                  _id: 'restored-session',
                  uid: 'restored-session',
                  email: data.email,
                  role: data.role,
                  displayName: data.email.split('@')[0],
                };
                setUser(fallbackUser);
                setProfile(fallbackUser);
                localStorage.setItem('fashcon_admin_user', JSON.stringify(fallbackUser));
              }
            } catch (e) {
              console.error('Failed to contact database for auth validation, falling back to cached profile:', e);
              const fallbackUser = cachedUser && cachedUser.email === data.email ? cachedUser : {
                _id: 'restored-session',
                uid: 'restored-session',
                email: data.email,
                role: data.role,
                displayName: data.email.split('@')[0],
              };
              setUser(fallbackUser);
              setProfile(fallbackUser);
              localStorage.setItem('fashcon_admin_user', JSON.stringify(fallbackUser));
            }
          }
        } else {
          // Server session is missing or expired -> clear all client data
          localStorage.removeItem('fashcon_admin_user');
          localStorage.removeItem('fashcon_session_expire');
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Failed to init authentication:', err);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email?: string, password?: string) => {
    try {
      if (!email) {
        return { error: 'Email is required' };
      }

      const mongoUser = await loginUser(email, password);
      if (mongoUser) {
        if (mongoUser.error) {
          return { error: mongoUser.error };
        }
        const sessionRes = await setServerSession(mongoUser.email, mongoUser.role);
        const remaining = sessionRes?.remainingSeconds ?? 600;
        const localExpire = Date.now() + remaining * 1000;

        setUser(mongoUser);
        setProfile(mongoUser);
        localStorage.setItem('fashcon_admin_user', JSON.stringify(mongoUser));
        localStorage.setItem('fashcon_session_expire', localExpire.toString());
        setSessionTimeRemaining(remaining);
        setLoading(false);
        return { user: mongoUser };
      }

      return { error: 'Invalid credentials or user not found' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: 'Failed to sign in' };
    }
  };


 
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user?.email) return null;
    try {
      const updated = await updateUserProfile(user.email, data);
      if (updated) {
        setUser(updated);
        setProfile(updated);
        localStorage.setItem('fashcon_admin_user', JSON.stringify(updated));
        return updated;
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    }
    return null;
  };

  const toggleLoginGate = useCallback(async (password?: string): Promise<{ success: boolean; error?: string }> => {
    const newValue = !loginRequired;

    try {
      const res = await fetch('/api/auth/login-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginRequired: newValue,
          ...(password ? { gatePassword: password } : {}),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || 'Failed to update login gate' };
      }
      setLoginRequired(newValue);
      toast.success(newValue ? 'Login gate enabled' : 'Login gate disabled');
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, [loginRequired]);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin',
    isSuperAdmin: profile?.role === 'super_admin',
    loginRequired,
    loginGateLoading,
    sessionTimeRemaining,
    extendSession,
    setSessionExpiryTime,
    signIn,
    logout,
    updateProfile,
    toggleLoginGate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
