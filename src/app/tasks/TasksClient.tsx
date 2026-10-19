"use client";

import { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Filter,
} from "lucide-react";

export default function TasksClient() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          dueDate: dueDate || null,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setTitle("");
        setDescription("");
        setDueDate("");
        setPriority("medium");
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleStatus(task: any) {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteTask(id: string) {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Tasks & Reminders</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30">
              {tasks.filter((t) => t.status === "pending").length} Pending
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Prioritized business actions and automated follow-ups.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/25 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <span className="text-slate-500 flex items-center gap-1 font-medium mr-2">
          <Filter className="w-3.5 h-3.5" /> Status:
        </span>
        {[
          { id: "all", label: "All Tasks" },
          { id: "pending", label: "Pending" },
          { id: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === tab.id
                ? "bg-sky-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center glass-panel rounded-2xl p-8 border border-slate-800">
            <CheckSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-200">No tasks found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              All caught up! Add a new task or assign one through the AI Assistant.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold"
            >
              + Create Task
            </button>
          </div>
        ) : (
          tasks.map((task) => {
            const isDone = task.status === "completed";

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isDone
                    ? "bg-slate-900/40 border-slate-800/50 opacity-60"
                    : "glass-panel bg-slate-900/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => toggleStatus(task)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-600 hover:border-sky-400 text-transparent"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <h3
                      className={`text-sm font-semibold text-slate-200 ${
                        isDone ? "line-through text-slate-500" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-0.5 whitespace-pre-wrap">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px]">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded uppercase text-[10px] ${
                          task.priority === "urgent" || task.priority === "high"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : task.priority === "medium"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {task.priority}
                      </span>

                      {task.dueDate && (
                        <span className="text-slate-400 flex items-center gap-1 bg-slate-800/60 px-2 py-0.5 rounded">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}

                      <span className="text-slate-500">
                        Assigned to: {task.assignedTo?.name || "Self"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-slate-100 text-sm">Create New Task</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Follow up on Q4 proposal"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details, context, or requirements"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
