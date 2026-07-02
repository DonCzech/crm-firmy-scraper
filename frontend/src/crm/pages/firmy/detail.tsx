import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Clock,
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import { BackendFirmyCzListing, fetchFirmyListing } from '../../services/backend';

// Day order and Czech labels
const DAY_ORDER = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];
const DAY_LABELS: Record<string, string> = {
  mo: 'Pondělí', tu: 'Úterý', we: 'Středa',
  th: 'Čtvrtek', fr: 'Pátek', sa: 'Sobota', su: 'Neděle',
};

function parseJsonArr(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.filter(Boolean);
  } catch { /* ignore */ }
  return raw ? [raw] : [];
}

function parseOpeningHours(raw?: string | null): Record<string, string> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch { return null; }
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr));
}

export function FirmyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const latestLoadRequestRef = useRef(0);
  const [firm, setFirm] = useState<BackendFirmyCzListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    setLoading(true);
    fetchFirmyListing(id)
      .then((data) => {
        if (requestId !== latestLoadRequestRef.current) return;
        setFirm(data);
      })
      .catch((error) => {
        logFrontendError({
          area: 'crm-firmy-detail',
          message: error instanceof Error ? error.message : 'Failed to load firmy detail',
          meta: { firmyId: id, operation: 'load_firmy_detail' },
        });
        if (requestId !== latestLoadRequestRef.current) return;
        setFirm(null);
      })
      .finally(() => {
        if (requestId !== latestLoadRequestRef.current) return;
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <>
        <ContentHeader><h1 className="text-sm font-semibold">Načítání...</h1></ContentHeader>
        <Content><div className="p-8 text-center text-muted-foreground">Načítám detail firmy...</div></Content>
      </>
    );
  }

  if (!firm) {
    return (
      <>
        <ContentHeader><h1 className="text-sm font-semibold">Nenalezeno</h1></ContentHeader>
        <Content>
          <div className="p-8 text-center text-muted-foreground">
            Firma nebyla nalezena.
            <br />
            <Link to="../firmy" className="text-primary hover:underline mt-2 inline-block">Zpět na seznam</Link>
          </div>
        </Content>
      </>
    );
  }

  const phones = parseJsonArr(firm.phones ?? firm.phone);
  const emails = parseJsonArr(firm.emails ?? firm.email);
  const websites = parseJsonArr(firm.websites ?? firm.website);
  const openingHours = parseOpeningHours(firm.openingHours);

  return (
    <>
      <ContentHeader className="space-x-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="../firmy">
            <Button size="sm" variant="ghost"><ArrowLeft className="size-4" /></Button>
          </Link>
          {firm.logoUrl && (
            <img src={firm.logoUrl} alt={firm.name} className="h-8 w-auto object-contain rounded" />
          )}
          <h1 className="inline-flex items-center gap-2.5 text-sm font-semibold">
            <Building2 className="size-4 text-primary" /> {firm.name}
          </h1>
          {firm.rating != null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Star className="size-3 fill-yellow-500 text-yellow-500" />
              {firm.rating.toFixed(1)}
              {firm.reviewCount != null && <span className="text-yellow-600">({firm.reviewCount})</span>}
            </span>
          )}
          {firm.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {firm.category}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {firm.sourceUrl && (
            <a href={firm.sourceUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline"><ExternalLink className="size-4" /> Firmy.cz</Button>
            </a>
          )}
        </div>
      </ContentHeader>

      <Content>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">

          {/* ── PŘEHLED ── */}
          <Card className="p-4 space-y-4 lg:col-span-2">
            <h2 className="font-semibold text-sm">Přehled</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <InfoItem label="Název firmy" value={firm.name} />
              {firm.ic && <InfoItem label="IČO" value={firm.ic} />}
              {firm.category && <InfoItem label="Kategorie" value={firm.category} />}
              {firm.city && (
                <InfoItem label="Město" value={
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{firm.city}</span>
                } />
              )}
              {firm.zip && <InfoItem label="PSČ" value={firm.zip} />}
              {firm.address && <InfoItem label="Adresa" value={firm.address} />}
              {firm.gpsLat != null && firm.gpsLon != null && (
                <InfoItem label="GPS" value={
                  <a
                    href={`https://maps.google.com/?q=${firm.gpsLat},${firm.gpsLon}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <MapPin className="size-3" />
                    {firm.gpsLat.toFixed(6)}, {firm.gpsLon.toFixed(6)}
                  </a>
                } />
              )}
              <InfoItem label="Poprvé staženo" value={formatDate(firm.firstSeenAt)} />
              <InfoItem label="Naposledy aktualizováno" value={formatDate(firm.lastSeenAt)} />
              <InfoItem label="Firmy ID" value={firm.firmyId} />
            </div>
          </Card>

          {/* ── KONTAKTY ── */}
          <Card className="p-4 space-y-4">
            <h2 className="font-semibold text-sm">Kontaktní údaje</h2>

            {/* Phones */}
            {phones.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Telefon{phones.length > 1 ? 'y' : ''}</p>
                {phones.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Phone className="size-4 text-muted-foreground shrink-0" />
                    <a href={`tel:${p}`} className="text-primary hover:underline">{p}</a>
                  </div>
                ))}
              </div>
            )}

            {/* Emails */}
            {emails.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">E-mail{emails.length > 1 ? 'y' : ''}</p>
                {emails.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Mail className="size-4 text-muted-foreground shrink-0" />
                    <a href={`mailto:${e}`} className="text-primary hover:underline truncate">{e}</a>
                  </div>
                ))}
              </div>
            )}

            {/* Websites */}
            {websites.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Web{websites.length > 1 ? 'y' : ''}</p>
                {websites.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Globe className="size-4 text-muted-foreground shrink-0" />
                    <a href={w} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate text-xs">{w.replace(/^https?:\/\//, '')}</a>
                  </div>
                ))}
              </div>
            )}

            {/* Social */}
            {(firm.facebook || firm.instagram) && (
              <div className="space-y-1.5 border-t border-border pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sociální sítě</p>
                {firm.facebook && (
                  <a href={firm.facebook} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Facebook className="size-4" /> Facebook
                  </a>
                )}
                {firm.instagram && (
                  <a href={firm.instagram} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Instagram className="size-4" /> Instagram
                  </a>
                )}
              </div>
            )}

            {/* Rating */}
            {firm.rating != null && (
              <div className="border-t border-border pt-3 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hodnocení</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => {
                      // Normalize: if rating > 10, assume it's 0-100 scale
                      const normalized = (firm.rating ?? 0) > 10
                        ? ((firm.rating ?? 0) / 100) * 5
                        : (firm.rating ?? 0);
                      return (
                        <Star
                          key={star}
                          className={`size-4 ${star <= Math.round(normalized) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-sm font-medium">{firm.rating.toFixed(1)}</span>
                  {firm.reviewCount != null && (
                    <span className="text-xs text-muted-foreground">({firm.reviewCount} recenzí)</span>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* ── OTEVÍRACÍ DOBA ── */}
          {openingHours && (
            <Card className="p-4 space-y-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="size-4 text-primary" /> Otevírací doba
              </h2>
              <div className="space-y-1.5">
                {DAY_ORDER.map((key) => {
                  const hours = openingHours[key];
                  if (!hours) return null;
                  const isToday = new Date().getDay() === DAY_ORDER.indexOf(key) + 1 ||
                    (key === 'su' && new Date().getDay() === 0);
                  return (
                    <div key={key} className={`flex items-center justify-between text-sm py-1 ${isToday ? 'font-semibold text-primary' : ''}`}>
                      <span className="w-24">{DAY_LABELS[key]}</span>
                      <span className={hours === 'zavřeno' ? 'text-muted-foreground' : ''}>
                        {hours === 'zavřeno' ? 'Zavřeno' : hours}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ── POPIS ── */}
          {firm.description && (
            <Card className={`p-4 space-y-2 ${openingHours ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <h2 className="font-semibold text-sm">Popis firmy</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
                {firm.description}
              </p>
            </Card>
          )}

          {/* ── MAPA ── */}
          {firm.gpsLat != null && firm.gpsLon != null && (
            <Card className="p-4 space-y-2 lg:col-span-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <MapPin className="size-4 text-primary" /> Poloha na mapě
              </h2>
              <a
                href={`https://maps.google.com/?q=${firm.gpsLat},${firm.gpsLon}&z=16`}
                target="_blank" rel="noopener noreferrer"
                className="block"
              >
                <iframe
                  title="Mapa"
                  width="100%"
                  height="220"
                  style={{ border: 0, borderRadius: 8 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=&q=${firm.gpsLat},${firm.gpsLon}`}
                  className="pointer-events-none"
                />
                <p className="text-xs text-primary hover:underline mt-1">
                  Otevřít v Google Maps →
                </p>
              </a>
            </Card>
          )}

          {/* ── VŠECHNY OSTATNÍ KONTAKTNÍ INFORMACE ── */}
          <Card className="p-4 space-y-3 lg:col-span-3">
            <h2 className="font-semibold text-sm">Všechny údaje</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <InfoItem label="Firmy.cz ID" value={firm.firmyId} />
              <InfoItem label="Interní ID" value={firm.id} />
              {firm.ic && <InfoItem label="IČO" value={firm.ic} />}
              {firm.zip && <InfoItem label="PSČ" value={firm.zip} />}
              {firm.city && <InfoItem label="Město" value={firm.city} />}
              {firm.address && <InfoItem label="Plná adresa" value={firm.address} />}
              {firm.category && <InfoItem label="Kategorie" value={firm.category} />}
              {firm.rating != null && <InfoItem label="Hodnocení" value={String(firm.rating)} />}
              {firm.reviewCount != null && <InfoItem label="Počet recenzí" value={String(firm.reviewCount)} />}
              {firm.gpsLat != null && <InfoItem label="GPS lat" value={String(firm.gpsLat)} />}
              {firm.gpsLon != null && <InfoItem label="GPS lon" value={String(firm.gpsLon)} />}
              <InfoItem label="Poprvé staženo" value={formatDate(firm.firstSeenAt)} />
              <InfoItem label="Naposledy viděno" value={formatDate(firm.lastSeenAt)} />
              <InfoItem label="Vytvořeno v DB" value={formatDate(firm.createdAt)} />
            </div>
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
      <p className="font-medium text-sm break-words">{value ?? <span className="text-muted-foreground">—</span>}</p>
    </div>
  );
}
