"use client";

import { useEffect, useMemo } from "react";

interface AuthNextFieldProps {
  fallbackNext?: string;
}

function normalizeNextPath(value?: string | null) {
  const nextValue = typeof value === "string" ? value.trim() : "";
  if (!nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return null;
  }
  return nextValue;
}

function readCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookiePrefix = `${name}=`;
  const cookieEntry = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(cookiePrefix));

  if (!cookieEntry) {
    return null;
  }

  return decodeURIComponent(cookieEntry.slice(cookiePrefix.length));
}

function resolvePreferredNext(initialNext: string) {
  if (typeof window === "undefined") {
    return initialNext;
  }

  const queryNext = normalizeNextPath(new URLSearchParams(window.location.search).get("next"));
  const cookieNext = normalizeNextPath(readCookieValue("auth-return-to"));
  return queryNext || cookieNext || initialNext || "/dashboard";
}

export default function AuthNextField({ fallbackNext = "/dashboard" }: AuthNextFieldProps) {
  const initialNext = useMemo(() => normalizeNextPath(fallbackNext) || "/dashboard", [fallbackNext]);
  const nextValue = useMemo(() => resolvePreferredNext(initialNext), [initialNext]);

  useEffect(() => {
    if (nextValue === "/dashboard") {
      document.cookie = "auth-return-to=; path=/; max-age=0; samesite=lax";
      return;
    }

    document.cookie = `auth-return-to=${encodeURIComponent(nextValue)}; path=/; samesite=lax`;
  }, [nextValue]);

  return <input suppressHydrationWarning type="hidden" name="next" value={nextValue} />;
}
