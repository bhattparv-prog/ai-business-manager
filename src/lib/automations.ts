import { prisma } from "./prisma";
import { sendNotification } from "./notifications";

export interface AutomationTriggerPayload {
  triggerType: "new_record" | "task_due" | "record_threshold";
  collectionId?: string;
  collectionSlug?: string;
  recordId?: string;
  recordData?: Record<string, any>;
  taskId?: string;
  userId?: string;
}

export async function processAutomations(payload: AutomationTriggerPayload) {
  try {
    const rules = await prisma.automationRule.findMany({
      where: {
        triggerType: payload.triggerType,
        isActive: true,
      },
    });

    for (const rule of rules) {
      try {
        let triggerMatch = true;
        let triggerConfig: Record<string, any> = {};
        try {
          triggerConfig = JSON.parse(rule.triggerConfig || "{}");
        } catch {}

        // Validate collection filter if specified
        if (triggerConfig.collectionId && triggerConfig.collectionId !== payload.collectionId) {
          triggerMatch = false;
        }

        if (!triggerMatch) continue;

        // Evaluate conditions
        let conditionConfig: Record<string, any> = {};
        try {
          conditionConfig = JSON.parse(rule.conditionConfig || "{}");
        } catch {}

        let conditionPassed = true;
        if (conditionConfig.field && payload.recordData) {
          const val = payload.recordData[conditionConfig.field];
          const target = conditionConfig.value;
          const op = conditionConfig.operator || "equals";

          if (op === "equals" && String(val).toLowerCase() !== String(target).toLowerCase()) {
            conditionPassed = false;
          } else if (op === "greater_than" && Number(val) <= Number(target)) {
            conditionPassed = false;
          } else if (op === "less_than" && Number(val) >= Number(target)) {
            conditionPassed = false;
          } else if (op === "contains" && !String(val).toLowerCase().includes(String(target).toLowerCase())) {
            conditionPassed = false;
          }
        }

        if (!conditionPassed) {
          await prisma.automationLog.create({
            data: {
              ruleId: rule.id,
              status: "skipped",
              details: JSON.stringify({ reason: "Condition not met", payload }),
            },
          });
          continue;
        }

        // Execute Action
        let actionConfig: Record<string, any> = {};
        try {
          actionConfig = JSON.parse(rule.actionConfig || "{}");
        } catch {}

        if (rule.actionType === "in_app_notification" || rule.actionType === "web_push") {
          const title = actionConfig.title || `Automation: ${rule.name}`;
          const message =
            actionConfig.message ||
            `Rule triggered for record: ${payload.recordId || "Event"}`;

          await sendNotification({
            userId: payload.userId ?? null,
            title,
            message,
            type: actionConfig.type || "info",
            link: payload.recordId ? `/collections/${payload.collectionSlug || payload.collectionId}` : "/dashboard",
          });
        } else if (rule.actionType === "create_task") {
          await prisma.task.create({
            data: {
              title: actionConfig.taskTitle || `Follow-up on ${rule.name}`,
              description: actionConfig.taskDescription || `Automatically created task from rule: ${rule.name}`,
              priority: actionConfig.priority || "medium",
              assignedToId: actionConfig.assignedToId || null,
              relatedRecordId: payload.recordId || null,
            },
          });
        }

        await prisma.automationLog.create({
          data: {
            ruleId: rule.id,
            status: "success",
            details: JSON.stringify({ executed: rule.actionType, payload }),
          },
        });
      } catch (err: any) {
        await prisma.automationLog.create({
          data: {
            ruleId: rule.id,
            status: "failed",
            details: JSON.stringify({ error: err.message, payload }),
          },
        });
      }
    }
  } catch (error) {
    console.error("Error processing automations:", error);
  }
}
