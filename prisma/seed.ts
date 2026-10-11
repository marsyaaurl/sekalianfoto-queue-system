import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes, scryptSync } from "node:crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@sekalianfoto.com";
  const adminPassword = "password123";

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingUser) {
    if (!adminPassword || adminPassword.length < 12) {
      throw new Error(
        "SEED_ADMIN_PASSWORD must be set to a unique password of at least 12 characters before creating the initial admin.",
      );
    }

    const hashedPassword = hashPassword(adminPassword);
    const user = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log(`[Seed] Initial admin user created successfully:`);
    console.log(`  Email: ${user.email}`);
    console.log("  Password: supplied through SEED_ADMIN_PASSWORD (not printed).");
  } else {
    console.log(`[Seed] Admin user (${adminEmail}) already exists. Skipping creation.`);
  }

  // Create default booth if none exists
  const existingBooth = await prisma.booth.findFirst();
  if (!existingBooth) {
    const booth = await prisma.booth.create({
      data: {
        name: "Studio 1 - Main Booth",
        branch: "Jakarta South",
      },
    });
    console.log(`[Seed] Initial booth created: ${booth.name} (ID: ${booth.id})`);
  }
}

main()
  .catch((e) => {
    console.error("[Seed Error]:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
