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
  const [settings, setSettings] = useState<any>([]);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>System Settings</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
              Configurable
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your AI provider credentials, business branding, and security parameters.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Branding */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Settings className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-slate-900">Business Workspace</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Workspace / Business Title
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Acme Operations"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Completely configurable for your individual business or personal projects.
            </p>
          </div>
        </div>

        {/* AI Assistant Configuration */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Key className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-slate-900">AI Assistant Integration (Gemini)</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Enter your AI Studio API key (AIzaSy...)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Stored securely on the server. If empty, the system automatically uses its built-in
              grounded deterministic query analyzer.
            </p>
          </div>
        </div>

        {/* Architecture & Budget Status Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Server className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Architecture & ₹0 Budget Audit</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Database</span>
              <p className="font-bold text-slate-900 mt-0.5">Local SQLite</p>
              <span className="text-[10px] text-emerald-600 font-semibold">₹0 cost • 100% private</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Push Engine</span>
              <p className="font-bold text-slate-900 mt-0.5">Web Push VAPID</p>
              <span className="text-[10px] text-emerald-600 font-semibold">₹0 cost • No third-party fees</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Theme Style</span>
              <p className="font-bold text-orange-600 mt-0.5">White & Orange</p>
              <span className="text-[10px] text-slate-500 font-medium">Clean & Modern</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
