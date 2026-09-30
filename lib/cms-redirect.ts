/** Append a unique tick so CMS redirects always bust the client router cache. */
export function withCmsTick(url: string) {
  if (url.includes("t=")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
}
