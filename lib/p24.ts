import { createHash } from "crypto";

function crcSign(payload: string, crc: string) {
  return createHash("sha384").update(JSON.stringify({ ...JSON.parse(payload), crc })).digest("hex");
}

function p24Host() {
  return process.env.P24_SANDBOX === "false"
    ? "https://secure.przelewy24.pl"
    : "https://sandbox.przelewy24.pl";
}

export function p24RegisterUrl() {
  return `${p24Host()}/api/v1/transaction/register`;
}

export function hasP24Credentials() {
  return Boolean(
    Number(process.env.P24_MERCHANT_ID ?? 0) &&
      process.env.P24_CRC &&
      (process.env.P24_API_KEY || process.env.P24_REPORTS_KEY),
  );
}

/** Builds a Przelewy24 register payload. Live keys live in env — never in the client. */
export function buildP24Session(input: {
  sessionId: string;
  amountInCents: number;
  email: string;
  description: string;
  urlReturn: string;
  urlStatus: string;
}) {
  const merchantId = Number(process.env.P24_MERCHANT_ID ?? 0);
  const posId = Number(process.env.P24_POS_ID ?? merchantId);
  const crc = process.env.P24_CRC ?? "";

  const signPayload = JSON.stringify({
    sessionId: input.sessionId,
    merchantId,
    amount: input.amountInCents,
    currency: "PLN",
    crc,
  });

  return {
    merchantId,
    posId,
    sessionId: input.sessionId,
    amount: input.amountInCents,
    currency: "PLN",
    description: input.description,
    email: input.email,
    country: "PL",
    language: "pl",
    urlReturn: input.urlReturn,
    urlStatus: input.urlStatus,
    sign: crc ? crcSign(signPayload, crc) : "demo-sign",
  };
}

export async function registerP24Transaction(session: ReturnType<typeof buildP24Session>) {
  if (!hasP24Credentials()) return { ok: false as const, reason: "missing-keys" as const };

  const apiKey = process.env.P24_API_KEY || process.env.P24_REPORTS_KEY || "";
  const auth = Buffer.from(`${session.posId}:${apiKey}`).toString("base64");

  try {
    const response = await fetch(p24RegisterUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(session),
    });
    const json = (await response.json()) as { data?: { token?: string } };
    const token = json.data?.token;
    if (!token) return { ok: false as const, reason: "register-failed" as const };
    return { ok: true as const, redirectUrl: `${p24Host()}/trnRequest/${token}` };
  } catch {
    return { ok: false as const, reason: "register-failed" as const };
  }
}

export type P24Notification = {
  merchantId?: number;
  posId?: number;
  sessionId?: string;
  p24_session_id?: string;
  amount?: number;
  originAmount?: number;
  currency?: string;
  orderId?: number;
  methodId?: number;
  statement?: string;
  sign?: string;
};

/** CRC check for the P24 status webhook — reject unsigned payloads in production. */
export function p24NotificationValid(body: P24Notification) {
  const crc = process.env.P24_CRC ?? "";
  const sessionId = body.sessionId ?? body.p24_session_id;
  if (!crc) return process.env.NODE_ENV !== "production";
  if (!sessionId || !body.sign || body.orderId == null || body.amount == null) return false;

  const payload = JSON.stringify({
    merchantId: Number(body.merchantId),
    posId: Number(body.posId),
    sessionId,
    amount: Number(body.amount),
    originAmount: Number(body.originAmount ?? body.amount),
    currency: body.currency ?? "PLN",
    orderId: Number(body.orderId),
    methodId: Number(body.methodId ?? 0),
    statement: body.statement ?? "",
    crc,
  });
  const expected = createHash("sha384").update(payload).digest("hex");
  return expected === body.sign;
}
