'use client';

import { useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, ArrowRight, Plus } from 'lucide-react';
import { getClient } from '@/lib/graphql-client';
import { UPLOAD_LISTING_MEDIA, CONFIRM_LISTING_MEDIA } from '@/graphql/mutations';

interface Props {
  listingId: string | null;
  onDone: () => void;
}

type FileStatus = 'pending' | 'uploading' | 'done' | 'error';

interface FileEntry {
  id: string;
  file: File;
  preview: string;
  status: FileStatus;
  error?: string;
}

export function ListingWizardStep4({ listingId, onDone }: Props) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [uploading, setUploading] = useState(false);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const entries: FileEntry[] = Array.from(newFiles)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'pending' as FileStatus,
      }));
    setFiles((prev) => [...prev, ...entries]);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const uploadAll = async () => {
    if (!listingId || files.length === 0) return;
    setUploading(true);

    for (const entry of files) {
      if (entry.status === 'done') continue;

      setFiles((prev) =>
        prev.map((f) => (f.id === entry.id ? { ...f, status: 'uploading' } : f)),
      );

      try {
        const res: any = await getClient().request(UPLOAD_LISTING_MEDIA, {
          listingId,
          mimeType: entry.file.type,
        });
        const { key, url } = res.uploadListingMedia;

        const putRes = await fetch(url, {
          method: 'PUT',
          body: entry.file,
          headers: { 'Content-Type': entry.file.type },
        });
        if (!putRes.ok) throw new Error(`Nahrání selhalo (${putRes.status})`);

        await getClient().request(CONFIRM_LISTING_MEDIA, {
          listingId,
          key,
          mimeType: entry.file.type,
          size: entry.file.size,
        });

        setFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, status: 'done' } : f)),
        );
      } catch (err: any) {
        const msg = err?.response?.errors?.[0]?.message ?? err?.message ?? 'Chyba při nahrávání';
        setFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, status: 'error', error: msg } : f)),
        );
      }
    }

    setUploading(false);
  };

  const pendingCount = files.filter((f) => f.status === 'pending' || f.status === 'error').length;
  const doneCount = files.filter((f) => f.status === 'done').length;

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        Inzerát byl <span className="font-semibold text-green-600">úspěšně vytvořen</span>.
        Přidejte fotografie nebo přeskočte.
      </p>

      {/* Upload zóna — <label> spolehlivě otevře file picker na všech prohlížečích */}
      <label
        htmlFor="photo-upload"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer select-none hover:border-primary-400 hover:bg-primary-50 transition-colors"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 border-2 border-gray-200">
          <Plus size={28} className="text-primary-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Přidat fotografie</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Klikněte nebo přetáhněte · JPG, PNG, WEBP · max 10 MB / foto
          </p>
        </div>
        <input
          id="photo-upload"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />
      </label>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {files.map((entry) => (
            <div
              key={entry.id}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
            >
              <img src={entry.preview} alt="" className="w-full h-full object-cover" />

              {entry.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 size={22} className="animate-spin text-white" />
                </div>
              )}
              {entry.status === 'done' && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <CheckCircle2 size={22} className="text-green-400" />
                </div>
              )}
              {entry.status === 'error' && (
                <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center gap-1 p-2">
                  <AlertCircle size={18} className="text-red-300" />
                  <span className="text-xs text-red-200 text-center line-clamp-2">{entry.error}</span>
                </div>
              )}

              {entry.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => removeFile(entry.id)}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Akce */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onDone}
          disabled={uploading}
          className="btn-outline flex-1 flex items-center justify-center gap-1.5"
        >
          Přeskočit <ArrowRight size={15} />
        </button>

        {files.length > 0 && (
          <button
            type="button"
            onClick={pendingCount > 0 ? uploadAll : onDone}
            disabled={uploading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><Loader2 size={15} className="animate-spin" /> Nahrávám...</>
            ) : pendingCount > 0 ? (
              `Nahrát ${pendingCount} foto`
            ) : (
              <><CheckCircle2 size={15} /> Hotovo ({doneCount})</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
