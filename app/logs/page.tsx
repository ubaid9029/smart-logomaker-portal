"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, ChevronRight, Clock, Database, Globe, RefreshCw, Shield, X } from "lucide-react";

import PortalShell from "../portal-shell";
import { createClient } from "@/lib/supabaseClient";

type ApiRequestLogEntry = {
  id: string;
  created_at: string;
  endpoint: string | null;
  method: string | null;
  path: string | null;
  query_params: Record<string, unknown> | null;
  user_id: string | null;
  api_key_id: string | null;
  ip_address: string | null;
  origin: string | null;
  referer: string | null;
  device_type: string | null;
  user_agent: string | null;
  response_status: number | null;
  response_message: string | null;
  duration_ms: number | null;
  app_source: string | null;
  request_type: string | null;
  event_name: string | null;
  is_success: boolean | null;
  business_name: string | null;
  industry_id: number | null;
  logo_count: number | null;
  error_code: string | null;
};

async function fetchRequestLogs(limit = 100): Promise<ApiRequestLogEntry[]> {
  const response = await fetch(`/api/request-logs?limit=${limit}`, { cache: "no-store" });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    return [];
  }

  return Array.isArray(payload.items) ? payload.items : [];
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ApiRequestLogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<ApiRequestLogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refreshLogs = async () => {
    try {
      setRefreshing(true);
      const nextLogs = await fetchRequestLogs(100);
      setLogs(nextLogs);
      setSelectedLog((current) => {
        if (!current) return null;
        return nextLogs.find((item) => item.id === current.id) || null;
      });
    } catch (error) {
      console.error("Failed to fetch request logs:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    const initialLoad = setTimeout(() => {
      void refreshLogs();
    }, 0);

    const channel = supabase
      .channel("api_request_logs_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "api_request_logs" },
        (payload: { new: ApiRequestLogEntry }) => {
          const nextLog = payload.new;
          setLogs((prev) => [nextLog, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      clearTimeout(initialLoad);
      supabase.removeChannel(channel);
    };
  }, []);

  const failedCount = logs.filter((log) => (log.response_status || 0) >= 400 || log.is_success === false).length;
  const successCount = logs.filter((log) => (log.response_status || 0) < 400 && log.is_success !== false).length;
  const logoEventsCount = logs.filter((log) => log.event_name === "logo_generate").length;

  return (
    <PortalShell title="Logs" description="Real response-aware request logs from api_request_logs">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Live Monitoring Active</span>
        </div>
        <button
          onClick={refreshLogs}
          className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-300 hover:text-orange-500"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Logs
        </button>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Rows", value: logs.length, icon: Database, tone: "bg-orange-50 text-orange-500" },
          { label: "Failures", value: failedCount, icon: AlertTriangle, tone: "bg-red-50 text-red-500" },
          { label: "Success", value: successCount, icon: CheckCircle2, tone: "bg-green-50 text-green-500" },
          { label: "Logo Events", value: logoEventsCount, icon: Activity, tone: "bg-indigo-50 text-indigo-500" },
        ].map((item) => (
          <article key={item.label} className="brand-panel rounded-none p-6">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center ${item.tone}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60">{item.label}</p>
            <p className="mt-2 text-3xl font-black text-foreground">{item.value}</p>
          </article>
        ))}
      </section>

      {loading ? (
        <div className="brand-panel rounded-none p-12 text-center text-sm font-bold text-muted-foreground">
          Loading real logs...
        </div>
      ) : (
        <div className="relative flex flex-col gap-8 lg:flex-row">
          <div className={`flex-1 transition-all duration-500 ${selectedLog ? "lg:mr-[540px]" : ""}`}>
            <section className="space-y-4 md:hidden">
              {logs.slice(0, 30).map((log) => (
                <article key={log.id} className="brand-panel rounded-none border-l-4 border-l-transparent p-5 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">{log.event_name || "request"}</p>
                    <span className={`rounded-none px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${(log.response_status || 0) >= 400 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                      {log.response_status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-foreground">{log.response_message || log.endpoint}</p>
                  <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="rounded-none bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{log.method}</span>
                      <span className="truncate">{log.endpoint}</span>
                    </div>
                    <p>{log.ip_address || "n/a"} | {log.device_type || "unknown"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedLog(log)}
                    className="mt-4 inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-300 hover:text-orange-500"
                  >
                    Open Details
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </section>

            <section className="brand-panel hidden overflow-hidden rounded-none md:block">
              <div className="w-full overflow-x-auto [scrollbar-width:thin]">
                <table className="w-full min-w-[940px] table-fixed text-left text-[10px]">
                  <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <tr>
                      <th className="w-[74px] px-2 py-3">Time</th>
                      <th className="w-[140px] px-2 py-3">Event</th>
                      <th className="w-[210px] px-2 py-3">Endpoint</th>
                      <th className="w-[64px] px-2 py-3">Status</th>
                      <th className="w-[86px] px-2 py-3">User</th>
                      <th className="w-[106px] px-2 py-3">IP</th>
                      <th className="w-[78px] px-2 py-3">Device</th>
                      <th className="w-[72px] px-2 py-3">Duration</th>
                      <th className="hidden w-[96px] px-2 py-3 2xl:table-cell">Business</th>
                      <th className="w-[56px] px-2 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className={`group transition-colors ${selectedLog?.id === log.id ? "bg-orange-50/50" : "even:bg-slate-50/80 hover:bg-orange-50/30"}`}
                      >
                        <td className="whitespace-nowrap px-2 py-3 text-[10px] font-bold text-muted-foreground/60">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="max-w-[140px] truncate px-2 py-3 font-black uppercase tracking-wide text-foreground">
                          {log.event_name || "request"}
                        </td>
                        <td className="bg-slate-100/20 px-2 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-none bg-white px-1.5 py-0.5 font-mono text-[8px] font-bold text-muted-foreground shadow-sm">{log.method}</span>
                            <span className="max-w-[158px] truncate font-bold text-slate-500">{log.endpoint}</span>
                          </div>
                        </td>
                        <td className="bg-slate-100/20 px-2 py-3">
                          <span className={`font-black ${(log.response_status || 0) < 400 ? "text-green-600" : "text-red-600"}`}>{log.response_status}</span>
                        </td>
                        <td className="px-2 py-3 font-mono font-black text-foreground">{log.user_id ? `${log.user_id.slice(0, 8)}...` : "guest"}</td>
                        <td className="bg-slate-100/20 px-2 py-3 font-mono text-slate-500">{log.ip_address || "n/a"}</td>
                        <td className="px-2 py-3 font-black text-foreground">{log.device_type || "unknown"}</td>
                        <td className="bg-slate-100/20 px-2 py-3 font-black text-slate-500">{log.duration_ms || 0}ms</td>
                        <td className="hidden max-w-[96px] truncate px-2 py-3 font-black text-foreground 2xl:table-cell">{log.business_name || "n/a"}</td>
                        <td className="px-2 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-orange-300 hover:text-orange-500"
                            aria-label="Open log details"
                          >
                            <ChevronRight className={`h-4 w-4 ${selectedLog?.id === log.id ? "text-orange-500" : ""}`} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {selectedLog && (
            <div className="fixed inset-y-0 right-0 z-[100] h-screen w-full animate-in slide-in-from-right border-l border-slate-100 bg-white shadow-2xl duration-300 lg:w-[540px]">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/20 p-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-foreground">Log Details</h3>
                      <span className={`rounded px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter ${(selectedLog.response_status || 0) < 400 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {selectedLog.response_status}
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">ID: {selectedLog.id.slice(0, 8)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:bg-slate-50 active:scale-95"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <div className="scrollbar-hide flex-1 space-y-8 overflow-y-auto p-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-slate-900 p-4 text-center">
                      <p className="mb-1 text-[8px] font-black uppercase text-slate-500">Status</p>
                      <p className={`text-xs font-black ${(selectedLog.response_status || 0) < 400 ? "text-green-400" : "text-red-400"}`}>{selectedLog.response_status}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-900 p-4 text-center">
                      <p className="mb-1 text-[8px] font-black uppercase text-slate-500">Latency</p>
                      <p className="text-xs font-black text-indigo-400">{selectedLog.duration_ms || 0}ms</p>
                    </div>
                    <div className="rounded-2xl bg-slate-900 p-4 text-center">
                      <p className="mb-1 text-[8px] font-black uppercase text-slate-500">Method</p>
                      <p className="text-xs font-black text-white">{selectedLog.method}</p>
                    </div>
                  </div>

                  <section>
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Context Audit</label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-500">Origin</span>
                        </div>
                        <span className="text-[11px] font-black text-slate-700">{selectedLog.origin || "Direct"}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                          <Shield className="h-4 w-4 text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-500">User</span>
                        </div>
                        <span className="max-w-[220px] truncate text-[11px] font-black text-slate-700">{selectedLog.user_id || "guest"}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-500">IP / Platform</span>
                        </div>
                        <span className="text-[11px] font-black text-slate-700">{selectedLog.ip_address || "N/A"} ({selectedLog.device_type || "unknown"})</span>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div>
                      <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Request Context</label>
                      <pre className="overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50 p-4 font-mono text-[10px] leading-relaxed text-slate-600 shadow-inner">
                        {JSON.stringify({
                          path: selectedLog.path,
                          query: selectedLog.query_params,
                          origin: selectedLog.origin,
                          referer: selectedLog.referer,
                          appSource: selectedLog.app_source,
                          requestType: selectedLog.request_type,
                        }, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Response Summary</label>
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[8px] font-black uppercase text-green-600">Format: Summary</span>
                      </div>
                      <pre className={`max-h-[400px] overflow-x-auto rounded-2xl border p-5 font-mono text-[11px] leading-relaxed shadow-2xl transition-colors ${(selectedLog.response_status || 0) < 400 ? "border-indigo-900 bg-indigo-950 text-indigo-200" : "border-red-900 bg-red-950 text-red-200"}`}>
                        <code>{JSON.stringify({
                          responseStatus: selectedLog.response_status,
                          responseMessage: selectedLog.response_message,
                          isSuccess: selectedLog.is_success,
                          errorCode: selectedLog.error_code,
                          businessName: selectedLog.business_name,
                          industryId: selectedLog.industry_id,
                          logoCount: selectedLog.logo_count,
                        }, null, 2)}</code>
                      </pre>
                    </div>
                  </section>

                  <section>
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Technical Preview</label>
                    <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-5">
                      {[
                        ["Endpoint", selectedLog.endpoint],
                        ["Method", selectedLog.method],
                        ["Path", selectedLog.path],
                        ["API Key", selectedLog.api_key_id],
                        ["User Agent", selectedLog.user_agent],
                        ["Event", selectedLog.event_name],
                      ].map(([key, value]) => (
                        <div key={String(key)} className="flex items-center justify-between gap-4">
                          <span className="text-[10px] font-bold capitalize text-slate-400">{key}</span>
                          <span className="max-w-[240px] truncate text-[10px] font-black text-slate-600">{String(value || "N/A")}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="flex items-center gap-3 rounded-2xl border border-orange-100/50 bg-orange-50/30 p-5">
                    <Clock className="h-5 w-5 animate-pulse text-orange-400" />
                    <p className="text-[10px] font-bold leading-tight text-orange-700">
                      Full execution took {selectedLog.duration_ms || "N/A"}ms. Log captured at {new Date(selectedLog.created_at).toLocaleTimeString()}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </PortalShell>
  );
}
