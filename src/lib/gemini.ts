import { prisma } from "./prisma";

export async function getApiKey(): Promise<string | null> {
  const setting = await prisma.setting.findUnique({
    where: { key: "gemini_api_key" },
  });
  if (setting && setting.value) {
    try {
      const parsed = JSON.parse(setting.value);
      if (parsed) return parsed;
    } catch {
      return setting.value;
    }
  }
  return process.env.GEMINI_API_KEY || null;
}

// Fetch live context from database for grounding
export async function getGroundedBusinessContext(userId: string) {
  const collections = await prisma.collectionDefinition.findMany({
    include: {
      fields: true,
      records: {
        take: 20,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const tasks = await prisma.task.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { name: true, email: true } } },
  });

  const notifications = await prisma.notification.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  const recentAudits = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  const dataSources = await prisma.dataSource.findMany({
    take: 10,
  });

  return {
    summary: {
      totalCollections: collections.length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t) => t.status === "pending").length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      unreadNotifications: notifications.filter((n) => !n.read).length,
    },
    collections: collections.map((c) => ({
      name: c.name,
      slug: c.slug,
      fieldCount: c.fields.length,
      recordCount: c.records.length,
      recentRecords: c.records.slice(0, 5).map((r) => {
        try {
          return { id: r.id, createdAt: r.createdAt, ...JSON.parse(r.data) };
        } catch {
          return { id: r.id, createdAt: r.createdAt, raw: r.data };
        }
      }),
    })),
    tasks: tasks.slice(0, 10).map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      assignedTo: t.assignedTo?.name || "Unassigned",
    })),
    dataSources: dataSources.map((d) => ({
      name: d.name,
      type: d.type,
      status: d.status,
      lastSyncAt: d.lastSyncAt,
    })),
  };
}

export async function askAiAssistant({
  message,
  userId,
  history = [],
}: {
  message: string;
  userId: string;
  history?: Array<{ role: string; content: string }>;
}) {
  const context = await getGroundedBusinessContext(userId);
  const apiKey = await getApiKey();

  // If Gemini API key is configured, call Google Gemini API
  if (apiKey) {
    try {
      const systemInstruction = `You are a high-level Personal AI Business Manager & Executive Assistant.
You have access to the user's real business data provided below.
Rules:
1. Always base answers strictly on the verified data in the context.
2. If data is missing or not configured, explicitly mention that instead of guessing.
3. You can propose actions (e.g., creating a task or creating a record). If you propose an action, format it as a JSON block with \`\`\`action { "type": "create_task" | "create_record", "data": { ... } } \`\`\`.
4. Be professional, concise, proactive, and actionable.

Current Live Business Context:
${JSON.stringify(context, null, 2)}
`;

      const contents = [
        ...history.slice(-6).map((h) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        })),
        {
          role: "user",
          parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }],
        },
      ];

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            content: text,
            groundedData: context.summary,
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API call error, falling back to local deterministic engine:", err);
    }
  }

  // Built-in intelligent local deterministic query parser
  const lower = message.toLowerCase();

  if (lower.includes("task") || lower.includes("pending") || lower.includes("todo")) {
    const pending = context.tasks.filter((t) => t.status === "pending");
    if (pending.length === 0) {
      return {
        content: `You currently have **no pending tasks**. There are **${context.summary.totalTasks} total tasks** in the system. Everything is up to date!`,
        groundedData: context.summary,
      };
    }
    const list = pending
      .map(
        (t) =>
          `- **${t.title}** (Priority: \`${t.priority.toUpperCase()}\`, Due: ${
            t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No date"
          }, Assigned: ${t.assignedTo})`
      )
      .join("\n");
    return {
      content: `Here are your pending tasks (${pending.length}):\n\n${list}\n\nWould you like me to prioritize any of these or create a new follow-up task?`,
      groundedData: context.summary,
    };
  }

  if (lower.includes("collection") || lower.includes("record") || lower.includes("data") || lower.includes("summary")) {
    if (context.collections.length === 0) {
      return {
        content: `You have not created any custom data collections yet. Go to **Collections** to create custom collections (such as Projects, Customers, Sales, Expenses, or Leads) with your own fields.`,
        groundedData: context.summary,
      };
    }
    const cols = context.collections
      .map((c) => `- **${c.name}** (\`${c.slug}\`): ${c.recordCount} records, ${c.fieldCount} fields defined.`)
      .join("\n");
    return {
      content: `Here is the current summary of your custom business data collections:\n\n${cols}\n\nTotal tasks: **${context.summary.totalTasks}** (${context.summary.pendingTasks} pending).\nUnread notifications: **${context.summary.unreadNotifications}**.`,
      groundedData: context.summary,
    };
  }

  if (lower.includes("source") || lower.includes("sheet") || lower.includes("sync")) {
    if (context.dataSources.length === 0) {
      return {
        content: `No external data sources (Google Sheets or CSV syncs) are connected yet. You can connect or import data from the **Data Sources** section.`,
        groundedData: context.summary,
      };
    }
    const sources = context.dataSources
      .map((s) => `- **${s.name}** (${s.type}): Status \`${s.status}\`, Last synced: ${s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleString() : "Never"}`)
      .join("\n");
    return {
      content: `Here is the status of your connected data sources:\n\n${sources}`,
      groundedData: context.summary,
    };
  }

  return {
    content: `I'm your **Personal AI Business Assistant**. I'm actively connected to your database.\n\n### Current System Snapshot:\n- **Custom Collections:** ${context.summary.totalCollections}\n- **Tasks:** ${context.summary.totalTasks} (${context.summary.pendingTasks} pending)\n- **Unread Alerts:** ${context.summary.unreadNotifications}\n\n${
      apiKey
        ? "Google Gemini model is active and grounded in your live data."
        : "*(Tip: Add your Gemini API Key in **Settings** for generative conversational synthesis, or ask me directly about tasks, records, and sync status!)*"
    }\n\nHow can I help you today? You can ask me to summarize records, check pending tasks, or review data sources.`,
    groundedData: context.summary,
  };
}
