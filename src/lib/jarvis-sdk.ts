const JARVIS_SDK_URL = process.env.JARVIS_SDK_URL || "https://jarvissdk.com";
const JARVIS_SDK_API_KEY = process.env.JARVIS_SDK_API_KEY || "";

interface SDKResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function sdkFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<SDKResponse<T>> {
  if (!JARVIS_SDK_API_KEY) {
    return { ok: false, error: "JARVIS_SDK_API_KEY not configured" };
  }

  try {
    const res = await fetch(`${JARVIS_SDK_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JARVIS_SDK_API_KEY}`,
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

// LLM Key management
export async function storeLLMKey(provider: string, apiKey: string) {
  return sdkFetch("/api/v1/llm-keys", {
    method: "POST",
    body: JSON.stringify({ provider, api_key: apiKey }),
  });
}

export async function testLLMKey(provider: string, apiKey: string) {
  return sdkFetch<{ valid: boolean; model?: string }>("/api/v1/llm-keys/test", {
    method: "POST",
    body: JSON.stringify({ provider, api_key: apiKey }),
  });
}

// LLM Completions (proxied through JarvisSDK)
export async function llmCompletion(
  messages: { role: string; content: string }[],
  model?: string
) {
  return sdkFetch<{ content: string; model: string; usage: unknown }>(
    "/api/v1/llm/completions",
    {
      method: "POST",
      body: JSON.stringify({ messages, model }),
    }
  );
}

// Service connections (OAuth)
export interface Connection {
  service: string;
  status: "connected" | "pending" | "error" | "not_connected";
  connected_at?: string;
}

export async function initiateConnection(service: string) {
  return sdkFetch<{ auth_url: string }>("/api/v1/connections/initiate", {
    method: "POST",
    body: JSON.stringify({ service }),
  });
}

export async function listConnections() {
  return sdkFetch<Connection[]>("/api/v1/connections");
}

// Agent roster
export interface Agent {
  id: string;
  name: string;
  role: string;
  department: string;
  description: string;
  status: "active" | "idle" | "error";
  is_ceo: boolean;
  last_activity?: string;
}

export async function listAgents() {
  return sdkFetch<Agent[]>("/api/v1/agents");
}

// Tenant info
export interface TenantInfo {
  id: string;
  company_name: string;
  app_url: string;
  supabase_url: string;
  github_repo: string;
  dashboard_url: string;
  llm_configured: boolean;
  agent_count: number;
}

export async function getTenantInfo() {
  return sdkFetch<TenantInfo>("/api/v1/tenant");
}

export { JARVIS_SDK_URL, JARVIS_SDK_API_KEY };
