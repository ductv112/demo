import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/types/user';
import { getMyProfile } from '@/lib/profile-api';
import { useProfileContext } from '@/contexts/profile-context';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setAvatarUrl, setFullName } = useProfileContext();

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMyProfile();
      setProfile(data);
      // Sync to shared context so sidebar picks it up
      setAvatarUrl(data.avatarUrl);
      setFullName(data.fullName);
    } catch {
      // Error handled by caller
    } finally {
      setIsLoading(false);
    }
  }, [setAvatarUrl, setFullName]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  return { profile, isLoading, refetch: fetchProfile };
}
