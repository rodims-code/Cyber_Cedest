import Link from "next/link";
import {
  ArrowRightIcon,
  BanknoteIcon,
  CalendarDaysIcon,
  ClockIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentSite } from "@/lib/current-site";
import { formatMontant } from "@/lib/format";
import { cn } from "@/lib/utils";
import { requireRole } from "@/lib/session";
import { getDashboardStats } from "@/features/dashboard/queries";
import { NoSiteAssigned } from "@/features/sites/components/no-site-assigned";

export const dynamic = "force-dynamic";

export default async function GerantOverviewPage() {
  await requireRole(["gerant"]);

  const currentSite = await getCurrentSite();
  if (!currentSite.isAll && !currentSite.id) {
    return <NoSiteAssigned />;
  }

  const stats = await getDashboardStats(
    currentSite.isAll ? null : currentSite.id
  );

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Vue d&apos;ensemble
          </h1>
          <p className="text-sm capitalize text-muted-foreground">
            {stats.caisseDuJour.dateKinshasa}
          </p>
        </div>
        <Badge variant={stats.isAll ? "secondary" : "outline"} className="w-fit">
          {stats.isAll ? "Vue cumulée" : `Site ${stats.siteNom}`}
        </Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chiffre d&apos;affaires du mois
            </CardTitle>
            <TrendingUpIcon className="size-4 text-emerald-600" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {formatMontant(
                stats.vueEnsemble.chiffreAffairesMois,
                stats.vueEnsemble.devise
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.vueEnsemble.croissancePct >= 0 ? "+" : ""}
              {stats.vueEnsemble.croissancePct} % par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients du jour</CardTitle>
            <UsersIcon className="size-4 text-blue-600" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {stats.vueEnsemble.clientsDuJour}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Fréquentation enregistrée aujourd&apos;hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux d&apos;occupation
            </CardTitle>
            <CalendarDaysIcon className="size-4 text-violet-600" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {stats.vueEnsemble.tauxOccupationPct} %
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.vueEnsemble.postesOccupes} /{" "}
              {stats.vueEnsemble.postesTotal} postes occupés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pointages du jour
            </CardTitle>
            <ClockIcon className="size-4 text-amber-600" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {stats.pointages.presents} présents
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.pointages.retards} retard
              {stats.pointages.retards > 1 ? "s" : ""} ·{" "}
              {stats.pointages.absents} absent
              {stats.pointages.absents > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <WalletIcon className="size-5 text-primary" aria-hidden />
                  Caisse du jour
                </CardTitle>
                <CardDescription>
                  Solde, entrées et sorties de {stats.siteNom.toLowerCase()}.
                </CardDescription>
              </div>
              <Badge variant="outline">{stats.caisseDuJour.devise}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Solde actuel</p>
              <p className="text-3xl font-semibold tabular-nums">
                {formatMontant(
                  stats.caisseDuJour.soldeActuel,
                  stats.caisseDuJour.devise
                )}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border bg-muted/30 p-3">
                <dt className="text-muted-foreground">Entrées</dt>
                <dd className="mt-1 font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  +{formatMontant(stats.caisseDuJour.entrees, stats.caisseDuJour.devise)}
                </dd>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <dt className="text-muted-foreground">Sorties</dt>
                <dd className="mt-1 font-semibold tabular-nums text-destructive">
                  −{formatMontant(stats.caisseDuJour.sorties, stats.caisseDuJour.devise)}
                </dd>
              </div>
            </dl>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {stats.caisseDuJour.nombreOperations} opération
                {stats.caisseDuJour.nombreOperations > 1 ? "s" : ""} aujourd&apos;hui
              </p>
              <Link
                href="/dashboard/gerant/caisse"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5"
                )}
              >
                Voir la caisse
                <ArrowRightIcon className="size-4" aria-hidden />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BanknoteIcon className="size-5 text-primary" aria-hidden />
              Activité récente
            </CardTitle>
            <CardDescription>
              Dernières opérations enregistrées sur le site actif.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.activiteRecente.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                Aucune opération récente pour ce site.
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {stats.activiteRecente.map((operation) => (
                  <li
                    key={operation.id}
                    className="flex items-center justify-between gap-3 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {operation.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {operation.heure} ·{" "}
                        {operation.type === "vente"
                          ? "Vente"
                          : operation.type === "service"
                            ? "Service"
                            : "Dépense"}
                      </p>
                    </div>
                    {operation.montant !== undefined && operation.devise ? (
                      <span
                        className={cn(
                          "shrink-0 text-sm font-semibold tabular-nums",
                          operation.type === "depense"
                            ? "text-destructive"
                            : "text-emerald-700 dark:text-emerald-400"
                        )}
                      >
                        {operation.type === "depense" ? "−" : "+"}
                        {formatMontant(operation.montant, operation.devise)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
