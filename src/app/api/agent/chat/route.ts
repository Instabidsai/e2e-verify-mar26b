import { NextResponse } from "next/server";
import { llmCompletion, JARVIS_SDK_API_KEY } from "@/lib/jarvis-sdk";

export async function POST(request: Request) {
  try {
    const { message, agent_id } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { ok: false, error: "Message is required" },
        { status: 400 }
      );
    }

    if (!JARVIS_SDK_API_KEY) {
      return NextResponse.json(
        {
          ok: false,
          error: "AI provider not configured. Set up your provider at /onboarding",
        },
        { status: 503 }
      );
    }

    const messages = [
      {
        role: "system",
        content: agent_id
          ? `You are an AI agent (${agent_id}) working for this company. Be helpful, concise, and professional.`
          : "You are an AI assistant for this company. Be helpful, concise, and professional.",
      },
      { role: "user", content: message },
    ];

    const result = await llmCompletion(messages);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "Completion failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      content: result.data?.content,
      model: result.data?.model,
      usage: result.data?.usage,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
