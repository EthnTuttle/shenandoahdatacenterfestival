import React, { useEffect, useRef } from 'react';
import { NostrEvent, NPool, NRelay1 } from '@nostrify/nostrify';
import { NostrContext } from '@nostrify/react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '@/hooks/useAppContext';

// Default relay pool — all queried simultaneously for reads; all receive writes
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.primal.net',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://nostr.wine',
];

interface NostrProviderProps {
  children: React.ReactNode;
}

const NostrProvider: React.FC<NostrProviderProps> = (props) => {
  const { children } = props;
  const { config, presetRelays } = useAppContext();

  const queryClient = useQueryClient();

  // Create NPool instance only once
  const pool = useRef<NPool | undefined>(undefined);

  // The user-selected relay (from RelaySelector / AppConfig) is the primary relay.
  // We keep a ref so the pool closures always see the latest value.
  const selectedRelayRef = useRef<string>(config.relayUrl);

  // Rebuild the full relay set whenever the user's selection changes
  useEffect(() => {
    selectedRelayRef.current = config.relayUrl;
    queryClient.resetQueries();
  }, [config.relayUrl, queryClient]);

  // Build the full set of relays: defaults + preset + user-selected
  const getRelaySet = (): string[] => {
    const set = new Set<string>(DEFAULT_RELAYS);
    set.add(selectedRelayRef.current);
    for (const { url } of (presetRelays ?? [])) {
      set.add(url);
    }
    return [...set];
  };

  // Initialize NPool only once
  if (!pool.current) {
    pool.current = new NPool({
      open(url: string) {
        return new NRelay1(url);
      },
      // Fan out reads to ALL relays simultaneously
      reqRouter(filters) {
        const relays = getRelaySet();
        const map = new Map<string, typeof filters>();
        for (const relay of relays) {
          map.set(relay, filters);
        }
        return map;
      },
      // Publish writes to ALL relays
      eventRouter(_event: NostrEvent) {
        return getRelaySet();
      },
    });
  }

  return (
    <NostrContext.Provider value={{ nostr: pool.current }}>
      {children}
    </NostrContext.Provider>
  );
};

export default NostrProvider;
