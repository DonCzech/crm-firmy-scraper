import path from "path";
import { mkdir, writeFile } from "fs/promises";
import sharp from "sharp";

// ── Allowed file types (accepted on INPUT) ────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const DEFAULT_RESPONSIVE_WIDTHS = [320, 640, 960, 1280, 1920];

// ── Storage provider interface ────────────────────────────────────────────────

export interface ResponsiveVariant {
  width: number;
  height: number;
  webpUrl: string;
  jpegUrl: string;
}

export interface UploadResult {
  url: string;
  jpegUrl: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  jpegSizeBytes: number;
  width: number | null;
  height: number | null;
  variants?: ResponsiveVariant[];
  lqip?: string;
}

export interface MediaStorageProvider {
  upload(image: OptimizedImage, tenantId: number): Promise<UploadResult>;
}

export interface UploadMediaOptions {
  targetWidth?: number | null;
  targetHeight?: number | null;
  fit?: "cover" | "contain";
  responsive?: boolean;
  widths?: number[];
}

interface OptimizedVariantBuffer {
  width: number;
  height: number;
  webp: { buffer: Buffer; filename: string };
  jpeg: { buffer: Buffer; filename: string };
}

interface OptimizedImage {
  // Primary (largest WebP) — single-size or largest of responsive set.
  fallbackBuffer: Buffer;
  jpegBuffer: Buffer;
  filename: string;
  jpegFilename: string;
  mimeType: string;
  sizeBytes: number;
  jpegSizeBytes: number;
  width: number | null;
  height: number | null;
  variants?: OptimizedVariantBuffer[];
  lqip?: string;
}

// ── Vercel Blob provider ──────────────────────────────────────────────────────

class VercelBlobProvider implements MediaStorageProvider {
  async upload(image: OptimizedImage, tenantId: number): Promise<UploadResult> {
    const { put } = await import("@vercel/blob");
    const filename = `${tenantId}/media/${image.filename}`;
    const jpegKey = `${tenantId}/media/${image.jpegFilename}`;
    const [blob, jpegBlob] = await Promise.all([
      put(filename, image.fallbackBuffer, { access: "public", contentType: image.mimeType }),
      put(jpegKey, image.jpegBuffer, { access: "public", contentType: "image/jpeg" }),
    ]);

    let variants: ResponsiveVariant[] | undefined;
    if (image.variants && image.variants.length) {
      variants = await Promise.all(
        image.variants.map(async (v) => {
          const webpKey = `${tenantId}/media/${v.webp.filename}`;
          const jpegVariantKey = `${tenantId}/media/${v.jpeg.filename}`;
          const [webpRes, jpegRes] = await Promise.all([
            put(webpKey, v.webp.buffer, { access: "public", contentType: "image/webp" }),
            put(jpegVariantKey, v.jpeg.buffer, { access: "public", contentType: "image/jpeg" }),
          ]);
          return { width: v.width, height: v.height, webpUrl: webpRes.url, jpegUrl: jpegRes.url };
        })
      );
    }

    return {
      url: blob.url,
      jpegUrl: jpegBlob.url,
      filename,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      jpegSizeBytes: image.jpegSizeBytes,
      width: image.width,
      height: image.height,
      variants,
      lqip: image.lqip,
    };
  }
}

// ── Local filesystem provider (dev/fallback) ──────────────────────────────────

class LocalStorageProvider implements MediaStorageProvider {
  async upload(image: OptimizedImage, tenantId: number): Promise<UploadResult> {
    const uploadDir = path.join(process.cwd(), "public", "uploads", String(tenantId));
    await mkdir(uploadDir, { recursive: true });
    const writes: Promise<unknown>[] = [
      writeFile(path.join(uploadDir, image.filename), image.fallbackBuffer),
      writeFile(path.join(uploadDir, image.jpegFilename), image.jpegBuffer),
    ];
    if (image.variants) {
      for (const v of image.variants) {
        writes.push(writeFile(path.join(uploadDir, v.webp.filename), v.webp.buffer));
        writes.push(writeFile(path.join(uploadDir, v.jpeg.filename), v.jpeg.buffer));
      }
    }
    await Promise.all(writes);

    const variants: ResponsiveVariant[] | undefined = image.variants?.map((v) => ({
      width: v.width,
      height: v.height,
      webpUrl: `/uploads/${tenantId}/${v.webp.filename}`,
      jpegUrl: `/uploads/${tenantId}/${v.jpeg.filename}`,
    }));

    return {
      url: `/uploads/${tenantId}/${image.filename}`,
      jpegUrl: `/uploads/${tenantId}/${image.jpegFilename}`,
      filename: image.filename,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      jpegSizeBytes: image.jpegSizeBytes,
      width: image.width,
      height: image.height,
      variants,
      lqip: image.lqip,
    };
  }
}

// ── Active provider selection ─────────────────────────────────────────────────

function getProvider(): MediaStorageProvider {
  if (process.env.BLOB_READ_WRITE_TOKEN) return new VercelBlobProvider();
  return new LocalStorageProvider();
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function uploadMedia(file: File, tenantId: number, options: UploadMediaOptions = {}): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Nepodporovaný typ souboru: ${file.type}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Soubor je příliš velký (max 10 MB)`);
  }

  const buffer = await file.arrayBuffer();
  if (!isValidImageBuffer(Buffer.from(buffer))) {
    throw new Error("Soubor není platný obrázek");
  }

  const optimized = await optimizeImage(Buffer.from(buffer), tenantId, options);
  const provider = getProvider();
  return provider.upload(optimized, tenantId);
}

// ── Magic byte validation ─────────────────────────────────────────────────────

function isValidImageBuffer(buf: Buffer): boolean {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) {
    if (buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return true;
  }
  return false;
}

async function optimizeImage(input: Buffer, tenantId: number, options: UploadMediaOptions): Promise<OptimizedImage> {
  const targetWidth = normalizeTargetSize(options.targetWidth);
  const targetHeight = normalizeTargetSize(options.targetHeight);
  const fit = options.fit === "contain" ? "contain" : "cover";
  const responsive = options.responsive === true;
  const widths = (options.widths && options.widths.length ? options.widths : DEFAULT_RESPONSIVE_WIDTHS)
    .filter((w) => Number.isFinite(w) && w >= 16 && w <= 4096)
    .sort((a, b) => a - b);

  // Base pipeline (rotate + optional crop-to-target). Used as source for either single-size or variants.
  let basePipeline = sharp(input, { failOn: "warning" }).rotate();
  if (targetWidth && targetHeight) {
    basePipeline = basePipeline.resize({
      width: targetWidth,
      height: targetHeight,
      fit,
      position: "centre",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    });
  }
  const prepared = await basePipeline.toBuffer();
  const baseFilename = `${tenantId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const lqip = await generateLqip(prepared);

  if (!responsive) {
    // Single-size: WebP primary + JPG fallback.
    const [fallbackBuffer, jpegBuffer] = await Promise.all([
      sharp(prepared).webp({ quality: 86, effort: 5 }).toBuffer(),
      sharp(prepared).jpeg({ quality: 82, mozjpeg: true }).toBuffer(),
    ]);
    const metadata = await sharp(fallbackBuffer).metadata();
    return {
      fallbackBuffer,
      jpegBuffer,
      filename: `${baseFilename}.webp`,
      jpegFilename: `${baseFilename}.jpg`,
      mimeType: "image/webp",
      sizeBytes: fallbackBuffer.byteLength,
      jpegSizeBytes: jpegBuffer.byteLength,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      lqip,
    };
  }

  // Responsive set — every width as WebP + JPG.
  const sourceMeta = await sharp(prepared).metadata();
  const sourceWidth = sourceMeta.width ?? widths[widths.length - 1];
  const effectiveWidths = widths.filter((w) => w <= sourceWidth);
  if (!effectiveWidths.length) effectiveWidths.push(sourceWidth);

  const variantOutputs: OptimizedVariantBuffer[] = await Promise.all(
    effectiveWidths.map(async (w) => {
      const resized = await sharp(prepared)
        .resize(w, null, { withoutEnlargement: true })
        .toBuffer();
      const resizedMeta = await sharp(resized).metadata();
      const [webpBuf, jpegBuf] = await Promise.all([
        sharp(resized).webp({ quality: 82, effort: 5 }).toBuffer(),
        sharp(resized).jpeg({ quality: 82, mozjpeg: true }).toBuffer(),
      ]);
      return {
        width: resizedMeta.width ?? w,
        height: resizedMeta.height ?? 0,
        webp: { buffer: webpBuf, filename: `${baseFilename}-w${w}.webp` },
        jpeg: { buffer: jpegBuf, filename: `${baseFilename}-w${w}.jpg` },
      };
    })
  );

  // Primary = largest variant
  const largest = variantOutputs[variantOutputs.length - 1];
  return {
    fallbackBuffer: largest.webp.buffer,
    jpegBuffer: largest.jpeg.buffer,
    filename: largest.webp.filename,
    jpegFilename: largest.jpeg.filename,
    mimeType: "image/webp",
    sizeBytes: largest.webp.buffer.byteLength,
    jpegSizeBytes: largest.jpeg.buffer.byteLength,
    width: largest.width,
    height: largest.height,
    variants: variantOutputs,
    lqip,
  };
}

async function generateLqip(buffer: Buffer): Promise<string> {
  try {
    const out = await sharp(buffer).resize(24, null, { withoutEnlargement: true }).blur(2).jpeg({ quality: 40 }).toBuffer();
    return `data:image/jpeg;base64,${out.toString("base64")}`;
  } catch {
    return "";
  }
}

function normalizeTargetSize(value?: number | null): number | null {
  if (!value || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < 1 || rounded > 5000) return null;
  return rounded;
}
