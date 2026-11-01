import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/app/db";
import { ac, roles } from "./auth-access";
import * as schema from "@/app/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [
    admin({
      ac,
      roles, // ← sans cette ligne, l'erreur reste
      adminRoles: ["gerant"],
      defaultRole: "operateur",
    }),
  ],
  emailAndPassword: {
    enabled: true,
  },
});
