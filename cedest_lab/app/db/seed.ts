import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { user, account, sites, userSites, shifts } from "./schema";
import { getKinshasaDateIso } from "../../src/lib/time";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL n'est pas défini.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  // ---------- 1. Gérant ----------
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Gérant";

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD sont requis.");
  }

  console.log("🌱 Vérification / Création du gérant…");
  const [gerantRow] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email));

  let gerantId: string;
  if (gerantRow) {
    gerantId = gerantRow.id;
    console.log("⏭️  Gérant existant :", email);
  } else {
    const id = crypto.randomUUID();
    const hashed = await hashPassword(password);
    const [u] = await db
      .insert(user)
      .values({
        id,
        name,
        email,
        emailVerified: true,
        role: "gerant",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: user.id });
    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: id,
      providerId: "credential",
      userId: id,
      password: hashed,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    gerantId = id;
    console.log("✅ Gérant créé :", email);
  }

  // ---------- 2. Sites initiaux ----------
  console.log("🌱 Vérification / Création des sites…");

  const [kimialaRow] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(eq(sites.nom, "KIMIALA"));

  let kimialaId: string;
  if (kimialaRow) {
    kimialaId = kimialaRow.id;
    console.log("⏭️  Site existant : KIMIALA");
  } else {
    const [s] = await db
      .insert(sites)
      .values({ nom: "KIMIALA", actif: true })
      .returning({ id: sites.id });
    kimialaId = s.id;
    console.log("✅ Site créé : KIMIALA");
  }

  const [shellRow] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(eq(sites.nom, "SHELL"));

  let shellId: string;
  if (shellRow) {
    shellId = shellRow.id;
    console.log("⏭️  Site existant : SHELL");
  } else {
    const [s] = await db
      .insert(sites)
      .values({ nom: "SHELL", actif: true })
      .returning({ id: sites.id });
    shellId = s.id;
    console.log("✅ Site créé : SHELL");
  }

  // ---------- 3. Affectation du gérant aux deux sites ----------
  const assigned = await db
    .select({ siteId: userSites.siteId })
    .from(userSites)
    .where(eq(userSites.userId, gerantId));
  const assignedSiteIds = new Set(assigned.map((a) => a.siteId));

  if (!assignedSiteIds.has(kimialaId)) {
    await db.insert(userSites).values({ userId: gerantId, siteId: kimialaId });
    console.log("✅ Gérant affecté à KIMIALA");
  }
  if (!assignedSiteIds.has(shellId)) {
    await db.insert(userSites).values({ userId: gerantId, siteId: shellId });
    console.log("✅ Gérant affecté à SHELL");
  }

  // ---------- 4. Comptes de démonstration (uniquement si SEED_DEMO=true) ----------
  if (process.env.SEED_DEMO === "true") {
    const demoPassword = process.env.SEED_DEMO_PASSWORD;
    if (!demoPassword) {
      throw new Error("SEED_DEMO_PASSWORD est requis quand SEED_DEMO=true.");
    }

    // --- Opérateur Démo ---
    let operateur = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, "operateur.demo@cedest.cd"))
      .then((rows) => rows[0]);

    if (!operateur) {
      const id = crypto.randomUUID();
      const hashed = await hashPassword(demoPassword);
      const [u] = await db
        .insert(user)
        .values({
          id,
          name: "Opérateur Démo",
          email: "operateur.demo@cedest.cd",
          emailVerified: true,
          role: "operateur",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: user.id });
      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: id,
        providerId: "credential",
        userId: id,
        password: hashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      operateur = u;
      console.log("✅ Opérateur démo créé : operateur.demo@cedest.cd");
    } else {
      console.log("⏭️  Opérateur démo existant : operateur.demo@cedest.cd");
    }

    const opKimiExists = await db
      .select()
      .from(userSites)
      .where(eq(userSites.userId, operateur.id))
      .where(eq(userSites.siteId, kimialaId))
      .then((rows) => rows.length > 0);
    if (!opKimiExists) {
      await db.insert(userSites).values({ userId: operateur.id, siteId: kimialaId });
      console.log("✅ Opérateur démo affecté à KIMIALA");
    }

    // --- Technicien Démo ---
    let technicien = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, "technicien.demo@cedest.cd"))
      .then((rows) => rows[0]);

    if (!technicien) {
      const id = crypto.randomUUID();
      const hashed = await hashPassword(demoPassword);
      const [u] = await db
        .insert(user)
        .values({
          id,
          name: "Technicien Démo",
          email: "technicien.demo@cedest.cd",
          emailVerified: true,
          role: "technicien",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: user.id });
      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: id,
        providerId: "credential",
        userId: id,
        password: hashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      technicien = u;
      console.log("✅ Technicien démo créé : technicien.demo@cedest.cd");
    } else {
      console.log("⏭️  Technicien démo existant : technicien.demo@cedest.cd");
    }

    // ---------- 5. Shift du jour pour l'opérateur démo sur KIMIALA ----------
    const today = getKinshasaDateIso();
    const existingShift = await db
      .select()
      .from(shifts)
      .where(eq(shifts.date, today))
      .where(eq(shifts.userId, operateur.id))
      .then((rows) => rows.length > 0);

    if (!existingShift) {
      await db.insert(shifts).values({
        date: today,
        siteId: kimialaId,
        userId: operateur.id,
        fonction: "operateur",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ Shift démo créé pour aujourd'hui (", today, ") sur KIMIALA");
    } else {
      console.log("⏭️  Shift démo existant pour aujourd'hui (", today, ")");
    }
  }

  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erreur seed :", err);
  process.exit(1);
});
