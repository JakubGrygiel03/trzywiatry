import { createHash } from "crypto";

function crcSign(payload: string, crc: string) {
  return createHash("sha384").update(JSON.stringify({ ...JSON.parse(payload), crc })).digest("hex");
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

export function p24RegisterUrl() {
  return process.env.P24_SANDBOX === "false"
    ? "https://secure.przelewy24.pl/api/v1/transaction/register"
    : "https://sandbox.przelewy24.pl/api/v1/transaction/register";
}
