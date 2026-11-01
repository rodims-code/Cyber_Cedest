import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import { hashPassword } from "better-auth/crypto";
import { leads, user, account } from "./schema";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL n'est pas défini.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  // ---------- 1. Premier gérant ----------
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Gérant";

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD sont requis.");
  }

  console.log("🌱 Création du gérant…");

  const existing = await db.select().from(user).where(eq(user.email, email));

  if (existing.length > 0) {
    console.log("⏭️  Le gérant existe déjà :", email);
  } else {
    const id = crypto.randomUUID();

    await db.insert(user).values({
      id,
      name,
      email,
      emailVerified: true,
      role: "gerant",
    });

    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: id,
      providerId: "credential",
      userId: id,
      password: await hashPassword(password),
    });

    console.log("✅ Gérant créé :", email);
  }

  // ---------- 2. Lead de test ----------
  console.log("🌱 Insertion d'un lead de test…");

  const result = await db
    .insert(leads)
    .values({
      type: "formation",
      nom: "Client Test",
      telephone: "0812345678",
      email: "test@cybercedest.cd",
      details: { modules: ["Word", "Excel"], note: "Test Étape 1" },
    })
    .returning();

  console.log("✅ Lead inséré :", result[0]);

  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erreur :", err);
  process.exit(1);
});