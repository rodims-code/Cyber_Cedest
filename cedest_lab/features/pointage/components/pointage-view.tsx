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
import type {
  MyPointage,
  PointageJour,
  PointageStatut,
} from "@/features/pointage/queries";
import { formatDuree, formatDateCourteIso } from "@/lib/time";

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
              Toujours à 0 : les horaires des postes ne sont pas encore
              définis.
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
            <div className="overflow-x-auto">
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
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

/**
 * Vue personnelle : l'employé ne voit que ses propres pointages.
 * Aucune action de modification n'est proposée ici.
 */
export function PersonalPointageView({
  pointages,
  weekHours,
  monthHours,
}: {
  pointages: MyPointage[];
  weekHours: number;
  monthHours: number;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Mes pointages
        </h1>
        <p className="text-sm text-muted-foreground">
          Historique personnel. Seulement vous et le gérant pouvez consulter ces
          données.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cette semaine
            </CardTitle>
            <ClockIcon className="size-4 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {formatDuree(weekHours)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Lundi au samedi inclus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois-ci</CardTitle>
            <ClockIcon className="size-4 text-violet-600" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {formatDuree(monthHours)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Cumul du mois en cours
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pointages récents</CardTitle>
          <CardDescription>
            Les pointages en cours comptent jusqu&apos;à maintenant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pointages.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
              Aucun pointage enregistré pour l&apos;instant.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Arrivée</TableHead>
                    <TableHead>Départ</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Heures</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointages.map((pointage) => (
                    <TableRow key={pointage.id}>
                      <TableCell className="whitespace-nowrap font-medium">
                        {formatDateCourteIso(pointage.date)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pointage.siteNom}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {pointage.arriveeLabel}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {pointage.departLabel ?? "—"}
                      </TableCell>
                      <TableCell>
                        {pointage.enCours ? (
                          <Badge>En cours</Badge>
                        ) : (
                          <Badge variant="secondary">Terminé</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatDuree(pointage.heures)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
