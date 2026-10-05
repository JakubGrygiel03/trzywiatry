import { wrapEmail } from "@/lib/email/render";
import { escapeHtml } from "@/lib/validations/safe-input";

/** Plain-text atelier letter → branded HTML. No raw HTML from the form. */
export function newsletterBroadcastHtml(body: string, studioEmail: string) {
  const blocks = escapeHtml(body.trim())
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replaceAll("\n", "<br/>")}</p>`)
    .join("");
  const optOut = `<p style="margin-top:24px;font-size:12px;line-height:1.55;color:#9A9A9A;">Dostałeś ten mail, bo zapisałeś się na newsletter Trzy Wiatry. Chcesz zrezygnować? Napisz na <a href="mailto:${escapeHtml(studioEmail)}">${escapeHtml(studioEmail)}</a> — wypiszemy Cię z listy.</p>`;
  return wrapEmail(`${blocks}${optOut}`, { kind: "newsletter" });
}
