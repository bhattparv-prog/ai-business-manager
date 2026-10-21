"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, Mail, User, ArrowRight, Zap, Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      // Hard redirect to ensure cookies are flushed & attached reliably on mobile browsers & PWAs
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  function handleFillParv() {
    setMode("signin");
    setEmail("upaadhya1@gmail.com");
    setPassword("Owner@123456");
    setError("");
  }

  function handleDemoLogin() {
    setMode("signin");
    setEmail("owner@business.local");
    setPassword("Owner@123456");
    setError("");
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col justify-between relative overflow-hidden selection:bg-orange-500/20">
      {/* Decorative ambient background curves & glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-400/15 via-amber-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-400/15 via-orange-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Geometric Arc Watermark at Top */}
      <div className="absolute top-0 inset-x-0 h-72 pointer-events-none overflow-hidden opacity-[0.05] flex items-center justify-center">
        <div className="w-[420px] h-[420px] rounded-full border-[40px] border-slate-900" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full px-6 sm:px-12 pt-6 sm:pt-8 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 p-1 flex items-center justify-center shadow-xs">
            <Image
              src="/logo.png"
              alt="InsightIQ"
              width={34}
              height={34}
              className="rounded-xl object-contain"
              priority
            />
          </div>
          <div>
            <span className="text-base font-extrabold text-slate-900 tracking-tight block">
              InsightIQ
            </span>
            <span className="text-[10px] text-orange-600 font-bold block uppercase tracking-wider">
              Autonomous Operations
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFillParv}
            className="text-xs font-bold text-orange-700 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200/90 px-3 py-1.5 rounded-full transition-colors hidden sm:inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fill Parv Account</span>
          </button>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="text-xs font-bold text-slate-600 hover:text-orange-600 bg-slate-50 hover:bg-orange-50 border border-slate-200/80 px-3 py-1.5 rounded-full transition-colors"
          >
            Demo
          </button>
        </div>
      </header>

      {/* Main Full-Page Centered Form Container */}
      <main className="relative z-10 w-full max-w-md mx-auto px-6 py-8 sm:py-12 flex flex-col items-center justify-center text-center my-auto">
        {/* Squircle App Logo with Radiant Orange Gradient */}
        <div className="w-20 h-20 rounded-[26px] bg-gradient-to-tr from-orange-500 via-orange-600 to-amber-500 p-4 shadow-xl shadow-orange-500/35 flex items-center justify-center mb-6 hover:scale-105 transition-transform">
          <Image
            src="/logo.png"
            alt="InsightIQ"
            width={48}
            height={48}
            className="rounded-xl object-contain drop-shadow"
            priority
          />
        </div>

        {/* Headline Typography */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Welcome
          <br />
          to InsightIQ
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 leading-relaxed">
          Turn daily operations
          <br />
          into real progress.
        </p>

        {/* Quick Fill Buttons for Mobile Convenience */}
        <div className="w-full flex items-center justify-center gap-2 mt-5">
          <button
            type="button"
            onClick={handleFillParv}
            className="px-3.5 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-200/90 text-orange-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Fill upaadhya1</span>
          </button>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/90 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Fill Demo</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full p-3 my-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
            {error}
          </div>
        )}

        {/* Form with Rounded Pill Inputs */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5 mt-4 sm:mt-6">
          {mode === "register" && (
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-11 pr-4 py-3.5 rounded-full bg-slate-50/80 border border-slate-200/90 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium transition-all shadow-xs"
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
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-slate-50/80 border border-slate-200/90 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium transition-all shadow-xs"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full pl-11 pr-11 py-3.5 rounded-full bg-slate-50/80 border border-slate-200/90 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Primary CTA Button (Orange Gradient) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-500/45 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
          >
            <span>{loading ? "Signing in..." : mode === "signin" ? "Sign in" : "Create Account"}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Bottom Switch Link */}
        <div className="mt-6 pt-2 text-xs sm:text-sm text-slate-600 font-medium">
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
      </main>

      {/* Full Page Footer */}
      <footer className="relative z-10 w-full px-6 py-4 text-center text-xs text-slate-400 font-medium">
        InsightIQ • 100% Private & Autonomous Stack • Multi-Tenant Isolated Storage
      </footer>
    </div>
  );
}
