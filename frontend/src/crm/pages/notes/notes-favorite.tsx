import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNotes, type BackendNote } from '@/crm/services/backend';
import { CRM_NOTES_REFRESH_EVENT } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { sanitizeHumanLabel } from '@/crm/utils/identity-label';
import { getInitials, toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface FavoriteNoteCard {
  id: string;
  logo: string;
  avatar: string;
  org: string;
  title: string;
  content: string;
  author: string;
  dateLabel: string;
}

function sanitizeAuthorLabel(value: string): string {
  return sanitizeHumanLabel(value, 'Neznámý uživatel');
}

function hashToIndex(input: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % max) + 1;
}

function mapFavoriteCard(item: BackendNote): FavoriteNoteCard {
  const content = (item.content || '').trim();
  const firstLine = content.split('\n')[0] || 'Poznámka';
  const author =
    sanitizeAuthorLabel(
      `${item.user?.firstName ?? ''} ${item.user?.lastName ?? ''}`.trim() ||
        item.user?.email ||
        '',
    );
  const organization = item.company?.name || item.deal?.title || 'CRM';
  const stableSeed = item.id || item.user?.id || item.company?.id || item.deal?.id || organization;
  return {
    id: item.id,
    logo: toAbsoluteUrl(`/media/brand-logos/${hashToIndex(stableSeed, 12)}.svg`),
    avatar: toAbsoluteUrl(`/media/avatars/300-${hashToIndex(stableSeed, 24)}.png`),
    org: organization,
    title: firstLine.slice(0, 52),
    content: content.slice(0, 110) || 'Bez obsahu',
    author,
    dateLabel: new Date(item.updatedAt).toLocaleDateString('cs-CZ'),
  };
}

interface NotesCardProps {
  className?: string;
}

export function NotesFavorite({ className }: NotesCardProps) {
  const latestLoadRequestRef = useRef(0);
  const [items, setItems] = useState<BackendNote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    try {
      const response = await fetchNotes({ limit: 50 });
      const all = response?.data ?? [];
      const source = [...all]
        .sort((a, b) => {
          if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
            return a.isPinned ? -1 : 1;
          }
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        })
        .slice(0, 6);
      if (requestId !== latestLoadRequestRef.current) return;
      setItems(source);
    } catch (error) {
      logFrontendError({
        area: 'crm-notes-favorite',
        message: error instanceof Error ? error.message : 'Failed to load note favorites',
        meta: { operation: 'load_note_favorites' },
      });
      if (requestId !== latestLoadRequestRef.current) return;
      setItems([]);
    } finally {
      if (requestId !== latestLoadRequestRef.current) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFavorites();
    const onRefresh = () => void loadFavorites();
    window.addEventListener(CRM_NOTES_REFRESH_EVENT, onRefresh);
    return () => {
      latestLoadRequestRef.current += 1;
      window.removeEventListener(CRM_NOTES_REFRESH_EVENT, onRefresh);
    };
  }, [loadFavorites]);

  const cards = useMemo(() => items.map((item) => mapFavoriteCard(item)), [items]);

  if (loading) {
    return (
      <div className={cn(className)}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="min-w-0 rounded-xl border bg-background p-2.5">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="mb-2 h-4 w-2/3" />
              <Skeleton className="mb-1 h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className={cn(className)}>
        <div className="rounded-xl border border-dashed px-3 py-4 text-xs text-muted-foreground">
          Zatím žádné poznámky.
        </div>
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((note) => (
          <div
            key={note.id}
            className="min-w-0 rounded-xl border bg-background p-2.5 flex flex-col justify-between"
          >
              <div className="mb-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Avatar className="flex items-center justify-center size-5">
                    <AvatarImage
                      className="size-4 rounded-none"
                      src={note.logo}
                      alt={note.org}
                    />
                    <AvatarFallback className="border-0 text-[11px] font-semibold bg-yellow-500 text-white">
                      {note.title.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Link
                    to="/core/crm/notes"
                    className="font-normal text-xs hover:text-primary"
                  >
                    {note.org}
                  </Link>
                </div>
                <div className="font-semibold text-sm mb-1">{note.title}</div>
                <div className="text-xs text-muted-foreground break-words">
                  {note.content}
                </div>
              </div>

              <div className="flex items-center justify-between gap-1 mt-auto pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Avatar className="size-4">
                    <AvatarImage
                      src={note.avatar}
                      alt={note.author}
                    />
                    <AvatarFallback>{getInitials(note.author)}</AvatarFallback>
                  </Avatar>
                  <Link to="/core/crm/notes" className="text-mono text-xs hover:text-primary">
                    {note.author}
                  </Link>
                </div>
                <span className="shrink-0 text-xs">{note.dateLabel}</span>
              </div>
          </div>
        ))}
      </div>
    </div>
  );
}
