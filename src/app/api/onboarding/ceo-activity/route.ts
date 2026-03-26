import { NextResponse } from "next/server";
import { getAgentActivity } from "@/lib/paperclip";

export async function GET() {
  const result = await getAgentActivity();

  if (!result.ok) {
    return NextResponse.json({ ok: false, activities: [] });
  }

  return NextResponse.json({ ok: true, activities: result.data || [] });
}
