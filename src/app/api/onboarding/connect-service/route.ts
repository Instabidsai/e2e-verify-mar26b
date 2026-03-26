import { NextResponse } from "next/server";
import { initiateConnection } from "@/lib/jarvis-sdk";

export async function POST(request: Request) {
  try {
    const { service } = await request.json();

    if (!service) {
      return NextResponse.json(
        { ok: false, error: "Service name is required" },
        { status: 400 }
      );
    }

    const validServices = ["gmail", "slack", "github", "stripe", "notion"];
    if (!validServices.includes(service)) {
      return NextResponse.json(
        { ok: false, error: `Invalid service. Use: ${validServices.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await initiateConnection(service);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "Failed to initiate connection" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      auth_url: result.data?.auth_url,
      service,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
