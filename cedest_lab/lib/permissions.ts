export type Role = "gerant" | "operateur" | "technicien";
export type LeadType = "formation" | "wifi" | "solaire" | "bureautique" | "autre";
const domains: Record<Exclude<Role, "gerant">, LeadType[]> = { operateur: ["bureautique", "formation", "autre"], technicien: ["wifi", "solaire"] };
export function isRole(value: unknown): value is Role { return value === "gerant" || value === "operateur" || value === "technicien"; }
export function canAccessLead(role: Role, type: LeadType) { return role === "gerant" || domains[role].includes(type); }
export function allowedLeadTypes(role: Role): LeadType[] | null { return role === "gerant" ? null : domains[role]; }
