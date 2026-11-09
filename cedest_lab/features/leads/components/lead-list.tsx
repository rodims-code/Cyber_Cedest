import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadType } from "@/lib/permissions";
import { getLeadsForRole } from "../queries";

const labels: Record<string, string> = {
  formation: "Formation",
  wifi: "Wi-Fi",
  solaire: "Solaire",
  bureautique: "Bureautique",
  autre: "Contact",
  nouveau: "Nouveau",
  en_cours: "En cours",
  converti: "Terminé",
  annule: "Annulé",
};

export async function LeadList({
  role,
  filters,
}: {
  role: "gerant" | "operateur" | "technicien";
  filters: { type?: string; status?: string };
}) {
  const leads = await getLeadsForRole(role, filters);
  const basePath = `/dashboard/${role}/demandes`;
  const types: LeadType[] =
    role === "gerant"
      ? ["formation", "wifi", "solaire", "bureautique", "autre"]
      : role === "operateur"
        ? ["bureautique", "formation", "autre"]
        : ["wifi", "solaire"];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Demandes clients</h1>
        <p className="text-sm text-muted-foreground">
          Consultez et traitez uniquement les demandes de votre domaine.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link className="rounded-md border px-3 py-1.5 text-sm" href={basePath}>
          Toutes
        </Link>
        {types.map((type) => (
          <Link
            className="rounded-md border px-3 py-1.5 text-sm"
            href={`${basePath}?type=${type}`}
            key={type}
          >
            {labels[type]}
          </Link>
        ))}
        {Object.entries(labels)
          .filter(([key]) => ["nouveau", "en_cours", "converti", "annule"].includes(key))
          .map(([status, label]) => (
            <Link
              className="rounded-md border px-3 py-1.5 text-sm"
              href={`${basePath}?status=${status}`}
              key={status}
            >
              {label}
            </Link>
          ))}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <Link className="font-medium hover:underline" href={`${basePath}/${lead.id}`}>
                  {lead.nom}
                </Link>
                <p className="text-xs text-muted-foreground">{lead.telephone}</p>
              </TableCell>
              <TableCell><Badge variant="outline">{labels[lead.type]}</Badge></TableCell>
              <TableCell><Badge variant="secondary">{labels[lead.status]}</Badge></TableCell>
              <TableCell>{lead.createdAt.toLocaleDateString("fr-FR")}</TableCell>
            </TableRow>
          ))}
          {leads.length === 0 && (
            <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">Aucune demande trouvée.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}
