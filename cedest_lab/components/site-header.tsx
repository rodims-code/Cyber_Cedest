import { MapPinIcon } from "lucide-react";

import { HeaderMenus } from "@/components/header-menus";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Role } from "@/lib/permissions";
import { DrawerNested } from "./DrawerNested";


export function SiteHeader({
  siteNom,
  isAll = false,
  role,
}: {
  siteNom: string;
  isAll?: boolean;
  role: Role;
}) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h1 className="truncate text-base font-medium">Tableau de bord</h1>
          <Badge variant={isAll ? "secondary" : "outline"} className="gap-1">
            <MapPinIcon aria-hidden />
            <span className="truncate">{siteNom}</span>
          </Badge>
        </div>
        <HeaderMenus role={role} />
        <div>
         <DrawerNested/>
        </div>
      </div>
    </header>
  );
}
