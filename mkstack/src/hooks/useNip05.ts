import { useQuery } from '@tanstack/react-query';
import { type NostrMetadata } from '@nostrify/nostrify';
import { verifyNip05, type Nip05Verification } from '@/lib/nip05';

export function useNip05Verification(metadata: NostrMetadata | undefined, pubkey: string | undefined) {
  return useQuery<Nip05Verification>({
    queryKey: ['nip05-verification', metadata?.nip05, pubkey],
    queryFn: async () => {
      if (!metadata || !pubkey) {
        return { isVerified: false, error: 'Missing metadata or pubkey' };
      }

      return await verifyNip05(metadata, pubkey);
    },
    enabled: !!(metadata?.nip05 && pubkey),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}