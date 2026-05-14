"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Layers,
  Activity,
  Database,
  Loader2,
} from "lucide-react";

import PortalShell from "../portal-shell";

type DashboardMetric = { label: string; value: string; detail: string };
type FeatureUsageItem = { label: string; percentage: number; detail: string };
type RecentRequestLog = {
  id: string;
  event_name: string | null;
  response_status: number | null;
  response_message: string | null;
  endpoint: string | null;
  method: string | null;
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsageItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentRequestLog[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/dashboard-stats", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Dashboard stats request failed: ${response.status}`);
        }

        const payload = await response.json();
        setMetrics(payload.metrics || []);
        setFeatureUsage(payload.featureUsage || []);
        setRecentActivity(payload.recentActivity || []);
        setActiveUsers(payload.activeUsers || 0);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const metricIcons = {
    "Total Users": Users,
    "Logo Generations": Layers,
    "API Load (24h)": Activity,
    "System Events": Database,
  };

  return (
    <PortalShell title="Dashboard" description={`${activeUsers} Live Active Users right now`}>
      {loading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          <p className="animate-pulse text-xs font-black uppercase tracking-widest text-muted-foreground">Aggregating Live Data...</p>
        </div>
      ) : (
        <>
          <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metricIcons[metric.label as keyof typeof metricIcons] || Activity;
              const colorClass =
                metric.label === "Total Users"
                  ? "bg-blue-50 text-blue-500 shadow-blue-100"
                  : metric.label === "Logo Generations"
                    ? "bg-rose-50 text-rose-500 shadow-rose-100"
                    : metric.label === "API Load (24h)"
                      ? "bg-orange-50 text-orange-500 shadow-orange-100"
                      : "bg-violet-50 text-violet-500 shadow-violet-100";

              return (
                <article
                  key={metric.label}
                  className="group relative overflow-hidden rounded-[2.5rem] brand-panel p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative z-10 flex items-start justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 ${colorClass}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-green-500">
                      LIVE
                    </div>
                  </div>

                  <div className="relative z-10 mt-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{metric.label}</p>
                    <p className="mt-2 text-4xl font-black tracking-tighter text-foreground">{metric.value}</p>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-2">
            <article className="brand-panel rounded-[2.5rem] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-foreground">Feature Adoption</h3>
                <button className="text-xs font-bold text-orange-500 hover:underline">Analysis</button>
              </div>
              <div className="mt-10 space-y-8">
                {featureUsage.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between gap-4 text-xs font-bold">
                      <span className="uppercase tracking-[0.1em] text-muted-foreground">{item.label}</span>
                      <span className="text-foreground">{item.percentage}%</span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full brand-gradient-bg shadow-[0_0_12px_rgba(249,115,22,0.3)] transition-all duration-1000"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="brand-panel rounded-[2.5rem] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-foreground">Live Activity Stream</h3>
                <button className="text-xs font-bold text-orange-500 hover:underline">View All</button>
              </div>
              <div className="mt-8 space-y-1">
                {recentActivity.map((log) => (
                  <div key={log.id} className="group rounded-2xl border-b border-slate-50 p-4 transition-all duration-300 last:border-0 hover:bg-slate-50">
                    <div className="flex items-center justify-between gap-3 text-[9px] font-black uppercase tracking-widest">
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-500">{log.event_name || "request"}</span>
                      <span className={`rounded-full px-2 py-0.5 ${(log.response_status || 0) < 400 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                        {log.response_status}
                      </span>
                    </div>
                    <p className="mt-3 truncate text-sm font-bold leading-snug text-foreground">{log.response_message || log.endpoint}</p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                      <span className="rounded bg-white px-2 py-0.5 font-mono text-slate-400 shadow-sm">{log.method || "GET"}</span>
                      <span className="truncate opacity-60 transition-opacity group-hover:opacity-100">{log.endpoint}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </PortalShell>
  );
}
