import { NextResponse } from "next/server";
import { triggerHeartbeat, PAPERCLIP_URL, PAPERCLIP_BOARD_KEY } from "@/lib/paperclip";
import { listAgents } from "@/lib/jarvis-sdk";

export async function POST(request: Request) {
  try {
    if (!PAPERCLIP_URL || !PAPERCLIP_BOARD_KEY) {
      return NextResponse.json(
        { ok: false, error: "Paperclip not configured" },
        { status: 503 }
      );
    }

    // Get agent_id from body or find the CEO agent
    let agentId: string | undefined;

    try {
      const body = await request.json();
      agentId = body.agent_id;
    } catch {
      // No body — find CEO
    }

    if (!agentId) {
      const agentsResult = await listAgents();
      const ceo = agentsResult.data?.find((a) => a.is_ceo);
      agentId = ceo?.id;
    }

    if (!agentId) {
      return NextResponse.json(
        { ok: false, error: "No agent_id provided and no CEO agent found" },
        { status: 400 }
      );
    }

    const result = await triggerHeartbeat(agentId);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "Heartbeat failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, agent_id: agentId });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Heartbeat trigger failed" },
      { status: 500 }
    );
  }
}
