"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangleIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  FileDownIcon,
  MapPinIcon,
  SaveIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { savePlanningAction } from "@/features/planning/actions";
import {
  MIN_PAR_SITE,
  generatePlanning,
  type PlanningWarning,
} from "@/features/planning/generator";
import type { PlanningWeekData } from "@/features/planning/queries";
import {
  addDaysIso,
  formatDateCourteIso,
  formatJourSemaine,
  getKinshasaWeekStartIso,
  getPreviousWeekStartIso,
  getWorkWeekDays,
} from "@/lib/time";
import { cn } from "@/lib/utils";

type Fonction = "operateur" | "appui";

type DraftShift = {
  date: string;
  siteId: string;
  userId: string;
  fonction: Fonction;
};

type AutoAction = "generer" | "copier" | null;

type Feedback = {
  type: "success" | "error";
  text: string;
} | null;

const fonctionLabel: Record<Fonction, string> = {
  operateur: "Opérateur",
  appui: "Appui",
};

function toDraft(shift: DraftShift): DraftShift {
  return {
    date: shift.date,
    siteId: shift.siteId,
    userId: shift.userId,
    fonction: shift.fonction,
  };
}

function draftSignature(shifts: DraftShift[]): string {
  return shifts
    .map(
      (shift) =>
        `${shift.date}|${shift.siteId}|${shift.userId}|${shift.fonction}`
    )
    .sort()
    .join(";");
}

function mergeRestDays(
  base: Record<string, string[]>,
  appuiShifts: DraftShift[]
): Record<string, string[]> {
  const merged: Record<string, string[]> = { ...base };

  for (const shift of appuiShifts) {
    const days = merged[shift.userId] ?? [];
    if (!days.includes(shift.date)) {
      merged[shift.userId] = [...days, shift.date];
    }
  }

  return merged;
}

function copyPreviousWeek(data: PlanningWeekData): {
  draft: DraftShift[];
  skipped: number;
} {
  const previousDays = getWorkWeekDays(
    getPreviousWeekStartIso(data.weekStart)
  );
  const activeSiteIds = new Set(data.sites.map((site) => site.id));
  const activeUserIds = new Set(data.operators.map((operator) => operator.id));
  const byKey = new Map<string, DraftShift>();
  let skipped = 0;

  for (const shift of data.previousShifts) {
    const index = previousDays.indexOf(shift.date);
    if (index < 0 || index >= data.days.length) {
      skipped += 1;
      continue;
    }

    if (
      !activeSiteIds.has(shift.siteId) ||
      !activeUserIds.has(shift.userId)
    ) {
      skipped += 1;
      continue;
    }

    const date = data.days[index];
    byKey.set(`${date}|${shift.userId}`, {
      date,
      siteId: shift.siteId,
      userId: shift.userId,
      fonction: shift.fonction,
    });
  }

  return { draft: [...byKey.values()], skipped };
}

function buildInitialState(
  data: PlanningWeekData,
  autoAction: AutoAction
): {
  draft: DraftShift[];
  warnings: PlanningWarning[];
  feedback: Feedback;
} {
  const saved = data.shifts.map(toDraft);

  if (autoAction === "generer") {
    if (data.scopeSiteId !== null) {
      return {
        draft: saved,
        warnings: [],
        feedback: {
          type: "error",
          text: "La génération automatique est disponible en vue « Tous les sites ».",
        },
      };
    }

    const appuiShifts = saved.filter((shift) => shift.fonction === "appui");
    const result = generatePlanning({
      operators: data.operators,
      sites: data.sites,
      days: data.days,
      restDays: mergeRestDays({}, appuiShifts),
      previousWeek: data.previousShifts.map((shift) => ({
        date: shift.date,
        siteId: shift.siteId,
        userId: shift.userId,
      })),
    });

    return {
      draft: [...appuiShifts, ...result.shifts],
      warnings: result.warnings,
      feedback: result.complete
        ? {
            type: "success",
            text: "Proposition générée. Vérifiez, ajustez puis enregistrez.",
          }
        : {
            type: "error",
            text: "Proposition incomplète : consultez les avertissements.",
          },
    };
  }

  if (autoAction === "copier") {
    const copied = copyPreviousWeek(data);
    if (copied.draft.length === 0) {
      return {
        draft: saved,
        warnings: [],
        feedback: {
          type: "error",
          text:
            copied.skipped > 0
              ? "Aucun poste copiable : des employés ou sites sont inactifs."
              : "Aucun poste dans la semaine précédente.",
        },
      };
    }

    return {
      draft: copied.draft,
      warnings: [],
      feedback: {
        type: copied.skipped > 0 ? "error" : "success",
        text:
          copied.skipped > 0
            ? `Semaine copiée, ${copied.skipped} poste(s) ignoré(s) car l'employé ou le site est inactif.`
            : "Semaine précédente copiée. Vérifiez puis enregistrez.",
      },
    };
  }

  return { draft: saved, warnings: [], feedback: null };
}

function capitalize(value: string): string {
  return value.length === 0 ? value : value[0].toLocaleUpperCase("fr-FR") + value.slice(1);
}

export function PlanningView({
  data,
  autoAction = null,
}: {
  data: PlanningWeekData;
  autoAction?: AutoAction;
}) {
  const router = useRouter();
  const [initial] = React.useState(() => buildInitialState(data, autoAction));
  const [draft, setDraft] = React.useState<DraftShift[]>(initial.draft);
  const [warnings, setWarnings] = React.useState<PlanningWarning[]>(
    initial.warnings
  );
  const [feedback, setFeedback] = React.useState<Feedback>(initial.feedback);
  const [savedSignature, setSavedSignature] = React.useState(() =>
    draftSignature(data.shifts.map(toDraft))
  );
  const [restDays, setRestDays] = React.useState<Record<string, string[]>>({});
  const [pendingAssignments, setPendingAssignments] = React.useState<
    Record<string, { userId: string; fonction: Fonction }>
  >({});
  const [isPending, startTransition] = React.useTransition();

  // Retire le paramètre d'action de l'URL après la génération/copie initiale,
  // pour qu'un rechargement ne remplace pas le brouillon en cours.
  React.useEffect(() => {
    if (!autoAction) return;

    const url = new URL(window.location.href);
    url.searchParams.delete("action");
    window.history.replaceState(null, "", url.toString());
  }, [autoAction]);

  const draftSig = React.useMemo(() => draftSignature(draft), [draft]);
  const isDirty = draftSig !== savedSignature;

  const userNameById = React.useMemo(() => {
    const names = new Map(
      data.operators.map((operator) => [operator.id, operator.nom])
    );
    for (const shift of [...data.shifts, ...data.previousShifts]) {
      if (!names.has(shift.userId)) {
        names.set(shift.userId, shift.userName);
      }
    }
    return names;
  }, [data.operators, data.shifts, data.previousShifts]);

  const assignedByDate = React.useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const shift of draft) {
      const set = map.get(shift.date) ?? new Set<string>();
      set.add(shift.userId);
      map.set(shift.date, set);
    }
    return map;
  }, [draft]);

  const coverageGaps = React.useMemo(() => {
    const gaps: { date: string; siteNom: string }[] = [];
    for (const date of data.days) {
      for (const site of data.sites) {
        const count = draft.filter(
          (shift) => shift.date === date && shift.siteId === site.id
        ).length;
        if (count < MIN_PAR_SITE) {
          gaps.push({ date, siteNom: site.nom });
        }
      }
    }
    return gaps;
  }, [draft, data.days, data.sites]);

  const shiftsFor = (date: string, siteId: string) =>
    draft
      .filter((shift) => shift.date === date && shift.siteId === siteId)
      .sort((left, right) => {
        if (left.fonction !== right.fonction) {
          return left.fonction === "operateur" ? -1 : 1;
        }
        return (userNameById.get(left.userId) ?? "").localeCompare(
          userNameById.get(right.userId) ?? "",
          "fr"
        );
      });

  const availableOperators = (date: string) => {
    const assigned = assignedByDate.get(date) ?? new Set<string>();
    return data.operators.filter((operator) => !assigned.has(operator.id));
  };

  const toggleRestDay = (userId: string, date: string) => {
    setRestDays((previous) => {
      const days = new Set(previous[userId] ?? []);
      if (days.has(date)) {
        days.delete(date);
      } else {
        days.add(date);
      }
      return { ...previous, [userId]: [...days] };
    });
  };

  const addShift = (
    date: string,
    siteId: string,
    userId: string,
    fonction: Fonction
  ) => {
    if (!userId) return;

    if (draft.some((shift) => shift.date === date && shift.userId === userId)) {
      setFeedback({
        type: "error",
        text: "Cet employé est déjà planifié ce jour-là.",
      });
      return;
    }

    setDraft((previous) => [...previous, { date, siteId, userId, fonction }]);
    setWarnings([]);
    setFeedback(null);
    setPendingAssignments((previous) => ({
      ...previous,
      [`${date}|${siteId}`]: { userId: "", fonction: "operateur" },
    }));
  };

  const removeShift = (date: string, userId: string) => {
    setDraft((previous) =>
      previous.filter(
        (shift) => !(shift.date === date && shift.userId === userId)
      )
    );
    setWarnings([]);
    setFeedback(null);
  };

  const handleGenerate = () => {
    const appuiShifts = draft.filter((shift) => shift.fonction === "appui");
    const result = generatePlanning({
      operators: data.operators,
      sites: data.sites,
      days: data.days,
      restDays: mergeRestDays(restDays, appuiShifts),
      previousWeek: data.previousShifts.map((shift) => ({
        date: shift.date,
        siteId: shift.siteId,
        userId: shift.userId,
      })),
    });

    setDraft([...appuiShifts, ...result.shifts]);
    setWarnings(result.warnings);
    setFeedback(
      result.complete
        ? {
            type: "success",
            text: "Proposition générée. Vérifiez, ajustez puis enregistrez.",
          }
        : {
            type: "error",
            text: "Proposition incomplète : consultez les avertissements.",
          }
    );
  };

  const handleCopy = () => {
    const copied = copyPreviousWeek(data);

    if (copied.draft.length === 0) {
      setFeedback({
        type: "error",
        text:
          copied.skipped > 0
            ? "Aucun poste copiable : des employés ou sites sont inactifs."
            : "Aucun poste dans la semaine précédente.",
      });
      return;
    }

    setDraft(copied.draft);
    setWarnings([]);
    setFeedback({
      type: copied.skipped > 0 ? "error" : "success",
      text:
        copied.skipped > 0
          ? `Semaine copiée, ${copied.skipped} poste(s) ignoré(s) car l'employé ou le site est inactif.`
          : "Semaine précédente copiée. Vérifiez puis enregistrez.",
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await savePlanningAction({
        weekStart: data.weekStart,
        scopeSiteId: data.scopeSiteId,
        shifts: draft,
      });

      if (result.ok) {
        setSavedSignature(draftSig);
        setFeedback({
          type: "success",
          text: result.message ?? "Planning enregistré.",
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: result.error ?? "L'enregistrement a échoué.",
        });
      }
    });
  };

  const goToWeek = (weekStart: string) => {
    if (
      isDirty &&
      !window.confirm(
        "Le brouillon non enregistré sera perdu. Continuer vers une autre semaine ?"
      )
    ) {
      return;
    }

    router.push(`/dashboard/gerant/planning?semaine=${weekStart}`);
  };

  const scopeLabel = data.scopeSiteId
    ? `Site ${data.sites[0]?.nom ?? ""}`
    : "Tous les sites";

  return (
    <section className="mx-auto w-full max-w-7xl space-y-5">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <CalendarDaysIcon className="size-5 text-primary" aria-hidden />
              Planning de la semaine
            </h1>
            <p className="text-sm text-muted-foreground">
              Du {formatDateCourteIso(data.days[0])} au{" "}
              {formatDateCourteIso(data.days[data.days.length - 1])} ·{" "}
              {scopeLabel} · lundi au samedi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => goToWeek(addDaysIso(data.weekStart, -7))}
              aria-label="Semaine précédente"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => goToWeek(getKinshasaWeekStartIso())}
            >
              Cette semaine
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => goToWeek(addDaysIso(data.weekStart, 7))}
              aria-label="Semaine suivante"
            >
              <ChevronRightIcon />
            </Button>
            <Badge variant={isDirty ? "destructive" : "secondary"}>
              {isDirty ? "Brouillon non enregistré" : "Enregistré"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={data.scopeSiteId !== null || isPending}
            title={
              data.scopeSiteId !== null
                ? "Sélectionnez « Tous les sites » pour générer une répartition équilibrée."
                : undefined
            }
          >
            <SparklesIcon />
            Générer la semaine
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            disabled={isPending}
          >
            <CopyIcon />
            Copier la semaine précédente
          </Button>
          <Button
            type="button"
            variant="outline"
            render={
              <a
                href={`/dashboard/gerant/planning/export?semaine=${data.weekStart}`}
              />
            }
          >
            <FileDownIcon />
            Exporter en Word
          </Button>
        </div>

        {data.scopeSiteId !== null && (
          <p className="text-xs text-muted-foreground">
            La génération automatique est disponible en vue « Tous les sites ».
            En vue d&apos;un site, ajoutez les postes à la main ou copiez la
            semaine précédente.
          </p>
        )}

        {feedback && (
          <p
            className={cn(
              "flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
              feedback.type === "error"
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            )}
          >
            {feedback.type === "error" ? (
              <AlertTriangleIcon
                className="mt-0.5 size-4 shrink-0"
                aria-hidden
              />
            ) : (
              <CheckCircle2Icon
                className="mt-0.5 size-4 shrink-0"
                aria-hidden
              />
            )}
            <span>{feedback.text}</span>
          </p>
        )}

        {warnings.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
            <p className="flex items-center gap-2 font-medium">
              <AlertTriangleIcon className="size-4" aria-hidden />
              Avertissements
            </p>
            <ul className="mt-2 space-y-1">
              {warnings.map((warning, index) => (
                <li key={`${warning.code}-${warning.date ?? "global"}-${index}`}>
                  {warning.date
                    ? `${formatDateCourteIso(warning.date)} : `
                    : ""}
                  {warning.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {coverageGaps.length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="flex items-center gap-2 font-medium text-destructive">
              <AlertTriangleIcon className="size-4" aria-hidden />
              Couverture incomplète
            </p>
            <p className="mt-1 text-muted-foreground">
              Chaque site doit avoir au moins {MIN_PAR_SITE} opérateur chaque
              jour.
            </p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {data.days.map((date) => {
                const missing = coverageGaps
                  .filter((gap) => gap.date === date)
                  .map((gap) => gap.siteNom);
                if (missing.length === 0) return null;
                return (
                  <li key={date}>
                    {formatDateCourteIso(date)} : {missing.join(", ")}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </header>

      <details className="rounded-xl border bg-card">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          Jours de repos pris en compte à la génération
        </summary>
        <div className="space-y-3 border-t p-4">
          <p className="text-xs text-muted-foreground">
            Cochez les jours où la personne ne travaille pas. Ces informations
            servent uniquement à la génération et ne sont pas enregistrées avec
            le planning.
          </p>

          {data.operators.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun opérateur actif. Ajoutez des opérateurs dans Utilisateurs
              avant de générer le planning.
            </p>
          ) : (
            data.operators.map((operator) => (
              <div
                key={operator.id}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <span className="min-w-40 text-sm font-medium">
                  {operator.nom}
                </span>
                <div className="flex flex-wrap gap-1">
                  {data.days.map((date) => {
                    const active = (restDays[operator.id] ?? []).includes(date);
                    return (
                      <Button
                        key={date}
                        type="button"
                        size="sm"
                        variant={active ? "default" : "outline"}
                        className="h-8 px-2 text-xs"
                        aria-pressed={active}
                        onClick={() => toggleRestDay(operator.id, date)}
                      >
                        {capitalize(formatJourSemaine(date).slice(0, 3))}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </details>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.days.map((date) => {
          const dayShifts = draft.filter((shift) => shift.date === date);

          return (
            <Card key={date} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    {capitalize(formatJourSemaine(date))}
                  </CardTitle>
                  <Badge variant="outline">
                    {formatDateCourteIso(date)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {dayShifts.length} poste{dayShifts.length > 1 ? "s" : ""} ·{" "}
                  {data.sites.length} site{data.sites.length > 1 ? "s" : ""}
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                {data.sites.map((site) => {
                  const siteShifts = shiftsFor(date, site.id);
                  const available = availableOperators(date);
                  const cellKey = `${date}|${site.id}`;
                  const pending = pendingAssignments[cellKey] ?? {
                    userId: "",
                    fonction: "operateur" as Fonction,
                  };

                  return (
                    <div
                      key={site.id}
                      className="rounded-lg border bg-muted/20 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-sm font-medium">
                          <MapPinIcon
                            className="size-3.5 text-muted-foreground"
                            aria-hidden
                          />
                          {site.nom}
                        </p>
                        <Badge
                          variant={
                            siteShifts.length >= MIN_PAR_SITE
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {siteShifts.length}
                        </Badge>
                      </div>

                      {siteShifts.length === 0 ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Aucun opérateur.
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-1.5">
                          {siteShifts.map((shift) => (
                            <li
                              key={shift.userId}
                              className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5"
                            >
                              <span className="min-w-0 flex-1 truncate text-sm">
                                {userNameById.get(shift.userId) ??
                                  "Employé inconnu"}
                              </span>
                              <Badge
                                variant="outline"
                                className="shrink-0 text-[10px]"
                              >
                                {fonctionLabel[shift.fonction]}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-6 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  removeShift(date, shift.userId)
                                }
                                aria-label={`Retirer ${
                                  userNameById.get(shift.userId) ??
                                  "cet employé"
                                }`}
                              >
                                <XIcon className="size-3.5" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}

                      {available.length > 0 ? (
                        <div className="mt-2 flex flex-col gap-1.5 sm:flex-row">
                          <select
                            value={pending.userId}
                            onChange={(event) =>
                              setPendingAssignments((previous) => ({
                                ...previous,
                                [cellKey]: {
                                  ...(previous[cellKey] ?? {
                                    userId: "",
                                    fonction: "operateur" as Fonction,
                                  }),
                                  userId: event.target.value,
                                },
                              }))
                            }
                            className="h-8 min-w-0 flex-1 rounded-md border bg-background px-2 text-xs"
                            aria-label={`Ajouter un employé à ${site.nom}`}
                          >
                            <option value="">Ajouter…</option>
                            {available.map((operator) => (
                              <option key={operator.id} value={operator.id}>
                                {operator.nom}
                              </option>
                            ))}
                          </select>

                          <select
                            value={pending.fonction}
                            onChange={(event) =>
                              setPendingAssignments((previous) => ({
                                ...previous,
                                [cellKey]: {
                                  ...(previous[cellKey] ?? {
                                    userId: "",
                                    fonction: "operateur" as Fonction,
                                  }),
                                  fonction: event.target.value as Fonction,
                                },
                              }))
                            }
                            className="h-8 rounded-md border bg-background px-2 text-xs"
                            aria-label="Fonction"
                          >
                            <option value="operateur">Opérateur</option>
                            <option value="appui">Appui</option>
                          </select>

                          <Button
                            type="button"
                            size="sm"
                            className="h-8"
                            disabled={!pending.userId}
                            onClick={() =>
                              addShift(
                                date,
                                site.id,
                                pending.userId,
                                pending.fonction
                              )
                            }
                          >
                            Ajouter
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Tous les opérateurs sont déjà placés ce jour.
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="sticky bottom-4 z-10 flex flex-col gap-2 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {isDirty
            ? "Des modifications ne sont pas enregistrées."
            : "Le planning affiché est enregistré."}
        </p>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isPending}
          className="w-full gap-2 sm:w-auto"
        >
          <SaveIcon />
          {isPending ? "Enregistrement…" : "Enregistrer le planning"}
        </Button>
      </div>
    </section>
  );
}
