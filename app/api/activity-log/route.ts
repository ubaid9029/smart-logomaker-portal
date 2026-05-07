import { NextResponse } from "next/server";

import { appendActivityLog, listActivityLogs } from "../../../lib/adminPortalData";

function readLimit(searchParams: URLSearchParams) {
  const value = Number.parseInt(searchParams.get("limit") || "50", 10);
  if (!Number.isFinite(value) || value < 1) {
    return 50;
  }
  return Math.min(value, 200);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = readLimit(url.searchParams);
  const items = await listActivityLogs(limit);

  return NextResponse.json({
    success: true,
    count: items.length,
    items,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const record = await appendActivityLog({
      level: body?.level === "warning" || body?.level === "error" ? body.level : "info",
      source: typeof body?.source === "string" ? body.source : "unknown",
      actor: typeof body?.actor === "string" ? body.actor : "system",
      method: typeof body?.method === "string" ? body.method : "POST",
      endpoint: typeof body?.endpoint === "string" ? body.endpoint : "/unknown",
      status: typeof body?.status === "number" ? body.status : 200,
      message: typeof body?.message === "string" ? body.message : "Activity recorded.",
      timestamp: typeof body?.timestamp === "string" ? body.timestamp : undefined,
    });

    return NextResponse.json({ success: true, item: record }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to parse activity log payload." },
      { status: 400 }
    );
  }
}