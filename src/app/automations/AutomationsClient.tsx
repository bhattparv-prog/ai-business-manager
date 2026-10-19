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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Automation Engine</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
              {rules.filter((r) => r.isActive).length} Active
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Trigger mobile notifications, generate tasks, and sync data based on business rules.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
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
          <div className="py-12 text-center bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <Zap className="w-10 h-10 text-orange-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No automation rules configured</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Create rules to send instant push notifications when records change or tasks become due.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-sm"
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
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rule.isActive
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {rule.isActive ? "ACTIVE" : "PAUSED"}
                      </span>
                    </div>

                    {/* Visual workflow steps */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      {/* Trigger Pill */}
                      <span className="px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 flex items-center gap-1.5 font-bold">
                        <Zap className="w-3.5 h-3.5 text-orange-500" />
                        <span>Trigger: {rule.triggerType}</span>
                      </span>

                      <span className="text-slate-400">→</span>

                      {/* Condition Pill */}
                      {condConf.field ? (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1.5 font-semibold">
                          <span>
                            If {condConf.field} {condConf.operator} &quot;{condConf.value}&quot;
                          </span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
                          Always
                        </span>
                      )}

                      <span className="text-slate-400">→</span>

                      {/* Action Pill */}
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 font-bold">
                        {rule.actionType === "create_task" ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Bell className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>Action: {rule.actionType}</span>
                      </span>
                    </div>

                    {/* Recent execution status */}
                    <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-2 font-medium">
                      <span>Executions logged: {rule.logs?.length || 0}</span>
                      {rule.logs?.[0] && (
                        <span>
                          • Last run:{" "}
                          <strong className="text-slate-700">
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
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors border ${
                        rule.isActive
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                          : "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                      }`}
                    >
                      {rule.isActive ? "Pause" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Create Automation Rule</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Notify on High Value Lead"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trigger</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                  >
                    <option value="new_record">New Record Submitted</option>
                    <option value="task_due">Task Approaching Due Date</option>
                    <option value="record_threshold">Record Metric Threshold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Action</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                  >
                    <option value="in_app_notification">Send In-App Notification</option>
                    <option value="web_push">Dispatch Web Push Notification</option>
                    <option value="create_task">Create Follow-up Task</option>
                  </select>
                </div>
              </div>

              {/* Optional condition */}
              <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 space-y-2">
                <span className="text-[11px] font-bold text-orange-800 uppercase">
                  Optional Condition (Filter)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={conditionField}
                    onChange={(e) => setConditionField(e.target.value)}
                    placeholder="Field key (e.g. priority)"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                  <select
                    value={conditionOperator}
                    onChange={(e) => setConditionOperator(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-orange-500 font-medium"
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
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notification Title / Task Title
                </label>
                <input
                  type="text"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  placeholder="e.g. High Priority Inbound Lead!"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
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
