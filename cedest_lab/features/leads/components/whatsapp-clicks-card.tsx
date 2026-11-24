import { MessageCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWhatsAppClicksStats } from "@/features/leads/queries";

export async function WhatsAppClicksCard() {
  const stats = await getWhatsAppClicksStats();

  const labelsBoutons: Record<string, string> = {
    entete: "En-tête (WhatsApp Rapide)",
    flottant: "Bouton flottant",
    "carte-bureautique": "Carte Bureautique",
    "carte-wifi": "Carte Wi-Fi",
    "carte-solaire": "Carte Solaire",
    "carte-formation": "Carte Formation",
    autre: "Autre / Contact bas de page",
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="size-5 text-emerald-600" />
              <span>Activité WhatsApp (7 derniers jours)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Clics anonymes enregistrés sur les différents boutons WhatsApp du site.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              Aujourd’hui : {stats.totalAujourdhui} clic{stats.totalAujourdhui > 1 ? "s" : ""}
            </Badge>
            <Badge variant="secondary" className="text-xs font-mono">
              7 jours : {stats.total7Jours} clic{stats.total7Jours > 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {stats.total7Jours === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            Aucun clic enregistré pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Par bouton */}
            <div className="space-y-2 rounded-lg border p-3">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider block text-[11px]">
                Répartition par bouton :
              </span>
              <ul className="divide-y">
                {Object.entries(stats.parBouton).map(([btn, count]) => (
                  <li key={btn} className="flex justify-between py-1.5">
                    <span>{labelsBoutons[btn] ?? btn}</span>
                    <span className="font-mono font-bold">{count}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Par page */}
            <div className="space-y-2 rounded-lg border p-3">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider block text-[11px]">
                Répartition par page :
              </span>
              <ul className="divide-y">
                {Object.entries(stats.parPage).map(([pg, count]) => (
                  <li key={pg} className="flex justify-between py-1.5">
                    <span className="font-mono">{pg || "/"}</span>
                    <span className="font-mono font-bold">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
