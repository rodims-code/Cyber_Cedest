import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  BanknoteIcon,
  ReceiptTextIcon,
} from "lucide-react";

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
import { formatMontant } from "@/lib/format";
import type { CaisseDuJourData } from "@/features/dashboard/queries";

export function CaisseView({ data }: { data: CaisseDuJourData }) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Caisse du jour
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
            <CardTitle className="text-sm font-medium">Solde actuel</CardTitle>
            <BanknoteIcon className="size-4 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {formatMontant(data.soldeActuel, data.devise)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Espèces disponibles en caisse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées</CardTitle>
            <ArrowDownLeftIcon
              className="size-4 text-emerald-600"
              aria-hidden
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
              +{formatMontant(data.entrees, data.devise)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Encaissements du jour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sorties</CardTitle>
            <ArrowUpRightIcon className="size-4 text-destructive" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums text-destructive">
              −{formatMontant(data.sorties, data.devise)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Dépenses du jour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opérations</CardTitle>
            <ReceiptTextIcon className="size-4 text-violet-600" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tabular-nums">
              {data.nombreOperations}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Mouvements enregistrés
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dernières opérations</CardTitle>
          <CardDescription>
            Les montants sont affichés en {data.devise}, arrondis à l&apos;unité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.operations.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
              Aucune opération enregistrée pour ce site.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.operations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell className="max-w-56 truncate font-medium">
                      {operation.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          operation.type === "depense" ? "destructive" : "secondary"
                        }
                      >
                        {operation.type === "vente"
                          ? "Vente"
                          : operation.type === "service"
                            ? "Service"
                            : "Dépense"}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {operation.heure}
                    </TableCell>
                    <TableCell
                      className={
                        operation.type === "depense"
                          ? "text-right font-semibold tabular-nums text-destructive"
                          : "text-right font-semibold tabular-nums text-emerald-700 dark:text-emerald-400"
                      }
                    >
                      {operation.type === "depense" ? "−" : "+"}
                      {operation.montant !== undefined && operation.devise
                        ? formatMontant(operation.montant, operation.devise)
                        : "—"}
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
