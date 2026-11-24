import { z } from "zod";
import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/app/db";
import { whatsappClicks } from "@/app/db/schema";
import { getClientIpHmac } from "@/src/lib/ip-hash";

export const dynamic = "force-dynamic";

const clickSchema = z.object({
  page: z.string().trim().min(1).max(255),
  bouton: z.enum([
    "entete",
    "flottant",
    "carte-bureautique",
    "carte-wifi",
    "carte-solaire",
    "carte-formation",
    "autre",
  ]),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const parsed = clickSchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(null, { status: 204 });
    }

    const ipHash = await getClientIpHmac();

    // Limite 30 clics par heure et par ip_hash comptés en base
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [clickCount] = await db
      .select({ total: count() })
      .from(whatsappClicks)
      .where(
        and(
          eq(whatsappClicks.ipHash, ipHash),
          gte(whatsappClicks.createdAt, oneHourAgo)
        )
      );

    if (Number(clickCount?.total ?? 0) >= 30) {
      return new Response(null, { status: 204 });
    }

    // Enregistrement anonyme sans donnée personnelle
    await db.insert(whatsappClicks).values({
      page: parsed.data.page,
      bouton: parsed.data.bouton,
      ipHash,
    });

    return new Response(null, { status: 204 });
  } catch {
    // Erreur avalée, toujours répondre 204
    return new Response(null, { status: 204 });
  }
}
