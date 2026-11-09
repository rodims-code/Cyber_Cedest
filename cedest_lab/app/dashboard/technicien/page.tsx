import Link from "next/link";
import { requireRole } from "@/lib/session";
import { getLeadsForRole } from "@/features/leads/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ClipboardList, Clock, CheckCircle2, ArrowRight, Contact, Wifi, SunMedium } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function TechnicienHomePage() {
  const { user } = await requireRole(["technicien"]);
  const allLeads = await getLeadsForRole("technicien");

  const newCount = allLeads.filter((l) => l.status === "nouveau").length;
  const inProgressCount = allLeads.filter((l) => l.status === "en_cours").length;
  const doneCount = allLeads.filter((l) => l.status === "converti").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenue, {user.name} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Espace Technicien — Wi-Fi MikroTik, Liaisons Sans-Fil et Installations Solaires.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouvelles interventions</CardTitle>
            <Clock className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newCount}</div>
            <p className="text-xs text-muted-foreground">Demandes Wi-Fi et Solaire à étudier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours d'intervention</CardTitle>
            <Wifi className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">Visites techniques & chantiers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Installations finalisées</CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doneCount}</div>
            <p className="text-xs text-muted-foreground">Installations validées</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-5 text-primary" />
              Demandes Wi-Fi et Solaires
            </CardTitle>
            <CardDescription>
              Consultez les demandes de devis solaires et d'accès Wi-Fi envoyées par les clients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/technicien/demandes"
              className={cn(buttonVariants({ variant: "default" }), "w-fit gap-2")}
            >
              <span>Voir les demandes</span>
              <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Contact className="size-5 text-primary" />
              Mon Espace Personnel
            </CardTitle>
            <CardDescription>
              Consultez vos horaires, vos assignations de postes et vos relevés d'heures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/technicien/mon-espace"
              className={cn(buttonVariants({ variant: "outline" }), "w-fit gap-2")}
            >
              <span>Voir mon espace</span>
              <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
