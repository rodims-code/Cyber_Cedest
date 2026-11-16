import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-3xl p-4 text-center">
      <h1 className="text-2xl font-semibold">Page introuvable</h1>
      <p className="text-muted-foreground">
        La page que vous recherchez n'existe pas ou n'est pas accessible.
      </p>
      <Link
        href="/dashboard"
        className="mt-4 inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
      >
        ← Revenir au tableau de bord
      </Link>
    </section>
  );
}
