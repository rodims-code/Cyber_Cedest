import { CalendarOffIcon } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function NoSiteAssigned({
  title = "Aucun poste aujourd'hui",
  detail,
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarOffIcon className="size-5 text-muted-foreground" aria-hidden />
            {title}
          </CardTitle>
          <CardDescription>
            {detail ??
              "Vous n'avez pas de poste planifié aujourd'hui. Cette page sera disponible dès que le gérant vous aura affecté(e) à un site. Contactez-le pour toute question."}
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}
