"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  TeamSwitcher,
  type SiteOption,
  type CurrentSiteInfo,
} from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { getNavigation } from "@/lib/navigation";
import type { Role } from "@/lib/permissions";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: Role;
  sites?: SiteOption[];
  currentSite?: CurrentSiteInfo;
  canAddSite?: boolean;
  siteCount?: number;
  maxSites?: number;
}

export function AppSidebar({
  role,
  sites = [],
  currentSite = { id: null, nom: "Aucun site", isAll: false },
  canAddSite = false,
  siteCount = 0,
  maxSites = 2,
  ...props
}: AppSidebarProps) {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const navigation = getNavigation(role);
  const basePath = `/dashboard/${role}`;

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          sites={sites}
          currentSite={currentSite}
          canManageSites={role === "gerant"}
          canAddSite={canAddSite}
          siteCount={siteCount}
          maxSites={maxSites}
        />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navigation.main} role={role} basePath={basePath} />

        {navigation.exploitation.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Exploitation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.exploitation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive(item.url)}
                      render={<Link href={item.url} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavSecondary items={navigation.secondary} />
        <NavUser
          user={{
            name: session?.user?.name ?? "Utilisateur",
            email: session?.user?.email ?? "",
            avatar: session?.user?.image ?? "",
          }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
