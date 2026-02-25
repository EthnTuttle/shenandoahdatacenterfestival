import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { formatDistanceToNow } from 'date-fns';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { useDiscussions, DISCUSSION_TAG } from '@/hooks/useDiscussions';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useQueryClient } from '@tanstack/react-query';
import { genUserName } from '@/lib/genUserName';
import type { NostrEvent } from '@nostrify/nostrify';
import {
  MessageCircle,
  Plus,
  Search,
  Clock,
  TrendingUp,
  ArrowUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type SortBy = 'new' | 'hot';

// Extract the "subject" tag value from a Nostr event (NIP-14)
function getSubject(event: NostrEvent): string {
  return event.tags.find(([name]) => name === 'subject')?.[1] ?? '';
}

// Extract all "t" tags from a Nostr event
function getTags(event: NostrEvent): string[] {
  return event.tags.filter(([name]) => name === 't').map(([, value]) => value).filter(Boolean);
}

function DiscussionCard({ event }: { event: NostrEvent }) {
  const author = useAuthor(event.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name ?? genUserName(event.pubkey);
  const [expanded, setExpanded] = useState(false);

  const subject = getSubject(event);
  const tags = getTags(event).filter((t) => t !== DISCUSSION_TAG && t !== 'frederick-county');
  const timeAgo = formatDistanceToNow(new Date(event.created_at * 1000), { addSuffix: true });

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 pt-1">
            <Avatar className="w-9 h-9">
              {metadata?.picture && <AvatarImage src={metadata.picture} alt={displayName} />}
              <AvatarFallback className="text-xs bg-pink-100 text-pink-700">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            {/* Title or content preview */}
            <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-snug">
              {subject || (event.content.length > 80 ? event.content.slice(0, 80) + '…' : event.content)}
            </h3>

            {/* Content preview (when there's a subject) */}
            {subject && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.content}</p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Author + time */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">{displayName}</span>
                {metadata?.nip05 && (
                  <span className="text-gray-400">{metadata.nip05}</span>
                )}
                <span>•</span>
                <span>{timeAgo}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                onClick={() => setExpanded((v) => !v)}
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" />
                {expanded ? 'Hide replies' : 'Replies'}
                {expanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
              </Button>
            </div>

            {/* CommentsSection — expands inline */}
            {expanded && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <CommentsSection
                  root={event}
                  title="Replies"
                  emptyStateMessage="No replies yet"
                  emptyStateSubtitle="Be the first to reply to this discussion."
                  className="border-0 shadow-none bg-gray-50/50 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DiscussionSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-1.5 pt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DiscussionsPage() {
  const { user } = useCurrentUser();
  const { data: discussions, isLoading, error } = useDiscussions(100);
  const { mutate: publish, isPending: isPublishing } = useNostrPublish();
  const queryClient = useQueryClient();

  const [sortBy, setSortBy] = useState<SortBy>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useSeoMeta({
    title: 'Discussions - Shenandoah Datacenter Festival',
    description:
      'Join the community conversation about datacenter development in Frederick County. Share your thoughts on agricultural preservation, infrastructure impacts, and the future of the valley.',
  });

  // Filter by search
  const filtered = (discussions ?? []).filter((event) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const subject = getSubject(event);
    const tags = getTags(event);
    return (
      subject.toLowerCase().includes(q) ||
      event.content.toLowerCase().includes(q) ||
      tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'new') return b.created_at - a.created_at;
    // "hot" — newest first for now since we don't have reaction counts from the relay in this view
    return b.created_at - a.created_at;
  });

  const handlePost = () => {
    if (!newPostTitle.trim() && !newPostContent.trim()) return;
    publish(
      {
        kind: 1,
        content: [newPostTitle.trim(), newPostContent.trim()].filter(Boolean).join('\n\n'),
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['t', DISCUSSION_TAG],
          ['t', 'frederick-county'],
          ...(newPostTitle.trim() ? [['subject', newPostTitle.trim()]] : []),
        ],
      },
      {
        onSuccess: () => {
          setNewPostTitle('');
          setNewPostContent('');
          setDialogOpen(false);
          // Invalidate to refresh the feed
          queryClient.invalidateQueries({ queryKey: ['discussions'] });
        },
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main feed */}
          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Community Discussions</h1>
                <p className="text-gray-500">
                  Powered by Nostr — your posts live on the open protocol, not our servers.
                </p>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="mt-4 sm:mt-0 bg-pink-600 hover:bg-pink-700"
                    disabled={!user}
                    title={!user ? 'Log in to post a discussion' : undefined}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Start a Discussion</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {!user && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                        You must be logged in to post. Use the login button in the nav.
                      </div>
                    )}
                    <Input
                      placeholder="Title (optional)"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      disabled={!user}
                    />
                    <Textarea
                      placeholder="Share your thoughts about datacenter development in Frederick County…"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      rows={6}
                      disabled={!user}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-pink-600 hover:bg-pink-700"
                        disabled={!user || isPublishing || (!newPostTitle.trim() && !newPostContent.trim())}
                        onClick={handlePost}
                      >
                        {isPublishing ? 'Posting…' : 'Post Discussion'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search discussions…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'hot' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('hot')}
                  className={sortBy === 'hot' ? 'bg-pink-600 hover:bg-pink-700' : ''}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Hot
                </Button>
                <Button
                  variant={sortBy === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('new')}
                  className={sortBy === 'new' ? 'bg-pink-600 hover:bg-pink-700' : ''}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  New
                </Button>
              </div>
            </div>

            {/* Feed */}
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <DiscussionSkeleton key={i} />)
              ) : error ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Could not load discussions from relay.</p>
                    <p className="text-sm mt-1">Check your connection and try refreshing.</p>
                  </CardContent>
                </Card>
              ) : sorted.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-gray-500">
                    <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-lg mb-1">No discussions yet</p>
                    <p className="text-sm">
                      {searchQuery
                        ? 'No results for that search. Try different keywords.'
                        : 'Be the first to start a conversation about the future of Frederick County.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                sorted.map((event) => <DiscussionCard key={event.id} event={event} />)
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Community Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex gap-2">
                      <span className="text-pink-500 font-bold">1.</span>
                      Log in with Nostr to post
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-500 font-bold">2.</span>
                      Stay on-topic: Frederick County land use, agriculture, datacenters
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-500 font-bold">3.</span>
                      Be respectful and factual
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-500 font-bold">4.</span>
                      Your posts are published to Nostr — they're public and permanent
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popular Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'agriculture',
                      'frederick-county',
                      'environment',
                      'noise',
                      'water',
                      'tax-burden',
                      'zoning',
                      'infrastructure',
                      'community',
                    ].map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200 text-xs"
                        onClick={() => setSearchQuery(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="pt-5 pb-5">
                  <h3 className="font-bold text-green-900 mb-1 flex items-center gap-2">
                    <ArrowUp className="w-4 h-4" />
                    Take Real Action
                  </h3>
                  <p className="text-sm text-green-800 mb-3">
                    Discussion is great. Action is better. Visit Protect Frederick to find out
                    how to make your voice heard at county meetings.
                  </p>
                  <a
                    href="https://protectfrederick.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-green-700 hover:text-green-900 underline"
                  >
                    protectfrederick.org →
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
