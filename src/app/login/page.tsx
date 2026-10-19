"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle2, UserPlus, LogIn, Sparkles } from "lucide-react";

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

  function fillOwnerCredentials() {
    setMode("signin");
    setEmail("owner@business.local");
    setPassword("Owner@123456");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden selection:bg-orange-500/20">
      {/* Background blueprint grid watermark matching Screen 1 in reference image */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header matching reference image: Logo + Brand Name */}
      <header className="relative z-10 flex items-center justify-between max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-sm">
            <Image
              src="/logo.png"
              alt="Logo"
              width={34}
              height={34}
              className="rounded-xl object-contain"
              priority
            />
          </div>
          <div>
            <span className="text-sm font-extrabold text-slate-900 tracking-tight block">
              AI Business Manager
            </span>
            <span className="text-[10px] text-orange-600 font-bold block uppercase tracking-wider">
              Autonomous Operations
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fillOwnerCredentials}
            className="text-[11px] font-bold text-slate-600 hover:text-orange-600 bg-white border border-slate-200/80 px-3 py-1.5 rounded-full shadow-xs transition-colors"
          >
            Demo Owner Login
          </button>
        </div>
      </header>

      {/* Main Content Hero + Form Layout */}
      <main className="relative z-10 max-w-4xl w-full mx-auto my-auto py-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left Side: Big Bold Hero Typography (matching Screen 1) */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Autonomous AI Management</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Your Operations,
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Safely Secured.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium max-w-md">
            Enter your business data, connect real-time Google Sheets, manage isolated operations, and get actionable insights with instant mobile phone push notifications.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-600 font-semibold">
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              100% Private Workspace
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Google Sheets Live Sync
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Grounded AI Engine
            </span>
          </div>
        </div>

        {/* Right Side: Capsule Auth Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-500/5">
          {/* Pill Switcher */}
          <div className="flex rounded-full bg-slate-100 p-1 mb-5 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
              }}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === "signin"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === "register"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "register" && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name / Business Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aditya Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                />
              </div>
            </div>

            {/* Pill Action Button matching Screen 1 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? "Authenticating..." : mode === "register" ? "Create Workspace & Get Started" : "Sign In to Business Workspace"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 text-center text-xs text-slate-400 font-medium max-w-4xl w-full mx-auto pt-4">
        100% Private & Autonomous Stack • Zero Third-Party Tracking • Local SQLite Storage
      </footer>
    </div>
  );
}
