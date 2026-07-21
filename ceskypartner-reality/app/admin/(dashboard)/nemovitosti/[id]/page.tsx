"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  X,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  MapPin,
  FileVideo,
  ChevronDown,
  Loader2,
} from "lucide-react";
import DetailMap from "@/components/DetailMap";
import { useApi, apiPatch } from "@/lib/useApi";
import { REGION_OPTIONS, DISTRICT_OPTIONS } from "@/lib/regions";
import { PORTALS, PORTAL_CATEGORY_LABELS, type PortalCategory } from "@/lib/portals";
import { OWNERSHIP_OPTIONS, CONDITION_OPTIONS, CONSTRUCTION_OPTIONS, FURNISHING_OPTIONS } from "@/lib/listingOptions";

type ImageItem = { id: string; url: string; file?: File; alt: string; existing?: boolean };

type ListingDetail = {
  id: string;
  title: string;
  slug: string;
  status: string;
  deal: string;
  kind: string;
  disposition: string | null;
  price: number;
  priceNote: string | null;
  location: string;
  region: string | null;
  district: string | null;
  address: string | null;
  ruianAddressCode: string | null;
  ruianParcelCode: string | null;
  lat: number | null;
  lng: number | null;
  area: number | null;
  landArea: number | null;
  floor: number | null;
  floors: number | null;
  penb: string | null;
  yearBuilt: number | null;
  description: string | null;
  tourUrl: string | null;
  videoUrl: string | null;
  zip: string | null;
  ownership: string | null;
  condition: string | null;
  construction: string | null;
  furnishing: string | null;
  monthlyFees: number | null;
  deposit: number | null;
  exclusive: boolean;
  priceHidden: boolean;
  amenities: string[];
  tags: string[];
  featured: boolean;
  images: { id: string; url: string; filename: string; order: number }[];
  portalExports: { portal: string; status: string }[];
  agent: { id: string; name: string } | null;
};

const DISPOSITIONS = ["1+kk", "1+1", "2+kk", "2+1", "3+kk", "3+1", "4+kk", "4+1", "5+kk", "5+1", "6+kk", "6+1"];
const PENB_LIST = ["A", "B", "C", "D", "E", "F", "G"];
const AMENITIES = [
  "Balkon", "Terasa", "Zahrada", "Garaz", "Parkovani", "Sklep",
  "Vytah", "Klimatizace", "Podlahove topeni", "Bazen", "Sauna",
  "Alarm", "Kamera", "Pristup 24/7", "Bezbariery", "Smart Home",
];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="mb-5 text-[15px] font-semibold text-[var(--a-text)]">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "h-10 w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30";
const selectClass = "h-10 w-full cursor-pointer appearance-none rounded-xl border border-[var(--a-border)] bg-transparent px-4 pr-10 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 focus:border-[var(--a-bronze)]/30";

const STATUS_MAP = {
  DRAFT: { label: "Koncept", dot: "bg-[var(--a-text-3)]", bg: "bg-[var(--a-surface)] text-[var(--a-text-2)]" },
  ACTIVE: { label: "Aktivni", dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]", bg: "bg-emerald-500/10 text-emerald-400" },
  RESERVED: { label: "Rezervace", dot: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]", bg: "bg-amber-500/10 text-amber-400" },
  SOLD: { label: "Prodano", dot: "bg-blue-400", bg: "bg-blue-500/10 text-blue-400" },
  RENTED: { label: "Pronajato", dot: "bg-violet-400", bg: "bg-violet-500/10 text-violet-400" },
  ARCHIVED: { label: "Archiv", dot: "bg-[var(--a-text-3)]", bg: "bg-[var(--a-surface)] text-[var(--a-text-3)]" },
} as const;

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { data, loading } = useApi<ListingDetail>(`/api/admin/listings/${id}`);

  const [title, setTitle] = useState("");
  const [deal, setDeal] = useState("");
  const [kind, setKind] = useState("");
  const [disposition, setDisposition] = useState("");
  const [price, setPrice] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [ruianAddressCode, setRuianAddressCode] = useState("");
  const [ruianParcelCode, setRuianParcelCode] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [tourUrl, setTourUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [zip, setZip] = useState("");
  const [ownership, setOwnership] = useState("");
  const [condition, setCondition] = useState("");
  const [construction, setConstruction] = useState("");
  const [furnishing, setFurnishing] = useState("");
  const [monthlyFees, setMonthlyFees] = useState("");
  const [deposit, setDeposit] = useState("");
  const [exclusive, setExclusive] = useState(false);
  const [priceHidden, setPriceHidden] = useState(false);
  const [selectedPortals, setSelectedPortals] = useState<Set<string>>(new Set());
  const [geocoding, setGeocoding] = useState(false);
  const [area, setArea] = useState("");
  const [landArea, setLandArea] = useState("");
  const [floor, setFloor] = useState("");
  const [floors, setFloors] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [penb, setPenb] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [images, setImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    if (data && !initialized) {
      setTitle(data.title);
      setDeal(data.deal);
      setKind(data.kind);
      setDisposition(data.disposition || "");
      setPrice(String(data.price));
      setStatus(data.status);
      setRegion(data.region || "");
      setDistrict(data.district || "");
      setLocation(data.location);
      setAddress(data.address || "");
      setRuianAddressCode(data.ruianAddressCode || "");
      setRuianParcelCode(data.ruianParcelCode || "");
      setLat(data.lat ? String(data.lat) : "");
      setLng(data.lng ? String(data.lng) : "");
      setPriceNote(data.priceNote || "");
      setDescription(data.description || "");
      setTourUrl(data.tourUrl || "");
      setVideoUrl(data.videoUrl || "");
      setZip(data.zip || "");
      setOwnership(data.ownership || "");
      setCondition(data.condition || "");
      setConstruction(data.construction || "");
      setFurnishing(data.furnishing || "");
      setMonthlyFees(data.monthlyFees ? String(data.monthlyFees) : "");
      setDeposit(data.deposit ? String(data.deposit) : "");
      setExclusive(!!data.exclusive);
      setPriceHidden(!!data.priceHidden);
      setSelectedPortals(new Set((data.portalExports || []).filter((e) => e.status !== "REMOVED").map((e) => e.portal)));
      setArea(data.area ? String(data.area) : "");
      setLandArea(data.landArea ? String(data.landArea) : "");
      setFloor(data.floor ? String(data.floor) : "");
      setFloors(data.floors ? String(data.floors) : "");
      setYearBuilt(data.yearBuilt ? String(data.yearBuilt) : "");
      setPenb(data.penb);
      setSelectedAmenities(new Set(data.amenities));
      setSelectedTags(new Set(data.tags));
      setImages(data.images.map((img) => ({ id: img.id, url: img.url, alt: img.filename, existing: true })));
      setInitialized(true);
    }
  }, [data, initialized]);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newImages: ImageItem[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(f),
      file: f,
      alt: f.name.replace(/\.[^.]+$/, ""),
    }));
    setImages((prev) => [...prev, ...newImages]);
  }

  function removeImage(imgId: string) {
    setImages((prev) => prev.filter((img) => img.id !== imgId));
  }

  function moveImage(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleAmenity(a: string) {
    setSelectedAmenities((prev) => { const n = new Set(prev); n.has(a) ? n.delete(a) : n.add(a); return n; });
  }

  function toggleTag(t: string) {
    setSelectedTags((prev) => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  }

  function togglePortal(key: string) {
    setSelectedPortals((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  function togglePortalCategory(category: PortalCategory) {
    const keys = PORTALS.filter((p) => p.category === category && p.exportable !== false).map((p) => p.key);
    setSelectedPortals((prev) => {
      const next = new Set(prev);
      const allSelected = keys.every((k) => next.has(k));
      keys.forEach((k) => (allSelected ? next.delete(k) : next.add(k)));
      return next;
    });
  }

  async function handleGeocode() {
    const query = [address, location, zip].filter(Boolean).join(", ");
    if (!query) { alert("Vyplňte nejdřív adresu nebo lokalitu"); return; }
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=cz&q=${encodeURIComponent(query)}`,
        { headers: { "Accept-Language": "cs" } }
      );
      const results = await res.json();
      if (results?.[0]) {
        setLat(Number(results[0].lat).toFixed(6));
        setLng(Number(results[0].lon).toFixed(6));
      } else {
        alert("Adresu se nepodařilo najít, zadejte GPS ručně");
      }
    } catch {
      alert("Geokódování selhalo, zkuste to znovu");
    }
    setGeocoding(false);
  }

  async function handleSave() {
    if (!title || !deal || !kind || !price || !location || !region) {
      alert("Vyplnte povinne pole: nazev, typ obchodu, typ nemovitosti, cena, lokalita, kraj");
      return;
    }
    setSaving(true);

    // Celé pořadí fotek (stávající + nově nahrané) — PATCH podle něj přepíše Media.order
    const newImageUrls: string[] = [];
    for (const img of images) {
      if (img.file) {
        const fd = new FormData();
        fd.append("file", img.file);
        fd.append("listingId", id); // kvůli vodoznaku fotek inzerátů
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (res.ok) {
          const media = await res.json();
          newImageUrls.push(media.url);
        }
      } else {
        newImageUrls.push(img.url);
      }
    }

    const body: any = {
      title, deal, kind, status,
      price: Number(price),
      priceNote: priceNote || null,
      location,
      region: region || null,
      district: district || null,
      description: description || null,
      tourUrl: tourUrl.trim() || null,
      videoUrl: videoUrl.trim() || null,
      zip: zip || null,
      ownership: ownership || null,
      condition: condition || null,
      construction: construction || null,
      furnishing: furnishing || null,
      monthlyFees: monthlyFees ? Number(monthlyFees) : null,
      deposit: deposit ? Number(deposit) : null,
      exclusive,
      priceHidden,
      portals: Array.from(selectedPortals),
      imageUrls: newImageUrls,
      disposition: disposition || null,
      address: address || null,
      ruianAddressCode: ruianAddressCode || null,
      ruianParcelCode: ruianParcelCode || null,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      area: area ? Number(area) : null,
      landArea: landArea ? Number(landArea) : null,
      floor: floor ? Number(floor) : null,
      floors: floors ? Number(floors) : null,
      yearBuilt: yearBuilt ? Number(yearBuilt) : null,
      penb: penb || null,
      amenities: Array.from(selectedAmenities),
      tags: Array.from(selectedTags),
    };

    const { error } = await apiPatch(`/api/admin/listings/${id}`, body);
    setSaving(false);

    if (error) { alert("Chyba: " + error); return; }
    router.push("/admin/nemovitosti");
  }

  if (loading || !initialized) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[var(--a-bronze)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px] space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/nemovitosti" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--a-border)] text-[var(--a-text-3)] transition-all duration-300 hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--a-text)]">Upravit inzerat</h1>
            <p className="text-[12.5px] text-[var(--a-text-3)]">{data?.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12.5px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Ukladam..." : "Ulozit"}
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="glass-card flex flex-wrap items-center gap-3 rounded-2xl px-5 py-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Status:</span>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(STATUS_MAP) as (keyof typeof STATUS_MAP)[]).map((s) => {
            const info = STATUS_MAP[s];
            return (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${
                  status === s ? "border-[var(--a-bronze)]/30 " + info.bg : "border-[var(--a-border)] text-[var(--a-text-3)] hover:border-[var(--a-border-hover)]"
                }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} />
                {info.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <SectionCard title="Zakladni udaje">
            <div className="space-y-4">
              <Field label="Nazev inzeratu" required>
                <input type="text" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Typ obchodu" required>
                  <div className="relative">
                    <select className={selectClass} value={deal} onChange={(e) => setDeal(e.target.value)}>
                      <option value="SALE">Prodej</option>
                      <option value="RENT">Pronajem</option>
                      <option value="INVESTMENT">Investice</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                  </div>
                </Field>
                <Field label="Typ nemovitosti" required>
                  <div className="relative">
                    <select className={selectClass} value={kind} onChange={(e) => setKind(e.target.value)}>
                      <option value="APARTMENT">Byt</option>
                      <option value="HOUSE">Dum</option>
                      <option value="LAND">Pozemek</option>
                      <option value="COMMERCIAL">Komercni</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                  </div>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Dispozice">
                  <div className="relative">
                    <select className={selectClass} value={disposition} onChange={(e) => setDisposition(e.target.value)}>
                      <option value="">-</option>
                      {DISPOSITIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                  </div>
                </Field>
                <Field label="Cena (Kc)" required>
                  <input type="number" className={inputClass} value={price} onChange={(e) => setPrice(e.target.value)} />
                </Field>
                <Field label="Poznamka k cene">
                  <input type="text" className={inputClass} placeholder="Napr. vcetne parkovani" value={priceNote} onChange={(e) => setPriceNote(e.target.value)} />
                </Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Lokace">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kraj" required>
                  <div className="relative">
                    <select className={selectClass} value={region} onChange={(e) => { setRegion(e.target.value); setDistrict(""); }}>
                      <option value="">Vyberte kraj...</option>
                      {REGION_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                  </div>
                </Field>
                <Field label="Okres">
                  <div className="relative">
                    <select className={selectClass} value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!region}>
                      <option value="">Vyberte okres...</option>
                      {region && DISTRICT_OPTIONS[region]?.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                  </div>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Lokalita" required>
                  <input type="text" className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} />
                </Field>
                <Field label="Adresa">
                  <input type="text" className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
                </Field>
                <Field label="PSC">
                  <input type="text" className={inputClass} placeholder="120 00" value={zip} onChange={(e) => setZip(e.target.value)} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="RUIAN kod adresniho mista">
                  <input type="text" inputMode="numeric" className={inputClass} placeholder="napr. 22425101" value={ruianAddressCode} onChange={(e) => setRuianAddressCode(e.target.value.replace(/\D/g, ""))} />
                </Field>
                <Field label="RUIAN kod parcely">
                  <input type="text" inputMode="numeric" className={inputClass} placeholder="Alternativa pro pozemek" value={ruianParcelCode} onChange={(e) => setRuianParcelCode(e.target.value.replace(/\D/g, ""))} />
                </Field>
              </div>
              <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
                <Field label="GPS lat"><input type="number" step="0.0001" className={inputClass} value={lat} onChange={(e) => setLat(e.target.value)} /></Field>
                <Field label="GPS lng"><input type="number" step="0.0001" className={inputClass} value={lng} onChange={(e) => setLng(e.target.value)} /></Field>
                <button
                  type="button"
                  onClick={handleGeocode}
                  disabled={geocoding}
                  className="flex h-10 items-center gap-2 rounded-xl border border-[var(--a-border)] px-4 text-[12px] font-semibold text-[var(--a-text-2)] transition-all duration-300 hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)] disabled:opacity-50"
                >
                  <MapPin size={13} />
                  {geocoding ? "Hledam..." : "Najit GPS z adresy"}
                </button>
              </div>
              {lat && lng && (
                <div className="relative h-48 w-full overflow-hidden rounded-xl border border-[var(--a-border)] sm:h-64">
                  <DetailMap key={`${lat},${lng}`} lat={Number(lat)} lng={Number(lng)} title="Poloha nemovitosti" />
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="3D prohlidka (CubiCasa / VisitHome)">
            <Field label="URL prohlidky">
              <input
                type="url"
                className={inputClass}
                placeholder="https://visithome.ai/..."
                value={tourUrl}
                onChange={(e) => setTourUrl(e.target.value)}
              />
            </Field>
            <p className="mt-2 text-[11.5px] text-[var(--a-text-3)]">
              Vlozte sdileci odkaz z aplikace CubiCasa (visithome.ai). Prohlidka se zobrazi v detailu inzeratu vedle fotogalerie.
            </p>
          </SectionCard>

          <SectionCard title="Video">
            <Field label="URL videa">
              <div className="relative">
                <FileVideo size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                <input
                  type="url"
                  className={`${inputClass} pl-10`}
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>
            </Field>
            <p className="mt-2 text-[11.5px] text-[var(--a-text-3)]">
              Vlozte odkaz na YouTube, Vimeo nebo primy odkaz na MP4. Video se zobrazi v detailu inzeratu.
            </p>
          </SectionCard>

          <SectionCard title="Popis nemovitosti">
            <textarea rows={8} className="w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 py-3 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30" value={description} onChange={(e) => setDescription(e.target.value)} />
          </SectionCard>

          <SectionCard title="Fotogalerie">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-all duration-300 ${dragOver ? "border-[var(--a-bronze)] bg-[var(--a-bronze-glow)]" : "border-[var(--a-border)] bg-[var(--a-surface-2)]"}`}
            >
              <Upload size={28} className={dragOver ? "text-[var(--a-bronze)]" : "text-[var(--a-text-3)]"} />
              <p className="mt-3 text-[13px] text-[var(--a-text)]">
                Pretahnete sem fotky nebo{" "}
                <button type="button" onClick={() => fileRef.current?.click()} className="font-semibold text-[var(--a-bronze)] underline-offset-2 hover:underline">vyberte ze souboru</button>
              </p>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)} />
            </div>
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((img, i) => (
                  <div key={img.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)]">
                    <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
                    <button type="button" onClick={() => removeImage(img.id)} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"><X size={13} /></button>
                    <div className="absolute bottom-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button type="button" disabled={i === 0} onClick={() => moveImage(i, -1)} aria-label="Posunout doleva" className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white disabled:opacity-30"><ChevronLeft size={13} /></button>
                      <button type="button" disabled={i === images.length - 1} onClick={() => moveImage(i, 1)} aria-label="Posunout doprava" className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white disabled:opacity-30"><ChevronRight size={13} /></button>
                    </div>
                    <div className="absolute left-1.5 top-1.5 flex h-6 items-center gap-1 rounded bg-black/70 px-2 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"><GripVertical size={10} />{i + 1}</div>
                    {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded bg-[var(--a-bronze)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#0a0a0b]">Hlavni</span>}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Parametry">
            <div className="space-y-4">
              <Field label="Uzitna plocha (m2)"><input type="number" className={inputClass} value={area} onChange={(e) => setArea(e.target.value)} /></Field>
              <Field label="Plocha pozemku (m2)"><input type="number" className={inputClass} value={landArea} onChange={(e) => setLandArea(e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Podlazi"><input type="number" className={inputClass} value={floor} onChange={(e) => setFloor(e.target.value)} /></Field>
                <Field label="Pocet podlazi"><input type="number" className={inputClass} value={floors} onChange={(e) => setFloors(e.target.value)} /></Field>
              </div>
              <Field label="Rok vystavby"><input type="number" className={inputClass} value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} /></Field>
              <Field label="Vlastnictvi">
                <div className="relative">
                  <select className={selectClass} value={ownership} onChange={(e) => setOwnership(e.target.value)}>
                    <option value="">-</option>
                    {OWNERSHIP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
              </Field>
              <Field label="Stav nemovitosti">
                <div className="relative">
                  <select className={selectClass} value={condition} onChange={(e) => setCondition(e.target.value)}>
                    <option value="">-</option>
                    {CONDITION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
              </Field>
              <Field label="Konstrukce budovy">
                <div className="relative">
                  <select className={selectClass} value={construction} onChange={(e) => setConstruction(e.target.value)}>
                    <option value="">-</option>
                    {CONSTRUCTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
              </Field>
              <Field label="Vybavenost">
                <div className="relative">
                  <select className={selectClass} value={furnishing} onChange={(e) => setFurnishing(e.target.value)}>
                    <option value="">-</option>
                    {FURNISHING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mesicni naklady (Kc)"><input type="number" className={inputClass} value={monthlyFees} onChange={(e) => setMonthlyFees(e.target.value)} /></Field>
                <Field label="Vratna kauce (Kc)"><input type="number" className={inputClass} value={deposit} onChange={(e) => setDeposit(e.target.value)} /></Field>
              </div>
              <div className="space-y-2 pt-1">
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--a-border)] px-3 py-2.5 transition-all duration-300 hover:border-[var(--a-border-hover)]">
                  <span className="text-[12px] font-semibold text-[var(--a-text)]">Exkluzivni zastoupeni</span>
                  <input type="checkbox" className="h-4 w-4 cursor-pointer rounded accent-[var(--a-bronze)]" checked={exclusive} onChange={(e) => setExclusive(e.target.checked)} />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--a-border)] px-3 py-2.5 transition-all duration-300 hover:border-[var(--a-border-hover)]">
                  <span className="text-[12px] font-semibold text-[var(--a-text)]">Cena na vyzadani (skryt)</span>
                  <input type="checkbox" className="h-4 w-4 cursor-pointer rounded accent-[var(--a-bronze)]" checked={priceHidden} onChange={(e) => setPriceHidden(e.target.checked)} />
                </label>
              </div>
              <Field label="PENB">
                <div className="flex gap-1">
                  {PENB_LIST.map((p) => (
                    <button key={p} type="button" onClick={() => setPenb(p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-semibold transition-all duration-300 border ${penb === p ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]" : "border-[var(--a-border)] text-[var(--a-text-3)] hover:border-[var(--a-border-hover)]"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Vybaveni a vlastnosti">
            <div className="flex flex-wrap gap-1.5">
              {AMENITIES.map((a) => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${selectedAmenities.has(a) ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]" : "border-[var(--a-border)] text-[var(--a-text-3)] hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]"}`}>
                  {a}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Tagy">
            <div className="flex flex-wrap gap-1.5">
              {["Novostavba", "Exkluzivni", "Top nabidka", "Sleva", "Rychly prodej"].map((t) => (
                <button key={t} type="button" onClick={() => toggleTag(t)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${selectedTags.has(t) ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]" : "border-[var(--a-border)] text-[var(--a-text-3)] hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]"}`}>
                  {t}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={`Export na portaly (${selectedPortals.size})`}>
            <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
              {(Object.keys(PORTAL_CATEGORY_LABELS) as PortalCategory[]).map((cat) => {
                const catPortals = PORTALS.filter((p) => p.category === cat);
                const selectablePortals = catPortals.filter((p) => p.exportable !== false);
                const allSelected =
                  selectablePortals.length > 0 &&
                  selectablePortals.every((p) => selectedPortals.has(p.key));
                return (
                  <div key={cat}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">
                        {PORTAL_CATEGORY_LABELS[cat]}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePortalCategory(cat)}
                        disabled={selectablePortals.length === 0}
                        className="text-[10.5px] font-semibold text-[var(--a-bronze)] hover:underline"
                      >
                        {allSelected ? "Zrusit vse" : "Vybrat vse"}
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {catPortals.map((p) => (
                        <label
                          key={p.key}
                          className={`flex items-center justify-between rounded-xl border border-[var(--a-border)] px-3 py-2 transition-all duration-300 ${
                            p.exportable === false && !selectedPortals.has(p.key)
                              ? "cursor-not-allowed opacity-55"
                              : "cursor-pointer hover:border-[var(--a-border-hover)]"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[12px] font-semibold text-[var(--a-text)]">{p.name}</span>
                            {p.note && <span className="block text-[10px] text-[var(--a-text-3)]">{p.note}</span>}
                          </span>
                          <input
                            type="checkbox"
                            className="h-4 w-4 shrink-0 cursor-pointer rounded accent-[var(--a-bronze)]"
                            checked={selectedPortals.has(p.key)}
                            disabled={p.exportable === false && !selectedPortals.has(p.key)}
                            onChange={() => togglePortal(p.key)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-[var(--a-text-3)]">
              Po ulozeni se zmeny propisi do fronty exportu. Stav sledujte v sekci Export portaly.
            </p>
          </SectionCard>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--a-border)] px-6 py-4 backdrop-blur-xl lg:left-[264px]" style={{ background: "color-mix(in srgb, var(--a-bg) 90%, transparent)" }}>
        <div className="mx-auto flex max-w-[960px] items-center justify-between">
          <p className="text-[12px] text-[var(--a-text-3)]">Editace: {title}</p>
          <div className="flex gap-2">
            <Link href="/admin/nemovitosti" className="rounded-xl border border-[var(--a-border)] px-5 py-2.5 text-[12.5px] font-semibold text-[var(--a-text-2)] transition-all duration-300 hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]">Zrusit</Link>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12.5px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Ukladam..." : "Ulozit zmeny"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
