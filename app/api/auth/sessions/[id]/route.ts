import { revokeSession } from "@/lib/services/session";
import { serverRoot } from "@/app/_lib/root";
import { respond } from "@/app/_lib/respond";

/* The write half of the same door.
 *
 * It does no authorisation of its own and must not: the service asks the
 * transport, and the fixture — standing in for the server — is what decides
 * that a session belongs to this bearer, is already gone, or is the one making
 * the request. A route handler that re-decided any of those would be a second
 * copy of the rules, and the copy is what drifts. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const root = await serverRoot();
  const { id } = await params;
  return respond(await revokeSession(root.clientFor("session"), id), root.correlationId);
}
