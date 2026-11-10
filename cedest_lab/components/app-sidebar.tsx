"use client";

import * as React from "react";
import {
  LayoutDashboardIcon,
  UsersIcon,
  ClipboardListIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
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
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: { title: string; url: string }[];
};

function getNavItems(role: string): NavItem[] {
  const base = `/dashboard/${role}`;
  const items: NavItem[] = [
    {
      title: "Tableau de bord",
      url: base,
      icon: LayoutDashboardIcon,
      isActive: true,
    },
    {
      title: "Demandes",
      url: `${base}/demandes`,
      icon: ClipboardListIcon,
    },
  ];

  if (role === "gerant") {
    items.push({
      title: "Utilisateurs",
      url: `${base}/utilisateurs`,
      icon: UsersIcon,
    });
    items.push({
      title: "Paramètres",
      url: `${base}/parametres`,
      icon: SettingsIcon,
    });
  }

  return items;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  sites?: SiteOption[];
  currentSite?: CurrentSiteInfo;
}

export function AppSidebar({
  sites = [],
  currentSite = { id: null, nom: "Aucun site", isAll: false },
  ...props
}: AppSidebarProps) {
  const { data: session } = authClient.useSession();
  const role =
    ((session?.user as { role?: string } | undefined)?.role) ?? "operateur";
  const navItems = getNavItems(role).map(({ icon: Icon, ...item }) => ({
    ...item,
    icon: Icon ? <Icon /> : undefined,
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher sites={sites} currentSite={currentSite} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
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
