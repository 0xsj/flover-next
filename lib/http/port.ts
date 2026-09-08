import type { Failure, Result } from "../kernel";

/** Turn a non-2xx response into exactly one Failure. TOTAL — it must never
 *  throw. The envelope ships one for the problem document this template
 *  expects; a product with a different backend passes its own and edits
 *  nothing in this tier. Still the only place a wire key is read by name. */
export type FailureDecoder = (response: Response) => Promise<Failure>;

export type ClientConfig = {
  /** Origin plus any mount path. A trailing slash is ignored; request paths are
   *  appended, never resolved against it. */
  baseUrl: string;
  timeoutMs?: number;
  /** Read lazily on every request, so a refreshed token is picked up without
   *  rebuilding the client. */
  getAccessToken?: () => string | null | undefined;
  /** Defaults to the envelope's `failureFromResponse`. */
  decodeFailure?: FailureDecoder;
  /** The id of the interaction this client's requests belong to. Read LAZILY on
   *  every request, exactly like the token, so a new interaction is picked up
   *  without rebuilding the client.
   *
   *  Optional and undefined by default. Minting one needs somewhere to hold
   *  "the current interaction", which is `lib/runtime` and is unbuilt — so the
   *  SEAM ships and the originator does not. Returning undefined sends no
   *  header and changes nothing. */
  getCorrelationId?: () => string | null | undefined;
};

/** The one place these strings exist. `lib/http` is the only tier permitted to
 *  name a header, so switching to `traceparent` for a product with a tracing
 *  stack is a one-line change, here. */
export const CORRELATION_HEADER = "x-correlation-id";
export const REQUEST_ID_HEADER = "x-request-id";

export type RequestOptions = {
  /** `undefined` values are dropped rather than sent as the string "undefined". */
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  /** The caller's own cancellation. Combined with the timeout, not replaced. */
  signal?: AbortSignal;
  timeoutMs?: number;
  headers?: Record<string, string>;
};

/** The transport can produce ANY failure, so the port says so. Narrowing is a
 *  service's job — and after the split it only ever decides domain kinds. */
export type HttpClient = {
  request<T>(method: string, path: string, options?: RequestOptions): Promise<Result<T, Failure>>;
  get<T>(path: string, options?: RequestOptions): Promise<Result<T, Failure>>;
  post<T>(path: string, options?: RequestOptions): Promise<Result<T, Failure>>;
  put<T>(path: string, options?: RequestOptions): Promise<Result<T, Failure>>;
  patch<T>(path: string, options?: RequestOptions): Promise<Result<T, Failure>>;
  delete<T>(path: string, options?: RequestOptions): Promise<Result<T, Failure>>;
};
