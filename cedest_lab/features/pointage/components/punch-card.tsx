"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangleIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  FingerprintIcon,
  Loader2Icon,
  LogInIcon,
  LogOutIcon,
  MapPinIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  punchInAction,
  punchOutAction,
  type PunchState,
} from "@/features/pointage/actions";
import type { PunchContextData } from "@/features/pointage/queries";
import { diffHeures, formatDuree } from "@/lib/time";
import { cn } from "@/lib/utils";

export function PunchCard({
  openPointage,
  todayShift,
  sites,
}: PunchContextData) {
  const router = useRouter();
  const [selectedSite, setSelectedSite] = React.useState("");
  const [feedback, setFeedback] = React.useState<PunchState | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [now, setNow] = React.useState(() => Date.now());

  // Durée toujours affichée à partir de l'instant arrêté, rafraîchie toutes
  // les 30 secondes tant qu'un pointage est ouvert.
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

  const needsSiteChoice = !openPointage && !todayShift;
  const canPunchIn =
    !isPending && (Boolean(todayShift) || selectedSite.length > 0);

  const handlePunchIn = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await punchInAction({
        siteId: todayShift ? null : selectedSite || null,
      });
      setFeedback(result);
      if (result.ok) {
        setSelectedSite("");
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
        openPointage && "border-emerald-500/40 bg-emerald-500/5"
      )}
    >
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <FingerprintIcon className="size-4 text-primary" aria-hidden />
            Mon pointage
          </p>
          <Badge variant={openPointage ? "default" : "outline"}>
            {openPointage ? "En poste" : "Pas pointé"}
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
        ) : (
          <>
            {todayShift ? (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <CalendarDaysIcon
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                <span>
                  Poste prévu aujourd&apos;hui :{" "}
                  <span className="font-medium text-foreground">
                    {todayShift.siteNom}
                  </span>
                </span>
              </p>
            ) : (
              <div className="space-y-1.5">
                <label
                  htmlFor="punch-site"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Aucun poste prévu aujourd&apos;hui. Choisissez le site où vous
                  commencez :
                </label>
                <select
                  id="punch-site"
                  value={selectedSite}
                  onChange={(event) => {
                    setSelectedSite(event.target.value);
                    setFeedback(null);
                  }}
                  disabled={isPending || sites.length === 0}
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">
                    {sites.length === 0
                      ? "Aucun site ne vous est assigné"
                      : "Choisir un site…"}
                  </option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.nom}
                    </option>
                  ))}
                </select>
              </div>
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
            {needsSiteChoice && !selectedSite && sites.length > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                Sélectionnez un site pour pointer.
              </p>
            )}
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
