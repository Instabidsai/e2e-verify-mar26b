import { NextResponse } from "next/server";
import { storeLLMKey, testLLMKey } from "@/lib/jarvis-sdk";

export async function POST(request: Request) {
  try {
    const { provider, api_key } = await request.json();

    if (!provider || !api_key) {
      return NextResponse.json(
        { ok: false, error: "Provider and api_key are required" },
        { status: 400 }
      );
    }

    const validProviders = ["openai", "anthropic", "openrouter"];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { ok: false, error: `Invalid provider. Use: ${validProviders.join(", ")}` },
        { status: 400 }
      );
    }

    // Test the key first
    const testResult = await testLLMKey(provider, api_key);
    if (!testResult.ok) {
      return NextResponse.json(
        { ok: false, error: testResult.error || "Key validation failed" },
        { status: 400 }
      );
    }

    // Store the key
    const storeResult = await storeLLMKey(provider, api_key);
    if (!storeResult.ok) {
      return NextResponse.json(
        { ok: false, error: storeResult.error || "Failed to store key" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, provider });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
