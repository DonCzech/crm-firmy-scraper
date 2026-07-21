import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { del, put } from "@vercel/blob";

export async function storePublicFile(pathname: string, data: Buffer, contentType: string) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, data, {
      access: "public",
      addRandomSuffix: false,
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("BLOB_READ_WRITE_TOKEN není nakonfigurován");
  }
  const target = join(process.cwd(), "public", "uploads", pathname);
  await mkdir(join(target, ".."), { recursive: true });
  await writeFile(target, data);
  return `/uploads/${pathname}`;
}

export async function deletePublicFile(url: string) {
  if (process.env.BLOB_READ_WRITE_TOKEN && /^https:\/\//.test(url)) {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  }
}
