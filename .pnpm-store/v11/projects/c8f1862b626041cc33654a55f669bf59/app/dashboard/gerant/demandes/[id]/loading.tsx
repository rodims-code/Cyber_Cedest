import { Skeleton } from "@/components/ui/skeleton";

export default function DemandeIdLoading() {
  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <div className="space-y-4">
          <div className="h-4 w-1/2">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="h-4 w-1/3 mt-2">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="h-32 w-full">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="h-4 w-1/2 mt-2">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="h-8 w-1/3 mt-2">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
