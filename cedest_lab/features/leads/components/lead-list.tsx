import Link from "next/link";
import {
  Users,
  Wifi,
  GraduationCap,
  Monitor,
  SunMedium,
  Filter,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { LeadType } from "@/lib/permissions";
import { getLeadsForRole } from "../queries";

const labels: Record<string, string> = {
  formation: "Formation",
  wifi: "Wi-Fi",
  solaire: "Solaire",
  bureautique: "Bureautique",
  autre: "Contact",
  nouveau: "Nouveau",
  en_cours: "En cours",
  converti: "Terminé",
  annule: "Annulé",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  nouveau: "default",
  en_cours: "secondary",
  converti: "outline",
  annule: "destructive",
};

export async function LeadList({
  role,
  filters,
}: {
  role: "gerant" | "operateur" | "technicien";
  filters: { type?: string; status?: string };
}) {
  const leads = await getLeadsForRole(role, filters);

  const basePath = `/dashboard/${role}/demandes`;

  const types: LeadType[] =
    role === "gerant"
      ? ["formation", "wifi", "solaire", "bureautique", "autre"]
      : role === "operateur"
      ? ["bureautique", "formation", "autre"]
      : ["wifi", "solaire"];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Demandes clients
          </h1>

          <p className="text-muted-foreground">
            Consultez et gérez les demandes de votre département.
          </p>
        </div>

        <Badge className="px-4 py-2 text-sm">
          {leads.length} demande{leads.length > 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-2">
          <Link href={basePath}>
            <Button
              size="sm"
              variant={!filters.type && !filters.status ? "default" : "outline"}
            >
              Toutes
            </Button>
          </Link>

          {types.map((type) => (
            <Link
              key={type}
              href={`${basePath}?type=${type}`}
            >
              <Button
                size="sm"
                variant={filters.type === type ? "default" : "outline"}
              >
                {labels[type]}
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des demandes</CardTitle>
          <CardDescription>
            Dernières demandes soumises par les clients.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                >
                  <TableCell>
                    <Link
                      href={`${basePath}/${lead.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {lead.nom}
                    </Link>

                    <p className="text-xs text-muted-foreground">
                      {lead.telephone}
                    </p>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">
                      {labels[lead.type]}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={statusVariants[lead.status]}>
                      {labels[lead.status]}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {lead.createdAt.toLocaleDateString("fr-FR")}
                  </TableCell>
                </TableRow>
              ))}

              {leads.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-16 text-center"
                  >
                    <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

                    <h3 className="font-medium">
                      Aucune demande trouvée
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Essayez de modifier les filtres appliqués.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}