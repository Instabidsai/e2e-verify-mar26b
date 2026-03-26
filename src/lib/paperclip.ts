const PAPERCLIP_URL = process.env.PAPERCLIP_URL || "";
const PAPERCLIP_BOARD_KEY = process.env.PAPERCLIP_BOARD_KEY || "";

interface PaperclipResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function paperclipFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<PaperclipResponse<T>> {
  if (!PAPERCLIP_URL || !PAPERCLIP_BOARD_KEY) {
    return { ok: false, error: "Paperclip not configured" };
  }

  try {
    const res = await fetch(`${PAPERCLIP_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAPERCLIP_BOARD_KEY}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      return { ok: false, error: `${res.status}: ${text}` };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

export interface AgentActivity {
  id: string;
  agent_id: string;
  agent_name: string;
  action: string;
  detail: string;
  timestamp: string;
}

export async function triggerHeartbeat(agentId: string) {
  return paperclipFetch(`/api/agents/${agentId}/heartbeat/invoke`, {
    method: "POST",
  });
}

export async function getAgentActivity(agentId?: string) {
  const path = agentId
    ? `/api/agents/${agentId}/activity`
    : "/api/activity/recent";
  return paperclipFetch<AgentActivity[]>(path);
}

export { PAPERCLIP_URL, PAPERCLIP_BOARD_KEY };
