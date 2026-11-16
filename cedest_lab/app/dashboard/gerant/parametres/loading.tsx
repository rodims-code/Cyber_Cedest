import { Skeleton } from "@/components/ui/skeleton";

export default function ParametresLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-muted/20 p-4">
              <div className="h-4 w-48">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="mt-2 space-y-2">
                <div className="h-4 w-32">
                  <Skeleton className="h-full w-full" />
                </div>
                <div className="h-4 w-24">
                  <Skeleton className="h-full w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
