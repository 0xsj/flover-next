import { conflict, err, invalid, notFound, ok, rateLimited } from "@/lib/kernel";
import { requireToken, type MemoryRoute } from "@/lib/http";
import type { NewTarget, Target } from "../services/targets";

/* Fixtures reproduce the server's REFUSALS, not its happy path.
 *
 * Count the routes that succeed against the routes that refuse. If the second
 * number is zero, every screen built against this is built against a contract
 * nobody serves. */

const rows: Target[] = [
  { id: "t1", name: "api", host: "api.example.com" },
  { id: "t2", name: "www", host: "www.example.com" },
];

/** The workspace with no primary target chosen. The backend signals that with
 *  a 404 carrying `type: "no_primary_target"` — which is what lets the service
 *  call it absence rather than guessing from the status. */
export const routes: MemoryRoute[] = [
  {
    method: "GET",
    pattern: /^\/targets$/,
    handle: (req) => {
      const token = requireToken(req);
      if (!token.ok) return token;
      return req.params?.workspace === "w-empty" ? ok([]) : ok(rows);
    },
  },
  {
    method: "GET",
    pattern: /^\/targets\/(.+)$/,
    handle: (_req, m) => {
      const found = rows.find((r) => r.id === m[1]);
      return found ? ok(found) : err(notFound("No such target.", { status: 404 }));
    },
  },
  {
    method: "GET",
    pattern: /^\/workspaces\/(.+)\/primary-target$/,
    handle: (_req, m) =>
      m[1] === "w1"
        ? ok(rows[0])
        : err(notFound("No primary target.", { status: 404, type: "no_primary_target" })),
  },
  {
    method: "POST",
    pattern: /^\/targets$/,
    handle: (req) => {
      const token = requireToken(req);
      if (!token.ok) return token;

      const body = req.body as NewTarget;
      // The server's OWN validation, reproduced — not just the client's. A form
      // built against a fixture that always accepts is a form nobody tested.
      if (rows.some((r) => r.name === body.name)) {
        return err(conflict("A target with that name already exists.", { status: 409 }));
      }
      if (body.host.endsWith(".internal")) {
        return err(
          invalid("Check the form.", { host: "Internal hosts cannot be targeted." }, { status: 422 }),
        );
      }
      return ok({ id: `t${rows.length + 1}`, ...body } satisfies Target);
    },
  },
  {
    method: "DELETE",
    pattern: /^\/targets\/(.+)$/,
    handle: (_req, m) =>
      m[1] === "t1"
        ? err(rateLimited("Too many deletions.", 12, { status: 429 }))
        : ok(undefined),
  },
];
