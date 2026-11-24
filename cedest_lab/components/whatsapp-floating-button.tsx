"use client";

import { WhatsAppButton } from "@/components/shared/whatsapp-button";

export function WhatsAppFloatingButton() {
  return (
    <aside
      aria-label="Contact WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center"
    >
      <WhatsAppButton
        bouton="flottant"
        message="Bonjour Cyber Cedest, je souhaite des informations sur vos services."
        iconOnlyOnMobile={true}
        className="group flex items-center gap-2 rounded-full bg-emerald-600 p-3 sm:px-4 sm:py-3 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-emerald-700 hover:shadow-2xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        <span className="text-xs font-semibold">WhatsApp direct</span>
      </WhatsAppButton>
    </aside>
  );
}
