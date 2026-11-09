import { notFound } from "next/navigation";
import { addLeadNote, updateLeadStatus } from "../actions";
import { getLeadForRole } from "../queries";
import { createWhatsAppLink } from "@/lib/whatsapp";

export async function LeadDetail({
  id,
  role,
}: {
  id: number;
  role: "gerant" | "operateur" | "technicien";
}) {
  const result = await getLeadForRole(id, role);
  if (!result) notFound();

  const { lead, notes } = result;
  const details = lead.details as { message?: string } | null;
  const whatsappUrl = createWhatsAppLink(
    lead.telephone,
    `Bonjour ${lead.nom}, nous avons bien reçu votre demande concernant ${lead.type}.`
  );

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Demande de {lead.nom}</h1>
        <p className="text-muted-foreground">{lead.type} · {lead.telephone}</p>
      </div>
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold">Informations</h2>
        {lead.email && <p className="mt-2 text-sm">E-mail : {lead.email}</p>}
        <p className="mt-2 whitespace-pre-wrap text-sm">{details?.message || "Aucun détail fourni."}</p>
        <a className="mt-4 inline-flex rounded-md bg-emerald-600 px-3 py-2 text-sm text-white" href={whatsappUrl} target="_blank" rel="noreferrer">
          Répondre sur WhatsApp
        </a>
      </div>
      <form action={updateLeadStatus} className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <input type="hidden" name="leadId" value={lead.id} />
        <label className="grid gap-1 text-sm font-medium">
          Statut
          <select name="status" defaultValue={lead.status} className="rounded-md border bg-background px-3 py-2">
            <option value="nouveau">Nouveau</option>
            <option value="en_cours">En cours</option>
            <option value="converti">Terminé</option>
            <option value="annule">Annulé</option>
          </select>
        </label>
        <button className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">Mettre à jour</button>
      </form>
      <div className="space-y-4 rounded-lg border p-4">
        <h2 className="font-semibold">Notes internes</h2>
        <form action={addLeadNote} className="grid gap-2">
          <input type="hidden" name="leadId" value={lead.id} />
          <textarea name="contenu" required maxLength={2000} rows={3} className="rounded-md border bg-background p-3" placeholder="Ajouter une note interne" />
          <button className="w-fit rounded-md border px-3 py-2 text-sm">Ajouter la note</button>
        </form>
        {notes.map((note) => <article className="rounded-md bg-muted p-3 text-sm" key={note.id}><p>{note.contenu}</p><p className="mt-2 text-xs text-muted-foreground">{note.authorName ?? "Utilisateur supprimé"} · {note.createdAt.toLocaleString("fr-FR")}</p></article>)}
      </div>
    </section>
  );
}
