'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getUserProfile, loginUser, updateUserProfile } from '@/app/actions/auth';

export type UserRole = 'user' | 'admin' | 'super_admin';

interface UserProfile {
  _id: string;
  uid?: string; // For backward compatibility
  email: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signIn: (email?: string, password?: string) => Promise<{ user?: UserProfile; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (BYPASS_AUTH) {
        setProfile(MOCK_ADMIN);
        setUser(MOCK_ADMIN);
        setLoading(false);
        return;
      }

      // Check session/localStorage for persisted user (simple implementation)
      const storedUser = localStorage.getItem('fashcon_admin_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // If stored user matches local env credentials, restore directly — no server action needed
          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
          const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
          if (parsedUser.email === adminEmail || parsedUser.email === superAdminEmail) {
            setUser(parsedUser);
            setProfile(parsedUser);
            setLoading(false);
            return;
          }

          // Only call server action for real MongoDB users
          const freshProfile = await withTimeout(getUserProfile(parsedUser.email));
          if (freshProfile) {
            setUser(freshProfile);
            setProfile(freshProfile);
          } else {
            localStorage.removeItem('fashcon_admin_user');
          }
        } catch (e) {
          // Server action unreachable or parse error — clear stale session
          localStorage.removeItem('fashcon_admin_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email?: string, password?: string) => {
    try {
      // Local development credentials check (prioritize environment variables)
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
      const superAdminPass = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD;

      if (email === superAdminEmail && password === superAdminPass) {
        const adminData: UserProfile = {
          _id: 'local-super-admin',
          uid: 'local-super-admin',
          email: superAdminEmail!,
          role: 'super_admin',
          displayName: 'System Super Admin',
        };
        setUser(adminData);
        setProfile(adminData);
        localStorage.setItem('fashcon_admin_user', JSON.stringify(adminData));
        setLoading(false);
        return { user: adminData };
      }

      if (email === adminEmail && password === adminPass) {
        const adminData: UserProfile = {
          _id: 'local-admin',
          uid: 'local-admin',
          email: adminEmail!,
          role: 'admin',
          displayName: 'System Admin',
        };
        setUser(adminData);
        setProfile(adminData);
        localStorage.setItem('fashcon_admin_user', JSON.stringify(adminData));
        setLoading(false);
        return { user: adminData };
      }

      // MongoDB Login
      if (email) {
        const mongoUser = await withTimeout(loginUser(email));
        if (mongoUser) {
          // In a real app, we would verify password here
          // For now, we allow login if user exists in MongoDB
          setUser(mongoUser);
          setProfile(mongoUser);
          localStorage.setItem('fashcon_admin_user', JSON.stringify(mongoUser));
          return { user: mongoUser };
        }
      }

      return { error: 'Invalid credentials or user not found' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: 'Failed to sign in' };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('fashcon_admin_user');
      setUser(null);
      setProfile(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
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

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin',
    isSuperAdmin: profile?.role === 'super_admin',
    signIn,
    logout,
    updateProfile,
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
