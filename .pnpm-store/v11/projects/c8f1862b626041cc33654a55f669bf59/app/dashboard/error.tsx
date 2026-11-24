"use client";

import { useRouter } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <section className="mx-auto w-full max-w-6xl p-4">
      <div className="rounded-xl border bg-card p-6 text-center">
        <RefreshCwIcon className="mb-3 size-8 text-muted-foreground" aria-hidden />
        <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <Button
          onClick={() => {
            reset();
            router.refresh();
          }}
          className="mt-4"
        >
          Réessayer
        </Button>
      </div>
    </section>
  );
}
