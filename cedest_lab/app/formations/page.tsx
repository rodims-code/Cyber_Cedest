"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  BookOpen,
  Award,
  Laptop,
  Users,
  MessageCircle,
  ArrowRight,
  Filter,
  Sparkles,
  MapPin,
  ChevronRight,
  SunMedium,
  Check,
} from "lucide-react"

import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FORMATIONS_LIST, Formation, FormationMode } from "@/lib/formations-data"

export default function FormationsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all")

  // Filtrage de la liste selon le mode (Présentiel, En ligne, Tous)
  const filteredFormations = FORMATIONS_LIST.filter((item) => {
    if (selectedFilter === "all") return true
    if (selectedFilter === "presentiel") return item.mode === "presentiel" || item.mode === "hybride"
    if (selectedFilter === "en_ligne") return item.mode === "en_ligne" || item.mode === "hybride"
    return true
  })

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation principale avec bouton Login */}
      <SiteNavbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* EN-TÊTE DE LA PAGE FORMATIONS */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden border-b border-border/60 bg-muted/20 py-16 sm:py-20">
          <div className="absolute inset-0 bg-radial-[circle_at_top,_var(--tw-gradient-stops)] from-primary/10 via-transparent to-transparent -z-10" />

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Accueil
                </Link>
                <ChevronRight className="size-3 text-muted-foreground" />
                <span className="text-xs font-semibold text-primary">Formations</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/40 text-primary">
                  <GraduationCap className="size-3.5 mr-1" />
                  Catalogue Formations Cyber Cedest
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Kinshasa & À distance
                </Badge>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                Apprenez des compétences concrètes,{" "}
                <span className="text-primary underline decoration-primary/30 underline-offset-8">
                  en ligne ou en présentiel
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Formez-vous avec nos experts à Kinshasa : initiation à l'informatique, bureautique professionnelle (Word & Excel) et installation de panneaux solaires photovoltaïques. Accompagnement sur-mesure et attestation de formation.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BARRE DE FILTRES PAR MODE (PRÉSENTIEL / EN LIGNE / TOUS) */}
        {/* ========================================================================= */}
        <section className="border-b border-border/60 bg-background/80 sticky top-16 z-30 backdrop-blur-md py-4">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Filtrer par format :
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFilter("all")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border",
                    selectedFilter === "all"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  )}
                >
                  Toutes les formations ({FORMATIONS_LIST.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFilter("presentiel")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border inline-flex items-center gap-1.5",
                    selectedFilter === "presentiel"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Users className="size-3.5" />
                  <span>En Présentiel (Kinshasa)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFilter("en_ligne")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border inline-flex items-center gap-1.5",
                    selectedFilter === "en_ligne"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Laptop className="size-3.5" />
                  <span>En Ligne (À distance)</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BOUCLE D'AFFICHAGE DES FORMATIONS (FACILE À METTRE À JOUR) */}
        {/* ========================================================================= */}
        <section className="py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredFormations.map((formation) => {
                const whatsappUrl = `https://wa.me/?text=Bonjour%20Cyber%20Cedest,%20je%20souhaite%20m'inscrire%20ou%20avoir%20plus%20d'informations%20sur%20la%20formation%20:%20${encodeURIComponent(
                  formation.title
                )}%20(${encodeURIComponent(formation.modeLabel)})`

                return (
                  <Card
                    key={formation.id}
                    className="flex flex-col justify-between overflow-hidden border border-border shadow-xs hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image d'illustration de la formation */}
                    {formation.image && (
                      <div className="relative h-48 w-full overflow-hidden bg-muted">
                        <img
                          src={formation.image}
                          alt={formation.title}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <Badge
                            variant="default"
                            className="bg-primary/90 text-primary-foreground backdrop-blur-xs text-[11px]"
                          >
                            {formation.modeLabel}
                          </Badge>
                          {formation.featured && (
                            <Badge variant="secondary" className="bg-amber-500/90 text-white text-[11px]">
                              Populaire
                            </Badge>
                          )}
                        </div>

                        <div className="absolute bottom-3 right-3">
                          <span className="rounded-md bg-black/70 backdrop-blur-xs px-2.5 py-1 text-[11px] font-medium text-white flex items-center gap-1.5">
                            <Clock className="size-3" />
                            {formation.duration}
                          </span>
                        </div>
                      </div>
                    )}

                    <CardHeader className="pt-5">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                          {formation.category}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Award className="size-3.5 text-emerald-500" />
                          Certificat remis
                        </span>
                      </div>

                      <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {formation.title}
                      </CardTitle>

                      <CardDescription className="text-sm leading-relaxed text-muted-foreground mt-2">
                        {formation.shortDescription}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Caractéristiques */}
                      <div className="grid grid-cols-2 gap-2 text-xs rounded-lg bg-muted/30 p-3 border border-border/50">
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Niveau :</span>
                          <span className="font-semibold text-foreground">{formation.level}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Prérequis :</span>
                          <span className="font-semibold text-foreground truncate block" title={formation.prerequisites}>
                            {formation.prerequisites}
                          </span>
                        </div>
                      </div>

                      {/* Modules et compétences acquises */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                          Au programme de cette formation :
                        </p>
                        <ul className="space-y-1.5">
                          {formation.modules.map((module, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{module}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/10">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Sessions régulières & places limitées</span>
                      </div>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          buttonVariants({ variant: "default", size: "sm" }),
                          "gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                        )}
                      >
                        <MessageCircle className="size-4" />
                        <span>S'inscrire sur WhatsApp</span>
                      </a>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* GUIDE MODALITÉS : PRÉSENTIEL VS EN LIGNE */}
        {/* ========================================================================= */}
        <section className="py-16 bg-muted/20 border-t border-border/60">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
              <Badge variant="outline" className="border-primary/40 text-primary">
                Deux Modalités Flexibles
              </Badge>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                Comment préférez-vous suivre votre formation ?
              </h2>
              <p className="text-sm text-muted-foreground">
                Nous nous adaptons à votre emploi du temps et à votre lieu de résidence à Kinshasa ou ailleurs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Formation en Présentiel</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500 shrink-0" />
                    <span>Postes informatiques équipés et connexion continue à Kinshasa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500 shrink-0" />
                    <span>Présence directe du formateur pour corriger vos exercices en direct</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500 shrink-0" />
                    <span>Ateliers pratiques réels (branchement panneaux solaires & onduleurs)</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
                <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Laptop className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Formation En Ligne (À distance)</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500 shrink-0" />
                    <span>Apprenez depuis chez vous, à votre rythme</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500 shrink-0" />
                    <span>Support par groupe WhatsApp & séances de questions-réponses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-500 shrink-0" />
                    <span>Exercices corrigés et suivi personnalisé jusqu'à la certification</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BANNIÈRE CONTACT / INSCRIPTION RAPIDE */}
        {/* ========================================================================= */}
        <section className="py-16 bg-background">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-muted/40 p-8 sm:p-10 text-center space-y-5 shadow-sm">
              <Badge variant="outline" className="border-primary/40 text-primary">
                Assistance & Orientation
              </Badge>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
                Vous hésitez sur le choix de votre formation ?
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Discutez avec notre équipe pédagogique pour évaluer votre niveau et choisir le module le plus adapté à vos objectifs.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href="https://wa.me/?text=Bonjour%20Cyber%20Cedest,%20je%20souhaite%20un%20conseil%20pour%20choisir%20une%20formation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2"
                  )}
                >
                  <MessageCircle className="size-5" />
                  <span>Poser une question sur WhatsApp</span>
                </a>

                <Link
                  href="/"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  Retour à l'accueil
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
