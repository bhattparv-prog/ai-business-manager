"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  Plus,
  Play,
  CheckCircle,
  AlertCircle,
  Trash2,
  Clock,
  Bell,
  CheckSquare,
  X,
  Layers,
} from "lucide-react";

export default function AutomationsClient() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("new_record");
  const [actionType, setActionType] = useState("in_app_notification");
  const [actionTitle, setActionTitle] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [conditionField, setConditionField] = useState("");
  const [conditionOperator, setConditionOperator] = useState("equals");
  const [conditionValue, setConditionValue] = useState("");

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    setLoading(true);
    try {
      const res = await fetch("/api/automations");
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRule(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          triggerType,
          triggerConfig: {},
          conditionConfig: conditionField
            ? { field: conditionField, operator: conditionOperator, value: conditionValue }
            : {},
          actionType,
          actionConfig: {
            title: actionTitle || `Alert: ${name}`,
            message: actionMessage || `Automated action executed for ${name}`,
            type: "info",
          },
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName("");
        setActionTitle("");
        setActionMessage("");
        setConditionField("");
        setConditionValue("");
        fetchRules();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleRule(rule: any) {
    try {
      const res = await fetch("/api/automations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id, isActive: !rule.isActive }),
      });
      if (res.ok) fetchRules();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteRule(id: string) {
    if (!confirm("Delete this automation rule?")) return;
    try {
      const res = await fetch(`/api/automations?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchRules();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Automation Engine</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30">
              {rules.filter((r) => r.isActive).length} Active
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Trigger mobile notifications, generate tasks, and sync data based on business rules.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/25 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Automation Rule</span>
        </button>
      </div>

      {/* Rules list */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading rules...</div>
        ) : rules.length === 0 ? (
          <div className="py-12 text-center glass-panel rounded-2xl p-8 border border-slate-800">
            <Zap className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-200">No automation rules configured</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Create rules to send instant push notifications when records change or tasks become due.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold"
            >
              + Create First Rule
            </button>
          </div>
        ) : (
          rules.map((rule) => {
            let triggerConf: any = {};
            let actionConf: any = {};
            let condConf: any = {};
            try {
              triggerConf = JSON.parse(rule.triggerConfig || "{}");
              actionConf = JSON.parse(rule.actionConfig || "{}");
              condConf = JSON.parse(rule.conditionConfig || "{}");
            } catch {}

            return (
              <div
                key={rule.id}
                className="glass-panel rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-100">{rule.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rule.isActive
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {rule.isActive ? "ACTIVE" : "PAUSED"}
                      </span>
                    </div>

                    {/* Visual workflow steps */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      {/* Trigger Pill */}
                      <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 flex items-center gap-1.5 font-medium">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Trigger: {rule.triggerType}</span>
                      </span>

                      <span className="text-slate-600">→</span>

                      {/* Condition Pill */}
                      {condConf.field ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1.5 font-medium">
                          <span>
                            If {condConf.field} {condConf.operator} &quot;{condConf.value}&quot;
                          </span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-400 font-medium">
                          Always
                        </span>
                      )}

                      <span className="text-slate-600">→</span>

                      {/* Action Pill */}
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5 font-medium">
                        {rule.actionType === "create_task" ? (
                          <CheckSquare className="w-3.5 h-3.5" />
                        ) : (
                          <Bell className="w-3.5 h-3.5" />
                        )}
                        <span>Action: {rule.actionType}</span>
                      </span>
                    </div>

                    {/* Recent execution status */}
                    <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Executions logged: {rule.logs?.length || 0}</span>
                      {rule.logs?.[0] && (
                        <span>
                          • Last run:{" "}
                          <strong className="text-slate-200">
                            {new Date(rule.logs[0].createdAt).toLocaleTimeString()}
                          </strong>{" "}
                          ({rule.logs[0].status})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleRule(rule)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors border ${
                        rule.isActive
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {rule.isActive ? "Pause" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-slate-100 text-sm">Create Automation Rule</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Notify on High Value Lead"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Trigger</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="new_record">New Record Submitted</option>
                    <option value="task_due">Task Approaching Due Date</option>
                    <option value="record_threshold">Record Metric Threshold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Action</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="in_app_notification">Send In-App Notification</option>
                    <option value="web_push">Dispatch Web Push Notification</option>
                    <option value="create_task">Create Follow-up Task</option>
                  </select>
                </div>
              </div>

              {/* Optional condition */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Optional Condition (Filter)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={conditionField}
                    onChange={(e) => setConditionField(e.target.value)}
                    placeholder="Field key (e.g. priority)"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
                  />
                  <select
                    value={conditionOperator}
                    onChange={(e) => setConditionOperator(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="greater_than">Greater than</option>
                  </select>
                  <input
                    type="text"
                    value={conditionValue}
                    onChange={(e) => setConditionValue(e.target.value)}
                    placeholder="Target value"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notification Title / Task Title
                </label>
                <input
                  type="text"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  placeholder="e.g. High Priority Inbound Lead!"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/20"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
