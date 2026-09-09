# The browser asks its own server

Putting the session in an HttpOnly cookie decides your whole client-side data
topology, not just where a token lives — the page can no longer call the API at
all, and every browser-side read has to go through a door you write.

## Origin

Choosing HttpOnly for a session cookie, which is the obvious call: a script
cannot lift what it cannot read. Then discovering the consequence one tier
later, when the first client-side read had no bearer to send.

## What

    HttpOnly            the page cannot read the token
    therefore           the page cannot authenticate a request to the API
    therefore           it calls YOUR origin, where the cookie rides along
    therefore           you write a route handler per browser-side read

That last line is the cost, and it is not small. It is also the reason the
alternative exists: a token the page can read makes the browser a first-class
API client and makes the token liftable. There is no third option, and the
choice is a security decision that presents as a plumbing decision.

## The consequence worth designing for

Your route handler is now **a server**, and it should speak the contract your
own transport already decodes: the same problem document, the same metadata,
the real status. Then the browser's client is the *same* fetch adapter with your
origin as its base, and a failure that crosses it arrives as the identical value
the server had.

Invent a shape there instead and you have two decoders, two vocabularies for one
failure, and a second one that is always slightly wrong in a way that classifies
as *internal* with the message lost.

Mirror the paths, too. If the API serves `/auth/sessions`, serve
`/api/auth/sessions`, so the service — which is the only tier allowed to name an
endpoint — never learns which side is calling it.

## Gotchas

**This is the constraint a direct-from-browser backend collides with.** Anything
whose model is *the page talks to the database with row-level security* wants
the token in the page. Using it server-only works and gives up the thing it was
chosen for.

**It is cheap to test, and worth testing.** Build the response your handler
builds, hand it to the decoder your adapter uses, and require the same failure
out. That round trip is the whole claim.

**Refresh and rotation stay on your side**, which is a simplification worth
noticing: the page never holds a token, so it never has to renew one.

## Used in

`flover-next` and its two sibling templates — the session cookie, the same-origin
route handlers, and the browser-side reads that go through them.

## Related

[`a-service-takes-the-client`](a-service-takes-the-client.md),
[`value-inward-exception-at-the-edge`](value-inward-exception-at-the-edge.md).
