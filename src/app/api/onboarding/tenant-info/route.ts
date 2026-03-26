import { NextResponse } from "next/server";
import { getTenantInfo } from "@/lib/jarvis-sdk";

export async function GET() {
  const result = await getTenantInfo();

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error });
  }

  return NextResponse.json({ ok: true, info: result.data });
}
