import type { CSSProperties } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MAX_SITES } from "@/config/site";
import { getSelectableSites } from "@/lib/current-site";
import GhostFibers from "@/components/GhostFibers";

import { Toaster } from "@/components/ui/toast";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sites, currentSite, canSelectAll, role } = await getSelectableSites();

  const effectiveRole = role ?? "operateur";
  const siteCount = sites.length - (canSelectAll ? 1 : 0);
  const canAddSite = role === "gerant" && siteCount < MAX_SITES;

  return (
    <SidebarProvider
      className="relative isolate"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <GhostFibers className="h-full w-full" />
      </div>
      <AppSidebar
        variant="inset"
        role={effectiveRole}
        sites={sites}
        currentSite={currentSite}
        canAddSite={canAddSite}
        siteCount={siteCount}
        maxSites={MAX_SITES}
      />
      <SidebarInset className="z-10 !bg-background/45 backdrop-blur-2xl">
        <SiteHeader
          siteNom={currentSite.nom}
          isAll={currentSite.isAll}
          role={effectiveRole}
        />
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-transparent p-4">
          {children}
          <Toaster />
        </div>
        <CommandPalette role={effectiveRole} />
      </SidebarInset>
    </SidebarProvider>
  );
}
