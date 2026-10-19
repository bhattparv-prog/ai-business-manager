const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const webPush = require("web-push");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Initialize VAPID keys if not present
  const existingVapid = await prisma.setting.findUnique({
    where: { key: "vapid_keys" },
  });
  if (!existingVapid) {
    const vapid = webPush.generateVAPIDKeys();
    await prisma.setting.create({
      data: {
        key: "vapid_keys",
        value: JSON.stringify(vapid),
      },
    });
    console.log("Initialized Web Push VAPID keys");
  }

  // 2. Create Initial Owner Account if not exists
  const ownerEmail = "owner@business.local";
  let owner = await prisma.user.findUnique({ where: { email: ownerEmail } });

  if (!owner) {
    const passwordHash = await bcrypt.hash("Owner@123456", 10);
    owner = await prisma.user.create({
      data: {
        email: ownerEmail,
        name: "Business Owner",
        role: "OWNER",
        passwordHash,
      },
    });
    console.log("Created initial Owner user: owner@business.local / Owner@123456");
  }

  // 3. Create Sample Configurable Collections if none exist
  const existingCols = await prisma.collectionDefinition.count();
  if (existingCols === 0) {
    // Projects collection
    const projectsCol = await prisma.collectionDefinition.create({
      data: {
        name: "Projects",
        slug: "projects",
        description: "Active business projects, milestones, and deliverable tracking",
        icon: "Briefcase",
        fields: {
          create: [
            { name: "Project Name", key: "name", type: "text", isRequired: true, orderIndex: 0 },
            { name: "Client / Stakeholder", key: "client", type: "text", isRequired: false, orderIndex: 1 },
            {
              name: "Status",
              key: "status",
              type: "select",
              options: JSON.stringify(["Planning", "In Progress", "Review", "Completed", "On Hold"]),
              isRequired: true,
              defaultValue: "In Progress",
              orderIndex: 2,
            },
            { name: "Budget (₹)", key: "budget", type: "number", isRequired: false, orderIndex: 3 },
            {
              name: "Priority",
              key: "priority",
              type: "select",
              options: JSON.stringify(["Low", "Medium", "High", "Critical"]),
              isRequired: true,
              defaultValue: "Medium",
              orderIndex: 4,
            },
            { name: "Deadline", key: "deadline", type: "date", isRequired: false, orderIndex: 5 },
          ],
        },
      },
    });

    // Sample project records
    await prisma.recordItem.create({
      data: {
        collectionId: projectsCol.id,
        createdById: owner.id,
        data: JSON.stringify({
          name: "Q4 Client Growth Campaign",
          client: "Acme Enterprises",
          status: "In Progress",
          budget: 125000,
          priority: "High",
          deadline: "2026-11-15",
        }),
      },
    });

    await prisma.recordItem.create({
      data: {
        collectionId: projectsCol.id,
        createdById: owner.id,
        data: JSON.stringify({
          name: "ERP Workflow Automation",
          client: "Global Logistics Ltd",
          status: "Review",
          budget: 240000,
          priority: "Critical",
          deadline: "2026-10-30",
        }),
      },
    });

    // Leads collection
    const leadsCol = await prisma.collectionDefinition.create({
      data: {
        name: "Leads & Inquiries",
        slug: "leads",
        description: "Inbound sales opportunities and new client contacts",
        icon: "Users",
        fields: {
          create: [
            { name: "Contact Name", key: "contact_name", type: "text", isRequired: true, orderIndex: 0 },
            { name: "Email", key: "email", type: "email", isRequired: false, orderIndex: 1 },
            { name: "Phone", key: "phone", type: "phone", isRequired: false, orderIndex: 2 },
            {
              name: "Stage",
              key: "stage",
              type: "select",
              options: JSON.stringify(["New", "Contacted", "Proposal Sent", "Won", "Lost"]),
              isRequired: true,
              defaultValue: "New",
              orderIndex: 3,
            },
            { name: "Estimated Value (₹)", key: "deal_value", type: "number", isRequired: false, orderIndex: 4 },
          ],
        },
      },
    });

    await prisma.recordItem.create({
      data: {
        collectionId: leadsCol.id,
        createdById: owner.id,
        data: JSON.stringify({
          contact_name: "Rahul Verma",
          email: "rahul@vermatech.in",
          phone: "+91 98765 43210",
          stage: "Proposal Sent",
          deal_value: 85000,
        }),
      },
    });

    console.log("Seeded template collections: Projects & Leads");
  }

  // 4. Create Sample Tasks
  const taskCount = await prisma.task.count();
  if (taskCount === 0) {
    await prisma.task.create({
      data: {
        title: "Review Q4 Strategy & Deliverables",
        description: "Analyze monthly project budget versus actual expenses.",
        status: "pending",
        priority: "high",
        dueDate: new Date(Date.now() + 86400000 * 2),
        createdById: owner.id,
        assignedToId: owner.id,
      },
    });

    await prisma.task.create({
      data: {
        title: "Follow up with Rahul Verma on proposal",
        description: "Check if the proposal terms are aligned.",
        status: "pending",
        priority: "medium",
        dueDate: new Date(Date.now() + 86400000),
        createdById: owner.id,
        assignedToId: owner.id,
      },
    });
    console.log("Seeded initial tasks");
  }

  // 5. Create Sample Welcome Notification
  const notifCount = await prisma.notification.count();
  if (notifCount === 0) {
    await prisma.notification.create({
      data: {
        userId: owner.id,
        title: "Welcome to AI Business Manager",
        message: "Your configurable AI Management & Automation Assistant is ready. Connect data sources, customize forms, or query your AI Assistant.",
        type: "success",
        link: "/dashboard",
      },
    });
  }

  // 6. Create Default Automation Rule
  const ruleCount = await prisma.automationRule.count();
  if (ruleCount === 0) {
    await prisma.automationRule.create({
      data: {
        name: "New Lead In-App Alert",
        triggerType: "new_record",
        triggerConfig: JSON.stringify({}),
        conditionConfig: JSON.stringify({}),
        actionType: "in_app_notification",
        actionConfig: JSON.stringify({
          title: "New Record Logged",
          message: "A new business record was created and saved to the database.",
          type: "info",
        }),
        isActive: true,
      },
    });
    console.log("Seeded default automation rule");
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
