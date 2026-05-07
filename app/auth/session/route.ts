import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json({ user: null, error: error.message }, { status: 200 });
    }

    return NextResponse.json({ user: user || null }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { user: null, error: error instanceof Error ? error.message : "Unable to resolve auth session" },
      { status: 200 }
    );
  }
}