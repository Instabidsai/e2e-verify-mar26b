"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  StatusBadge,
  StepIndicator,
  Spinner,
  CheckCircleIcon,
  BrainIcon,
  LinkIcon,
  UsersIcon,
  EyeIcon,
  RocketIcon,
} from "@/components/ui";

const STEPS = ["AI Brain", "Services", "Your Team", "Watch CEO", "Go Live"];

// ─── Types ───────────────────────────────────────────────────────────────────

type Provider = "openai" | "anthropic" | "openrouter";

interface ServiceStatus {
  service: string;
  label: string;
  status: "connected" | "pending" | "not_connected" | "error";
  icon: string;
}

interface AgentInfo {
  id: string;
  name: string;
  role: string;
  department: string;
  description: string;
  is_ceo: boolean;
  status: "active" | "idle" | "error";
}

interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState(0);

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <BrainIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">JarvisSDK</span>
          </div>
          <StepIndicator steps={STEPS} currentStep={step} />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center pt-8 pb-16 px-4">
        <div className="w-full max-w-2xl">
          {step === 0 && <StepConnectBrain onNext={() => setStep(1)} />}
          {step === 1 && (
            <StepConnectServices
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <StepMeetTeam
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepWatchCEO
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && <StepGoLive onBack={() => setStep(3)} />}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        Powered by{" "}
        <a
          href="https://jarvissdk.com"
          className="text-cyan-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          JarvisSDK
        </a>
      </footer>
    </main>
  );
}

// ─── Step 1: Connect Your AI Brain ───────────────────────────────────────────

function StepConnectBrain({ onNext }: { onNext: () => void }) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const providers: { id: Provider; name: string; placeholder: string }[] = [
    { id: "openai", name: "OpenAI", placeholder: "sk-..." },
    { id: "anthropic", name: "Anthropic", placeholder: "sk-ant-..." },
    { id: "openrouter", name: "OpenRouter", placeholder: "sk-or-..." },
  ];

  async function testAndStore() {
    if (!provider || !apiKey.trim()) return;
    setTesting(true);
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/onboarding/llm-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, api_key: apiKey.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult("success");
      } else {
        setResult("error");
        setErrorMsg(data.error || "Key validation failed");
      }
    } catch {
      setResult("error");
      setErrorMsg("Network error — check your connection");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <StepHeader
        icon={<BrainIcon className="w-8 h-8 text-cyan-400" />}
        title="Connect Your AI Brain"
        description="Choose your LLM provider and paste your API key. This powers all your AI agents."
      />

      <Card>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-300">
            Select Provider
          </label>
          <div className="grid grid-cols-3 gap-3">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProvider(p.id);
                  setResult(null);
                }}
                className={`p-4 rounded-lg border text-center transition-all ${
                  provider === p.id
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                    : "border-gray-700 hover:border-gray-600 text-gray-400"
                }`}
              >
                <div className="font-semibold text-sm">{p.name}</div>
              </button>
            ))}
          </div>

          {provider && (
            <>
              <label className="block text-sm font-medium text-gray-300 mt-4">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setResult(null);
                }}
                placeholder={
                  providers.find((p) => p.id === provider)?.placeholder
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-sm"
              />

              <Button
                onClick={testAndStore}
                loading={testing}
                disabled={!apiKey.trim()}
                className="w-full"
              >
                Test &amp; Save Key
              </Button>

              {result === "success" && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircleIcon className="w-5 h-5" />
                  Key verified and stored successfully!
                </div>
              )}
              {result === "error" && (
                <div className="text-red-400 text-sm">{errorMsg}</div>
              )}
            </>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} variant={result === "success" ? "primary" : "secondary"}>
          {result === "success" ? "Continue" : "Skip for Now"} &rarr;
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2: Connect Your Services ───────────────────────────────────────────

function StepConnectServices({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [services, setServices] = useState<ServiceStatus[]>([
    { service: "gmail", label: "Gmail", status: "not_connected", icon: "M" },
    { service: "slack", label: "Slack", status: "not_connected", icon: "S" },
    { service: "github", label: "GitHub", status: "not_connected", icon: "G" },
    { service: "stripe", label: "Stripe", status: "not_connected", icon: "$" },
    { service: "notion", label: "Notion", status: "not_connected", icon: "N" },
  ]);
  const [connecting, setConnecting] = useState<string | null>(null);

  async function connectService(service: string) {
    setConnecting(service);
    setServices((prev) =>
      prev.map((s) =>
        s.service === service ? { ...s, status: "pending" as const } : s
      )
    );

    try {
      const res = await fetch("/api/onboarding/connect-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service }),
      });
      const data = await res.json();

      if (data.auth_url) {
        // Open OAuth flow in new window
        window.open(data.auth_url, "_blank", "width=600,height=700");
        setServices((prev) =>
          prev.map((s) =>
            s.service === service ? { ...s, status: "pending" as const } : s
          )
        );
      } else {
        setServices((prev) =>
          prev.map((s) =>
            s.service === service
              ? { ...s, status: data.ok ? "connected" as const : "error" as const }
              : s
          )
        );
      }
    } catch {
      setServices((prev) =>
        prev.map((s) =>
          s.service === service ? { ...s, status: "error" as const } : s
        )
      );
    } finally {
      setConnecting(null);
    }
  }

  const connectedCount = services.filter(
    (s) => s.status === "connected"
  ).length;

  return (
    <div className="space-y-6">
      <StepHeader
        icon={<LinkIcon className="w-8 h-8 text-cyan-400" />}
        title="Connect Your Services"
        description="Link the tools your AI agents will use. You can always add more later."
      />

      <Card>
        <div className="space-y-3">
          {services.map((s) => (
            <div
              key={s.service}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-400">
                  {s.icon}
                </div>
                <div>
                  <div className="font-medium text-white">{s.label}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={s.status} />
                {s.status !== "connected" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => connectService(s.service)}
                    loading={connecting === s.service}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {connectedCount > 0 && (
          <p className="mt-4 text-sm text-gray-500">
            {connectedCount} of {services.length} services connected
          </p>
        )}
      </Card>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  );
}

// ─── Step 3: Meet Your Team ──────────────────────────────────────────────────

function StepMeetTeam({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch("/api/onboarding/agents");
        const data = await res.json();
        if (data.agents?.length) {
          setAgents(data.agents);
        } else {
          // Show demo agents if API not configured
          setAgents(getDemoAgents());
        }
      } catch {
        setAgents(getDemoAgents());
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  const ceo = agents.find((a) => a.is_ceo);
  const team = agents.filter((a) => !a.is_ceo);

  return (
    <div className="space-y-6">
      <StepHeader
        icon={<UsersIcon className="w-8 h-8 text-cyan-400" />}
        title="Meet Your Team"
        description="These AI agents are already assigned to your company and ready to work."
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8 text-cyan-400" />
        </div>
      ) : (
        <>
          {/* CEO Card */}
          {ceo && (
            <Card glow>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  C
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white text-lg">{ceo.name}</h3>
                    <span className="px-2 py-0.5 text-xs font-bold bg-cyan-500/20 text-cyan-400 rounded-full">
                      CEO
                    </span>
                    <StatusBadge status={ceo.status} />
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {ceo.description}
                  </p>
                  <p className="text-cyan-400 text-xs mt-2 font-medium">
                    Your CEO will start working in 5 minutes
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {team.map((agent) => (
              <Card key={agent.id}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 font-bold shrink-0">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-white text-sm">
                        {agent.name}
                      </h4>
                      <StatusBadge status={agent.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {agent.department} &middot; {agent.role}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {agent.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  );
}

// ─── Step 4: Watch Your CEO Think ────────────────────────────────────────────

function StepWatchCEO({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [phase, setPhase] = useState(0);

  const demoActivities: ActivityItem[] = [
    { id: "1", action: "Initializing", detail: "Setting up company workspace...", timestamp: "" },
    { id: "2", action: "Analyzing", detail: "Scanning industry and competitors...", timestamp: "" },
    { id: "3", action: "Planning", detail: "Drafting strategic priorities for Q1...", timestamp: "" },
    { id: "4", action: "Delegating", detail: "Assigning first tasks to team agents...", timestamp: "" },
    { id: "5", action: "Reporting", detail: "Compiling initial status report...", timestamp: "" },
    { id: "6", action: "Complete", detail: "First heartbeat cycle done! Your company is live.", timestamp: "" },
  ];

  const pollForActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding/ceo-activity");
      const data = await res.json();
      if (data.activities?.length) {
        setActivities(data.activities);
        return true;
      }
    } catch {
      // Fall through to demo
    }
    return false;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const hasReal = await pollForActivity();
      if (hasReal || cancelled) return;

      // Demo mode: reveal activities one by one
      for (let i = 0; i <= demoActivities.length && !cancelled; i++) {
        await new Promise((r) => setTimeout(r, i === 0 ? 500 : 2000));
        if (!cancelled) setPhase(i);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [pollForActivity]);

  const displayItems = activities.length > 0
    ? activities
    : demoActivities.slice(0, phase);

  const isComplete = phase >= demoActivities.length || activities.length >= 5;

  return (
    <div className="space-y-6">
      <StepHeader
        icon={<EyeIcon className="w-8 h-8 text-cyan-400" />}
        title="Watch Your CEO Think"
        description="Your AI CEO is running its first heartbeat — analyzing, planning, and delegating."
      />

      <Card>
        <div className="space-y-0">
          {displayItems.map((item, i) => (
            <div key={item.id} className="flex gap-3 py-3 relative">
              {/* Timeline line */}
              {i < displayItems.length - 1 && (
                <div className="absolute left-[11px] top-[28px] bottom-0 w-0.5 bg-gray-800" />
              )}
              {/* Dot */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  i === displayItems.length - 1 && !isComplete
                    ? "bg-cyan-500/20 border-2 border-cyan-500"
                    : "bg-cyan-500"
                }`}
              >
                {i === displayItems.length - 1 && !isComplete ? (
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                ) : (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {/* Content */}
              <div>
                <p className="text-sm font-medium text-white">{item.action}</p>
                <p className="text-xs text-gray-400">{item.detail}</p>
              </div>
            </div>
          ))}

          {displayItems.length === 0 && (
            <div className="flex items-center gap-3 py-6 justify-center text-gray-500">
              <Spinner className="h-5 w-5" />
              <span className="text-sm">Waiting for CEO to start...</span>
            </div>
          )}
        </div>
      </Card>

      <NavButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel={isComplete ? "Continue" : "Skip Ahead"}
        nextVariant={isComplete ? "primary" : "secondary"}
      />
    </div>
  );
}

// ─── Step 5: You're Live! ────────────────────────────────────────────────────

function StepGoLive({ onBack }: { onBack: () => void }) {
  const [info, setInfo] = useState<{
    app_url: string;
    supabase_url: string;
    github_repo: string;
    dashboard_url: string;
  } | null>(null);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await fetch("/api/onboarding/tenant-info");
        const data = await res.json();
        if (data.ok) setInfo(data.info);
      } catch {
        // Use fallback
      }
    }
    fetchInfo();
  }, []);

  const siteUrl = info?.app_url || (typeof window !== "undefined" ? window.location.origin : "");

  const links = [
    { label: "Your App", url: siteUrl, desc: "Your live application" },
    {
      label: "Supabase Dashboard",
      url: info?.supabase_url ? `${info.supabase_url.replace(".supabase.co", "")}/project` : "#",
      desc: "Database & auth",
    },
    { label: "GitHub Repo", url: info?.github_repo || "#", desc: "Source code" },
    {
      label: "JarvisSDK Dashboard",
      url: info?.dashboard_url || "https://jarvissdk.com/dashboard",
      desc: "Agent management",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 mx-auto">
          <RocketIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">You&apos;re Live!</h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Your AI-powered company is up and running. Your agents are working,
          your infrastructure is deployed, and everything is connected.
        </p>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
          Your Links
        </h3>
        <div className="space-y-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition group"
            >
              <div>
                <div className="font-medium text-white group-hover:text-cyan-400 transition">
                  {link.label}
                </div>
                <div className="text-xs text-gray-500">{link.desc}</div>
              </div>
              <svg
                className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </a>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
          What Happens Next
        </h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex gap-2">
            <span className="text-cyan-400 shrink-0">1.</span>
            Your CEO agent runs every 4 hours, analyzing data and delegating tasks
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-400 shrink-0">2.</span>
            Team agents execute tasks — writing content, analyzing competitors, managing ops
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-400 shrink-0">3.</span>
            Activity shows up in your dashboard — monitor, adjust, and grow
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-400 shrink-0">4.</span>
            Connect more services anytime from Settings to expand agent capabilities
          </li>
        </ul>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          &larr; Back
        </Button>
        <a href="/dashboard">
          <Button size="lg">Go to Dashboard &rarr;</Button>
        </a>
      </div>
    </div>
  );
}

// ─── Shared Sub-Components ───────────────────────────────────────────────────

function StepHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-2">
      <div className="shrink-0 mt-1">{icon}</div>
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextVariant = "primary",
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextVariant?: "primary" | "secondary";
}) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" onClick={onBack}>
        &larr; Back
      </Button>
      <Button variant={nextVariant} onClick={onNext}>
        {nextLabel} &rarr;
      </Button>
    </div>
  );
}

// ─── Demo Data ───────────────────────────────────────────────────────────────

function getDemoAgents(): AgentInfo[] {
  return [
    {
      id: "ceo-1",
      name: "Atlas",
      role: "Chief Executive Officer",
      department: "Executive",
      description:
        "Oversees all operations, sets strategic priorities, and coordinates team agents. Runs every 4 hours.",
      is_ceo: true,
      status: "active",
    },
    {
      id: "mkt-1",
      name: "Scribe",
      role: "Content Strategist",
      department: "Marketing",
      description: "Creates blog posts, social content, and marketing copy.",
      is_ceo: false,
      status: "idle",
    },
    {
      id: "dev-1",
      name: "Forge",
      role: "Lead Developer",
      department: "Engineering",
      description: "Builds features, fixes bugs, and manages deployments.",
      is_ceo: false,
      status: "idle",
    },
    {
      id: "ops-1",
      name: "Nexus",
      role: "Operations Manager",
      department: "Operations",
      description: "Monitors systems, handles alerts, and manages infrastructure.",
      is_ceo: false,
      status: "idle",
    },
    {
      id: "sales-1",
      name: "Scout",
      role: "Growth Analyst",
      department: "Sales",
      description: "Researches competitors, identifies opportunities, and tracks KPIs.",
      is_ceo: false,
      status: "idle",
    },
  ];
}
