"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ArrowRight, Sparkles, Wifi, Battery, Signal, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload = mode === "register" ? { name, email, password } : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin() {
    setMode("signin");
    setEmail("owner@business.local");
    setPassword("Owner@123456");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7ED] via-[#F8FAFC] to-[#FFEDD5] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative ambient background curves matching reference aesthetic */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Mobile Frame Card (Matches /Users/aditya/Downloads/65cdc658fd0c9a1d3aee444be5f20cdf.jpg) */}
      <div className="w-full max-w-[420px] bg-white rounded-[44px] shadow-[0_24px_70px_rgba(249,115,22,0.12),0_12px_32px_rgba(0,0,0,0.06)] border border-slate-200/90 p-8 sm:p-10 relative overflow-hidden flex flex-col items-center text-center">
        {/* Subtle Watermark Geometric Arcs (from reference image) */}
        <div className="absolute top-0 inset-x-0 h-44 pointer-events-none overflow-hidden opacity-[0.06] flex items-center justify-center">
          <div className="w-72 h-72 rounded-full border-[28px] border-slate-900" />
        </div>

        {/* Top Mobile Status Bar (9:41, wifi, battery) matching reference image */}
        <div className="w-full flex items-center justify-between text-slate-800 text-xs font-bold px-2 mb-6 relative z-10">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Squircle App Logo with Radiant Orange Gradient */}
        <div className="relative z-10 w-20 h-20 rounded-[26px] bg-gradient-to-tr from-orange-500 via-orange-600 to-amber-500 p-4 shadow-xl shadow-orange-500/35 flex items-center justify-center mb-5 hover:scale-105 transition-transform">
          <Image
            src="/logo.png"
            alt="AI Business Manager"
            width={48}
            height={48}
            className="rounded-xl object-contain drop-shadow"
            priority
          />
        </div>

        {/* Headline Typography (Matching reference design) */}
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Welcome
            <br />
            to AI Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 leading-relaxed">
            Turn daily operations
            <br />
            into real progress.
          </p>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="w-full p-3 my-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold relative z-10">
            {error}
          </div>
        )}

        {/* Auth Form with Rounded Pill Inputs */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5 mt-6 relative z-10">
          {mode === "register" && (
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-11 pr-4 py-3 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full pl-11 pr-4 py-3 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-11 pr-4 py-3 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium transition-colors"
            />
          </div>

          {/* Primary CTA Pill Button (Orange Gradient matching purple button in reference) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-500/45 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create Account"}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Secondary CTA Pill Button (Dark Pill matching Apple button in reference) */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-3.5 rounded-full bg-slate-950 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Fill Demo Owner Credentials</span>
          </button>
        </form>

        {/* Bottom Switch Link matching "Don't have an account ? Sign up" */}
        <div className="mt-6 pt-2 text-xs sm:text-sm text-slate-600 relative z-10 font-medium">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account ?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className="font-extrabold text-orange-600 hover:text-orange-700 underline underline-offset-4 ml-1"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account ?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
                className="font-extrabold text-orange-600 hover:text-orange-700 underline underline-offset-4 ml-1"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
