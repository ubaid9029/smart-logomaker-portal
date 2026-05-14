import { NextResponse } from "next/server";

import { appendActivityLog, getApiDocs } from "../../../../lib/adminPortalData";

type ExecutePayload = {
  docId?: string;
  path?: string;
  method?: string;
  query?: string;
  headers?: Record<string, string>;
  body?: string | null;
};

function getTargetBaseUrl() {
  const value =
    process.env.WEB_APP_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";

  return value.replace(/\/+$/, "");
}

function sanitizeHeaders(input: Record<string, string> | undefined) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(input || {})) {
    if (!key || value == null) continue;
    const normalizedKey = key.toLowerCase();

    if (["host", "content-length", "connection"].includes(normalizedKey)) {
      continue;
    }

    headers.set(key, value);
  }

  return headers;
}

async function readBody(request: Request) {
  try {
    return (await request.json()) as ExecutePayload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const payload = await readBody(request);
  if (!payload?.docId || !payload?.path || !payload?.method) {
    return NextResponse.json({ success: false, message: "Missing request configuration." }, { status: 400 });
  }

  const doc = getApiDocs().find((item) => item.id === payload.docId);
  if (!doc || doc.path !== payload.path || doc.method !== payload.method) {
    return NextResponse.json({ success: false, message: "Unsupported API doc target." }, { status: 400 });
  }

  const baseUrl = getTargetBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { success: false, message: "Missing WEB_APP_BASE_URL or NEXT_PUBLIC_SITE_URL." },
      { status: 500 }
    );
  }

  const queryString = payload.query?.trim();
const targetUrl = `${baseUrl}${doc.path}${queryString ? `?${queryString.replace(/^\?/, "")}` : ""}`;
  const headers = sanitizeHeaders(payload.headers);
  const shouldSendBody = !["GET", "HEAD"].includes(doc.method.toUpperCase());
  const targetOrigin = new URL(baseUrl).origin;

  if (!headers.has("x-app-id")) {
    headers.set("x-app-id", "com.devsinntechnologies.smartlogomaker");
  }

  if (!headers.has("origin")) {
    headers.set("origin", targetOrigin);
  }

  if (!headers.has("referer")) {
    headers.set("referer", `${targetOrigin}/api-docs`);
  }

  if (shouldSendBody && payload.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const startedAt = Date.now();

  await appendActivityLog({
    level: "info",
    source: "admin-docs",
    actor: "admin",
    method: doc.method,
    endpoint: doc.path,
    status: 102,
    message: `Admin API test started for ${doc.path}`,
  });

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: doc.method,
      headers,
      body: shouldSendBody ? payload.body || undefined : undefined,
      cache: "no-store",
    });

    const durationMs = Date.now() - startedAt;
    const responseText = await upstreamResponse.text();
    let parsedBody: unknown = responseText;

    try {
      parsedBody = responseText ? JSON.parse(responseText) : null;
    } catch {
      parsedBody = responseText;
    }

    const responseHeaders = Object.fromEntries(upstreamResponse.headers.entries());

    await appendActivityLog({
      level: upstreamResponse.ok ? "info" : "warning",
      source: "admin-docs",
      actor: "admin",
      method: doc.method,
      endpoint: doc.path,
      status: upstreamResponse.status,
      message: `Admin API test finished for ${doc.path} in ${durationMs}ms`,
    });

    return NextResponse.json({
      success: true,
      targetUrl,
      durationMs,
      response: {
        ok: upstreamResponse.ok,
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
        body: parsedBody,
      },
    });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : "Unknown execution error";

    await appendActivityLog({
      level: "error",
      source: "admin-docs",
      actor: "admin",
      method: doc.method,
      endpoint: doc.path,
      status: 500,
      message: `Admin API test failed for ${doc.path}: ${message}`,
    });

    return NextResponse.json(
      {
        success: false,
        targetUrl,
        durationMs,
        message,
      },
      { status: 500 }
    );
  }
}
