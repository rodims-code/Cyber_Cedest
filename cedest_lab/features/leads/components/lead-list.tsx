import Link from "next/link";
import {
  Users,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { LeadType, Role } from "@/lib/permissions";
import { getLeadsForRole, GetLeadsOptions } from "../queries";

const labels: Record<string, string> = {
  formation: "Formation",
  wifi: "Wi-Fi",
  solaire: "Solaire",
  contact: "Contact",
  nouveau: "Nouveau",
  contacte: "Contacté",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  nouveau: "default",
  contacte: "secondary",
  en_cours: "outline",
  termine: "secondary",
  annule: "destructive",
};

export async function LeadList({
  role,
  filters,
}: {
  role: Role;
  filters: GetLeadsOptions;
}) {
  const result = await getLeadsForRole(role, filters);
  const { leads, total, page, totalPages } = result;

  const basePath = `/dashboard/${role}/demandes`;

  const availableTypes: LeadType[] =
    role === "gerant"
      ? ["formation", "wifi", "solaire", "contact"]
      : role === "operateur"
      ? ["contact"]
      : ["wifi", "solaire"];

  const buildUrl = (newParams: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    if (filters.type) p.set("type", filters.type);
    if (filters.status) p.set("status", filters.status);
    if (filters.search) p.set("search", filters.search);
    if (filters.page && filters.page > 1) p.set("page", String(filters.page));

    for (const [k, v] of Object.entries(newParams)) {
      if (v === undefined || v === "" || (k === "page" && v === 1)) {
        p.delete(k);
      } else {
        p.set(k, String(v));
      }
    }
    const q = p.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  const now = Date.now();

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Demandes clients
          </h1>
          <p className="text-muted-foreground text-sm">
            Consultez et traitez les demandes reçues pour votre rôle.
          </p>
        </div>

        <Badge className="px-4 py-2 text-sm w-fit">
          {total} demande{total > 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Barre de filtres et recherche */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="size-4" />
            Filtres & Recherche
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Recherche */}
          <form method="GET" action={basePath} className="flex gap-2 max-w-md">
            {filters.type && <input type="hidden" name="type" value={filters.type} />}
            {filters.status && <input type="hidden" name="status" value={filters.status} />}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={filters.search ?? ""}
                placeholder="Rechercher par nom, tél ou CED-..."
                className="pl-9 text-xs"
              />
            </div>
            <Button size="sm" type="submit" variant="secondary" className="text-xs">
              Filtrer
            </Button>
          </form>

          {/* Filtres Type */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">
              Service :
            </span>
            <Link href={buildUrl({ type: undefined, page: 1 })}>
              <Button
                size="sm"
                variant={!filters.type ? "default" : "outline"}
                className="text-xs h-7"
              >
                Tous
              </Button>
            </Link>

            {availableTypes.map((t) => (
              <Link key={t} href={buildUrl({ type: t, page: 1 })}>
                <Button
                  size="sm"
                  variant={filters.type === t ? "default" : "outline"}
                  className="text-xs h-7"
                >
                  {labels[t]}
                </Button>
              </Link>
            ))}
          </div>

          {/* Filtres Statut */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">
              Statut :
            </span>
            <Link href={buildUrl({ status: undefined, page: 1 })}>
              <Button
                size="sm"
                variant={!filters.status ? "default" : "outline"}
                className="text-xs h-7"
              >
                Tous
              </Button>
            </Link>

            {["nouveau", "contacte", "en_cours", "termine", "annule"].map((st) => (
              <Link key={st} href={buildUrl({ status: st, page: 1 })}>
                <Button
                  size="sm"
                  variant={filters.status === st ? "default" : "outline"}
                  className="text-xs h-7"
                >
                  {labels[st]}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tableau des demandes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des demandes</CardTitle>
          <CardDescription>
            Demandes triées de la plus récente à la plus ancienne.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Réf.</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {leads.map((lead) => {
                const numStr = `CED-${String(lead.numero ?? lead.id).padStart(4, "0")}`;
                const ageHours = Math.floor(
                  (now - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60)
                );
                const isOverdue = lead.status === "nouveau" && ageHours >= 24;

                return (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      <Link href={`${basePath}/${lead.id}`}>
                        {numStr}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`${basePath}/${lead.id}`}
                        className="font-medium hover:underline block"
                      >
                        {lead.nom}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {lead.telephone}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {labels[lead.type] ?? lead.type}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge variant={statusVariants[lead.status] ?? "outline"}>
                          {labels[lead.status] ?? lead.status}
                        </Badge>
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <Clock className="size-3" />
                            <span>En attente depuis {ageHours} h</span>
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}

              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <Users className="mx-auto mb-2 size-8 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Aucune demande trouvée</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Modifiez les filtres de recherche ou réinitialisez la sélection.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
              <span>
                Page {page} sur {totalPages} ({total} résultats)
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={buildUrl({ page: Math.max(1, page - 1) })}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                >
                  <Button size="sm" variant="outline" disabled={page <= 1} className="h-7 text-xs">
                    <ChevronLeft className="size-3.5 mr-1" />
                    Précédent
                  </Button>
                </Link>
                <Link
                  href={buildUrl({ page: Math.min(totalPages, page + 1) })}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                >
                  <Button size="sm" variant="outline" disabled={page >= totalPages} className="h-7 text-xs">
                    Suivant
                    <ChevronRight className="size-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
