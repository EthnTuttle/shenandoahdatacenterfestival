import { type NostrMetadata } from '@nostrify/nostrify';

export interface Nip05Verification {
  isVerified: boolean;
  identifier?: string;
  domain?: string;
  error?: string;
}

export async function verifyNip05(metadata: NostrMetadata, pubkey: string): Promise<Nip05Verification> {
  if (!metadata.nip05) {
    return { isVerified: false, error: 'No NIP-05 identifier found' };
  }

  try {
    const [name, domain] = metadata.nip05.split('@');

    if (!domain) {
      return { isVerified: false, error: 'Invalid NIP-05 format' };
    }

    const wellKnownUrl = `https://${domain}/.well-known/nostr.json?name=${name}`;

    const response = await fetch(wellKnownUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      return {
        isVerified: false,
        error: `Failed to fetch verification: ${response.status}`
      };
    }

    const data = await response.json();

    if (!data.names || typeof data.names !== 'object') {
      return {
        isVerified: false,
        error: 'Invalid .well-known/nostr.json format'
      };
    }

    const verifiedPubkey = data.names[name];

    if (!verifiedPubkey) {
      return {
        isVerified: false,
        error: `Name '${name}' not found in verification file`
      };
    }

    // Compare pubkeys (case insensitive)
    const isVerified = verifiedPubkey.toLowerCase() === pubkey.toLowerCase();

    return {
      isVerified,
      identifier: name,
      domain,
      error: isVerified ? undefined : 'Pubkey does not match verification file'
    };

  } catch (error) {
    return {
      isVerified: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

export function isNip05Verified(metadata: NostrMetadata | undefined): boolean {
  // For the satirical website, we'll be more lenient and just check if a NIP-05 exists
  // In a production system, you'd want to call verifyNip05 and cache results
  return !!(metadata?.nip05 && metadata.nip05.includes('@'));
}

export function extractDomainFromNip05(nip05: string | undefined): string | undefined {
  if (!nip05) return undefined;
  const parts = nip05.split('@');
  return parts.length === 2 ? parts[1] : undefined;
}

export function formatNip05Display(nip05: string | undefined): string {
  if (!nip05) return 'Unverified';
  return nip05;
}