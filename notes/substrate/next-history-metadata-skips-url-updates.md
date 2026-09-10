Passing Next's internal history state back to pushState skips its URL-state update.

**True of Next 16.3.4, App Router · read from installed source 2026-09-10.**

## Origin

An initial URL binding copied the existing history state to preserve router
metadata. Source inspection showed that this bypassed Next's hook update.
Browser checks verified that the corrected null-data path updates controls and
supports back/forward; the original bypass was identified in source.

## Why

Next 16.3.4 patches the native history methods so external URL changes update
`useSearchParams`. Its wrapper treats data carrying `__NA` or `_N` as an internal
navigation and immediately calls the original browser method.

That means copying `window.history.state` into an external `pushState` call can
change the address without updating the React view. The apparent precaution of
preserving router metadata disables the integration it was meant to preserve.

The installed guide's examples pass `null`. The wrapper then copies its own
metadata and dispatches the URL update. Flover's Next binding follows that path;
the portable query codecs know nothing about it.

Primary source: installed Next 16.3.4's
`node_modules/next/dist/client/components/app-router.js`, in the
patched `pushState` and `replaceState` implementations. Recheck this behavior
when upgrading Next; do not copy its private markers into the portable module.

## Used in

Client-owned URL-state bindings that use native history in Next App Router.
