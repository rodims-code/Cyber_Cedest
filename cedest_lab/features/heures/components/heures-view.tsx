import { ClockIcon, TimerIcon } from "lucide-react";

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
import type { HeuresSemaine } from "@/features/heures/queries";

function formatHeures(heures: number): string {
  return `${heures.toLocaleString("fr-FR")} h`;
}

export function HeuresView({ data }: { data: HeuresSemaine }) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Paie et heures
          </h1>
          <p className="text-sm text-muted-foreground">
            Relevés d&apos;heures du personnel pour le site actif.
          </p>
        </div>
        <Badge variant={data.isAll ? "secondary" : "outline"} className="w-fit">
          {data.isAll ? "Vue cumulée" : `Site ${data.siteNom}`}
        </Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Heures cette semaine
            </CardTitle>
            <ClockIcon className="size-4 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {formatHeures(data.totalSemaine)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Cumul du personnel affiché
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heures ce mois</CardTitle>
            <TimerIcon className="size-4 text-violet-600" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {formatHeures(data.totalMois)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Base de calcul de la paie
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relevé par employé</CardTitle>
          <CardDescription>
            Le calcul des montants de paie sera activé dès que la formule de
            rémunération sera validée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.entries.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
              Aucun relevé d&apos;heures pour ce site.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  {data.isAll && <TableHead>Site</TableHead>}
                  <TableHead>Fonction</TableHead>
                  <TableHead className="text-right">Cette semaine</TableHead>
                  <TableHead className="text-right">Ce mois</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.employe}
                    </TableCell>
                    {data.isAll && (
                      <TableCell className="text-muted-foreground">
                        {entry.site}
                      </TableCell>
                    )}
                    <TableCell className="text-muted-foreground">
                      {entry.fonction}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatHeures(entry.heuresSemaine)}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatHeures(entry.heuresMois)}
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
