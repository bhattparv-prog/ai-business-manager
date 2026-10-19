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
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-slate-50 to-amber-50/40 flex items-center justify-center p-4 selection:bg-orange-500/20">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="bg-white border border-orange-100/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-500/5">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isSetup ? "Setup Business Manager" : "AI Business Manager"}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              {isSetup
                ? "Create your Owner account to initialize your private workspace"
                : "Personal Operations, Real-Time Notifications & AI Assistant"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSetup && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@business.local"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={fillOwnerCredentials}
                className="text-xs text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                Quick-fill Seeded Owner Credentials
              </button>
            </div>
          )}
        </div>

        {/* Security badge footer */}
        <div className="text-center mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Local SQLite Database • ₹0 Operating Cost</span>
        </div>
      </div>
    </div>
  );
}
