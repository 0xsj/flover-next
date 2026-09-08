import { canceled, err, internal, ok, unauthenticated, type Failure, type Result } from "../kernel";
import type { ClientConfig, HttpClient, RequestOptions } from "./port";

/* The memory adapter reproduces the server's REFUSALS, not its happy path. A
 * refusal is a value a route hands back, identical in shape to the one the
 * fetch adapter builds from a real response.
 *
 * One change from v1/v2: an UNSERVED route is no longer a `not_found`. v1
 * reasoned "a route the fixture does not serve is a 404 from the real server
 * too", and that is true of the server — but the fixture not answering is a
 * fixture bug, not a server behaviour being reproduced. Labelling it 404 let
 * v2's `optional` turn a missing route into "looked and found nothing". It is
 * now `internal` with `type: "unserved_route"`: nobody looked, loudly. A
 * screen that wants to render a 404 registers a route that returns one. */

export const UNSERVED_ROUTE = "unserved_route";

export type MemoryRequest = {
  method: string;
  path: string;
  params: RequestOptions["params"];
  body: unknown;
  token: string | null;
  /** What the caller would have sent on the wire. A fixture that cannot see it
   *  cannot reproduce a server that reads it. */
  correlationId: string | undefined;
};

export type MemoryRoute = {
  method: string;
  pattern: RegExp;
  handle: (
    request: MemoryRequest,
    match: RegExpMatchArray,
  ) => Result<unknown, Failure> | Promise<Result<unknown, Failure>>;
};

export type MemoryConfig = {
  routes: readonly MemoryRoute[];
  getAccessToken?: ClientConfig["getAccessToken"];
  getCorrelationId?: ClientConfig["getCorrelationId"];
  /** Non-zero by default: a fixture that resolves synchronously hides every
   *  loading state the real one will show. */
  latencyMs?: number;
};

export function createMemoryClient(config: MemoryConfig): HttpClient {
  const request = async <T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<Result<T, Failure>> => {
    const correlationId = config.getCorrelationId?.() ?? undefined;

    await new Promise((r) => setTimeout(r, config.latencyMs ?? 40));
    if (options.signal?.aborted) return err(canceled("The request was cancelled."));

    for (const route of config.routes) {
      if (route.method !== method) continue;
      const match = path.match(route.pattern);
      if (!match) continue;
      const answered = (await route.handle(
        {
          method, path, params: options.params, body: options.body,
          token: config.getAccessToken?.() ?? null, correlationId,
        },
        match,
      )) as Result<T, Failure>;
      /* Identical to the network adapter: attach what the caller would have sent
         where the route did not set one. A fixture whose failures carry no
         correlation is a fixture a screen can tell apart from the server. */
      return answered.ok || answered.error.correlationId !== undefined || correlationId === undefined
        ? answered
        : err({ ...answered.error, correlationId });
    }

    return err(internal(`No fixture route for ${method} ${path}`, { type: UNSERVED_ROUTE, correlationId }));
  };

  return {
    request,
    get: (p, o) => request("GET", p, o),
    post: (p, o) => request("POST", p, o),
    put: (p, o) => request("PUT", p, o),
    patch: (p, o) => request("PATCH", p, o),
    delete: (p, o) => request("DELETE", p, o),
  };
}

/** A guard a route uses to reproduce the server's auth refusal rather than
 *  quietly succeeding. */
export const requireToken = (req: MemoryRequest): Result<string, Failure> =>
  req.token ? ok(req.token) : err(unauthenticated("Sign in to continue.", { status: 401 }));
