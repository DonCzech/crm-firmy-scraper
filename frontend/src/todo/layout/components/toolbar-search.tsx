import type { ChangeEvent } from 'react';
import { Input, InputWrapper } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ToolbarSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function ToolbarSearch({ value, onChange, placeholder = 'Search' }: ToolbarSearchProps = {}) {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <div className="flex shrink-0 w-full">
      <InputWrapper>
        <Input type="search" value={value} placeholder={placeholder} onChange={handleInputChange} />
        <Badge variant="outline" className="whitespace-nowrap" size="sm">⌘ K</Badge>
      </InputWrapper>
    </div>
  );
}
