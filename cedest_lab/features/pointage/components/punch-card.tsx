"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangleIcon,
  CalendarOffIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  FingerprintIcon,
  Loader2Icon,
  LogInIcon,
  LogOutIcon,
  MapPinIcon,
  Settings2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  punchInAction,
  punchOutAction,
  type PunchState,
} from "@/features/pointage/actions";
import type {
  PunchBlockedReason,
  PunchContextData,
} from "@/features/pointage/queries";
import { diffHeures, formatDuree } from "@/lib/time";
import { cn } from "@/lib/utils";

const BLOCKED_COPY: Record<
  PunchBlockedReason,
  { title: string; detail: string }
> = {
  gerant_all: {
    title: "Choisissez un site précis",
    detail:
      "Sélectionnez KIMIALA ou SHELL dans le sélecteur de site, à gauche, pour pointer votre arrivée.",
  },
  aucun_poste: {
    title: "Aucun poste aujourd'hui",
    detail:
      "Le pointage d'arrivée est indisponible tant qu'aucun poste ne vous est assigné. Voyez avec le gérant.",
  },
  site_indisponible: {
    title: "Site indisponible",
    detail:
      "Le site de votre poste n'est pas disponible. Contactez le gérant.",
  },
};

export function PunchCard({
  openPointage,
  todaySite,
  blockedReason,
}: PunchContextData) {
  const router = useRouter();
  const [feedback, setFeedback] = React.useState<PunchState | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [now, setNow] = React.useState(() => Date.now());

  // Durée toujours affichée à partir de l'instant arrêté, rafraîchie toutes
  // les 10 secondes tant qu'un pointage est ouvert.
  React.useEffect(() => {
    if (!openPointage) return;

    // formatDuree arrondit à la minute : 10 s suffisent pour rester exact.
    const timer = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => window.clearInterval(timer);
  }, [openPointage]);

  const arriveeDate = openPointage ? new Date(openPointage.arriveeIso) : null;
  const dureeOuverte =
    arriveeDate && !Number.isNaN(arriveeDate.getTime())
      ? diffHeures(arriveeDate, new Date(now))
      : 0;

  const blocked = !openPointage && blockedReason !== null;
  const canPunchIn = !isPending && !openPointage && blockedReason === null;
  const blockedCopy = blockedReason !== null ? BLOCKED_COPY[blockedReason] : null;

  const handlePunchIn = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await punchInAction();
      setFeedback(result);
      if (result.ok) {
        router.refresh();
      }
    });
  };

  const handlePunchOut = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await punchOutAction();
      setFeedback(result);
      if (result.ok) {
        router.refresh();
      }
    });
  };

  return (
    <Card
      className={cn(
        "border-primary/25 shadow-sm",
        openPointage && "border-emerald-500/40 bg-emerald-500/5",
        blocked && "border-destructive/25"
      )}
    >
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <FingerprintIcon className="size-4 text-primary" aria-hidden />
            Mon pointage
          </p>
          <Badge
            variant={
              openPointage ? "default" : blocked ? "destructive" : "outline"
            }
          >
            {openPointage
              ? "En poste"
              : blocked
                ? "Indisponible"
                : "Pas pointé"}
          </Badge>
        </div>

        {openPointage ? (
          <>
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="relative mt-1.5 flex size-3 shrink-0"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
              </span>
              <div className="min-w-0">
                <p className="text-lg leading-snug font-semibold">
                  En poste depuis {openPointage.arriveeLabel}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="size-3" aria-hidden />
                    {openPointage.siteNom}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="tabular-nums">
                    {formatDuree(dureeOuverte)} écoulées
                  </span>
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="destructive"
              size="lg"
              className="h-14 w-full gap-2 text-base font-semibold"
              onClick={handlePunchOut}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2Icon className="animate-spin" aria-hidden />
              ) : (
                <LogOutIcon aria-hidden />
              )}
              {isPending ? "Enregistrement…" : "Pointer le départ"}
            </Button>
          </>
        ) : blocked && blockedCopy ? (
          <>
            <div
              role="status"
              className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-3"
            >
              {blockedReason === "gerant_all" ? (
                <Settings2Icon
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              ) : (
                <CalendarOffIcon
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              )}
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {blockedCopy.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {blockedCopy.detail}
                </span>
              </span>
            </div>

            <Button
              type="button"
              size="lg"
              className="h-14 w-full gap-2 text-base font-semibold"
              disabled
            >
              <LogInIcon aria-hidden />
              Pointer l&apos;arrivée
            </Button>
          </>
        ) : (
          <>
            {todaySite ? (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <CalendarDaysIcon
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                <span>
                  Poste prévu aujourd&apos;hui :{" "}
                  <span className="font-medium text-foreground">
                    {todaySite.siteNom}
                  </span>
                </span>
              </p>
            ) : (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <CalendarDaysIcon
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                <span>
                  Prêt à pointer votre arrivée ?
                </span>
              </p>
            )}

            <Button
              type="button"
              size="lg"
              className="h-14 w-full gap-2 text-base font-semibold"
              onClick={handlePunchIn}
              disabled={!canPunchIn}
            >
              {isPending ? (
                <Loader2Icon className="animate-spin" aria-hidden />
              ) : (
                <LogInIcon aria-hidden />
              )}
              {isPending ? "Enregistrement…" : "Pointer l'arrivée"}
            </Button>
          </>
        )}

        <p className="text-[11px] text-muted-foreground">
          L&apos;heure est celle du serveur, pas celle de votre appareil.
        </p>

        {feedback && (
          <p
            role={feedback.error ? "alert" : "status"}
            className={cn(
              "flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
              feedback.error
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            )}
          >
            {feedback.error ? (
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
            <span>{feedback.error ?? feedback.message}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
