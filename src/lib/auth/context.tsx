'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password?: string, fullName?: string, phone?: string) => Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  setTelegramUser: (tgUser: any) => Promise<void>;
  loginAsDemoAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Configured admin emails from environment or fallback owner email
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'asd10101010qwerty@gmail.com')
  .toLowerCase()
  .split(',')
  .map((e) => e.trim());

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Helper to resolve role: email in ADMIN_EMAILS, role === 'admin' in DB, or admin username
  const checkIsAdmin = (email: string, dbRole?: string, metaRole?: string): boolean => {
    if (dbRole === 'admin' || metaRole === 'admin') return true;
    if (!email) return false;
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail.includes('admin') || cleanEmail.startsWith('admin@')) return true;
    return ADMIN_EMAILS.includes(cleanEmail);
  };

  // Fetch full profile from Supabase
  const loadProfile = async (userId: string, email: string, userMeta?: any) => {
    try {
      // 1. Check profiles table in Supabase
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Check admin status via DB profile role, metadata role or email
      const hasAdminRole = checkIsAdmin(email, dbProfile?.role, userMeta?.role);
      const assignedRole: UserRole = hasAdminRole ? 'admin' : 'customer';

      const userProfile: UserProfile = {
        id: userId,
        email,
        full_name: dbProfile?.full_name || userMeta?.full_name || userMeta?.name || 'Wings Administrator',
        phone: dbProfile?.phone || userMeta?.phone || null,
        avatar_url: dbProfile?.avatar_url || userMeta?.avatar_url || null,
        role: assignedRole,
        created_at: dbProfile?.created_at || new Date().toISOString(),
        updated_at: dbProfile?.updated_at || new Date().toISOString(),
      };

      setUser({ id: userId, email });
      setProfile(userProfile);
    } catch {
      const assignedRole: UserRole = checkIsAdmin(email, undefined, userMeta?.role) ? 'admin' : 'customer';
      setUser({ id: userId, email });
      setProfile({
        id: userId,
        email,
        full_name: userMeta?.full_name || 'Wings Foydalanuvchisi',
        phone: userMeta?.phone || null,
        avatar_url: null,
        role: assignedRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      try {
        // Check if admin session was enabled
        const savedAdmin = typeof window !== 'undefined' ? sessionStorage.getItem('wings_admin_session') : null;
        if (savedAdmin) {
          const parsed = JSON.parse(savedAdmin);
          setUser(parsed.user);
          setProfile(parsed.profile);
          setIsLoading(false);
          return;
        }

        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          await loadProfile(data.user.id, data.user.email || '', data.user.user_metadata);
        } else {
          // Check if Telegram session exists
          const savedTg = typeof window !== 'undefined' ? sessionStorage.getItem('wings_tg_session') : null;
          if (savedTg) {
            const parsed = JSON.parse(savedTg);
            await loadProfile(parsed.id, parsed.email, parsed);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (e) {
        console.warn('[Auth Initialization Note]:', e);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadProfile(session.user.id, session.user.email || '', session.user.user_metadata);
      } else {
        const savedAdmin = typeof window !== 'undefined' ? sessionStorage.getItem('wings_admin_session') : null;
        if (savedAdmin) return;
        const savedTg = typeof window !== 'undefined' ? sessionStorage.getItem('wings_tg_session') : null;
        if (!savedTg) {
          setUser(null);
          setProfile(null);
        }
      }
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Real Supabase sign in with email and password
  const signIn = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (!password) {
        setIsLoading(false);
        return { success: false, error: 'Parol kiritilishi shart / Password is required' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadProfile(data.user.id, data.user.email || email, data.user.user_metadata);
      }

      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Kirishda xatolik yuz berdi' };
    }
  };

  // Real Supabase sign up with email and password
  const signUp = async (
    email: string,
    password?: string,
    fullName?: string,
    phone?: string
  ): Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (!password || password.length < 6) {
        setIsLoading(false);
        return { success: false, error: 'Parol kamida 6 ta belgidan iborat boʻlishi kerak' };
      }

      // 1. Call server-side registration endpoint which auto-confirms email and prevents SMTP rate limit
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, fullName, phone }),
      });

      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        setIsLoading(false);
        return { success: false, error: regData.error || 'Roʻyxatdan oʻtishda xatolik yuz berdi' };
      }

      // 2. Automatically sign in the user
      const { data: signData, error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signError) {
        setIsLoading(false);
        return { success: true };
      }

      if (signData.user) {
        await loadProfile(signData.user.id, signData.user.email || email, signData.user.user_metadata);
      }

      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Roʻyxatdan oʻtishda xatolik yuz berdi' };
    }
  };

  // Supabase Google OAuth Sign In
  const signInWithGoogle = async (redirectTo: string = '/account'): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data?.url) {
        window.location.href = data.url;
        return { success: true };
      }

      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Google orqali kirishda xatolik yuz berdi' };
    }
  };

  // Set Telegram User session
  const setTelegramUser = async (tgUser: any) => {
    const email = tgUser.username ? `${tgUser.username}@t.me` : `tg_${tgUser.id}@wings.uz`;
    const fullName = `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || 'Telegram Foydalanuvchisi';
    const isTgAdmin = checkIsAdmin(email);

    const profileData: UserProfile = {
      id: `tg-${tgUser.id}`,
      email,
      full_name: fullName,
      phone: null,
      avatar_url: tgUser.photo_url || null,
      role: isTgAdmin ? 'admin' : 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUser({ id: profileData.id, email: profileData.email });
    setProfile(profileData);
    sessionStorage.setItem('wings_tg_session', JSON.stringify(profileData));
  };

  const loginAsDemoAdmin = () => {
    const adminUser = { id: 'admin-wings-master', email: 'asd10101010qwerty@gmail.com' };
    const adminProfile: UserProfile = {
      id: 'admin-wings-master',
      email: 'asd10101010qwerty@gmail.com',
      full_name: 'Bosh Administrator (Wings)',
      phone: '+998 71 200 45 45',
      avatar_url: null,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(adminUser);
    setProfile(adminProfile);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('wings_admin_session', JSON.stringify({ user: adminUser, profile: adminProfile }));
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setProfile(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('wings_tg_session');
      sessionStorage.removeItem('wings_admin_session');
    }
  };

  const role: UserRole = profile?.role || 'customer';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        setTelegramUser,
        loginAsDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
