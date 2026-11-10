import {
  BadgeDollarSignIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  ClockIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  UserRoundIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";

import { canAccessPage, type PageKey, type Role } from "@/lib/permissions";

export type NavLink = {
  title: string;
  url: string;
  icon: LucideIcon;
  page: PageKey;
};

export type Navigation = {
  main: NavLink[];
  exploitation: NavLink[];
  secondary: NavLink[];
  search: { title: string; icon: LucideIcon };
};

/**
 * Construit la navigation à partir de la matrice de permissions.
 * Les liens sont filtrés ici pour l'interface ; les pages revérifient le rôle.
 */
export function getNavigation(role: Role): Navigation {
  const base = `/dashboard/${role}`;
  const link = (
    page: PageKey,
    title: string,
    url: string,
    icon: LucideIcon
  ): NavLink => ({ page, title, url, icon });

  const main = [
    link("dashboard", "Tableau de bord", base, LayoutDashboardIcon),
    link("mon-espace", "Mon espace", `${base}/mon-espace`, UserRoundIcon),
    link("demandes", "Demandes", `${base}/demandes`, ClipboardListIcon),
    link("utilisateurs", "Utilisateurs", `${base}/utilisateurs`, UsersIcon),
  ].filter((item) => canAccessPage(role, item.page));

  const exploitation = [
    link("planning", "Planning", `${base}/planning`, CalendarDaysIcon),
    link("pointage", "Pointage", `${base}/pointage`, ClockIcon),
    link("caisse", "Caisse", `${base}/caisse`, WalletIcon),
    link("paie", "Heures et paie", `${base}/paie`, BadgeDollarSignIcon),
    link(
      "formations",
      "Formations",
      `${base}/formations`,
      GraduationCapIcon
    ),
  ].filter((item) => canAccessPage(role, item.page));

  const secondary = [
    link(
      "parametres",
      "Paramètres",
      `${base}/parametres`,
      SettingsIcon
    ),
  ].filter((item) => canAccessPage(role, item.page));

  return {
    main,
    exploitation,
    secondary,
    search: { title: "Recherche", icon: SearchIcon },
  };
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
