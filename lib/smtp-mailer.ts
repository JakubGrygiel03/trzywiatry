import nodemailer from "nodemailer";
import { SITE } from "@/lib/constants";

export type EmailAttachment = {
  filename: string;
  content: string;
  contentType?: string;
};

export function hasSmtpCredentials() {
  return Boolean(
    process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim(),
  );
}

export async function sendViaSmtp(message: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}): Promise<{ ok: boolean; demo: boolean; error?: string }> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) {
    return { ok: false, demo: false, error: "missing-smtp" };
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `Trzy Wiatry <${user}>`,
      to: message.to,
      replyTo: message.replyTo?.trim() || SITE.email,
      subject: message.subject,
      html: message.html,
      attachments: message.attachments?.map((file) => ({
        filename: file.filename,
        content: file.content,
        contentType: file.contentType ?? "text/csv; charset=utf-8",
        encoding: "utf-8",
      })),
    });
    return { ok: true, demo: false };
  } catch (error) {
    console.error("[smtp] send failed", error);
    return { ok: false, demo: false, error: "smtp-failed" };
  }
}
