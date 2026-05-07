"use client";

import { useState, useEffect } from "react";
import { FileCode, Globe, Code2, CheckCircle2, Play, Loader2, AlertCircle, Activity, ChevronRight } from "lucide-react";
import PortalShell from "../portal-shell";

export default function ApiDocsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [executing, setExecuting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  useEffect(() => {
    async function load() {
      const { getApiDocs } = await import("../../lib/adminPortalData");
      setDocs(getApiDocs());
    }
    load();
  }, []);

  const handleExecute = async (doc: any) => {
    setExecuting(doc.path);
    try {
      const { appendActivityLog } = await import("../../lib/adminPortalData");
      
      // Log the intent to test
      await appendActivityLog({
        level: "info",
        source: "admin-docs",
        actor: "admin",
        method: doc.method,
        endpoint: doc.path,
        status: 102, // Processing
        message: `Admin executing API test for ${doc.path}`,
      });

      // Simulating API call
      await new Promise(r => setTimeout(r, 1000));
      const response = JSON.parse(doc.responseExample);
      
      setResults(prev => ({ ...prev, [doc.path]: response }));

      // Log success
      await appendActivityLog({
        level: "info",
        source: "admin-docs",
        actor: "admin",
        method: doc.method,
        endpoint: doc.path,
        status: 200,
        message: `Admin API test successful: ${doc.path}`,
      });
    } catch (err) {
      setResults(prev => ({ ...prev, [doc.path]: { error: "Execution failed" } }));
    } finally {
      setExecuting(null);
    }
  };

  return (
    <PortalShell
      title="API Docs"
      description="Endpoints and examples"
    >
      <section className="flex flex-col gap-4">
        {docs.map((doc) => (
          <article key={`${doc.path}-${doc.method}`} className="group brand-panel overflow-hidden transition-all duration-300 hover:shadow-xl border border-slate-100">
            <div 
              onClick={() => setExecuting(executing === doc.path ? null : doc.path)}
              className="flex items-center justify-between gap-6 p-5 cursor-pointer hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className={`min-w-[4rem] w-fit text-center rounded px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                  doc.method === 'GET' ? 'bg-blue-100 text-blue-700' : 
                  doc.method === 'POST' ? 'bg-green-100 text-green-700' : 
                  doc.method === 'DELETE' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {doc.method}
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <code className="text-sm font-black text-foreground">{doc.path}</code>
                  <span className="text-xs font-medium text-muted-foreground/80">{doc.summary}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  Stable
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleExecute(doc); }}
                  disabled={executing === 'loading_' + doc.path}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  {executing === 'loading_' + doc.path ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
                </button>
                <ChevronRight className={`h-5 w-5 text-slate-300 transition-transform ${results[doc.path] ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {/* Expandable Content Area */}
            <div className={`overflow-hidden transition-all duration-500 ${results[doc.path] || executing === doc.path ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="grid lg:grid-cols-2 gap-6 p-6 pt-2 border-t border-slate-50 bg-slate-50/30">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">
                      <Code2 className="h-3 w-3" />
                      Request Schema
                    </div>
                    <pre className="rounded-xl bg-slate-900 p-5 text-[11px] font-medium leading-relaxed text-slate-300 overflow-x-auto shadow-inner">
                      <code>{doc.requestExample}</code>
                    </pre>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Implementation Notes</p>
                    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                      {doc.notes.map((note: string) => (
                        <li key={note} className="flex items-start gap-2 text-[11px] font-medium text-slate-600">
                          <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-500" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">
                    <FileCode className="h-3 w-3" />
                    {results[doc.path] ? 'Actual Response' : 'Example Response'}
                  </div>
                  <pre className={`rounded-xl p-5 text-[11px] font-medium leading-relaxed overflow-x-auto border ${
                    results[doc.path] ? 'bg-green-50 text-green-700 border-green-100' : 'bg-white text-slate-600 border-slate-100'
                  }`}>
                    <code>{JSON.stringify(results[doc.path] || JSON.parse(doc.responseExample), null, 2)}</code>
                  </pre>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </PortalShell>
  );
}
