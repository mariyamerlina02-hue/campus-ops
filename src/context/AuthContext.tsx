'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '@/types';
import { DEMO_USERS, loginWithFirebaseOrDemo, registerUser } from '@/lib/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  register: (data: Partial<UserProfile> & { password?: string }) => Promise<UserProfile>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'campusops_auth_profile_v1';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to student demo user for instant test experience
        setUser(DEMO_USERS.student);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(DEMO_USERS.student));
      }
    } catch {
      setUser(DEMO_USERS.student);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await loginWithFirebaseOrDemo(email, pass);
      setUser(profile);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
      toast.success(`Welcome back, ${profile.displayName}!`);
      return profile;
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: Partial<UserProfile> & { password?: string }): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await registerUser(data);
      setUser(profile);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
      toast.success(`Account created successfully as ${profile.displayName}`);
      return profile;
    } catch (err: any) {
      toast.error('Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    toast.success('Logged out successfully');
  };

  const switchRole = (role: UserRole) => {
    const demoProfile = DEMO_USERS[role];
    setUser(demoProfile);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoProfile));
    toast.success(`Switched active view to ${demoProfile.displayName} (${demoProfile.role.toUpperCase()})`);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole }}>
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
