const normalizeEnvValue = (value: string | undefined) => {
  const nextValue = typeof value === "string" ? value.trim() : "";
  return nextValue || null;
};

export function getSupabaseEnv() {
  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}