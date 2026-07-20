"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

interface Props {
  file: File;
  aspect?: number | null;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

export function CropEditor({ file, aspect, onConfirm, onCancel }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  async function handleConfirm() {
    if (!imageSrc || !croppedArea) return;
    setWorking(true);
    try {
      const blob = await cropToBlob(imageSrc, croppedArea, file.type);
      const cropped = new File([blob], file.name, { type: file.type || "image/jpeg" });
      onConfirm(cropped);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/90">
      <div className="flex items-center justify-between border-b border-[var(--vs-border-strong)] px-4 py-3 text-[var(--vs-text)]">
        <span className="text-sm font-semibold">Oříznout obrázek</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-xs font-semibold text-[var(--vs-text-muted)] hover:text-[var(--vs-text)]"
          >
            Zrušit
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={working || !croppedArea}
            className="rounded-md bg-[var(--vs-accent-solid)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--vs-accent-solid-hi)] disabled:opacity-50"
          >
            {working ? "Zpracovávám…" : "Použít"}
          </button>
        </div>
      </div>
      <div className="relative flex-1">
        {imageSrc && (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect ?? undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        )}
      </div>
      <div className="border-t border-[var(--vs-border-strong)] px-4 py-3">
        <label className="flex items-center gap-3 text-xs text-[var(--vs-text-soft)]">
          <span className="w-12">Zoom</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[var(--vs-accent)]"
          />
        </label>
      </div>
    </div>
  );
}

async function cropToBlob(imageSrc: string, area: Area, mimeType: string): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))),
      mimeType && mimeType.startsWith("image/") ? mimeType : "image/jpeg",
      0.92
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
