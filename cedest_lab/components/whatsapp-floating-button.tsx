"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppFloatingButton() {
  const whatsappUrl =
    "https://wa.me/?text=Bonjour%20Cyber%20Cedest,%20je%20souhaite%20des%20informations%20sur%20vos%20services";

  return (
    <aside
      aria-label="Contact WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-emerald-700 hover:shadow-2xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        <MessageCircle className="size-5 transition-transform duration-300 group-hover:rotate-12" />
        <span className="text-xs font-semibold sm:inline">
          WhatsApp direct
        </span>
      </a>
    </aside>
  );
}
