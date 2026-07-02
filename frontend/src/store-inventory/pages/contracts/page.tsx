import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, ScrollText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  createPlatformContract,
  createPlatformContractTemplate,
  fetchPlatformContracts,
  fetchPlatformContractTemplates,
  updatePlatformContractStatus,
  type PlatformContractDocument,
  type PlatformContractListItem,
  type PlatformContractTemplate,
} from '@/crm/services/backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const DEFAULT_TEMPLATE_BODY = `PREDMET SMLOUVY

1. Poskytovatel poskytne službu dle specifikace.
2. Objednatel uhradí cenu dle cenové nabídky.
3. Smlouva nabývá účinnosti dnem podpisu.
`;

export function ContractsPage() {
  const [loading, setLoading] = useState(false);
  const [submittingTemplate, setSubmittingTemplate] = useState(false);
  const [submittingContract, setSubmittingContract] = useState(false);
  const [updatingContractId, setUpdatingContractId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<PlatformContractTemplate[]>([]);
  const [contracts, setContracts] = useState<PlatformContractListItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('none');
  const [createdContract, setCreatedContract] = useState<PlatformContractDocument | null>(null);

  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('general');
  const [templateBody, setTemplateBody] = useState(DEFAULT_TEMPLATE_BODY);

  const [contractTitle, setContractTitle] = useState('');
  const [contractBodyOverride, setContractBodyOverride] = useState('');

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === selectedTemplateId),
    [selectedTemplateId, templates],
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesRows, contractsRows] = await Promise.all([
        fetchPlatformContractTemplates(),
        fetchPlatformContracts(120),
      ]);
      setTemplates(Array.isArray(templatesRows) ? templatesRows : []);
      setContracts(Array.isArray(contractsRows) ? contractsRows : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Načtení contracts dat selhalo.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const onCreateTemplate = async (event: FormEvent) => {
    event.preventDefault();
    const safeName = templateName.trim();
    const safeBody = templateBody.trim();
    if (!safeName || !safeBody) {
      toast.error('Vyplň název i obsah šablony.');
      return;
    }

    setSubmittingTemplate(true);
    try {
      const created = await createPlatformContractTemplate({
        name: safeName,
        category: templateCategory || undefined,
        body: safeBody,
      });
      setTemplates((prev) => [created, ...prev]);
      setSelectedTemplateId(created.id);
      setTemplateName('');
      await loadData();
      toast.success('Šablona smlouvy vytvořena.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Vytvoření šablony selhalo.';
      toast.error(message);
    } finally {
      setSubmittingTemplate(false);
    }
  };

  const onCreateContract = async (event: FormEvent) => {
    event.preventDefault();
    const safeTitle = contractTitle.trim();
    if (!safeTitle) {
      toast.error('Vyplň název smlouvy.');
      return;
    }

    setSubmittingContract(true);
    try {
      const created = await createPlatformContract({
        templateId: selectedTemplateId !== 'none' ? selectedTemplateId : undefined,
        title: safeTitle,
        body: contractBodyOverride.trim() || undefined,
      });
      setCreatedContract(created);
      setContractTitle('');
      setContractBodyOverride('');
      await loadData();
      toast.success('Smlouva byla vytvořena.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Vytvoření smlouvy selhalo.';
      toast.error(message);
    } finally {
      setSubmittingContract(false);
    }
  };

  const onMoveStatus = async (contract: PlatformContractListItem, status: string) => {
    setUpdatingContractId(contract.id);
    try {
      const updated = await updatePlatformContractStatus(contract.id, { status });
      setContracts((prev) =>
        prev.map((item) =>
          item.id === contract.id
            ? {
                ...item,
                status: updated.status,
                current_version: updated.current_version,
                updated_at: updated.updated_at,
              }
            : item,
        ),
      );
      if (createdContract?.id === contract.id) setCreatedContract(updated);
      toast.success(`Stav smlouvy změněn na ${updated.status}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Změna stavu smlouvy selhala.';
      toast.error(message);
    } finally {
      setUpdatingContractId(null);
    }
  };

  return (
    <div className="container-fluid space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Contracts</h1>
          <p className="text-sm text-muted-foreground">
            Správa šablon a rychlé založení smlouvy nad platform API.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => void loadData()}
          disabled={loading}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Obnovit
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nová šablona</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={(event) => void onCreateTemplate(event)}>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-name">Název</Label>
                <Input
                  id="tpl-name"
                  value={templateName}
                  onChange={(event) => setTemplateName(event.target.value)}
                  placeholder="Smlouva o spolupráci"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-category">Kategorie</Label>
                <Input
                  id="tpl-category"
                  value={templateCategory}
                  onChange={(event) => setTemplateCategory(event.target.value)}
                  placeholder="general"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-body">Obsah</Label>
                <Textarea
                  id="tpl-body"
                  rows={9}
                  value={templateBody}
                  onChange={(event) => setTemplateBody(event.target.value)}
                />
              </div>
              <Button type="submit" className="gap-2" disabled={submittingTemplate}>
                {submittingTemplate ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Vytvořit šablonu
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nová smlouva</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={(event) => void onCreateContract(event)}>
              <div className="space-y-1.5">
                <Label htmlFor="contract-title">Název smlouvy</Label>
                <Input
                  id="contract-title"
                  value={contractTitle}
                  onChange={(event) => setContractTitle(event.target.value)}
                  placeholder="Smlouva - klient Novák"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Šablona</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyber šablonu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Bez šablony</SelectItem>
                    {templates.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contract-body">Override obsahu (volitelné)</Label>
                <Textarea
                  id="contract-body"
                  rows={6}
                  value={contractBodyOverride}
                  onChange={(event) => setContractBodyOverride(event.target.value)}
                  placeholder={selectedTemplate ? 'Když necháš prázdné, použije se tělo šablony.' : 'Volitelný obsah.'}
                />
              </div>
              <Button type="submit" className="gap-2" disabled={submittingContract}>
                {submittingContract ? <Loader2 className="size-4 animate-spin" /> : <ScrollText className="size-4" />}
                Založit smlouvu
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Šablony ({templates.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {templates.length === 0 ? (
            <div className="text-sm text-muted-foreground">Zatím nejsou dostupné žádné šablony.</div>
          ) : (
            templates.slice(0, 12).map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <div className="mb-1 flex items-center gap-2">
                  <div className="font-medium">{item.name}</div>
                  <Badge variant="secondary">{item.category || 'general'}</Badge>
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">{item.body}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contract Lifecycle ({contracts.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {contracts.length === 0 ? (
            <div className="text-sm text-muted-foreground">Zatím nejsou dostupné žádné smlouvy.</div>
          ) : (
            contracts.slice(0, 40).map((item) => {
              const isBusy = updatingContractId === item.id;
              const status = String(item.status || '').toLowerCase();
              return (
                <div key={item.id} className="rounded-md border p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="font-medium">{item.title}</div>
                    <Badge variant={status === 'signed' ? 'default' : status === 'expired' ? 'destructive' : 'secondary'}>
                      {status || 'draft'}
                    </Badge>
                    <Badge variant="outline">v{item.current_version || 1}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.id} • aktualizace {item.updated_at ? new Date(item.updated_at).toLocaleString('cs-CZ') : 'n/a'}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isBusy || status === 'draft'}
                      onClick={() => void onMoveStatus(item, 'draft')}
                    >
                      Draft
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isBusy || status === 'review'}
                      onClick={() => void onMoveStatus(item, 'review')}
                    >
                      Review
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isBusy || status === 'approved'}
                      onClick={() => void onMoveStatus(item, 'approved')}
                    >
                      Approved
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isBusy || status === 'expired'}
                      onClick={() => void onMoveStatus(item, 'expired')}
                    >
                      Expired
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {createdContract && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Poslední vytvořená smlouva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">ID:</span> {createdContract.id}
            </div>
            <div>
              <span className="text-muted-foreground">Název:</span> {createdContract.title}
            </div>
            <div>
              <span className="text-muted-foreground">Stav:</span> {createdContract.status}
            </div>
            <div>
              <span className="text-muted-foreground">Verze:</span> {createdContract.versions?.length || 0}
            </div>
            <div>
              <span className="text-muted-foreground">Podpisy:</span> {createdContract.signatures?.length || 0}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
