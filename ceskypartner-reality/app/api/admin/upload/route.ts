import { NextRequest } from "next/server";
import sharp from "sharp";
import { execFile } from "child_process";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";
import { uploadToR2, isR2Configured } from "@/lib/r2";
import { isWatermarkEnabled } from "@/lib/settings";
import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import { join } from "path";

const execFileAsync = promisify(execFile);

/** SVG vodoznak — logo Český Partner vypálené do levého dolního rohu fotky.
 *  Na rozdíl od CSS overlaye přežije stažení obrázku. */
function watermarkSvg(imgWidth: number): Buffer {
  const s = Math.max(imgWidth / 1600, 0.4); // škáluje se s šířkou fotky
  const f1 = Math.round(22 * s);
  const f2 = Math.round(10 * s);
  const w = Math.round(340 * s);
  const h = Math.round(58 * s);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <g font-family="Helvetica, Arial, sans-serif">
      <text x="0" y="${f1}" font-size="${f1}" font-weight="600" letter-spacing="${(4 * s).toFixed(1)}" fill="white" fill-opacity="0.72" stroke="black" stroke-opacity="0.18" stroke-width="0.6">ČESKÝ PARTNER</text>
      <text x="1" y="${Math.round(f1 + f2 * 1.5)}" font-size="${f2}" letter-spacing="${(6 * s).toFixed(1)}" fill="white" fill-opacity="0.5">REALITNÍ KANCELÁŘ</text>
    </g>
  </svg>`);
}

async function convertVideoToAv1(inputBuffer: Buffer, inputName: string): Promise<{ buffer: Buffer<ArrayBuffer>; filename: string }> {
  const tmpDir = join(process.cwd(), ".tmp");
  await mkdir(tmpDir, { recursive: true });
  const ts = Date.now().toString(36);
  const inputPath = join(tmpDir, `${ts}-input-${inputName}`);
  const outputName = inputName.replace(/\.[^.]+$/, ".mp4");
  const outputPath = join(tmpDir, `${ts}-av1-${outputName}`);

  await writeFile(inputPath, inputBuffer);

  try {
    await execFileAsync("ffmpeg", [
      "-i", inputPath,
      "-c:v", "libaom-av1",
      "-crf", "30",
      "-b:v", "0",
      "-cpu-used", "6",
      "-row-mt", "1",
      "-c:a", "libopus",
      "-b:a", "128k",
      "-movflags", "+faststart",
      "-y",
      outputPath,
    ], { timeout: 300_000 });

    const raw = await readFile(outputPath);
    const buffer = Buffer.from(raw.buffer, raw.byteOffset, raw.byteLength) as Buffer<ArrayBuffer>;
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
    return { buffer, filename: outputName };
  } catch (e: any) {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
    throw new Error(`FFmpeg AV1 konverze selhala: ${e.stderr || e.message}`);
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const listingId = formData.get("listingId") as string | null;
  const blogPostId = formData.get("blogPostId") as string | null;
  const skipVideoConvert = formData.get("skipVideoConvert") === "true";
  // Vodoznak: fotky inzerátů (listingId) nebo explicitní flag (nový inzerát ještě id nemá)
  const wantsWatermark = Boolean(listingId) || formData.get("watermark") === "true";

  if (!file) return jsonError("Chybi soubor");

  const bytes = await file.arrayBuffer();
  let buffer = Buffer.from(bytes);
  let filename = file.name;
  let mimeType = file.type;
  let width: number | undefined;
  let height: number | undefined;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (isImage && file.type !== "image/svg+xml") {
    let pipeline = sharp(buffer);
    const metadata = await pipeline.metadata();

    // Vodoznak jen do fotek inzerátů (ne blog/dokumenty), řízeno admin nastavením
    if (wantsWatermark && metadata.width && metadata.height && (await isWatermarkEnabled())) {
      const svg = watermarkSvg(metadata.width);
      const wmMeta = await sharp(svg).metadata();
      const margin = Math.round(Math.max(metadata.width / 1600, 0.4) * 28);
      pipeline = pipeline.composite([
        {
          input: svg,
          left: margin,
          top: Math.max(0, metadata.height - (wmMeta.height || 0) - margin),
        },
      ]);
    }

    buffer = await pipeline.webp({ quality: 82 }).toBuffer();
    filename = filename.replace(/\.[^.]+$/, ".webp");
    mimeType = "image/webp";
    width = metadata.width;
    height = metadata.height;
  }

  if (isVideo && !skipVideoConvert) {
    try {
      const result = await convertVideoToAv1(buffer, filename);
      buffer = result.buffer;
      filename = result.filename;
      mimeType = "video/mp4";
    } catch (e: any) {
      console.error("AV1 conversion failed, using original:", e.message);
    }
  }

  const timestamp = Date.now().toString(36);
  const safeName = filename
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();
  const key = `${isImage ? "images" : isVideo ? "videos" : "files"}/${timestamp}-${safeName}`;

  let url: string;

  if (isR2Configured()) {
    url = await uploadToR2(key, buffer, mimeType);
  } else {
    const localDir = join(process.cwd(), "public", "uploads", isImage ? "images" : isVideo ? "videos" : "files");
    await mkdir(localDir, { recursive: true });
    const localPath = join(localDir, `${timestamp}-${safeName}`);
    await writeFile(localPath, buffer);
    url = `/uploads/${isImage ? "images" : isVideo ? "videos" : "files"}/${timestamp}-${safeName}`;
  }

  const media = await prisma.media.create({
    data: {
      url,
      key,
      filename: safeName,
      mimeType,
      size: buffer.length,
      width: width || null,
      height: height || null,
      listingId: listingId || null,
      blogPostId: blogPostId || null,
    },
  });

  return jsonOk(media, 201);
}
