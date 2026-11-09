"use client"

import * as React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { authClient } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  BanknoteIcon,
  CalendarDaysIcon,
  CircleHelpIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  CommandIcon,
  ContactIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  UsersIcon,
  WalletCardsIcon,
} from "lucide-react"

import { TeamSwitcher } from "@/components/team-switcher"

type UserRole = "gerant" | "operateur" | "technicien" | "formateur" | "eleve"

type NavigationItem = {
  title: string
  href: string
  icon: React.ElementType
}

const baseItems: NavigationItem[] = [
  { title: "Tableau de bord", href: "", icon: LayoutDashboardIcon },
]

const roleBasedItems: Record<UserRole, NavigationItem[]> = {
  gerant: [
    { title: "Mon espace", href: "/mon-espace", icon: ContactIcon },
    { title: "Demandes", href: "/demandes", icon: ClipboardListIcon },
    { title: "Planning", href: "/planning", icon: CalendarDaysIcon },
    { title: "Pointage", href: "/pointage", icon: ClipboardCheckIcon },
    { title: "Caisse", href: "/caisse", icon: WalletCardsIcon },
    { title: "Paie", href: "/paie", icon: BanknoteIcon },
    { title: "Utilisateurs", href: "/utilisateurs", icon: UsersIcon },
    { title: "Formations", href: "/formations", icon: GraduationCapIcon },
  ],
  operateur: [
    { title: "Mon espace", href: "/mon-espace", icon: ContactIcon },
    { title: "Demandes", href: "/demandes", icon: ClipboardListIcon },
    { title: "Pointage", href: "/pointage", icon: ClipboardCheckIcon },
    { title: "Caisse", href: "/caisse", icon: WalletCardsIcon },
  ],
  technicien: [
    { title: "Mon espace", href: "/mon-espace", icon: ContactIcon },
    { title: "Demandes", href: "/demandes", icon: ClipboardListIcon },
    { title: "Pointage", href: "/pointage", icon: ClipboardCheckIcon },
  ],
  formateur: [
    { title: "Mon espace", href: "/mon-espace", icon: ContactIcon },
    { title: "Sessions de formation", href: "/sessions", icon: CalendarDaysIcon },
    { title: "Inscrits", href: "/inscrits", icon: UsersIcon },
  ],
  eleve: [], // TODO : définir les pages dédiées aux élèves.
}

const cedestSites = [
  {
    name: "Site KIMIALA",
    logo: CommandIcon,
    plan: "Cyber & Bureautique",
  },
  {
    name: "Site SHELL",
    logo: CommandIcon,
    plan: "Wi-Fi & Services",
  },
]

const navSecondary = [
  { title: "Paramètres", url: "/parametres", icon: Settings2Icon },
  { title: "Support", url: "/support", icon: CircleHelpIcon },
]

function isUserRole(value: unknown): value is UserRole {
  return ["gerant", "operateur", "technicien", "formateur", "eleve"].includes(
    String(value)
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const userRole = (session?.user as { role?: string } | undefined)?.role

  useEffect(() => {
    if (!isPending && (!session || !isUserRole(userRole))) {
      router.replace("/login")
    }
  }, [isPending, router, session, userRole])

  if (isPending || !session || !isUserRole(userRole)) {
    return <Sidebar collapsible="offcanvas" {...props} />
  }

  const itemsToRender = [...baseItems, ...(roleBasedItems[userRole] || [])].map(
    ({ href, icon: Icon, ...item }) => ({
      ...item,
      url: `/dashboard/${userRole}${href}`,
      icon: <Icon />,
    })
  )

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={cedestSites} />
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-6 p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
        <NavMain items={itemsToRender} />
        <NavSecondary
          items={navSecondary.map(({ icon: Icon, ...item }) => ({
            ...item,
            icon: <Icon />,
          }))}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session.user.name || "Utilisateur",
            email: session.user.email,
            avatar: session.user.image || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
