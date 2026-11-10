import { SettingsIcon } from "lucide-react";

import { MAX_SITES } from "@/config/site";
import { getAllSitesWithUsage } from "@/features/sites/queries";
import { SitesSettings } from "@/features/sites/components/sites-settings";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  await requireRole(["gerant"]);

  const sites = await getAllSitesWithUsage();
  const activeCount = sites.filter((site) => site.actif).length;

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <SettingsIcon className="size-5 text-primary" aria-hidden />
          Paramètres
        </h1>
        <p className="text-sm text-muted-foreground">
          Configuration de Cyber Cedest. Les sites désactivés conservent leurs
          données et leur historique.
        </p>
      </header>

      <SitesSettings
        sites={sites}
        activeCount={activeCount}
        maxSites={MAX_SITES}
      />
    </section>
  );
}
