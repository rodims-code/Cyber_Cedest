import { ClockIcon, UserCheckIcon, UserXIcon, UsersIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PointageJour, PointageStatut } from "@/features/pointage/queries";

function formatHeures(heures: number): string {
  const h = Math.floor(heures);
  const minutes = Math.round((heures - h) * 60);

  return minutes === 0 ? `${h} h` : `${h} h ${String(minutes).padStart(2, "0")}`;
}

function statutLabel(statut: PointageStatut): string {
  if (statut === "present") return "Présent";
  if (statut === "retard") return "Retard";
  return "Absent";
}

function statutVariant(
  statut: PointageStatut
): "secondary" | "destructive" | "outline" {
  if (statut === "present") return "secondary";
  if (statut === "absent") return "destructive";
  return "outline";
}

export function PointageView({ data }: { data: PointageJour }) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Pointages du jour
          </h1>
          <p className="text-sm capitalize text-muted-foreground">
            {data.dateKinshasa}
          </p>
        </div>
        <Badge variant={data.isAll ? "secondary" : "outline"} className="w-fit">
          {data.isAll ? "Vue cumulée" : `Site ${data.siteNom}`}
        </Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Présents</CardTitle>
            <UserCheckIcon
              className="size-4 text-emerald-600"
              aria-hidden
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {data.totals.presents}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Employés à l&apos;heure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retards</CardTitle>
            <ClockIcon className="size-4 text-amber-600" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {data.totals.retards}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Arrivées après l&apos;heure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absents</CardTitle>
            <UserXIcon className="size-4 text-destructive" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {data.totals.absents}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Sans pointage aujourd&apos;hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Heures travaillées
            </CardTitle>
            <UsersIcon className="size-4 text-violet-600" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {formatHeures(data.totals.heures)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Cumul du jour pour le site actif
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détail des pointages</CardTitle>
          <CardDescription>
            Arrivées, départs et heures validées pour chaque employé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.entries.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
              Aucun pointage enregistré pour ce site.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  {data.isAll && <TableHead>Site</TableHead>}
                  <TableHead>Fonction</TableHead>
                  <TableHead>Arrivée</TableHead>
                  <TableHead>Départ</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Heures</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.employe}</TableCell>
                    {data.isAll && (
                      <TableCell className="text-muted-foreground">
                        {entry.site}
                      </TableCell>
                    )}
                    <TableCell className="text-muted-foreground">
                      {entry.fonction}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {entry.arrivee ?? "—"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {entry.depart ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statutVariant(entry.statut)}>
                        {statutLabel(entry.statut)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatHeures(entry.heures)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
