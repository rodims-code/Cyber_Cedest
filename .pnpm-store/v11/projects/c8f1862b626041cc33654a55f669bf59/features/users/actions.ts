"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/app/db";
import { account, user } from "@/app/db/schema";
import { requireRole } from "@/lib/session";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit comporter au moins 2 caractères").max(100),
  email: z.string().trim().email("Adresse e-mail invalide"),
  password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères").max(128),
  role: z.enum(["operateur", "technicien"]),
});

export type CreateUserState = {
  ok?: boolean;
  error?: string;
};

export async function createStaffUser(
  _prevState: CreateUserState | null,
  formData: FormData
): Promise<CreateUserState> {
  await requireRole(["gerant"]);
  const raw = Object.fromEntries(formData);
  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Informations de compte invalides." };
  }

  const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, parsed.data.email));
  if (existing.length > 0) {
    return { ok: false, error: "Cette adresse e-mail est déjà utilisée." };
  }

  const id = crypto.randomUUID();
  await db.insert(user).values({
    id,
    name: parsed.data.name,
    email: parsed.data.email,
    emailVerified: false,
    role: parsed.data.role,
  });

  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: id,
    providerId: "credential",
    userId: id,
    password: await hashPassword(parsed.data.password),
  });

  revalidatePath("/dashboard/gerant/utilisateurs");
  return { ok: true };
}

export async function toggleStaffUser(formData: FormData): Promise<void> {
  const session = await requireRole(["gerant"]);
  const id = String(formData.get("id") ?? "");
  const banned = formData.get("banned") === "true";
  if (!id || id === session.user.id) return;
  await db.update(user).set({ banned, updatedAt: new Date() }).where(eq(user.id, id));
  revalidatePath("/dashboard/gerant/utilisateurs");
}
