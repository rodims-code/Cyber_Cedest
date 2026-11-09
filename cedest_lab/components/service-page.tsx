import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { WhatsAppFloatingButton } from "@/components/whatsapp-floating-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Wifi,
  SunMedium,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServicePageProps {
  title: string;
  description: string;
  type: "bureautique" | "wifi" | "solaire";
}

const serviceDetails: Record<
  "bureautique" | "wifi" | "solaire",
  {
    icon: typeof FileText;
    subtitle: string;
    points: string[];
    whatsappText: string;
  }
> = {
  bureautique: {
    icon: FileText,
    subtitle: "Travaux administratifs, secrétariat et impressions haute qualité",
    points: [
      "Saisie, mise en page et correction de documents (Word, Excel, PDF)",
      "Impression et photocopie noir & blanc et couleur haute définition",
      "Numérisation (scan) et plastification de documents",
      "Disponibilité sur nos deux sites : KIMIALA et SHELL",
    ],
    whatsappText: "Bonjour Cyber Cedest, je souhaite un renseignement sur le service Bureautique",
  },
  wifi: {
    icon: Wifi,
    subtitle: "Distribution Internet haut débit et répéteurs MikroTik à Kinshasa",
    points: [
      "Connexion Internet stable avec antenne émettrice et récepteurs MikroTik",
      "Installation chez particuliers, commerces, écoles et centres de santé",
      "Assistance technique et maintenance rapide par nos techniciens",
      "Connexion continue même en cas de coupure grâce à notre énergie solaire",
    ],
    whatsappText: "Bonjour Cyber Cedest, je souhaite une installation Wi-Fi MikroTik",
  },
  solaire: {
    icon: SunMedium,
    subtitle: "Étude, dimensionnement et installation de centrales photovoltaïques",
    points: [
      "Dimensionnement sur mesure selon votre consommation électrique",
      "Installation de panneaux solaires, onduleurs hybrides et parcs de batteries",
      "Protection contre les délestages et coupures d'électricité récurrentes",
      "Garantie, suivi d'exploitation et SAV par notre équipe technique",
    ],
    whatsappText: "Bonjour Cyber Cedest, je souhaite un devis pour une installation solaire",
  },
};

export function ServicePage({ title, description, type }: ServicePageProps) {
  const meta = serviceDetails[type];
  const Icon = meta.icon;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(meta.whatsappText)}`;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />

      <main className="flex-1">
        {/* En-tête du service */}
        <section className="relative overflow-hidden border-b border-border/60 bg-muted/20 py-16 sm:py-20">
          <div className="absolute inset-0 bg-radial-[circle_at_top,_var(--tw-gradient-stops)] from-primary/10 via-transparent to-transparent -z-10" />

          <div className="container mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Link href="/" className="hover:text-foreground">
                Accueil
              </Link>
              <ChevronRight className="size-3" />
              <Link href="/#services" className="hover:text-foreground">
                Services
              </Link>
              <ChevronRight className="size-3" />
              <span className="font-semibold text-primary">{title}</span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary">
                Service Cyber Cedest
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              {title}
            </h1>
            <p className="mt-3 text-lg font-medium text-foreground/80">
              {meta.subtitle}
            </p>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
              {description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/demande?type=${type}`}
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "gap-2 font-semibold shadow-xs"
                )}
              >
                <span>Faire une demande en ligne</span>
                <ArrowRight className="size-4" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                )}
              >
                <MessageCircle className="size-4" />
                <span>Échanger sur WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

        {/* Détails et avantages */}
        <section className="py-16">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">
                  Pourquoi choisir Cyber Cedest pour ce service ?
                </h2>
                <ul className="space-y-3">
                  {meta.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border bg-card p-8 shadow-sm space-y-4">
                <h3 className="text-lg font-bold">Besoin d'un traitement rapide ?</h3>
                <p className="text-sm text-muted-foreground">
                  Soumettez votre demande en moins de 2 minutes. Notre équipe reçoit directement vos informations et vous recontacte sur WhatsApp.
                </p>
                <Link
                  href={`/demande?type=${type}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                    "w-full justify-center"
                  )}
                >
                  Remplir le formulaire
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFloatingButton />
    </div>
  );
}
