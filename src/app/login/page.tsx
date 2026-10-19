"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if initial setup is needed
    fetch("/api/auth/setup")
      .then((res) => res.json())
      .then((data) => {
        if (data.needsSetup) {
          setIsSetup(true);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isSetup ? "/api/auth/setup" : "/api/auth/login";
      const payload = isSetup ? { name, email, password } : { email, password };

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
    setEmail("owner@business.local");
    setPassword("Owner@123456");
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 selection:bg-sky-500/30">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="glass-panel border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl bg-[#0c1222]/90">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              {isSetup ? "Setup Business Manager" : "AI Business Manager"}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              {isSetup
                ? "Create your Owner account to initialize your private workspace"
                : "Personal Operations, Real-Time Notifications & AI Assistant"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSetup && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@business.local"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Authenticating..."
              ) : (
                <>
                  <span>{isSetup ? "Complete Setup & Launch" : "Sign In to Dashboard"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {!isSetup && (
            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={fillOwnerCredentials}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                Quick-fill Seeded Owner Credentials
              </button>
            </div>
          )}
        </div>

        {/* Security badge footer */}
        <div className="text-center mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local SQLite Database • ₹0 Monthly Operating Cost</span>
        </div>
      </div>
    </div>
  );
}
