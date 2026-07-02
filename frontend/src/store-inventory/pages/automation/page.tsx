import { useEffect, useMemo, useState } from 'react';
import { History, Loader2, Play, Plus, RefreshCw, RotateCcw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchPlatformAuditLogs,
  fetchPlatformAutomationRules,
  runPlatformAutomationTest,
  upsertPlatformAutomationRule,
  type PlatformAuditLog,
  type PlatformAutomationRule,
} from '@/crm/services/backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

type ConditionOp = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';

type ConditionRow = {
  field: string;
  op: ConditionOp;
  value: string;
};

type NotifyAction = {
  enabled: boolean;
  userIdsCsv: string;
  type: string;
  title: string;
  message: string;
};

type WebhookAction = {
  enabled: boolean;
  url: string;
};

type RuleVersionSnapshot = {
  snapshotId: string;
  ruleId: string;
  createdAt: string;
  source: 'local';
  name: string;
  eventType: string;
  isActive: boolean;
  conditions: ConditionRow[];
  notify: NotifyAction;
  webhook: WebhookAction;
};

const HISTORY_STORAGE_KEY = 'automation_rule_versions_v2';

const EVENT_TEMPLATES = [
  'ticket.created',
  'ticket.updated',
  'order.created',
  'deal.stage_changed',
  'contact.created',
  'task.created',
] as const;

const DEFAULT_TEST_PAYLOAD = '{\n  "status": "open",\n  "ticketId": "demo-1"\n}';

const EMPTY_NOTIFY: NotifyAction = {
  enabled: true,
  userIdsCsv: '',
  type: 'automation',
  title: 'Automation notification',
  message: 'Byla spuštěna automatizace.',
};

const EMPTY_WEBHOOK: WebhookAction = {
  enabled: false,
  url: '',
};

function readHistory(): RuleVersionSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RuleVersionSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(next: RuleVersionSnapshot[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next.slice(0, 300)));
}

function parseConditionValue(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

function parseConditionsRaw(raw: unknown): ConditionRow[] {
  if (!raw) return [{ field: 'status', op: 'eq', value: 'open' }];

  if (Array.isArray(raw)) {
    return raw.map((item) => {
      const row = item as Record<string, unknown>;
      return {
        field: String(row.field ?? ''),
        op: (String(row.op ?? 'eq') as ConditionOp) || 'eq',
        value: String(row.value ?? ''),
      };
    });
  }

  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    const all = Array.isArray(obj.all) ? obj.all : [];
    if (all.length === 0) return [{ field: 'status', op: 'eq', value: 'open' }];
    return all.map((item) => {
      const row = item as Record<string, unknown>;
      return {
        field: String(row.field ?? ''),
        op: (String(row.op ?? 'eq') as ConditionOp) || 'eq',
        value: String(row.value ?? ''),
      };
    });
  }

  return [{ field: 'status', op: 'eq', value: 'open' }];
}

function parseActionsRaw(raw: unknown): { notify: NotifyAction; webhook: WebhookAction } {
  const notify = { ...EMPTY_NOTIFY };
  const webhook = { ...EMPTY_WEBHOOK };

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { notify, webhook };
  }

  const source = raw as Record<string, unknown>;
  if (source.notify && typeof source.notify === 'object' && !Array.isArray(source.notify)) {
    const n = source.notify as Record<string, unknown>;
    const ids = Array.isArray(n.userIds) ? (n.userIds as unknown[]).map((item) => String(item)) : [];
    notify.enabled = true;
    notify.userIdsCsv = ids.join(', ');
    notify.type = String(n.type ?? notify.type);
    notify.title = String(n.title ?? notify.title);
    notify.message = String(n.message ?? notify.message);
  } else {
    notify.enabled = false;
  }

  if (source.webhook && typeof source.webhook === 'object' && !Array.isArray(source.webhook)) {
    const w = source.webhook as Record<string, unknown>;
    webhook.enabled = true;
    webhook.url = String(w.url ?? '');
  }

  return { notify, webhook };
}

function toConditionsPayload(conditions: ConditionRow[]) {
  return {
    all: conditions
      .filter((item) => item.field.trim().length > 0)
      .map((item) => ({
        field: item.field.trim(),
        op: item.op,
        value: parseConditionValue(item.value),
      })),
  };
}

function toActionsPayload(notify: NotifyAction, webhook: WebhookAction) {
  const payload: Record<string, unknown> = {};
  if (notify.enabled) {
    payload.notify = {
      userIds: notify.userIdsCsv
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      type: notify.type.trim() || 'automation',
      title: notify.title.trim(),
      message: notify.message.trim(),
    };
  }
  if (webhook.enabled && webhook.url.trim()) {
    payload.webhook = {
      url: webhook.url.trim(),
    };
  }
  return payload;
}

export function AutomationPage() {
  const [rules, setRules] = useState<PlatformAutomationRule[]>([]);
  const [audit, setAudit] = useState<PlatformAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runningTest, setRunningTest] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('new');

  const [ruleName, setRuleName] = useState('');
  const [eventType, setEventType] = useState<string>(EVENT_TEMPLATES[0]);
  const [isActive, setIsActive] = useState(true);
  const [conditions, setConditions] = useState<ConditionRow[]>([{ field: 'status', op: 'eq', value: 'open' }]);
  const [notifyAction, setNotifyAction] = useState<NotifyAction>({ ...EMPTY_NOTIFY });
  const [webhookAction, setWebhookAction] = useState<WebhookAction>({ ...EMPTY_WEBHOOK });
  const [testPayloadJson, setTestPayloadJson] = useState(DEFAULT_TEST_PAYLOAD);
  const [history, setHistory] = useState<RuleVersionSnapshot[]>(() => readHistory());

  const activeRules = useMemo(
    () => rules.filter((item) => item.is_active === true || item.is_active === 1).length,
    [rules],
  );

  const selectedHistory = useMemo(
    () =>
      history
        .filter((item) => item.ruleId === selectedRuleId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [history, selectedRuleId],
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [rulesRows, auditRows] = await Promise.all([
        fetchPlatformAutomationRules(),
        fetchPlatformAuditLogs(200),
      ]);

      setRules(Array.isArray(rulesRows) ? rulesRows : []);
      const filteredAudit = (Array.isArray(auditRows) ? auditRows : []).filter((row) => {
        const action = String(row.action || '').toLowerCase();
        const path = String(row.path || '').toLowerCase();
        return action.includes('automation') || path.includes('/platform/automation');
      });
      setAudit(filteredAudit);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Načtení automation dat selhalo.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetEditor = () => {
    setSelectedRuleId('new');
    setRuleName('');
    setEventType(EVENT_TEMPLATES[0]);
    setIsActive(true);
    setConditions([{ field: 'status', op: 'eq', value: 'open' }]);
    setNotifyAction({ ...EMPTY_NOTIFY });
    setWebhookAction({ ...EMPTY_WEBHOOK });
  };

  const hydrateEditorFromRule = (rule: PlatformAutomationRule) => {
    setSelectedRuleId(rule.id);
    setRuleName(rule.name || '');
    setEventType(rule.event_type || EVENT_TEMPLATES[0]);
    setIsActive(rule.is_active === true || rule.is_active === 1);
    setConditions(parseConditionsRaw(rule.conditions_json));
    const actions = parseActionsRaw(rule.actions_json);
    setNotifyAction(actions.notify);
    setWebhookAction(actions.webhook);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const onSaveVersionSnapshot = (ruleId: string, name: string, event: string, active: boolean) => {
    const snapshot: RuleVersionSnapshot = {
      snapshotId: crypto.randomUUID(),
      ruleId,
      createdAt: new Date().toISOString(),
      source: 'local',
      name,
      eventType: event,
      isActive: active,
      conditions: conditions.map((item) => ({ ...item })),
      notify: { ...notifyAction },
      webhook: { ...webhookAction },
    };

    const next = [snapshot, ...history];
    setHistory(next);
    saveHistory(next);
  };

  const onSaveRule = async () => {
    const safeName = ruleName.trim();
    const safeEventType = eventType.trim();
    if (!safeName || !safeEventType) {
      toast.error('Vyplň název pravidla a event type.');
      return;
    }

    if (conditions.every((item) => !item.field.trim())) {
      toast.error('Přidej alespoň jednu podmínku.');
      return;
    }

    setSaving(true);
    try {
      const payloadConditions = toConditionsPayload(conditions);
      const payloadActions = toActionsPayload(notifyAction, webhookAction);

      const saved = await upsertPlatformAutomationRule({
        id: selectedRuleId !== 'new' ? selectedRuleId : undefined,
        name: safeName,
        eventType: safeEventType,
        isActive,
        conditions: payloadConditions,
        actions: payloadActions,
      });

      onSaveVersionSnapshot(saved.id, safeName, safeEventType, isActive);
      await loadData();
      hydrateEditorFromRule(saved);
      toast.success(selectedRuleId === 'new' ? 'Pravidlo vytvořeno.' : 'Pravidlo aktualizováno.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Uložení pravidla selhalo.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const onToggleRuleActive = async (rule: PlatformAutomationRule) => {
    const next = !(rule.is_active === true || rule.is_active === 1);
    try {
      await upsertPlatformAutomationRule({
        id: rule.id,
        name: rule.name,
        eventType: rule.event_type,
        isActive: next,
        conditions: (rule.conditions_json as Record<string, unknown>) ?? {},
        actions: (rule.actions_json as Record<string, unknown>) ?? {},
      });
      await loadData();
      if (selectedRuleId === rule.id) {
        setIsActive(next);
      }
      toast.success(`Pravidlo ${next ? 'aktivováno' : 'deaktivováno'}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Změna stavu pravidla selhala.';
      toast.error(message);
    }
  };

  const onRollback = async (snapshot: RuleVersionSnapshot) => {
    setSaving(true);
    try {
      const saved = await upsertPlatformAutomationRule({
        id: snapshot.ruleId,
        name: snapshot.name,
        eventType: snapshot.eventType,
        isActive: snapshot.isActive,
        conditions: toConditionsPayload(snapshot.conditions),
        actions: toActionsPayload(snapshot.notify, snapshot.webhook),
      });
      onSaveVersionSnapshot(saved.id, saved.name, saved.event_type, saved.is_active === true || saved.is_active === 1);
      await loadData();
      hydrateEditorFromRule(saved);
      toast.success('Rollback dokončen.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Rollback selhal.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const onRunTest = async () => {
    let payload: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(testPayloadJson);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Payload musí být JSON objekt.');
      }
      payload = parsed as Record<string, unknown>;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Neplatný JSON payload.';
      toast.error(message);
      return;
    }

    setRunningTest(true);
    try {
      const result = await runPlatformAutomationTest({
        eventType: eventType.trim() || EVENT_TEMPLATES[0],
        payload,
      });

      const matchedRules =
        typeof result.matchedRules === 'number'
          ? result.matchedRules
          : Array.isArray((result as { results?: unknown[] }).results)
            ? (result as { results: unknown[] }).results.length
            : 0;

      const executedRules =
        typeof result.executedRules === 'number'
          ? result.executedRules
          : Array.isArray((result as { results?: unknown[] }).results)
            ? (result as { results: unknown[] }).results.length
            : 0;

      const failedRules = typeof result.failedRules === 'number' ? result.failedRules : 0;
      toast.success(`Test: matched ${matchedRules}, executed ${executedRules}, failed ${failedRules}`);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Automation test-run selhal.';
      toast.error(message);
    } finally {
      setRunningTest(false);
    }
  };

  return (
    <div className="container-fluid space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Automation Builder v2</h1>
          <p className="text-sm text-muted-foreground">Builder pravidel, verze, rollback a audit feed.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={resetEditor}>
            <Plus className="size-4" />
            Nové pravidlo
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => void loadData()} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Obnovit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Rule Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="rule-name">Název</Label>
                <Input id="rule-name" value={ruleName} onChange={(event) => setRuleName(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event-type">Event type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger id="event-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TEMPLATES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Pravidlo aktivní</div>
                <div className="text-xs text-muted-foreground">Neaktivní pravidla se při eventu nespouští.</div>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Conditions (ALL)</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => setConditions((prev) => [...prev, { field: '', op: 'eq', value: '' }])}
                >
                  <Plus className="size-4" />
                  Přidat podmínku
                </Button>
              </div>
              <div className="space-y-2">
                {conditions.map((condition, index) => (
                  <div key={`${condition.field}-${index}`} className="grid gap-2 md:grid-cols-[1fr_120px_1fr_auto]">
                    <Input
                      placeholder="field, např. status"
                      value={condition.field}
                      onChange={(event) =>
                        setConditions((prev) =>
                          prev.map((item, i) => (i === index ? { ...item, field: event.target.value } : item)),
                        )
                      }
                    />
                    <Select
                      value={condition.op}
                      onValueChange={(value) =>
                        setConditions((prev) =>
                          prev.map((item, i) => (i === index ? { ...item, op: value as ConditionOp } : item)),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eq">eq</SelectItem>
                        <SelectItem value="neq">neq</SelectItem>
                        <SelectItem value="gt">gt</SelectItem>
                        <SelectItem value="gte">gte</SelectItem>
                        <SelectItem value="lt">lt</SelectItem>
                        <SelectItem value="lte">lte</SelectItem>
                        <SelectItem value="contains">contains</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="value"
                      value={condition.value}
                      onChange={(event) =>
                        setConditions((prev) =>
                          prev.map((item, i) => (i === index ? { ...item, value: event.target.value } : item)),
                        )
                      }
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={conditions.length <= 1}
                      onClick={() => setConditions((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Action: Notify</Label>
                  <Switch
                    checked={notifyAction.enabled}
                    onCheckedChange={(checked) => setNotifyAction((prev) => ({ ...prev, enabled: checked }))}
                  />
                </div>
                <Input
                  placeholder="User IDs (CSV)"
                  value={notifyAction.userIdsCsv}
                  onChange={(event) => setNotifyAction((prev) => ({ ...prev, userIdsCsv: event.target.value }))}
                  disabled={!notifyAction.enabled}
                />
                <Input
                  placeholder="Type"
                  value={notifyAction.type}
                  onChange={(event) => setNotifyAction((prev) => ({ ...prev, type: event.target.value }))}
                  disabled={!notifyAction.enabled}
                />
                <Input
                  placeholder="Title"
                  value={notifyAction.title}
                  onChange={(event) => setNotifyAction((prev) => ({ ...prev, title: event.target.value }))}
                  disabled={!notifyAction.enabled}
                />
                <Textarea
                  rows={3}
                  placeholder="Message"
                  value={notifyAction.message}
                  onChange={(event) => setNotifyAction((prev) => ({ ...prev, message: event.target.value }))}
                  disabled={!notifyAction.enabled}
                />
              </div>

              <div className="space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Action: Webhook</Label>
                  <Switch
                    checked={webhookAction.enabled}
                    onCheckedChange={(checked) => setWebhookAction((prev) => ({ ...prev, enabled: checked }))}
                  />
                </div>
                <Input
                  placeholder="https://..."
                  value={webhookAction.url}
                  onChange={(event) => setWebhookAction((prev) => ({ ...prev, url: event.target.value }))}
                  disabled={!webhookAction.enabled}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" className="gap-2" onClick={() => void onSaveRule()} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {selectedRuleId === 'new' ? 'Vytvořit pravidlo' : 'Uložit změny'}
              </Button>
              <Button type="button" variant="outline" className="gap-2" onClick={() => void onRunTest()} disabled={runningTest}>
                {runningTest ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                Test run
              </Button>
              <Badge variant="outline">Rules: {rules.length}</Badge>
              <Badge variant="outline">Active: {activeRules}</Badge>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="test-payload">Test payload JSON</Label>
              <Textarea
                id="test-payload"
                rows={6}
                value={testPayloadJson}
                onChange={(event) => setTestPayloadJson(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rules.length === 0 ? (
                <div className="text-sm text-muted-foreground">Žádná pravidla.</div>
              ) : (
                rules.slice(0, 40).map((rule) => {
                  const active = rule.is_active === true || rule.is_active === 1;
                  return (
                    <div key={rule.id} className="rounded-md border p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          className="text-left text-sm font-medium hover:underline"
                          onClick={() => hydrateEditorFromRule(rule)}
                        >
                          {rule.name}
                        </button>
                        <Switch checked={active} onCheckedChange={() => void onToggleRuleActive(rule)} />
                      </div>
                      <div className="text-xs text-muted-foreground">{rule.event_type}</div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="size-4" />
                Verze & rollback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedRuleId === 'new' ? (
                <div className="text-sm text-muted-foreground">Vyber existující pravidlo pro historii verzí.</div>
              ) : selectedHistory.length === 0 ? (
                <div className="text-sm text-muted-foreground">Zatím bez uložených lokálních verzí.</div>
              ) : (
                selectedHistory.map((snapshot) => (
                  <div key={snapshot.snapshotId} className="rounded-md border p-2">
                    <div className="text-sm font-medium">{snapshot.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {snapshot.eventType} • {new Date(snapshot.createdAt).toLocaleString('cs-CZ')}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-2 gap-2"
                      onClick={() => void onRollback(snapshot)}
                      disabled={saving}
                    >
                      <RotateCcw className="size-4" />
                      Rollback
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {audit.length === 0 ? (
            <div className="text-sm text-muted-foreground">Žádné automation audit záznamy.</div>
          ) : (
            audit.slice(0, 20).map((row) => (
              <div key={row.id} className="rounded-md border p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant={row.success === 0 || row.success === false ? 'destructive' : 'secondary'}>
                    {row.success === 0 || row.success === false ? 'error' : 'ok'}
                  </Badge>
                  <div className="font-medium">{row.action || 'automation'}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {row.path || 'n/a'} • {row.method || 'n/a'} • {row.created_at || 'n/a'}
                </div>
                {row.error_message ? <div className="mt-1 text-xs text-destructive">{row.error_message}</div> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
