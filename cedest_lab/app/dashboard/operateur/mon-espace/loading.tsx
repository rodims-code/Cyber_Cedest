import { Skeleton } from "@/components/ui/skeleton";

export default function MonEspaceLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} />
        ))}
      </div>
      <div className="rounded-xl border bg-card p-4">
        <div className="h-4 w-1/3">
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Row key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="space-y-3">
        <div className="h-4 w-1/3">
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="h-32 w-full">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="h-4 w-1/2 mt-2">
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="flex items-center gap-4 border-b pb-3 pt-3 last:border-b-0">
      <div className="w-20 shrink-0">
        <div className="h-8 w-full">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="h-4 w-full mt-2">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
      <div className="flex-1">
        <div className="h-4 w-1/2">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
      <div className="h-4 w-24 shrink-0">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}
