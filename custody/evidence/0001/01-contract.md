# Contract — the failure model

A specification of intended behaviour. Written for a test author who has not
seen the implementation.

## 1 · What a failure is

A `Failure` is a **plain data value**, not a class instance. Its `kind` field is
the discriminant of a closed union of exactly ten members. Every failure also
carries:

    message     string, required
    type?       string — a backend-specific condition, or a preserved unknown kind
    requestId?  string
    status?     number
    cause?      Failure — what this failure happened while doing

Some kinds carry their own additional data and other kinds do not:

    invalid       fields: Record<string, string>   (required on this kind)
    rate_limited  retryAfter?: number              (seconds)

No other kind carries `fields` or `retryAfter`.

## 2 · The ten kinds, and the split

Seven are **transport** kinds. Any call at all can produce one:

    unauthenticated  no credential, or it expired
    forbidden        a credential that is not permitted to do this
    rate_limited     too many requests
    unavailable      the server could not be reached
    timeout          the server took too long
    canceled         the caller asked for the request to stop
    internal         ours, or nobody's

Three are **domain** kinds. Whether one can occur depends on the operation:

    not_found        the resource should have been there and was not
    invalid          the request was refused for its content
    conflict         state moved underneath the caller

Exports: `TRANSPORT_KINDS`, `DOMAIN_KINDS`, `FAILURE_KINDS` (the transport kinds
followed by the domain kinds), and the types `TransportKind`, `DomainKind`,
`FailureKind`, `Failure`, `TransportFailure`, `DomainFailure`, and
`Fails<K>` which selects the union members with kind `K`.

## 3 · Constructors

One per kind, each returning **that kind's variant specifically** and not the
widened union:

    unauthenticated(message, meta?)   forbidden(message, meta?)
    notFound(message, meta?)          conflict(message, meta?)
    unavailable(message, meta?)       timeout(message, meta?)
    canceled(message, meta?)          internal(message, meta?)
    invalid(message, fields, meta?)
    rateLimited(message, retryAfter?, meta?)

`meta` supplies any of `type`, `requestId`, `status`, `cause`.

## 4 · Guards

    isFailureKind(v)    true only for one of the ten kind strings
    isTransportKind(v)  true only for one of the seven
    isDomainKind(v)     true only for one of the three
    isFailure(v)        STRUCTURAL: true for any object with a valid kind and a
                        string message. Must be true for a failure that has been
                        through JSON serialisation, and false for a plain Error,
                        a string, null, undefined, and an object whose kind is
                        not one of the ten.
    isTransport(f)      narrows a Failure to a TransportFailure

## 5 · Retry

    isRetryable(f)      true for EXACTLY three kinds: rate_limited, unavailable,
                        timeout. False for every other kind, including canceled —
                        a cancellation was asked for, and a refusal is an answer.

    retryDelay(f, attempt) -> number | null
        null for anything not retryable.
        For rate_limited carrying retryAfter: that value in MILLISECONDS
        (retryAfter is in seconds).
        Otherwise exponential: 250ms at attempt 0, doubling per attempt,
        capped at 8000ms.

## 6 · Cause chain

    because(failure, cause)   returns a copy of `failure` with `cause` attached.
                              The original is not modified. The returned value
                              keeps its own kind.
    chain(f)                  the failures outermost-first, following `cause`.
                              Must terminate on a cycle rather than looping.
    rootCause(f)              the last entry of the chain; f itself when there
                              is no cause.

## 7 · Narrowing

    narrow(...allowedDomainKinds) -> (failure) => Failure

Returns a mapper a service uses to declare which **domain** kinds an operation
can produce. Its rules, in order:

  1. A **transport** failure is returned UNCHANGED — same kind, same payload,
     same identity of data. A service may never narrow a transport kind away,
     because any call can produce one.
  2. A domain failure whose kind is in the allowed list is returned unchanged.
  3. Any other domain failure becomes an `internal` failure carrying the
     original as its `cause`, and preserving the original's `type`, `requestId`
     and `status`.

`narrow()` with no arguments allows no domain kinds.

## 8 · Exhaustiveness

    assertNever(value, context?)   throws. Its parameter type is `never`, so a
                                   `switch` that has handled every kind can call
                                   it in the default branch and a new kind makes
                                   that call a type error.

## 9 · Result

A `Result<T, E = Failure>` is either an `Ok<T, E>` or an `Err<T, E>`.
`ok(value)` and `err(error)` construct them. An `Ok` has `ok: true` and `value`;
an `Err` has `ok: false` and `error`.

Both provide the same methods, and each does the obvious thing on its own branch
and nothing on the other:

    map(f)          transforms the value; a failure passes through untouched
    mapErr(f)       transforms the error; a value passes through untouched
    andThen(f)      calls f with the value and returns its Result; on a failure
                    returns the failure without calling f
    match({ok, err}) calls exactly one of the two and returns its value
    unwrapOr(x)     the value, or x
    tapErr(f)       calls f with the error on the failure branch only, and
                    returns the SAME result either way — it must never change
                    what the caller sees
    toJSON()        the plain shape: {ok: true, value} or {ok: false, error}

    all([...results])   every value as a tuple, in order, or the FIRST failure.
    andThenAsync(r, f)  the async form of andThen.
    fromJSON(plain)     rebuilds a Result from its plain shape.

## 10 · Absence is not failure

*Nobody looked* and *looked and found nothing* are different facts.

    optional(result, absent) -> Promise<Result<T | null, …>>

`absent` is a REQUIRED predicate over a `not_found` failure that says whether
this backend's 404 means the thing is legitimately absent.

  1. A success passes through with its value.
  2. A failure whose kind is not `not_found` passes through unchanged.
  3. A `not_found` for which `absent` returns true becomes a SUCCESS whose value
     is `null`.
  4. A `not_found` for which `absent` returns false must NOT become a success.
     It becomes an `internal` failure carrying the original as its `cause`. A
     404 the service cannot identify as absence must never be reported as
     emptiness.

Two predicates ship:

    anyNotFound            returns true for every not_found
    absentWhenType(t)      returns true only when the failure's `type` equals t

Render side:

    Presence<T>            {state:"found", value} | {state:"empty"} |
                           {state:"unmeasured", failure}
    presenceOf(result)     found when the result is a success with a non-null
                           value; empty when it is a success whose value is null;
                           unmeasured when it is a failure.

## 11 · The one throw site

    AppError            an Error subclass carrying `failure`, whose `message` is
                        the failure's message.
    unwrap(result)      the value, or throws an AppError carrying the failure.
    asFailure(cause)    TOTAL — always returns a Failure and never throws, for
                        ANY input. An AppError yields its own failure; a value
                        that is structurally a Failure is returned as-is; an
                        Error becomes `internal` whose message is the error's
                        message and whose `type` is the error's name; anything
                        else becomes `internal`.

## 12 · The transport port

An `HttpClient` exposes `request`, `get`, `post`, `put`, `patch` and `delete`.
Each returns `Promise<Result<T, Failure>>` and **never throws** — every outcome,
including a network failure, is a returned value.

### Decoding a response

A non-2xx response becomes exactly one `Failure`. The decoding is **total**: a
body that is absent, empty, not JSON, or JSON of an unexpected shape must still
produce a failure rather than throwing.

  · When the body declares a `kind` that is one of the ten, that kind wins.
  · When it declares a kind that is NOT one of the ten, the failure's kind comes
    from the status, and the unrecognised string is preserved in `type`.
  · When there is no usable body, the kind comes from the status:

        400 → invalid    401 → unauthenticated   403 → forbidden
        404 → not_found  409 → conflict          412 → conflict
        422 → invalid    428 → invalid           429 → rate_limited
        499 → canceled   503 → unavailable       504 → timeout
        anything else → internal

  · `status` is always recorded on the failure.
  · A request id is taken from the body, or failing that from an `x-request-id`
    response header.
  · For `invalid`, per-field messages are collected from the body; non-string
    entries are ignored.
  · For `rate_limited`, `retryAfter` is taken from the body, or failing that
    from a `retry-after` response header.

### A failure with no response

  · A request the CALLER cancelled produces `canceled`.
  · A request that exceeded its own time budget produces `timeout`. This is a
    different kind from a caller's cancellation and must not be confused with
    it: a timeout is retryable and a cancellation is not.
  · Anything else — a dropped socket, a DNS failure — produces `unavailable`.

### A 2xx response

  · A 204 succeeds with no value.
  · A body that cannot be read as JSON on an otherwise successful response is
    `internal`, NOT a transport kind — it is a broken contract rather than a
    broken network, and it must not be reported as retryable.

### The in-memory adapter

Serves a table of routes and is otherwise indistinguishable from the network
adapter to any caller above it. It returns refusals as values in the same shape.

  · A route may return any failure, and a caller cannot tell it from a real one.
  · A request whose method and path match no route is a fault in the fixture,
    not a server behaviour. It produces `internal` — never `not_found`, because
    a caller must not be able to mistake "this fixture was never asked" for
    "the server said this does not exist".
  · A request whose signal is already aborted produces `canceled`.
