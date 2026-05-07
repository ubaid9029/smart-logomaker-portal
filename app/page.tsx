import type { Metadata } from "next";
import Image from "next/image";

import { signIn } from "./actions";
import AuthNextField from "../components/auth/AuthNextField";
import AuthShell from "../components/auth/AuthShell";

interface Props {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}

function normalizeNextPath(value?: string) {
  if (typeof value !== "string") {
    return "/dashboard";
  }

  const nextValue = value.trim();
  if (!nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return "/dashboard";
  }

  return nextValue;
}

export const metadata: Metadata = {
  title: "Login | Smart Logo Maker Admin",
};

export default async function Login({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error;
  const message = params?.message;
  const next = normalizeNextPath(params?.next);
  const isInfoMessage = Boolean(message) && !error;

  return (
    <AuthShell alignment="left" imagePosition="right">
      <div className="w-full max-w-[1180px]">
        <div className="z-10 w-full max-w-md rounded-3xl bg-white/90 px-8 py-8 shadow-lg backdrop-blur-xl md:ml-12 lg:ml-20">
          <div className="mb-5 flex justify-center">
            <Image src="/logos/logo3.svg" alt="Logo" width={80} height={80} priority />
          </div>

          <div className="mb-4 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
              Admin Login
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-600 md:text-base">
              Sign in
            </p>
          </div>

          {error && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12px] font-medium text-red-600">
              {decodeURIComponent(error)}
            </div>
          )}

          {message && (
            <div
              className={`mb-3 rounded-xl px-4 py-2.5 text-[12px] font-medium ${
                isInfoMessage
                  ? "border border-amber-200 bg-amber-50 text-amber-700"
                  : "border border-green-200 bg-green-50 text-green-600"
              }`}
            >
              {decodeURIComponent(message)}
            </div>
          )}

          <form action={signIn} className="space-y-3">
            <AuthNextField fallbackNext={next} />

            <div>
              <label className="text-[11.5px] font-semibold text-gray-700">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="mt-1 h-9 w-full rounded-xl border border-gray-300 px-3.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-pink-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="text-[11.5px] font-semibold text-gray-700">Password</label>
              <input
                name="password"
                type="password"
                placeholder="********"
                required
                className="mt-1 h-9 w-full rounded-xl border border-gray-300 px-3.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-pink-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="flex items-center justify-between text-[12px] text-gray-900">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-pink-500" />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-linear-to-r from-orange-500 to-pink-500 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            >
              Login
            </button>
          </form>

        </div>
      </div>
    </AuthShell>
  );
}