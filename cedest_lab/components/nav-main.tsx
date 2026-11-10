"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2Icon,
  CirclePlusIcon,
  ClipboardListIcon,
  ClockIcon,
  MailIcon,
  UserPlusIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavLink } from "@/lib/navigation";
import type { Role } from "@/lib/permissions";

export function NavMain({
  items,
  role,
  basePath,
}: {
  items: NavLink[];
  role: Role;
  basePath: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const canManageSites = role === "gerant";

  const isActive = (url: string) =>
    url === basePath
      ? pathname === url
      : pathname === url || pathname.startsWith(`${url}/`);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    tooltip="Création rapide"
                    className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                  />
                }
              >
                <CirclePlusIcon />
                <span>Création rapide</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Créer rapidement</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push(`${basePath}/demandes`)}
                  >
                    <ClipboardListIcon />
                    Nouvelle demande
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`${basePath}/pointage`)}
                  >
                    <ClockIcon />
                    Nouveau pointage
                  </DropdownMenuItem>
                  {canManageSites && (
                    <>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`${basePath}/utilisateurs`)
                        }
                      >
                        <UserPlusIcon />
                        Ajouter un utilisateur
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`${basePath}/parametres#sites`)
                        }
                      >
                        <Building2Icon />
                        Ajouter un site
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
              render={<Link href={`${basePath}/demandes`} />}
            >
              <MailIcon />
              <span className="sr-only">Boîte de réception</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item) => (
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
  );
}
