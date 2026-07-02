import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ExternalLink,
  Home,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import { fetchBezrealitkyListingById, type BezrealitkyListingItem } from '../../services/backend';

const STATE_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  RESERVED: 'bg-yellow-100 text-yellow-800',
  SOLD: 'bg-blue-100 text-blue-800',
  REMOVED: 'bg-red-100 text-red-500',
};

const STATE_LABELS: Record<string, string> = {
  ACTIVE: 'Aktivní',
  RESERVED: 'Rezervace',
  SOLD: 'Prodáno',
  REMOVED: 'Odstraněno',
};

function formatPrice(price: number | null | undefined): string {
  if (price == null) return '-';
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
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
    // not JSON
  }
  return raw ? [raw] : [];
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-sm">{value}</p>
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

export function BezrealitkyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<BezrealitkyListingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadListing = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchBezrealitkyListingById(id);
      setListing(data);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Nepodařilo se načíst detail inzerátu.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadListing();
  }, [loadListing]);

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
            {loadError ?? 'Inzerát nebyl nalezen.'}
            <br />
            {loadError && (
              <Button size="sm" variant="outline" className="mt-2" onClick={() => void loadListing()}>
                Zkusit znovu
              </Button>
            )}
            <br />
            <Link to="../bezrealitky" className="text-primary hover:underline mt-2 inline-block">
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

  const features: { label: string; value: boolean }[] = [
    { label: 'Garáž', value: listing.garage },
    { label: 'Výtah', value: listing.elevator },
    { label: 'Balkon', value: listing.balcony },
    { label: 'Sklep', value: listing.cellar },
    { label: 'Lodžie', value: listing.loggia },
    { label: 'Parkovací místo', value: listing.parkingLot },
    { label: 'Terasa', value: listing.terrace },
  ];

  const buildingInfo: { label: string; value: boolean }[] = [
    { label: 'Panel', value: listing.panel },
    { label: 'Cihla', value: listing.brick },
    { label: 'Novostavba', value: listing.newBuilding },
    { label: 'Po rekonstrukci', value: listing.afterReconstruction },
    { label: 'V rekonstrukci', value: listing.inReconstruction },
    { label: 'Nízkoenergetická', value: listing.lowEnergy },
  ];

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

  const stateColor = STATE_COLORS[listing.listingState] ?? 'bg-gray-100 text-gray-700';
  const stateLabel = STATE_LABELS[listing.listingState] ?? listing.listingState;

  return (
    <>
      <ContentHeader className="space-x-2">
        <div className="flex items-center gap-2">
          <Link to="../bezrealitky">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <h1 className="inline-flex items-center gap-2.5 text-sm font-semibold">
            <Home className="size-4 text-orange-500" /> {listing.title}
          </h1>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stateColor}`}>
            {stateLabel}
          </span>
        </div>
        {listing.sourceUrl && (
          <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              <ExternalLink className="size-4" /> Bezrealitky
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
              <InfoItem label="BZR ID" value={listing.bzrId} />
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-4 space-y-4">
            <h2 className="font-semibold text-sm">Kontakt</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-muted-foreground" />
                <span className="font-medium">{listing.contactName ?? '-'}</span>
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

              {!listing.contactName && !listing.contactEmail && phones.length === 0 && (
                <p className="text-sm text-muted-foreground">Žádné kontaktní údaje.</p>
              )}
            </div>

            {listing.sourceUrl && (
              <div className="border-t border-border pt-3">
                <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="size-3" /> Zobrazit na Bezrealitky.cz
                </a>
              </div>
            )}
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
        </div>
      </Content>
    </>
  );
}
