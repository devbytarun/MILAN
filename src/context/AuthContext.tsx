import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Profile, UserRole, VerificationStatus } from '../types/index.ts';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

export interface DemoUser {
  email: string;
  role: UserRole;
  fullName: string;
  orgName?: string;
}

export const DEMO_USERS: Record<UserRole, DemoUser> = {
  FAMILY: {
    email: 'family@milan.demo',
    role: 'FAMILY',
    fullName: 'Anita Sharma',
    orgName: 'Independent Citizen',
  },
  NGO: {
    email: 'ngo@milan.demo',
    role: 'NGO',
    fullName: 'Rajesh Verma',
    orgName: 'Disaster Relief Alliance (NGO)',
  },
  ARMY_RESCUE: {
    email: 'army@milan.demo',
    role: 'ARMY_RESCUE',
    fullName: 'Major Vikram Rathore',
    orgName: 'NDRF Rescue Unit 8',
  },
  HOSPITAL: {
    email: 'hospital@milan.demo',
    role: 'HOSPITAL',
    fullName: 'Dr. Sunita Patel',
    orgName: 'Central Trauma Hospital',
  },
  REVIEWER: {
    email: 'reviewer@milan.demo',
    role: 'REVIEWER',
    fullName: 'Kavita Nair',
    orgName: 'Disaster Coordination Cell',
  },
  ADMIN: {
    email: 'admin@milan.demo',
    role: 'ADMIN',
    fullName: 'System Administrator',
    orgName: 'MILAN HQ Command',
  },
  VOLUNTEER: {
    email: 'volunteer@milan.demo',
    role: 'VOLUNTEER',
    fullName: 'Rohan Mehra',
    orgName: 'Community Volunteer Corps',
  },
};

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    organizationName?: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  switchDemoRole: (role: UserRole) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'milan_active_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!isSupabaseConfigured);

  // Initialize session
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('auth_user_id', session.user.id)
              .single();

            if (!error && data) {
              setProfile(data as Profile);
              setIsDemoMode(false);
              setLoading(false);
              return;
            }
          }
        } catch {
          // Fall back to demo mode if backend is unreachable
          setIsDemoMode(true);
        }
      }

      // Check localStorage for persisted demo profile
      const savedProfile = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
      setLoading(false);
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();
          if (data) {
            setProfile(data as Profile);
            setIsDemoMode(false);
          }
        } else {
          setProfile(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const switchDemoRole = (role: UserRole) => {
    const demo = DEMO_USERS[role];
    const demoProfile: Profile = {
      id: `demo-${role.toLowerCase()}-id`,
      auth_user_id: `auth-${role.toLowerCase()}-id`,
      full_name: demo.fullName,
      role: demo.role,
      organization_name: demo.orgName || null,
      organization_type: null,
      verification_status: 'APPROVED' as VerificationStatus,
      phone: '+91 98765 43210',
      created_at: new Date().toISOString(),
    };
    setProfile(demoProfile);
    setIsDemoMode(true);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoProfile));
  };

  const signIn = async (email: string, password?: string) => {
    setLoading(true);

    // Check if email matches a demo account
    const matchedRole = (Object.keys(DEMO_USERS) as UserRole[]).find(
      (r) => DEMO_USERS[r].email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchedRole || !isSupabaseConfigured) {
      switchDemoRole(matchedRole || 'FAMILY');
      setLoading(false);
      return { success: true };
    }

    if (!password) {
      setLoading(false);
      return { success: false, error: 'Password is required' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .single();

        if (profileError) {
          setLoading(false);
          return { success: false, error: 'Could not load user profile' };
        }

        setProfile(profileData as Profile);
        setIsDemoMode(false);
        setLoading(false);
        return { success: true };
      }
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : 'Unknown error during sign in';
      return { success: false, error: message };
    }

    setLoading(false);
    return { success: false, error: 'Authentication failed' };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    organizationName?: string,
    phone?: string
  ) => {
    setLoading(true);

    if (!isSupabaseConfigured) {
      const newProfile: Profile = {
        id: `mock-${Date.now()}`,
        auth_user_id: `auth-${Date.now()}`,
        full_name: fullName,
        role,
        organization_name: organizationName || null,
        organization_type: null,
        verification_status: (role === 'FAMILY' ? 'APPROVED' : 'PENDING') as VerificationStatus,
        phone: phone || null,
        created_at: new Date().toISOString(),
      };
      setProfile(newProfile);
      setIsDemoMode(true);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
      setLoading(false);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            organization_name: organizationName,
            phone,
          },
        },
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Trigger automatically creates profile in Supabase
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .single();

        if (profileData) {
          setProfile(profileData as Profile);
        }
        setIsDemoMode(false);
        setLoading(false);
        return { success: true };
      }
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : 'Unknown error during sign up';
      return { success: false, error: message };
    }

    setLoading(false);
    return { success: false, error: 'Sign up failed' };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && !isDemoMode) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        isDemoMode,
        signIn,
        signUp,
        switchDemoRole,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
