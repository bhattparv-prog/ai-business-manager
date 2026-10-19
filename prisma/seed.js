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

  // 3. Create Sample Configurable Collections if none exist for owner
  const existingCols = await prisma.collectionDefinition.count({ where: { userId: owner.id } });
  if (existingCols === 0) {
    // Projects collection
    const projectsCol = await prisma.collectionDefinition.create({
      data: {
        userId: owner.id,
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

    // Leads collection
    await prisma.collectionDefinition.create({
      data: {
        userId: owner.id,
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

    console.log("Seeded template collections: Projects & Leads");
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
