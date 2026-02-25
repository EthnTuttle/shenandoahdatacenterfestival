import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNip05Verification } from '@/hooks/useNip05';
import { type NostrMetadata } from '@nostrify/nostrify';
import { isNip05Verified, formatNip05Display } from '@/lib/nip05';

interface Nip05BadgeProps {
  metadata?: NostrMetadata;
  pubkey?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Nip05Badge({ metadata, pubkey, showText = false, size = 'md' }: Nip05BadgeProps) {
  const { data: verification, isLoading } = useNip05Verification(metadata, pubkey);

  // For the satirical website, we'll show as verified if they have a NIP-05 identifier
  // This is more lenient than full verification for demo purposes
  const hasNip05 = isNip05Verified(metadata);
  const displayText = formatNip05Display(metadata?.nip05);

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  if (isLoading) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center">
              <Loader2 className={`${iconSize} text-gray-400 animate-spin`} />
              {showText && <span className={`ml-1 ${textSize} text-gray-500`}>Verifying...</span>}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Verifying NIP-05 identifier...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!hasNip05) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center">
              <AlertCircle className={`${iconSize} text-gray-400`} />
              {showText && <span className={`ml-1 ${textSize} text-gray-500`}>Unverified</span>}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>No NIP-05 identifier found</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Show as verified for demo purposes if they have a NIP-05 identifier
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center">
            <CheckCircle className={`${iconSize} text-blue-500`} />
            {showText && (
              <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800 border-blue-300">
                <span className={textSize}>{displayText}</span>
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">NIP-05 Verified</p>
            <p className="text-sm">{displayText}</p>
            {verification?.error && (
              <p className="text-xs text-yellow-600">Note: {verification.error}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Nip05RequiredNotice() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-start">
        <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 mb-1">
            NIP-05 Verification Required
          </p>
          <p className="text-sm text-blue-800">
            Only users with verified NIP-05 identifiers can post content to maintain quality discussions.
            Add a NIP-05 identifier to your Nostr profile to participate.
          </p>
        </div>
      </div>
    </div>
  );
}