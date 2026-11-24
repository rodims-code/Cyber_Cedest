"use client";

import * as React from "react";
import { Check, CheckCircle2, Loader2, MessageCircle, Send, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLead } from "@/features/leads/actions";
import { buildClientToCyberWhatsAppLink } from "@/src/lib/whatsapp";

export type LeadFormInitialData = {
  type: "formation" | "wifi" | "solaire" | "contact";
  title?: string;
  formationId?: "initiation" | "word" | "excel" | "powerpoint" | "internet" | "conseil";
  formationMode?: "presentiel" | "en_ligne";
  sujet?: "bureautique" | "question";
};

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: LeadFormInitialData;
}

export function LeadFormDialog({
  open,
  onOpenChange,
  initialData,
}: LeadFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successInfo, setSuccessInfo] = React.useState<{
    prenom: string;
    numero: string;
    serviceLabel: string;
  } | null>(null);

  // Valeurs formulaire
  const [nom, setNom] = React.useState("");
  const [telephone, setTelephone] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [websiteTrap, setWebsiteTrap] = React.useState("");

  // Formation
  const [formation, setFormation] = React.useState<string>(
    initialData.formationId || "word"
  );
  const [modeFormation, setModeFormation] = React.useState<string>(
    initialData.formationMode || "presentiel"
  );
  const [niveau, setNiveau] = React.useState<string>("debutant");
  const [numWhatsApp, setNumWhatsApp] = React.useState("");

  // Wi-Fi / Solaire
  const [lieu, setLieu] = React.useState<string>("maison");
  const [commune, setCommune] = React.useState("");
  const [quartier, setQuartier] = React.useState("");
  const [appareilsWifi, setAppareilsWifi] = React.useState("");
  const [appareilsSolaire, setAppareilsSolaire] = React.useState("");

  // Contact / Bureautique
  const [sujetContact, setSujetContact] = React.useState<string>(
    initialData.sujet || "bureautique"
  );
  const [travailBureautique, setTravailBureautique] = React.useState<string>("saisie");

  // Réinitialiser à l’ouverture
  React.useEffect(() => {
    if (open) {
      setErrorMessage(null);
      setSuccessInfo(null);
      if (initialData.formationId) setFormation(initialData.formationId);
      if (initialData.formationMode) setModeFormation(initialData.formationMode);
      if (initialData.sujet) setSujetContact(initialData.sujet);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    let payload: Record<string, unknown> = {
      type: initialData.type,
      nom,
      telephone,
      message: message || undefined,
      website: websiteTrap,
    };

    if (initialData.type === "formation") {
      payload = {
        ...payload,
        formation,
        mode: modeFormation,
        niveau,
        whatsapp: numWhatsApp || undefined,
      };
    } else if (initialData.type === "wifi") {
      payload = {
        ...payload,
        lieu,
        commune,
        quartier,
        appareils: appareilsWifi ? Number(appareilsWifi) : undefined,
      };
    } else if (initialData.type === "solaire") {
      payload = {
        ...payload,
        lieu,
        commune,
        quartier,
        appareils: appareilsSolaire || undefined,
      };
    } else if (initialData.type === "contact") {
      payload = {
        ...payload,
        sujet: sujetContact,
        travail: sujetContact === "bureautique" ? travailBureautique : undefined,
      };
    }

    try {
      const result = await createLead(payload);
      if (result.ok && result.numero) {
        const prenom = nom.trim().split(" ")[0] || "cher client";
        const serviceLabel =
          initialData.type === "formation"
            ? `Formation ${formation.toUpperCase()}`
            : initialData.type === "wifi"
            ? "Installation Wi-Fi"
            : initialData.type === "solaire"
            ? "Énergie Solaire"
            : "Bureautique & Secrétariat";

        setSuccessInfo({ prenom, numero: result.numero, serviceLabel });
      } else {
        setErrorMessage(
          result.error || "Une erreur est survenue lors de l’envoi."
        );
      }
    } catch {
      setErrorMessage("Impossible d’envoyer la demande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDialogTitle = () => {
    if (initialData.type === "formation") return "Inscription à une formation";
    if (initialData.type === "wifi") return "Demande de raccordement Wi-Fi";
    if (initialData.type === "solaire") return "Demande de devis solaire";
    return "Demande de service bureautique";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {successInfo ? (
          <div className="space-y-5 py-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-7" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold">
                Merci {successInfo.prenom} !
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                Votre demande <strong className="text-foreground">{successInfo.numero}</strong> est bien reçue. Notre équipe vous recontactera très prochainement.
              </DialogDescription>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <a
                href={buildClientToCyberWhatsAppLink(
                  successInfo.numero,
                  successInfo.serviceLabel
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <MessageCircle className="size-4" />
                <span>Envoyer aussi sur WhatsApp</span>
              </a>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {getDialogTitle()}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Remplissez ce formulaire pour nous transmettre directement votre demande.
              </DialogDescription>
            </DialogHeader>

            {/* Champ piège anti-spam (honeypot) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="form_website_field">Website</label>
              <input
                id="form_website_field"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={websiteTrap}
                onChange={(e) => setWebsiteTrap(e.target.value)}
              />
            </div>

            {/* Nom & Téléphone */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="lead_nom" className="text-xs font-semibold">
                  Votre nom complet <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lead_nom"
                  required
                  placeholder="Ex : Mampuya Jean"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead_tel" className="text-xs font-semibold">
                  Numéro de téléphone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lead_tel"
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Ex : 0812345678 ou +243..."
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            {/* Champs spécifiques selon le type */}
            {initialData.type === "formation" && (
              <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Formation</Label>
                    <Select value={formation} onValueChange={setFormation}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initiation">Initiation Informatique</SelectItem>
                        <SelectItem value="word">Microsoft Word</SelectItem>
                        <SelectItem value="excel">Microsoft Excel</SelectItem>
                        <SelectItem value="powerpoint">PowerPoint</SelectItem>
                        <SelectItem value="internet">Internet & Sécurité</SelectItem>
                        <SelectItem value="conseil">Conseil & Bureautique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Format</Label>
                    <Select value={modeFormation} onValueChange={setModeFormation}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presentiel">En Présentiel (Kinshasa)</SelectItem>
                        <SelectItem value="en_ligne">En Ligne (À distance)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Votre niveau actuel</Label>
                  <Select value={niveau} onValueChange={setNiveau}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debutant">Débutant complet</SelectItem>
                      <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                      <SelectItem value="avance">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lead_wa" className="text-xs font-semibold">
                    Votre numéro WhatsApp (optionnel)
                  </Label>
                  <Input
                    id="lead_wa"
                    type="tel"
                    inputMode="tel"
                    placeholder="Si différent du téléphone ci-dessus"
                    value={numWhatsApp}
                    onChange={(e) => setNumWhatsApp(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Nous vous répondrons sur ce numéro.
                  </p>
                </div>

                <p className="text-[11px] text-muted-foreground italic">
                  Tarif et prochaine session : sur demande.
                </p>
              </div>
            )}

            {initialData.type === "wifi" && (
              <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Lieu d’installation</Label>
                  <Select value={lieu} onValueChange={setLieu}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maison">Maison / Résidence</SelectItem>
                      <SelectItem value="boutique">Boutique / Magasin</SelectItem>
                      <SelectItem value="hopital_clinique">Hôpital / Clinique</SelectItem>
                      <SelectItem value="autre">Autre structure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="lead_commune" className="text-xs font-semibold">
                      Commune <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lead_commune"
                      required
                      placeholder="Ex : Lingwala"
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lead_quartier" className="text-xs font-semibold">
                      Quartier <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lead_quartier"
                      required
                      placeholder="Ex : La Voix"
                      value={quartier}
                      onChange={(e) => setQuartier(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lead_appareils" className="text-xs font-semibold">
                    Nombre d’appareils à connecter (estimation)
                  </Label>
                  <Input
                    id="lead_appareils"
                    type="number"
                    placeholder="Ex : 5"
                    value={appareilsWifi}
                    onChange={(e) => setAppareilsWifi(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            )}

            {initialData.type === "solaire" && (
              <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Bâtiment / Emplacement</Label>
                  <Select value={lieu} onValueChange={setLieu}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maison">Maison individuelle</SelectItem>
                      <SelectItem value="boutique">Commerce / Entreprise</SelectItem>
                      <SelectItem value="hopital_clinique">Centre de santé / Clinique</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="lead_commune_sol" className="text-xs font-semibold">
                      Commune <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lead_commune_sol"
                      required
                      placeholder="Ex : Mont-Ngafula"
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lead_quartier_sol" className="text-xs font-semibold">
                      Quartier <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lead_quartier_sol"
                      required
                      placeholder="Ex : Kimbondo"
                      value={quartier}
                      onChange={(e) => setQuartier(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lead_sol_app" className="text-xs font-semibold">
                    Appareils à alimenter
                  </Label>
                  <Input
                    id="lead_sol_app"
                    placeholder="Ex : Éclairage, frigo, ordinateurs, télé..."
                    value={appareilsSolaire}
                    onChange={(e) => setAppareilsSolaire(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            )}

            {initialData.type === "contact" && (
              <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Type de prestation</Label>
                  <Select value={travailBureautique} onValueChange={setTravailBureautique}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saisie">Saisie & Rédaction de document</SelectItem>
                      <SelectItem value="impression">Impression & Photocopie</SelectItem>
                      <SelectItem value="photocopie">Numérisation & Reliure</SelectItem>
                      <SelectItem value="autre">Autre travail de bureau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Précisions optionnelles */}
            <div className="space-y-1.5">
              <Label htmlFor="lead_msg" className="text-xs font-semibold">
                Précisions ou questions (optionnel)
              </Label>
              <Textarea
                id="lead_msg"
                placeholder="Détails supplémentaires concernant votre demande..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-xs resize-none"
                rows={3}
              />
            </div>

            {errorMessage && (
              <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive font-medium">
                {errorMessage}
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="gap-1.5 bg-primary text-primary-foreground font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Envoi en cours…</span>
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    <span>Envoyer la demande</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
