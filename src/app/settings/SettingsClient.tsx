"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Key,
  Shield,
  Smartphone,
  CheckCircle,
  Save,
  Sparkles,
  Server,
} from "lucide-react";

export default function SettingsClient() {
  const [settings, setSettings] = useState<any>({});
  const [businessName, setBusinessName] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || {});
        setBusinessName(data.settings?.business_name || "My Business");
        setGeminiApiKey(data.settings?.gemini_api_key || "");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload: Record<string, any> = {
        business_name: businessName,
      };

      // Only send API key if updated
      if (geminiApiKey && !geminiApiKey.includes("...")) {
        payload.gemini_api_key = geminiApiKey;
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFeedback("✅ Settings saved successfully!");
        setTimeout(() => setFeedback(null), 3000);
        fetchSettings();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>System Settings</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30">
              Configurable
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your AI provider credentials, business branding, and security parameters.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Branding */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Settings className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-100">Business Workspace</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Workspace / Business Title
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Acme Operations"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Completely configurable for your individual business or personal projects.
            </p>
          </div>
        </div>

        {/* AI Assistant Configuration */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Key className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-100">AI Assistant Integration (Gemini)</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Enter your AI Studio API key (AIzaSy...)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Stored securely on the server. If empty, the system automatically uses its built-in
              grounded deterministic query analyzer.
            </p>
          </div>
        </div>

        {/* Architecture & Budget Status Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Server className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-100">Architecture & ₹0 Budget Audit</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Database</span>
              <p className="font-semibold text-slate-200 mt-0.5">Local SQLite</p>
              <span className="text-[10px] text-emerald-400">₹0 cost • 100% private</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Push Engine</span>
              <p className="font-semibold text-slate-200 mt-0.5">Web Push VAPID</p>
              <span className="text-[10px] text-emerald-400">₹0 cost • No third-party fees</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Hosting Model</span>
              <p className="font-semibold text-slate-200 mt-0.5">Self-Contained</p>
              <span className="text-[10px] text-emerald-400">PWA installable on Android</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
