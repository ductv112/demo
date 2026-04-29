'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getMyProfile } from '@/lib/profile-api';

interface ProfileContextValue {
  avatarUrl: string | null;
  fullName: string | null;
  setAvatarUrl: (url: string | null) => void;
  setFullName: (name: string | null) => void;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getMyProfile();
      setAvatarUrl(profile.avatarUrl);
      setFullName(profile.fullName);
    } catch {
      // Silently fail — sidebar avatar is non-critical
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <ProfileContext.Provider value={{ avatarUrl, fullName, setAvatarUrl, setFullName, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfileContext must be used within ProfileProvider');
  return ctx;
}
