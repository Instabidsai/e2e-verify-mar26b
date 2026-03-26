import { NextResponse } from "next/server";
import { JARVIS_SDK_API_KEY } from "@/lib/jarvis-sdk";
import { PAPERCLIP_URL } from "@/lib/paperclip";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check Supabase connectivity
  let supabaseStatus = "not_configured";
  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: supabaseKey },
      });
      supabaseStatus = res.ok ? "connected" : "error";
    } catch {
      supabaseStatus = "error";
    }
  }

  // Check LLM configuration
  const llmStatus = JARVIS_SDK_API_KEY ? "configured" : "not_configured";

  // Check Paperclip
  const paperclipStatus = PAPERCLIP_URL ? "configured" : "not_configured";

  const checks = {
    status: supabaseStatus === "error" ? "degraded" : "ok",
    timestamp: new Date().toISOString(),
    supabase: supabaseStatus,
    llm: llmStatus,
    paperclip: paperclipStatus,
    jarvis_sdk: JARVIS_SDK_API_KEY ? "configured" : "not_configured",
  };

  const statusCode = checks.status === "ok" ? 200 : 503;
  return NextResponse.json(checks, { status: statusCode });
}
