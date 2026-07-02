import { useMemo, useState, type MouseEvent } from 'react';
import { X } from 'lucide-react';
import { useManagedAssigneeOptions } from '@/crm/hooks/use-managed-core-users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, BadgeButton } from '@/components/ui/badge';
import { Button, ButtonArrow } from '@/components/ui/button';
import {
  Command,
  CommandCheck,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

type ManagedAssigneeSelectProps = {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
};

export function ManagedAssigneeSelect({
  value,
  onValueChange,
  placeholder = 'Select user...',
  searchPlaceholder = 'Search user...',
  emptyText = 'No users found.',
  disabled = false,
  className = 'w-full',
}: ManagedAssigneeSelectProps) {
  const [open, setOpen] = useState(false);
  const users = useManagedAssigneeOptions();
  const hasUsers = users.length > 0;
  const selectedValue = String(value || '');
  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedValue),
    [users, selectedValue],
  );

  const toggleSelection = (nextValue: string) => {
    onValueChange(selectedValue === nextValue ? '' : nextValue);
    setOpen(false);
  };

  const clearSelection = (event: MouseEvent) => {
    event.stopPropagation();
    onValueChange('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          mode="input"
          aria-expanded={open}
          autoHeight={true}
          placeholder={!selectedValue}
          disabled={disabled || !hasUsers}
          className={className}
        >
          {!selectedValue && (
            <span className="text-muted-foreground">
              {hasUsers ? placeholder : 'No users in core/user-management'}
            </span>
          )}
          <div className="flex gap-1 pe-2.5">
            {selectedValue && selectedUser ? (
              <Badge variant="outline" className="max-w-full gap-1.5 pe-1">
                <Avatar className="size-4">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback className="text-xs">{selectedUser.name[0]}</AvatarFallback>
                </Avatar>
                <span className="max-w-[180px] truncate font-medium">{selectedUser.name}</span>
                <BadgeButton onClick={clearSelection}>
                  <X />
                </BadgeButton>
              </Badge>
            ) : (
              <span />
            )}
          </div>
          <ButtonArrow />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[350px] max-w-[calc(100vw-2rem)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <ScrollArea viewportClassName="max-h-[300px] [&>div]:block!">
              <CommandEmpty>{hasUsers ? emptyText : 'No managed users available.'}</CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.name} ${user.email}`}
                    onSelect={() => toggleSelection(user.id)}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate hover:text-primary">{user.name}</span>
                        <span className="truncate text-muted-foreground text-xs">{user.email}</span>
                      </div>
                    </div>
                    {selectedValue === user.id && <CommandCheck />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
