"use client";

import { useState, useEffect } from "react";
import { Terminal, Download, FileJson, X, ChevronRight, Activity, Clock, Shield, Globe } from "lucide-react";
import PortalShell from "../portal-shell";
import { createClient } from "@/lib/supabaseClient";

interface LogPayload {
  new: any;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time fetching using Supabase
  useEffect(() => {
    const supabase = createClient();
    
    // 1. Initial Load
    async function loadLogs() {
      const { listActivityLogs } = await import("../../lib/adminPortalData");
      const data = await listActivityLogs(100);
      setLogs(data);
      setLoading(false);
    }
    loadLogs();

    // 2. Real-time Subscription
    const channel = supabase
      .channel('realtime_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        (payload: any) => {
          console.log('New Log Received:', payload.new);
          setLogs((prev) => [payload.new, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <PortalShell
      title="Logs"
      description="Real-time activity monitoring"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Live Monitoring Active</span>
      </div>

      <div className="relative flex flex-col gap-8 lg:flex-row">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-500 ${selectedLog ? 'lg:mr-96' : ''}`}>
          {/* Mobile view cards */}
          <section className="space-y-4 md:hidden">
            {logs.slice(0, 30).map((log) => (
              <article 
                key={log.id} 
                onClick={() => setSelectedLog(log)}
                className={`brand-panel p-5 rounded-none cursor-pointer border-l-4 transition-all ${
                  selectedLog?.id === log.id ? 'border-l-orange-500 bg-orange-50/30' : 'border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">{log.source}</p>
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-none ${log.level === "error"
                    ? "bg-red-50 text-red-600"
                    : log.level === "warning"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-green-50 text-green-600"
                    }`}>
                    {log.level}
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold text-foreground">{log.message}</p>
                <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded-none text-[10px] text-muted-foreground">{log.method}</span>
                    <span className="truncate">{log.endpoint}</span>
                  </div>
                  <p>{log.actor} • {log.status}</p>
                </div>
              </article>
            ))}
          </section>

          {/* Desktop view table */}
          <section className="hidden md:block brand-panel rounded-none overflow-hidden">
            <div className="w-full">
              <table className="w-full text-left text-[11px] table-auto">
                <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  <tr>
                    <th className="px-3 py-4">Time</th>
                    <th className="px-3 py-4">Level</th>
                    <th className="px-3 py-4">Source</th>
                    <th className="px-3 py-4">Endpoint</th>
                    <th className="px-3 py-4">Actor</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-4 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="">
                  {logs.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className={`group cursor-pointer transition-colors ${
                        selectedLog?.id === log.id 
                        ? 'bg-orange-50/50' 
                        : 'hover:bg-orange-50/30 even:bg-slate-50/80'
                      }`}
                    >
                      <td className="whitespace-nowrap px-3 py-4 font-bold text-muted-foreground/60 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-3 py-4 bg-slate-100/20">
                        <span className={`inline-flex px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-none ${
                          log.level === "error" ? "bg-red-50 text-red-600" : 
                          log.level === "warning" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                        }`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-3 py-4 font-black text-foreground uppercase tracking-wider truncate max-w-[70px]">
                        {log.source}
                      </td>
                      <td className="px-3 py-4 bg-slate-100/20">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono bg-white px-1.5 py-0.5 rounded-none text-[9px] text-muted-foreground font-bold shadow-sm">{log.method}</span>
                          <span className="truncate max-w-[120px] font-bold text-slate-500">{log.endpoint}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 font-black text-foreground">{log.actor}</td>
                      <td className="px-3 py-4 bg-slate-100/20">
                        <span className={`font-black ${log.status < 400 ? 'text-green-600' : 'text-red-600'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <ChevronRight className={`inline-block h-4 w-4 transition-transform ${selectedLog?.id === log.id ? 'rotate-90 text-orange-500' : 'text-slate-300'}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Detail Panel - Complete Details */}
        {selectedLog && (
          <div className="fixed inset-y-0 right-0 z-[100] w-full bg-white shadow-2xl lg:w-[500px] border-l border-slate-100 animate-in slide-in-from-right duration-300 h-screen">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-slate-50/20">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-foreground">Log Details</h3>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                      selectedLog.status < 400 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedLog.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{selectedLog.traceId || 'ID: ' + selectedLog.id.slice(0, 8)}</p>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                {/* Core Metrics Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-900 rounded-2xl text-center">
                    <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Status</p>
                    <p className={`text-xs font-black ${selectedLog.status < 400 ? 'text-green-400' : 'text-red-400'}`}>{selectedLog.status}</p>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-2xl text-center">
                    <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Latency</p>
                    <p className="text-xs font-black text-indigo-400">{selectedLog.details?.durationMs || '0'}ms</p>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-2xl text-center">
                    <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Method</p>
                    <p className="text-xs font-black text-white">{selectedLog.method}</p>
                  </div>
                </div>

                {/* System & Origin Context */}
                <section>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 block mb-3">Context Audit</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-500">Origin</span>
                      </div>
                      <span className="text-[11px] font-black text-slate-700">{selectedLog.details?.origin || 'Direct'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-500">Actor</span>
                      </div>
                      <span className="text-[11px] font-black text-slate-700 truncate max-w-[200px]">{selectedLog.actor}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-500">IP / Platform</span>
                      </div>
                      <span className="text-[11px] font-black text-slate-700">{selectedLog.details?.ip} ({selectedLog.details?.platform})</span>
                    </div>
                  </div>
                </section>

                {/* Data Exchange */}
                <section className="space-y-6">
                  {/* Request Payload */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 block mb-3">Request Payload</label>
                    <pre className="p-4 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-mono overflow-x-auto leading-relaxed shadow-inner">
                      {JSON.stringify(selectedLog.details?.payload || { body: 'Empty' }, null, 2)}
                    </pre>
                  </div>

                  {/* Response Body */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 block">Response Body</label>
                      <span className="text-[8px] font-black uppercase bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Format: JSON</span>
                    </div>
                    <pre className={`p-5 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed max-h-[400px] shadow-2xl border transition-colors ${
                      selectedLog.status < 400 ? 'bg-indigo-950 text-indigo-200 border-indigo-900' : 'bg-red-950 text-red-200 border-red-900'
                    }`}>
                      <code>{JSON.stringify(selectedLog.details?.fullResponse || { message: selectedLog.message }, null, 2)}</code>
                    </pre>
                  </div>
                </section>

                {/* Raw Headers Preview */}
                <section>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 block mb-3">Technical Headers</label>
                  <div className="p-5 bg-white border border-slate-100 rounded-2xl space-y-2">
                    {selectedLog.details?.headers ? Object.entries(selectedLog.details.headers).map(([key, val]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-bold text-slate-400 capitalize">{key}</span>
                        <span className="text-[10px] font-black text-slate-600 truncate">{val || 'N/A'}</span>
                      </div>
                    )) : <p className="text-[10px] text-slate-400">No header metadata available</p>}
                  </div>
                </section>

                <div className="flex items-center gap-3 p-5 bg-orange-50/30 rounded-2xl border border-orange-100/50">
                  <Clock className="h-5 w-5 text-orange-400 animate-pulse" />
                  <p className="text-[10px] font-bold text-orange-700 leading-tight">
                    Full execution took {selectedLog.details?.durationMs || 'N/A'}ms. Log captured at {new Date(selectedLog.timestamp).toLocaleTimeString()}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}

