import { desc } from "drizzle-orm";
import { db } from "@/app/db";
import { user } from "@/app/db/schema";
import { toggleStaffUser } from "@/features/users/actions";
import { CreateUserForm } from "@/features/users/components/create-user-form";
import { requireRole } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, UserX, UserCheck, Shield } from "lucide-react";

export default async function Page() {
  const session = await requireRole(["gerant"]);
  const users = await db.select().from(user).orderBy(desc(user.createdAt));

  const roleLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    gerant: { label: "Gérant", variant: "default" },
    operateur: { label: "Opérateur", variant: "secondary" },
    technicien: { label: "Technicien", variant: "outline" },
  };

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="size-6 text-primary" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-sm text-muted-foreground">
            Créez des accès pour le personnel de Cyber Cedest et gérez l'activation de leurs comptes.
          </p>
        </div>
      </div>

      <CreateUserForm />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="size-5 text-muted-foreground" />
          Comptes du personnel ({users.length})
        </h2>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collaborateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((staff) => {
                const isCurrent = staff.id === session.user.id;
                const roleMeta = roleLabels[staff.role || ""] || {
                  label: staff.role || "Inconnu",
                  variant: "secondary",
                };

                return (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{staff.name}</div>
                      <div className="text-xs text-muted-foreground">{staff.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleMeta.variant}>{roleMeta.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {staff.banned ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
                          <UserX className="size-3.5" />
                          Désactivé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <UserCheck className="size-3.5" />
                          Actif
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {staff.createdAt.toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      {isCurrent ? (
                        <span className="text-xs text-muted-foreground italic">
                          (Votre compte)
                        </span>
                      ) : (
                        <form action={toggleStaffUser}>
                          <input type="hidden" name="id" value={staff.id} />
                          <input
                            type="hidden"
                            name="banned"
                            value={String(!staff.banned)}
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant={staff.banned ? "outline" : "ghost"}
                            className="text-xs"
                          >
                            {staff.banned ? "Réactiver le compte" : "Désactiver le compte"}
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
