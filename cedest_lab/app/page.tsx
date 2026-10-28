import React from "react"
import Link from "next/link"
import {
  Wifi,
  Printer,
  SunMedium,
  GraduationCap,
  LogIn,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Sparkles,
  Layers,
  FileText,
  Clock,
  Info,
} from "lucide-react"

import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { ImagePlaceholder } from "@/components/image-placeholder"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const services = [
    {
      id: "bureautique",
      title: "Bureautique & Impression Haute Définition",
      category: "Secrétariat Public",
      icon: Printer,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description:
        "Traitement de texte, saisie rapide, impressions laser couleur & noir et blanc, photocopies industrielles, reliure, plastification et numérisation.",
      features: [
        "Saisie rapide de mémoires, rapports & courriers",
        "Impression et photocopie grand volume",
        "Plastification & reliure thermique ou spirale",
        "Scan haute résolution & transmission par email/clé USB",
      ],
      image: {
        title: "Photo Atelier Bureautique",
        path: "/images/services/bureautique.jpg",
        dimensions: "800 × 500 px",
        description: "Vue des imprimantes, photocopieuses et postes de secrétariat",
      },
    },
    {
      id: "internet",
      title: "Internet Haut Débit & Wi-Fi MikroTik",
      category: "Connectivité & Réseau",
      icon: Wifi,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      description:
        "Distribution internet via antenne émettrice et récepteurs MikroTik installés chez les particuliers, commerces, hôpitaux et bureaux à Kinshasa.",
      features: [
        "Installation d'antennes émettrices & récepteurs MikroTik",
        "Déploiement de répéteurs Wi-Fi longue portée",
        "Couverture adaptée pour résidences, commerces & cliniques",
        "Stabilité de bande passante & monitoring réseau",
      ],
      image: {
        title: "Photo Antenne & Équipements MikroTik",
        path: "/images/services/wifi-mikrotik.jpg",
        dimensions: "800 × 500 px",
        description: "Routeurs MikroTik, câblage réseau et antenne de diffusion",
      },
    },
    {
      id: "solaire",
      title: "Énergie Solaire & Solutions Anti-Délestage",
      category: "Autonomie Énergétique",
      icon: SunMedium,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description:
        "Étude technique, dimensionnement et installation complète de kits solaires (panneaux photovoltaïques, onduleurs hybrides et parcs de batteries).",
      features: [
        "Audit énergétique et calcul de charge personnalisé",
        "Installation de panneaux solaires certifiés haute efficacité",
        "Systèmes hybrides avec basculement automatique sans coupure",
        "Maintenance préventive et suivi des batteries gel / lithium",
      ],
      image: {
        title: "Photo Installation Panneaux Solaires",
        path: "/images/services/energie-solaire.jpg",
        dimensions: "800 × 500 px",
        description: "Panneaux posés sur toiture, onduleur mural et parc batteries",
      },
    },
    {
      id: "formation",
      title: "Formation Informatique & Pratique Professionnelle",
      category: "Compétences & Carrière",
      icon: GraduationCap,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      description:
        "Programmes intensifs en bureautique, outils collaboratifs et compétences numériques de base, accessibles en présentiel ou avec suivi en ligne.",
      features: [
        "Maîtrise complète de la suite Office (Word, Excel, PowerPoint)",
        "Initiation informatique, navigation web & sécurité",
        "Formations dispensées en présentiel dans nos locaux ou en ligne",
        "Attestation et mise en pratique sur cas réels",
      ],
      image: {
        title: "Photo Salle de Formation Informatique",
        path: "/images/services/formation.jpg",
        dimensions: "800 × 500 px",
        description: "Apprenants devant les postes informatiques avec le formateur",
      },
    },
  ]

  const galleryItems = [
    {
      title: "Déploiement Antenne Relais Wi-Fi",
      category: "Réseau Client",
      suggestedPath: "/images/gallery/antenne-relais.jpg",
      dimensions: "600 × 450 px",
      description: "Installation chez un client résidentiel ou commercial à Kinshasa",
    },
    {
      title: "Centrale Solaire & Onduleur Hybride",
      category: "Énergie Verte",
      suggestedPath: "/images/gallery/installation-panneaux.jpg",
      dimensions: "600 × 450 px",
      description: "Montage de toiture et tableau électrique autonome",
    },
    {
      title: "Espace Cyber & Postes Clients",
      category: "Vie au Cyber",
      suggestedPath: "/images/gallery/espace-cyber.jpg",
      dimensions: "600 × 450 px",
      description: "L'accueil du public, photocopieurs et ordinateurs en service",
    },
    {
      title: "Session Pratique de Formation",
      category: "Formation Continue",
      suggestedPath: "/images/gallery/session-formation.jpg",
      dimensions: "600 × 450 px",
      description: "Atelier pratique d'apprentissage sur logiciel bureautique",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Barre de navigation avec bouton Login */}
      <SiteNavbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* BANNIÈRE D'INFORMATION POUR LES IMAGES (MISE EN ÉVIDENCE POUR LE CLIENT) */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* BANNIÈRE ANNONCE FORMATIONS & ACCÈS DIRECT */}
        {/* ========================================================================= */}
        <div className="bg-primary/10 border-b border-primary/20 py-2.5 px-4 text-xs">
          <div className="container mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-foreground">
              <Badge variant="default" className="text-[10px] py-0 px-2 bg-primary text-primary-foreground font-semibold">
                Inscriptions Ouvertes
              </Badge>
              <span className="font-medium text-xs">
                🎓 <strong>Nouvelles Formations Certifiantes :</strong> Initiation informatique, Word, Excel & Panneaux Solaires (en ligne ou présentiel à Kinshasa).
              </span>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <Link
                href="/formations"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-xs"
              >
                Découvrir le programme →
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs"
              >
                <LogIn className="size-3" />
                <span>Espace Login</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION HERO */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-border/50">
          <div className="absolute inset-0 bg-radial-[circle_at_top,_var(--tw-gradient-stops)] from-primary/10 via-transparent to-transparent -z-10" />

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Colonne Gauche : Texte & Accroche */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <Badge variant="outline" className="gap-1.5 py-1 px-3 border-primary/30 bg-primary/5 text-primary">
                    <MapPin className="size-3.5 text-primary" />
                    Kinshasa, RDC
                  </Badge>
                  <Badge variant="secondary" className="gap-1.5 py-1 px-3">
                    <Sparkles className="size-3.5 text-amber-500" />
                    Bureautique • Wi-Fi • Solaire • Formation
                  </Badge>
                </div>

                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                  Votre solution complète en{" "}
                  <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
                    connectivité
                  </span>
                  , bureautique & énergie.
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Cyber Cedest accompagne particuliers, commerces et institutions à Kinshasa : travaux de secrétariat de haute qualité, distribution Wi-Fi via MikroTik, installations solaires fiables et formations pratiques.
                </p>

                {/* Call to Actions dont le bouton Login */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                  <a
                    href="#services"
                    className={cn(buttonVariants({ variant: "default", size: "lg" }), "gap-2 shadow-sm font-semibold")}
                  >
                    <span>Découvrir nos services</span>
                    <ArrowRight className="size-4" />
                  </a>

                  <a
                    href="https://wa.me/?text=Bonjour%20Cyber%20Cedest,%20je%20souhaite%20un%20renseignement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "gap-2 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                    )}
                  >
                    <MessageCircle className="size-4" />
                    <span>WhatsApp Rapide</span>
                  </a>

                  {/* Bouton Login bien mis en évidence dans le Hero */}
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "lg" }),
                      "gap-2 border border-border"
                    )}
                  >
                    <LogIn className="size-4 text-primary" />
                    <span>Espace Login</span>
                  </Link>
                </div>

                {/* Reassurances / Points clés */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60 text-left">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                      <Zap className="size-3.5 text-amber-500" />
                      Anti-coupure
                    </p>
                    <p className="text-xs text-muted-foreground">Alimentation solaire continue</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                      <Wifi className="size-3.5 text-primary" />
                      MikroTik
                    </p>
                    <p className="text-xs text-muted-foreground">Portée étendue & répéteurs</p>
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <p className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-emerald-500" />
                      Service Pro
                    </p>
                    <p className="text-xs text-muted-foreground">Équipe technique sur place</p>
                  </div>
                </div>
              </div>

              {/* Colonne Droite : PHOTO PRINCIPALE (HERO IMAGE) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="group relative w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl">
                  <img
                    src="/images/hero-cyber-cedest.jpg"
                    alt="Cyber Cedest - Façade et Équipements à Kinshasa"
                    className="w-full h-[340px] sm:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
                      <Sparkles className="size-3.5 text-amber-400" />
                      <span className="font-medium">Cyber Cedest • Kinshasa RDC</span>
                    </div>
                    <Badge variant="secondary" className="bg-white/95 text-black font-semibold text-[11px] shadow-xs">
                      📍 Kinshasa
                    </Badge>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION SERVICES (4 PÔLES D'ACTIVITÉS AVEC EMPLACEMENTS IMAGES DÉDIÉS) */}
        {/* ========================================================================= */}
        <section id="services" className="py-20 bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Titre de section */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Nos Prestations à Kinshasa
              </Badge>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Des solutions concrètes pour vos besoins quotidiens
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Chaque pôle dispose d'équipements dédiés et d'un savoir-faire éprouvé pour vous garantir rapidité, autonomie et professionnalisme.
              </p>
            </div>

            {/* Grille des 4 services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service) => {
                const IconComponent = service.icon
                return (
                  <Card key={service.id} className="flex flex-col justify-between overflow-hidden border border-border shadow-xs hover:shadow-md transition-all duration-300">
                    
                    {/* Image du Service */}
                    <div className="p-4 pb-0">
                      <ImagePlaceholder
                        title={service.image.title}
                        suggestedPath={service.image.path}
                        dimensions={service.image.dimensions}
                        description={service.image.description}
                        imageSrc={service.image.path}
                        aspectRatio="video"
                        className="bg-background"
                      />
                    </div>

                    <CardHeader className="pt-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {service.category}
                        </Badge>
                        <div className={cn("flex size-9 items-center justify-center rounded-lg", service.bgColor, service.color)}>
                          <IconComponent className="size-5" />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold text-foreground">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm leading-relaxed text-muted-foreground mt-1">
                        {service.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                        Inclus dans ce service :
                      </p>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="pt-4 border-t border-border/60 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`https://wa.me/?text=Bonjour%20Cyber%20Cedest,%20je%20souhaite%20un%20devis%20ou%20des%20informations%20concernant%20le%20service%20:%20${encodeURIComponent(
                            service.title
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs gap-1.5")}
                        >
                          <MessageCircle className="size-3.5 text-emerald-600" />
                          <span>Demander un devis</span>
                        </a>

                        {service.id === "formation" && (
                          <Link
                            href="/formations"
                            className={cn(
                              buttonVariants({ variant: "default", size: "sm" }),
                              "text-xs gap-1.5 font-medium shadow-xs"
                            )}
                          >
                            <GraduationCap className="size-3.5" />
                            <span>Voir le programme complet</span>
                          </Link>
                        )}
                      </div>

                      <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline-block">
                        Kinshasa • RDC
                      </span>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION GALERIE & RÉALISATIONS (MISE EN ÉVIDENCE DES PHOTOS À AJOUTER) */}
        {/* ========================================================================= */}
        <section id="galerie" className="py-20 border-y border-border/60">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  📸 Vitrine Visuelle & Équipements
                </Badge>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                  Nos installations et moments en images
                </h2>
                <p className="text-sm text-muted-foreground">
                  Visualisez ici les interventions techniques, les équipements MikroTik, les centrales solaires et nos ateliers de travail.
                </p>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-primary max-w-xs">
                ✨ <strong>En direct :</strong> Photos authentiques de nos installations réelles à Kinshasa.
              </div>
            </div>

            {/* Grille de 4 photos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {galleryItems.map((item, index) => (
                <div key={index} className="flex flex-col space-y-2">
                  <ImagePlaceholder
                    title={item.title}
                    suggestedPath={item.suggestedPath}
                    dimensions={item.dimensions}
                    description={item.description}
                    imageSrc={item.suggestedPath}
                    aspectRatio="tall"
                    className="bg-card shadow-xs"
                  />
                  <div className="px-1">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION POURQUOI CHOISIR CYBER CEDEST */}
        {/* ========================================================================= */}
        <section id="pourquoi-nous" className="py-20 bg-muted/30">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
              <Badge variant="secondary">Avantages Compétitifs</Badge>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Pourquoi faire confiance à Cyber Cedest ?
              </h2>
              <p className="text-sm text-muted-foreground">
                Une réponse concrète adaptée aux exigences du terrain kinois.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-xl border border-border bg-card p-6 space-y-3 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="size-5" />
                </div>
                <h3 className="font-semibold text-base text-foreground">Énergie Continue</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Grâce à nos installations solaires autonomes, nos services restent 100% opérationnels même lors des coupures de courant.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-3 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Wifi className="size-5" />
                </div>
                <h3 className="font-semibold text-base text-foreground">Technologie MikroTik</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Réseau sans fil robuste et sécurisé capable de couvrir habitations, commerces et bâtiments de santé sans perte de signal.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-3 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-semibold text-base text-foreground">Qualité & Finition</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Documents impeccables, matériel d'impression haute définition et respect scrupuleux des délais de livraison.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-3 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <GraduationCap className="size-5" />
                </div>
                <h3 className="font-semibold text-base text-foreground">Formation Pratique</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pédagogie axée sur la manipulation réelle des outils informatiques avec encadrement individuel et suivi en ligne.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BANNIÈRE CONTACT & WHATSAPP + BOUTON LOGIN FINAL */}
        {/* ========================================================================= */}
        <section className="py-16 bg-background">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-muted/50 p-8 sm:p-12 text-center space-y-6 shadow-sm">
              <Badge variant="outline" className="border-primary/40 text-primary">
                Contact Rapide
              </Badge>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Besoin d'un renseignement, d'une connexion Wi-Fi ou d'un devis solaire ?
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Notre équipe à Kinshasa vous répond directement sur WhatsApp ou vous accueille dans nos locaux.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <a
                  href="https://wa.me/?text=Bonjour%20Cyber%20Cedest,%20je%20souhaite%20obtenir%20des%20informations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  )}
                >
                  <MessageCircle className="size-5" />
                  <span>Écrire sur WhatsApp</span>
                </a>

                {/* Bouton de Login également présent dans le CTA de bas de page */}
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "gap-2 border-border"
                  )}
                >
                  <LogIn className="size-4" />
                  <span>Espace Collaborateur (Login)</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer avec lien Login */}
      <SiteFooter />
    </div>
  )
}
