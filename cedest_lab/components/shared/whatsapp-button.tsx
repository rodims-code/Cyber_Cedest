"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/src/config/site";

export type WhatsAppBoutonType =
  | "entete"
  | "flottant"
  | "carte-bureautique"
  | "carte-wifi"
  | "carte-solaire"
  | "carte-formation"
  | "autre";

interface WhatsAppButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  bouton: WhatsAppBoutonType;
  message?: string;
  phone?: string;
  variant?: "default" | "outline" | "flottant";
  iconOnlyOnMobile?: boolean;
}

export function WhatsAppButton({
  bouton,
  message = "Bonjour Cyber Cedest, je souhaite des informations sur vos services.",
  phone,
  children,
  className,
  variant = "default",
  iconOnlyOnMobile = false,
  ...props
}: WhatsAppButtonProps) {
  const targetPhone = phone || siteConfig.whatsappNumber || "243000000000";
  const normalizedPhone = targetPhone.replace(/\D/g, "");
  const href = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;

  const handleClick = () => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const key = `wa_click_${bouton}`;
        const lastClick = window.sessionStorage.getItem(key);
        const now = Date.now();
        if (!lastClick || now - parseInt(lastClick, 10) > 30 * 60 * 1000) {
          window.sessionStorage.setItem(key, now.toString());
          const payload = JSON.stringify({
            page: window.location.pathname,
            bouton,
          });
          const blob = new Blob([payload], { type: "application/json" });
          if (navigator.sendBeacon) {
            navigator.sendBeacon("/api/whatsapp-click", blob);
          } else {
            fetch("/api/whatsapp-click", {
              method: "POST",
              body: blob,
              keepalive: true,
            }).catch(() => {});
          }
        }
      }
    } catch {
      // Jamais bloquer ni afficher d'erreur
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
      {...props}
    >
      <MessageCircle className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <span className={cn(iconOnlyOnMobile && "hidden sm:inline")}>
        {children || "Écrire sur WhatsApp"}
      </span>
    </a>
  );
}
