import { NextResponse } from "next/server";

import {
  getFeatureAdoption,
  getLiveActiveUsers,
  getPlatformStats,
  listApiRequestLogs,
} from "../../../lib/adminPortalData";

export async function GET() {
  const [metrics, featureUsage, recentActivity, activeUsers] = await Promise.all([
    getPlatformStats(),
    getFeatureAdoption(),
    listApiRequestLogs(4),
    getLiveActiveUsers(),
  ]);

  return NextResponse.json({
    success: true,
    metrics,
    featureUsage,
    recentActivity,
    activeUsers,
  });
}
