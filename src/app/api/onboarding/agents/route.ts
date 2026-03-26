import { NextResponse } from "next/server";
import { listAgents } from "@/lib/jarvis-sdk";

export async function GET() {
  const result = await listAgents();

  if (!result.ok) {
    return NextResponse.json({ ok: false, agents: [], error: result.error });
  }

  return NextResponse.json({ ok: true, agents: result.data || [] });
}
