import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import { hashPassword } from "better-auth/crypto";
import { leads, user, account, sites, userSites } from "./schema";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL n'est pas défini.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  // ---------- 1. Sites initiaux (KIMIALA et SHELL) ----------
  console.log("🌱 Vérification / Création des sites…");

  const existingSites = await db.select().from(sites);
  let kimialaSite = existingSites.find((s) => s.nom === "KIMIALA");
  let shellSite = existingSites.find((s) => s.nom === "SHELL");

  if (!kimialaSite) {
    const inserted = await db
      .insert(sites)
      .values({
        nom: "KIMIALA",
        actif: true,
      })
      .returning();
    kimialaSite = inserted[0];
    console.log("✅ Site créé : KIMIALA (", kimialaSite.id, ")");
  } else {
    console.log("⏭️  Site existant : KIMIALA");
  }

  if (!shellSite) {
    const inserted = await db
      .insert(sites)
      .values({
        nom: "SHELL",
        actif: true,
      })
      .returning();
    shellSite = inserted[0];
    console.log("✅ Site créé : SHELL (", shellSite.id, ")");
  } else {
    console.log("⏭️  Site existant : SHELL");
  }

  // ---------- 2. Premier gérant ----------
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Gérant";

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD sont requis.");
  }

  console.log("🌱 Création du gérant…");

  const existing = await db.select().from(user).where(eq(user.email, email));
  let adminUserId = existing[0]?.id;

  if (existing.length > 0) {
    console.log("⏭️  Le gérant existe déjà :", email);
  } else {
    const id = crypto.randomUUID();
    adminUserId = id;

    await db.insert(user).values({
      id,
      name,
      email,
      emailVerified: true,
      role: "gerant",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: id,
      providerId: "credential",
      userId: id,
      password: await hashPassword(password),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Gérant créé :", email);
  }

  // Assignation du gérant aux deux sites
  if (adminUserId && kimialaSite && shellSite) {
    const existingAssign = await db
      .select()
      .from(userSites)
      .where(eq(userSites.userId, adminUserId));

    const assignedSiteIds = new Set(existingAssign.map((a) => a.siteId));

    if (!assignedSiteIds.has(kimialaSite.id)) {
      await db.insert(userSites).values({
        userId: adminUserId,
        siteId: kimialaSite.id,
      });
    }

    if (!assignedSiteIds.has(shellSite.id)) {
      await db.insert(userSites).values({
        userId: adminUserId,
        siteId: shellSite.id,
      });
    }
  }

  // ---------- 3. Lead de test ----------
  console.log("🌱 Insertion d'un lead de test…");

  const existingLeads = await db.select().from(leads);
  if (existingLeads.length === 0) {
    const result = await db
      .insert(leads)
      .values({
        type: "formation",
        nom: "Client Test",
        telephone: "0812345678",
        email: "test@cybercedest.cd",
        details: "Modules Word et Excel - Test Étape 1",
      })
      .returning();

    console.log("✅ Lead inséré :", result[0]);
  } else {
    console.log("⏭️  Leads déjà présents");
  }

  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erreur :", err);
  process.exit(1);
});
