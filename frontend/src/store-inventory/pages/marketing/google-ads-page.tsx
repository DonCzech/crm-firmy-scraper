import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  RefreshCw,
  UploadCloud,
  WandSparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  fetchGaProperties,
  fetchGoogleAdsActiveAds,
  fetchGoogleAdsAdGroups,
  fetchGoogleAdsCampaigns,
  fetchGoogleAdsCompetitorAds,
  fetchGoogleAdsCustomers,
  fetchGoogleAdsStatus,
  generateGoogleAdsCopy,
  publishGoogleAdsCreative,
  type GaPropertyMeta,
  type GoogleAdsActiveAd,
  type GoogleAdsAdGroup,
  type GoogleAdsCampaign,
  type GoogleAdsCompetitorAdsResult,
  type GoogleAdsCustomer,
  type PublishGoogleAdsPayload,
} from '@/crm/services/backend';

type AdType = 'search' | 'display_image';

type DomainDraft = PublishGoogleAdsPayload & {
  aiCampaignName: string;
  aiBrief: string;
  aiKeywordsText: string;
};

const DRAFTS_STORAGE_KEY = 'core_google_ads_domain_drafts_v2';
const LAST_DOMAIN_STORAGE_KEY = 'core_google_ads_last_domain_v1';

function normalizeCustomerId(value: string): string {
  return String(value || '').replace(/[^0-9]/g, '');
}

function createDraft(domain: GaPropertyMeta | undefined, defaultCustomerId: string): DomainDraft {
  return {
    customerId: normalizeCustomerId(defaultCustomerId),
    campaignId: '',
    adGroupId: '',
    type: 'search',
    finalUrl: (domain?.url || '').trim(),
    headline1: '',
    headline2: '',
    headline3: '',
    description1: '',
    description2: '',
    path1: '',
    path2: '',
    businessName: domain?.name || '',
    longHeadline: '',
    callToActionText: '',
    imageBase64: '',
    imageMimeType: '',
    imageFileName: '',
    status: 'PAUSED',
    aiCampaignName: '',
    aiBrief: '',
    aiKeywordsText: '',
  };
}

function sanitizeBase64(dataUrl: string): { base64: string; mime: string } {
  const m = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!m) return { base64: '', mime: '' };
  return { mime: m[1], base64: m[2] };
}

function normalizeAdsDomain(url: string): string {
  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(normalized).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return String(url || '').replace(/^https?:\/\//i, '').replace(/^www\./, '').split('/')[0].toLowerCase();
  }
}

function downloadJsonFile(fileName: string, payload: unknown) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function GoogleAdsMarketingPage() {
  const navigate = useNavigate();
  const { domainKey } = useParams<{ domainKey?: string }>();
  const [searchParams] = useSearchParams();
  const competitorSectionRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [adsLoading, setAdsLoading] = useState(false);

  const [domains, setDomains] = useState<GaPropertyMeta[]>([]);
  const [customers, setCustomers] = useState<GoogleAdsCustomer[]>([]);
  const [campaigns, setCampaigns] = useState<GoogleAdsCampaign[]>([]);
  const [adGroups, setAdGroups] = useState<GoogleAdsAdGroup[]>([]);
  const [activeAds, setActiveAds] = useState<GoogleAdsActiveAd[]>([]);
  const [competitorDomain, setCompetitorDomain] = useState('myiq.com');
  const [competitorRegion, setCompetitorRegion] = useState('ALL');
  const [competitorViewRegion, setCompetitorViewRegion] = useState('ALL');
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [competitorPolling, setCompetitorPolling] = useState(false);
  const [competitorResult, setCompetitorResult] = useState<GoogleAdsCompetitorAdsResult | null>(null);
  const [draftsByDomain, setDraftsByDomain] = useState<Record<string, DomainDraft>>({});

  const [statusInfo, setStatusInfo] = useState<{
    configured: boolean;
    missing: string[];
    loginCustomerId: string | null;
  } | null>(null);

  const defaultCustomerId = useMemo(() => {
    const fromCustomers = normalizeCustomerId(customers[0]?.id || '');
    const fromStatus = normalizeCustomerId(statusInfo?.loginCustomerId || '');
    return fromCustomers || fromStatus;
  }, [customers, statusInfo?.loginCustomerId]);

  const activeDomain = useMemo(
    () => domains.find((domain) => domain.slug === domainKey),
    [domains, domainKey],
  );

  const currentDraft = useMemo(() => {
    if (!activeDomain) return createDraft(undefined, defaultCustomerId);
    return draftsByDomain[activeDomain.slug] || createDraft(activeDomain, defaultCustomerId);
  }, [activeDomain, draftsByDomain, defaultCustomerId]);

  const keywordList = useMemo(
    () =>
      (currentDraft.aiKeywordsText || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    [currentDraft.aiKeywordsText],
  );

  function updateDraft(patch: Partial<DomainDraft>) {
    if (!activeDomain) return;
    setDraftsByDomain((prev) => {
      const current = prev[activeDomain.slug] || createDraft(activeDomain, defaultCustomerId);
      return {
        ...prev,
        [activeDomain.slug]: {
          ...current,
          ...patch,
        },
      };
    });
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [statusRes, customersRes, gaRes] = await Promise.allSettled([
          fetchGoogleAdsStatus(),
          fetchGoogleAdsCustomers(),
          fetchGaProperties(),
        ]);
        if (!mounted) return;

        const status =
          statusRes.status === 'fulfilled'
            ? statusRes.value
            : { configured: false, missingEnv: ['GOOGLE_ADS API status nedostupný'], loginCustomerId: null };
        const customerRows = customersRes.status === 'fulfilled' ? customersRes.value : [];
        const gaRows = gaRes.status === 'fulfilled' ? gaRes.value : [];

        const sortedDomains = [...gaRows].sort((a, b) => a.name.localeCompare(b.name, 'cs'));
        setDomains(sortedDomains);
        setCustomers(customerRows);
        setStatusInfo({
          configured: status.configured,
          missing: status.missingEnv,
          loginCustomerId: status.loginCustomerId || null,
        });

        let storedDrafts: Record<string, DomainDraft> = {};
        if (typeof window !== 'undefined') {
          try {
            const raw = window.localStorage.getItem(DRAFTS_STORAGE_KEY);
            if (raw) {
              const parsed = JSON.parse(raw) as unknown;
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                storedDrafts = parsed as Record<string, DomainDraft>;
              }
            }
          } catch {
            storedDrafts = {};
          }
        }

        const fallbackCustomerId = normalizeCustomerId(customerRows[0]?.id || status.loginCustomerId || '');
        const nextDrafts: Record<string, DomainDraft> = {};
        for (const domain of sortedDomains) {
          const base = createDraft(domain, fallbackCustomerId);
          const fromStorage = storedDrafts[domain.slug];
          nextDrafts[domain.slug] = fromStorage ? { ...base, ...fromStorage } : base;
        }
        setDraftsByDomain(nextDrafts);

        const storedDomain = typeof window !== 'undefined' ? window.localStorage.getItem(LAST_DOMAIN_STORAGE_KEY) || '' : '';
        const routeDomain = domainKey || '';
        const preferred = sortedDomains.some((domain) => domain.slug === routeDomain)
          ? routeDomain
          : sortedDomains.some((domain) => domain.slug === storedDomain)
            ? storedDomain
            : sortedDomains[0]?.slug || '';

        if (preferred && preferred !== routeDomain) {
          navigate(`/core/marketing/${encodeURIComponent(preferred)}`, { replace: true });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Nepodařilo se načíst marketing velín.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(draftsByDomain));
  }, [draftsByDomain]);

  useEffect(() => {
    if (!activeDomain || typeof window === 'undefined') return;
    window.localStorage.setItem(LAST_DOMAIN_STORAGE_KEY, activeDomain.slug);
  }, [activeDomain]);

  useEffect(() => {
    if (!activeDomain || !currentDraft.customerId) return;
    let mounted = true;

    (async () => {
      try {
        const rows = await fetchGoogleAdsCampaigns(currentDraft.customerId);
        if (!mounted) return;
        setCampaigns(rows);

        const hasCurrent = rows.some((campaign) => campaign.id === currentDraft.campaignId);
        const nextCampaignId = hasCurrent ? currentDraft.campaignId : rows[0]?.id || '';
        if (nextCampaignId !== currentDraft.campaignId) {
          updateDraft({ campaignId: nextCampaignId, adGroupId: '' });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Nepodařilo se načíst kampaně.');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeDomain?.slug, currentDraft.customerId]);

  useEffect(() => {
    if (!activeDomain || !currentDraft.customerId || !currentDraft.campaignId) {
      setAdGroups([]);
      return;
    }
    let mounted = true;

    (async () => {
      try {
        const rows = await fetchGoogleAdsAdGroups(currentDraft.customerId, currentDraft.campaignId);
        if (!mounted) return;
        setAdGroups(rows);

        const hasCurrent = rows.some((adGroup) => adGroup.id === currentDraft.adGroupId);
        const nextAdGroupId = hasCurrent ? currentDraft.adGroupId : rows[0]?.id || '';
        if (nextAdGroupId !== currentDraft.adGroupId) {
          updateDraft({ adGroupId: nextAdGroupId });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Nepodařilo se načíst ad groupy.');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeDomain?.slug, currentDraft.customerId, currentDraft.campaignId]);

  useEffect(() => {
    if (!activeDomain || !currentDraft.customerId) {
      setActiveAds([]);
      return;
    }
    let mounted = true;
    setAdsLoading(true);

    (async () => {
      try {
        const rows = await fetchGoogleAdsActiveAds(currentDraft.customerId, activeDomain.url);
        if (!mounted) return;
        setActiveAds(rows);
      } catch (error) {
        if (mounted) {
          setActiveAds([]);
          toast.error(error instanceof Error ? error.message : 'Nepodařilo se načíst aktivní reklamy.');
        }
      } finally {
        if (mounted) setAdsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeDomain?.slug, activeDomain?.url, currentDraft.customerId]);

  const canPublish = useMemo(() => {
    if (!currentDraft.customerId || !currentDraft.campaignId || !currentDraft.adGroupId || !currentDraft.finalUrl) {
      return false;
    }
    if (currentDraft.type === 'search') {
      return Boolean(currentDraft.headline1 && currentDraft.headline2 && currentDraft.description1);
    }
    return Boolean(
      currentDraft.headline1 &&
        currentDraft.longHeadline &&
        currentDraft.description1 &&
        currentDraft.businessName &&
        currentDraft.imageBase64,
    );
  }, [currentDraft]);

  async function onPublish() {
    if (!canPublish) {
      toast.error('Doplňte povinná pole reklamy.');
      return;
    }
    setPublishing(true);
    try {
      const result = await publishGoogleAdsCreative({
        customerId: currentDraft.customerId,
        campaignId: currentDraft.campaignId,
        adGroupId: currentDraft.adGroupId,
        type: currentDraft.type,
        finalUrl: currentDraft.finalUrl,
        headline1: currentDraft.headline1,
        headline2: currentDraft.headline2,
        headline3: currentDraft.headline3,
        description1: currentDraft.description1,
        description2: currentDraft.description2,
        path1: currentDraft.path1,
        path2: currentDraft.path2,
        businessName: currentDraft.businessName,
        longHeadline: currentDraft.longHeadline,
        callToActionText: currentDraft.callToActionText,
        imageBase64: currentDraft.imageBase64,
        imageMimeType: currentDraft.imageMimeType,
        imageFileName: currentDraft.imageFileName,
        status: currentDraft.status,
      });
      toast.success(`Publikováno. Resource: ${result.resourceName}`);
      if (activeDomain?.url && currentDraft.customerId) {
        const rows = await fetchGoogleAdsActiveAds(currentDraft.customerId, activeDomain.url);
        setActiveAds(rows);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Publikace do Google Ads selhala.');
    } finally {
      setPublishing(false);
    }
  }

  async function onGenerateWithAi() {
    const campaignName = (currentDraft.aiCampaignName || '').trim();
    const brief = (currentDraft.aiBrief || '').trim();
    if (!campaignName) {
      toast.error('Pro AI je povinný název kampaně.');
      return;
    }
    if (!brief) {
      toast.error('Pro AI je povinný popis kampaně/produktu.');
      return;
    }

    setGenerating(true);
    try {
      const result = await generateGoogleAdsCopy({
        adType: currentDraft.type,
        campaignName,
        brief,
        domainName: activeDomain?.name || activeDomain?.slug || '',
        finalUrl: currentDraft.finalUrl,
      });

      updateDraft({
        headline1: result.headlines[0] || currentDraft.headline1,
        headline2: result.headlines[1] || currentDraft.headline2,
        headline3: result.headlines[2] || currentDraft.headline3,
        description1: result.descriptions[0] || currentDraft.description1,
        description2: result.descriptions[1] || currentDraft.description2,
        longHeadline: result.longHeadline || currentDraft.longHeadline,
        businessName: result.businessName || currentDraft.businessName,
        callToActionText: result.callToActionText || currentDraft.callToActionText,
        aiKeywordsText: result.keywords.join(', '),
      });

      toast.success('AI návrh reklamy byl vygenerován.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AI generování selhalo.');
    } finally {
      setGenerating(false);
    }
  }

  async function onImageSelect(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = typeof reader.result === 'string' ? reader.result : '';
      const normalized = sanitizeBase64(raw);
      if (!normalized.base64) {
        toast.error('Nepodařilo se načíst obrázek.');
        return;
      }
      updateDraft({
        imageBase64: normalized.base64,
        imageMimeType: normalized.mime,
        imageFileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  }

  async function onLoadCompetitorAds(refresh = false) {
    const domain = normalizeAdsDomain(competitorDomain);
    if (!domain) {
      toast.error('Zadejte doménu konkurence.');
      return;
    }
    setCompetitorLoading(true);
    try {
      const data = await fetchGoogleAdsCompetitorAds({
        domain,
        region: competitorRegion,
        limit: 500,
        refresh,
      });
      setCompetitorResult(data);
      setCompetitorPolling(Boolean(data.refreshStatus?.running));
      const scanned = Array.from(
        new Set(
          (data.scannedRegions && data.scannedRegions.length > 0
            ? data.scannedRegions
            : data.ads.map((ad) => ad.sourceRegion || '')
          )
            .map((v) => String(v || '').toUpperCase())
            .filter(Boolean),
        ),
      );
      if (competitorViewRegion !== 'ALL' && scanned.length > 0 && !scanned.includes(competitorViewRegion)) {
        setCompetitorViewRegion('ALL');
      }
      if (data.total === 0) {
        toast.message(
          refresh && data.refreshStatus?.running
            ? `Spuštěn background scraping pro ${domain}. Zobrazuji aktuální DB snapshot.`
            : `Pro ${domain} nebyly nalezené reklamy.`,
        );
      } else {
        toast.success(
          refresh && data.refreshStatus?.running
            ? `Spuštěn background scraping pro ${domain} (${data.total} reklam aktuálně v DB).`
            : refresh
            ? `Aktualizováno ${data.total} reklam pro ${domain}.`
            : `Načteno ${data.total} reklam pro ${domain} z databáze.`,
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nepodařilo se načíst reklamy konkurence.');
    } finally {
      setCompetitorLoading(false);
    }
  }

  const selectedDomainValue = activeDomain?.slug || '';

  const competitorAvailableRegions = useMemo(() => {
    if (!competitorResult) return [] as string[];
    const fromRows = competitorResult.ads
      .map((ad) => (ad.sourceRegion || '').toUpperCase())
      .filter(Boolean);
    const merged = Array.from(new Set([...(competitorResult.scannedRegions || []), ...fromRows])).sort();
    return merged;
  }, [competitorResult]);

  const competitorDisplayedAds = useMemo(() => {
    if (!competitorResult) return [] as typeof competitorResult.ads;
    if (competitorViewRegion === 'ALL') return competitorResult.ads;
    return competitorResult.ads.filter((ad) => (ad.sourceRegion || '').toUpperCase() === competitorViewRegion);
  }, [competitorResult, competitorViewRegion]);

  useEffect(() => {
    if (!competitorResult?.refreshStatus?.running) {
      setCompetitorPolling(false);
      return;
    }
    let cancelled = false;
    setCompetitorPolling(true);

    const poll = async () => {
      try {
        const data = await fetchGoogleAdsCompetitorAds({
          domain: competitorResult.domain,
          region: competitorResult.region,
          limit: 500,
          refresh: false,
        });
        if (cancelled) return;
        setCompetitorResult(data);
        if (!data.refreshStatus?.running) {
          setCompetitorPolling(false);
          toast.success(`Background scraping dokončen (${data.total} reklam).`);
        }
      } catch {
        // keep previous data, next poll will retry
      }
    };

    const timer = window.setInterval(() => void poll(), 6000);
    const first = window.setTimeout(() => void poll(), 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.clearTimeout(first);
    };
  }, [competitorResult?.domain, competitorResult?.region, competitorResult?.refreshStatus?.running]);

  useEffect(() => {
    const tab = (searchParams.get('tab') || '').toLowerCase();
    if (tab !== 'competitor') return;
    const timer = window.setTimeout(() => {
      competitorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Načítám Google Ads velín...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Megaphone className="size-5" />
            Marketing - Google Ads
          </h1>
          <p className="text-sm text-muted-foreground">
            Vyberte doménu. Každá doména má vlastní stránku a vlastní reklamy.
          </p>
        </div>
        {statusInfo?.configured ? (
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">API připojeno</Badge>
        ) : (
          <Badge variant="outline" className="border-amber-400 text-amber-700">Chybí konfigurace</Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Doména</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block mb-1 text-muted-foreground">Výběr domény (GA projekty)</span>
            <select
              className="w-full rounded border bg-background px-3 py-2 text-sm"
              value={selectedDomainValue}
              onChange={(e) => {
                const slug = e.target.value;
                if (!slug) return;
                navigate(`/core/marketing/${encodeURIComponent(slug)}`);
              }}
            >
              <option value="">Vyberte doménu</option>
              {domains.map((domain) => (
                <option key={domain.slug} value={domain.slug}>
                  {domain.name} ({normalizeAdsDomain(domain.url)})
                </option>
              ))}
            </select>
          </label>
          {activeDomain ? (
            <div className="text-sm rounded border bg-muted/30 px-3 py-2">
              <p className="font-medium">{activeDomain.name}</p>
              <a
                href={activeDomain.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
              >
                {activeDomain.url}
                <ExternalLink className="size-3" />
              </a>
            </div>
          ) : (
            <div className="text-sm rounded border bg-muted/30 px-3 py-2 text-muted-foreground">Vyberte doménu.</div>
          )}
        </CardContent>
      </Card>

      {!statusInfo?.configured && (
        <Card className="border-amber-300 bg-amber-50/40">
          <CardContent className="pt-5 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="size-4 mt-0.5" />
              <div>
                <p className="font-medium">Google Ads API není plně nakonfigurované.</p>
                <p>Chybějící ENV: {statusInfo?.missing.join(', ') || 'n/a'}</p>
                <p className="mt-1">Monitoring konkurence níže funguje i bez těchto Google Ads API klíčů.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(
        <>
          {activeDomain && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aktivní reklamy pro doménu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="text-sm block max-w-[360px]">
                <span className="block mb-1 text-muted-foreground">Google Ads účet</span>
                <select
                  className="w-full rounded border bg-background px-3 py-2 text-sm"
                  value={currentDraft.customerId}
                  onChange={(e) =>
                    updateDraft({
                      customerId: normalizeCustomerId(e.target.value),
                      campaignId: '',
                      adGroupId: '',
                    })
                  }
                >
                  <option value="">Vyberte účet</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.descriptiveName || customer.id} ({customer.id})
                    </option>
                  ))}
                </select>
                <input
                  className="mt-2 w-full rounded border bg-background px-3 py-2 text-sm"
                  value={currentDraft.customerId}
                  onChange={(e) =>
                    updateDraft({
                      customerId: normalizeCustomerId(e.target.value),
                      campaignId: '',
                      adGroupId: '',
                    })
                  }
                  placeholder="Ručně customer ID (např. 5028422500)"
                  inputMode="numeric"
                />
              </label>

              {adsLoading ? (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Načítám aktivní reklamy...
                </div>
              ) : activeAds.length === 0 ? (
                <p className="text-sm text-muted-foreground">Pro tuto doménu nejsou v daném účtu nalezené aktivní reklamy.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {activeAds.map((ad) => (
                    <Card key={`${ad.campaign.id}-${ad.adId}`} className="border">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{ad.campaign.name}</p>
                            <p className="text-xs text-muted-foreground">{ad.adGroup.name}</p>
                          </div>
                          <Badge variant="secondary">{ad.adType}</Badge>
                        </div>

                        {ad.imageUrls.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {ad.imageUrls.slice(0, 4).map((url) => (
                              <a href={url} target="_blank" rel="noreferrer" key={url} className="block rounded border overflow-hidden">
                                <img src={url} alt="Ad visual" className="w-full h-24 object-cover" loading="lazy" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <ImageIcon className="size-3" /> Bez obrázku
                          </div>
                        )}

                        {ad.headlines.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">Nadpisy</p>
                            <div className="flex flex-wrap gap-1">
                              {ad.headlines.slice(0, 6).map((headline, idx) => (
                                <Badge key={`${ad.adId}-h-${idx}`} variant="outline">{headline}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {ad.descriptions.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">Popisy</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {ad.descriptions.slice(0, 3).map((description, idx) => (
                                <li key={`${ad.adId}-d-${idx}`}>• {description}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {ad.finalUrls.length > 0 && (
                          <a
                            href={ad.finalUrls[0]}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
                          >
                            Cílová URL
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          )}

          <Card ref={competitorSectionRef} id="competitor-tab">
            <CardHeader>
              <CardTitle className="text-base">Monitoring konkurence (Google Ads Transparency)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <label className="text-sm md:col-span-2">
                  <span className="block mb-1 text-muted-foreground">Konkurenční doména</span>
                  <input
                    value={competitorDomain}
                    onChange={(e) => setCompetitorDomain(e.target.value)}
                    className="w-full rounded border bg-background px-3 py-2 text-sm"
                    placeholder="myiq.com"
                  />
                </label>
                <label className="text-sm">
                  <span className="block mb-1 text-muted-foreground">Region (ISO2)</span>
                  <select
                    value={competitorRegion}
                    onChange={(e) => setCompetitorRegion(e.target.value)}
                    className="w-full rounded border bg-background px-3 py-2 text-sm"
                  >
                    <option value="ANYWHERE">ANYWHERE (1 request, vše najednou)</option>
                    <option value="ALL">ALL (iteruje 24 regionů)</option>
                    <option value="CZ">CZ</option>
                    <option value="DE">DE</option>
                    <option value="SK">SK</option>
                    <option value="AT">AT</option>
                    <option value="PL">PL</option>
                    <option value="GB">GB</option>
                    <option value="US">US</option>
                    <option value="FR">FR</option>
                    <option value="IT">IT</option>
                    <option value="ES">ES</option>
                    <option value="NL">NL</option>
                  </select>
                </label>
                <div className="flex items-end gap-2">
                  <Button onClick={() => void onLoadCompetitorAds(false)} disabled={competitorLoading} variant="outline" className="w-full">
                    {competitorLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Megaphone className="size-4 mr-2" />}
                    Načíst z databáze
                  </Button>
                  <Button onClick={() => void onLoadCompetitorAds(true)} disabled={competitorLoading} className="w-full">
                    {competitorLoading || competitorPolling ? <Loader2 className="size-4 mr-2 animate-spin" /> : <RefreshCw className="size-4 mr-2" />}
                    Aktualizovat scraping
                  </Button>
                </div>
              </div>

              {competitorResult && (
                <>
                  <div className="rounded border bg-muted/30 px-3 py-2 text-sm flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {competitorResult.domain} • {competitorResult.total} reklam • region {competitorResult.region}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Načteno: {new Date(competitorResult.fetchedAt).toLocaleString('cs-CZ')}
                        {competitorResult.cached ? ' (cache)' : ''}
                      </p>
                      {competitorResult.sync && (
                        <p className="text-xs text-muted-foreground">
                          Sync: +{competitorResult.sync.inserted} new, ~{competitorResult.sync.updated} updated, ={competitorResult.sync.unchanged} unchanged ({competitorResult.sync.source})
                        </p>
                      )}
                      {competitorResult.refreshStatus && (
                        <p className="text-xs text-muted-foreground">
                          Refresh: {competitorResult.refreshStatus.running ? 'běží' : 'hotovo'} • {competitorResult.refreshStatus.processedRegions}/{competitorResult.refreshStatus.totalRegions} regionů
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadJsonFile(`competitor-ads-${competitorResult.domain}-${competitorResult.region}.json`, competitorResult)}
                    >
                      <Download className="size-4 mr-2" />
                      Export JSON
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <label className="text-sm">
                      <span className="block mb-1 text-muted-foreground">Filtr zobrazení regionu</span>
                      <select
                        value={competitorViewRegion}
                        onChange={(e) => setCompetitorViewRegion(e.target.value)}
                        className="w-full rounded border bg-background px-3 py-2 text-sm"
                      >
                        <option value="ALL">ALL</option>
                        {competitorAvailableRegions.map((region) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </label>
                    <div className="text-xs text-muted-foreground md:col-span-2">
                      Zobrazeno: {competitorDisplayedAds.length} / {competitorResult.total}
                    </div>
                  </div>

                  {competitorResult.limitations.length > 0 && (
                    <div className="rounded border border-amber-300 bg-amber-50/50 p-3 text-xs text-amber-900 space-y-1">
                      {competitorResult.limitations.map((line) => (
                        <p key={line}>• {line}</p>
                      ))}
                    </div>
                  )}

                  {competitorDisplayedAds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nebyly nalezené žádné reklamy pro zadanou doménu.</p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {competitorDisplayedAds.map((ad) => (
                        <Card key={ad.adId} className="border">
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold">{ad.advertiserName || competitorResult.domain}</p>
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary">{ad.adType}</Badge>
                                {ad.sourceRegion && <Badge variant="outline">{ad.sourceRegion}</Badge>}
                                <Badge variant={ad.isActive === false ? 'outline' : 'default'}>
                                  {ad.isActive === false ? 'INACTIVE' : 'ACTIVE'}
                                </Badge>
                              </div>
                            </div>

                        {ad.imageUrls.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {ad.imageUrls.slice(0, 4).map((url) => (
                              <div key={url} className="block rounded border overflow-hidden">
                                <img src={url} alt="Competitor ad visual" className="w-full h-24 object-cover" loading="lazy" />
                              </div>
                            ))}
                          </div>
                        ) : (
                              <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                                <ImageIcon className="size-3" /> Bez obrázku
                              </div>
                            )}

                            {ad.headlines.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1">Texty reklamy</p>
                                <div className="flex flex-wrap gap-1">
                                  {ad.headlines.slice(0, 6).map((headline, idx) => (
                                    <Badge key={`${ad.adId}-hc-${idx}`} variant="outline">{headline}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {ad.descriptions.length > 0 && (
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {ad.descriptions.slice(0, 3).map((description, idx) => (
                                  <li key={`${ad.adId}-dc-${idx}`}>• {description}</li>
                                ))}
                              </ul>
                            )}

                            {(ad.placements.length > 0 || ad.regions.length > 0) && (
                              <div className="space-y-1">
                                {ad.regions.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {ad.regions.slice(0, 8).map((region) => (
                                      <Badge key={`${ad.adId}-r-${region}`} variant="secondary">{region}</Badge>
                                    ))}
                                  </div>
                                )}
                                {ad.placements.length > 0 && (
                                  <ul className="text-xs text-muted-foreground space-y-1">
                                    {ad.placements.slice(0, 4).map((placement, idx) => (
                                      <li key={`${ad.adId}-p-${idx}`}>• {placement}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}

                            {ad.landingPageUrls[0] && (
                              <a
                                href={ad.landingPageUrls[0]}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
                              >
                                Cílová URL
                                <ExternalLink className="size-3" />
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {activeDomain && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vytvořit reklamu pro tuto doménu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  value={currentDraft.aiCampaignName}
                  onChange={(e) => updateDraft({ aiCampaignName: e.target.value })}
                  className="rounded border bg-background px-3 py-2 text-sm"
                  placeholder="Povinné pro AI: název kampaně"
                />
                <select
                  className="rounded border bg-background px-3 py-2 text-sm"
                  value={currentDraft.type}
                  onChange={(e) => updateDraft({ type: e.target.value as AdType })}
                >
                  <option value="search">PPC textová (Responsive Search)</option>
                  <option value="display_image">Obrázková (Responsive Display)</option>
                </select>
              </div>

              <textarea
                value={currentDraft.aiBrief}
                onChange={(e) => updateDraft({ aiBrief: e.target.value })}
                className="w-full rounded border bg-background px-3 py-2 text-sm min-h-[92px]"
                placeholder="Povinné pro AI: popis nabídky, cílovka, benefity, ton komunikace"
              />

              <div className="flex items-center justify-end">
                <Button onClick={onGenerateWithAi} disabled={generating} variant="secondary">
                  {generating ? <Loader2 className="size-4 mr-2 animate-spin" /> : <WandSparkles className="size-4 mr-2" />}
                  Generovat přes AI
                </Button>
              </div>

              {keywordList.length > 0 && (
                <div className="rounded-md border p-3">
                  <p className="text-xs font-medium mb-2">AI klíčová slova</p>
                  <div className="flex flex-wrap gap-1">
                    {keywordList.slice(0, 24).map((keyword) => (
                      <Badge key={keyword} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="text-sm">
                  <span className="block mb-1 text-muted-foreground">Kampaň</span>
                  <select
                    className="w-full rounded border bg-background px-3 py-2 text-sm"
                    value={currentDraft.campaignId}
                    onChange={(e) => updateDraft({ campaignId: e.target.value, adGroupId: '' })}
                  >
                    <option value="">Vyberte kampaň</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="block mb-1 text-muted-foreground">Ad group</span>
                  <select
                    className="w-full rounded border bg-background px-3 py-2 text-sm"
                    value={currentDraft.adGroupId}
                    onChange={(e) => updateDraft({ adGroupId: e.target.value })}
                  >
                    <option value="">Vyberte ad group</option>
                    {adGroups.map((adGroup) => (
                      <option key={adGroup.id} value={adGroup.id}>{adGroup.name}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="block mb-1 text-muted-foreground">Final URL</span>
                  <input
                    value={currentDraft.finalUrl || ''}
                    onChange={(e) => updateDraft({ finalUrl: e.target.value })}
                    className="w-full rounded border bg-background px-3 py-2 text-sm"
                    placeholder="https://vas-web.cz/landing"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={currentDraft.headline1 || ''} onChange={(e) => updateDraft({ headline1: e.target.value })} className="rounded border bg-background px-3 py-2 text-sm" placeholder="Headline 1" />
                <input value={currentDraft.headline2 || ''} onChange={(e) => updateDraft({ headline2: e.target.value })} className="rounded border bg-background px-3 py-2 text-sm" placeholder="Headline 2" />
                <input value={currentDraft.headline3 || ''} onChange={(e) => updateDraft({ headline3: e.target.value })} className="rounded border bg-background px-3 py-2 text-sm" placeholder="Headline 3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={currentDraft.description1 || ''} onChange={(e) => updateDraft({ description1: e.target.value })} className="rounded border bg-background px-3 py-2 text-sm" placeholder="Description 1" />
                <input value={currentDraft.description2 || ''} onChange={(e) => updateDraft({ description2: e.target.value })} className="rounded border bg-background px-3 py-2 text-sm" placeholder="Description 2" />
              </div>

              {currentDraft.type === 'search' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input value={currentDraft.path1 || ''} onChange={(e) => updateDraft({ path1: e.target.value })} className="rounded border bg-background px-3 py-2 text-sm" placeholder="Path 1" />
                  <input value={currentDraft.path2 || ''} onChange={(e) => updateDraft({ path2: e.target.value })} className="rounded border bg-background px-3 py-2 text-sm" placeholder="Path 2" />
                  <select
                    className="rounded border bg-background px-3 py-2 text-sm"
                    value={currentDraft.status || 'PAUSED'}
                    onChange={(e) => updateDraft({ status: e.target.value as 'PAUSED' | 'ENABLED' })}
                  >
                    <option value="PAUSED">Pauznout (doporučeno)</option>
                    <option value="ENABLED">Hned zapnout</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input value={currentDraft.businessName || ''} onChange={(e) => updateDraft({ businessName: e.target.value })} className="rounded border bg-background px-3 py-2 text-sm" placeholder="Název firmy" />
                    <input value={currentDraft.longHeadline || ''} onChange={(e) => updateDraft({ longHeadline: e.target.value })} className="rounded border bg-background px-3 py-2 text-sm" placeholder="Long headline" />
                    <input value={currentDraft.callToActionText || ''} onChange={(e) => updateDraft({ callToActionText: e.target.value })} className="rounded border bg-background px-3 py-2 text-sm" placeholder="CTA text" />
                  </div>
                  <label className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-sm">
                    <UploadCloud className="size-5 text-muted-foreground" />
                    <span>{currentDraft.imageFileName ? `Nahráno: ${currentDraft.imageFileName}` : 'Nahrajte obrázek reklamy'}</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => void onImageSelect(e.target.files?.[0] || null)} />
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end">
                <Button onClick={onPublish} disabled={!canPublish || publishing}>
                  {publishing ? <Loader2 className="size-4 mr-2 animate-spin" /> : <CheckCircle2 className="size-4 mr-2" />}
                  Publikovat reklamu
                </Button>
              </div>
            </CardContent>
          </Card>
          )}
        </>
      )}
    </div>
  );
}
