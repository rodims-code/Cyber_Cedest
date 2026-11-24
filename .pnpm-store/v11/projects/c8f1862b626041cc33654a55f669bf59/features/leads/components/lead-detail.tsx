import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { Role } from "@/lib/permissions";
import { buildCyberToClientWhatsAppLink } from "@/src/lib/whatsapp";
import { addLeadNote, updateLeadStatus } from "../actions";
import { getLeadForRole, getOtherLeadsByPhone } from "../queries";
import { DeleteLeadButton } from "./delete-lead-button";

const labels: Record<string, string> = {
  formation: "Formation",
  wifi: "Wi-Fi",
  solaire: "Solaire",
  contact: "Contact / Bureautique",
  nouveau: "Nouveau",
  contacte: "Contacté",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
};

export async function LeadDetail({
  id,
  role,
}: {
  id: number;
  role: Role;
}) {
  const result = await getLeadForRole(id, role);
  if (!result) notFound();

  const { lead, notes } = result;
  const numStr = `CED-${String(lead.numero ?? lead.id).padStart(4, "0")}`;
  const details = (lead.details as Record<string, any>) || {};

  // Doublons (autres demandes avec ce numéro)
  const otherLeads = await getOtherLeadsByPhone(lead.telephone, lead.id, role);

  // WhatsApp cyber -> client
  const serviceLabel = labels[lead.type] ?? lead.type;
  const whatsappUrl = buildCyberToClientWhatsAppLink(
    lead.telephone,
    lead.nom,
    numStr,
    serviceLabel
  );

  const basePath = `/dashboard/${role}/demandes`;

  const now = Date.now();
  const ageHours = Math.floor(
    (now - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60)
  );
  const isOverdue = lead.status === "nouveau" && ageHours >= 24;

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      {/* Barre retour & en-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          href={basePath}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Retour aux demandes</span>
        </Link>

        {role === "gerant" && <DeleteLeadButton leadId={lead.id} />}
      </div>

      {/* Titre & Statut */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border bg-card p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-primary">
              {numStr}
            </span>
            <Badge variant="outline">{serviceLabel}</Badge>
            <Badge variant={lead.status === "nouveau" ? "default" : "secondary"}>
              {labels[lead.status] ?? lead.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{lead.nom}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Calendar className="size-3.5" />
            <span>
              Reçue le{" "}
              {new Date(lead.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        </div>

        {isOverdue && (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <Clock className="size-4 shrink-0" />
            <span>En attente depuis {ageHours} heures</span>
          </div>
        )}
      </div>

      {/* Actions de contact rapide */}
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
        >
          <MessageCircle className="size-4" />
          <span>Répondre sur WhatsApp</span>
        </a>

        <a
          href={`tel:${lead.telephone}`}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-xs hover:bg-muted transition-colors"
        >
          <Phone className="size-4 text-primary" />
          <span>Appeler ({lead.telephone})</span>
        </a>
      </div>

      {/* Doublons / Autres demandes avec ce numéro */}
      {otherLeads.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-400">
              {otherLeads.length} autre{otherLeads.length > 1 ? "s" : ""} demande{otherLeads.length > 1 ? "s" : ""} trouvée{otherLeads.length > 1 ? "s" : ""} avec ce numéro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            {otherLeads.map((ol) => (
              <div key={ol.id} className="flex items-center justify-between border-b border-amber-500/20 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold">
                    CED-{String(ol.numero ?? ol.id).padStart(4, "0")}
                  </span>
                  <span>· {labels[ol.type] ?? ol.type}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {labels[ol.status] ?? ol.status}
                  </Badge>
                </div>
                <Link
                  href={`${basePath}/${ol.id}`}
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Consulter</span>
                  <ExternalLink className="size-3" />
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Informations complètes de la demande */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détails de la demande</CardTitle>
          <CardDescription className="text-xs">
            Informations transmises par le client lors de la soumission du formulaire.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg bg-muted/30 p-3 border">
            <div>
              <span className="text-muted-foreground block text-[11px]">Nom complet</span>
              <span className="font-semibold text-sm">{lead.nom}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Téléphone</span>
              <span className="font-mono font-semibold text-sm">{lead.telephone}</span>
            </div>
            {lead.email && (
              <div>
                <span className="text-muted-foreground block text-[11px]">Adresse email</span>
                <span className="font-semibold">{lead.email}</span>
              </div>
            )}
            {lead.site && (
              <div>
                <span className="text-muted-foreground block text-[11px]">Site concerné</span>
                <span className="font-semibold">{lead.site}</span>
              </div>
            )}
          </div>

          {/* Détails spécifiques selon type */}
          <div className="rounded-lg border p-3 space-y-2">
            <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Paramètres spécifiques :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {details.formation && (
                <div>
                  <span className="text-muted-foreground">Formation : </span>
                  <span className="font-semibold uppercase">{details.formation}</span>
                </div>
              )}
              {details.mode && (
                <div>
                  <span className="text-muted-foreground">Format : </span>
                  <span className="font-semibold">
                    {details.mode === "presentiel" ? "Présentiel (Kinshasa)" : "En ligne"}
                  </span>
                </div>
              )}
              {details.niveau && (
                <div>
                  <span className="text-muted-foreground">Niveau : </span>
                  <span className="font-semibold capitalize">{details.niveau}</span>
                </div>
              )}
              {details.whatsapp && (
                <div>
                  <span className="text-muted-foreground">Numéro WhatsApp : </span>
                  <span className="font-mono font-semibold">{details.whatsapp}</span>
                </div>
              )}
              {details.lieu && (
                <div>
                  <span className="text-muted-foreground">Lieu : </span>
                  <span className="font-semibold capitalize">{details.lieu}</span>
                </div>
              )}
              {details.commune && (
                <div>
                  <span className="text-muted-foreground">Commune : </span>
                  <span className="font-semibold">{details.commune}</span>
                </div>
              )}
              {details.quartier && (
                <div>
                  <span className="text-muted-foreground">Quartier : </span>
                  <span className="font-semibold">{details.quartier}</span>
                </div>
              )}
              {details.appareils !== undefined && (
                <div>
                  <span className="text-muted-foreground">Appareils : </span>
                  <span className="font-semibold">{String(details.appareils)}</span>
                </div>
              )}
              {details.sujet && (
                <div>
                  <span className="text-muted-foreground">Sujet : </span>
                  <span className="font-semibold capitalize">{details.sujet}</span>
                </div>
              )}
              {details.travail && (
                <div>
                  <span className="text-muted-foreground">Prestation : </span>
                  <span className="font-semibold capitalize">{details.travail}</span>
                </div>
              )}
            </div>

            {details.message && (
              <div className="pt-2 border-t mt-2">
                <span className="text-muted-foreground block text-[11px] mb-1">
                  Message ou précisions du client :
                </span>
                <p className="whitespace-pre-wrap rounded bg-muted/50 p-2.5 text-xs text-foreground">
                  {details.message}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulaire Changement de statut */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mettre à jour le statut</CardTitle>
          <CardDescription className="text-xs">
            Modifiez l’avancement du traitement de cette demande.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateLeadStatus} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="leadId" value={lead.id} />
            <select
              name="status"
              defaultValue={lead.status}
              className="h-9 rounded-md border bg-background px-3 text-xs"
            >
              <option value="nouveau">Nouveau</option>
              <option value="contacte">Contacté</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="annule">Annulé</option>
            </select>
            <Button size="sm" type="submit" className="text-xs h-9">
              Enregistrer le statut
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notes internes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notes internes</CardTitle>
          <CardDescription className="text-xs">
            Commentaires réservés à l’équipe pour le suivi du dossier.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={addLeadNote} className="space-y-2">
            <input type="hidden" name="leadId" value={lead.id} />
            <Textarea
              name="contenu"
              required
              maxLength={2000}
              rows={3}
              placeholder="Écrire une note interne..."
              className="text-xs resize-none"
            />
            <div className="flex justify-end">
              <Button size="sm" type="submit" variant="secondary" className="text-xs">
                Ajouter la note
              </Button>
            </div>
          </form>

          <div className="space-y-2.5 pt-2">
            {notes.map((note) => (
              <article key={note.id} className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1">
                <p className="whitespace-pre-wrap text-foreground">{note.contenu}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1 border-t border-border/50">
                  <User className="size-3" />
                  <span>{note.authorName ?? "Personnel"}</span>
                  <span>·</span>
                  <span>
                    {new Date(note.createdAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
              </article>
            ))}

            {notes.length === 0 && (
              <p className="text-center py-4 text-xs text-muted-foreground">
                Aucune note interne enregistrée pour cette demande.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
