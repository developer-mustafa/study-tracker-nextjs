import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, StudyLevel } from '../types';
import { FocusStudyStore, useFocusStudyData } from '../lib/storage/store';
import {
  signInWithGoogle as firebaseGoogleSignIn,
  signOutFirebase,
  subscribeToAuthChanges,
  isFirebaseConfigured,
} from '../lib/firebase/client';

interface AuthContextType {
  user: UserProfile;
  isFirebaseActive: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
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
  const { user } = useFocusStudyData();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = subscribeToAuthChanges((fbUser) => {
      if (fbUser) {
        const currentUser = FocusStudyStore.getUser();
        const updated: UserProfile = {
          ...currentUser,
          uid: fbUser.uid,
          email: fbUser.email || currentUser.email,
          displayName: fbUser.displayName || currentUser.displayName,
          photoURL: fbUser.photoURL || currentUser.photoURL,
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
        // Instant simulated demo login for UI verification
        const currentUser = FocusStudyStore.getUser();
        FocusStudyStore.setUser({
          ...currentUser,
          displayName: 'মুস্তাফা রহমান (Google Verified)',
          email: 'mustafarahman792@gmail.com',
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
      updatedAt: new Date().toISOString(),
    });
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
        isFirebaseActive: isFirebaseConfigured,
        signInWithGoogle,
        signOut,
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
