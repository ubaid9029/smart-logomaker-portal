import { NextResponse } from "next/server";

import { listApiRequestLogs } from "../../../lib/adminPortalData";

function readLimit(searchParams: URLSearchParams) {
  const value = Number.parseInt(searchParams.get("limit") || "100", 10);
  if (!Number.isFinite(value) || value < 1) {
    return 100;
  }
  return Math.min(value, 200);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = readLimit(url.searchParams);
  const items = await listApiRequestLogs(limit);

  return NextResponse.json({
    success: true,
    count: items.length,
    items,
  });
}
