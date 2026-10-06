/** Cookie-auth POSTs must come from this host — blocks basic CSRF. */
export function isSameOrigin(request: Request) {
  const page = new URL(request.url);
  const originHeader = request.headers.get("origin");
  if (originHeader) {
    try {
      return new URL(originHeader).origin === page.origin;
    } catch {
      return false;
    }
  }
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === page.origin;
    } catch {
      return false;
    }
  }
  return process.env.NODE_ENV !== "production";
}
