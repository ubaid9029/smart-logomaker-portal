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
  id: string;
  path: string;
  method: string;
  summary: string;
  queryExample?: string;
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
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: userCount },
      { count: logoRequestCount },
      { count: apiCount },
      { count: eventCount },
    ] = await Promise.all([
      supabase.from("api_request_logs").select("user_id", { count: "exact", head: true }).not("user_id", "is", null),
      supabase.from("api_request_logs").select("id", { count: "exact", head: true }).eq("event_name", "logo_generate").eq("is_success", true),
      supabase.from("api_request_logs").select("id", { count: "exact", head: true }).gte("created_at", oneDayAgo),
      supabase.from("api_request_logs").select("id", { count: "exact", head: true }).not("event_name", "is", null),
    ]);

    return [
      { label: "Total Users", value: (userCount || 0).toLocaleString(), detail: "Identified requests with linked users" },
      { label: "Logo Generations", value: (logoRequestCount || 0).toLocaleString(), detail: "Successful logo generation requests" },
      { label: "API Load (24h)", value: (apiCount || 0).toLocaleString(), detail: "Total requests in the last 24 hours" },
      { label: "System Events", value: (eventCount || 0).toLocaleString(), detail: "Requests tagged with business events" },
    ];
  } catch {
    return dashboardMetrics;
  }
}

export async function getLiveActiveUsers() {
  const supabase = await getServiceRoleClient();
  if (!supabase) return 0;

  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("api_request_logs")
    .select("user_id, ip_address")
    .gte("created_at", fiveMinsAgo);

  if (!data) return 0;
  const uniqueUsers = new Set(
    data
      .map((item) => item.user_id || item.ip_address)
      .filter((value): value is string => Boolean(value))
  );
  return uniqueUsers.size;
}

export async function getFeatureAdoption(): Promise<FeatureUsageItem[]> {
  const supabase = await getServiceRoleClient();
  if (!supabase) return featureUsage;

  try {
    const { data } = await supabase.from("api_request_logs").select("endpoint");
    if (!data || data.length === 0) return featureUsage;

    const total = data.length;
    const counts = {
      gen: data.filter((d) => d.endpoint === "/api/generate").length,
      design: data.filter((d) => d.endpoint === "/api/designs").length,
      lib: data.filter((d) => d.endpoint === "/api/library").length,
      auth: data.filter((d) => d.endpoint === "/api/auth/session").length,
    };

    return [
      { label: "Logo Generator", percentage: Math.round((counts.gen / total) * 100) || 0, detail: "Core generation engine" },
      { label: "Saved Designs", percentage: Math.round((counts.design / total) * 100) || 0, detail: "Cloud library usage" },
      { label: "Favorites", percentage: Math.round((counts.lib / total) * 100) || 0, detail: "User bookmarking activity" },
      { label: "Auth Resolver", percentage: Math.round((counts.auth / total) * 100) || 0, detail: "Identity verification hits" },
    ];
  } catch {
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
    id: "api-root-get",
    path: "/api",
    method: "GET",
    summary: "API root redirect",
    requestExample: "curl -X GET /api",
    responseExample: JSON.stringify({ redirect: "/api-docs" }, null, 2),
    notes: ["Redirects direct browser hits to the documentation screen.", "Uses the configured app URL as the redirect base."],
  },
  {
    id: "generate-post",
    path: "/api/generate",
    method: "POST",
    summary: "AI Logo Generation Engine",
    requestExample: JSON.stringify({ name: "Brand", slogan: "Tagline", industryId: 23, fontId: "1", colorId: "1" }, null, 2),
    responseExample: JSON.stringify({ data: [{ logoId: "lg_1", url: "..." }] }, null, 2),
    notes: ["Requires a valid API key or authenticated session.", "Rejects empty business names and unsupported color IDs.", "Forwards the request to LogoAI and logs the result in api_request_logs."],
  },
  {
    id: "designs-get",
    path: "/api/designs",
    method: "GET",
    summary: "Fetch User Design Library",
    requestExample: "curl -X GET /api/designs",
    responseExample: JSON.stringify([{ id: "ds_1", user_id: "user_1", image_path: "/logos/1.png", design_json: { objects: [] } }], null, 2),
    notes: ["Requires an authenticated Supabase user.", "Returns designs ordered by updated_at descending."],
  },
  {
    id: "designs-post",
    path: "/api/designs",
    method: "POST",
    summary: "Save or Update Design",
    requestExample: JSON.stringify({ id: "optional-design-id", designJson: { objects: [] }, imagePath: "/logos/fresh.png" }, null, 2),
    responseExample: JSON.stringify({ id: "ds_99", user_id: "user_1", image_path: "/logos/fresh.png", design_json: { objects: [] } }, null, 2),
    notes: ["Creates a new design when id is omitted.", "Updates an existing owned design when id is provided."],
  },
  {
    id: "designs-delete",
    path: "/api/designs",
    method: "DELETE",
    summary: "Remove Design from Cloud",
    queryExample: "id=ds_99",
    requestExample: "curl -X DELETE /api/designs?id=ds_99",
    responseExample: JSON.stringify({ success: true }, null, 2),
    notes: ["Requires an authenticated user.", "Needs the id query parameter."],
  },
  {
    id: "library-get",
    path: "/api/library",
    method: "GET",
    summary: "Fetch Favorite Logos",
    requestExample: "curl -X GET /api/library",
    responseExample: JSON.stringify([{ favorite_key: "fav_1", user_id: "user_1", image_url: "https://..." }], null, 2),
    notes: ["Requires an authenticated user.", "Returns favorite logos ordered by updated_at descending."],
  },
  {
    id: "library-post",
    path: "/api/library",
    method: "POST",
    summary: "Save Favorite Logo",
    requestExample: JSON.stringify({ favoriteKey: "fav_01", rowData: { image_url: "https://...", business_name: "Brand" } }, null, 2),
    responseExample: JSON.stringify({ favorite_key: "fav_01", user_id: "user_1", image_url: "https://..." }, null, 2),
    notes: ["Upserts by user_id + favorite_key.", "Used when a logo is bookmarked from the editor or results page."],
  },
  {
    id: "library-delete",
    path: "/api/library",
    method: "DELETE",
    summary: "Delete Favorite Logo",
    queryExample: "favoriteKey=fav_01",
    requestExample: "curl -X DELETE '/api/library?favoriteKey=fav_01'",
    responseExample: JSON.stringify({ success: true }, null, 2),
    notes: ["Requires an authenticated user.", "Needs the favoriteKey query parameter."],
  },
  {
    id: "auth-session-get",
    path: "/api/auth/session",
    method: "GET",
    summary: "Unified Identity & Auth Resolver",
    requestExample: "curl -X GET /api/auth/session",
    responseExample: JSON.stringify({ user: { id: "u_1", email: "admin@smart.com" } }, null, 2),
    notes: ["Always responds with status 200.", "Returns user: null when the session is missing or resolution fails."],
  },
  {
    id: "industries-get",
    path: "/api/industries",
    method: "GET",
    summary: "Fetch Supported Industry Taxonomies",
    requestExample: "curl -X GET /api/industries",
    responseExample: JSON.stringify([{ id: 1, name: "Tech" }], null, 2),
    notes: ["Protected by the shared API security layer.", "Falls back to an empty array when the upstream request fails."],
  },
  {
    id: "font-proxy-get",
    path: "/api/font-proxy",
    method: "GET",
    summary: "Fetch Curated Font Assets",
    queryExample: "family=Plus%20Jakarta%20Sans&weight=700",
    requestExample: "curl -X GET '/api/font-proxy?family=Plus%20Jakarta%20Sans&weight=700'",
    responseExample: JSON.stringify({ note: "Returns binary font data with a font/* content-type." }, null, 2),
    notes: ["Supports curated Google font lookup via family and weight.", "Also supports a validated src query parameter for approved font hosts."],
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

export interface ApiRequestLogEntry {
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
}

export async function listApiRequestLogs(limit = 100) {
  const normalizedLimit = normalizeLimit(limit);
  const client = await getServiceRoleClient();

  if (!client) {
    return [] as ApiRequestLogEntry[];
  }

  const { data, error } = await client
    .from("api_request_logs")
    .select(`
      id,
      created_at,
      endpoint,
      method,
      path,
      query_params,
      user_id,
      api_key_id,
      ip_address,
      origin,
      referer,
      device_type,
      user_agent,
      response_status,
      response_message,
      duration_ms,
      app_source,
      request_type,
      event_name,
      is_success,
      business_name,
      industry_id,
      logo_count,
      error_code
    `)
    .order("created_at", { ascending: false })
    .limit(normalizedLimit);

  if (error || !data) {
    return [] as ApiRequestLogEntry[];
  }

  return data as ApiRequestLogEntry[];
}

