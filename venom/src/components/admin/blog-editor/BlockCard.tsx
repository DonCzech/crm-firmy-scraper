"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import type { EditorBlock } from "./types";
import { BLOCK_LABELS } from "./types";
import { ImageField } from "./ImageField";
import { videoEmbedUrl } from "@/lib/blog/content";

interface Props {
  block: EditorBlock;
  tenantSlug: string;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<EditorBlock>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onInsertAfter: () => void;
}

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400";

export function BlockCard({ block, tenantSlug, isFirst, isLast, onChange, onDuplicate, onRemove, onMove, onInsertAfter }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.uid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group/block relative">
      <div className={`bg-white rounded-xl border transition-shadow ${isDragging ? "border-violet-400 shadow-lg" : "border-gray-200 hover:shadow-sm"}`}>
        {/* Block header */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-50">
          <button
            {...attributes}
            {...listeners}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-100 cursor-grab active:cursor-grabbing touch-none"
            title="Přetáhnout"
            aria-label="Přetáhnout blok"
          >
            <GripVertical size={15} />
          </button>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide flex-1">
            {BLOCK_LABELS[block.type] ?? block.type}
          </span>

          {block.type === "heading" && (
            <div className="flex rounded-lg bg-gray-100 p-0.5 mr-1">
              {[2, 3].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onChange({ level: lvl })}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                    (block.level ?? 2) === lvl ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                  }`}
                >
                  H{lvl}
                </button>
              ))}
            </div>
          )}
          {block.type === "list" && (
            <div className="flex rounded-lg bg-gray-100 p-0.5 mr-1">
              <button
                onClick={() => onChange({ ordered: false })}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${!block.ordered ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
              >
                •
              </button>
              <button
                onClick={() => onChange({ ordered: true })}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${block.ordered ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
              >
                1.
              </button>
            </div>
          )}

          <div className="flex items-center opacity-0 group-hover/block:opacity-100 transition-opacity">
            <button onClick={() => onMove(-1)} disabled={isFirst} title="Posunout výš" className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30">
              <ArrowUp size={14} />
            </button>
            <button onClick={() => onMove(1)} disabled={isLast} title="Posunout níž" className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30">
              <ArrowDown size={14} />
            </button>
            <button onClick={onDuplicate} title="Duplikovat" className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100">
              <Copy size={14} />
            </button>
            <button onClick={onRemove} title="Smazat blok" className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Block body */}
        <div className="p-3">
          {(block.type === "text" || block.type === "code") && (
            <textarea
              value={block.text ?? ""}
              onChange={(e) => onChange({ text: e.target.value })}
              rows={block.type === "code" ? 6 : 4}
              className={`${inputCls} resize-y ${block.type === "code" ? "font-mono text-xs" : ""}`}
              placeholder={block.type === "code" ? "Kód…" : "Text odstavce… (můžete použít <strong>, <em>, <a href>)"}
            />
          )}

          {block.type === "heading" && (
            <input
              type="text"
              value={block.text ?? ""}
              onChange={(e) => onChange({ text: e.target.value })}
              className={`${inputCls} font-bold`}
              placeholder="Nadpis sekce"
            />
          )}

          {block.type === "quote" && (
            <div className="space-y-2">
              <textarea
                value={block.text ?? ""}
                onChange={(e) => onChange({ text: e.target.value })}
                rows={2}
                className={`${inputCls} italic resize-y`}
                placeholder="Text citátu"
              />
              <input
                type="text"
                value={block.cite ?? ""}
                onChange={(e) => onChange({ cite: e.target.value })}
                className={inputCls}
                placeholder="Autor citátu (volitelné)"
              />
            </div>
          )}

          {block.type === "image" && (
            <div className="space-y-2">
              <ImageField
                tenantSlug={tenantSlug}
                value={block.url ?? ""}
                onChange={(url) => onChange({ url })}
                compact
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={block.alt ?? ""}
                  onChange={(e) => onChange({ alt: e.target.value })}
                  className={inputCls}
                  placeholder="Alt text (SEO)"
                />
                <input
                  type="text"
                  value={block.caption ?? ""}
                  onChange={(e) => onChange({ caption: e.target.value })}
                  className={inputCls}
                  placeholder="Popisek pod obrázkem"
                />
              </div>
            </div>
          )}

          {block.type === "gallery" && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {(block.images ?? []).map((img, j) => (
                  <div key={j} className="relative group/img aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
                    <button
                      onClick={() => onChange({ images: (block.images ?? []).filter((_, idx) => idx !== j) })}
                      className="absolute top-1 right-1 w-6 h-6 rounded-md bg-black/60 text-white text-xs opacity-0 group-hover/img:opacity-100 transition-opacity"
                      title="Odebrat"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <GalleryAdd tenantSlug={tenantSlug} onAdd={(url) => onChange({ images: [...(block.images ?? []), { url }] })} />
              </div>
            </div>
          )}

          {block.type === "list" && (
            <div className="space-y-2">
              {(block.items ?? []).map((item, j) => (
                <div key={j} className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400 w-4 text-right">{block.ordered ? `${j + 1}.` : "•"}</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const items = [...(block.items ?? [])];
                      items[j] = e.target.value;
                      onChange({ items });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const items = [...(block.items ?? [])];
                        items.splice(j + 1, 0, "");
                        onChange({ items });
                      }
                    }}
                    className={`${inputCls} flex-1`}
                    placeholder={`Položka ${j + 1}`}
                  />
                  <button
                    onClick={() => onChange({ items: (block.items ?? []).filter((_, idx) => idx !== j) })}
                    className="text-gray-300 hover:text-red-500 text-xs px-1"
                    title="Odebrat položku"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => onChange({ items: [...(block.items ?? []), ""] })}
                className="text-xs text-violet-600 font-medium hover:underline"
              >
                + Přidat položku
              </button>
            </div>
          )}

          {block.type === "cta" && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={block.ctaText ?? ""}
                onChange={(e) => onChange({ ctaText: e.target.value })}
                className={inputCls}
                placeholder="Text tlačítka"
              />
              <input
                type="text"
                value={block.ctaHref ?? ""}
                onChange={(e) => onChange({ ctaHref: e.target.value })}
                className={inputCls}
                placeholder="Odkaz (URL nebo #kontakt)"
              />
              <input
                type="text"
                value={block.text ?? ""}
                onChange={(e) => onChange({ text: e.target.value })}
                className={`${inputCls} col-span-2`}
                placeholder="Doprovodný text nad tlačítkem (volitelné)"
              />
            </div>
          )}

          {block.type === "divider" && (
            <div className="flex items-center justify-center gap-2 py-2 text-gray-300" aria-hidden>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            </div>
          )}

          {block.type === "video" && (
            <div className="space-y-2">
              <input
                type="url"
                value={block.url ?? ""}
                onChange={(e) => onChange({ url: e.target.value })}
                className={inputCls}
                placeholder="YouTube nebo Vimeo URL (např. https://youtu.be/…)"
              />
              {block.url && !videoEmbedUrl(block.url) && (
                <p className="text-xs text-amber-600">Podporujeme YouTube a Vimeo odkazy.</p>
              )}
              {block.url && videoEmbedUrl(block.url) && (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
                  <iframe src={videoEmbedUrl(block.url) as string} className="w-full h-full" title="Náhled videa" />
                </div>
              )}
              <input
                type="text"
                value={block.caption ?? ""}
                onChange={(e) => onChange({ caption: e.target.value })}
                className={inputCls}
                placeholder="Popisek (volitelné)"
              />
            </div>
          )}
        </div>
      </div>

      {/* Insert-after button */}
      <div className="flex justify-center -mb-2 mt-1 opacity-0 group-hover/block:opacity-100 transition-opacity">
        <button
          onClick={onInsertAfter}
          className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-sm hover:bg-violet-700 transition-colors"
          title="Vložit blok sem"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

function GalleryAdd({ tenantSlug, onAdd }: { tenantSlug: string; onAdd: (url: string) => void }) {
  return (
    <div className="aspect-square">
      <ImageField tenantSlug={tenantSlug} value="" onChange={onAdd} compact />
    </div>
  );
}
