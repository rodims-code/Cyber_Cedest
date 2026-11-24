import { Skeleton } from "@/components/ui/skeleton";

export default function FormationsLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="h-11 w-32">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-sm text-muted-foreground">Session</th>
              <th className="text-left text-sm text-muted-foreground">Formateur</th>
              <th className="text-left text-sm text-muted-foreground">Date</th>
              <th className="text-left text-sm text-muted-foreground">Statut</th>
              <th className="text-right text-sm text-muted-foreground">Inscrits</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-muted/50">
                {[1, 2, 3, 4, 5].map((j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4">
                      <Skeleton className="h-full w-full" />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
