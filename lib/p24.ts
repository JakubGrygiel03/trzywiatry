import { createHash } from "crypto";

export type P24RegisterFailure =
  | "missing-keys"
  | "auth-failed"
  | "register-failed"
  | "network-failed";

function p24Sign(fields: Record<string, string | number>) {
  // P24 docs: JSON field order + types matter (merchantId/amount = int).
  return createHash("sha384").update(JSON.stringify(fields)).digest("hex");
}

function p24Host() {
  return process.env.P24_SANDBOX === "false"
    ? "https://secure.przelewy24.pl"
    : "https://sandbox.przelewy24.pl";
}

export function isP24Sandbox() {
  return process.env.P24_SANDBOX !== "false";
}

function merchantIds() {
  const merchantId = Number(process.env.P24_MERCHANT_ID ?? 0);
  const posId = Number(process.env.P24_POS_ID ?? merchantId);
  return { merchantId, posId, crc: process.env.P24_CRC?.trim() ?? "" };
}

function apiAuth(posId: number) {
  const apiKey = (process.env.P24_API_KEY || process.env.P24_REPORTS_KEY || "").trim();
  return Buffer.from(`${posId}:${apiKey}`).toString("base64");
}

export function hasP24Credentials() {
  const { merchantId, crc } = merchantIds();
  return Boolean(merchantId && crc && (process.env.P24_API_KEY || process.env.P24_REPORTS_KEY));
}

/**
 * Customer-facing payments stay off until PAYMENTS_ENABLED=true.
 * Admin can still test via resolvePaymentAccess() in lib/payment-access.ts.
 */
export function arePaymentsEnabled() {
  return process.env.PAYMENTS_ENABLED === "true" && hasP24Credentials();
}

function p24Headers(posId: number) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Basic ${apiAuth(posId)}`,
  };
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
  const { merchantId, posId, crc } = merchantIds();
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
    encoding: "UTF-8",
    urlReturn: input.urlReturn,
    urlStatus: input.urlStatus,
    sign: p24Sign({
      sessionId: input.sessionId,
      merchantId,
      amount: input.amountInCents,
      currency: "PLN",
      crc,
    }),
  };
}

export async function registerP24Transaction(session: ReturnType<typeof buildP24Session>) {
  if (!hasP24Credentials()) return { ok: false as const, reason: "missing-keys" as const };

  try {
    const response = await fetch(`${p24Host()}/api/v1/transaction/register`, {
      method: "POST",
      headers: p24Headers(session.posId),
      body: JSON.stringify(session),
    });
    const json = (await response.json().catch(() => null)) as {
      data?: { token?: string };
      error?: string;
      message?: string;
      code?: number;
    } | null;
    const token = json?.data?.token;
    if (!token) {
      console.error("[p24] register failed", {
        status: response.status,
        sandbox: isP24Sandbox(),
        merchantId: session.merchantId,
        posId: session.posId,
        body: json,
      });
      if (response.status === 401) {
        return { ok: false as const, reason: "auth-failed" as const };
      }
      return { ok: false as const, reason: "register-failed" as const };
    }
    return { ok: true as const, redirectUrl: `${p24Host()}/trnRequest/${token}` };
  } catch (error) {
    console.error("[p24] register network", error);
    return { ok: false as const, reason: "network-failed" as const };
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
  const { crc } = merchantIds();
  const sessionId = body.sessionId ?? body.p24_session_id;
  if (!crc) return process.env.NODE_ENV !== "production";
  if (!sessionId || !body.sign || body.orderId == null || body.amount == null) return false;

  const expected = p24Sign({
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
  return expected === body.sign;
}

/**
 * P24 only settles funds after PUT /transaction/verify.
 * Sign fields differ from register: sessionId, orderId, amount, currency, crc.
 */
export async function verifyP24Transaction(input: {
  sessionId: string;
  orderId: number;
  amount: number;
}) {
  const { merchantId, posId, crc } = merchantIds();
  if (!crc) return false;

  try {
    const response = await fetch(`${p24Host()}/api/v1/transaction/verify`, {
      method: "PUT",
      headers: p24Headers(posId),
      body: JSON.stringify({
        merchantId,
        posId,
        sessionId: input.sessionId,
        amount: input.amount,
        currency: "PLN",
        orderId: input.orderId,
        sign: p24Sign({
          sessionId: input.sessionId,
          orderId: input.orderId,
          amount: input.amount,
          currency: "PLN",
          crc,
        }),
      }),
    });
    const json = (await response.json().catch(() => null)) as {
      data?: { status?: string };
      responseCode?: number;
    } | null;
    const ok = response.ok && (json?.data?.status === "success" || json?.responseCode === 0);
    if (!ok) console.error("[p24] verify failed", response.status, json);
    return ok;
  } catch (error) {
    console.error("[p24] verify network", error);
    return false;
  }
}

export type P24TransactionLookup = {
  sessionId: string;
  orderId: number;
  amount: number;
  currency: string;
  /** 0 = unpaid, 1/2 = paid (P24 API). */
  status: number;
  paymentMethod?: number;
};

/** Look up a registered session — used when urlReturn beats the webhook. */
export async function getP24TransactionBySessionId(
  sessionId: string,
): Promise<P24TransactionLookup | null> {
  const { posId } = merchantIds();
  if (!hasP24Credentials() || !sessionId) return null;

  try {
    const response = await fetch(
      `${p24Host()}/api/v1/transaction/by/sessionId/${encodeURIComponent(sessionId)}`,
      { method: "GET", headers: p24Headers(posId), cache: "no-store" },
    );
    const json = (await response.json().catch(() => null)) as {
      data?: {
        sessionId?: string;
        orderId?: number;
        amount?: number;
        currency?: string;
        status?: number;
        paymentMethod?: number;
      };
      responseCode?: number;
    } | null;
    if (!response.ok || !json?.data?.orderId) {
      if (response.status !== 404) {
        console.error("[p24] transaction lookup", response.status, json);
      }
      return null;
    }
    return {
      sessionId: json.data.sessionId ?? sessionId,
      orderId: Number(json.data.orderId),
      amount: Number(json.data.amount ?? 0),
      currency: json.data.currency ?? "PLN",
      status: Number(json.data.status ?? 0),
      paymentMethod: json.data.paymentMethod != null ? Number(json.data.paymentMethod) : undefined,
    };
  } catch (error) {
    console.error("[p24] transaction lookup network", error);
    return null;
  }
}

export function isP24TransactionPaid(status: number) {
  // P24: 0 = unpaid / abandoned, 1 = waiting for funds, 2 = settled, 3 = refunded.
  return status === 2;
}
