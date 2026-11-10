"use client";

import Link from "next/link";
import { SearchIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavLink } from "@/lib/navigation";
import { openSearchPalette } from "@/lib/search-events";

export function NavSecondary({ items }: { items: NavLink[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Outils</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Recherche" onClick={openSearchPalette}>
              <SearchIcon />
              <span>Recherche</span>
              <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden sm:inline">
                Ctrl K
              </kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
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
  );
}
