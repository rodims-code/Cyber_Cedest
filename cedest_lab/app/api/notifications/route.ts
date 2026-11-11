import { getSession } from "@/lib/session";
import { getNotificationFeed } from "@/src/features/notifications/queries";

export const dynamic = "force-dynamic";

/**
 * Polling léger du centre de notifications.
 *
 * Renvoie uniquement les nouveautés depuis `since` (curseur opaque, id de la
 * dernière notification connue) plus le nombre total de non lues.
 * Les lignes renvoyées sont toujours celles de l'utilisateur courant.
 */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json(
      { error: "Non authentifié." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const url = new URL(request.url);
  const since = url.searchParams.get("since");

  const feed = await getNotificationFeed(session.user.id, since);

  return Response.json(feed, {
    headers: { "Cache-Control": "no-store" },
  });
}
