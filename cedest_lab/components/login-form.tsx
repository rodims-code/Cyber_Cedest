"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Lock, Mail, LogIn } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError("Identifiants incorrects ou compte suspendu.");
        setLoading(false);
      } else {
        const userRole = (result.data?.user as { role?: string } | undefined)
          ?.role;
        if (userRole) {
          router.push(`/dashboard/${userRole}`);
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      setError("Impossible de contacter le serveur d'authentification.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className={cn("flex flex-col gap-5", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Connexion Équipe</h1>
        <p className="text-sm text-muted-foreground">
          Accédez au dashboard de gestion interne Cyber Cedest.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" htmlFor="email">
            Adresse e-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="votre.email@cybercedest.cd"
              required
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold" htmlFor="password">
              Mot de passe
            </label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="pl-9"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full gap-2 font-semibold shadow-xs"
        >
          <LogIn className="size-4" />
          {loading ? "Connexion en cours..." : "Se connecter"}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground pt-2">
        Réservé au personnel habilité (Gérant, Opérateurs, Techniciens).
        Pour toute création ou réinitialisation, adressez-vous au gérant.
      </p>
    </form>
  );
}
