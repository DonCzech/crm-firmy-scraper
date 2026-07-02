import { Link } from 'react-router-dom';
import { useManagedUserNameAt } from '@/crm/hooks/use-managed-user-name-at';
import { getInitials, toAbsoluteUrl } from '@/lib/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const notes = [
  {
    logo: toAbsoluteUrl('/media/brand-logos/monetha.svg'),
    org: 'KeenThemes',
    title: 'Project Kickoff',
    content: 'Kick-off meeting tomorrow at 10am.',
    date: 'May 12, 2025',
  },
  {
    logo: toAbsoluteUrl('/media/brand-logos/django.svg'),
    org: 'Tech Innovators Inc',
    title: 'Team Meeting',
    content: 'Weekly team meeting scheduled for tomorrow at 2pm.',
    date: 'May 23, 2025',
  },
  {
    logo: toAbsoluteUrl('/media/brand-logos/android.svg'),
    org: 'Business Solutions Co',
    title: 'Client Feedback',
    content: 'Client requested additional features for the dashboard.',
    date: 'May 14, 2025',
  },
  {
    logo: toAbsoluteUrl('/media/brand-logos/bithumb.svg'),
    org: 'Digital Marketing Agency',
    title: 'Feature Request',
    content: 'Client requested support for custom themes and dark mode.',
    date: 'May 24, 2025',
  },
  {
    logo: toAbsoluteUrl('/media/brand-logos/btcexchange.svg'),
    org: 'Enterprise Solutions',
    title: 'Onboarding Feedback',
    content:
      'The onboarding process was smooth but could use more tooltips for new users.',
    date: 'June 2, 2025',
  },
  {
    logo: toAbsoluteUrl('/media/brand-logos/btcchina.svg'),
    org: 'Data Analytics Corp',
    title: 'Feature Request',
    content: 'Please add support for exporting reports as PDF and Excel.',
    date: 'June 3, 2025',
  },
  {
    logo: toAbsoluteUrl('/media/brand-logos/divi.svg'),
    org: 'Creative Studios',
    title: 'Q2 Planning',
    content: 'Kick-off meeting Mon at 10am.',
    date: 'June 5, 2025',
  },
  {
    logo: toAbsoluteUrl('/media/brand-logos/bridgefy.svg'),
    org: 'Digital Solutions',
    title: 'Project Launch',
    content: 'Final review Tue at 2pm.',
    date: 'June 24, 2025',
  },
];

export function CompanyRecordsNotes() {
  const getAuthorName = useManagedUserNameAt();

  return (
    <div className="">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Notes</h2>
        <Button variant="outline" size="sm" className="gap-1">
          + Create note
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {notes.map((note, idx) => {
          const authorName = getAuthorName(idx);
          return (
            <Card key={idx} className="bg-background">
              <CardContent className="flex flex-col justify-between">
                <div className="mb-2">
                  <div className="mb-2 flex min-w-0 items-center gap-2">
                    <img src={note.logo} alt={note.org} className="size-4.5" />
                    <Link
                      to="/core/crm/companies"
                      className="truncate font-normal text-xs hover:text-primary"
                      title={note.org}
                    >
                      {note.org}
                    </Link>
                  </div>
                  <div className="mb-1 line-clamp-2 break-words text-sm font-semibold" title={note.title}>
                    {note.title}
                  </div>
                  <div className="line-clamp-3 break-words text-xs text-muted-foreground">
                    {note.content}
                  </div>
                </div>

                <div className="mt-auto flex min-w-0 items-center justify-between gap-1 pt-2 text-xs text-muted-foreground">
                  <div className="flex min-w-0 items-center gap-1">
                    <Avatar className="size-6">
                      <AvatarImage
                        src={toAbsoluteUrl(
                          `/media/avatars/300-${(idx % 8) + 1}.png`,
                        )}
                        alt={authorName}
                      />
                      <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
                    </Avatar>
                    <Link
                      to="/core/crm/companies"
                      className="truncate font-medium text-mono text-xs hover:text-primary"
                      title={authorName}
                    >
                      {authorName}
                    </Link>
                  </div>
                  <span className="shrink-0">{note.date}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
