import {
  BriefcaseIcon,
  ClockIcon,
  TimerIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

import type { HeuresSemaine } from "@/features/heures/queries";

function formatHeures(heures: number) {
  return `${heures.toLocaleString("fr-FR")} h`;
}

export function HeuresView({
  data,
}: {
  data: HeuresSemaine;
}) {
  const sortedEmployees = [...data.entries].sort(
    (a, b) => b.heuresMois - a.heuresMois
  );

  const topEmployee = sortedEmployees[0];


  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Paie & Heures
          </h1>

          <p className="text-muted-foreground">
            Suivi des heures du personnel.
          </p>
        </div>

        <Badge
          variant={data.isAll ? "secondary" : "outline"}
          className="w-fit px-4 py-2"
        >
          {data.isAll
            ? "Vue consolidée"
            : `Site ${data.siteNom}`}
        </Badge>
      </header>

      {/* HERO CARD */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total du mois
              </p>

              <h2 className="mt-2 text-5xl font-bold tracking-tight">
                {formatHeures(data.totalMois)}
              </h2>

              <p className="mt-3 text-sm text-muted-foreground">
                Heures enregistrées pour la période en cours.
              </p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-6">
              <ClockIcon className="h-12 w-12 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Cette semaine
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">
              {formatHeures(data.totalSemaine)}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Heures hebdomadaires
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Ce mois
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">
              {formatHeures(data.totalMois)}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Total mensuel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Employés
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">
              {data.entries.length}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Personnes suivies
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrophyIcon className="h-4 w-4 text-yellow-600" />
              Top employé
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="font-semibold truncate">
              {topEmployee?.employe ?? "N/A"}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              {topEmployee
                ? formatHeures(topEmployee.heuresMois)
                : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FUTUR GRAPH 1 */}
      <Card>
        <CardHeader>
          <CardTitle>
            Évolution des heures
          </CardTitle>

          <CardDescription>
            Graphique LineChart :
            heures par semaine sur le mois en cours.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            Future LineChart (Recharts)
          </div>
        </CardContent>
      </Card>

      {/* FUTUR GRAPH 2 */}
      <Card>
        <CardHeader>
          <CardTitle>
            Répartition des heures
          </CardTitle>

          <CardDescription>
            Graphique PieChart :
            comparaison des employés ou des sites.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            Future PieChart (Recharts)
          </div>
        </CardContent>
      </Card>

      {/* EMPLOYÉS */}
      <Card>
        <CardHeader>
          <CardTitle>
            Personnel
          </CardTitle>

          <CardDescription>
            Heures enregistrées par employé
          </CardDescription>
        </CardHeader>

        <CardContent>
          {data.entries.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <UsersIcon className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

              <p className="font-medium">
                Aucun relevé disponible
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sortedEmployees.map((entry, index) => {
                const progress = Math.min(
                  (entry.heuresMois / 220) * 100,
                  100
                );

                const fallback = entry.employe
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <Card
                    key={entry.id}
                    className="transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {fallback || "👤"}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <h3 className="font-semibold">
                              {entry.employe}
                            </h3>

                            <p className="text-sm text-muted-foreground">
                              {entry.fonction}
                            </p>
                          </div>
                        </div>

                        {index === 0 && (
                          <Badge className="bg-yellow-500">
                            #1
                          </Badge>
                        )}
                      </div>

                      {data.isAll && (
                        <Badge variant="outline">
                          {entry.site}
                        </Badge>
                      )}

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Cette semaine
                          </span>

                          <span>
                            {formatHeures(
                              entry.heuresSemaine
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Ce mois
                          </span>

                          <span className="font-semibold">
                            {formatHeures(
                              entry.heuresMois
                            )}
                          </span>
                        </div>

                        <Progress value={progress} />

                        <p className="text-xs text-muted-foreground">
                          {Math.round(progress)}% de
                          l'objectif mensuel (220h)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 border-t pt-3">
                        <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />

                        <span className="text-xs text-muted-foreground">
                          Fonction : {entry.fonction}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}