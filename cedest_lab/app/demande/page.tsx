"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloatingButton } from "@/components/whatsapp-floating-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createLead } from "@/features/leads/actions";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ChevronRight,
  ClipboardList,
} from "lucide-react";

function DemandeForm() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") ?? "autre";

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    nom: string;
    type: string;
    telephone: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const raw = Object.fromEntries(formData);
    const result = await createLead(raw);

    setLoading(false);

    if (result.ok) {
      setSuccessData({
        nom: String(raw.nom ?? ""),
        type: String(raw.type ?? "service"),
        telephone: String(raw.telephone ?? ""),
      });
      event.currentTarget.reset();
    } else {
      setErrorMessage(result.error ?? "Une erreur est survenue lors de l'envoi.");
    }
  }

  const typeLabels: Record<string, string> = {
    formation: "Formation informatique & bureautique",
    wifi: "Connexion Wi-Fi MikroTik",
    solaire: "Énergie solaire & kit autonome",
    bureautique: "Secrétariat & travaux de bureau",
    autre: "Autre demande / Contact général",
  };

  const whatsappMessage = successData
    ? `Bonjour Cyber Cedest, je viens de soumettre une demande (${typeLabels[successData.type] ?? successData.type}) au nom de ${successData.nom}. Mon téléphone est le ${successData.telephone}.`
    : "";

  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
      {successData ? (
        <div className="space-y-6 text-center py-6">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Demande enregistrée avec succès !
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Merci <strong>{successData.nom}</strong>. Notre équipe a bien reçu votre demande et va vous contacter rapidement.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 max-w-md mx-auto space-y-3">
            <p className="text-xs text-muted-foreground">
              Pour une prise en charge immédiate, vous pouvez également nous notifier directement sur WhatsApp :
            </p>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <MessageCircle className="size-4" />
              <span>Envoyer aussi sur WhatsApp</span>
            </a>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setSuccessData(null)}
              className="text-xs"
            >
              Envoyer une autre demande
            </Button>
            <Link href="/" className="inline-flex items-center text-xs text-muted-foreground hover:underline">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="type">
                Type de prestation *
              </label>
              <select
                id="type"
                name="type"
                required
                defaultValue={initialType}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="formation">Formation (Word, Excel, Solaire, etc.)</option>
                <option value="wifi">Wi-Fi MikroTik (antenne / répéteur)</option>
                <option value="solaire">Énergie solaire (devis / kit complet)</option>
                <option value="bureautique">Bureautique (saisie, impression, scan)</option>
                <option value="autre">Autre renseignement</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="site">
                Site ou localisation *
              </label>
              <select
                id="site"
                name="site"
                defaultValue="KIMIALA"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="KIMIALA">Site KIMIALA</option>
                <option value="SHELL">Site SHELL</option>
                <option value="EN_LIGNE">À distance / En ligne</option>
                <option value="AUTRE">Autre quartier de Kinshasa</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="nom">
                Votre nom complet *
              </label>
              <Input
                id="nom"
                name="nom"
                required
                minLength={2}
                placeholder="Ex: Patient Kalonji"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="telephone">
                Numéro de téléphone (WhatsApp) *
              </label>
              <Input
                id="telephone"
                name="telephone"
                required
                placeholder="Ex: 0812345678 ou +243..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="email">
              Adresse e-mail (facultative)
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Ex: client@exemple.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="details">
              Précisez votre besoin ou question
            </label>
            <Textarea
              id="details"
              name="details"
              rows={4}
              placeholder="Ex: Nombre d'ordinateurs ou pièces à couvrir, type de document à imprimer, modules de formation souhaités..."
            />
          </div>

          {/* Champ piège anti-spam (Honeypot) : caché pour les vrais utilisateurs */}
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2 text-sm font-semibold shadow-xs py-3"
          >
            <Send className="size-4" />
            {loading ? "Envoi de votre demande en cours..." : "Envoyer ma demande"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function DemandePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteNavbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="container mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Accueil
            </Link>
            <ChevronRight className="size-3" />
            <span className="font-semibold text-primary">Formulaire de demande</span>
          </div>

          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/40 text-primary">
                <ClipboardList className="size-3.5 mr-1" />
                Service Client Cyber Cedest
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Faire une demande en ligne
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Remplissez ce formulaire pour vous inscrire à une formation, demander une installation Wi-Fi, un devis solaire ou des travaux de bureautique.
            </p>
          </div>

          <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Chargement du formulaire...</div>}>
            <DemandeForm />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
      <WhatsAppFloatingButton />
    </div>
  );
}
