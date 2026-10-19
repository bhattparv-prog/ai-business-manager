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
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
      {/* Assistant Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Personal Business Assistant</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
                Grounded in Live Data
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Zero hallucination • Strictly authorized records
            </p>
          </div>
        </div>

        {groundedStats && (
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm font-medium">
            <Database className="w-3.5 h-3.5 text-orange-500" />
            <span>
              <strong className="text-slate-900">{groundedStats.totalCollections}</strong> collections •{" "}
              <strong className="text-slate-900">{groundedStats.pendingTasks}</strong> pending tasks
            </span>
          </div>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
        {messages.map((m) => {
          const isUser = m.role === "user";

          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-2xl ${isUser ? "ml-auto flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? "bg-slate-800 text-white shadow-sm"
                    : "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/25"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-none shadow-md shadow-orange-500/15"
                    : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-none shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* AI Proposed Action Card */}
                {m.actionData && (
                  <div className="mt-3 p-3.5 rounded-xl bg-orange-50/70 border border-orange-200 text-xs">
                    <div className="flex items-center gap-1.5 text-orange-700 font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      <span>Proposed Action Requires Confirmation</span>
                    </div>
                    <pre className="text-[10px] bg-white p-2.5 rounded-lg border border-orange-100 text-slate-800 font-mono overflow-x-auto my-2">
                      {m.actionData}
                    </pre>
                    <button
                      onClick={() => executeAction(m.actionData)}
                      className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm shadow-orange-500/20"
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center gap-2 shadow-sm font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" />
              <span>Analyzing live database records & preparing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">
          Quick queries:
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 whitespace-nowrap text-[11px] font-semibold transition-colors border border-orange-200/80"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 bg-white">
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
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25 disabled:opacity-50 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
