import { Skeleton } from "@/components/ui/skeleton";

export default function CaisseLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} />
        ))}
      </div>
      <div className="rounded-xl border bg-card p-4">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-sm text-muted-foreground">Description</th>
              <th className="text-right text-sm text-muted-foreground">Montant</th>
              <th className="text-left text-sm text-muted-foreground">Heure</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="h-4 w-48">
                    <Skeleton className="h-full w-full" />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="h-4 w-20">
                    <Skeleton className="h-full w-full" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-16">
                    <Skeleton className="h-full w-full" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
