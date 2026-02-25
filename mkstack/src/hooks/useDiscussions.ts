import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

// Discussions are kind-1 notes tagged with our community tag.
// Subject is carried in the "subject" tag per NIP-14.
export const DISCUSSION_TAG = 'shenandoah-datacenter-festival';

export interface DiscussionEvent extends NostrEvent {
  kind: 1;
}

export function useDiscussions(limit = 50) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['discussions', DISCUSSION_TAG, limit],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const events = await nostr.query(
        [{ kinds: [1], '#t': [DISCUSSION_TAG], limit }],
        { signal }
      );
      // Sort newest first as the default; callers can re-sort
      return events.sort((a, b) => b.created_at - a.created_at) as DiscussionEvent[];
    },
    staleTime: 30_000,
  });
}
