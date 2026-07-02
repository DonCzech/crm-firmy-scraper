import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUserRole } from '@/crm/hooks/use-current-user-role';
import { coerceTrimmedString } from '@/crm/utils/coerce';
import { Button } from '@/components/ui/button';
import {
  fetchFirmyListings,
  createContact,
  createDeal,
} from '@/crm/services/backend';
import {
  CRM_COMPANIES_REFRESH_EVENT,
  CRM_CONTACTS_REFRESH_EVENT,
  CRM_DEALS_REFRESH_EVENT,
  dispatchCrmEvent,
} from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { appendSensitiveActionAudit } from '@/crm/services/sensitive-actions-audit';

export function BulkImportLeadsButton({ onDone }: { onDone?: () => void }) {
  const { role, userId, canManageSensitiveActions } = useCurrentUserRole();
  const [importing, setImporting] = useState(false);

  const handleBulkImport = async () => {
    if (!canManageSensitiveActions) {
      const message = 'Bulk import je dostupný pouze pro role admin/manager.';
      toast.error(message);
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'bulk_import_firmy',
        result: 'denied',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
      });
      return;
    }
    setImporting(true);
    let success = 0;
    let errors = 0;
    const toastId = toast.loading('Načítám data...');

    try {
      const firmyRes = await fetchFirmyListings({ limit: 1000 });

      const firmyListings = firmyRes?.data ?? [];
      const total = firmyListings.length;

      toast.loading(`Importuji ${total} firem (0 / ${total})...`, { id: toastId });

      let done = 0;

      for (const row of firmyListings) {
        try {
          const normalizedName = coerceTrimmedString(row.name) || 'Neznámá firma';
          const nameParts = normalizedName.split(/\s+/).filter(Boolean);
          const normalizedEmail = coerceTrimmedString(row.email);
          const normalizedPhone = coerceTrimmedString(row.phone);
          const normalizedCity = coerceTrimmedString(row.city);
          const normalizedWebsite = coerceTrimmedString(row.website);
          const contact = await createContact({
            firstName: nameParts[0] ?? 'Neznámá',
            lastName: nameParts.slice(1).join(' ') || 'Firma',
            contactType: 'lead',
            source: 'firmy',
            email: normalizedEmail || undefined,
            phone: normalizedPhone || undefined,
            city: normalizedCity || undefined,
          });
          await createDeal({
            title: normalizedName || 'Firma z firmy.cz',
            stage: 'new',
            contactId: contact.id,
            description: `[zdroj:firmy] ${normalizedWebsite}`.trim(),
          });
          success++;
        } catch (error) {
          logFrontendError({
            area: 'crm-leads-bulk-import',
            message: error instanceof Error ? error.message : 'Failed to import firmy listing row',
            meta: { firmyListingId: row.id, operation: 'bulk_import_firmy_row' },
          });
          errors++;
        }
        done++;
        if (done % 10 === 0) {
          toast.loading(`Importuji firmy (${done} / ${total})...`, { id: toastId });
        }
      }

      const msg = errors > 0
        ? `Import dokončen: ${success} firem přidáno, ${errors} selhalo.`
        : `Import dokončen: ${success} firem přidáno.`;
      toast.success(msg, { id: toastId });
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'bulk_import_firmy',
        result: errors > 0 ? 'error' : 'success',
        actorRole: role,
        actorUserId: userId || undefined,
        message: msg,
        meta: { success, errors, total },
      });
      dispatchCrmEvent(CRM_CONTACTS_REFRESH_EVENT);
      dispatchCrmEvent(CRM_COMPANIES_REFRESH_EVENT);
      dispatchCrmEvent(CRM_DEALS_REFRESH_EVENT);
      onDone?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import selhal.';
      logFrontendError({
        area: 'crm-leads-bulk-import',
        message,
        meta: { operation: 'bulk_import_firmy' },
      });
      appendSensitiveActionAudit({
        area: 'leads',
        action: 'bulk_import_firmy',
        result: 'error',
        actorRole: role,
        actorUserId: userId || undefined,
        message,
      });
      toast.error(message, { id: toastId });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => void handleBulkImport()}
      disabled={importing || !canManageSensitiveActions}
    >
      <Download className="size-4" />
      {importing ? 'Importuji...' : 'Importovat firmy'}
    </Button>
  );
}
