import { useMemo } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { isNip05Verified } from '@/lib/nip05';

export function useCanPost() {
  const currentUser = useCurrentUser();

  const canPost = useMemo(() => {
    if (!currentUser.user) {
      return false;
    }

    // Check if user has verified NIP-05
    return isNip05Verified(currentUser);
  }, [currentUser]);

  return {
    canPost,
    user: currentUser.user,
    metadata: currentUser,
    isLoggedIn: !!currentUser.user,
  };
}