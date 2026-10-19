"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  User,
} from "lucide-react";

export default function AssistantClient() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [groundedStats, setGroundedStats] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Summarize all data & records currently stored",
    "What tasks are currently pending or urgent?",
    "Check status of connected data sources",
    "Create a follow-up reminder for high priority items",
  ];

  useEffect(() => {
    // Initial greeting
    setMessages([
      {
        id: "intro",
        role: "assistant",
        content:
          "Hello! I am your **Personal AI Business Assistant**. I'm directly connected to your local database records, tasks, custom collections, and automation pipelines.\n\nAsk me anything about your business records or ask me to prepare tasks for you.",
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(textToSend?: string) {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    const userMsg = { id: Date.now().toString(), role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, sessionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Assistant request failed");
      }

      setSessionId(data.sessionId);
      if (data.groundedData) {
        setGroundedStats(data.groundedData);
      }

      setMessages((prev) => [...prev, data.message]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `⚠️ Error communicating with assistant: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function executeAction(actionDataString: string) {
    try {
      const action = JSON.parse(actionDataString);
      if (!confirm(`Do you approve executing this action: ${action.type}?`)) {
        return;
      }

      const res = await fetch("/api/assistant/execute-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: action.type,
          data: action.data,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Action executed successfully! Database records updated.");
        handleSend("Confirm the execution result and show updated status.");
      } else {
        alert("Action failed: " + data.error);
      }
    } catch (err: any) {
      alert("Invalid action format: " + err.message);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      {/* Assistant Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Personal Business Assistant</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/30">
                Grounded in Live Data
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Zero hallucination • Strictly authorized records
            </p>
          </div>
        </div>

        {groundedStats && (
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700/50">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>
              <strong>{groundedStats.totalCollections}</strong> collections •{" "}
              <strong>{groundedStats.pendingTasks}</strong> pending tasks
            </span>
          </div>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === "user";

          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-2xl ${isUser ? "ml-auto flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser
                    ? "bg-slate-700 text-slate-200"
                    : "bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-sm"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-sky-600 text-white rounded-tr-none shadow-md shadow-sky-500/10"
                    : "glass-panel bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* AI Proposed Action Card */}
                {m.actionData && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-800/80 border border-sky-500/30 text-xs">
                    <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Proposed Action Requires Confirmation</span>
                    </div>
                    <pre className="text-[10px] bg-slate-950 p-2 rounded text-slate-300 font-mono overflow-x-auto my-2">
                      {m.actionData}
                    </pre>
                    <button
                      onClick={() => executeAction(m.actionData)}
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Execute Action</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-md">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl glass-panel bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
              <span>Analyzing live database records & preparing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/50 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">
          Quick queries:
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white whitespace-nowrap text-[11px] transition-colors border border-slate-700/50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about records, pending tasks, or request an action..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/25 disabled:opacity-50 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
