import { Skeleton } from "@/components/ui/skeleton";

export default function PlanningLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <div className="h-11 w-24">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="h-11 w-24">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="h-11 w-24">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <DayCard key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DayCard() {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="h-4 w-24">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="h-4 w-16 mt-2">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="space-y-2 mt-3">
        {[1, 2].map((j) => (
          <div key={j} className="flex items-center gap-2">
            <div className="h-8 w-full min-w-[120px]">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="h-6 w-12 shrink-0">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
