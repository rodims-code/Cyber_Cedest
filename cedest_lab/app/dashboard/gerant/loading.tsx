import { Skeleton } from "@/components/ui/skeleton";

export default function GerantLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-64" key="a" />
        <Card className="h-64" key="b" />
      </div>
    </section>
  );
}

function Card({ className }: { className?: string }) {
  return (
    <div className={["rounded-xl border bg-card p-4", className].filter(Boolean).join(" ")}>
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
