/** Authentication may return only to a local application or cookbook page.
 * Validate both the query parameter and the submitted hidden field: a browser
 * can replace either. Authentication pages and API routes are not destinations. */
export function safeReturnTo(value: unknown): string {
  const fallback = "/app";
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if ([...value].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return fallback;
  try {
    const target = new URL(value, "https://flover.invalid");
    const decoded = decodeURIComponent(target.pathname);
    if (target.origin !== "https://flover.invalid" || !/^\/(?:app|cookbook)(?:\/|$)/.test(decoded)) return fallback;
    if (decoded.includes("\\") || decoded.includes("//") || decoded.split("/").some(part => part === "." || part === "..")) return fallback;
    if ([...decoded].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return fallback;
    if (target.searchParams.has("_rsc")) target.searchParams.delete("_rsc");
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}

export function authHref(page: "/sign-in" | "/sign-up", destination: unknown): string {
  const returnTo = safeReturnTo(destination);
  if (returnTo === "/app") return page;
  const params = new URLSearchParams({ returnTo });
  // The sign-in guard must observe the same development plan as the page
  // that refused the session, or the two guards can redirect to each other.
  const target = new URL(returnTo, "https://flover.invalid");
  for (const key of ["chaos", "chaosSeed"]) {
    const value = target.searchParams.get(key);
    if (value) params.set(key, value);
  }
  return `${page}?${params}`;
}
