import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentHeader } from '../../layout/components/content-header';
import { NewLeadDialog } from '../contacts/new-lead-dialog';
import { BulkImportLeadsButton } from './bulk-import-button';

export function LeadPageHeader() {
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);

  return (
    <ContentHeader className="space-x-2">
      <h1 className="inline-flex items-center gap-2.5 text-sm font-semibold">
        <Target className="size-4 text-primary" /> Leady
      </h1>

      <div className="flex items-center gap-2.5">
        <BulkImportLeadsButton />
        <Button size="sm" onClick={() => setLeadDialogOpen(true)}>
          <Plus /> Nový lead
        </Button>
        <NewLeadDialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen} />
      </div>
    </ContentHeader>
  );
}
