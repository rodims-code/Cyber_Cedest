// src/app/dashboard/utilisateurs/page.tsx
import { desc } from "drizzle-orm";
import { ChevronDown, UserPlus } from "lucide-react";

import { db } from "@/app/db";
import { user } from "@/app/db/schema";
import { CreateUserForm } from "@/features/users/components/create-user-form";
import { UsersTable } from "@/components/users-table";
import { requireRole } from "@/lib/session";

export default async function Page() {
  const session = await requireRole(["gerant"]);
  const rows = await db.select().from(user).orderBy(desc(user.createdAt));

  // Les dates passent en texte ISO pour traverser la frontière serveur → client
  const users = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role ?? null,
    banned: Boolean(u.banned),
    createdAt: u.createdAt.toISOString(),
  }));

  const active = users.filter((u) => !u.banned).length;

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} compte{users.length > 1 ? "s" : ""}, dont {active}{" "}
          actif{active > 1 ? "s" : ""}. Créez les accès du personnel et
          désactivez ceux qui n'en ont plus besoin.
        </p>
      </header>

      {/* Replié par défaut : on ne le voit que quand on en a besoin,
          la liste reste donc la première chose à l'écran. */}
      <details className="group rounded-lg border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <UserPlus className="size-4 text-muted-foreground" aria-hidden />
            Ajouter un membre du personnel
          </span>
          <ChevronDown
            className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="border-t p-4">
          <CreateUserForm />
        </div>
      </details>

      <UsersTable users={users} currentUserId={session.user.id} />
    </section>
  );
}