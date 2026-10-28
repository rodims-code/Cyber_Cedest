"use client"

import React from "react"
import Link from "next/link"
import { Wifi, LogIn, MapPin, Phone, MessageCircle, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function SiteFooter() {
  const [currentYear, setCurrentYear] = React.useState<number>(2026)

  React.useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])
  return (
    <footer id="contact" className="border-t border-border/60 bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Presentation */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wifi className="size-4" />
              </div>
              <span className="font-heading text-lg font-bold">Cyber Cedest</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Partenaire de référence à Kinshasa pour la bureautique, la distribution Internet Wi-Fi via MikroTik, l'énergie solaire autonome et la formation certifiante.
            </p>
            <div className="pt-1">
              <Badge variant="outline" className="text-[11px] font-mono">
                Kinshasa, RDC
              </Badge>
            </div>
          </div>

          {/* Nos Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Nos Pôles de Services
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/#services" className="hover:text-foreground transition-colors">
                  Bureautique & Impression HD
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-foreground transition-colors">
                  Internet & Wi-Fi MikroTik
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-foreground transition-colors">
                  Énergie Solaire & Onduleurs
                </Link>
              </li>
              <li>
                <Link href="/formations" className="hover:text-foreground transition-colors text-primary font-medium flex items-center gap-1">
                  <span>Catalogue Formations (En ligne / Présentiel)</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Contact & Localisation
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Kinshasa, République Démocratique du Congo</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="size-4 text-emerald-600 shrink-0" />
                <a
                  href="https://wa.me/?text=Bonjour%20Cyber%20Cedest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-emerald-600 dark:text-emerald-400 font-medium"
                >
                  WhatsApp direct client
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary shrink-0" />
                <span>Assistance téléphonique disponible</span>
              </li>
            </ul>
          </div>

          {/* Espace Équipe / Login */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Espace Interne
            </h4>
            <p className="text-xs text-muted-foreground">
              Accès réservé aux collaborateurs et gestionnaires de Cyber Cedest pour le suivi des commandes et installations.
            </p>
            <div className="pt-1">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground shadow-xs hover:bg-muted hover:border-primary/50 transition-colors"
              >
                <LogIn className="size-3.5 text-primary" />
                <span>Accès Dashboard (Login)</span>
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} Cyber Cedest. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
              <LogIn className="size-3" />
              <span>Connexion équipe</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
