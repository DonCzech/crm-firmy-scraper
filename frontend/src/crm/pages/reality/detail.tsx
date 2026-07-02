import { useCallback, useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Building,
  ExternalLink,
  Landmark,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  RotateCcw,
  User,
  Clock,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import {
  BackendExternalListing,
  fetchRealityListing,
} from '../../services/backend';

const STATE_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  RESERVED: 'bg-yellow-100 text-yellow-800',
  SOLD: 'bg-blue-100 text-blue-800',
  REMOVED: 'bg-gray-100 text-gray-500',
};
const DETAIL_CACHE_KEY = 'reality-detail-cache-v1';

function formatPrice(price: number | null | undefined): string {
  if (price == null) return '-';
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function parsePhones(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    // not JSON, try as plain string
  }
  return raw ? [raw] : [];
}

export function RealityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const reservedRoute = id === 'bezrealitky'
    ? '../reality/bezrealitky'
    : id === 'bazos'
      ? '../reality/bazos'
      : id === 'stats-scrape'
        ? '../reality/stats-scrape'
        : null;

  const [listing, setListing] = useState<BackendExternalListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [staleFromCache, setStaleFromCache] = useState(false);

  const persistDetailCache = useCallback((item: BackendExternalListing) => {
    try {
      const raw = localStorage.getItem(DETAIL_CACHE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Record<string, BackendExternalListing>) : {};
      const next: Record<string, BackendExternalListing> = {
        ...parsed,
        [item.id]: item,
      };
      const entries = Object.entries(next).slice(-60);
      localStorage.setItem(DETAIL_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
    } catch {
      // ignore cache write errors
    }
  }, []);

  const restoreFromDetailCache = useCallback((listingId: string): boolean => {
    try {
      const raw = localStorage.getItem(DETAIL_CACHE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as Record<string, BackendExternalListing>;
      const cachedListing = parsed?.[listingId];
      if (!cachedListing) return false;
      setListing(cachedListing);
      return true;
    } catch {
      return false;
    }
  }, []);

  const restoreFromCache = useCallback((listingId: string): boolean => {
    if (restoreFromDetailCache(listingId)) return true;
    try {
      const raw = localStorage.getItem('reality-last-good-page');
      if (!raw) return false;
      const cached = JSON.parse(raw) as { listings?: BackendExternalListing[] };
      if (!Array.isArray(cached?.listings) || cached.listings.length === 0) return false;
      const cachedListing = cached.listings.find((item) => item.id === listingId);
      if (!cachedListing) return false;
      setListing(cachedListing);
      return true;
    } catch {
      return false;
    }
  }, [restoreFromDetailCache]);

  const loadListing = useCallback(async () => {
    if (!id || reservedRoute) return;
    setLoading(true);
    try {
      const data = await fetchRealityListing(id);
      setListing(data);
      persistDetailCache(data);
      setLoadError(null);
      setStaleFromCache(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nepodařilo se načíst detail inzerátu.';
      logFrontendError({
        area: 'crm-reality-detail',
        message,
        meta: { listingId: id || '', operation: 'load_reality_detail' },
      });
      const restored = restoreFromCache(id);
      if (restored) {
        setLoadError('Backend je dočasně nedostupný. Zobrazuji poslední uložená data.');
        setStaleFromCache(true);
      } else {
        setListing(null);
        setLoadError(message);
        setStaleFromCache(false);
      }
    } finally {
      setLoading(false);
    }
  }, [id, persistDetailCache, reservedRoute, restoreFromCache]);

  useEffect(() => {
    if (reservedRoute) return;
    void loadListing();
  }, [loadListing, reservedRoute]);

  if (reservedRoute) {
    return <Navigate to={reservedRoute} replace />;
  }

  if (loading) {
    return (
      <>
        <ContentHeader>
          <h1 className="text-sm font-semibold">Načítání...</h1>
        </ContentHeader>
        <Content>
          <div className="p-8 text-center text-muted-foreground">Načítám detail inzerátu...</div>
        </Content>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <ContentHeader>
          <h1 className="text-sm font-semibold">Nenalezeno</h1>
        </ContentHeader>
        <Content>
          <div className="p-8 text-center text-muted-foreground">
            {loadError ? `Detail inzerátu není dostupný. ${loadError}` : 'Inzerát nebyl nalezen.'}
            <br />
            {loadError && (
              <Button size="sm" variant="outline" className="mt-2" onClick={() => void loadListing()}>
                Zkusit znovu
              </Button>
            )}
            <br />
            <Link to="../reality" className="text-primary hover:underline mt-2 inline-block">
              Zpět na seznam
            </Link>
          </div>
        </Content>
      </>
    );
  }

  const priceDiff =
    listing.originalPrice > 0
      ? ((listing.currentPrice - listing.originalPrice) / listing.originalPrice) * 100
      : null;

  const daysOnMarket = Math.round(
    (new Date(listing.soldAt ?? Date.now()).getTime() - new Date(listing.firstSeenAt).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const phones = parsePhones(listing.contactPhone);
  const createdAtMs = new Date(listing.createdAt).getTime();
  const updatedAtMs = new Date(listing.updatedAt).getTime();
  const hasSystemUpdateEvent =
    Number.isFinite(createdAtMs) &&
    Number.isFinite(updatedAtMs) &&
    updatedAtMs - createdAtMs > 60 * 1000;

  const systemEvents: Array<{
    id: string;
    at: string;
    label: string;
    className: string;
    icon: typeof PlusCircle;
  }> = [
    {
      id: 'system-created',
      at: listing.createdAt,
      label: 'Inzerát vytvořen v databázi',
      className: 'text-emerald-700',
      icon: PlusCircle,
    },
  ];

  if (hasSystemUpdateEvent) {
    systemEvents.push({
      id: 'system-updated',
      at: listing.updatedAt,
      label: 'Inzerát aktualizován',
      className: 'text-sky-700',
      icon: RotateCcw,
    });
  }

  if ((listing.listingState || '').toUpperCase() !== 'ACTIVE') {
    systemEvents.push({
      id: 'system-archived',
      at: listing.updatedAt || listing.lastSeenAt,
      label: `Inzerát změnil stav na ${listing.listingState}`,
      className: 'text-amber-700',
      icon: Archive,
    });
  }

  systemEvents.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  // Collect boolean features
  const features: { label: string; value: boolean }[] = [
    { label: 'Garáž', value: listing.garage },
    { label: 'Výtah', value: listing.elevator },
    { label: 'Balkon', value: listing.balcony },
    { label: 'Sklep', value: listing.cellar },
    { label: 'Lodžie', value: listing.loggia },
    { label: 'Parkovací místo', value: listing.parkingLot },
    { label: 'Terasa', value: listing.terrace },
  ];
  // Exclusive groups - only one value can be true
  const ownershipLabel = listing.personalOwnership
    ? 'Osobní'
    : listing.stateOwnership
      ? 'Státní/obecní'
      : listing.cooperativeOwnership
        ? 'Družstevní'
        : null;

  const furnishingLabel = listing.furnished
    ? 'Zařízené'
    : listing.partlyFurnished
      ? 'Částečně zařízené'
      : listing.unfurnished
        ? 'Nezařízené'
        : null;

  const buildingInfo: { label: string; value: boolean }[] = [
    { label: 'Panel', value: listing.panel },
    { label: 'Cihla', value: listing.brick },
    { label: 'Dřevo', value: listing.wooden },
    { label: 'Novostavba', value: listing.newBuilding },
    { label: 'Po rekonstrukci', value: listing.afterReconstruction },
    { label: 'V rekonstrukci', value: listing.inReconstruction },
    { label: 'Nízkoenergetická', value: listing.lowEnergy },
    { label: 'Bazén', value: listing.basin },
  ];

  return (
    <>
      <ContentHeader className="space-x-2">
        {staleFromCache && (
          <div className="mb-2 w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Backend je dočasně nedostupný. Detail je načten z poslední cache.
          </div>
        )}
        <div className="flex items-center gap-2">
          <Link to="../reality">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <h1 className="inline-flex items-center gap-2.5 text-sm font-semibold">
            <Landmark className="size-4 text-primary" /> {listing.title}
          </h1>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATE_COLORS[listing.listingState] ?? 'bg-gray-100'}`}
          >
            {listing.listingState}
          </span>
          {listing.longUnsold && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              <Clock className="size-3 mr-1" />
              Dlouho neprodané
            </span>
          )}
        </div>
        {listing.sourceUrl && (
          <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              <ExternalLink className="size-4" /> Sreality
            </Button>
          </a>
        )}
      </ContentHeader>

      <Content>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {/* Main info */}
          <Card className="p-4 space-y-4 lg:col-span-2">
            <h2 className="font-semibold text-sm">Přehled</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <InfoItem label="Aktuální cena" value={formatPrice(listing.currentPrice)} />
              <InfoItem label="Původní cena" value={formatPrice(listing.originalPrice)} />
              <InfoItem
                label="Změna ceny"
                value={
                  priceDiff !== null ? (
                    <span className={priceDiff < 0 ? 'text-red-600' : priceDiff > 0 ? 'text-green-600' : ''}>
                      {priceDiff < 0 ? <ArrowDown className="inline size-3" /> : priceDiff > 0 ? <ArrowUp className="inline size-3" /> : null}
                      {Math.abs(Math.round(priceDiff * 100) / 100)}%
                    </span>
                  ) : '-'
                }
              />
              <InfoItem label="Cena za m²" value={listing.pricePerM2 ? `${Math.round(listing.pricePerM2).toLocaleString('cs-CZ')} Kč` : '-'} />
              <InfoItem label="Plocha" value={listing.usableArea ? `${listing.usableArea} m²` : '-'} />
              <InfoItem label="Plocha pozemku" value={listing.landArea ? `${listing.landArea} m²` : '-'} />
              <InfoItem label="Dispozice" value={listing.disposition ?? '-'} />
              <InfoItem label="Kategorie" value={listing.categoryMain ?? '-'} />
              <InfoItem label="Typ nabídky" value={listing.categoryType ?? '-'} />
              <InfoItem label="Kraj" value={listing.region ?? '-'} />
              <InfoItem
                label="Lokalita"
                value={listing.locality ? (
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {listing.locality}</span>
                ) : '-'}
              />
              {listing.gpsLat && listing.gpsLon && (
                <InfoItem label="GPS" value={`${listing.gpsLat.toFixed(6)}, ${listing.gpsLon.toFixed(6)}`} />
              )}
              <InfoItem label="Počet změn ceny" value={String(listing.totalPriceChanges)} />
              <InfoItem label="Dny na trhu" value={String(daysOnMarket)} />
              <InfoItem label="Poprvé viděn" value={formatDate(listing.firstSeenAt)} />
              <InfoItem label="Naposledy viděn" value={formatDate(listing.lastSeenAt)} />
              {listing.finalPrice != null && <InfoItem label="Konečná cena" value={formatPrice(listing.finalPrice)} />}
              {listing.soldAt && <InfoItem label="Prodáno" value={formatDate(listing.soldAt)} />}
              <InfoItem label="Exkluzivní RK" value={listing.exclusiveAgency ? 'Ano' : 'Ne'} />
              <InfoItem label="RUS" value={listing.rus ? 'Ano' : 'Ne'} />
              <InfoItem label="Sreality ID" value={listing.srealityId} />
            </div>
          </Card>

          {/* Contact & Company */}
          <Card className="p-4 space-y-4">
            <h2 className="font-semibold text-sm">Kontakt & Firma</h2>

            {/* Contact */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-muted-foreground" />
                <span className="font-medium">{listing.contactName ?? '-'}</span>
                {listing.contactId && <span className="text-xs text-muted-foreground">(ID: {listing.contactId})</span>}
              </div>

              {listing.contactEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <a href={`mailto:${listing.contactEmail}`} className="text-primary hover:underline">
                    {listing.contactEmail}
                  </a>
                </div>
              )}

              {phones.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    {phones.map((p, i) => (
                      <a key={i} href={`tel:${p}`} className="text-primary hover:underline">
                        {p}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Company */}
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building className="size-4 text-muted-foreground" />
                <span className="font-medium">{listing.companyName ?? '-'}</span>
                {listing.companyId && <span className="text-xs text-muted-foreground">(ID: {listing.companyId})</span>}
              </div>
              {listing.companyUrl && (
                <a href={listing.companyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="size-3" /> Profil na Sreality
                </a>
              )}
            </div>

            {/* Price history */}
            <div className="border-t border-border pt-3">
              <h3 className="font-semibold text-sm mb-2">Cenová historie</h3>
              {listing.priceHistory && listing.priceHistory.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {listing.priceHistory.map((ph) => (
                    <div key={ph.id} className="flex items-center justify-between text-sm border-b border-border pb-1">
                      <span className="text-xs text-muted-foreground">{formatDate(ph.recordedAt)}</span>
                      <span className="font-medium">{formatPrice(ph.price)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Žádná cenová historie.</p>
              )}
            </div>
          </Card>

          {/* Features */}
          <Card className="p-4 space-y-4 lg:col-span-2">
            <h2 className="font-semibold text-sm">Vlastnosti nemovitosti</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FeatureGroup label="Vybavení" items={features} />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Zařízení</p>
                <p className="text-sm">{furnishingLabel ?? <span className="text-muted-foreground">–</span>}</p>
              </div>
              <FeatureGroup label="Stavba" items={buildingInfo} />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Vlastnictví</p>
                <p className="text-sm">{ownershipLabel ?? <span className="text-muted-foreground">–</span>}</p>
              </div>
            </div>
          </Card>

          {/* Description */}
          {listing.description && (
            <Card className="p-4 space-y-2 lg:col-span-1">
              <h2 className="font-semibold text-sm">Popis inzerátu</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed max-h-80 overflow-y-auto">
                {listing.description}
              </p>
            </Card>
          )}

          {/* Changes log */}
          <Card className="p-4 space-y-3 lg:col-span-3">
            <h2 className="font-semibold text-sm">Historie změn</h2>
            {systemEvents.length > 0 || (listing.changes && listing.changes.length > 0) ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {systemEvents.map((evt) => {
                  const Icon = evt.icon;
                  return (
                    <div key={evt.id} className="flex items-center gap-4 text-sm border-b border-border pb-1.5">
                      <span className="text-muted-foreground min-w-[140px] text-xs">{formatDate(evt.at)}</span>
                      <span className={`inline-flex items-center gap-1 font-medium ${evt.className}`}>
                        <Icon className="size-4" />
                        {evt.label}
                      </span>
                    </div>
                  );
                })}
                {listing.changes.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-4 text-sm border-b border-border pb-1.5">
                    <span className="text-muted-foreground min-w-[140px] text-xs">{formatDate(ch.changedAt)}</span>
                    <span className="font-medium min-w-[100px]">{ch.fieldName}</span>
                    <span className="text-red-500">{ch.oldValue ?? '–'}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-green-600">{ch.newValue ?? '–'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Žádné zaznamenané změny.</p>
            )}
          </Card>
        </div>
      </Content>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{typeof value === 'string' ? value : value}</p>
    </div>
  );
}

function FeatureGroup({ label, items }: { label: string; items: { label: string; value: boolean }[] }) {
  const active = items.filter((i) => i.value);
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{label}</p>
      {active.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {active.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
              <Check className="size-3" /> {item.label}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">–</p>
      )}
    </div>
  );
}
