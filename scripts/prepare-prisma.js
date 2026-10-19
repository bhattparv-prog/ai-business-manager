const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, "utf8");
  const dbUrl = process.env.DATABASE_URL || "";

  if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
    console.log("⚡ [Build] Detected PostgreSQL DATABASE_URL. Switching Prisma provider to postgresql...");
    schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schema, "utf8");
  } else {
    console.log("📦 [Build] Using SQLite Prisma provider...");
    schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
    fs.writeFileSync(schemaPath, schema, "utf8");
  }
}
