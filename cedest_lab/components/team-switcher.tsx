"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Building2Icon,
  CheckIcon,
  ChevronsUpDownIcon,
  Globe2Icon,
  Loader2Icon,
  PlusIcon,
  Settings2Icon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { setCurrentSite } from "@/features/sites/actions";
import { ALL_SITES_VALUE } from "@/lib/site-constants";

export type SiteOption = {
  id: string; // UUID ou "ALL"
  nom: string;
};

export type CurrentSiteInfo = {
  id: string | null;
  nom: string;
  isAll: boolean;
};

export function TeamSwitcher({
  sites,
  currentSite,
  canManageSites = false,
  canAddSite = false,
  siteCount = 0,
  maxSites = 2,
}: {
  sites: SiteOption[];
  currentSite: CurrentSiteInfo;
  canManageSites?: boolean;
  canAddSite?: boolean;
  siteCount?: number;
  maxSites?: number;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSelectSite = (siteId: string) => {
    // Si déjà sélectionné ou en cours de chargement, on ignore
    const isCurrent =
      (siteId === ALL_SITES_VALUE && currentSite.isAll) ||
      (!currentSite.isAll && currentSite.id === siteId);

    if (isCurrent || isPending) return;

    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await setCurrentSite(siteId);
        if (res.ok) {
          router.refresh();
        } else {
          setErrorMessage(res.error ?? "Impossible de changer de site.");
          console.error("Erreur changement de site:", res.error);
        }
      } catch (err) {
        setErrorMessage("Une erreur inattendue est survenue.");
        console.error("Erreur inattendue changement de site:", err);
      }
    });
  };

  const isAllActive = currentSite.isAll;
  const activeNom = currentSite.nom;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                disabled={isPending}
                aria-disabled={isPending}
                aria-busy={isPending}
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              />
            }
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              {isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : isAllActive ? (
                <Globe2Icon className="size-4" />
              ) : (
                <Building2Icon className="size-4" />
              )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-foreground">
                {isPending ? "Chargement..." : activeNom}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {isPending
                  ? "Changement de site..."
                  : isAllActive
                  ? "Vue cumulée"
                  : "Site actif"}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg shadow-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs px-2 py-1.5 font-semibold">
                Sites Cyber Cedest
              </DropdownMenuLabel>

              {errorMessage && (
                <p
                  role="alert"
                  className="mx-2 mb-1 rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive"
                >
                  {errorMessage}
                </p>
              )}

              {sites.map((site, index) => {
                const isSelected =
                  (site.id === ALL_SITES_VALUE && isAllActive) ||
                  (!isAllActive && site.id === currentSite.id);

                return (
                  <DropdownMenuItem
                    key={site.id}
                    disabled={isPending}
                    onClick={() => handleSelectSite(site.id)}
                    className="flex items-center justify-between gap-2 p-2 cursor-pointer focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                        {site.id === ALL_SITES_VALUE ? (
                          <Globe2Icon className="size-3.5 text-primary" />
                        ) : (
                          <Building2Icon className="size-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium text-sm">{site.nom}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isSelected && (
                        <CheckIcon className="size-4 text-primary" />
                      )}
                      <DropdownMenuShortcut className="text-xs text-muted-foreground">
                        ⌘{index + 1}
                      </DropdownMenuShortcut>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>

            {canManageSites && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    router.push("/dashboard/gerant/parametres#sites")
                  }
                  className="flex items-center gap-2 p-2 cursor-pointer"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    {canAddSite ? (
                      <PlusIcon className="size-3.5 text-primary" />
                    ) : (
                      <Settings2Icon className="size-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {canAddSite ? "Ajouter un site" : "Gérer les sites"}
                  </span>
                  <DropdownMenuShortcut className="text-xs text-muted-foreground">
                    {siteCount}/{maxSites}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
