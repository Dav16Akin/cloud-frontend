/**
 * Returns `target` only if it is a path on this site, otherwise `fallback`.
 * Stops `/login?redirect=https://evil.site` (or `//evil.site`, `/\evil.site`)
 * from sending a user off-site straight after they sign in.
 */
export function safeRedirectPath(
  target: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return fallback;
  }

  // Browsers treat backslashes and stray whitespace leniently, so resolve the
  // path the way a browser would and confirm it stays on the same origin.
  const base = "https://same-origin.invalid";
  try {
    const url = new URL(target, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
