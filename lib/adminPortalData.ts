export type ActivityLevel = "info" | "warning" | "error";

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  level: ActivityLevel;
  source: string;
  actor: string;
  method: string;
  endpoint: string;
  status: number;
  message: string;
  traceId: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}

export interface FeatureUsageItem {
  label: string;
  percentage: number;
  detail: string;
}

export interface ApiDocEntry {
  path: string;
  method: string;
  summary: string;
  requestExample: string;
  responseExample: string;
  notes: string[];
}

const activityLogStore: ActivityLogEntry[] = [
  {
    id: "evt_1001",
    timestamp: "2026-05-07T09:10:00.000Z",
    level: "info",
    source: "api-gateway",
    actor: "system",
    method: "GET",
    endpoint: "/api/health",
    status: 200,
    message: "Health check resolved successfully.",
    traceId: "trace_health_001",
  },
  {
    id: "evt_1002",
    timestamp: "2026-05-07T09:12:10.000Z",
    level: "info",
    source: "logo-generator",
    actor: "guest",
    method: "POST",
    endpoint: "/api/generate",
    status: 200,
    message: "Logo generation completed.",
    traceId: "trace_gen_002",
  },
  {
    id: "evt_1003",
    timestamp: "2026-05-07T09:15:40.000Z",
    level: "warning",
    source: "auth",
    actor: "unknown@example.com",
    method: "POST",
    endpoint: "/auth/signin",
    status: 403,
    message: "Blocked by super-admin email allowlist.",
    traceId: "trace_auth_003",
  },
  {
    id: "evt_1004",
    timestamp: "2026-05-07T09:17:08.000Z",
    level: "info",
    source: "dashboard",
    actor: "devsinntechnologies@gmail.com",
    method: "POST",
    endpoint: "/auth/signin",
    status: 200,
    message: "Super admin signed in successfully.",
    traceId: "trace_auth_004",
  },
];

const activityLogTableName = "activity_logs";

const dashboardMetrics: DashboardMetric[] = [
  { label: "Total Users", value: "0", detail: "Awaiting live data..." },
  { label: "Logo Generations", value: "0", detail: "Awaiting live data..." },
  { label: "API Load (24h)", value: "0", detail: "Awaiting live data..." },
  { label: "System Events", value: "0", detail: "Awaiting live data..." },
];

export async function getPlatformStats() {
  const supabase = await getServiceRoleClient();
  if (!supabase) return dashboardMetrics; 

  try {
    const { count: userCount } = await supabase.from('api_keys').select('*', { count: 'exact', head: true });
    const { count: logoCount } = await supabase.from('logo_history').select('*', { count: 'exact', head: true });
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: apiCount } = await supabase.from('api_usage').select('*', { count: 'exact', head: true }).gte('created_at', oneDayAgo);

    const { count: activityCount } = await supabase.from('activity_logs').select('*', { count: 'exact', head: true });

    return [
      { label: "Total Users", value: (userCount || 0).toLocaleString(), detail: "Active API identities identified" },
      { label: "Logo Generations", value: (logoCount || 0).toLocaleString(), detail: "Successful generations in history" },
      { label: "API Load (24h)", value: (apiCount || 0).toLocaleString(), detail: "Total requests in the last 24 hours" },
      { label: "System Events", value: (activityCount || 0).toLocaleString(), detail: "Total activity logs captured" },
    ];
  } catch (err) {
    return dashboardMetrics;
  }
}

export async function getLiveActiveUsers() {
  const supabase = await getServiceRoleClient();
  if (!supabase) return 0;

  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('activity_logs')
    .select('actor')
    .gte('timestamp', fiveMinsAgo);

  if (!data) return 0;
  const uniqueUsers = new Set(data.map(item => item.actor));
  return uniqueUsers.size;
}

export async function getFeatureAdoption(): Promise<FeatureUsageItem[]> {
  const supabase = await getServiceRoleClient();
  if (!supabase) return featureUsage;

  try {
    const { data } = await supabase.from('activity_logs').select('endpoint');
    if (!data || data.length === 0) return featureUsage;

    const total = data.length;
    const counts = {
      gen: data.filter(d => d.endpoint === '/api/generate').length,
      design: data.filter(d => d.endpoint === '/api/designs').length,
      lib: data.filter(d => d.endpoint === '/api/library').length,
      auth: data.filter(d => d.endpoint === '/api/auth/session').length,
    };

    return [
      { label: "Logo Generator", percentage: Math.round((counts.gen / total) * 100) || 0, detail: "Core generation engine" },
      { label: "Saved Designs", percentage: Math.round((counts.design / total) * 100) || 0, detail: "Cloud library usage" },
      { label: "Favorites", percentage: Math.round((counts.lib / total) * 100) || 0, detail: "User bookmarking activity" },
      { label: "Auth Resolver", percentage: Math.round((counts.auth / total) * 100) || 0, detail: "Identity verification hits" },
    ];
  } catch (err) {
    return featureUsage;
  }
}

const featureUsage: FeatureUsageItem[] = [
  { label: "Logo Generator", percentage: 0, detail: "Awaiting live data..." },
  { label: "Saved Designs", percentage: 0, detail: "Awaiting live data..." },
  { label: "Favorites", percentage: 0, detail: "Awaiting live data..." },
  { label: "Auth Resolver", percentage: 0, detail: "Awaiting live data..." },
];

const apiDocs: ApiDocEntry[] = [
  {
    path: "/api/generate",
    method: "POST",
    summary: "AI Logo Generation Engine",
    requestExample: JSON.stringify({ name: "Brand", slogan: "Tagline", industryId: 23 }, null, 2),
    responseExample: JSON.stringify({ success: true, logos: [{ id: "lg_1", url: "..." }] }, null, 2),
    notes: ["Captures full business payload in activity_logs.", "Requires valid API key or session."],
  },
  {
    path: "/api/designs",
    method: "GET",
    summary: "Fetch User Design Library",
    requestExample: "curl -X GET /api/designs",
    responseExample: JSON.stringify([{ id: "ds_1", name: "My Logo" }], null, 2),
    notes: ["Returns all designs for the current user session."],
  },
  {
    path: "/api/designs",
    method: "POST",
    summary: "Save or Update Design",
    requestExample: JSON.stringify({ designJson: "{...}", name: "New Design" }, null, 2),
    responseExample: JSON.stringify({ success: true, id: "ds_99" }, null, 2),
    notes: ["Performs upsert logic based on design ID."],
  },
  {
    path: "/api/designs",
    method: "DELETE",
    summary: "Remove Design from Cloud",
    requestExample: "curl -X DELETE /api/designs?id=ds_99",
    responseExample: JSON.stringify({ success: true }, null, 2),
    notes: ["Permanent deletion. Requires ownership verification."],
  },
  {
    path: "/api/library",
    method: "GET",
    summary: "Fetch Favorite Logos",
    requestExample: "curl -X GET /api/library",
    responseExample: JSON.stringify([{ favoriteKey: "fav_1" }], null, 2),
    notes: ["Returns favorited logos for the current user."],
  },
  {
    path: "/api/library",
    method: "POST",
    summary: "Add/Remove Favorite",
    requestExample: JSON.stringify({ favoriteKey: "fav_01", action: "toggle" }, null, 2),
    responseExample: JSON.stringify({ success: true }, null, 2),
    notes: ["Used for the 'Heart' icon functionality."],
  },
  {
    path: "/api/auth/session",
    method: "GET",
    summary: "Unified Identity & Auth Resolver",
    requestExample: "curl -X GET /api/auth/session",
    responseExample: JSON.stringify({ user: { id: "u_1", email: "admin@smart.com" } }, null, 2),
    notes: ["Used by both Web and Admin portals.", "Logs IP and Actor identity."],
  },
  {
    path: "/api/industries",
    method: "GET",
    summary: "Fetch Supported Industry Taxonomies",
    requestExample: "curl -X GET /api/industries",
    responseExample: JSON.stringify({ industries: [{ id: 1, name: "Tech" }] }, null, 2),
    notes: ["Publicly accessible but rate-limited.", "Used for the industry selector."],
  }
];

function createTraceId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeLogLevel(value: string | undefined): ActivityLevel {
  if (value === "warning" || value === "error") {
    return value;
  }
  return "info";
}

function toLogStatus(status: number | undefined) {
  if (typeof status === "number" && Number.isFinite(status)) {
    return status;
  }
  return 200;
}

function normalizeLimit(limit: number | undefined) {
  if (!limit || !Number.isFinite(limit)) {
    return 50;
  }
  return Math.max(1, Math.min(Math.trunc(limit), 200));
}

async function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const { createClient } = await import("@supabase/supabase-js");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function fetchPersistentLogs(limit: number) {
  const client = await getServiceRoleClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from(activityLogTableName)
    .select("id,timestamp,level,source,actor,method,endpoint,status,message,trace_id")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return null;
  }

  return data.map((row) => ({
    id: String(row.id),
    timestamp: String(row.timestamp),
    level: normalizeLogLevel(String(row.level)),
    source: String(row.source),
    actor: String(row.actor),
    method: String(row.method),
    endpoint: String(row.endpoint),
    status: typeof row.status === "number" ? row.status : Number(row.status) || 200,
    message: String(row.message),
    traceId: String(row.trace_id ?? createTraceId("trace")),
  })) as ActivityLogEntry[];
}

async function insertPersistentLog(entry: ActivityLogEntry) {
  const client = await getServiceRoleClient();
  if (!client) {
    return false;
  }

  const { error } = await client.from(activityLogTableName).insert({
    id: entry.id,
    timestamp: entry.timestamp,
    level: entry.level,
    source: entry.source,
    actor: entry.actor,
    method: entry.method,
    endpoint: entry.endpoint,
    status: entry.status,
    message: entry.message,
    trace_id: entry.traceId,
  });

  return !error;
}

export function getDashboardMetrics() {
  return dashboardMetrics;
}

export function getFeatureUsage() {
  return featureUsage;
}

export function getApiDocs() {
  return apiDocs;
}

export async function listActivityLogs(limit = 50) {
  const normalizedLimit = normalizeLimit(limit);
  const persistentLogs = await fetchPersistentLogs(normalizedLimit);

  if (persistentLogs) {
    return persistentLogs;
  }

  return activityLogStore.slice(0, normalizedLimit);
}

export async function appendActivityLog(entry: Omit<ActivityLogEntry, "id" | "timestamp" | "traceId"> & { timestamp?: string }) {
  const record: ActivityLogEntry = {
    ...entry,
    id: createTraceId("evt"),
    timestamp: entry.timestamp || new Date().toISOString(),
    level: normalizeLogLevel(entry.level),
    status: toLogStatus(entry.status),
    traceId: createTraceId("trace"),
  };

  activityLogStore.unshift(record);
  if (activityLogStore.length > 200) {
    activityLogStore.length = 200;
  }

  await insertPersistentLog(record);

  return record;
}
