export type Role = "gerant" | "operateur" | "technicien";
export type LeadType = "formation" | "wifi" | "solaire" | "bureautique" | "autre";

const domains: Record<Exclude<Role, "gerant">, LeadType[]> = {
  operateur: ["bureautique", "formation", "autre"],
  technicien: ["wifi", "solaire"],
};

/**
 * Pages protégées de l'application. Cette matrice est la seule source de
 * vérité pour l'affichage des liens de navigation. Les pages et Server Actions
 * revérifient toujours le rôle côté serveur avec `requireRole()`.
 */
export type PageKey =
  | "dashboard"
  | "mon-espace"
  | "demandes"
  | "utilisateurs"
  | "planning"
  | "pointage"
  | "caisse"
  | "paie"
  | "formations"
  | "parametres";

const PAGE_ACCESS: Record<Role, readonly PageKey[]> = {
  gerant: [
    "dashboard",
    "mon-espace",
    "demandes",
    "utilisateurs",
    "planning",
    "pointage",
    "caisse",
    "paie",
    "formations",
    "parametres",
  ],
  operateur: ["dashboard", "mon-espace", "demandes", "pointage", "caisse"],
  technicien: ["dashboard", "mon-espace", "demandes", "pointage"],
};

export function isRole(value: unknown): value is Role {
  return value === "gerant" || value === "operateur" || value === "technicien";
}

export function canAccessPage(role: Role, page: PageKey): boolean {
  return PAGE_ACCESS[role].includes(page);
}

/** Le gérant est le seul à pouvoir gérer les sites. */
export function canManageSites(role: Role): boolean {
  return role === "gerant";
}

/** Le gérant prépare le planning ; les autres le consultent dans Mon espace. */
export function canGeneratePlanning(role: Role): boolean {
  return role === "gerant";
}

/** Seul le gérant consulte le pointage de toute l'équipe. */
export function canViewTeamPointage(role: Role): boolean {
  return role === "gerant";
}

/** Tous les rôles internes peuvent pointer leur propre journée. */
export function canPunch(role: Role): boolean {
  return role === "gerant" || role === "operateur" || role === "technicien";
}

export function canAccessLead(role: Role, type: LeadType) {
  return role === "gerant" || domains[role].includes(type);
}

export function allowedLeadTypes(role: Role): LeadType[] | null {
  return role === "gerant" ? null : domains[role];
}
