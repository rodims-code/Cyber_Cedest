import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function NoSiteAssigned() {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Aucun site attribué</CardTitle>
          <CardDescription>
            Votre compte n&apos;est rattaché à aucun site actif. Contactez le
            gérant pour obtenir une affectation.
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}
