"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { appendActivityLog } from "../lib/adminPortalData";
import { createClient } from "@/lib/supabaseServer";

function normalizeNextPath(value: FormDataEntryValue | string | null | undefined) {
  const nextValue = typeof value === "string" ? value.trim() : "";
  if (!nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return "/dashboard";
  }
  return nextValue;
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

async function resolveAllowedEmail() {
  const allowedEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (!allowedEmail) {
    throw new Error("SUPER_ADMIN_EMAIL is not configured.");
  }
  return allowedEmail;
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const email = normalizeEmail(formData.get("email"));
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
  const next = normalizeNextPath(formData.get("next"));
  const allowedEmail = await resolveAllowedEmail();

  if (!email || !password) {
    redirect(`/?error=${encodeURIComponent("Please enter both email and password.")}&next=${encodeURIComponent(next)}`);
  }

  if (email !== allowedEmail) {
    await appendActivityLog({
      level: "warning",
      source: "auth",
      actor: email || "unknown",
      method: "POST",
      endpoint: "/auth/signin",
      status: 403,
      message: "Blocked by super-admin email allowlist.",
    });
    redirect(`/?error=${encodeURIComponent("Access denied. This email is not allowed for super admin login.")}&next=${encodeURIComponent(next)}`);
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await appendActivityLog({
      level: "error",
      source: "auth",
      actor: email || "unknown",
      method: "POST",
      endpoint: "/auth/signin",
      status: 401,
      message: error.message,
    });
    redirect(`/?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  await appendActivityLog({
    level: "info",
    source: "auth",
    actor: email,
    method: "POST",
    endpoint: "/auth/signin",
    status: 200,
    message: "Super admin signed in successfully.",
  });

  revalidatePath("/", "layout");
  cookieStore.set("auth-return-to", "", { path: "/", maxAge: 0 });
  cookieStore.set("oauth-return-to", "", { path: "/", maxAge: 0 });
  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await appendActivityLog({
    level: "info",
    source: "auth",
    actor: "system",
    method: "POST",
    endpoint: "/auth/signout",
    status: 200,
    message: "Super admin signed out.",
  });
  revalidatePath("/", "layout");
  redirect("/");
}