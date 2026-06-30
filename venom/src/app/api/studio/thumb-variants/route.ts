import { NextResponse } from "next/server";
import { SECTION_VARIANTS } from "@/sections/variants";

export const runtime = "nodejs";
export const revalidate = 0;

export function GET() {
  const list: Array<{ type: string; variant: string }> = [];
  for (const [type, variants] of Object.entries(SECTION_VARIANTS)) {
    for (const v of variants) {
      list.push({ type, variant: v.key });
    }
  }
  return NextResponse.json(list);
}
