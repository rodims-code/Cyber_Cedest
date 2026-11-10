// src/features/mon-espace/components/mon-espace-page.tsx
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Inbox,
  MapPin,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMonEspace, type MonEspace } from "@/features/mon-espace/data";
import { getPunchContextForUser } from "@/features/pointage/queries";
import { PunchCard } from "@/features/pointage/components/punch-card";
import { requireRole } from "@/lib/session";
import { cn } from "@/lib/utils";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const fonctionLabel = { operateur: "Opérateur", appui: "Appui" } as const;

/** 7.5 → "7 h 30" */
function formatHours(h: number) {
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return minutes === 0
    ? `${hours} h`
    : `${hours} h ${String(minutes).padStart(2, "0")}`;
}

function dayDate(weekStart: Date, index: number) {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + index);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(d);
}

export async function MonEspacePage({
  role,
}: {
  role: "gerant" | "operateur" | "technicien";
}) {
  const session = await requireRole([role]);
  const [data, punchContext] = await Promise.all([
    getMonEspace(session.user.id, role),
    getPunchContextForUser(session.user.id, role),
  ]);
  const basePath = `/dashboard/${role}`;

  const firstName = session.user.name.trim().split(/\s+/)[0];
  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Africa/Kinshasa",
  }).format(new Date());

  const weekHours = data.week.reduce(
    (sum, d, i) =>
      data.todayIndex !== null && i <= data.todayIndex ? sum + d.hours : sum,
    0,
  );

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Bonjour, {firstName}
        </h1>
        <p className="text-sm capitalize text-muted-foreground">{today}</p>
      </header>

      <PunchCard {...punchContext} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Pending pending={data.pending} basePath={basePath} />
          <WeekPlanning
            data={data}
            basePath={basePath}
            canViewPlanning={role === "gerant"}
          />
        </div>

        <aside className="space-y-8">
          <Hours data={data} weekHours={weekHours} />
          <Remuneration />
        </aside>
      </div>
    </section>
  );
}

/* ---------- À traiter ---------- */

function Pending({
  pending,
  basePath,
}: {
  pending: MonEspace["pending"];
  basePath: string;
}) {
  const items: {
    icon: LucideIcon;
    text: string;
    href: string;
    count: number | null;
  }[] = [];

  if (pending.heuresAValider > 0) {
    items.push({
      icon: Clock,
      count: pending.heuresAValider,
      text: `pointage${pending.heuresAValider > 1 ? "s" : ""} à valider`,
      href: `${basePath}/pointage`,
    });
  }
  if (pending.nouvellesDemandes > 0) {
    items.push({
      icon: Inbox,
      count: pending.nouvellesDemandes,
      text: `nouvelle${pending.nouvellesDemandes > 1 ? "s" : ""} demande${pending.nouvellesDemandes > 1 ? "s" : ""} de client`,
      href: `${basePath}/demandes`,
    });
  }
  for (const site of pending.caisseManquante) {
    items.push({
      icon: Wallet,
      count: null,
      text: `caisse du jour non saisie à ${site}`,
      href: `${basePath}/caisse`,
    });
  }

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">À traiter</h2>

      {items.length === 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
          <CheckCircle2 className="size-5 text-emerald-600" aria-hidden />
          Rien en attente. Tout est à jour.
        </div>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {items.map((item) => (
            <li key={item.text}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <item.icon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="flex-1">
                  {item.count !== null && (
                    <span className="font-semibold tabular-nums">
                      {item.count}{" "}
                    </span>
                  )}
                  {item.text}
                </span>
                <ChevronRight
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Planning de la semaine ---------- */

function WeekPlanning({
  data,
  basePath,
  canViewPlanning,
}: {
  data: MonEspace;
  basePath: string;
  canViewPlanning: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
          Mon planning cette semaine
        </h2>
        {canViewPlanning && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            render={<Link href={`${basePath}/planning`} />}
          >
            Planning complet
          </Button>
        )}
      </div>

      <ul className="divide-y rounded-lg border bg-card">
        {data.week.map(({ shift }, i) => {
          const isToday = data.todayIndex === i;
          const isPast = data.todayIndex !== null && i < data.todayIndex;
          return (
            <li
              key={DAYS[i]}
              aria-current={isToday ? "date" : undefined}
              className={cn(
                "flex items-center gap-4 border-l-2 px-4 py-3.5",
                isToday ? "border-l-primary bg-primary/5" : "border-l-transparent",
                isPast && "text-muted-foreground",
              )}
            >
              <div className="w-20 shrink-0">
                <p className="text-sm font-medium">{DAYS[i]}</p>
                <p className="text-xs text-muted-foreground">
                  {dayDate(data.weekStart, i)}
                </p>
              </div>

              {shift ? (
                <>
                  <p className="flex flex-1 items-center gap-1.5 text-sm">
                    <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
                    {shift.site}
                  </p>
                  <Badge variant={shift.fonction === "operateur" ? "secondary" : "outline"}>
                    {fonctionLabel[shift.fonction]}
                  </Badge>
                </>
              ) : (
                <p className="flex-1 text-sm text-muted-foreground">Repos</p>
              )}

              {isToday && (
                <span className="text-xs font-medium text-primary">
                  Aujourd&apos;hui
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- Heures ---------- */

function Hours({ data, weekHours }: { data: MonEspace; weekHours: number }) {
  const max = 10; // hauteur de référence des barres, en heures

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Mes heures</h2>

      <div className="rounded-lg border bg-card p-4">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">Cette semaine</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {formatHours(weekHours)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Ce mois</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {formatHours(data.monthHours)}
            </dd>
          </div>
        </dl>

        <div
          className="mt-5 flex h-24 items-end gap-2 border-b"
          role="img"
          aria-label={`Heures par jour cette semaine : ${data.week
            .map((d, i) => `${DAYS[i]} ${formatHours(d.hours)}`)
            .join(", ")}`}
        >
          {data.week.map((d, i) => {
            const counted = data.todayIndex !== null && i <= data.todayIndex;
            const isToday = data.todayIndex === i;
            return (
              <div key={DAYS[i]} className="flex flex-1 flex-col items-center justify-end">
                <div
                  className={cn(
                    "w-full rounded-t-sm",
                    isToday ? "bg-primary" : "bg-primary/30",
                  )}
                  style={{
                    height: counted ? `${Math.min(d.hours / max, 1) * 100}%` : 0,
                    minHeight: counted && d.hours > 0 ? 4 : 0,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex gap-2">
          {DAYS.map((label) => (
            <span
              key={label}
              className="flex-1 text-center text-xs text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Rémunération ---------- */

function Remuneration() {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Ma rémunération</h2>
      <div className="rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
        <Wallet className="mb-2 size-5" aria-hidden />
        <p>
          Le calcul apparaîtra ici dès que la formule de rémunération sera
          validée.
        </p>
      </div>
    </div>
  );
}