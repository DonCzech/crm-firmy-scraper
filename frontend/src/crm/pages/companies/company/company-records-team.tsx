import { useMemo } from 'react';
import { Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useManagedTeamMembers } from '@/crm/hooks/use-managed-team-members';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type TeamMember = {
  name: string;
  email: string;
  position: string;
  avatar?: string;
  initial?: string;
  joinDate: string;
  teamMembers: {
    name: string;
    avatar: string;
    initial: string;
  }[];
};

export function CompanyRecordsTeam() {
  const managedTeamMembers = useManagedTeamMembers();
  const teamMembers = useMemo<TeamMember[]>(() => {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    if (managedTeamMembers.length === 0) {
      return [
        {
          name: 'Uživatel',
          email: 'user@local',
          position: 'Agent',
          avatar: '',
          initial: 'U',
          joinDate: today,
          teamMembers: [],
        },
      ];
    }
    return managedTeamMembers.map((member) => {
      return {
        name: member.name,
        email: member.email,
        position: member.roleLabel,
        avatar: '',
        initial: member.initial,
        joinDate: today,
        teamMembers: [],
      };
    });
  }, [managedTeamMembers]);

  return (
    <div className="w-full px-2 sm:px-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Team</h2>
        <Button variant="outline" size="sm" className="gap-1">
          + Add Person
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border bg-background">
        <table className="w-full table-fixed divide-y divide-border">
          <tbody className="divide-y divide-border">
            {teamMembers.map((member, idx) => {
              const isPastDate = new Date(member.joinDate) < new Date();
              const visibleTeamMembers = member.teamMembers.length
                ? member.teamMembers
                : [
                    {
                      name: member.name,
                      avatar: member.avatar ?? '',
                      initial: member.initial ?? member.name[0],
                    },
                  ];

              return (
                <tr key={idx}>
                  <td className="px-3 py-2 w-7">
                    <div className="flex justify-center">
                      <Checkbox size="sm" />
                    </div>
                  </td>
                  <td className="px-0 py-2">
                    <div className="flex min-w-0 items-center gap-1.5 text-sm font-medium hover:text-primary">
                      <Avatar className="size-6">
                        {member.avatar && (
                          <AvatarImage src={member.avatar} alt={member.name} />
                        )}
                        <AvatarFallback>{member.initial?.[0]}</AvatarFallback>
                      </Avatar>
                      <Link
                        to="/core/crm/companies"
                        className="max-w-[170px] truncate font-medium text-sm hover:text-primary"
                      >
                        {member.name ? member.name : member.email}
                      </Link>
                      <Badge variant="outline" size="sm" className="max-w-[110px]">
                        <span className="truncate">{member.position}</span>
                      </Badge>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-primary underline text-end">
                    <Link to={`mailto:${member.email}`} className="inline-block max-w-[220px] truncate align-middle">
                      {member.email}
                    </Link>
                  </td>
                  <td className="px-3 py-2 flex items-center justify-end">
                    <div className="ms-auto flex min-w-0 items-center gap-2">
                      <Badge
                        appearance={isPastDate ? 'light' : undefined}
                        variant={isPastDate ? 'destructive' : 'secondary'}
                        size="sm"
                        className="max-w-[160px]"
                      >
                        <Calendar className="size-3.5 shrink-0" />
                        <span className="truncate">{member.joinDate}</span>
                      </Badge>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              size="sm"
                              className="cursor-pointer"
                            >
                              <Users className="size-3.5" />
                              {Math.max(1, member.teamMembers.length)} People
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            className={`
                              p-2 gap-2
                              ${visibleTeamMembers.length === 1 ? 'flex flex-col' : ''}
                              ${visibleTeamMembers.length === 2 || visibleTeamMembers.length === 3 ? 'flex flex-row' : ''}
                              ${visibleTeamMembers.length > 3 ? 'flex flex-wrap max-w-xs' : ''}
                            `}
                          >
                            {visibleTeamMembers.map((teamMember, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1"
                              >
                                <Avatar className="size-5">
                                  {teamMember.avatar ? (
                                    <AvatarImage
                                      src={teamMember.avatar}
                                      alt={teamMember.name}
                                    />
                                  ) : (
                                    <AvatarFallback>
                                      {teamMember.initial}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <span className="max-w-[120px] truncate text-xs font-medium">
                                  {teamMember.name}
                                </span>
                              </div>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
