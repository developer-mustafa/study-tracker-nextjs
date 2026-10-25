import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, StudyLevel, Tenant } from '../types';
import { FocusStudyStore, useFocusStudyData } from '../lib/storage/store';
import {
  signInWithGoogle as firebaseGoogleSignIn,
  signOutFirebase,
  subscribeToAuthChanges,
  isFirebaseConfigured,
} from '../lib/firebase/client';

interface AuthContextType {
  user: UserProfile;
  isPlatformAdmin: boolean;
  isBlocked: boolean;
  activeTenant: Tenant;
  tenants: Tenant[];
  isFirebaseActive: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchUser: (uid: string) => void;
  switchTenant: (tenantId: string) => void;
  createTenant: (data: { name: string; type: 'academy' | 'coaching' | 'study_group' | 'institution' | 'personal'; description?: string }) => Tenant;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: (data: {
    displayName: string;
    studyLevel: StudyLevel;
    primaryGoal: string;
    dailyGoalMinutes: number;
  }) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, tenants, activeTenant } = useFocusStudyData();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isPlatformAdmin =
    user.email === 'mustafa.rahman.official@gmail.com' ||
    user.email === 'mustafarahman792@gmail.com' ||
    user.role === 'platform_admin';

  const isBlocked = Boolean(user.isBlocked);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = subscribeToAuthChanges((fbUser) => {
      if (fbUser) {
        const currentUser = FocusStudyStore.getUser();
        const isAdminEmail =
          fbUser.email === 'mustafa.rahman.official@gmail.com' ||
          fbUser.email === 'mustafarahman792@gmail.com';
        const updated: UserProfile = {
          ...currentUser,
          uid: fbUser.uid,
          email: fbUser.email || currentUser.email,
          displayName: fbUser.displayName || currentUser.displayName,
          photoURL: fbUser.photoURL || currentUser.photoURL,
          role: isAdminEmail ? 'platform_admin' : currentUser.role,
          updatedAt: new Date().toISOString(),
        };
        FocusStudyStore.setUser(updated);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (isFirebaseConfigured) {
        await firebaseGoogleSignIn();
      } else {
        // Fallback demo simulation
        const currentUser = FocusStudyStore.getUser();
        FocusStudyStore.setUser({
          ...currentUser,
          displayName: 'মুস্তাফা রহমান (প্ল্যাটফর্ম অ্যাডমিন)',
          email: 'mustafa.rahman.official@gmail.com',
          role: 'platform_admin',
          updatedAt: new Date().toISOString(),
        });
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      console.error('Google Sign in error:', err);
      throw err;
    }
  };

  const signOut = async () => {
    if (isFirebaseConfigured) {
      await signOutFirebase();
    }
    const currentUser = FocusStudyStore.getUser();
    FocusStudyStore.setUser({
      ...currentUser,
      uid: `guest_${Date.now()}`,
      displayName: 'অতিথি শিক্ষার্থী',
      email: 'guest@focusstudy.app',
      role: 'student',
      isBlocked: false,
      updatedAt: new Date().toISOString(),
    });
  };

  const switchUser = (uid: string) => {
    FocusStudyStore.switchActiveUser(uid);
  };

  const switchTenant = (tenantId: string) => {
    FocusStudyStore.setActiveTenantId(tenantId);
  };

  const createTenant = (data: {
    name: string;
    type: 'academy' | 'coaching' | 'study_group' | 'institution' | 'personal';
    description?: string;
  }) => {
    return FocusStudyStore.createTenant(data);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    const currentUser = FocusStudyStore.getUser();
    FocusStudyStore.setUser({
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const completeOnboarding = (data: {
    displayName: string;
    studyLevel: StudyLevel;
    primaryGoal: string;
    dailyGoalMinutes: number;
  }) => {
    const currentUser = FocusStudyStore.getUser();
    FocusStudyStore.setUser({
      ...currentUser,
      displayName: data.displayName,
      studyLevel: data.studyLevel,
      primaryGoal: data.primaryGoal,
      dailyGoalMinutes: data.dailyGoalMinutes,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    });
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isPlatformAdmin,
        isBlocked,
        activeTenant,
        tenants,
        isFirebaseActive: isFirebaseConfigured,
        signInWithGoogle,
        signOut,
        switchUser,
        switchTenant,
        createTenant,
        updateProfile,
        completeOnboarding,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isAuthModalOpen,
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
