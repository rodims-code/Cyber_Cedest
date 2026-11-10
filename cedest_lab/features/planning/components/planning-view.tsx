import { CalendarDaysIcon, ClockIcon, MapPinIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PlanningSemaine } from "@/features/planning/queries";

export function PlanningView({ data }: { data: PlanningSemaine }) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Planning de la semaine
          </h1>
          <p className="text-sm text-muted-foreground">
            Horaires du lundi au samedi, affichés en heure de Kinshasa.
          </p>
        </div>
        <Badge variant={data.isAll ? "secondary" : "outline"} className="w-fit">
          {data.isAll ? "Vue cumulée" : `Site ${data.siteNom}`}
        </Badge>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.days.map((day) => (
          <Card
            key={`${day.jourLabel}-${day.dateLabel}`}
            className={cn(
              day.isToday && "border-primary/50 ring-1 ring-primary/20"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base capitalize">
                  <CalendarDaysIcon
                    className="size-4 text-muted-foreground"
                    aria-hidden
                  />
                  {day.jourLabel}
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {day.dateLabel}
                </span>
              </div>
              {day.isToday && (
                <CardDescription className="text-xs font-medium text-primary">
                  Aujourd&apos;hui
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {day.shifts.length === 0 ? (
                <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
                  Aucun shift planifié.
                </p>
              ) : (
                <ul className="space-y-2">
                  {day.shifts.map((shift) => (
                    <li
                      key={shift.id}
                      className="rounded-lg border bg-muted/20 px-3 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {shift.employe}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPinIcon className="size-3" aria-hidden />
                            {data.isAll ? shift.site : shift.poste}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {shift.fonction}
                        </Badge>
                      </div>
                      <p className="mt-1.5 flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                        <ClockIcon className="size-3" aria-hidden />
                        {shift.debut} – {shift.fin}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
