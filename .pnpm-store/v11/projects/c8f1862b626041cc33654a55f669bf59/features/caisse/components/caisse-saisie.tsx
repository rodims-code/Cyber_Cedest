"use client";

import * as React from "react";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  BanknoteIcon,
  PlusIcon,
  RefreshCwIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import {
  createCaisseEntryAction,
  cancelCaisseEntryAction,
  getCaisseEntriesAndTotalsAction,
} from "@/features/caisse/actions";
import { formatMontant, type Devise } from "@/lib/format";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  recette: {
    label: "Recette",
    icon: <ArrowDownLeftIcon className="size-4 text-emerald-600" />,
    color: "text-emerald-600",
  },
  depense: {
    label: "Dépense",
    icon: <ArrowUpRightIcon className="size-4 text-red-600" />,
    color: "text-red-600",
  },
  fourniture: {
    label: "Fourniture",
    icon: <BanknoteIcon className="size-4 text-violet-600" />,
    color: "text-violet-600",
  },
};

type CaisseEntry = {
  id: number;
  siteId: string;
  siteNom: string;
  date: string;
  type: "recette" | "depense" | "fourniture";
  libelle: string;
  montant: number;
  devise: "CDF" | "USD";
  saisiPar: string;
  saisiParNom: string;
  statut: "valide" | "annule";
  annulePar: string | null;
  motifAnnulation: string | null;
  annuleAt: string | null;
  createdAt: string;
};

export type CaisseJourTotals = {
  recettes: number;
  depenses: number;
  fournitures: number;
  solde: number;
  devise: Devise;
  nombreOperations: number;
};

export interface CaisseSaisieProps {
  site: {
    id: string;
    nom: string;
  };
  initialEntries?: CaisseEntry[];
  initialTotals?: CaisseJourTotals[];
}

export function CaisseSaisie({
  site,
  initialEntries = [],
  initialTotals = [],
}: CaisseSaisieProps) {
  const [type, setType] = React.useState<"recette" | "depense" | "fourniture">(
    "recette"
  );
  const [libelle, setLibelle] = React.useState("");
  const [montant, setMontant] = React.useState("");
  const [devise, setDevise] = React.useState<"CDF" | "USD">("CDF");
  const [entries, setEntries] = React.useState<CaisseEntry[]>(initialEntries);
  const [totals, setTotals] = React.useState<CaisseJourTotals[]>(initialTotals);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const result = await getCaisseEntriesAndTotalsAction(site.id);
      if (result.ok) {
        setEntries(result.entries);
        setTotals(result.totals);
      } else {
        toast.error(result.error ?? "Impossible de charger la caisse.");
      }
    } catch (err) {
      console.error("Erreur chargement caisse:", err);
      toast.error("Impossible de charger la caisse.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if ((type === "depense" || type === "fourniture") && !libelle.trim()) {
      setError("Le libellé est obligatoire pour ce type de mouvement.");
      return;
    }

    const montantNum = parseInt(montant, 10);
    if (!montantNum || montantNum <= 0) {
      setError("Le montant doit être un entier strictement positif.");
      return;
    }

    setLoading(true);
    try {
      const result = await createCaisseEntryAction({
        siteId: site.id,
        type,
        libelle: libelle.trim(),
        montant: montantNum,
        devise,
      });

      if (result.ok) {
        setSuccess(result.message ?? "Ligne enregistrée.");
        toast.success(result.message ?? "Ligne enregistrée.");
        setLibelle("");
        setMontant("");
        await loadData();
      } else {
        setError(result.error ?? "Une erreur est survenue.");
        toast.error(result.error ?? "Une erreur est survenue.");
      }
    } catch (err) {
      console.error("Erreur création caisse:", err);
      setError("Une erreur est survenue.");
      toast.error("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(entryId: number, motif: string) {
    setLoading(true);
    try {
      const result = await cancelCaisseEntryAction({
        id: entryId,
        motifAnnulation: motif,
      });
      if (result.ok) {
        setSuccess(result.message ?? "Ligne annulée.");
        toast.success(result.message ?? "Ligne annulée.");
        await loadData();
      } else {
        setError(result.error ?? "Une erreur est survenue.");
        toast.error(result.error ?? "Une erreur est survenue.");
      }
    } catch (err) {
      console.error("Erreur annulation caisse:", err);
      setError("Une erreur est survenue.");
      toast.error("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (!site?.id) {
    return (
      <section className="mx-auto w-full max-w-2xl p-4">
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Vous n'êtes affecté à aucun site. Contactez le gérant.
          </p>
        </div>
      </section>
    );
  }

  const siteId = site.id;
  const siteNom = site.nom;
  const typeInfo = TYPE_LABELS[type];
  const totalsByDevise =
    totals.find((t) => t.devise === devise) ?? {
      recettes: 0,
      depenses: 0,
      fournitures: 0,
      solde: 0,
      nombreOperations: 0,
      devise,
    };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Caisse du jour
          </h1>
          <p className="text-sm capitalize text-muted-foreground">
            {siteNom}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setLoading(true);
            loadData().finally(() => setLoading(false));
          }}
          disabled={loading}
        >
          <RefreshCwIcon className="size-4" aria-hidden />
          {loading ? "Actualisation…" : "Actualiser"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-50/50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          {success}
        </div>
      )}

      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Type :
            </span>
            {Object.entries(TYPE_LABELS).map(([key, info]) => (
              <Button
                key={key}
                type="button"
                variant={
                  type === key ? "default" : "outline"
                }
                className={cn(
                  "flex items-center gap-2 text-sm",
                  type === key ? "" : "text-muted-foreground"
                )}
                onClick={() =>
                  setType(key as "recette" | "depense" | "fourniture")}
              >
                {info.icon}
                {info.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Libellé
              </label>
              <Textarea
                id="libelle"
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                rows={2}
                placeholder={type === "recette" ? "Facultatif" : "Requis"}
                className="min-h-[72px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Montant
              </label>
              <Input
                id="montant"
                type="number"
                value={montant}
                onChange={(e) =>
                  setMontant(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className="text-right"
              />
            </div>

            <div className="space-y-1.5 flex items-end">
              <label className="text-xs font-medium text-muted-foreground">
                Devise
              </label>
              <Select
                value={devise}
                onValueChange={(value) =>
                  setDevise(value as "CDF" | "USD")}
              >
                <SelectTrigger>
                  <SelectValue>{devise}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDF">
                    CDF (Francs congolais)
                  </SelectItem>
                  <SelectItem value="USD">
                    USD (Dollars américains)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <Button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as React.FormEvent);
              }}
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                <RefreshCwIcon className="animate-spin" aria-hidden />
              ) : (
                <PlusIcon className="size-4" aria-hidden />
              )}
              {loading ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>

      {totals.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {totals.map((t, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t.devise}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-emerald-100 flex items-center justify-center">
                      <ArrowDownLeftIcon className="size-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Recettes
                      </div>
                      <div className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                        +{formatMontant(t.recettes, t.devise as "CDF" | "USD")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                      <ArrowUpRightIcon className="size-4 text-red-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-red-600 dark:text-red-400">
                        Dépenses
                      </div>
                      <div className="text-2xl font-semibold tabular-nums text-red-600 dark:text-red-400">
                        -{formatMontant(t.depenses, t.devise)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-violet-100 flex items-center justify-center">
                      <BanknoteIcon className="size-4 text-violet-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-violet-600 dark:text-violet-400">
                        Fournitures
                      </div>
                      <div className="text-2xl font-semibold tabular-nums text-violet-600 dark:text-violet-400">
                        -{formatMontant(t.fournitures, t.devise)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                      <BanknoteIcon className="size-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Solde
                      </div>
                      <div className={`text-2xl font-semibold tabular-nums ${t.solde >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {t.solde >= 0 ? "+" : ""}{formatMontant(
                          t.solde,
                          t.devise
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Mouvements du jour</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              loadData().finally(() => setLoading(false));
            }}
          >
            <RefreshCwIcon className="size-4" aria-hidden />
          </Button>
        </div>
        {entries.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Aucun mouvement enregistré aujourd'hui.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left px-4 py-3">Heure</th>
                <th className="text-left px-4 py-3">Libellé</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-right px-4 py-3">Montant</th>
                <th className="text-right px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">
                    {entry.createdAt.slice(11, 16)}
                  </td>
                  <td className="px-4 py-3 text-sm">{entry.libelle}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      variant={
                        entry.type === "recette"
                          ? "secondary"
                          : entry.type === "depense"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {entry.type.charAt(0).toUpperCase() +
                        entry.type.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums text-right">
                    {entry.montant >= 0 ? "+" : ""}{formatMontant(
                      entry.montant,
                      entry.devise
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      variant={
                        entry.statut === "valide"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {entry.statut === "valide" ? "Valide" : "Annulé"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {entry.statut === "valide" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          const motif = window.prompt(
                            "Motif de l'annulation :"
                          );
                          if (motif !== null && motif !== "") {
                            handleCancel(entry.id, motif);
                          }
                        }}
                      >
                        Annuler
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
