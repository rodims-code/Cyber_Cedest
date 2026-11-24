import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  BanknoteIcon,
  ReceiptTextIcon,
  TrendingUpIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { formatMontant } from "@/lib/format";
import type { CaisseDuJourData } from "@/features/dashboard/queries";

export function CaisseView({ data }: { data: CaisseDuJourData }) {
  const fluxNet = data.entrees - data.sorties;

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Caisse du jour
          </h1>

          <p className="mt-1 text-muted-foreground capitalize">
            {data.dateKinshasa}
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

      {/* Carte principale */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Solde disponible
              </p>

              <h2 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
                {formatMontant(
                  data.soldeActuel,
                  data.devise
                )}
              </h2>

              <p className="mt-3 text-sm text-muted-foreground">
                Fonds actuellement disponibles en caisse
              </p>
            </div>

            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <BanknoteIcon className="h-10 w-10 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">
              Entrées
            </CardTitle>

            <ArrowDownLeftIcon className="h-5 w-5 text-emerald-600" />
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              +{formatMontant(data.entrees, data.devise)}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Encaissements enregistrés
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">
              Sorties
            </CardTitle>

            <ArrowUpRightIcon className="h-5 w-5 text-red-600" />
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              -{formatMontant(data.sorties, data.devise)}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Dépenses enregistrées
            </p>
          </CardContent>
        </Card>

        <Card className="border-sky-200 bg-sky-50/50 dark:border-sky-900 dark:bg-sky-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">
              Flux net
            </CardTitle>

            <TrendingUpIcon className="h-5 w-5 text-sky-600" />
          </CardHeader>

          <CardContent>
            <p
              className={`text-2xl font-bold ${
                fluxNet >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {fluxNet >= 0 ? "+" : ""}
              {formatMontant(fluxNet, data.devise)}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Entrées - sorties
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">
              Opérations
            </CardTitle>

            <ReceiptTextIcon className="h-5 w-5 text-violet-600" />
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold">
              {data.nombreOperations}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Mouvements enregistrés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle>
            Activité récente
          </CardTitle>

          <CardDescription>
            Dernières opérations enregistrées.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {data.operations.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <ReceiptTextIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

              <h3 className="font-medium">
                Aucune opération aujourd'hui
              </h3>

              <p className="text-sm text-muted-foreground">
                Les nouvelles opérations apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.operations.map((operation) => {
                const isExpense =
                  operation.type === "depense";

                return (
                  <div
                    key={operation.id}
                    className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-3 ${
                          isExpense
                            ? "bg-red-100 dark:bg-red-950"
                            : "bg-emerald-100 dark:bg-emerald-950"
                        }`}
                      >
                        {isExpense ? (
                          <ArrowUpRightIcon className="h-4 w-4 text-red-600" />
                        ) : (
                          <ArrowDownLeftIcon className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>

                      <div>
                        <p className="font-medium">
                          {operation.description}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <Badge
                            variant={
                              isExpense
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {operation.type === "vente"
                              ? "Vente"
                              : operation.type === "service"
                              ? "Service"
                              : "Dépense"}
                          </Badge>

                          <span className="text-xs text-muted-foreground">
                            {operation.heure}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-semibold tabular-nums ${
                          isExpense
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {isExpense ? "-" : "+"}

                        {operation.montant !== undefined &&
                        operation.devise
                          ? formatMontant(
                              operation.montant,
                              operation.devise
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}