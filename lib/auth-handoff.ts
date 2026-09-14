import { NextResponse } from "next/server";

/** HTTP (localhost) keeps Set-Cookie on 303. Installed HTTPS PWAs drop it — those get an HTML handoff. */
export function loginHandoff(request: Request, destPath: string) {
  const dest = new URL(destPath, request.url);
  const http = dest.protocol === "http:";

  if (http) {
    const response = NextResponse.redirect(dest, 303);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const next = `${dest.pathname}${dest.search}`;
  const response = new NextResponse(
    `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${next}"><title>Logowanie</title></head><body><p><a href="${next}">Kontynuuj</a></p><script>location.replace(${JSON.stringify(next)});</script></body></html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
      },
    },
  );
  return response;
}
