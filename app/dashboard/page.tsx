"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Layers,
  Activity,
  Database,
  ArrowUpRight,
  MoreHorizontal,
  Loader2
} from "lucide-react";

import PortalShell from "../portal-shell";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [featureUsage, setFeatureUsage] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { getPlatformStats, getFeatureAdoption, listActivityLogs, getLiveActiveUsers } = await import("../../lib/adminPortalData");
        
        const [stats, features, logs, liveUsers] = await Promise.all([
          getPlatformStats(),
          getFeatureAdoption(),
          listActivityLogs(4),
          getLiveActiveUsers()
        ]);

        setMetrics(stats);
        setFeatureUsage(features);
        setRecentActivity(logs);
        setActiveUsers(liveUsers);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const metricIcons = {
    "Total Users": Users,
    "Logo Generations": Layers,
    "API Load (24h)": Activity,
    "System Events": Database
  };

  return (
    <PortalShell
      title="Dashboard"
      description={`${activeUsers} Live Active Users right now`}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Aggregating Live Data...</p>
        </div>
      ) : (
        <>
          <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metricIcons[metric.label as keyof typeof metricIcons] || Activity;
              const colorClass = 
                metric.label === "Total Users" ? "bg-blue-50 text-blue-500 shadow-blue-100" :
                metric.label === "Logo Generations" ? "bg-rose-50 text-rose-500 shadow-rose-100" :
                metric.label === "API Load (24h)" ? "bg-orange-50 text-orange-500 shadow-orange-100" :
                "bg-violet-50 text-violet-500 shadow-violet-100";
              
              return (
                <article 
                  key={metric.label} 
                  className="group relative overflow-hidden brand-panel p-8 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${colorClass} shadow-lg`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-green-50 text-green-500">
                      LIVE
                    </div>
                  </div>

                  <div className="mt-8 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{metric.label}</p>
                    <p className="mt-2 text-4xl font-black text-foreground tracking-tighter">{metric.value}</p>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="grid gap-8 lg:grid-cols-2 mt-8">
            <article className="brand-panel p-6 sm:p-8 rounded-[2.5rem]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-foreground">Feature Adoption</h3>
                <button className="text-xs font-bold text-orange-500 hover:underline">Analysis</button>
              </div>
              <div className="mt-10 space-y-8">
                {featureUsage.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between gap-4 text-xs font-bold">
                      <span className="text-muted-foreground uppercase tracking-[0.1em]">{item.label}</span>
                      <span className="text-foreground">{item.percentage}%</span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full brand-gradient-bg transition-all duration-1000 shadow-[0_0_12px_rgba(249,115,22,0.3)]"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="brand-panel p-6 sm:p-8 rounded-[2.5rem]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-foreground">Live Activity Stream</h3>
                <button className="text-xs font-bold text-orange-500 hover:underline">View All</button>
              </div>
              <div className="mt-8 space-y-1">
                {recentActivity.map((log) => (
                  <div key={log.id} className="group p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300 border-b border-slate-50 last:border-0">
                    <div className="flex items-center justify-between gap-3 text-[9px] font-black uppercase tracking-widest">
                      <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">{log.source}</span>
                      <span className={`px-2 py-0.5 rounded-full ${log.status < 400 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-foreground leading-snug truncate">{log.message}</p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                      <span className="font-mono bg-white px-2 py-0.5 rounded shadow-sm text-slate-400">{log.method}</span>
                      <span className="truncate opacity-60 group-hover:opacity-100 transition-opacity">{log.endpoint}</span>
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
