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
    const where: any = {
      triggerType: payload.triggerType,
      isActive: true,
    };
    if (payload.userId) {
      where.userId = payload.userId;
    }

    const rules = await prisma.automationRule.findMany({ where });

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

          if (conditionConfig.operator === "equals") {
            conditionPassed = String(val) === String(target);
          } else if (conditionConfig.operator === "contains") {
            conditionPassed = String(val).toLowerCase().includes(String(target).toLowerCase());
          } else if (conditionConfig.operator === "greater_than") {
            conditionPassed = Number(val) > Number(target);
          } else if (conditionConfig.operator === "less_than") {
            conditionPassed = Number(val) < Number(target);
          }
        }

        if (!conditionPassed) continue;

        // Execute configured action
        let actionConfig: Record<string, any> = {};
        try {
          actionConfig = JSON.parse(rule.actionConfig || "{}");
        } catch {}

        if (
          rule.actionType === "in_app_notification" ||
          rule.actionType === "web_push"
        ) {
          const title = actionConfig.title || `Automation: ${rule.name}`;
          const message =
            actionConfig.message ||
            `Rule triggered for record: ${payload.recordId || "Event"}`;

          await sendNotification({
            userId: payload.userId || rule.userId,
            title,
            message,
            type: actionConfig.type || "info",
            link: payload.recordId ? `/collections/${payload.collectionSlug || payload.collectionId}` : "/dashboard",
          });
        } else if (rule.actionType === "create_task") {
          await prisma.task.create({
            data: {
              userId: rule.userId,
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
  } catch (err) {
    console.error("Error processing automations:", err);
  }
}
