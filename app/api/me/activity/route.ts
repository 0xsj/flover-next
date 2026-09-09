import { getMyActivity } from "@/lib/services/ledger";
import { serverRoot } from "@/app/_lib/root";
import { respond } from "@/app/_lib/respond";

/* The browser's door for the ledger.
 *
 * The query string is read here and handed to the SERVICE as arguments, which
 * is the tier permitted to turn them into request params. A handler that built
 * a URL itself would be a second place that names an endpoint. */
export async function GET(request: Request): Promise<Response> {
  const root = await serverRoot();
  const query = new URL(request.url).searchParams;

  return respond(
    await getMyActivity(root.clientFor("ledger"), {
      after: query.get("after") ?? undefined,
      facet: query.get("facet") ?? undefined,
      correlation: query.get("correlation") ?? undefined,
      limit: Number(query.get("limit")) || undefined,
    }),
    root.correlationId,
  );
}
