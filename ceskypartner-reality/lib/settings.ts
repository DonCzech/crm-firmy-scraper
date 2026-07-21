import { prisma } from "./prisma";

/** Přečte hodnotu z tabulky Setting; při chybě nebo chybějícím klíči vrací fallback. */
export async function getSetting(key: string, fallback = ""): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } }).catch(() => null);
  return row?.value ?? fallback;
}

/** Vodoznak na fotografiích inzerátů — výchozí stav vypnuto. */
export async function isWatermarkEnabled(): Promise<boolean> {
  return (await getSetting("watermark_enabled", "0")) === "1";
}
