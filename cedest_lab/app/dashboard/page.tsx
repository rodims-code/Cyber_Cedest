import { desc, inArray } from "drizzle-orm";
import { db } from "@/app/db";
import { leads } from "@/app/db/schema";
import { requireRole } from "@/lib/session";
import { allowedLeadTypes } from "@/lib/permissions";

export default async function DashboardPage() {
  const session = await requireRole();
  const types = allowedLeadTypes(session.role);
  const rows = await db
    .select()
    .from(leads)
    .where(types ? inArray(leads.type, types) : undefined)
    .orderBy(desc(leads.createdAt))
    .limit(100);
  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 p-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Espace équipe · {session.role}
        </p>
        <h1 className="text-3xl font-bold">Demandes clients</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total visible</p>
          <p className="text-2xl font-bold">{rows.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Nouvelles</p>
          <p className="text-2xl font-bold">
            {rows.filter((row) => row.status === "nouveau").length}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">En cours</p>
          <p className="text-2xl font-bold">
            {rows.filter((row) => row.status === "en_cours").length}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Client</th>
              <th className="p-3">Type</th>
              <th className="p-3">Téléphone</th>
              <th className="p-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3">
                  {row.createdAt.toLocaleDateString("fr-FR")}
                </td>
                <td className="p-3 font-medium">{row.nom}</td>
                <td className="p-3">{row.type}</td>
                <td className="p-3">{row.telephone}</td>
                <td className="p-3">{row.status}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  Aucune demande pour votre domaine.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
