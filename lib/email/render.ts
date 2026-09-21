import { SITE } from "@/lib/constants";
import { EMAIL_TEMPLATES, type EmailTemplateKey } from "@/lib/email/catalog";
import { getEmailTemplate } from "@/lib/data/email-templates";
import { getPublicSiteUrl } from "@/lib/site-url";

export type EmailVars = Record<string, string>;

const B = {
  czerwony: "#9C644E",
  krem: "#F4EFE8",
  bialy: "#FFFFFF",
  czarny: "#010101",
  szary: "#6B6B6B",
  szaryJasny: "#9A9A9A",
  tlo: "#EEEEEE",
  linia: "#E5E5E5",
  kafelek: "#F7F5F2",
};

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/**
 * Hostinger / Przelewy24 style: gray canvas → logo → white rounded card → footer.
 * Every visual style is INLINE (Gmail strips most <style> rules).
 */
export function wrapEmail(body: string) {
  const year = new Date().getFullYear();
  const site = getPublicSiteUrl();
  const polished = polishEmailBody(body);

  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>${SITE.name}</title>
<!--[if mso]><style>table,td{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${B.tlo};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${B.tlo};border-collapse:collapse;">
  <tr>
    <td align="center" style="padding:32px 16px;">

      <!-- Brand mark above card (like Hostinger / P24 logo) -->
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:0 0 20px;">
            <a href="${site}" style="text-decoration:none;">
              <span style="font-family:${FONT};font-size:22px;font-weight:700;letter-spacing:0.02em;color:${B.czarny};">${SITE.name}</span>
            </a>
            <div style="font-family:${FONT};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${B.czerwony};margin-top:6px;">Pracownia ceramiki i drewna</div>
          </td>
        </tr>
      </table>

      <!-- Main white card -->
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;border-collapse:collapse;background-color:${B.bialy};border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:36px 36px 32px;font-family:${FONT};color:${B.czarny};font-size:15px;line-height:1.6;">
            ${polished}
          </td>
        </tr>
      </table>

      <!-- Footer under card -->
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:28px 12px 8px;font-family:${FONT};font-size:12px;line-height:1.55;color:${B.szaryJasny};">
            <strong style="color:${B.szary};">${SITE.name}</strong> · ${SITE.owner}<br/>
            ${SITE.address}<br/>
            NIP ${SITE.nip} · REGON ${SITE.regon}<br/>
            <a href="mailto:${SITE.email}" style="color:${B.czerwony};text-decoration:none;">${SITE.email}</a>
            &nbsp;·&nbsp;
            <a href="${site}" style="color:${B.czerwony};text-decoration:none;">trzywiatry.pl</a>
            &nbsp;·&nbsp;
            <a href="${SITE.instagram}" style="color:${B.czerwony};text-decoration:none;">Instagram</a>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:8px 12px 0;font-family:${FONT};font-size:11px;color:${B.szaryJasny};">
            © ${year} ${SITE.name}. Wiadomość transakcyjna ze sklepu.
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Force Hostinger-like typography even when admins paste bare HTML. */
export function polishEmailBody(html: string) {
  return html
    .replace(/<h1(\s[^>]*)?>/gi, `<h1 style="margin:0 0 18px;font-family:${FONT};font-size:24px;line-height:1.3;font-weight:700;color:${B.czarny};">`)
    .replace(/<h2(\s[^>]*)?>/gi, `<h2 style="margin:24px 0 10px;font-family:${FONT};font-size:15px;line-height:1.4;font-weight:700;color:${B.czarny};">`)
    .replace(/<p(\s[^>]*)?>/gi, (full) => {
      if (/style=/i.test(full)) return full;
      return `<p style="margin:0 0 14px;font-family:${FONT};font-size:15px;line-height:1.65;color:${B.czarny};">`;
    })
    .replace(/<ul(\s[^>]*)?>/gi, `<ul style="margin:0 0 16px;padding:0 0 0 20px;font-family:${FONT};font-size:15px;line-height:1.55;color:${B.czarny};">`)
    .replace(/<li(\s[^>]*)?>/gi, (full) => {
      if (/style=/i.test(full)) return full;
      return `<li style="margin:0 0 8px;">`;
    })
    .replace(/<a(\s[^>]*?)>/gi, (full, attrs: string) => {
      if (/style=/i.test(full)) return full;
      return `<a${attrs} style="color:${B.czerwony};text-decoration:underline;">`;
    });
}

/** Nested gray tile — “Szczegóły transakcji” like P24. */
export function emailDetailTile(title: string, innerHtml: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;border-collapse:collapse;">
  <tr>
    <td style="padding:18px 20px;background-color:${B.kafelek};border:1px solid ${B.linia};border-radius:10px;">
      <p style="margin:0 0 12px;font-family:${FONT};font-size:13px;font-weight:700;color:${B.czarny};">${title}</p>
      ${innerHtml}
    </td>
  </tr>
</table>`;
}

export function emailDetailRows(rows: { label: string; value: string }[]) {
  return rows
    .filter((row) => row.value.trim())
    .map(
      (row) =>
        `<p style="margin:0 0 8px;font-family:${FONT};font-size:14px;line-height:1.5;color:${B.czarny};"><span style="color:${B.szary};">${row.label}:</span> <strong>${row.value}</strong></p>`,
    )
    .join("");
}

/** Big accent value in a bordered tile — Hostinger verification-code look. */
export function emailHighlightTile(label: string, value: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;border-collapse:collapse;">
  <tr>
    <td align="center" style="padding:22px 16px;background-color:${B.bialy};border:1px solid ${B.linia};border-radius:10px;">
      <p style="margin:0 0 10px;font-family:${FONT};font-size:13px;color:${B.szary};">${label}</p>
      <p style="margin:0;font-family:${FONT};font-size:28px;font-weight:700;letter-spacing:0.04em;color:${B.czerwony};">${value}</p>
    </td>
  </tr>
</table>`;
}

export function emailItemsTile(listHtml: string) {
  return emailDetailTile(
    "Pozycje",
    `<ul style="margin:0;padding:0 0 0 18px;font-family:${FONT};font-size:14px;line-height:1.55;color:${B.czarny};">${listHtml}</ul>`,
  );
}

export function interpolateEmailCopy(text: string, vars: EmailVars) {
  return text.replace(/\{([a-zA-Z]+)\}/g, (_, token: string) => vars[token] ?? "");
}

export function emailButtonHtml(url: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;border-collapse:collapse;">
  <tr>
    <td align="center" bgcolor="${B.czerwony}" style="border-radius:8px;background-color:${B.czerwony};">
      <a href="${url}" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:14px;font-weight:600;color:${B.bialy};text-decoration:none;border-radius:8px;">${label}</a>
    </td>
  </tr>
</table>`;
}

export function resetButtonHtml(url: string) {
  return emailButtonHtml(url, "Ustaw nowe hasło");
}

export function renderEmailTemplate(key: EmailTemplateKey, vars: EmailVars) {
  const template = getEmailTemplate(key);
  const subject = interpolateEmailCopy(template.subject, vars).trim() || EMAIL_TEMPLATES[key].subject;
  const html = wrapEmail(interpolateEmailCopy(template.body, vars));
  return { subject, html };
}
