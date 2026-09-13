import { SITE } from "@/lib/constants";
import { EMAIL_TEMPLATES, type EmailTemplateKey } from "@/lib/email/catalog";
import { getEmailTemplate } from "@/lib/data/email-templates";

export type EmailVars = Record<string, string>;

export function wrapEmail(body: string) {
  return `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#010101;line-height:1.55">
    <p style="letter-spacing:0.14em;text-transform:uppercase;font-size:12px;color:#9C644E">Trzy Wiatry</p>
    ${body}
    <p style="margin-top:28px;font-size:13px;color:#666">Pracownia · ${SITE.address}<br/>${SITE.email}</p>
  </div>`;
}

export function interpolateEmailCopy(text: string, vars: EmailVars) {
  return text.replace(/\{([a-zA-Z]+)\}/g, (_, token: string) => vars[token] ?? "");
}

export function resetButtonHtml(url: string) {
  return `<a href="${url}" style="display:inline-block;background:#9C644E;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;letter-spacing:0.06em;text-transform:uppercase">Ustaw nowe hasło</a>`;
}

export function renderEmailTemplate(key: EmailTemplateKey, vars: EmailVars) {
  const template = getEmailTemplate(key);
  const subject = interpolateEmailCopy(template.subject, vars).trim() || EMAIL_TEMPLATES[key].subject;
  const html = wrapEmail(interpolateEmailCopy(template.body, vars));
  return { subject, html };
}
