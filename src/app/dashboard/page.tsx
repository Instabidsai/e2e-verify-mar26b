"use client";

import { useState, useEffect } from "react";
import { Button, Card, StatusBadge, Spinner, BrainIcon } from "@/components/ui";

interface Agent {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "active" | "idle" | "error";
  is_ceo: boolean;
  last_activity?: string;
}

interface Activity {
  id: string;
  agent_name: string;
  action: string;
  detail: string;
  timestamp: string;
}

interface HealthStatus {
  status: string;
  supabase: string;
  llm: string;
  paperclip: string;
}

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [agentsRes, activityRes, healthRes] = await Promise.allSettled([
        fetch("/api/onboarding/agents").then((r) => r.json()),
        fetch("/api/onboarding/ceo-activity").then((r) => r.json()),
        fetch("/api/health").then((r) => r.json()),
      ]);

      if (agentsRes.status === "fulfilled" && agentsRes.value.agents?.length) {
        setAgents(agentsRes.value.agents);
      } else {
        setAgents(getDemoAgents());
      }

      if (activityRes.status === "fulfilled" && activityRes.value.activities?.length) {
        setActivities(activityRes.value.activities);
      } else {
        setActivities(getDemoActivities());
      }

      if (healthRes.status === "fulfilled") {
        setHealth(healthRes.value);
      }

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Spinner className="h-10 w-10 text-cyan-400" />
      </main>
    );
  }

  const activeCount = agents.filter((a) => a.status === "active").length;

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <BrainIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/onboarding">
              <Button variant="ghost" size="sm">Setup</Button>
            </a>
            <a href="/api/health" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">API Health</Button>
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Status Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Agents" value={String(agents.length)} sub={`${activeCount} active`} />
          <StatCard
            label="Supabase"
            value={health?.supabase === "connected" ? "OK" : health?.supabase || "—"}
            sub={health?.supabase || "Unknown"}
          />
          <StatCard
            label="LLM"
            value={health?.llm === "configured" ? "OK" : "—"}
            sub={health?.llm || "Unknown"}
          />
          <StatCard
            label="System"
            value={health?.status === "ok" ? "Healthy" : health?.status || "—"}
            sub={health?.status || "Unknown"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-white">Agent Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agents.map((agent) => (
                <Card key={agent.id} glow={agent.is_ceo}>
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                        agent.is_ceo
                          ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-white"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {agent.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">{agent.name}</span>
                        {agent.is_ceo && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-400 rounded">
                            CEO
                          </span>
                        )}
                        <StatusBadge status={agent.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {agent.department} &middot; {agent.role}
                      </p>
                      {agent.last_activity && (
                        <p className="text-xs text-gray-600 mt-1">
                          Last active: {new Date(agent.last_activity).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Card>
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((a) => (
                    <div
                      key={a.id}
                      className="flex gap-3 pb-3 border-b border-gray-800 last:border-0 last:pb-0"
                    >
                      <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-white">
                          <span className="font-medium text-cyan-400">{a.agent_name}</span>{" "}
                          {a.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{a.detail}</p>
                        {a.timestamp && (
                          <p className="text-[10px] text-gray-600 mt-0.5">
                            {new Date(a.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Links */}
            <h2 className="text-lg font-semibold text-white">Quick Links</h2>
            <Card>
              <div className="space-y-2">
                {[
                  { label: "Onboarding", href: "/onboarding" },
                  { label: "Health Check", href: "/api/health" },
                  { label: "JarvisSDK", href: "https://jarvissdk.com/dashboard" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition text-sm"
                  >
                    <span className="text-gray-300">{link.label}</span>
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-600">
        Powered by{" "}
        <a href="https://jarvissdk.com" className="text-cyan-500 hover:underline" target="_blank" rel="noopener noreferrer">
          JarvisSDK
        </a>
      </footer>
    </main>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
    </Card>
  );
}

// ─── Demo Data ───────────────────────────────────────────────────────────────

function getDemoAgents(): Agent[] {
  return [
    { id: "ceo-1", name: "Atlas", role: "CEO", department: "Executive", status: "active", is_ceo: true },
    { id: "mkt-1", name: "Scribe", role: "Content Strategist", department: "Marketing", status: "idle", is_ceo: false },
    { id: "dev-1", name: "Forge", role: "Lead Developer", department: "Engineering", status: "idle", is_ceo: false },
    { id: "ops-1", name: "Nexus", role: "Ops Manager", department: "Operations", status: "idle", is_ceo: false },
    { id: "sales-1", name: "Scout", role: "Growth Analyst", department: "Sales", status: "idle", is_ceo: false },
  ];
}

function getDemoActivities(): Activity[] {
  const now = Date.now();
  return [
    { id: "1", agent_name: "Atlas", action: "completed first analysis", detail: "Initial competitor scan done", timestamp: new Date(now - 300000).toISOString() },
    { id: "2", agent_name: "Atlas", action: "delegated tasks", detail: "Assigned 3 tasks to team", timestamp: new Date(now - 240000).toISOString() },
    { id: "3", agent_name: "Scribe", action: "started content plan", detail: "Drafting first blog post", timestamp: new Date(now - 180000).toISOString() },
    { id: "4", agent_name: "Scout", action: "began market research", detail: "Identifying key competitors", timestamp: new Date(now - 120000).toISOString() },
  ];
}
