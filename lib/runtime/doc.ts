/**
 * runtime — state the shell owns and no server has an opinion about.
 *
 * # Stores are framework-free; one file binds
 *
 * Every store here is a plain subscribe/get/set object, so the state machines
 * and the persistence copy verbatim into the sibling templates. `hooks.ts` is
 * the only file that imports a framework, and each sibling writes its own —
 * three lines against `useSyncExternalStore`, or its equivalent.
 *
 * That is why this tier is NOT in the copy-verbatim set even though most of it
 * is: one file in it is a binding, and a check that says a directory is
 * portable when one file is not would be worse than no check.
 *
 * # `getSnapshot` must be stable, or it is a render loop
 *
 * A store returning a fresh object per call is a fresh identity per call, which
 * a subscription reads as a change on every render. The `set` here refuses a
 * write that is `Object.is`-equal, so a no-op assignment notifies nobody.
 *
 * # Preferences are read AFTER mount, never during render
 *
 * The server has no storage. A value read during render is therefore a
 * hydration mismatch, which presents as a flash of the wrong theme that
 * corrects itself — annoying, and the sort of thing people fix by disabling
 * SSR for the whole subtree. `server()` returns the default; `hydrate*` reads
 * the stored choice once, in an effect.
 *
 * # Theme has three states and density has two, and both are deliberate
 *
 * *Follow the system* is a CHOICE, not the absence of one: a user who picked it
 * wants the page to change when their OS does, and a user who picked `light`
 * wants it not to. It is expressed by REMOVING the attribute so the token
 * layer's media query takes over — which is why the semantic tokens are stated
 * twice, once under `prefers-color-scheme` and once under an explicit attribute.
 *
 * Density is a token override and nothing else. A component reading
 * `--control-md` gets the compact one for free; one that hard-codes a height is
 * now visibly wrong. Per browser, never per account — a screen offering it
 * should say so rather than imply a column that does not exist.
 *
 * # The interaction id is the piece the rest of the system was waiting for
 *
 * An interaction is a USER ACTION — not a request, not a component lifetime. A
 * click that fans out into four requests is one interaction, and all four
 * failures should name it. Scoped to a request the id degenerates into a second
 * request id; scoped to a mount it says only which screen was open, which is
 * what the reference screens had to do while this tier did not exist.
 *
 * It is deliberately NOT minted at module load: on the server that would be one
 * id shared by every request, which is one user's interaction attributed to the
 * next.
 *
 * Beginning one is an event handler's job, never a hook's, because a render is
 * not a user action.
 */
export {};
