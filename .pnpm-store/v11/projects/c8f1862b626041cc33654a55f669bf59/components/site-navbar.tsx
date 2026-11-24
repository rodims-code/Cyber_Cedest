"use client"

import React, { useState } from "react"
import Link from "next/link"
import { LogIn, Menu, X, Wifi, ShieldCheck, MessageCircle, Sparkles } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function SiteNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Nos Services", href: "/#services" },
    { label: "Formations", href: "/formations", highlight: true },
    { label: "Galerie & Photos", href: "/#galerie" },
    { label: "Pourquoi Nous", href: "/#pourquoi-nous" },
    { label: "Contact", href: "/#contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
            <Wifi className="size-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                Cyber Cedest
              </span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-medium hidden sm:inline-flex">
                Kinshasa
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground -mt-0.5 hidden xs:inline-block">
              Internet • Solaire • Bureautique
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                link.highlight
                  ? "text-primary font-semibold flex items-center gap-1.5"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
              {link.highlight && (
                <span className="flex size-1.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        {/* Action Buttons (WhatsApp + Login) */}
        <div className="flex items-center gap-2.5">
          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/?text=Bonjour%20Cyber%20Cedest,%20je%20souhaite%20des%20informations%20sur%20vos%20services"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
            )}
          >
            <MessageCircle className="size-3.5" />
            <span>WhatsApp</span>
          </a>

          {/* Bouton Connexion / Login (MANDATORY REQUIREMENT) */}
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "inline-flex items-center gap-1.5 font-medium shadow-xs text-xs px-3.5"
            )}
          >
            <LogIn className="size-3.5" />
            <span>Connexion</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex md:hidden items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-md px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  link.highlight
                    ? "bg-primary/10 text-primary font-semibold flex items-center justify-between"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{link.label}</span>
                {link.highlight && (
                  <Badge variant="default" className="text-[10px] py-0 px-1.5">
                    Nouveau
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            <a
              href="https://wa.me/?text=Bonjour%20Cyber%20Cedest,%20je%20souhaite%20des%20informations%20sur%20vos%20services"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "w-full justify-center text-emerald-600 border-emerald-500/30"
              )}
            >
              <MessageCircle className="size-4 mr-2" />
              Contacter sur WhatsApp
            </a>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "w-full justify-center"
              )}
            >
              <LogIn className="size-4 mr-2" />
              Espace Connexion (Login)
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
