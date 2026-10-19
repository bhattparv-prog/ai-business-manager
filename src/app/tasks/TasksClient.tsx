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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Tasks & Reminders</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
              {tasks.filter((t) => t.status === "pending").length} Pending
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized business actions and automated follow-ups.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        <span className="text-slate-500 flex items-center gap-1 font-semibold mr-2">
          <Filter className="w-3.5 h-3.5 text-orange-500" /> Status:
        </span>
        {[
          { id: "all", label: "All Tasks" },
          { id: "pending", label: "Pending" },
          { id: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === tab.id
                ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
          <div className="py-12 text-center bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <CheckSquare className="w-10 h-10 text-orange-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No tasks found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              All caught up! Add a new task or assign one through the AI Assistant.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-sm"
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
                    ? "bg-slate-50/60 border-slate-200 opacity-60"
                    : "bg-white border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => toggleStatus(task)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 hover:border-orange-500 text-transparent"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <h3
                      className={`text-sm font-bold text-slate-900 ${
                        isDone ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-600 mt-0.5 whitespace-pre-wrap font-medium">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px]">
                      <span
                        className={`font-bold px-2 py-0.5 rounded uppercase text-[10px] ${
                          task.priority === "urgent" || task.priority === "high"
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : task.priority === "medium"
                            ? "bg-orange-100 text-orange-700 border border-orange-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {task.priority}
                      </span>

                      {task.dueDate && (
                        <span className="text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}

                      <span className="text-slate-400">
                        Assigned to: <strong className="text-slate-600">{task.assignedTo?.name || "Self"}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Create New Task</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Follow up on Q4 proposal"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details, context, or requirements"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                  />
                </div>
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
